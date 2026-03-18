import { NextResponse } from "next/server";
import { SendMailClient } from "zeptomail";

export async function GET() {
// Keep the base URL without the path
const ZEPTOMAIL_BASE_URL = "https://api.zeptomail.com/v1.1/email"; // or "api.zeptomail.eu", "api.zeptomail.in"
const ZEPTOMAIL_RAW_TOKEN = process.env.ZEPTOMAIL_API_KEY!;

const mailClient = new SendMailClient({
  url: ZEPTOMAIL_BASE_URL,
  token: `Zoho-enczapikey ${ZEPTOMAIL_RAW_TOKEN}`
});
  const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'reminders@ozigi.app';
  const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Ozigi';

  try {
    const resp = await mailClient.sendMail({
      from: {
        address: EMAIL_FROM_ADDRESS,
        name: EMAIL_FROM_NAME
      },
      to: [
        {
          email_address: {
            address: "okolodumebi@gmail.com", // replace with your email
            name: "Test User"
          }
        }
      ],
      subject: 'Test Email from Ozigi',
      htmlbody: '<h1>Test</h1><p>If you see this, ZeptoMail works!</p>'
    });
    return NextResponse.json({ success: true, resp });
  } catch (error: any) {
    console.error("Test email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}