import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, userId, imageUrl } = await req.json();
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // ✨ 1. The ultra-lean, crash-proof query
    const { data: tokenData, error: tokenError } = await supabase
      .from("user_tokens")
      .select("access_token")
      .eq("user_id", userId)
      .in("provider", ["linkedin", "linkedin_oidc"])
      .limit(1)
      .maybeSingle();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        {
          error: `Database failed to find token: ${
            tokenError?.message || "No row found."
          }`,
        },
        { status: 401 }
      );
    }

    const linkedInToken = tokenData.access_token;

    // ✨ 2. Fetch the user's ID directly from LinkedIn on the fly
    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${linkedInToken}` },
    });

    if (!profileRes.ok) {
      throw new Error("Failed to authenticate token with LinkedIn.");
    }

    const profileData = await profileRes.json();
    const authorUrn = `urn:li:person:${profileData.sub}`;

    let assetUrn: string | undefined = undefined;

    // ✨ 3. The 3-Step Image Handshake
    if (imageUrl) {
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");

      // Step A: Register the Upload
      const registerRes = await fetch(
        "https://api.linkedin.com/v2/assets?action=registerUpload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${linkedInToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
              owner: authorUrn,
              serviceRelationships: [
                {
                  relationshipType: "OWNER",
                  identifier: "urn:li:userGeneratedContent",
                },
              ],
            },
          }),
        }
      );

      const registerData = await registerRes.json();
      const uploadUrl =
        registerData.value.uploadMechanism[
          "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ].uploadUrl;
      assetUrn = registerData.value.asset;

      // Step B: Upload the binary data
      // 🚨 CRITICAL: Do NOT send the Authorization header here!
      // This is an Amazon S3 URL, and it will reject the LinkedIn token.
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: imageBuffer,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error("Image Upload Failed:", errorText);
        throw new Error(
          "Failed to upload the image file to LinkedIn's server."
        );
      }
    }

    // ✨ THE FIX: Force a 2.5-second delay to let LinkedIn process the S3 file
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // ✨ 4. Create the Post
    const postPayload: any = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: text },
          shareMediaCategory: assetUrn ? "IMAGE" : "NONE",
          media: assetUrn ? [{ status: "READY", media: assetUrn }] : [],
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    };

    const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${linkedInToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postPayload),
    });

    const postResult = await postRes.json();

    if (!postRes.ok)
      throw new Error(postResult.message || "LinkedIn rejected the post");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("LinkedIn API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
