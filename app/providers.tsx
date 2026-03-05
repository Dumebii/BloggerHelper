"use client";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

// Initialize PostHog safely only on the client side
if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false, // We will handle pageviews manually in Next.js if needed, or leave true for basic tracking
  });
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
