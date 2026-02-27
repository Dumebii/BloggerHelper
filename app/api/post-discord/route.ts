import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Discord Webhook URL not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: content, // This is the message that appears in Discord
      }),
    });

    if (!response.ok) {
      throw new Error("Discord API rejected the request");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Discord Post Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
