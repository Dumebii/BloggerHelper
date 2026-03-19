import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriberId = params.id;

    // Verify subscriber belongs to user
    const { data: subscriber, error: fetchError } = await supabase
      .from('subscribers')
      .select('user_id')
      .eq('id', subscriberId)
      .single();

    if (fetchError || !subscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    if (subscriber.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete (or mark as unsubscribed – we'll delete for simplicity)
    const { error } = await supabase
      .from('subscribers')
      .delete()
      .eq('id', subscriberId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting subscriber:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}