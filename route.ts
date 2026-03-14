export const maxDuration = 60;
import { VertexAI, SchemaType } from "@google-cloud/vertexai";
import { NextResponse } from "next/server";
import { buildGenerationPrompt, containsPromptInjection } from "../../../lib/prompts";
import { scrapeUrl } from "../../../lib/apify"; // ✨ IMPORT APIFY INJECTION
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import path from "path";
import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';
import { PostHog } from 'posthog-node';

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

    const formData = await req.formData();
    let urlContext = formData.get("urlContext") as string | null;
    const textContext = formData.get("textContext") as string | null;
    const tweetFormat = formData.get("tweetFormat") as string || "single";
    const personaVoice = formData.get("personaVoice") as string || "Expert Content Strategist";
    const file = formData.get("file") as File | null;

    if (containsPromptInjection(textContext)) {
      console.warn(`[SECURITY] Prompt injection attempt intercepted from IP: ${ip}`);
      return NextResponse.json(
        { error: "Security Policy Violation: Invalid context structure detected." },
        { status: 400 }
      );
    }

    // ✨ INTERCEPT AND SCRAPE URL IF PROVIDED
    if (urlContext && urlContext.startsWith("http")) {
      const scrapeResult = await scrapeUrl(urlContext);
      
      if (!scrapeResult.success) {
        return NextResponse.json(
          { error: scrapeResult.error || "Failed to extract content from URL." },
          { status: 400 } // Surfacing the Apify error state to the user
        );
      }
      // Reassign urlContext to the scraped Markdown content instead of the raw URL
      urlContext = scrapeResult.content || null;
    }

    const textPrompt = buildGenerationPrompt({
      tweetFormat,
      personaVoice,
      textContext,
      urlContext,
    });

    const parts: any[] = [{ text: textPrompt }];

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    }

    const projectId = process.env.GCP_PROJECT_ID || "ozigi-489021";
    let authOptions: any;

if (process.env.VERCEL) {
      // ⚡ Restore the full string construction using your existing Vercel variables
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
    
    const durationMs = Date.now() - startTime;
    posthog.capture({
      distinctId: ip,
      event: 'vertex_generation_completed',
      properties: {
        durationMs,
        personaVoice,
        hasFile: file !== null,
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