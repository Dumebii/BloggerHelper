import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { SendMailClient } from "zeptomail";
import { buildPromotionalEmail } from "@/lib/email-templates";

const CRON_SECRET = process.env.CRON_SECRET;
const APP_URL = process.env.APP_URL || "https://ozigi.app";

const ZEPTOMAIL_BASE_URL = "https://api.zeptomail.com/v1.1/email";
const mailClient = new SendMailClient({
  url: ZEPTOMAIL_BASE_URL,
  token: `Zoho-enczapikey ${process.env.ZEPTOMAIL_API_KEY!}`,
});

const PROMO_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "hello@ozigi.app";
const PROMO_FROM_NAME = process.env.EMAIL_FROM_NAME || "Ozigi";

/**
 * GET /api/cron/promotional
 *
 * Called automatically by Vercel Cron on the schedule defined in vercel.json.
 * Reads the active promotional campaign from the `promo_queue` table and sends
 * it to all subscribed users, then marks it as sent.
 *
 * Vercel Cron passes the CRON_SECRET as a Bearer token automatically when the
 * secret is set in the project settings.
 *
 * To change the send frequency edit vercel.json:
 *   Weekly (every Monday 10am UTC):  "0 10 * * 1"
 *   Bi-weekly (every other Monday):  handled by the `interval_weeks` field below
 *   1st & 15th each month:           "0 10 1,15 * *"
 */
export async function GET(req: Request) {
  // Verify this is called by Vercel Cron (or a trusted admin)
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // ── 1. Get the next unsent campaign from the queue ──────────────────────
    const { data: campaign, error: campaignError } = await supabase
      .from("promo_queue")
      .select("*")
      .eq("status", "pending")
      .order("scheduled_for", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (campaignError) throw campaignError;

    if (!campaign) {
      console.log("[Promo Cron] No pending campaigns in queue.");
      return NextResponse.json({ success: true, message: "No pending campaigns." });
    }

    // Skip if the send window hasn't arrived yet
    if (new Date(campaign.scheduled_for) > new Date()) {
      console.log("[Promo Cron] Next campaign not due yet:", campaign.scheduled_for);
      return NextResponse.json({ success: true, message: "Campaign not due yet." });
    }

    // ── 2. Mark as processing to prevent duplicate sends ────────────────────
    await supabase
      .from("promo_queue")
      .update({ status: "processing", started_at: new Date().toISOString() })
      .eq("id", campaign.id);

    // ── 3. Fetch all subscribed users ───────────────────────────────────────
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, email, display_name, promo_unsubscribed")
      .eq("promo_unsubscribed", false);

    if (usersError) throw usersError;

    const results = { sent: 0, failed: 0, skipped: 0, errors: [] as string[] };

    // ── 4. Send to each user ────────────────────────────────────────────────
    for (const user of users ?? []) {
      if (!user.email) { results.skipped++; continue; }

      try {
        const unsubscribeUrl = `${APP_URL}/api/email/promo-unsubscribe?userId=${user.id}`;
        const html = buildPromotionalEmail(
          campaign.subject,
          campaign.headline,
          campaign.body_content,
          campaign.cta_text,
          campaign.cta_url,
          unsubscribeUrl
        );
        await sendEmail(user.email, campaign.subject, html);
        results.sent++;
        // Throttle: 10 sends/sec to stay within ZeptoMail limits
        await new Promise((r) => setTimeout(r, 100));
      } catch (err: any) {
        results.failed++;
        results.errors.push(`${user.email}: ${err.message}`);
      }
    }

    // ── 5. Mark campaign as sent ────────────────────────────────────────────
    await supabase
      .from("promo_queue")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        sent_count: results.sent,
        failed_count: results.failed,
      })
      .eq("id", campaign.id);

    console.log("[Promo Cron] Campaign sent:", results);
    return NextResponse.json({ success: true, campaignId: campaign.id, results });
  } catch (error: any) {
    console.error("[Promo Cron] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function sendEmail(to: string, subject: string, htmlBody: string) {
  await mailClient.sendMail({
    from: { address: PROMO_FROM_ADDRESS, name: PROMO_FROM_NAME },
    to: [{ email_address: { address: to, name: "" } }],
    subject,
    htmlbody: htmlBody,
  });
}
