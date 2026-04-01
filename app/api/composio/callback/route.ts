import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const connectedAccountId = url.searchParams.get('connectedAccountId');
  const status = url.searchParams.get('status');
  const appName = url.searchParams.get('appName');

  // First, try to get the user from the session (they are already logged in)
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { /* no-op */ },
      },
    },
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('User not authenticated in callback');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?composio=error`);
  }

  // Case 1: Final redirect from Composio after successful OAuth (v3)
  if (connectedAccountId && status === 'success' && appName === 'github') {
    try {
      // Store the connection in Supabase
      const { error: upsertError } = await supabase.from('user_composio_connections').upsert({
        user_id: user.id,
        connection_id: connectedAccountId,
        app: 'github',
        updated_at: new Date().toISOString(),
      });

      if (upsertError) {
        console.error('Supabase upsert error:', upsertError);
        throw upsertError;
      }

      console.log('✅ GitHub connection stored for user', user.id);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?composio=success`);
    } catch (error) {
      console.error('Error storing connection:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?composio=error`);
    }
  }

  // Case 2: Standard OAuth2 callback (code + state) – fallback for other flows
  if (code && state) {
    try {
      // Exchange code for connection (using the exchangeCode function we had)
      // For now, we can just redirect to error because we expect the new flow
      console.log('Received code/state – this should not happen for GitHub v3');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?composio=error`);
    } catch (error) {
      console.error('Exchange error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?composio=error`);
    }
  }

  // If neither case matches, it's an error
  console.error('Callback missing expected parameters');
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?composio=error`);
}