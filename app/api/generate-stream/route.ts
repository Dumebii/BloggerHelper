export const maxDuration = 60;
import { NextResponse } from 'next/server';
import { buildGenerationPrompt, containsPromptInjection } from '../../../lib/prompts';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getPlanStatus, incrementCampaignGeneration } from '@/lib/plan';
import { getVertexAIClient } from '@/lib/genai-client';
import { extractYouTubeId, getYouTubeTranscript } from '@/lib/youtube';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(30, '1 h'),
  analytics: true,
});

const distributionSchema = {
  type: 'OBJECT',
  properties: {
    campaign: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          day: { type: 'INTEGER' },
          x: { type: 'STRING' },
          linkedin: { type: 'STRING' },
          discord: { type: 'STRING' },
          slack: { type: 'STRING' },
        },
        required: ['day', 'x', 'linkedin', 'discord', 'slack'],
      },
    },
    email: { type: 'STRING' },
  },
  required: ['campaign'],
};

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success } = await ratelimit.limit(`ratelimit_${ip}`);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many generation requests. Please try again later.' },
        { status: 429 },
      );
    }

    // --- DEMO MODE CHECK ---
    const isDemo = req.headers.get('x-demo-mode') === 'true';
    
    if (isDemo) {
      const demoKey = `demo_${ip}`;
      const used = await redis.get(demoKey);
      if (used) {
        return NextResponse.json(
          { error: 'demo_limit_reached', message: 'You have already used the demo. Sign up to continue.' },
          { status: 403 },
        );
      }
      await redis.set(demoKey, '1', { ex: 86400 });
    }

    // --- AUTH CHECK (skip for demo) ---
    let user = null;
    if (!isDemo) {
      const cookieStore = await cookies();
      const supabaseFromCookie = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll() {},
          },
        },
      );
      const { data: { user: userFromCookie } } = await supabaseFromCookie.auth.getUser();
      if (userFromCookie) user = userFromCookie;

      if (!user) {
        const authHeader = req.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          const supabaseFromToken = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          );
          const { data: { user: userFromToken } } = await supabaseFromToken.auth.getUser(token);
          if (userFromToken) user = userFromToken;
        }
      }

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const planStatus = await getPlanStatus(user.id);
      if (!planStatus.canGenerate) {
        return NextResponse.json(
          { error: 'generation_limit_reached', plan: planStatus.plan },
          { status: 403 },
        );
      }
    }

    const payload = await req.json();
    const { sourceMaterial, campaignDirectives } = payload;

    let urlContext = sourceMaterial?.url || '';
    const textContext = sourceMaterial?.rawText || '';
    const assetUrls = sourceMaterial?.assetUrls || [];

    // YouTube transcript handling
    let effectiveUrlContext = urlContext;
    if (urlContext) {
      const videoId = extractYouTubeId(urlContext);
      if (videoId) {
        const transcript = await getYouTubeTranscript(videoId);
        if (transcript) effectiveUrlContext = `YouTube transcript: ${transcript}`;
      }
    }

    const tweetFormat = campaignDirectives?.tweetFormat || 'single';
    const personaVoice = campaignDirectives?.personaVoice || 'Expert Content Strategist';

    const finalContext = campaignDirectives?.additionalContext
      ? `${textContext}\n\nAdditional Directives: ${campaignDirectives.additionalContext}`
      : textContext;

    if (containsPromptInjection(finalContext)) {
      return NextResponse.json(
        { error: 'Security Policy Violation: Invalid context structure detected.' },
        { status: 400 },
      );
    }

    const textPrompt = buildGenerationPrompt({
      tweetFormat,
      personaVoice,
      textContext: finalContext,
      urlContext: effectiveUrlContext,
    });

    const parts: any[] = [{ text: textPrompt }];

    // Process file assets
    if (assetUrls?.length) {
      for (const assetUrl of assetUrls) {
        try {
          const fileRes = await fetch(assetUrl);
          if (!fileRes.ok) continue;
          const mimeType = fileRes.headers.get('content-type') || 'application/octet-stream';
          const arrayBuffer = await fileRes.arrayBuffer();
          const base64Data = Buffer.from(arrayBuffer).toString('base64');
          parts.push({ inlineData: { data: base64Data, mimeType } });
        } catch (err) {
          console.error(`Failed to fetch asset: ${assetUrl}`, err);
        }
      }
    }

    // Generate with streaming
    const client = await getVertexAIClient();
    const streamingResult = await client.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: distributionSchema,
      },
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamingResult) {
            // Extract text from chunk
            let chunkText = '';
            if (chunk.text) {
              chunkText = typeof chunk.text === 'function' ? chunk.text() : chunk.text;
            } else if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
              chunkText = chunk.candidates[0].content.parts[0].text;
            }
            
            if (chunkText) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunkText })}\n\n`));
            }
          }
          
          // Increment generation count for authenticated users
          if (user) {
            await incrementCampaignGeneration(user.id);
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error: any) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Generate Stream Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
