export const maxDuration = 120; // Long-form needs more time

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { getPlanStatus } from '@/lib/plan';
import { getVertexAIClient } from '@/lib/genai-client';
import { buildLongFormPrompt, parseLongFormResponse, type LongFormParams } from '@/lib/prompts/long-form';
import { containsPromptInjection } from '@/lib/prompts';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limits: 5/day for Org, unlimited for Enterprise
const orgRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '24 h'),
  prefix: 'longform:org',
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookies) => cookies.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    );

    // Admin client for database operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check plan - Long-form is Org/Enterprise only
    const planStatus = await getPlanStatus(user.id);
    
    if (planStatus.plan !== 'organization' && planStatus.plan !== 'enterprise') {
      return NextResponse.json(
        { 
          error: 'Long-form content generation requires Organization or Enterprise plan',
          currentPlan: planStatus.plan,
          requiredPlan: 'organization'
        },
        { status: 403 }
      );
    }

    // Rate limiting for Org users (Enterprise is unlimited)
    if (planStatus.plan === 'organization') {
      const { success, remaining } = await orgRatelimit.limit(user.id);
      if (!success) {
        return NextResponse.json(
          { 
            error: 'Daily limit reached. You can generate 5 long-form articles per day.',
            remaining: 0
          },
          { status: 429 }
        );
      }
      console.log(`[LongForm] Org user ${user.id} has ${remaining} generations remaining today`);
    }

    // Parse request body
    const body = await req.json();
    const { 
      context, 
      personaVoice, 
      tone = 'professional', 
      targetLength = 1500, 
      structure = 'narrative',
      additionalInstructions 
    } = body;

    if (!context || typeof context !== 'string' || context.trim().length < 50) {
      return NextResponse.json(
        { error: 'Context must be at least 50 characters' },
        { status: 400 }
      );
    }

    // Security: Check for prompt injection
    if (containsPromptInjection(context) || containsPromptInjection(additionalInstructions)) {
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      );
    }

    // Validate parameters
    const validTones = ['professional', 'casual', 'technical', 'storytelling'];
    const validStructures = ['narrative', 'listicle', 'how-to', 'opinion', 'analysis'];
    
    if (!validTones.includes(tone)) {
      return NextResponse.json(
        { error: `Invalid tone. Must be one of: ${validTones.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validStructures.includes(structure)) {
      return NextResponse.json(
        { error: `Invalid structure. Must be one of: ${validStructures.join(', ')}` },
        { status: 400 }
      );
    }

    if (targetLength < 500 || targetLength > 5000) {
      return NextResponse.json(
        { error: 'Target length must be between 500 and 5000 words' },
        { status: 400 }
      );
    }

    // Build the prompt
    const prompt = buildLongFormPrompt({
      context: context.trim(),
      personaVoice: personaVoice?.trim() || undefined,
      tone: tone as LongFormParams['tone'],
      targetLength,
      structure: structure as LongFormParams['structure'],
      additionalInstructions: additionalInstructions?.trim() || undefined,
    });

    console.log(`[LongForm] Generating ${targetLength}-word ${structure} article for user ${user.id}`);

    // Generate with Vertex AI
    const client = await getVertexAIClient();
    
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    // Extract response text
    let responseText = '';
    if (response.text) {
      responseText = typeof response.text === 'function' ? response.text() : response.text;
    } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = response.candidates[0].content.parts[0].text;
    }

    if (!responseText) {
      console.error('[LongForm] Empty response from model');
      return NextResponse.json(
        { error: 'Failed to generate content. Please try again.' },
        { status: 500 }
      );
    }

    // Parse the response
    const parsed = parseLongFormResponse(responseText);

    if (!parsed) {
      console.error('[LongForm] Failed to parse response:', responseText.substring(0, 500));
      return NextResponse.json(
        { error: 'Failed to parse generated content. Please try again.' },
        { status: 500 }
      );
    }

    // Add metadata
    parsed.metadata = {
      tone,
      structure,
      generatedAt: new Date().toISOString(),
    };

    console.log(`[LongForm] Successfully generated ${parsed.totalWordCount}-word article: "${parsed.title}"`);

    // Save to database for history/persistence
    try {
      const fullContent = parsed.sections.map(s => `## ${s.heading}\n\n${s.content}`).join('\n\n');
      
      const { error: saveError } = await supabaseAdmin
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          campaign_id: null, // Long-form is standalone, not tied to a campaign
          platform: 'long-form',
          content: fullContent,
          caption: parsed.title,
          hashtags: [],
          scheduled_for: null, // Not scheduled, just saved
          status: 'draft',
          metadata: {
            type: 'long-form',
            subtitle: parsed.subtitle,
            totalWordCount: parsed.totalWordCount,
            tone,
            structure,
            sections: parsed.sections.length,
          },
        });

      if (saveError) {
        console.error('[LongForm] Failed to save to database:', saveError);
        // Don't fail the request, just log the error
      } else {
        console.log('[LongForm] Saved to database successfully');
      }
    } catch (saveErr) {
      console.error('[LongForm] Database save error:', saveErr);
      // Continue even if save fails
    }

    return NextResponse.json({
      success: true,
      article: parsed,
    });

  } catch (error: any) {
    console.error('[LongForm] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
