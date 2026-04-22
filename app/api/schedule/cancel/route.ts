import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cancelQStashMessage } from "@/lib/qstash";

export async function POST(req: Request) {
  try {
    const { postId } = await req.json();
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the post to get qstash_message_id and verify ownership
    const { data: post, error: fetchError } = await supabase
      .from("scheduled_posts")
      .select("id, status, qstash_message_id, user_id")
      .eq("id", postId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.status !== "pending") {
      return NextResponse.json({ error: "Post cannot be cancelled" }, { status: 400 });
    }

    // Cancel the QStash message if we have its ID
    if (post.qstash_message_id) {
      await cancelQStashMessage(post.qstash_message_id);
    }

    // Update status in DB
    const { error: updateError } = await supabase
      .from("scheduled_posts")
      .update({ status: "cancelled" })
      .eq("id", postId)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to cancel post" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cancel schedule error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
