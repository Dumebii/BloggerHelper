import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { content, webhookUrl } = await req.json();

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "No Discord webhook configured." },
        { status: 400 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) throw new Error("Discord rejected the payload.");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Discord Post Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
