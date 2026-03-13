export const maxDuration = 60;
import { VertexAI, SchemaType } from "@google-cloud/vertexai";
import { NextResponse } from "next/server";
import { buildGenerationPrompt } from "../../../lib/prompts";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import path from "path";

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
      description: "A list of 3 daily social media posts.",
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
    const { success, limit, reset, remaining } = await ratelimit.limit(`ratelimit_${ip}`);

    if (!success) {
      return NextResponse.json(
        { error: "You have exceeded your rate limit. Please try again in an hour." },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          }
        }
      );
    }

    const formData = await req.formData();
    const urlContext = formData.get("urlContext") as string | null;
    const textContext = formData.get("textContext") as string | null;
    const tweetFormat = formData.get("tweetFormat") as string || "single";
    const personaVoice = formData.get("personaVoice") as string || "Expert Content Strategist";
    const file = formData.get("file") as File | null;

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
      parts.push({ inlineData: { data: base64Data, mimeType: file.type } });
    }

    // HYBRID AUTH (LOCAL FILE vs VERCEL ENV)

    let authOptions = {};
    if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL) {
      
      // ⚡ THE TITANIUM PARSER: Fixes Vercel's multi-line mangling
      let cleanPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
      
      // 1. Strip accidental surrounding quotes 
      cleanPrivateKey = cleanPrivateKey.replace(/^"|"$/g, '');
      
      // 2. Convert literal "\n" strings into actual newlines (if they exist)
      cleanPrivateKey = cleanPrivateKey.replace(/\\n/g, '\n');
      
      // 3. Strip hidden Windows carriage returns (\r) that crash the crypto parser
      cleanPrivateKey = cleanPrivateKey.replace(/\r/g, '');

      authOptions = {
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: cleanPrivateKey,
        },
      };
    } else {
      authOptions = {
        keyFilename: path.join(process.cwd(), "gcp-service-account.json"),
      };
    }

    const vertex_ai = new VertexAI({
      project: "ozigi-489021", 
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
    return NextResponse.json({ output: responseText });

  } catch (err: any) {
    console.error("🔥 VERTEX AI CRASH:", err);
    // Return the actual error message if it's a rate limit or a known issue
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}