import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const { context, sourceType, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please connect GitHub." }, { status: 401 });
    }

    // 1. Fetch the User's Dynamic Persona
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('persona_voice')
      .eq('user_id', userId)
      .maybeSingle(); 

    if (profileError) {
      console.warn("Supabase Warning:", profileError);
    }

    const personaVoice = profile?.persona_voice || "You are a professional content architect.";
    
    // 🔍 QA DIAGNOSTIC: This will print in your CodeSandbox terminal!
    console.log("🧠 Fetched Persona from DB:", personaVoice);

    let finalContext = context;
    if (sourceType === 'url') {
      const urlResponse = await fetch(context);
      if (!urlResponse.ok) throw new Error("Could not read the provided URL.");
      finalContext = await urlResponse.text();
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-pro",
      systemInstruction: personaVoice 
    });

    // 2. The Hardened Prompt Architecture
    const prompt = `
      STRICT PERSONA ENFORCEMENT:
      You must write ALL content strictly adhering to this persona and its rules:
      "${personaVoice}"

      TASK: Analyze the provided ${sourceType === 'url' ? 'webpage HTML/content' : 'raw notes/drafts'}.
      Architect a 3-day social media distribution strategy. 
      CRITICAL: If the persona above dictates a specific sign-off, tone, or phrase (e.g., ending with a specific sentence), you MUST include it in the generated text for every single post.

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