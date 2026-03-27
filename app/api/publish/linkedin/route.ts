import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function refreshLinkedInToken(refreshToken: string) {
  const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
  }

  return await response.json();
}

export async function POST(req: Request) {
  try {
    const { text, userId, imageUrl, accessToken: providedToken } = await req.json();
    const authHeader = req.headers.get("Authorization");

    let linkedInToken: string | null = null;
    let refreshToken: string | null = null;

    // Token retrieval logic (unchanged)
    if (providedToken) {
      linkedInToken = providedToken;
    } else if (userId) {
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from("user_tokens")
        .select("access_token, refresh_token")
        .eq("user_id", userId)
        .in("provider", ["linkedin", "linkedin_oidc"])
        .maybeSingle();
      if (tokenError || !tokenData) {
        return NextResponse.json({ error: `No LinkedIn token found for user ${userId}` }, { status: 401 });
      }
      linkedInToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;
    } else if (authHeader) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const { data: tokenData, error: tokenError } = await supabase
        .from("user_tokens")
        .select("access_token, refresh_token")
        .eq("user_id", user.id)
        .in("provider", ["linkedin", "linkedin_oidc"])
        .maybeSingle();
      if (tokenError || !tokenData) {
        return NextResponse.json({ error: `No LinkedIn token found for user ${user.id}` }, { status: 401 });
      }
      linkedInToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;
    } else {
      return NextResponse.json({ error: "No token, user ID, or authorization header provided" }, { status: 401 });
    }

    if (!linkedInToken) {
      return NextResponse.json({ error: "Empty LinkedIn access token" }, { status: 401 });
    }

    // Convert imageUrl to base64 if it's a public URL
    let finalImageBase64: string | undefined;
    if (imageUrl) {
      if (imageUrl.startsWith('data:')) {
        // Already a data URL
        finalImageBase64 = imageUrl;
      } else {
        // Fetch the image from the public URL
        console.log(`Fetching image from ${imageUrl}`);
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) {
          console.error(`Failed to fetch image: ${imageRes.status}`);
        } else {
          const imageBuffer = await imageRes.arrayBuffer();
          const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';
          finalImageBase64 = `data:${mimeType};base64,${Buffer.from(imageBuffer).toString('base64')}`;
          console.log(`Converted image to base64, size: ${finalImageBase64.length} bytes`);
        }
      }
    }

    // Helper to post to LinkedIn
    async function postToLinkedIn(token: string) {
      // Fetch user's LinkedIn profile
      const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!profileRes.ok) {
        throw new Error(`Failed to authenticate token with LinkedIn: ${profileRes.status}`);
      }
      const profileData = await profileRes.json();
      const authorUrn = `urn:li:person:${profileData.sub}`;

      let assetUrn: string | undefined = undefined;

      // Upload image if present
      if (finalImageBase64) {
        const base64Data = finalImageBase64.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");

        const registerRes = await fetch(
          "https://api.linkedin.com/v2/assets?action=registerUpload",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
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

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/octet-stream" },
          body: imageBuffer,
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          console.error("Image Upload Failed:", errorText);
          throw new Error("Failed to upload the image file to LinkedIn's server.");
        }

        await new Promise((resolve) => setTimeout(resolve, 2500));
      }

      // Create the post
      const postPayload = {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text },
            shareMediaCategory: assetUrn ? "IMAGE" : "NONE",
            media: assetUrn ? [{ status: "READY", media: assetUrn }] : [],
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      };

      const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(postPayload),
      });

      if (!postRes.ok) {
        const errorText = await postRes.text();
        let errorMessage = `LinkedIn API error ${postRes.status}: ${errorText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      return await postRes.json();
    }

    // Attempt to post
    let postResult;
    try {
      postResult = await postToLinkedIn(linkedInToken);
    } catch (error: any) {
      console.error("Post attempt failed:", error.message);
      if (error.message.includes("401") && refreshToken) {
        console.log("LinkedIn token expired, refreshing...");
        const newTokenData = await refreshLinkedInToken(refreshToken);
        await supabaseAdmin
          .from("user_tokens")
          .update({
            access_token: newTokenData.access_token,
            refresh_token: newTokenData.refresh_token || refreshToken,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("provider", "linkedin_oidc");
        postResult = await postToLinkedIn(newTokenData.access_token);
      } else {
        throw error;
      }
    }

    await supabaseAdmin.rpc("increment_posts_published", { user_id_input: userId });

    return NextResponse.json({
      success: true,
      postId: postResult?.id,
      message: "Post published successfully",
    });
  } catch (error: any) {
    console.error("LinkedIn API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}