import { NextResponse } from 'next/server';
import { getVertexAIClient } from '@/lib/genai-client';
import { Modality } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { text, platform, graphicTitle } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    let prompt = '';
    let negativePrompt = '';

    if (graphicTitle?.trim()) {
      // User provided a headline - create a graphic with that text
      prompt = `A beautiful, eye-catching social media graphic for ${platform}. The design features the headline "${graphicTitle.trim()}" as the focal point, displayed in clean, modern, highly readable typography. The background complements the message with subtle gradients, soft colors, and minimal abstract elements. Professional, polished, and suitable for business or personal branding. High quality, sharp text.`;
      negativePrompt = 'spelling mistakes, typos, blurry text, messy fonts, cluttered design, ugly colors';
    } else {
      // No headline - create a mood/aesthetic image based on the post content
      const cleanText = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '').substring(0, 200);
      prompt = `Create a visually appealing, abstract background image for a ${platform} post about: "${cleanText}". The image should be modern, professional, and evoke the mood of the content. Use soft gradients, subtle patterns, or abstract shapes. No text or words in the image. Clean, minimal, aesthetic. Suitable for professional social media.`;
      negativePrompt = 'text, words, letters, writing, watermark, ugly, cluttered, busy, low quality';
    }

    const client = await getVertexAIClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: `${prompt}\n\nNegative instructions: ${negativePrompt}`,
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    if (!imagePart?.inlineData) {
      throw new Error('No image generated');
    }

    const base64Image = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/jpeg';
    const imageUrl = `data:${mimeType};base64,${base64Image}`;

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('Vertex AI Image Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
