import { GoogleAuth } from "google-auth-library";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, platform } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const cleanText = text
      .replace(/[\u{1F600}-\u{1F6FF}]/gu, "")
      .substring(0, 150);
    const prompt = `A clean, modern, professional conceptual graphic representing: "${cleanText}". Suitable for a ${platform} post. No text or words in the image. High quality, aesthetic, vibrant.`;

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = "us-central1";

    // ✨ Generate a secure Enterprise OAuth Token
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
      },
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      projectId: projectId,
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken?.token) {
      throw new Error("Failed to generate Google Cloud access token.");
    }

    // ✨ Hit the Vertex AI Enterprise Imagen Endpoint
    const response = await fetch(
      `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-002:predict`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken.token}`,
        },
        body: JSON.stringify({
          instances: [{ prompt: prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "16:9",
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Vertex AI rejected the request.");
    }

    const base64Image = data.predictions[0].bytesBase64Encoded;
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error("Vertex AI Image Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
