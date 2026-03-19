import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find subscriber by token
    const { data: subscriber, error: findError } = await supabase
      .from("subscribers")
      .select("*")
      .eq("token", token)
      .single();

    if (findError || !subscriber) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
    }

    // Update status to unsubscribed
    const { error: updateError } = await supabase
      .from("subscribers")
      .update({ status: "unsubscribed" })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Failed to unsubscribe:", updateError);
      return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
    }

    // Redirect to a confirmation page (or just return a simple message)
    return new Response(
      `<html><body style="font-family: sans-serif; text-align: center; padding: 2rem;">
        <h1>Unsubscribed</h1>
        <p>You have been unsubscribed from this newsletter. You will no longer receive emails.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}