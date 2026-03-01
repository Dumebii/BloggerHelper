import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { context, sourceType, personaVoice } = await req.json();

    let finalContext = context;
    if (sourceType === "url") {
      const urlResponse = await fetch(context, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (!urlResponse.ok)
        throw new Error("Target website blocked the request.");
      const rawHtml = await urlResponse.text();
      finalContext = rawHtml
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ");
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      systemInstruction:
        personaVoice || "You are a professional content architect.",
    });

    const prompt = `
      TASK: Analyze the provided ${
        sourceType === "url" ? "scraped webpage text" : "raw notes/drafts"
      }.
      Architect a 3-day social media distribution strategy. 
      CRITICAL: If the persona dictates a specific sign-off, tone, or phrase, you MUST include it in the generated text for every single post.

      SOURCE CONTEXT:
      ${finalContext}

      OUTPUT RULES:
      Return ONLY a valid JSON object. Do not include markdown formatting.
      You must include a "rule_check" field explicitly stating the exact sign-off or stylistic rule requested in the persona.
      
      Format: 
      {
        "rule_check": "I will end every post with the exact phrase: ...",
        "campaign": [
          {"day": 1, "x": "...", "linkedin": "...", "discord": "..."}
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const outputText = response.text();

    return NextResponse.json({ output: outputText });
  } catch (error: any) {
    console.error("Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
