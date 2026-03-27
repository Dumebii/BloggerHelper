"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface TrialBannerProps {
  trialEndsAt: Date;
  onUpgradeClick: () => void;
}

export default function TrialBanner({ trialEndsAt, onUpgradeClick }: TrialBannerProps) {
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const now = new Date();
    const end = new Date(trialEndsAt);
    const diffMs = end.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    setDaysLeft(days);
  }, [trialEndsAt]);

  if (!isVisible || daysLeft <= 0) return null;

  let message = "";
  if (daysLeft === 7) message = "Your Pro trial is active — 7 days left";
  else if (daysLeft <= 3 && daysLeft > 1) message = `Your Pro trial ends in ${daysLeft} days`;
  else if (daysLeft === 1) message = "Your Pro trial ends tomorrow — upgrade to keep access";

  return (
    <div className="bg-brand-navy text-white px-4 py-3 rounded-xl flex items-center justify-between text-sm font-medium shadow-sm border border-brand-red/30">
      <span>{message}</span>
      <div className="flex items-center gap-4">
        <button
          onClick={onUpgradeClick}
          className="bg-brand-red text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-opacity-90 transition-colors"
        >
          Upgrade
        </button>
        <button onClick={() => setIsVisible(false)} className="text-white/80 hover:text-white">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}