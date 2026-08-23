"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ScanLine, Copy, Check, ArrowRight, Info } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { ToolLandingContent } from "@/components/tools/ToolLandingContent";
import {
  analyze,
  countWords,
  toSegments,
  CONTEXT_OPTIONS,
  CONTEXT_CTA,
  MIN_WORDS,
  type Context,
  type Hit,
  type HitCategory,
} from "@/lib/slop-checker/engine";

const FAQS = [
  {
    q: "Is this actually accurate?",
    a: "It catches the vocabulary and sentence patterns that make writing read as AI-generated to a human reader. It can't tell you with certainty whether a model wrote something — nothing can, reliably. It's a mirror, not a verdict.",
  },
  {
    q: "Does a low score mean I definitely used AI?",
    a: "No. Plenty of people write \"In today's fast-paced world\" without a language model's help — usually because they learned to write in a context (corporate comms, agency copy) that trained the same habits into them. The score describes the writing, not its author.",
  },
  {
    q: "Can I use this on someone else's writing?",
    a: "Yes — that's most of how people use it. Paste a competitor's landing page, an old email of yours, a draft someone sent you for review, anything.",
  },
  {
    q: "Is my text stored anywhere?",
    a: "No. The whole check runs in your browser — the word lists and pattern rules ship with the page, so nothing you paste is uploaded, logged, or saved. Close the tab and it's gone.",
  },
  {
    q: "Why does the same text score differently for a cold email than a blog post?",
    a: "Because the reader's patience is different. A cold email gets three seconds and one whiff of template kills it, so buzzwords are weighted 30% heavier there. A blog post is read by someone who already chose to be there, so it's weighted 15% lighter.",
  },
  {
    q: "Where does the word list come from?",
    a: "It's the same banned lexicon Ozigi runs against its own generated output before shipping it to a user — more than 400 words, phrases, openers, and structural patterns, plus a set of widely-documented AI tells added for this page.",
  },
];

const RELATED_LINKS = [
  { href: "/docs/the-banned-lexicon", label: "The banned lexicon, in full" },
  { href: "/blog/cold-email-that-does-not-sound-like-ai", label: "Cold email that doesn't sound like AI" },
  { href: "/long-form", label: "AI article generator" },
  { href: "/email-outreach", label: "Cold email generator" },
];

const PLACEHOLDER =
  "Paste an email, LinkedIn post, newsletter draft, or anything else you want checked...";

const CATEGORY_STYLE: Record<HitCategory, { chip: string; mark: string; label: string; note: string }> = {
  buzzword: {
    chip: "bg-amber-100 text-amber-900 border-amber-200",
    mark: "bg-amber-100 decoration-amber-400 hover:bg-amber-200",
    label: "Buzzwords",
    note: "inflated words doing no real work",
  },
  cliche: {
    chip: "bg-rose-100 text-rose-900 border-rose-200",
    mark: "bg-rose-100 decoration-rose-400 hover:bg-rose-200",
    label: "Clichés",
    note: "phrases that show up in every AI draft",
  },
  structural: {
    chip: "bg-violet-100 text-violet-900 border-violet-200",
    mark: "bg-violet-100 decoration-violet-400 hover:bg-violet-200",
    label: "Structural tells",
    note: "sentence patterns, not word choice",
  },
};

const BAND_STYLE = {
  "reads-human": { text: "text-emerald-600", ring: "ring-emerald-200", bg: "bg-emerald-50" },
  "some-tells": { text: "text-amber-600", ring: "ring-amber-200", bg: "bg-amber-50" },
  "sounds-ai": { text: "text-orange-600", ring: "ring-orange-200", bg: "bg-orange-50" },
  "heavy-slop": { text: "text-[#E8320A]", ring: "ring-red-200", bg: "bg-red-50" },
} as const;

function track(event: string, properties?: Record<string, unknown>) {
  fetch("/api/demo/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, properties }),
  }).catch(() => {});
}

export default function SlopCheckerPage() {
  const [text, setText] = useState("");
  const [context, setContext] = useState<Context>("general");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [activeHit, setActiveHit] = useState<Hit | null>(null);
  const [copied, setCopied] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    track("demo_page_viewed", { page: "slop_checker" });
  }, []);

  const liveWordCount = useMemo(() => countWords(text), [text]);

  // Re-scores on every context change without a second click — the multiplier
  // is live, not cosmetic. Nothing here touches the network: the lexicon is
  // bundled with the page, so pasted text never leaves the browser.
  const report = useMemo(
    () => (submitted ? analyze(submitted, context) : null),
    [submitted, context]
  );

  const segments = useMemo(
    () => (submitted && report ? toSegments(submitted, report.hits) : []),
    [submitted, report]
  );

  const cta = CONTEXT_CTA[context];

  const handleCheck = () => {
    const value = text.trim();
    if (!value) {
      toast.error("Paste some writing first.");
      return;
    }
    setActiveHit(null);
    setSubmitted(value);
    setTimeout(
      () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      100
    );
  };

  const handleCopyScore = () => {
    if (!report) return;
    const summary = [
      `Human Score: ${report.humanScore}/100 — ${report.bandLabel}.`,
      `${report.breakdown.buzzwords} buzzwords, ${report.breakdown.cliches} clichés, ${report.breakdown.structural} structural tells across ${report.totalWords} words.`,
      `Checked with Ozigi's free AI slop checker → https://ozigi.app/slop-checker`,
    ].join("\n");
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    track("slop_checker_score_copied", { page: "slop_checker", score: report.humanScore, band: report.band });
  };

  const handleCtaClick = () => {
    // Only computed output goes out, and only on a click the visitor chose to
    // make — never the pasted text, and never on "Check my writing" itself.
    track("slop_checker_cta_clicked", {
      page: "slop_checker",
      context,
      score: report?.humanScore,
      band: report?.band,
      word_count: report?.totalWords,
      buzzwords: report?.breakdown.buzzwords,
      cliches: report?.breakdown.cliches,
      structural: report?.breakdown.structural,
      destination: cta.href,
    });
  };

  const bandStyle = report ? BAND_STYLE[report.band] : BAND_STYLE["reads-human"];
  const isClean = report ? report.humanScore >= 95 && report.hits.length === 0 : false;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Ozigi" className="h-8 w-auto" />
            <span className="text-xl font-black text-[#0A1628] tracking-tighter">Ozigi</span>
          </Link>
          <button
            onClick={() => {
              setIsAuthModalOpen(true);
              track("demo_signup_clicked", { page: "slop_checker", location: "header" });
            }}
            className="bg-[#E8320A] hover:bg-[#C5280A] text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all"
          >
            Sign Up Free
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero — compact on purpose. This is a tool, it gets used, not admired. */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#E8320A]/10 text-[#E8320A] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <ScanLine className="w-3.5 h-3.5" />
            Free Tool
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-[#0A1628] leading-[0.9] mb-5">
            Does this sound like you,
            <br />
            <span className="text-[#E8320A]">or like ChatGPT?</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            Paste anything you wrote — or anything a tool wrote for you. We&apos;ll score it, show
            you exactly which words and sentence patterns are giving it away, and tell you what to
            fix. No sign-up, and nothing you paste leaves your browser.
          </p>
        </div>

        {/* Tool card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 mb-8">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
            What kind of writing is this?
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {CONTEXT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setContext(opt.value)}
                aria-pressed={context === opt.value}
                className={`text-sm font-bold px-4 py-2 rounded-xl border transition-all ${
                  context === opt.value
                    ? "bg-[#0A1628] text-white border-[#0A1628]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Buzzwords cost you more in a cold email than in a blog post — we weight the score
            accordingly.
          </p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={10}
            aria-label="Text to check"
            // Belt-and-braces on the privacy claim in the copy below: even if
            // Sentry's global replay masking is ever loosened, this element
            // and the marked-up output stay masked.
            data-sentry-mask="true"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#E8320A]/30 resize-y"
          />

          <div className="flex items-center justify-between gap-4 mt-2 mb-5">
            <p className="text-xs text-slate-400">
              {liveWordCount === 0
                ? `${MIN_WORDS} words minimum for an accurate score`
                : liveWordCount < MIN_WORDS
                ? `${liveWordCount} ${liveWordCount === 1 ? "word" : "words"} — ${MIN_WORDS} minimum for an accurate score`
                : `${liveWordCount} words`}
            </p>
            {text.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setText("");
                  setSubmitted(null);
                  setActiveHit(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={handleCheck}
            className="w-full bg-[#E8320A] hover:bg-[#C5280A] text-white font-black uppercase tracking-widest text-sm px-6 py-4 rounded-xl transition-all"
          >
            Check my writing →
          </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {report && submitted && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {report.totalWords < MIN_WORDS && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900">
                    Only {report.totalWords} words. The score is a density measurement, so short
                    samples swing hard — one flagged word in a sentence looks like a crisis. Paste{" "}
                    {MIN_WORDS}+ words for a reading you can trust.
                  </p>
                </div>
              )}

              {/* Score */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
                  <div
                    className={`shrink-0 w-28 h-28 rounded-2xl ring-4 ${bandStyle.ring} ${bandStyle.bg} flex flex-col items-center justify-center`}
                  >
                    <span className={`text-5xl font-black tabular-nums leading-none ${bandStyle.text}`}>
                      {report.humanScore}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1.5">
                      Human Score
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-2xl md:text-3xl font-black italic uppercase tracking-tighter ${bandStyle.text} mb-2`}
                    >
                      {report.bandLabel}
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      {isClean
                        ? "Nothing flagged. If this was AI-written, whoever prompted it did the editing pass — that's the whole job."
                        : report.verdict}
                    </p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7 pt-7 border-t border-slate-100">
                  {(["buzzword", "cliche", "structural"] as HitCategory[]).map((cat) => {
                    const value =
                      cat === "buzzword"
                        ? report.breakdown.buzzwords
                        : cat === "cliche"
                        ? report.breakdown.cliches
                        : report.breakdown.structural;
                    const style = CATEGORY_STYLE[cat];
                    return (
                      <div key={cat} className="bg-slate-50 rounded-xl px-4 py-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black tabular-nums text-[#0A1628]">
                            {value}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${style.chip}`}
                          >
                            {style.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">{style.note}</p>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleCopyScore}
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#E8320A] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy score as text"}
                </button>
              </div>

              {/* Annotated text */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Your text, marked up
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(["buzzword", "cliche", "structural"] as HitCategory[]).map((cat) => (
                      <span
                        key={cat}
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${CATEGORY_STYLE[cat].chip}`}
                      >
                        {CATEGORY_STYLE[cat].label}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  data-sentry-mask="true"
                  className="text-[15px] leading-[1.85] text-slate-800 whitespace-pre-wrap break-words"
                >
                  {segments.map((seg, i) =>
                    seg.hit ? (
                      <button
                        key={i}
                        type="button"
                        title={seg.hit.reason}
                        onClick={() => setActiveHit(seg.hit === activeHit ? null : seg.hit!)}
                        onMouseEnter={() => setActiveHit(seg.hit!)}
                        onFocus={() => setActiveHit(seg.hit!)}
                        // `inline`, not the button default of inline-block —
                        // a long flagged span has to wrap mid-phrase or it
                        // pushes the page sideways on a narrow screen.
                        className={`inline rounded-sm underline decoration-2 underline-offset-4 transition-colors cursor-help text-left ${
                          CATEGORY_STYLE[seg.hit.category].mark
                        } ${activeHit === seg.hit ? "ring-2 ring-[#0A1628]/20" : ""}`}
                      >
                        {seg.text}
                      </button>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    )
                  )}
                </div>

                <div className="mt-5 min-h-[64px]">
                  {activeHit ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                          CATEGORY_STYLE[activeHit.category].chip
                        }`}
                      >
                        {CATEGORY_STYLE[activeHit.category].label}
                      </span>
                      <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                        {activeHit.reason}
                      </p>
                    </div>
                  ) : report.hits.length > 0 ? (
                    <p className="text-xs text-slate-400">
                      Tap or hover a highlight to see why it was flagged.
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Nothing to mark up — no flagged words, phrases, or patterns in this one.
                    </p>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-[#0A1628] rounded-2xl p-6 md:p-8 text-white">
                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-3">
                  Want it rewritten instead of just flagged?
                </h2>
                <p className="text-slate-300 leading-relaxed mb-6">
                  Drop the same text into Ozigi&apos;s {cta.label} and it&apos;ll rewrite it against
                  the same banned-lexicon rules this checker uses — so you&apos;re not fixing this
                  one line by hand.
                </p>
                <Link
                  href={cta.href}
                  onClick={handleCtaClick}
                  className="inline-flex items-center gap-2 bg-[#E8320A] hover:bg-[#C5280A] text-white font-black uppercase tracking-widest text-sm px-6 py-4 rounded-xl transition-all"
                >
                  Fix this in Ozigi
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-xs text-slate-400 mt-4">
                  Not sure why we flag what we flag?{" "}
                  <a href="#methodology" className="text-white underline underline-offset-2">
                    Read how the checker works ↓
                  </a>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Methodology */}
        <section id="methodology" className="scroll-mt-24 py-16">
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-[#0A1628] mb-5">
            How this works
          </h2>
          <p className="text-slate-600 leading-relaxed mb-7">
            This isn&apos;t a &ldquo;detector&rdquo; that claims to know whether an AI wrote your
            text — nobody can promise that reliably, and we&apos;re not going to pretend otherwise.
            What it actually does is score your text against the same three checks Ozigi runs on its
            own output before it ships:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${CATEGORY_STYLE.buzzword.chip}`}>
                Buzzwords
              </span>
              <p className="text-sm text-slate-600 leading-relaxed mt-3">
                Words like <em>leverage</em>, <em>robust</em>, and <em>seamlessly</em> that sound
                impressive but say nothing specific. One or two are normal. A cluster of them is a
                tell.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${CATEGORY_STYLE.cliche.chip}`}>
                Clichés
              </span>
              <p className="text-sm text-slate-600 leading-relaxed mt-3">
                Phrases like <em>&ldquo;navigate the complexities of&rdquo;</em> or{" "}
                <em>&ldquo;in today&apos;s fast-paced world&rdquo;</em> — formulaic transitions that
                show up constantly in AI output and almost never in text someone typed themselves.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${CATEGORY_STYLE.structural.chip}`}>
                Structural tells
              </span>
              <p className="text-sm text-slate-600 leading-relaxed mt-3">
                Patterns like <em>&ldquo;it&apos;s not just X, it&apos;s Y,&rdquo;</em> bolded
                mini-headers in a list, or a paragraph that opens with <em>&ldquo;Moreover.&rdquo;</em>{" "}
                These matter more than word choice, so they count three times as much as a single
                flagged word.
              </p>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Your score is a density measurement — how much of this shows up relative to how long
            your text is — not a lie detector. Use it as a second pair of eyes, the way you&apos;d
            use a grammar checker: it catches patterns, you decide what&apos;s actually wrong.
          </p>
        </section>

        <ToolLandingContent
          toolName="Ozigi AI Slop Checker"
          pageUrl="https://ozigi.app/slop-checker"
          offerDescription="Free AI slop checker that scores any text for how much it reads as AI-generated, highlights the exact words, phrases, and sentence patterns responsible, and explains each one. Runs entirely in the browser."
          copyTitle="An AI writing checker that tells you which words to change"
          copyParagraphs={[
            "Most AI detectors hand you a percentage and no reasoning, which is useless for the thing you actually want to do next — fix the draft. This one shows its work: every flagged span is underlined in your own text, and tapping it tells you what the pattern is and why a reader clocks it.",
            "It's the same check Ozigi runs on its own generated output before that output reaches a user. More than 400 banned words, phrases, essay-transition openers, engagement-bait closers, and structural patterns — contrast framing, bold-label listicles, em-dash overuse, three sentences in a row opening on the same word — scored as a density against your word count, then weighted for the kind of writing you picked.",
            "The whole thing runs in your browser. The word lists ship with the page, the scan is plain pattern matching, and there's no API call behind the button — so nothing you paste is uploaded, logged, or saved, and you can check a client's draft or an unreleased launch email without thinking twice about it.",
            "To use it: pick what kind of writing it is, paste at least 40 words, and hit check. Switch the context afterwards to see how the same text scores as a cold email versus a blog post — the reader's patience is different, so the weighting is too.",
          ]}
          faqs={FAQS}
          relatedLinks={RELATED_LINKS}
        />
      </main>

      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          defaultView="signup"
          redirectTo="/slop-checker"
        />
      )}
    </div>
  );
}
