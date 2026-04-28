import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { buildNewsletterEmail } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

export default async function EmailWebView({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: post, error } = await supabase
    .from("scheduled_posts")
    .select("content, user_id")
    .eq("id", postId)
    .single();

  if (error || !post) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("email_sender_name")
    .eq("id", post.user_id)
    .single();

  const senderName = profile?.email_sender_name?.trim() || undefined;

  // Strip the Subject: line if present (same logic as cron route)
  let body = post.content || "";
  const subjectMatch = body.match(/^\s*Subject:\s*(.+)$/im);
  if (subjectMatch) {
    body = body.replace(subjectMatch[0], "").replace(/^\n+/, "").trim();
  } else {
    const htmlSubjectMatch = body.match(/<[^>]*>\s*Subject:\s*(.+?)\s*<\/[^>]*>/i);
    if (htmlSubjectMatch) {
      body = body.replace(htmlSubjectMatch[0], "");
    }
  }

  const isHtml = /<[a-z][\s\S]*>/i.test(body);
  const finalBody = isHtml ? body : body.replace(/\n/g, "<br/>");

  const html = buildNewsletterEmail(finalBody, "", undefined, senderName, true);

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex, nofollow" />
        <style>{`body { margin: 0; padding: 20px; background: #f4f4f5; } img { max-width: 100%; height: auto; }`}</style>
      </head>
      <body dangerouslySetInnerHTML={{ __html: html }} />
    </html>
  );
}
