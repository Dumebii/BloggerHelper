import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { SendMailClient } from "zeptomail";
import nodemailer from "nodemailer";
import { buildPromotionalEmail } from "@/lib/email-templates";

const USE_SMTP = !!process.env.SMTP_HOST;

// ZeptoMail configuration
const ZEPTOMAIL_BASE_URL = "https://api.zeptomail.com/v1.1/email";
const ZEPTOMAIL_RAW_TOKEN = process.env.ZEPTOMAIL_API_KEY!;
const mailClient = new SendMailClient({
  url: ZEPTOMAIL_BASE_URL,
  token: `Zoho-enczapikey ${ZEPTOMAIL_RAW_TOKEN}`,
});

// Hardcoded sender - never use personal emails or environment overrides
const PROMO_FROM_ADDRESS = "hello@ozigi.app";
const PROMO_FROM_NAME = "Ozigi";

// Admin secret to authorize promotional email sends
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function POST(req: Request) {
  try {
    // Require admin authorization
    const authHeader = req.headers.get("authorization");
    if (!ADMIN_SECRET || authHeader !== `Bearer ${ADMIN_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      subject, 
      headline, 
      bodyContent, 
      ctaText, 
      ctaUrl,
      // Targeting options
      targetAll = false,
      targetUserIds = [],
      targetPlan,
      excludeUnsubscribed = true,
      testEmail, // Send to single email for testing
    } = body;

    if (!subject || !headline || !bodyContent) {
      return NextResponse.json({ 
        error: "Missing required fields: subject, headline, bodyContent" 
      }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // If test email, just send to that one address
    if (testEmail) {
      const htmlBody = buildPromotionalEmail(
        subject,
        headline,
        bodyContent,
        ctaText,
        ctaUrl
      );

      await sendEmail(testEmail, subject, htmlBody);
      
      return NextResponse.json({ 
        success: true, 
        test: true,
        sentTo: testEmail 
      });
    }

    // Build query for target users
    let query = supabase
      .from("profiles")
      .select("id, email, display_name, promo_unsubscribed");

    if (!targetAll && targetUserIds.length > 0) {
      query = query.in("id", targetUserIds);
    }

    if (targetPlan) {
      query = query.eq("plan", targetPlan);
    }

    const { data: users, error: usersError } = await query;

    if (usersError) {
      throw usersError;
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No users match the criteria",
        sentCount: 0 
      });
    }

    // Filter out unsubscribed users if requested
    let targetUsers = users;
    if (excludeUnsubscribed) {
      targetUsers = users.filter(u => !u.promo_unsubscribed);
    }

    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    };

    const APP_URL = process.env.APP_URL || "https://ozigi.app";

    for (const user of targetUsers) {
      if (!user.email) {
        results.skipped++;
        continue;
      }

      try {
        // Generate personalized unsubscribe URL
        const unsubscribeUrl = `${APP_URL}/api/email/promo-unsubscribe?userId=${user.id}`;
        
        const htmlBody = buildPromotionalEmail(
          subject,
          headline,
          bodyContent,
          ctaText,
          ctaUrl,
          unsubscribeUrl
        );

        await sendEmail(user.email, subject, htmlBody);
        results.sent++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err: any) {
        results.failed++;
        results.errors.push(`${user.email}: ${err.message}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      results,
      totalTargeted: targetUsers.length,
    });
  } catch (error: any) {
    console.error("[Promotional Email] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function sendEmail(to: string, subject: string, htmlBody: string) {
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
      from: `"${PROMO_FROM_NAME}" <${PROMO_FROM_ADDRESS}>`,
      to,
      subject,
      html: htmlBody,
    });
  } else {
    await mailClient.sendMail({
      from: { address: PROMO_FROM_ADDRESS, name: PROMO_FROM_NAME },
      to: [{ email_address: { address: to, name: "" } }],
      subject,
      htmlbody: htmlBody,
    });
  }

  console.log(`[Promotional Email] Sent to ${to}`);
}
