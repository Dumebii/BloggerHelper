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
      prompt = `A clean, modern, professional graphic. In the center, prominently featuring the exact text "${graphicTitle.trim()}" written in bold, highly legible, stylish modern typography. The background is a vibrant, minimalist conceptual design representing the theme of the text. Suitable for a ${platform} post. High resolution, professional design.`;
      negativePrompt = 'spelling mistakes, typos, gibberish, messy fonts, unreadable text, extra letters, alien text, unreadable words';
    } else {
      const cleanText = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '').substring(0, 150);
      prompt = `A sleek, professional, purely abstract conceptual graphic. Modern aesthetic with clean geometric shapes, harmonious vibrant color palette, high-tech gradients, and glowing data points. Highly conceptual minimalism, octane render quality. Suitable for a ${platform} post. High resolution, detailed textures, cinematic lighting. It does NOT contain any text.`;
      negativePrompt = 'text, words, letters, characters, script, calligraphy, handwriting, alphabet, typography, watermark, signature, writing, scribble, squiggles, gibberish, alien text, unreadable text, messy text, messy fonts, number, figures, blurbs, titles, labels, captions, paragraphs, layout with text, text-boxes, placeholders for text, extra letters, misspelled words, extra words, blurred text';
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