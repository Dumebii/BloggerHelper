export const maxDuration = 60;
import { VertexAI, SchemaType } from "@google-cloud/vertexai";
import { NextResponse } from "next/server";
import { buildGenerationPrompt } from "../../../lib/prompts";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import path from "path";
import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
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
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(`ratelimit_${ip}`);

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const formData = await req.formData();
    const textPrompt = buildGenerationPrompt({
      tweetFormat: formData.get("tweetFormat") as string || "single",
      personaVoice: formData.get("personaVoice") as string || "Expert Content Strategist",
      textContext: formData.get("textContext") as string | null,
      urlContext: formData.get("urlContext") as string | null,
    });

    const file = formData.get("file") as File | null;
    const parts: any[] = [{ text: textPrompt }];

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      parts.push({ inlineData: { data: base64Data, mimeType: file.type } });
    }

    let authOptions = {};

    if (process.env.GCP_WORKLOAD_IDENTITY_POOL_ID) {
      //const audience = `//iam.googleapis.com/projects/${process.env.GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${process.env.GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`;

const audience = `//iam.googleapis.com/projects/${process.env.GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${process.env.GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`;

      const authClient = ExternalAccountClient.fromJSON({
        type: 'external_account',
        audience: audience,
        subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
        token_url: 'https://sts.googleapis.com/v1/token',
        // ⚡ CHANGE: Replacing the "-" with your actual Project ID
        service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/${process.env.GCP_PROJECT_ID}/serviceAccounts/${process.env.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
        subject_token_supplier: {
          getSubjectToken: async () => await getVercelOidcToken(),
        },
      });

      authOptions = { authClient, projectId: process.env.GCP_PROJECT_ID };
    } else {
      authOptions = { keyFilename: path.join(process.cwd(), "gcp-service-account.json") };
    }

    const vertex_ai = new VertexAI({
      project: process.env.GCP_PROJECT_ID || "ozigi-489021", 
      location: "us-central1",
      googleAuthOptions: authOptions,
    });

    const model = vertex_ai.getGenerativeModel({ 
      model: "gemini-2.0-flash", 
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: distributionSchema,
      }
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: parts }],
    });

    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return NextResponse.json({ output: responseText });

  } catch (err: any) {
    console.error("🔥 VERTEX AI CRASH:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}