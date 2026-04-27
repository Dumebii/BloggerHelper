"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import AuthModal from "../components/AuthModal";
import PricingCards from "../components/PricingCards";
import BeforeAfterSlider from "../components/BeforeAfterSlider";
import { LandingDemoWidget } from "../components/LandingDemoWidget";
import SocialProof from "../components/SocialProof";
import { supabase } from "@/lib/supabase/client";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="bg-brand-offwhite font-sans text-slate-900 min-h-screen flex flex-col overflow-hidden">
      <Header session={session} onSignIn={() => setIsAuthModalOpen(true)} />
      <main className="flex-1">
        <Hero />

        {/* ── Demo widget ──────────────────────────────────────────── */}
        <section className="bg-white border-y border-slate-200 py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red mb-3">
                Try it now — free
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-brand-navy tracking-tight">
                See what human sounds like
              </h2>
              <p className="text-slate-500 font-medium mt-2 text-base">
                Paste a URL, drop some notes, or type a rough idea. Done in 20 seconds.
              </p>
            </div>
            <LandingDemoWidget />
          </div>
        </section>

{/* BetterLaunch badge — place above the logo ticker in the social proof section */}
<div className="flex justify-center mb-6">
  <a
    href="https://www.betterlaunch.co"
    target="_blank"
    rel="noopener noreferrer"
    className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
    aria-label="Featured on Better Launch"
  >
    <img
      src="https://www.betterlaunch.co/badge.svg"
      alt="Featured on Better Launch"
      width={120}
      height={24}
      className="h-5 w-auto opacity-80 group-hover:opacity-100 transition-opacity duration-200"
    />
  </a>
</div>
        
        <SocialProof />

        {/* How It Works */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-brand-offwhite border-b border-slate-200/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/8 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-brand-navy/5 rounded-full blur-3xl opacity-30" />
          <div className="relative max-w-6xl mx-auto px-6 z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              variants={fadeUp}
              className="text-center mb-16 md:mb-20"
            >
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-brand-navy mb-4">
                From chaos to clarity
              </h2>
              <p className="text-slate-500 font-medium text-lg">
                Your voice. Your ideas. Zero AI aftertaste.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
            >
              {[
                {
                  number: 1,
                  title: "Feed raw material",
                  desc: "Paste a URL, paste meeting notes, upload a PDF. No need to clean it up. Ozigi strips the noise and extracts what matters.",
                },
                {
                  number: 2,
                  title: "Your voice applies",
                  desc: "Set your persona once. Technical depth, tone, pacing, banned AI phrases — the engine locks in your style so every post sounds like you wrote it at your most articulate.",
                },
                {
                  number: 3,
                  title: "Ship everywhere",
                  desc: "Post to X, LinkedIn, Discord, email, or Slack directly. One click. Your audience gets content that sounds human — because it is.",
                },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100 p-6 md:p-10 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-2xl group-hover:bg-brand-red/10 transition-colors" />
                  <div className="w-14 h-14 bg-gradient-to-br from-brand-red/20 to-brand-navy/10 rounded-2xl flex items-center justify-center text-2xl font-black text-brand-red mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-widest text-brand-navy mb-4 relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-base text-slate-600 font-medium leading-relaxed relative z-10">
                    {step.desc}
                  </p>
                  <div className="absolute bottom-0 left-0 w-1 h-0 bg-brand-red group-hover:h-full transition-all duration-500" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Human-in-the-Loop Callout */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="w-full max-w-6xl mx-auto px-6 py-20"
        >
          <div className="rounded-3xl bg-gradient-to-br from-brand-navy to-slate-800 p-8 md:p-14 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl" />
            <div className="max-w-2xl space-y-4 relative z-10">
              <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
                AI does the heavy lifting. <br className="hidden md:block" />
                You add the secret sauce.
              </h3>
              <p className="text-slate-300 font-medium text-lg leading-relaxed">
                Every post comes with an edit button. Add the insider detail, the specific story,
                the personal take that only you can make. Publish when it feels authentically yours.
              </p>
            </div>
            <Link
              href="/docs#human-in-the-loop"
              className="whitespace-nowrap rounded-xl bg-white text-brand-navy px-8 py-4 text-sm font-black uppercase tracking-widest shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all relative z-10"
            >
              See how it works →
            </Link>
          </div>
        </motion.section>

        {/* The Moat: Chaos In, Strategy Out */}
        <section className="w-full max-w-6xl mx-auto py-20 md:py-28 px-6 relative">
          <div className="absolute -top-32 right-0 w-96 h-96 bg-brand-red/8 rounded-full blur-3xl opacity-30" />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-col items-center relative z-10"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-brand-navy mb-12 text-center"
            >
              The difference between sounding human and sounding like a chatbot
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8 w-full items-stretch">
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="rounded-3xl bg-white border-2 border-red-200 p-6 md:p-10 flex flex-col items-center shadow-lg hover:shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-100/50 rounded-full blur-xl" />
                <div className="text-xl font-black italic uppercase tracking-tighter text-red-600 mb-6 relative z-10">
                  Standard AI Output
                </div>
                <div className="w-full min-h-[14rem] bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 italic mb-6 border border-slate-200 p-6 text-center text-sm font-medium leading-relaxed relative z-10">
                  "Here are 5 key takeaways from this PDF about Scaling automation. Number 1 will shock you! 🚀 In conclusion, AI is changing the landscape of development for everyone..."
                </div>
                <div className="rounded-full bg-red-100 px-4 py-1.5 text-sm font-bold text-red-700 ring-1 ring-inset ring-red-200 relative z-10">
                  Sounds like a template
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="rounded-3xl bg-gradient-to-br from-brand-red/8 via-white to-brand-red/5 border-2 border-brand-red/30 p-6 md:p-10 flex flex-col items-center shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-red/15 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-red/8 rounded-full blur-2xl" />
                <div className="text-xl font-black italic uppercase tracking-tighter text-brand-red mb-6 relative z-10">
                  The Ozigi Engine
                </div>
                <div className="w-full min-h-[14rem] bg-white rounded-2xl flex flex-col md:flex-row items-stretch text-slate-700 mb-6 border border-brand-red/15 shadow-sm overflow-hidden text-xs sm:text-sm font-medium relative z-10">
                  <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-brand-red/10 bg-brand-red/5 flex items-center justify-center text-center italic text-slate-600">
                    [ Well-structured thread with your actual technical insights, pacing, and tone. No templates. ]
                  </div>
                  <div className="flex-1 p-5 flex items-center justify-start bg-white text-slate-900 leading-relaxed">
                    <span>
                      Scaling automation requires treating test code like production code. Poor architecture sinks suites faster than flaky environments. Data management is non-negotiable.
                    </span>
                  </div>
                </div>
                <div className="rounded-full bg-brand-red/15 px-4 py-1.5 text-sm font-bold text-brand-red ring-1 ring-inset ring-brand-red/30 relative z-10">
                  Sounds like a real person
                </div>
              </motion.div>
            </div>

            {/* Interactive Drag-to-Reveal Slider */}
            <motion.div variants={fadeUp} className="mt-12 md:mt-16 w-full">
              <p className="text-xs uppercase font-bold text-slate-500 tracking-widest text-center mb-4">
                Try it yourself — drag to reveal
              </p>
              <BeforeAfterSlider />
            </motion.div>
          </motion.div>
        </section>

        {/* Versatile Use Cases */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-white to-brand-offwhite relative overflow-hidden">
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-brand-navy/5 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl opacity-20" />
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              variants={fadeUp}
              className="text-center mb-16 md:mb-24"
            >
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-brand-navy mb-4">
                Works for your world
              </h2>
              <p className="text-slate-500 font-medium text-lg">
                Every audience can tell when content sounds fake. Yours won't.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
            >
              {[
                {
                  title: "Developers & DevRel",
                  desc: "Turn messy API docs or release notes into X threads and LinkedIn posts that read like a real engineer wrote them — not a marketing bot. Keep the rigor. Lose the AI smell.",
                },
                {
                  title: "Founders & Leaders",
                  desc: "Take rough notes from a fundraising call or product meeting and get thought leadership posts that sound like you at your most articulate — not like you outsourced your voice to a chatbot.",
                },
                {
                  title: "Educators & Trainers",
                  desc: "Upload your course slides or workshop deck. Ozigi pulls the core lessons and builds a multi-week content campaign that reads like you, not like a lesson plan generated on autopilot.",
                },
                {
                  title: "Creators & Writers",
                  desc: "Drop a podcast, video, or newsletter. Ozigi extracts the ideas and generates hooks and follow-ups in your voice — the kind your audience recognises as yours, not AI's.",
                },
              ].map((useCase, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-red/10 rounded-full blur-2xl group-hover:bg-brand-red/15 transition-colors" />
                  <div className="text-xs font-black uppercase tracking-widest text-brand-red mb-4 relative z-10">
                    {String(idx + 1).padStart(2, "0")} / Use Case
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-brand-navy mb-4 relative z-10">
                    {useCase.title}
                  </h3>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed relative z-10">
                    {useCase.desc}
                  </p>
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-brand-red to-transparent w-0 group-hover:w-full transition-all duration-500" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 px-6 bg-white border-b border-slate-200/40 relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-red/8 rounded-full blur-3xl opacity-30" />
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeUp}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-brand-navy">
                Everything built to sound human
              </h2>
              <p className="text-slate-500 font-medium mt-4 max-w-2xl mx-auto">
                Skip the blank page. Skip the ChatGPT voice. Ship content that sounds like it came from a person — because it did.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {[
                {
                  title: "Messy input welcome",
                  desc: "URLs, PDFs, voice notes, scattered thoughts—throw it all at Ozigi. It finds the signal in the noise.",
                },
                {
                  title: "Your voice locked in",
                  desc: "Define your persona once. Tone, depth, banned AI phrases, sentence rhythm — the engine enforces it on every post so nothing slips into generic AI-speak.",
                },
                {
                  title: "Instant publishing",
                  desc: "Ship to X, LinkedIn, Discord, email, Slack from your dashboard in seconds. No more context switching, no more copy-pasting AI slop.",
                },
                {
                  title: "Bypasses AI detection",
                  desc: "LinkedIn's 360Brew system detects and suppresses generic AI content. Ozigi's Banned Lexicon strips the exact vocabulary patterns it flags — so your posts reach more people, not fewer.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  className="bg-white border border-slate-200/60 rounded-2xl p-6 md:p-8 shadow-md hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  <div className="absolute -top-8 -right-8 w-20 h-20 bg-brand-red/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-3 text-brand-navy relative z-10">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 relative z-10">{feature.desc}</p>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-red group-hover:w-full transition-all duration-500" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-6 scroll-mt-32 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-red/8 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-navy/5 rounded-full blur-3xl opacity-20" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-brand-navy">
                No surprises. No AI voice. Just results.
              </h2>
              <p className="text-slate-500 font-medium mt-4">Try free forever. Scale when you ship.</p>
            </div>
            <PricingCards onOpenAuthModal={() => setIsAuthModalOpen(true)} />
          </div>
        </section>
      </main>
      <Footer />
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  );
}
