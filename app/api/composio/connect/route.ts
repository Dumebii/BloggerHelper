import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Composio } from '@composio/core';

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY! });

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() { /* no-op */ }
        },
      },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Updated to match the strict v3 positional arguments
    const connection = await composio.connectedAccounts.initiate(
      user.id,      // 1st argument: userId
      'ac_zubG7rrLSvvw',     // 2nd argument: authConfigId
      {             // 3rd argument: options
        allowMultiple: true, // 👈 Add this line!
        callbackUrl: process.env.NEXT_PUBLIC_APP_URL 
          ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` 
          : 'http://localhost:3000/dashboard'
      }
    );

    return NextResponse.json({ url: connection.redirectUrl });
    
  } catch (error: any) {
    console.error('Composio auth error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}