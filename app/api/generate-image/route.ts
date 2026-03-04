import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, platform } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // 1. Craft a prompt that guarantees a clean, professional social graphic
    // We strip out emojis and constrain the length to keep the AI focused.
    const cleanText = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '').substring(0, 150);
    const prompt = `A clean, modern, professional, highly aesthetic conceptual graphic representing: "${cleanText}". Suitable for a ${platform} post. No text or words in the image. High quality, vibrant.`;

    // 2. Call the Image API
    // (Using Pollinations for instant development testing. Swap with Imagen 3 or DALL-E later)
    const encodedPrompt = encodeURIComponent(prompt);
    
    // We use a 16:9 aspect ratio (800x450) which looks great on X and LinkedIn
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=450&nologo=true`;

    return NextResponse.json({ imageUrl });

  } catch (error: any) {
    console.error("Image Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}