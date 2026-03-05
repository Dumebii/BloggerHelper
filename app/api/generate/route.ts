import { VertexAI } from "@google-cloud/vertexai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const urlContext = formData.get("urlContext") as string | null;
    const textContext = formData.get("textContext") as string | null;
    const tweetFormat = formData.get("tweetFormat") as string | "single";
    const personaVoice = formData.get("personaVoice") as
      | string
      | "Expert Content Strategist";
    const file = formData.get("file") as File | null;

    let textPrompt = `
      TASK: Analyze the provided context (which may include scraped webpages, raw notes, images, or PDFs).
      Architect a 3-day social media distribution strategy based on this information. 
      You are an expert technical content writer, copywriter, social media manager and user evangelist. Your goal is to transform the user's raw input into highly engaging, multi-platform social media posts. 

You MUST adhere to the following strict stylistic constraints to bypass AI detection and sound like a real, pragmatic human:

1. THE BANNED LEXICON: You are strictly forbidden from using the following words or their variations: delve, testament, tapestry, crucial, vital, landscape, realm, unlock, supercharge, revolutionize, paradigm, seamlessly, navigate, robust, cutting-edge, game-changer. 
2. BURSTINESS (CADENCE): Write with high burstiness. Do not use perfectly balanced, medium-length sentences. Mix extremely short, punchy sentences (2-4 words) with longer, technical explanations. Use conversational transitions. 
3. PERPLEXITY: Avoid predictable adjectives. Use strong, active verbs and concrete nouns. Talk like a pragmatic subject matter expert explaining a concept on a whiteboard to people, not a marketer selling a product.
4. FORMATTING RESTRAINT: AI uses too many emojis and hashtags. You are limited to a MAXIMUM of 1 emoji per post. Use a maximum of 2 highly relevant hashtags per post. Do not use bulleted lists unless absolutely necessary for explaining a technical sequence or code snippet.
5. HOOKS: Start each post with a hook that challenges an assumption, states a bold technical reality, or shares a highly specific learning. Never start with "Are you tired of..." or "In today's fast-paced..."
6. Whenever is necesarry, use personal pronouns to show personalization and authority
7. Avoid statements that read like "It is not x. It is y"

      
      PERSONA/VOICE: ${personaVoice}

      STRICT TONE GUIDELINES:
      1. Write highly technical, insightful content.
      2. ZERO HASHTAGS. Do not use a single hashtag on any platform.
      3. ZERO CHEESY AI WORDS. Completely avoid words like "delve", "robust", "unleash", "supercharge", "transformative", or "tapestry". 
      4. Sound like an authentic, battle-tested software developer sharing raw insights.

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

    // 1. Array of "parts" strictly required by the Vertex AI SDK
    const parts: any[] = [{ text: textPrompt }];

    // Handle Image/PDF Uploads
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

    // 2. Initialize Enterprise Vertex AI with your new .env variables
    const vertex_ai = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT_ID as string,
      location: "us-central1",
      googleAuthOptions: {
        credentials: {
          client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
          // Replaces literal '\n' characters in the env string with actual line breaks
          private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(
            /\\n/g,
            "\n"
          ),
        },
      },
    });

    // Tap into the unthrottled Vertex Gemini 2.5 Pro model
    const model = vertex_ai.getGenerativeModel({ model: "gemini-2.5-pro" });

    // 3. Fire the properly formatted enterprise request
    const result = await model.generateContent({
      contents: [{ role: "user", parts: parts }],
    });

    // 4. Extract text response (Vertex paths are slightly different than AI Studio)
    const responseText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ output: responseText });
  } catch (error: any) {
    console.error("Vertex AI Generate Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
