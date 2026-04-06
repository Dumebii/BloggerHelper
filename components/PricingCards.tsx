"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Check } from "lucide-react";

interface PricingTier {
  name: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  description: string;
  features: string[];
  badge?: string;
  buttonText: string;
  planId: "free" | "team" | "organization" | "enterprise";
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Try the engine",
    features: [
      "5 campaigns/month",
      "X, LinkedIn, Discord publishing",
      "1 saved persona",
      "Image generation (upgrade)",
      "Email newsletter (upgrade)",
      "Ozigi Copilot (upgrade)",
    ],
    buttonText: "Get Started",
    planId: "free",
  },
  {
    name: "Team",
    priceMonthly: 15,
    priceYearly: 144,
    description: "For serious creators",
    features: [
      "30 campaigns/month",
      "X, LinkedIn, Discord, Slack",
      "Unlimited personas",
      "Image generation (2/campaign)",
      "Email newsletter generation",
      "Scheduling & X email reminder",
      "Newsletter sending (500 sends/mo)",
      "Subscriber list management (upgrade)",
    ],
    badge: "Most popular",
    buttonText: "Upgrade to Team",
    planId: "team",
    popular: true,
  },
  {
    name: "Organization",
    priceMonthly: 39,
    priceYearly: 374.40,
    description: "Full power, no limits",
    features: [
      "Unlimited campaigns",
      "All platforms + Slack",
      "Unlimited personas",
      "Unlimited image generation",
      "Email newsletter generation & sending (unlimited)",
      "Ozigi Copilot (full context)",
      "Subscriber list management",
      "reply_to routing",
      "Priority model access",
      "Campaign analytics",
      "Early access features",
    ],
    buttonText: "Upgrade to Organization",
    planId: "organization",
  },
  {
    name: "Enterprise",
    priceMonthly: null,
    priceYearly: null,
    description: "Contact sales",
    features: [
      "Everything in Organization, plus",
      "Custom campaign volume",
      "Custom send limits",
      "Dedicated onboarding",
      "SLA + uptime guarantee",
      "Custom persona library",
      "Team workspace + roles",
      "White-label option",
      "API access",
      "Dedicated Slack support",
      "Annual billing available",
    ],
    buttonText: "Contact Sales",
    planId: "enterprise",
  },
];

interface PricingCardsProps {
  onOpenAuthModal?: () => void;
}

export default function PricingCards({ onOpenAuthModal }: PricingCardsProps) {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const router = useRouter();

  const handleUpgrade = async (plan: string, interval: "monthly" | "yearly") => {
    const { data: { session } } = await supabase.auth.getSession();

    if (plan === "free") {
      if (!session) {
        onOpenAuthModal?.();
        return;
      }
      router.push("/dashboard");
      return;
    }

    if (plan === "enterprise") {
      window.location.href = "mailto:hello@ozigi.app?subject=Enterprise Inquiry";
      return;
    }

    if (!session) {
      onOpenAuthModal?.();
      return;
    }

    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("Failed to create checkout. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-white border border-slate-200 rounded-full p-1 shadow-sm">
          <button
            onClick={() => setBillingInterval("monthly")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              billingInterval === "monthly"
                ? "bg-brand-navy text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval("yearly")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              billingInterval === "yearly"
                ? "bg-brand-navy text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Yearly
            <span className="ml-1 text-xs font-normal text-green-600">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {tiers.map((tier) => {
          const price = billingInterval === "monthly" ? tier.priceMonthly : tier.priceYearly;
          const priceDisplay = price === null ? "Custom" : `$${price}`;
          const periodDisplay = billingInterval === "monthly" ? "/month" : "/year";
          const isFree = tier.planId === "free";
          const isEnterprise = tier.planId === "enterprise";
          const showPeriod = !isFree && !isEnterprise && price !== null;

          return (
            <div
              key={tier.name}
              className={`rounded-xl p-4 md:p-5 flex flex-col h-full transition-all ${
                tier.popular
                  ? "bg-brand-navy text-white ring-2 ring-brand-red shadow-lg md:scale-105"
                  : "bg-white border border-slate-200 shadow-sm hover:shadow-md"
              }`}
            >
              {tier.badge && (
                <span className="inline-block text-xs font-bold uppercase tracking-widest bg-brand-red text-white px-2 py-0.5 rounded-full self-start mb-3">
                  {tier.badge}
                </span>
              )}
              <h3 className="text-lg font-black italic uppercase tracking-tighter mb-1">
                {tier.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-black">{priceDisplay}</span>
                {showPeriod && (
                  <span className={`text-xs ${tier.popular ? "text-slate-300" : "text-slate-500"}`}>
                    {periodDisplay}
                  </span>
                )}
              </div>
              <p className={`text-xs mb-3 ${tier.popular ? "text-slate-300" : "text-slate-500"}`}>
                {tier.description}
              </p>
              <hr className={`my-3 ${tier.popular ? "border-slate-700" : "border-slate-100"}`} />
              <ul className="space-y-2 flex-1 mb-4">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs">
                    <Check size={14} className={`${tier.popular ? "text-brand-red" : "text-brand-red"} shrink-0 mt-0.5`} />
                    <span className={tier.popular ? "text-slate-200" : "text-slate-600"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(tier.planId, billingInterval)}
                className={`w-full py-2 rounded-lg font-bold uppercase tracking-widest text-xs transition-all ${
                  tier.popular
                    ? "bg-white text-brand-navy hover:bg-slate-100"
                    : isFree || isEnterprise
                    ? "bg-slate-100 text-slate-900 hover:bg-slate-200"
                    : "bg-brand-navy text-white hover:bg-opacity-90"
                }`}
              >
                {tier.buttonText}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
