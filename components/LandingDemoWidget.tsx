"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SAMPLES = [
  {
    label: "GitHub release notes",
    value: `We just shipped Ozigi v1.2. Key changes:
- Added Firecrawl URL scraping for faster context extraction
- Expanded Banned Lexicon to 8 categories including Gemini-specific patterns
- Mem0AI persistent memory now saves persona context across sessions
- Fixed scheduling edge case where X reminders weren't firing at the correct timezone
- Email newsletter generation now runs independently of campaign posts`,
  },
  {
    label: "Product update",
    value: `Ozigi now supports Slack webhooks. You can publish directly to your Slack workspace the same way Discord works — paste your webhook URL in Settings and your campaign drafts route there automatically. Took us about a day to build. The hardest part was the formatting rules — Slack markdown is different from Discord in a few annoying ways.`,
  },
  {
    label: "Blog post URL",
    value: `https://blog.ozigi.app/blog/your-launch-post-got-4-likes`,
  },
];

export function LandingDemoWidget() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = () => {
    if (!input.trim()) return;
    setLoading(true);
    sessionStorage.setItem("ozigi_landing_demo_input", input.trim());
    router.push("/demo?from=landing");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] ring-1 ring-slate-900/5">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste a URL, drop meeting notes, or type a rough idea..."
        rows={5}
        className="w-full text-sm text-slate-800 placeholder:text-slate-400
                   bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5
                   resize-none focus:outline-none focus:border-[#E8320A]/50
                   focus:ring-2 focus:ring-[#E8320A]/10 transition-all"
      />

      {/* Sample pills */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Try a sample:
        </span>
        {SAMPLES.map((s) => (
          <button
            key={s.label}
            onClick={() => setInput(s.value)}
            className="text-[10px] font-bold text-slate-500 border border-slate-200
                       rounded-full px-3 py-1 hover:border-[#E8320A] hover:text-[#E8320A]
                       transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!input.trim() || loading}
        className="mt-4 w-full py-3 bg-[#E8320A] hover:bg-[#C5280A] disabled:opacity-40
                   text-white font-black uppercase tracking-widest text-xs rounded-xl
                   transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Taking you there...
          </>
        ) : (
          "Generate my campaign ⚡"
        )}
      </button>

      <p className="text-center text-[10px] text-slate-400 mt-2">
        No account needed · One free generation
      </p>
    </div>
  );
}
