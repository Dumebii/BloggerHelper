import { SendMailClient } from "zeptomail";
import fs from "fs";
import path from "path";

const ZEPTOMAIL_BASE_URL = "https://api.zeptomail.com/v1.1/email";
const ZEPTOMAIL_RAW_TOKEN = process.env.ZEPTOMAIL_API_KEY!;

const mailClient = new SendMailClient({
  url: ZEPTOMAIL_BASE_URL,
  token: `Zoho-enczapikey ${ZEPTOMAIL_RAW_TOKEN}`,
});

// Hardcoded sender - never use personal emails or environment overrides
const EMAIL_FROM_ADDRESS = 'hello@ozigi.app';
const EMAIL_FROM_NAME = 'Ozigi';

export async function sendWelcomeEmail(to: string, name: string) {
  // In development, just log the email
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] Would send welcome email to ${to} (name: ${name})`);
    console.log(`[DEV] Email content would be sent from ${EMAIL_FROM_ADDRESS} (${EMAIL_FROM_NAME})`);
    return;
  }

  try {
    const templatePath = path.join(process.cwd(), 'emails', 'welcome.html');
    let html = fs.readFileSync(templatePath, 'utf8');
    html = html.replace(/{{name}}/g, name);
    
    const response = await mailClient.sendMail({
      from: {
        address: EMAIL_FROM_ADDRESS,
        name: EMAIL_FROM_NAME,
      },
      to: [
        {
          email_address: {
            address: to,
            name: name,
          },
        },
      ],
      subject: "Welcome to Ozigi — Your Content Engine is Ready",
      htmlbody: html,
    });
    
    console.log(`Welcome email sent to ${to}`, response);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}
