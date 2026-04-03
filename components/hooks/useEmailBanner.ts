"use client"
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";

/**
 * Email banner should only show for users who:
 * 1. Signed up via X/Twitter OAuth (no email provided by default)
 * 2. Don't have an email address on their account
 */
export function useEmailBanner(session: Session | null) {
  const [needsEmail, setNeedsEmail] = useState(false);
  
  useEffect(() => {
    if (!session?.user) {
      setNeedsEmail(false);
      return;
    }
    
    // Check if user signed up via X/Twitter
    const provider = session.user.app_metadata?.provider;
    const providers = session.user.app_metadata?.providers || [];
    const isTwitterSignup = provider === "twitter" || providers.includes("twitter");
    
    // Check if they have an email
    const hasEmail = !!session.user.email;
    
    // Only show banner for Twitter signups without email
    setNeedsEmail(isTwitterSignup && !hasEmail);
  }, [session]);

  const dismissBanner = () => setNeedsEmail(false);
  
  return { needsEmail, setNeedsEmail, dismissBanner };
}
