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