export function buildXReminderEmail(postContent: string, intentUrl: string, dashboardUrl: string) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
      <style>
        img { max-width: 100%; height: auto; }
      </style>
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://ozigi.app/logo.png" alt="Ozigi" style="height: 40px;">
      </div>
      <h2 style="color: #0f172a; margin-top: 0; font-size: 1.5rem;">Your scheduled X post is ready 🚀</h2>
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #1d4ed8;">
        <p style="margin: 0; white-space: pre-wrap; color: #334155;">${escapeHtml(postContent)}</p>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${intentUrl}" target="_blank" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Post to X</a>
      </div>
      <p style="color: #475569; font-size: 0.875rem; text-align: center;">
        Or <a href="${dashboardUrl}" style="color: #1d4ed8;">log in to your Ozigi dashboard</a> to manage all scheduled posts.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px;">
      <p style="color: #94a3b8; font-size: 0.75rem; text-align: center;">
        You're receiving this because you scheduled a post on Ozigi.
      </p>
    </div>
  `;
}

export function buildNewsletterEmail(
  body: string,
  unsubscribeLink: string,
  replyTo?: string,
  senderName?: string,
  isWebView = false,
  postId?: string
) {
  const senderDisplay = senderName || 'Ozigi Newsletter';
  const viewInBrowserLink = postId ? `${process.env.APP_URL}/email/${postId}` : '';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden;">
      <div style="background: #fafafa; padding: 24px 32px; text-align: center; border-bottom: 1px solid #e2e8f0;">
        <img src="https://ozigi.app/logo.png" alt="Ozigi" style="height: 32px;">
      </div>
      <div style="padding: 32px; font-size: 16px; line-height: 1.5;">
        ${body}
      </div>
      <div style="background: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b;">
        <p style="margin: 0 0 8px 0;">
          You're receiving this because you subscribed to ${senderDisplay}.
        </p>
        ${!isWebView && unsubscribeLink ? `<p style="margin: 0;"><a href="${unsubscribeLink}" style="color: #ef4444; text-decoration: none;">Unsubscribe</a></p>` : ''}
        ${replyTo ? `<p style="margin-top: 8px;">Reply to: ${replyTo}</p>` : ''}
        <p style="margin-top: 8px;">Powered by Ozigi with ❤️</p>
        ${!isWebView && viewInBrowserLink ? `<p style="margin-top: 8px;"><a href="${viewInBrowserLink}" style="color: #1d4ed8;">View in browser</a></p>` : ''}
      </div>
    </div>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildWelcomeEmail(userName?: string) {
  const displayName = userName || 'there';
  const dashboardUrl = `${process.env.APP_URL || 'https://ozigi.app'}/dashboard`;
  const docsUrl = `${process.env.APP_URL || 'https://ozigi.app'}/docs`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5;">
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 32px; text-align: center;">
            <img src="https://ozigi.app/logo.png" alt="Ozigi" style="height: 48px; margin-bottom: 16px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to Ozigi!</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 32px;">
            <p style="font-size: 18px; color: #0f172a; margin: 0 0 24px 0;">
              Hey ${escapeHtml(displayName)},
            </p>
            <p style="font-size: 16px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
              Welcome to Ozigi - your AI-powered marketing companion. We&apos;re excited to have you on board!
            </p>
            
            <!-- Features -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h3 style="color: #0f172a; margin: 0 0 16px 0; font-size: 16px;">Here&apos;s what you can do:</h3>
              <ul style="margin: 0; padding: 0 0 0 20px; color: #475569; line-height: 2;">
                <li>Generate AI-powered marketing campaigns in seconds</li>
                <li>Schedule posts to X, LinkedIn, Discord, and Slack</li>
                <li>Send beautiful email newsletters to your subscribers</li>
                <li>Analyze your content with AI insights</li>
              </ul>
            </div>
            
            <!-- CTA -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${dashboardUrl}" style="background: #0f172a; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
            
            <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 24px 0 0 0;">
              Need help getting started? Check out our <a href="${docsUrl}" style="color: #1d4ed8; text-decoration: none;">documentation</a> or reply to this email - we&apos;re here to help!
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              You&apos;re receiving this because you signed up for Ozigi.<br>
              Made with care by the Ozigi team.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function buildPromotionalEmail(
  subject: string,
  headline: string,
  body: string,
  ctaText?: string,
  ctaUrl?: string,
  unsubscribeUrl?: string
) {
  const appUrl = process.env.APP_URL || 'https://ozigi.app';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5;">
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="padding: 32px 32px 0; text-align: center;">
            <img src="https://ozigi.app/logo.png" alt="Ozigi" style="height: 40px;">
          </div>
          
          <!-- Content -->
          <div style="padding: 32px;">
            <h1 style="color: #0f172a; margin: 0 0 24px 0; font-size: 24px; font-weight: 700; text-align: center;">
              ${escapeHtml(headline)}
            </h1>
            <div style="font-size: 16px; color: #475569; line-height: 1.6;">
              ${body}
            </div>
            
            ${ctaText && ctaUrl ? `
            <div style="text-align: center; margin: 32px 0 16px;">
              <a href="${ctaUrl}" style="background: #0f172a; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                ${escapeHtml(ctaText)}
              </a>
            </div>
            ` : ''}
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">
              You&apos;re receiving this because you have an account on Ozigi.
            </p>
            ${unsubscribeUrl ? `
            <p style="margin: 0;">
              <a href="${unsubscribeUrl}" style="color: #ef4444; font-size: 12px; text-decoration: none;">Unsubscribe from promotional emails</a>
            </p>
            ` : ''}
            <p style="color: #94a3b8; font-size: 11px; margin: 12px 0 0 0;">
              Ozigi - AI-Powered Marketing
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
