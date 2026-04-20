import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    // This endpoint is internal-only — only auth/callback should call it.
    const internalSecret = req.headers.get('x-internal-secret');
    const expectedSecret = process.env.CRON_SECRET ?? '';
    const secretValid =
      internalSecret !== null &&
      expectedSecret.length > 0 &&
      crypto.timingSafeEqual(Buffer.from(internalSecret), Buffer.from(expectedSecret));

    if (!secretValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    
    await sendWelcomeEmail(email, name || email.split('@')[0]);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}