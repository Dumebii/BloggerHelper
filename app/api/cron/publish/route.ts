import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { SendMailClient } from "zeptomail";

const CRON_SECRET = process.env.CRON_SECRET;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// ZeptoMail configuration
const ZEPTOMAIL_API_KEY = process.env.ZEPTOMAIL_API_KEY!;
const ZEPTOMAIL_URL = "api.zeptomail.com/";
const mailClient = new SendMailClient({ url: ZEPTOMAIL_URL, token: ZEPTOMAIL_API_KEY });

const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'notifications@ozigi.app';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Ozigi';

// Define a type for the token object (without access_secret)
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

    // 1. Fetch due posts
    const { data: duePosts, error: fetchError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .limit(50);

    if (fetchError) throw fetchError;

    // 2. Collect unique user IDs
    const userIds = [...new Set(duePosts?.map(p => p.user_id) || [])];

    // 3. Fetch user tokens (only needed for non‑X platforms)
    const { data: tokensData, error: tokensError } = await supabase
      .from("user_tokens")
      .select("user_id, provider, access_token")
      .in("user_id", userIds);

    if (tokensError) throw tokensError;

    // 4. Group tokens by user_id
    const tokensByUser = new Map<string, UserToken[]>();
    tokensData?.forEach((token: UserToken) => {
      if (!tokensByUser.has(token.user_id)) {
        tokensByUser.set(token.user_id, []);
      }
      tokensByUser.get(token.user_id)!.push(token);
    });

    const results = [];

    // 5. Process each post
    for (const post of duePosts || []) {
      try {
        // Mark as processing
        await supabase
          .from("scheduled_posts")
          .update({ status: "processing" })
          .eq("id", post.id);

        let publishSuccess = false;
        let publishError: string | null = null;

        if (post.platform === 'x') {
          // X: Send email reminder
          if (post.user_email && !post.reminder_sent) {
            const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content)}`;

            console.log(`Attempting to send email for post ${post.id} to ${post.user_email}`);

            try {
              const emailResp = await mailClient.sendMail({
                from: {
                  address: EMAIL_FROM_ADDRESS,
                  name: EMAIL_FROM_NAME
                },
                to: [
                  {
                    email_address: {
                      address: post.user_email,
                      name: ""
                    }
                  }
                ],
                subject: 'Your scheduled X post is ready',
                htmlbody: `
                  <h2>Your scheduled X post is due!</h2>
                  <p>Click the link below to publish it now:</p>
                  <a href="${intentUrl}" target="_blank">Post to X</a>
                  <p>Or log in to Ozigi to manage all scheduled posts.</p>
                `
              });

              console.log(`Email sent successfully for post ${post.id}`, JSON.stringify(emailResp));

              await supabase
                .from("scheduled_posts")
                .update({ reminder_sent: true, status: "pending" })
                .eq("id", post.id);

              publishSuccess = true;
            } catch (emailError: any) {
              console.error(`❌ Failed to send email for post ${post.id}:`);
              console.error("Error name:", emailError.name);
              console.error("Error message:", emailError.message);
              console.error("Error stack:", emailError.stack);
              console.error("Full error object:", JSON.stringify(emailError, Object.getOwnPropertyNames(emailError)));

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
        else if (post.platform === 'discord') {
          const { data: user } = await supabase
            .from('users')
            .select('user_metadata')
            .eq('id', post.user_id)
            .single();

          if (user?.user_metadata?.discord_webhook) {
            const res = await fetch(`${APP_URL}/api/post-discord`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                content: post.content,
                webhookUrl: user.user_metadata.discord_webhook
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

        // Update status for non‑X platforms
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