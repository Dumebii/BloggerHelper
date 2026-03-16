import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();
    const uniqueKey = `assets/${Date.now()}-${filename.replace(/\s+/g, '-')}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: uniqueKey,
      ContentType: contentType, 
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    

    
    const publicDomain = process.env.NEXT_PUBLIC_R2_DOMAIN || process.env.R2_ENDPOINT;
    const publicUrl = `${publicDomain}/${process.env.R2_BUCKET_NAME}/${uniqueKey}`;

    return NextResponse.json({ signedUrl, publicUrl });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}