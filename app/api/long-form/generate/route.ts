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
  limiter: Ratelimit.slidingWindow(20, '24 h'),
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

    if (targetLength < 500 || targetLength > 8000) {
      return NextResponse.json(
        { error: 'Target length must be between 500 and 8,000 words' },
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
        maxOutputTokens: 32768,
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
    let parsed = parseLongFormResponse(responseText);

    // If parsing failed and response seems incomplete, try to recover
    if (!parsed && responseText.length > 1000) {
      console.log("[LongForm] First parse failed, attempting JSON recovery...");

      let recovered = responseText.trim();

      // Strip markdown code fences if present
      recovered = recovered.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

      // Count open braces and brackets, tracking string state to handle unterminated strings
      let braceCount = 0;
      let bracketCount = 0;
      let inString = false;
      let escaped = false;

      for (const char of recovered) {
        if (escaped) { escaped = false; continue; }
        if (char === '\\' && inString) { escaped = true; continue; }
        if (char === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (char === '{') braceCount++;
        else if (char === '}') braceCount--;
        else if (char === '[') bracketCount++;
        else if (char === ']') bracketCount--;
      }

      // If we ended inside a string, close it first
      if (inString) recovered += '"';

      // Close any incomplete value (trailing comma or colon means we need a placeholder)
      const trimmed = recovered.trimEnd();
      if (trimmed.endsWith(':') || trimmed.endsWith(',')) {
        recovered = trimmed.slice(0, -1);
      }

      // Add missing closing characters
      while (bracketCount > 0) { recovered += ']'; bracketCount--; }
      while (braceCount > 0) { recovered += '}'; braceCount--; }

      parsed = parseLongFormResponse(recovered);

      if (parsed) {
        console.log("[LongForm] JSON recovery successful!");
      } else {
        console.error("[LongForm] JSON recovery also failed");
      }
    }

    if (!parsed) {
      console.error('[LongForm] Failed to parse response:', responseText.substring(0, 500));
      return NextResponse.json(
        { error: 'Failed to parse generated content. The response may have been cut off. Try reducing the target length or simplifying the context.' },
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
      
      console.log('[LongForm] Saving article with:', {
        user_id: user.id,
        platform: 'long-form',
        caption: parsed.title,
        sections_count: parsed.sections.length,
      });

      const insertPayload: Record<string, any> = {
        user_id: user.id,
        platform: 'long-form',
        content: fullContent,
        caption: parsed.title,
        hashtags: [],
        status: 'draft',
        longform_sections: parsed.sections,
        is_longform: true,
        metadata: {
          type: 'long-form',
          subtitle: parsed.subtitle,
          totalWordCount: parsed.totalWordCount,
          tone,
          structure,
        },
      };
      // Intentionally omit campaign_id and scheduled_for so the DB uses
      // its defaults — passing null violates NOT NULL / FK constraints.

      const { data: savedRow, error: saveError } = await supabaseAdmin
        .from('scheduled_posts')
        .insert(insertPayload)
        .select('id')
        .single();

      if (saveError) {
        console.error('[LongForm] Failed to save to database:', JSON.stringify(saveError));
        // Surface the error as a non-fatal warning in the response
        return NextResponse.json({
          success: true,
          article: parsed,
          warning: `Article generated but could not be saved to history: ${saveError.message}`,
        });
      } else {
        console.log('[LongForm] Saved to database successfully, id:', savedRow?.id);
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
