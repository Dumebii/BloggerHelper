import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { buildNewsletterEmail } from "@/lib/email-templates";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: post, error } = await supabase
    .from("scheduled_posts")
    .select("content, user_id, platform")
    .eq("id", postId)
    .single();

  if (error || !post || post.platform !== "email") {
    return new NextResponse("Email not found", { status: 404 });
  }

  // Fetch user profile for sender name and reply-to
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, email_sender_name, reply_to_email")
    .eq("id", post.user_id)
    .single();

  const senderName = profile?.email_sender_name?.trim() || "Ozigi User";
  const replyTo = profile?.reply_to_email || profile?.email;

  // Extract subject and body
  const emailContent = post.content || "";
  let subject = "Your Ozigi Newsletter";
  let body = emailContent;
  const subjectMatch = emailContent.match(/^\s*Subject:\s*(.+)$/im);
  if (subjectMatch) {
    subject = subjectMatch[1].trim();
    body = emailContent.replace(subjectMatch[0], '').replace(/^\n+/, '').trim();
  }

  // Build HTML for web view (no unsubscribe)
  const html = buildNewsletterEmail(body, "", replyTo, senderName, true, postId);

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}