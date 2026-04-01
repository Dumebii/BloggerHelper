export const maxDuration = 60;
import { NextResponse } from 'next/server';
import { buildGenerationPrompt, containsPromptInjection } from '../../../lib/prompts';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { PostHog } from 'posthog-node';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getPlanStatus, incrementCampaignGeneration } from '@/lib/plan';
import { getVertexAIClient } from '@/lib/genai-client';
import { getComposioConnection } from '@/lib/composio';
import { extractYouTubeId, getYouTubeTranscript } from '@/lib/youtube';

console.log('🔑 ANON_KEY starts with:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10));
console.log('Service role key starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10));

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

async function generateFromParts(parts: any[]) {
  const client = await getVertexAIClient();
  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: distributionSchema,
    },
  });
  return response.text;
}

export async function POST(req: Request) {
  const startTime = Date.now();
  const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  });

  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success } = await ratelimit.limit(`ratelimit_${ip}`);

    if (!success) {
      console.warn(`[SECURITY] Rate limit exceeded for IP: ${ip}`);
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

      const payload = await req.json();
      const { sourceMaterial, campaignDirectives } = payload;

      let urlContext = sourceMaterial?.url || '';
      const textContext = sourceMaterial?.rawText || '';
      const assetUrls = sourceMaterial?.assetUrls || [];

      // --- YouTube transcript handling (Demo mode) ---
      let effectiveUrlContext = urlContext;
      if (urlContext) {
        const videoId = extractYouTubeId(urlContext);
        if (videoId) {
          const transcript = await getYouTubeTranscript(videoId);
          if (transcript) {
            effectiveUrlContext = `YouTube transcript: ${transcript}`;
          }
        }
      }

      const tweetFormat = campaignDirectives?.tweetFormat || 'single';
      const personaVoice = campaignDirectives?.personaVoice || 'Expert Content Strategist';

      const finalContext = campaignDirectives?.additionalContext
        ? `${textContext}\n\nAdditional Directives: ${campaignDirectives.additionalContext}`
        : textContext;

      if (containsPromptInjection(finalContext)) {
        console.warn(`[SECURITY] Prompt injection attempt intercepted from IP: ${ip}`);
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

      if (assetUrls?.length) {
        for (const assetUrl of assetUrls) {
          try {
            const fileRes = await fetch(assetUrl);
            if (!fileRes.ok) throw new Error(`HTTP error! status: ${fileRes.status}`);
            const mimeType = fileRes.headers.get('content-type') || 'application/octet-stream';
            const arrayBuffer = await fileRes.arrayBuffer();
            const base64Data = Buffer.from(arrayBuffer).toString('base64');
            parts.push({
              inlineData: {
                data: base64Data,
                mimeType,
              },
            });
          } catch (err) {
            console.error(`Failed to fetch and process asset from R2: ${assetUrl}`, err);
          }
        }
      }

      const responseText = await generateFromParts(parts);

      const durationMs = Date.now() - startTime;
      posthog.capture({
        distinctId: ip,
        event: 'vertex_generation_completed_demo',
        properties: {
          durationMs,
          personaVoice,
          hasFile: assetUrls.length > 0,
          assetCount: assetUrls.length,
          status: 'success',
        },
      });
      await posthog.shutdown();

      return NextResponse.json({ output: responseText });
    }

    // --- AUTHENTICATED FLOW ---
    let user = null;
    let authError = null;

    const cookieStore = await cookies();
    const supabaseFromCookie = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            /* no‑op */
          },
        },
      },
    );
    const { data: { user: userFromCookie }, error: cookieError } = await supabaseFromCookie.auth.getUser();
    if (userFromCookie) user = userFromCookie;

    if (!user) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const supabaseFromToken = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        );
        const { data: { user: userFromToken }, error: tokenError } = await supabaseFromToken.auth.getUser(token);
        if (userFromToken) user = userFromToken;
        else authError = tokenError;
      }
    }

    if (!user) {
      console.log('Auth failed:', { cookieError, authError });
      return NextResponse.json(
        { error: 'Unauthorized', details: authError?.message || 'No valid session' },
        { status: 401 },
      );
    }

    // --- GitHub repos context (only if user has connected GitHub) ---
    let githubContext = '';
    const { data: githubConn, error: githubError } = await supabaseFromCookie
      .from('user_composio_connections')
      .select('connection_id')
      .eq('user_id', user.id)
      .eq('app', 'github')
      .maybeSingle();

    if (githubConn && !githubError) {
      try {
        const connection = await getComposioConnection(githubConn.connection_id);
        const reposResp = await fetch(`https://backend.composio.dev/api/v1/connectedAccounts/${connection.id}/actions/getUserRepos`, {
          headers: { 'x-api-key': process.env.COMPOSIO_API_KEY! },
        });
        if (reposResp.ok) {
          const repos = await reposResp.json();
          if (repos && repos.length) {
            githubContext = '\n\nUser\'s GitHub repositories:\n' + repos.map((repo: any) => 
              `- ${repo.name}: ${repo.description || 'No description'}`
            ).join('\n');
          }
        }
      } catch (err) {
        console.error('Failed to fetch GitHub repos:', err);
      }
    }

    const planStatus = await getPlanStatus(user.id);
    if (!planStatus.canGenerate) {
      return NextResponse.json(
        {
          error: 'generation_limit_reached',
          plan: planStatus.plan,
          generationsUsed: planStatus.generationsUsed,
          generationsLimit: planStatus.generationsLimit,
        },
        { status: 403 },
      );
    }

    const payload = await req.json();
    const { sourceMaterial, campaignDirectives } = payload;

    let urlContext = sourceMaterial?.url || '';
    const textContext = sourceMaterial?.rawText || '';
    const assetUrls = sourceMaterial?.assetUrls || [];

    // --- YouTube transcript handling (Authenticated flow) ---
    let effectiveUrlContext = urlContext;
    if (urlContext) {
      const videoId = extractYouTubeId(urlContext);
      if (videoId) {
        const transcript = await getYouTubeTranscript(videoId);
        if (transcript) {
          effectiveUrlContext = `YouTube transcript: ${transcript}`;
        }
      }
    }

    // Combine textContext with GitHub context (if any)
    const enhancedText = textContext + githubContext;

    const tweetFormat = campaignDirectives?.tweetFormat || 'single';
    const personaVoice = campaignDirectives?.personaVoice || 'Expert Content Strategist';

    const finalContext = campaignDirectives?.additionalContext
      ? `${enhancedText}\n\nAdditional Directives: ${campaignDirectives.additionalContext}`
      : enhancedText;

    if (containsPromptInjection(finalContext)) {
      console.warn(`[SECURITY] Prompt injection attempt intercepted from IP: ${ip}`);
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

    if (assetUrls?.length) {
      for (const assetUrl of assetUrls) {
        try {
          const fileRes = await fetch(assetUrl);
          if (!fileRes.ok) throw new Error(`HTTP error! status: ${fileRes.status}`);
          const mimeType = fileRes.headers.get('content-type') || 'application/octet-stream';
          const arrayBuffer = await fileRes.arrayBuffer();
          const base64Data = Buffer.from(arrayBuffer).toString('base64');
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType,
            },
          });
        } catch (err) {
          console.error(`Failed to fetch and process asset from R2: ${assetUrl}`, err);
        }
      }
    }

    const responseText = await generateFromParts(parts);

    await incrementCampaignGeneration(user.id);

    const durationMs = Date.now() - startTime;
    posthog.capture({
      distinctId: ip,
      event: 'vertex_generation_completed',
      properties: {
        durationMs,
        personaVoice,
        hasFile: assetUrls.length > 0,
        assetCount: assetUrls.length,
        status: 'success',
      },
    });
    await posthog.shutdown();

    return NextResponse.json({ output: responseText });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    posthog.capture({
      distinctId: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
      event: 'vertex_generation_failed',
      properties: {
        durationMs,
        errorMessage: error.message,
        status: 'error',
      },
    });
    await posthog.shutdown();

    console.error('Vertex AI Generate Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
