import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client for the server environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const { context, sourceType, userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please connect GitHub." },
        { status: 401 }
      );
    }

    // 1. Fetch the User's Dynamic Persona from Supabase (Failure-Proofed)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("persona_voice")
      .eq("user_id", userId)
      .maybeSingle(); // Prevents a fatal crash if 0 rows are found

    if (profileError) {
      console.warn("Supabase Warning (Proceeding with default):", profileError);
    }

    // Fallback to your default Developer Educator persona if the database is empty
    const personaVoice =
      profile?.persona_voice ||
      "You are a professional technical writer and developer educator. Your tone is highly technical, concise, and structured for maximum readability.";

    // 2. Process the "Context Tank" Input
    let finalContext = context;
    if (sourceType === "url") {
      // If it's a link, fetch the raw HTML.
      // Gemini's context window is smart enough to extract the core text from the raw DOM.
      const urlResponse = await fetch(context);
      if (!urlResponse.ok) throw new Error("Could not read the provided URL.");
      finalContext = await urlResponse.text();
    }

    // 3. Orchestrate with Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

    // We use Gemini 1.5 Pro here for its massive context window (ideal for raw HTML and long thesis notes)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      // Injecting your Supabase Profile natively as the System Prompt
      systemInstruction: personaVoice,
    });

    const prompt = `
      TASK: Analyze the provided ${
        sourceType === "url" ? "webpage HTML/content" : "raw notes/drafts"
      }.
      Based on this context, architect a 3-day social media distribution strategy.

      SOURCE CONTEXT:
      ${finalContext}

      OUTPUT RULES:
      Return ONLY a valid JSON object containing an array named "campaign". 
      Format: {"campaign": [{"day": 1, "x": "...", "linkedin": "...", "discord": "..."}, ...]}
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
