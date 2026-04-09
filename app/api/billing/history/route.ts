import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: payments, error } = await supabase
      .from("payment_history")
      .select("*")
      .eq("user_id", user.id)
      .order("payment_date", { ascending: false });

    if (error) {
      console.error("[Billing API] Error fetching payment history:", error);
      return NextResponse.json(
        { error: "Failed to fetch payment history" },
        { status: 500 }
      );
    }

    return NextResponse.json({ payments: payments || [] });
  } catch (error: any) {
    console.error("[Billing API] Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
