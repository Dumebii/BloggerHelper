import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { articleUrl } = await req.json();

    // 1. Fetch the instructions from your .md file
    const instructionsPath = path.join(process.cwd(), "agent_instructions.md");
    const agentInstructions = fs.readFileSync(instructionsPath, "utf8");

    // 2. Extract username and slug from dev.to URL
    const urlParts = new URL(articleUrl).pathname.split("/").filter(Boolean);
    const [username, slug] = urlParts;

    // 3. Fetch from dev.to
    const devToRes = await fetch(
      `https://dev.to/api/articles/${username}/${slug}`
    );
    const articleData = await devToRes.json();

    // 4. Run the Agent
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro", // This is the smartest model for AI Plus
      generationConfig: {
        temperature: 0.7, // Keeps it creative but factual
        topP: 0.95,
      },
    });
    const prompt = `
    Analyze the article: ${articleUrl}
    Generate a 3-day social media campaign.
    
    OUTPUT ONLY A VALID JSON OBJECT with this structure:
    {
      "campaign": [
        {
          "day": 1,
          "x": "Full content of X post...",
          "linkedin": "Full content of LinkedIn post...",
          "discord": "Full content of Discord post..."
        },
        { "day": 2, ... },
        { "day": 3, ... }
      ]
    }
    Ensure the actual link (${articleUrl}) is integrated into the end of every post text.
  `;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ output: result.response.text() });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        output: `ERROR: ${error.message}. Check if your Gemini API key is set in .env`,
      },
      { status: 500 }
    );
  }
}
