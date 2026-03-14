import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { content, webhookUrl } = await req.json();

    if (!webhookUrl || typeof webhookUrl !== 'string') {
      return NextResponse.json(
        { error: "No Discord webhook configured or invalid format." },
        { status: 400 }
      );
    }

    // --- SSRF PROTECTION ---
    // 1. Ensure it can be parsed as a valid URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(webhookUrl);
    } catch (err) {
      return NextResponse.json(
        { error: "Malformed webhook URL." },
        { status: 400 }
      );
    }

    // 2. Enforce strict checks on protocol, hostname, and path
    if (
      parsedUrl.protocol !== "https:" ||
      parsedUrl.hostname !== "discord.com" ||
      !parsedUrl.pathname.startsWith("/api/webhooks/")
    ) {
      return NextResponse.json(
        { error: "Unauthorized webhook domain or path. Only discord.com webhooks are permitted." },
        { status: 403 }
      );
    }
    // -----------------------

    // Pass the safely parsed and validated URL string to fetch
    const response = await fetch(parsedUrl.toString(), {
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