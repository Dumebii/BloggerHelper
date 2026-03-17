export const maxDuration = 60;
import { VertexAI, SchemaType } from "@google-cloud/vertexai";
import { NextResponse } from "next/server";
import { buildGenerationPrompt, containsPromptInjection } from "../../../lib/prompts";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import path from "path";
import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';
import { PostHog } from 'posthog-node';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getPlanStatus, incrementGenerationCount } from "@/lib/plan";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(30, "1 h"),
  analytics: true,
});

const distributionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    campaign: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          day: { type: SchemaType.INTEGER },
          x: { type: SchemaType.STRING },
          linkedin: { type: SchemaType.STRING },
          discord: { type: SchemaType.STRING }
        },
        required: ["day", "x", "linkedin", "discord"]
      }
    }
  },
  required: ["campaign"]
};

export async function POST(req: Request) {
  const startTime = Date.now();
  const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  });

  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(`ratelimit_${ip}`);

    if (!success) {
      console.warn(`[SECURITY] Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: "Too many generation requests. Please try again later." },
        { status: 429 }
      );
    }

    // --- AUTHENTICATION & PLAN CHECK ---
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // No-op in API routes – you can't set cookies here
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Log for debugging (remove in production if desired)
    console.log('Generate route - auth result:', { 
      userId: user?.id, 
      authError: authError?.message 
    });

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", details: authError?.message || "No user session" },
        { status: 401 }
      );
    }

    const planStatus = await getPlanStatus(user.id);
    if (!planStatus.canGenerate) {
      return NextResponse.json(
        {
          error: "generation_limit_reached",
          plan: planStatus.plan,
          generationsUsed: planStatus.generationsUsed,
          generationsLimit: planStatus.generationsLimit,
        },
        { status: 403 }
      );
    }
    // --- END PLAN CHECK ---

    // Parse the incoming JSON payload
    const payload = await req.json();
    const { sourceMaterial, campaignDirectives } = payload;

    const urlContext = sourceMaterial?.url || "";
    const textContext = sourceMaterial?.rawText || "";
    const assetUrls = sourceMaterial?.assetUrls || [];

    const tweetFormat = campaignDirectives?.tweetFormat || "single";
    const personaVoice = campaignDirectives?.personaVoice || "Expert Content Strategist";

    // Append additional directives to textContext if they exist
    const finalContext = campaignDirectives?.additionalContext
      ? `${textContext}\n\nAdditional Directives: ${campaignDirectives.additionalContext}`
      : textContext;

    if (containsPromptInjection(finalContext)) {
      console.warn(`[SECURITY] Prompt injection attempt intercepted from IP: ${ip}`);
      return NextResponse.json(
        { error: "Security Policy Violation: Invalid context structure detected." },
        { status: 400 }
      );
    }

    const textPrompt = buildGenerationPrompt({
      tweetFormat,
      personaVoice,
      textContext: finalContext,
      urlContext,
    });

    const parts: any[] = [{ text: textPrompt }];

    // Fetch assets from Cloudflare R2 and convert to Base64 for Gemini
    if (assetUrls && assetUrls.length > 0) {
      for (const assetUrl of assetUrls) {
        try {
          const fileRes = await fetch(assetUrl);
          if (!fileRes.ok) throw new Error(`HTTP error! status: ${fileRes.status}`);

          const mimeType = fileRes.headers.get("content-type") || "application/octet-stream";
          const arrayBuffer = await fileRes.arrayBuffer();
          const base64Data = Buffer.from(arrayBuffer).toString("base64");

          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          });
        } catch (err) {
          console.error(`Failed to fetch and process asset from R2: ${assetUrl}`, err);
          // Continue instead of crashing so text generation still works
        }
      }
    }

    const projectId = process.env.GCP_PROJECT_ID || "ozigi-489021";
    let authOptions: any;

    if (process.env.VERCEL) {
      const projectNumber = process.env.GCP_PROJECT_NUMBER?.trim();
      const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID?.trim();
      const providerId = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID?.trim();
      const saEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL?.trim();

      const audience = `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`;

      const authClient = ExternalAccountClient.fromJSON({
        type: 'external_account',
        audience: audience,
        subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
        token_url: 'https://sts.googleapis.com/v1/token',
        service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${saEmail}:generateAccessToken`,
        subject_token_supplier: {
          getSubjectToken: async () => await getVercelOidcToken(),
        },
      });

      authOptions = {
        authClient,
        projectId: projectId,
      };
    } else {
      authOptions = {
        keyFilename: path.join(process.cwd(), "gcp-service-account.json"),
      };
    }

    const vertex_ai = new VertexAI({
      project: projectId,
      location: "us-central1",
      googleAuthOptions: authOptions,
    });

    const model = vertex_ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: distributionSchema,
      }
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: parts }],
    });

    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // --- Increment generation count after successful generation ---
    await incrementGenerationCount(user.id);

    const durationMs = Date.now() - startTime;
    posthog.capture({
      distinctId: ip,
      event: 'vertex_generation_completed',
      properties: {
        durationMs,
        personaVoice,
        hasFile: assetUrls.length > 0,
        assetCount: assetUrls.length,
        status: 'success'
      }
    });
    await posthog.shutdown();

    return NextResponse.json({ output: responseText });

  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    posthog.capture({
      distinctId: req.headers.get("x-forwarded-for") ?? "127.0.0.1",
      event: 'vertex_generation_failed',
      properties: {
        durationMs,
        errorMessage: error.message,
        status: 'error'
      }
    });
    await posthog.shutdown();

    console.error("Vertex AI Generate Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}