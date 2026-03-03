import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60;

// Catch people trying to visit the API directly in their browser
export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/", request.url));
}

export async function POST(req: Request) {
  try {
    // 1. Extract the FormData
    const formData = await req.formData();
    const urlContext = formData.get("urlContext") as string | null;
    const textContext = formData.get("textContext") as string | null;
    const personaVoice = formData.get("personaVoice") as string | null;
    const file = formData.get("file") as File | null;

    let finalContext = "";

    // 2. Process URL via Jina Proxy
    if (urlContext && urlContext.trim() !== "") {
      const targetUrl = `https://r.jina.ai/${urlContext}`;
      const urlResponse = await fetch(targetUrl, {
        headers: {
          Accept: "text/event-stream",
          "User-Agent": "Ozigi Content Engine Bot",
        },
      });

      if (!urlResponse.ok) {
        if (textContext || file) {
          finalContext += `[NOTE: The provided URL was blocked by anti-bot protection, but here is the other provided context:]\n\n`;
        } else {
          throw new Error(
            "This website blocks AI scrapers. Please provide a file or text notes instead!"
          );
        }
      } else {
        const scrapedMarkdown = await urlResponse.text();
        finalContext += `[SOURCE ARTICLE/URL CONTENT]\n${scrapedMarkdown}\n\n`;
      }
    }

    // 3. Process Raw Notes
    if (textContext && textContext.trim() !== "") {
      finalContext += `[ADDITIONAL USER NOTES/RAW TEXT]\n${textContext}\n\n`;
    }

    if (!finalContext.trim() && !file) {
      return NextResponse.json(
        {
          error:
            "No context provided. Please enter a URL, text, or upload a file.",
        },
        { status: 400 }
      );
    }

    // 4. Set up the Prompt Array for Gemini
    const prompt = `
      TASK: Analyze the provided context (which may include scraped webpages, raw notes, images, or PDFs).
      Architect a 3-day social media distribution strategy based on this information. 
      CRITICAL: If the persona dictates a specific sign-off, tone, or phrase, you MUST include it in the generated text for every single post.

      SOURCE TEXT CONTEXT:
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

    // We build an array to hold both our text prompt AND our file data
    const generativeParts: any[] = [prompt];

    // 5. Process the File into a Base64 Buffer for Gemini
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      generativeParts.push({
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: file.type, // e.g., 'application/pdf', 'image/jpeg'
        },
      });
    }

    // 6. Orchestrate with Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      systemInstruction:
        personaVoice || "You are a professional content architect.",
    });

    // Pass the combined array of text and file buffers to the model
    const result = await model.generateContent(generativeParts);
    const response = await result.response;
    const outputText = response.text();

    return NextResponse.json({ output: outputText });
  } catch (error: any) {
    console.error("Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
