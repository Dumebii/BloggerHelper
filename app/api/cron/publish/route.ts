import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { SendMailClient } from "zeptomail";
import nodemailer from 'nodemailer';

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

const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'notifications@ozigi.app';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Ozigi';

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
          // Fetch user profile for sender name and reply-to
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email, email_sender_name')
            .eq('id', post.user_id)
            .single();

          const senderName = profile?.email_sender_name || 'Ozigi User';
          const replyTo = profile?.email || 'support@ozigi.app';

          // Fetch active subscribers for this user
          const { data: subscribers, error: subsError } = await supabase
            .from('subscribers')
            .select('email, token')
            .eq('user_id', post.user_id)
            .eq('status', 'active');

          if (subsError || !subscribers || subscribers.length === 0) {
            publishSuccess = true; // nothing to send
          } else {
            const emailContent = post.content;
            const subjectMatch = emailContent.match(/^Subject:\s*(.+)$/m);
            const subject = subjectMatch ? subjectMatch[1] : 'Your Ozigi Newsletter';
            const body = emailContent.replace(/^Subject:\s*.+\n/, ''); // remove subject line

            const unsubscribeUrlBase = `${APP_URL}/api/unsubscribe?token=`;

            for (const subscriber of subscribers) {
              const unsubscribeLink = unsubscribeUrlBase + subscriber.token;
              const htmlBody = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  ${body.replace(/\n/g, '<br/>')}
                  <hr style="margin: 2rem 0; border: 0; border-top: 1px solid #e2e8f0;" />
                  <p style="font-size: 0.875rem; color: #64748b;">
                    You're receiving this because you subscribed to this newsletter.
                    <a href="${unsubscribeLink}" style="color: #ef4444;">Unsubscribe</a>
                  </p>
                </div>
              `;

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
                    from: `"${senderName}" <${EMAIL_FROM_ADDRESS}>`,
                    to: subscriber.email,
                    subject,
                    html: htmlBody,
                    replyTo,
                  });
                } else {
                  await mailClient.sendMail({
                    from: {
                      address: EMAIL_FROM_ADDRESS,
                      name: senderName,
                    },
                    reply_to: [
                      {
                        email_address: {
                          address: replyTo,
                          name: '',
                        },
                      },
                    ] as any, // 👈 type assertion
                    to: [
                      {
                        email_address: {
                          address: subscriber.email,
                          name: '',
                        },
                      },
                    ] as any, // 👈 type assertion
                    subject,
                    htmlbody: htmlBody,
                  });
                }
              } catch (err: any) {
                console.error(`Failed to send email to ${subscriber.email}:`, err);
              }
            }
            publishSuccess = true;
          }
        }

        // ---------- X PLATFORM ----------
        else if (post.platform === 'x') {
          // X: Send email reminder
          if (post.user_email && !post.reminder_sent) {
            const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content)}`;

            console.log(`Attempting to send email for post ${post.id} to ${post.user_email}`);

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
                  from: `"${EMAIL_FROM_NAME}" <${process.env.SMTP_USER}>`,
                  to: post.user_email,
                  subject: 'Your scheduled X post is ready',
                  html: `
                    <h2>Your scheduled X post is due!</h2>
                    <p>Click the link below to publish it now:</p>
                    <a href="${intentUrl}" target="_blank">Post to X</a>
                    <p>Or log in to Ozigi to manage all scheduled posts.</p>
                  `,
                });
              } else {
                await mailClient.sendMail({
                  from: {
                    address: EMAIL_FROM_ADDRESS,
                    name: EMAIL_FROM_NAME,
                  },
                  to: [
                    {
                      email_address: {
                        address: post.user_email,
                        name: "",
                      },
                    },
                  ] as any,
                  subject: 'Your scheduled X post is ready',
                  htmlbody: `
                    <h2>Your scheduled X post is due!</h2>
                    <p>Click the link below to publish it now:</p>
                    <a href="${intentUrl}" target="_blank">Post to X</a>
                    <p>Or log in to Ozigi to manage all scheduled posts.</p>
                  `,
                });
              }

              await supabase
                .from("scheduled_posts")
                .update({ reminder_sent: true, status: "pending" })
                .eq("id", post.id);

              publishSuccess = true;
            } catch (emailError: any) {
              console.error(`❌ Failed to send email for post ${post.id}:`, emailError);
              publishSuccess = false;
              publishError = emailError.message;

              // Keep as pending, retry next time
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
                accessToken: linkedInToken
              })
            });
            const data = await res.json();
            publishSuccess = res.ok;
            publishError = data.error || null;
          }
        }

        // ---------- DISCORD PLATFORM ----------
        else if (post.platform === 'discord') {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('discord_webhook, display_name, avatar_url')
            .eq('id', post.user_id)
            .single();

          if (profile?.discord_webhook) {
            const res = await fetch(`${APP_URL}/api/post-discord`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                content: post.content,
                webhookUrl: profile.discord_webhook,
                userId: post.user_id,
                username: profile.display_name || 'Ozigi Bot',
                avatar_url: profile.avatar_url || 'https://ozigi.app/icon.png'
              })
            });
            const data = await res.json();
            publishSuccess = res.ok;
            publishError = data.error || null;
          } else {
            publishSuccess = false;
            publishError = "No Discord webhook configured";
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