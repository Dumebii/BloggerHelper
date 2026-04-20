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
    const { text, userId, imageUrl, documentBase64, documentTitle, accessToken: providedToken } = await req.json();
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
      let isDocument = false;

      // Upload PDF document (carousel) if present
      if (documentBase64) {
        isDocument = true;

        let pdfBase64 = documentBase64;
        if (pdfBase64.includes("data:")) {
          pdfBase64 = pdfBase64.split(",")[1] || pdfBase64;
        }
        const pdfBuffer = Buffer.from(pdfBase64, "base64");

        // Step 1: Initialize upload using the correct document endpoint
        const initRes = await fetch(
          "https://api.linkedin.com/rest/documents?action=initializeUpload",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "LinkedIn-Version": "202501",
              "X-Restli-Protocol-Version": "2.0.0",
            },
            body: JSON.stringify({
              initializeUploadRequest: {
                owner: authorUrn,
              },
            }),
          }
        );

        if (!initRes.ok) {
          const errText = await initRes.text();
          throw new Error(
            `Failed to initialize document upload: ${initRes.status} ${errText}`
          );
        }

        const initData = await initRes.json();
        const uploadUrl = initData.value?.uploadUrl;
        const documentUrn = initData.value?.document;

        if (!uploadUrl || !documentUrn) {
          throw new Error("LinkedIn did not return an upload URL for the document.");
        }

        // Step 2: Upload the PDF bytes
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/octet-stream",
          },
          body: pdfBuffer,
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          throw new Error(
            `Failed to upload document to LinkedIn: ${uploadRes.status} ${errorText}`
          );
        }

        // Step 3: Set assetUrn to the document URN for the post payload
        assetUrn = documentUrn;

        // LinkedIn needs time to process the document
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

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
      // Document posts must use the newer /rest/posts API; image/text posts use /v2/ugcPosts
      let postRes: Response;

      if (isDocument && assetUrn) {
        // Use /rest/posts for document (carousel) posts
        const restPostPayload = {
          author: authorUrn,
          commentary: text,
          visibility: "PUBLIC",
          distribution: {
            feedDistribution: "MAIN_FEED",
            targetEntities: [],
            thirdPartyDistributionChannels: [],
          },
          content: {
            media: {
              title: documentTitle || "Carousel",
              id: assetUrn,
            },
          },
          lifecycleState: "PUBLISHED",
          isReshareDisabledByAuthor: false,
        };

        postRes = await fetch("https://api.linkedin.com/rest/posts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
            "LinkedIn-Version": "202501",
          },
          body: JSON.stringify(restPostPayload),
        });
      } else {
        // Use /v2/ugcPosts for image or text-only posts
        let shareMediaCategory: string;
        let media: any[];

        if (assetUrn) {
          shareMediaCategory = "IMAGE";
          media = [{ status: "READY", media: assetUrn }];
        } else {
          shareMediaCategory = "NONE";
          media = [];
        }

        const ugcPostPayload = {
          author: authorUrn,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text },
              shareMediaCategory,
              media,
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        };

        postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
            "LinkedIn-Version": "202501",
          },
          body: JSON.stringify(ugcPostPayload),
        });
      }

      if (!postRes.ok) {
        const errText = await postRes.text();
        throw new Error(`Failed to create post: ${postRes.status} ${errText}`);
      }

      // /rest/posts returns 201 with no body; /v2/ugcPosts returns JSON
      let postData: any = {};
      const contentType = postRes.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        postData = await postRes.json();
      }
      console.log("[v0] Post created successfully", { isDocument });
      return postData;
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
