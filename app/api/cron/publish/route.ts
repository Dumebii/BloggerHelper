import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { SendMailClient } from "zeptomail";
import nodemailer from 'nodemailer';
import { buildXReminderEmail, buildNewsletterEmail } from "@/lib/email-templates";

const USE_SMTP = !!process.env.SMTP_HOST;
const CRON_SECRET = process.env.CRON_SECRET;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// ZeptoMail configuration
const ZEPTOMAIL_BASE_URL = "https://api.zeptomail.com/v1.1/email";
const ZEPTOMAIL_RAW_TOKEN = process.env.ZEPTOMAIL_API_KEY!;
const mailClient = new SendMailClient({
  url: ZEPTOMAIL_BASE_URL,
  token: `Zoho-enczapikey ${ZEPTOMAIL_RAW_TOKEN}`
});

// Hardcoded senders - never use personal emails or environment overrides
const EMAIL_FROM_ADDRESS = 'hello@ozigi.app';
const EMAIL_FROM_NAME = 'Ozigi';
const NEWSLETTER_FROM_ADDRESS = 'hello@ozigi.app';
const NEWSLETTER_FROM_NAME = 'Ozigi';

interface UserToken {
  user_id: string;
  provider: string;
  access_token: string;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const now = new Date().toISOString();

    // Fetch due posts
    const { data: duePosts, error: fetchError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .limit(50);

    if (fetchError) throw fetchError;

    console.log(`[CRON] Found ${duePosts?.length || 0} due posts`);

    // Collect unique user IDs
    const userIds = [...new Set(duePosts?.map(p => p.user_id) || [])];

    // Fetch user tokens (needed for LinkedIn/X)
    const { data: tokensData, error: tokensError } = await supabase
      .from("user_tokens")
      .select("user_id, provider, access_token")
      .in("user_id", userIds);

    if (tokensError) throw tokensError;

    // Group tokens by user_id
    const tokensByUser = new Map<string, UserToken[]>();
    tokensData?.forEach((token: UserToken) => {
      if (!tokensByUser.has(token.user_id)) {
        tokensByUser.set(token.user_id, []);
      }
      tokensByUser.get(token.user_id)!.push(token);
    });

    const results = [];

    // Process each post
    for (const post of duePosts || []) {
      try {
        // Mark as processing
        await supabase
          .from("scheduled_posts")
          .update({ status: "processing" })
          .eq("id", post.id);

        let publishSuccess = false;
        let publishError: string | null = null;

        // ---------- EMAIL PLATFORM ----------
if (post.platform === 'email') {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email, email_sender_name, reply_to_email')
    .eq('id', post.user_id)
    .single();

  const senderName = profile?.email_sender_name?.trim() || NEWSLETTER_FROM_NAME;
  const fromAddress = NEWSLETTER_FROM_ADDRESS;

  const { data: subscribers, error: subsError } = await supabase
    .from('subscribers')
    .select('email, token')
    .eq('user_id', post.user_id)
    .eq('status', 'active');

  if (subsError || !subscribers || subscribers.length === 0) {
    publishSuccess = true;
  } else {
    const emailContent = post.content || '';

    // Extract subject: find a line that starts with "Subject:" (case‑insensitive) ignoring any HTML
    let subject = 'Your Ozigi Newsletter';
    let body = emailContent;
    // Try plain text match first
    let subjectMatch = emailContent.match(/^\s*Subject:\s*(.+)$/im);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      body = emailContent.replace(subjectMatch[0], '').replace(/^\n+/, '').trim();
    } else {
      // If no plain text match, try to find "Subject:" in HTML (e.g., inside <p> tags)
      const htmlSubjectMatch = emailContent.match(/<[^>]*>\s*Subject:\s*(.+?)\s*<\/[^>]*>/i);
      if (htmlSubjectMatch) {
        subject = htmlSubjectMatch[1].trim();
        // Remove that entire tag (simplistic, but works for typical editor output)
        body = emailContent.replace(htmlSubjectMatch[0], '');
      }
    }
    if (!subject) subject = 'Your Ozigi Newsletter';

    // Determine if body is HTML (contains any HTML tags)
    const isHtml = /<[a-z][\s\S]*>/i.test(body);
    let finalBody = body;
    if (!isHtml) {
      // Plain text: convert newlines to <br/>
      finalBody = body.replace(/\n/g, '<br/>');
    } else {
      // HTML: add responsive image styles
      finalBody = finalBody.replace(/<img\s([^>]*?)>/gi, (match: any, attrs: any) => {
        // If style attribute exists, append max-width; else add style
        if (/style=/i.test(attrs)) {
          attrs = attrs.replace(/style="([^"]*)"/i, (_: any, styles: any) => {
            return `style="${styles}; max-width:100%; height:auto;"`;
          });
        } else {
          attrs += ` style="max-width:100%; height:auto;"`;
        }
        return `<img ${attrs}>`;
      });
    }

    const unsubscribeUrlBase = `${APP_URL}/api/unsubscribe?token=`;

    for (const subscriber of subscribers) {
      const unsubscribeLink = unsubscribeUrlBase + subscriber.token;
      const replyToInfo = profile?.reply_to_email || profile?.email;
      const htmlBody = buildNewsletterEmail(
        finalBody,
        unsubscribeLink,
        replyToInfo,
        senderName,
        false,
        post.id
      );

      // Size check
      const payloadSize = new Blob([htmlBody]).size;
      if (payloadSize > 10 * 1024 * 1024) {
        console.error(`❌ Email size too large (${payloadSize} bytes) for ${subscriber.email}, skipping.`);
        continue;
      }

      try {
        if (USE_SMTP) {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: true,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });
          await transporter.sendMail({
            from: `"${senderName}" <${fromAddress}>`,
            to: subscriber.email,
            subject,
            html: htmlBody,
          });
        } else {
          const payload: any = {
            from: { address: fromAddress, name: senderName },
            to: [{ email_address: { address: subscriber.email, name: '' } }],
            subject: subject,
            htmlbody: htmlBody,
          };
          await mailClient.sendMail(payload);
          console.log(`✅ ZeptoMail sent to ${subscriber.email}`);
        }
      } catch (err: any) {
        console.error(`❌ Failed to send email to ${subscriber.email}:`, err);
        if (err.response) {
          console.error('ZeptoMail response data:', JSON.stringify(err.response.data, null, 2));
        }
      }
    }
    publishSuccess = true;
  }
}

        // ---------- X PLATFORM ----------
else if (post.platform === 'x') {
          if (post.user_email && !post.reminder_sent) {
            const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content)}`;
            const dashboardUrl = `${APP_URL}/dashboard`;
            const htmlBody = buildXReminderEmail(post.content, intentUrl, dashboardUrl);

            try {
              if (USE_SMTP) {
                const transporter = nodemailer.createTransport({
                  host: process.env.SMTP_HOST,
                  port: Number(process.env.SMTP_PORT),
                  secure: true,
                  auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                  },
                  
                });
                await transporter.sendMail({
                  from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM_ADDRESS}>`,
                  to: post.user_email,
                  subject: 'Your scheduled X post is ready',
                  html: htmlBody,
                });
              } else {
                const payload: any = {
                  from: { address: EMAIL_FROM_ADDRESS, name: EMAIL_FROM_NAME },
                  to: [{ email_address: { address: post.user_email, name: '' } }],
                  subject: 'Your scheduled X post is ready',
                  htmlbody: htmlBody,
                };
                await mailClient.sendMail(payload);
              }

              await supabase
                .from("scheduled_posts")
                .update({ reminder_sent: true, status: "pending" })
                .eq("id", post.id);
              publishSuccess = true;
            } catch (emailError: any) {
              console.error(`❌ Failed to send X reminder for post ${post.id}:`, emailError);
              publishSuccess = false;
              publishError = emailError.message;
              await supabase
                .from("scheduled_posts")
                .update({ status: "pending" })
                .eq("id", post.id);
            }
          } else {
            await supabase
              .from("scheduled_posts")
              .update({ status: "pending" })
              .eq("id", post.id);
            publishSuccess = true;
          }
        }

        // ---------- LINKEDIN PLATFORM ----------
else if (post.platform === 'linkedin') {
          const userTokens = tokensByUser.get(post.user_id) || [];
          const linkedInToken = userTokens.find(t => t.provider === 'linkedin_oidc')?.access_token;

          if (!linkedInToken) {
            publishSuccess = false;
            publishError = "No LinkedIn token found";
          } else {
            const res = await fetch(`${APP_URL}/api/publish/linkedin`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: post.content,
    userId: post.user_id,
    imageUrl: post.media_url,
    // Do NOT pass accessToken – let the endpoint fetch from database
  })
});
const data = await res.json();
console.log('[CRON] LinkedIn response:', data);
publishSuccess = res.ok;
publishError = data.error || null;
if (data.postId) console.log('[CRON] LinkedIn post ID:', data.postId);
          }
        }

        // ---------- DISCORD PLATFORM ----------
        else if (post.platform === 'discord') {
          console.log(`[CRON] Processing Discord post ${post.id} for user ${post.user_id}`);
          const { data: profile } = await supabase
            .from('profiles')
            .select('discord_webhook, display_name, avatar_url')
            .eq('id', post.user_id)
            .single();

          if (profile?.discord_webhook) {
            console.log(`[CRON] Discord webhook found for user ${post.user_id}`);
            const payload = {
              content: post.content,
              webhookUrl: profile.discord_webhook,
              userId: post.user_id,
              username: profile.display_name || 'Powered by Ozigi',
              avatar_url: profile.avatar_url || 'https://ozigi.app/logo.png'
            };
            console.log('[CRON] Sending to Discord endpoint with payload:', payload);
            const res = await fetch(`${APP_URL}/api/post-discord`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            const data = await res.json();
            console.log('[CRON] Discord response:', data);
            publishSuccess = res.ok;
            publishError = data.error || null;
          } else {
            console.log(`[CRON] No Discord webhook for user ${post.user_id}`);
            publishSuccess = false;
            publishError = "No Discord webhook configured";
          }
        }

        // ---------- SLACK PLATFORM ----------
        else if (post.platform === 'slack') {
          console.log(`[CRON] Processing Slack post ${post.id} for user ${post.user_id}`);
          const { data: profile } = await supabase
            .from('profiles')
            .select('slack_webhook, display_name, avatar_url')
            .eq('id', post.user_id)
            .single();

          if (profile?.slack_webhook) {
            console.log(`[CRON] Slack webhook found for user ${post.user_id}`);
            const payload = {
              content: post.content,
              webhookUrl: profile.slack_webhook,
              username: profile.display_name || 'Powered by Ozigi',
              icon_url: profile.avatar_url || 'https://ozigi.app/logo.png'
            };
            console.log('[CRON] Sending to Slack endpoint with payload:', payload);
            const res = await fetch(`${APP_URL}/api/publish/slack`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            const data = await res.json();
            console.log('[CRON] Slack response:', data);
            publishSuccess = res.ok;
            publishError = data.error || null;
          } else {
            console.log(`[CRON] No Slack webhook for user ${post.user_id}`);
            publishSuccess = false;
            publishError = "No Slack webhook configured";
          }
        }

        // Update post status (except X which stays pending)
        if (post.platform !== 'x') {
          await supabase
            .from("scheduled_posts")
            .update({
              status: publishSuccess ? "published" : "failed",
              published_at: publishSuccess ? now : null,
              error_message: publishError
            })
            .eq("id", post.id);
        }

        results.push({
          id: post.id,
          platform: post.platform,
          success: publishSuccess,
          error: publishError
        });

      } catch (postError: any) {
        await supabase
          .from("scheduled_posts")
          .update({
            status: "failed",
            error_message: postError.message
          })
          .eq("id", post.id);

        results.push({
          id: post.id,
          success: false,
          error: postError.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    });

  } catch (error: any) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
