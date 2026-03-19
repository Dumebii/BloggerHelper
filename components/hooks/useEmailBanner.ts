import { useState } from "react";

export function useEmailBanner(initialNeedsEmail: boolean) {
  const [needsEmail, setNeedsEmail] = useState(initialNeedsEmail);
  const dismissBanner = () => setNeedsEmail(false);
  return { needsEmail, setNeedsEmail, dismissBanner };
}