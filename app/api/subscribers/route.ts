import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch subscribers for this user
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('id, email, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ subscribers });
  } catch (error: any) {
    console.error("Error fetching subscribers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { emails } = await req.json(); // Expecting an array of email strings

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "No emails provided" }, { status: 400 });
    }

    // Validate emails and prepare insert data
    const validEmails = emails
      .map(e => e.trim().toLowerCase())
      .filter(e => e.includes('@') && e.length > 3);

    if (validEmails.length === 0) {
      return NextResponse.json({ error: "No valid email addresses" }, { status: 400 });
    }

    const subscribersToInsert = validEmails.map(email => ({
      user_id: user.id,
      email,
      status: 'active'
    }));

    // Use upsert to avoid duplicates (if email already exists, do nothing)
    const { data, error } = await supabase
      .from('subscribers')
      .upsert(subscribersToInsert, { onConflict: 'user_id, email', ignoreDuplicates: true })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, added: data });
  } catch (error: any) {
    console.error("Error adding subscribers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}