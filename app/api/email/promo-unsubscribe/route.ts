import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return new NextResponse(renderPage("Missing user ID", false), {
        headers: { "Content-Type": "text/html" },
        status: 400,
      });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("profiles")
      .update({ promo_unsubscribed: true, promo_unsubscribed_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("[Promo Unsubscribe] Error:", error);
      return new NextResponse(renderPage("Something went wrong. Please try again.", false), {
        headers: { "Content-Type": "text/html" },
        status: 500,
      });
    }

    return new NextResponse(renderPage("You have been unsubscribed from promotional emails.", true), {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error: any) {
    console.error("[Promo Unsubscribe] Error:", error);
    return new NextResponse(renderPage("Something went wrong. Please try again.", false), {
      headers: { "Content-Type": "text/html" },
      status: 500,
    });
  }
}

function renderPage(message: string, success: boolean) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${success ? "Unsubscribed" : "Error"} - Ozigi</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 500px; margin: 100px auto; padding: 40px 20px; text-align: center;">
        <div style="background: #ffffff; border-radius: 16px; padding: 48px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <img src="https://ozigi.app/logo.png" alt="Ozigi" style="height: 40px; margin-bottom: 24px;">
          <div style="font-size: 48px; margin-bottom: 16px;">
            ${success ? "✓" : "✕"}
          </div>
          <h1 style="color: #0f172a; font-size: 24px; margin: 0 0 16px 0;">
            ${success ? "Unsubscribed" : "Error"}
          </h1>
          <p style="color: #64748b; font-size: 16px; margin: 0 0 24px 0;">
            ${message}
          </p>
          <a href="${process.env.APP_URL || "https://ozigi.app"}" style="color: #1d4ed8; text-decoration: none; font-size: 14px;">
            Go to Ozigi
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
}
