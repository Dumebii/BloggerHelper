import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // Destructure all expected fields
    const { content, webhookUrl: providedWebhook, userId: providedUserId, username, avatar_url, imageUrl } = await req.json();

    // Determine webhook URL
    let webhookUrl = providedWebhook;
    let userId = providedUserId;

    if (!webhookUrl) {
      // No webhook provided, try to get from authenticated user
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = user.id;
      webhookUrl = user.user_metadata?.discord_webhook;
      if (!webhookUrl) {
        return NextResponse.json(
          { error: "No Discord webhook configured." },
          { status: 400 }
        );
      }
    }

    // Validate webhook URL (SSRF protection)
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(webhookUrl);
    } catch (err) {
      return NextResponse.json(
        { error: "Malformed webhook URL." },
        { status: 400 }
      );
    }

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

    // Prepare payload with optional name/avatar
    const payload: any = { content };
    if (username) payload.username = username;
    if (avatar_url) payload.avatar_url = avatar_url;
        if (imageUrl) {
      payload.embeds = [{ image: { url: imageUrl } }];
    }

    // Send to Discord
    const response = await fetch(parsedUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Discord rejected the payload.");
    }

    // Increment posts_published if we have userId
    if (userId) {
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await supabaseAdmin.rpc("increment_posts_published", { user_id_input: userId });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Discord Post Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}