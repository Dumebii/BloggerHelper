import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the Gemini Client
// Ensure you have GEMINI_API_KEY in your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Extract standard text/url inputs
    const urlContext = formData.get("urlContext") as string | null;
    const textContext = formData.get("textContext") as string | null;
    const tweetFormat = formData.get("tweetFormat") as string | "single";
    const personaVoice = formData.get("personaVoice") as
      | string
      | "Expert Content Strategist";

    // Extract the physical file
    const file = formData.get("file") as File | null;

    let textPrompt = `
      TASK: Analyze the provided context (which may include scraped webpages, raw notes, images, or PDFs).
      Architect a 3-day social media distribution strategy based on this information. 
      
      PERSONA/VOICE: ${personaVoice}

      CRITICAL X/TWITTER FORMAT RULE: 
      The user requested the Twitter format to be: "${tweetFormat}".
      If "single", the "x" field must contain EXACTLY ONE punchy, high-impact tweet.
      If "thread", the "x" field must contain a compelling 3-to-5 part thread. Separate each part with two blank lines and number them (e.g., 1/5, 2/5).

      OUTPUT RULES:
      Return ONLY a valid JSON object. Do not include markdown formatting like \`\`\`json.
      
      Format: 
      {
        "campaign": [
          {"day": 1, "x": "...", "linkedin": "...", "discord": "..."}
        ]
      }
      
      CONTEXT TO ANALYZE:
    `;

    if (textContext) textPrompt += `\nRaw Notes: ${textContext}\n`;
    if (urlContext) textPrompt += `\nSource URL: ${urlContext}\n`;

    // The Gemini input array can hold both text strings and file objects
    const geminiInput: any[] = [textPrompt];

    // ✨ THE MAGIC: Process the Image or PDF
    if (file && file.size > 0) {
      // 1. Convert the file into a raw binary buffer
      const arrayBuffer = await file.arrayBuffer();
      // 2. Encode that buffer into a Base64 string that Gemini can read securely over HTTP
      const base64Data = Buffer.from(arrayBuffer).toString("base64");

      // 3. Push it into the payload using Gemini's specific inlineData format
      geminiInput.push({
        inlineData: {
          data: base64Data,
          mimeType: file.type, // Automatically passes 'application/pdf', 'image/png', etc.
        },
      });
    }

    // We use gemini-1.5-pro because it handles complex PDF reasoning and dense images beautifully
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Fire the multimodal request
    const result = await model.generateContent(geminiInput);
    const responseText = result.response.text();

    return NextResponse.json({ output: responseText });
  } catch (error: any) {
    console.error("Generate API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
