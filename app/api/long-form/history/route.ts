import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all long-form generations for this user
    const { data: articles, error: fetchError } = await supabase
      .from("scheduled_posts")
      .select("id, caption, content, metadata, longform_sections, created_at")
      .eq("user_id", user.id)
      .eq("platform", "long-form")
      .order("created_at", { ascending: false })
      .limit(50);

    console.log("[LongForm History] Fetch query - user_id:", user.id);
    console.log("[LongForm History] Fetch result - articles count:", articles?.length);
    console.log("[LongForm History] Fetch error:", fetchError);

    if (fetchError) {
      console.error("[LongForm History] Fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch history" },
        { status: 500 }
      );
    }

    // Parse and format the articles
    const formattedArticles = (articles || []).map((article: any) => {
      let sections = [];
      try {
        // Get sections from the dedicated longform_sections column
        if (article.longform_sections && Array.isArray(article.longform_sections)) {
          sections = article.longform_sections;
        }
      } catch (e) {
        console.error("[LongForm History] Parse error:", e);
      }

      return {
        id: article.id,
        title: article.caption,
        content: article.content,
        metadata: article.metadata,
        totalWordCount: article.metadata?.totalWordCount || 0,
        tone: article.metadata?.tone || "unknown",
        structure: article.metadata?.structure || "unknown",
        sections,
        createdAt: article.created_at,
      };
    });

    console.log("[LongForm History] Formatted articles:", {
      count: formattedArticles.length,
      sample: formattedArticles[0] ? {
        title: formattedArticles[0].title,
        sections_count: formattedArticles[0].sections.length,
      } : null,
    });

    return NextResponse.json({
      success: true,
      articles: formattedArticles,
      count: formattedArticles.length,
    });
  } catch (error: any) {
    console.error("[LongForm History] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
