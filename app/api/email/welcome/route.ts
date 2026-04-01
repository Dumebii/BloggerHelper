import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { SendMailClient } from "zeptomail";
import nodemailer from "nodemailer";
import { buildWelcomeEmail } from "@/lib/email-templates";

const USE_SMTP = !!process.env.SMTP_HOST;

// ZeptoMail configuration
const ZEPTOMAIL_BASE_URL = "https://api.zeptomail.com/v1.1/email";
const ZEPTOMAIL_RAW_TOKEN = process.env.ZEPTOMAIL_API_KEY!;
const mailClient = new SendMailClient({
  url: ZEPTOMAIL_BASE_URL,
  token: `Zoho-enczapikey ${ZEPTOMAIL_RAW_TOKEN}`,
});

const WELCOME_FROM_ADDRESS = process.env.WELCOME_FROM_ADDRESS || "hello@ozigi.app";
const WELCOME_FROM_NAME = process.env.WELCOME_FROM_NAME || "Ozigi";

// Secret to verify webhook calls (optional but recommended)
const WEBHOOK_SECRET = process.env.WELCOME_EMAIL_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    // Optional: Verify webhook secret if configured
    if (WEBHOOK_SECRET) {
      const authHeader = req.headers.get("authorization");
      if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();
    const { userId, email, name } = body;

    // Support both direct calls and Supabase webhook format
    let userEmail = email;
    let userName = name;
    let userIdToUse = userId;

    // Handle Supabase webhook payload format
    if (body.type === "INSERT" && body.record) {
      userIdToUse = body.record.id;
      userEmail = body.record.email;
      userName = body.record.display_name || body.record.email?.split("@")[0];
    }

    if (!userEmail) {
      // If no email provided, try to fetch from profiles
      if (userIdToUse) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, display_name")
          .eq("id", userIdToUse)
          .single();
        
        if (profile) {
          userEmail = profile.email;
          userName = userName || profile.display_name || profile.email?.split("@")[0];
        }
      }
      
      if (!userEmail) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }
    }

    console.log(`[Welcome Email] Sending to ${userEmail}`);

    const htmlBody = buildWelcomeEmail(userName);
    const subject = "Welcome to Ozigi - Let's Get Started!";

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
        from: `"${WELCOME_FROM_NAME}" <${WELCOME_FROM_ADDRESS}>`,
        to: userEmail,
        subject,
        html: htmlBody,
      });
    } else {
      await mailClient.sendMail({
        from: { address: WELCOME_FROM_ADDRESS, name: WELCOME_FROM_NAME },
        to: [{ email_address: { address: userEmail, name: userName || "" } }],
        subject,
        htmlbody: htmlBody,
      });
    }

    console.log(`[Welcome Email] Successfully sent to ${userEmail}`);

    return NextResponse.json({ success: true, email: userEmail });
  } catch (error: any) {
    console.error("[Welcome Email] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
