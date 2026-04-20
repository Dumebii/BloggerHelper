import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

console.log("Auth callback called, code present:", !!code);
  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignored if middleware handles it
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log("Exchange result:", { data, error });

    if (!error && data.user) {
      // Fire and forget: send welcome email
          console.log("User signed in:", data.user.email);

      const user = data.user
      const userEmail = user.email
      const userName = user.user_metadata?.full_name || userEmail?.split('@')[0] || 'there'
      
      fetch(`${origin}/api/send-welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': process.env.CRON_SECRET ?? '',
        },
        body: JSON.stringify({ email: userEmail, name: userName }),
      }).catch(err => console.error('Welcome email fetch error:', err))

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  console.error("Exchange failed, redirecting to error");
  return NextResponse.redirect(`${origin}/auth-error`)
}