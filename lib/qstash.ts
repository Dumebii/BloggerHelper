import { Client, Receiver } from "@upstash/qstash";

// QStash client for scheduling HTTP requests
export const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

// Receiver for verifying incoming QStash requests
export const qstashReceiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

/**
 * Schedule a post to be published at an exact time
 * @param postId - The ID of the scheduled post
 * @param scheduledFor - ISO string of when to publish
 * @returns The QStash message ID
 */
export async function schedulePostWithQStash(
  postId: string,
  scheduledFor: string
): Promise<string> {
  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const publishUrl = `${appUrl}/api/qstash/publish`;
  
  // Calculate delay in seconds from now
  const scheduledTime = new Date(scheduledFor).getTime();
  const now = Date.now();
  const delaySeconds = Math.max(0, Math.floor((scheduledTime - now) / 1000));
  
  const response = await qstashClient.publishJSON({
    url: publishUrl,
    body: { postId },
    delay: delaySeconds,
    retries: 3,
  });
  
  console.log(`[QStash] Scheduled post ${postId} for ${scheduledFor} (delay: ${delaySeconds}s), messageId: ${response.messageId}`);
  
  return response.messageId;
}

/**
 * Cancel a scheduled QStash message
 * @param messageId - The QStash message ID to cancel
 */
export async function cancelQStashMessage(messageId: string): Promise<void> {
  try {
    await qstashClient.messages.delete(messageId);
    console.log(`[QStash] Cancelled message ${messageId}`);
  } catch (error) {
    console.error(`[QStash] Failed to cancel message ${messageId}:`, error);
  }
}

/**
 * Verify that an incoming request is from QStash
 */
export async function verifyQStashRequest(
  signature: string,
  body: string
): Promise<boolean> {
  try {
    const isValid = await qstashReceiver.verify({
      signature,
      body,
    });
    return isValid;
  } catch (error) {
    console.error("[QStash] Signature verification failed:", error);
    return false;
  }
}
