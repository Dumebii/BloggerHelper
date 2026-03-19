"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import PricingWaitlistModal from "@/components/PricingWaitlistModal";
import AuthModal from "@/components/AuthModal";

export default function PricingPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const tiers = [
    {
      name: "Free",
      price: "$0",
      description: "Forever free. Perfect for trying Ozigi.",
      features: [
        "5 campaign generations / month",
        "1 saved persona",
        "X (Twitter) + Discord publishing",
        "URL, text & PDF ingestion",
      ],
      cta: "Get Started",
      href: "/dashboard",
      popular: false,
    },
    {
      name: "Team",
      price: "$12",
      description: "Everything in Free, plus:",
      features: [
        "30 campaign generations / month",
        "Unlimited saved personas",
        "LinkedIn OAuth publishing",
        "Native image generation (2 per campaign)",
      ],
      cta: "Join Waitlist",
      href: "#",
      popular: true,
    },
    {
      name: "Organization",
      price: "$29",
      description: "Everything in Team, plus:",
      features: [
        "Unlimited campaign generations",
        "Unlimited image generation",
        "Priority model (Gemini 2.5 Pro)",
        "Full email distribution suite",
        "AI brainstorm assistant (full context)",
        "Campaign history & analytics",
        "Early access to new features",
      ],
      cta: "Join Waitlist",
      href: "#",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900">
      {/* Simple header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-black italic uppercase tracking-tighter text-xl text-slate-900">
              Ozigi
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm"
          >
            Go to Dashboard →
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            No credit card required to start. Upgrade when you're ready to scale.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl p-8 flex flex-col ${
                tier.popular
                  ? "bg-slate-900 text-white ring-4 ring-slate-900 shadow-xl scale-105 md:scale-110"
                  : "bg-white border-2 border-slate-200 shadow-sm hover:shadow-lg transition-shadow"
              }`}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{tier.price}</span>
                  {tier.price !== "$0" && (
                    <span className="text-sm font-medium text-slate-500">
                      /month
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm mt-3 ${
                    tier.popular ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      size={18}
                      className={
                        tier.popular
                          ? "text-green-400 shrink-0 mt-0.5"
                          : "text-green-600 shrink-0 mt-0.5"
                      }
                    />
                    <span
                      className={
                        tier.popular ? "text-slate-200" : "text-slate-600"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {tier.name === "Free" ? (
                <button
                  onClick={handleGetStarted}
                  className="block w-full bg-slate-900 text-white text-center py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-colors"
                >
                  {tier.cta}
                </button>
              ) : (
                <button
                  onClick={() => setIsWaitlistOpen(true)}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-colors ${
                    tier.popular
                      ? "bg-white text-slate-900 hover:bg-slate-100"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {tier.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Cost transparency note */}
        <div className="mt-16 text-center text-sm text-slate-400 max-w-2xl mx-auto border-t border-slate-200 pt-8">
          <p>
            Based on actual usage, a Team user costs us ~$2.55/month – we price
            transparently to build trust. Organization users get the highest
            performance tier with all features unlocked.
          </p>
        </div>
      </main>

      {isWaitlistOpen && <PricingWaitlistModal onClose={() => setIsWaitlistOpen(false)} />}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  );
}