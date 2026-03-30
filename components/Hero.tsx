"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import AuthModal from "../components/AuthModal";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const float: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 } }
};

const cardData = [
  {
    platform: "X (Twitter)",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 1200 1227" fill="currentColor">
        <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
      </svg>
    ),
    content: `
      <div class="tweet">
        <p>Building real-time video in Next.js isn’t just about the camera feed. We shipped a consultation app. The real work began orchestrating auth, data, and Stream's SDK. That setup makes all the difference. Secure video calls start with bulletproof authentication.</p>
      </div>
      <div class="tweet">
        <strong>Tweet 2:</strong> We used Clerk for our Next.js video consultation app. Handling user sessions, tokens, and roles became straightforward, letting us focus on the video experience itself. It's a critical layer.
      </div>
      <div class="tweet">
        <strong>Tweet 3:</strong> Recording video calls adds a layer of legal and practical value. We built in session recording using Upload.io for our Next.js consultation app. Beyond that, Tinybird helps us track call duration and participant counts, giving real numbers on usage.
      </div>
    `,
    type: "Thread (3 tweets)"
  },
  {
    platform: "LinkedIn",
    icon: (
      <svg className="w-5 h-5 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    content: "Putting together a video consultation app requires more than just a video library. We integrated Clerk for authentication, PlanetScale for user and appointment data, and Stream's Video SDK for the core real-time communication. This stack delivers a robust foundation. Deciding which components handle what part of the user journey—from pre-call checks to actual session management—is where the architecture choices become clear. Our Next.js API routes became the glue. Understanding the interplay between these services was key to a stable release.",
    type: "long‑form"
  },
  {
    platform: "Discord",
    icon: (
      <svg className="w-5 h-5 text-[#5865F2]" viewBox="0 0 127.14 96.36" fill="currentColor">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77.7,77.7,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z" />
      </svg>
    ),
    content: "Spent the morning integrating Clerk auth with our PlanetScale database for the video app. Getting user roles from Clerk to control access to consultation data in PlanetScale. The `webhooks` feature in Clerk is a good path for this. Anyone else doing similar setups with Next.js?",
    type: "community update"
  }
];

export default function Hero() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const prevSession = useRef<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      prevSession.current = initialSession;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "SIGNED_IN" && !prevSession.current) {
        router.push("/dashboard");
      }
      prevSession.current = newSession;
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % cardData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-brand-offwhite py-12 md:py-20 min-h-screen flex items-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-red/5 via-transparent to-brand-red/5 animate-gradient-x" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_0%,rgba(232,50,10,0.03)_100%)]" />

      {/* Floating abstract shapes */}
      <motion.div
        variants={float}
        initial="hidden"
        animate="visible"
        className="absolute top-1/4 left-[5%] w-64 h-64 bg-brand-red/5 rounded-full blur-3xl"
      />
      <motion.div
        variants={float}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.5 }}
        className="absolute bottom-1/4 right-[5%] w-96 h-96 bg-brand-navy/5 rounded-full blur-3xl"
      />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-brand-red/30 rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.5, 0],
              scale: [0, 1, 0],
              x: [0, (Math.random() - 0.5) * 200],
              y: [0, (Math.random() - 0.5) * 200],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-6xl mx-auto px-6 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
          {/* Left Column: Text */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="flex-1 text-center lg:text-left space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-2 shadow-sm mx-auto lg:mx-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-700">
                AI that learns your voice
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[1.1] text-brand-navy">
              Content that doesn't <br />
              <span className="text-brand-red relative inline-block">
                sound like AI wrote it
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1 bg-brand-red/30"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                /> 
              </span>
            </h1> 
            <p className="text-lg text-slate-600 max-w-lg mx-auto lg:mx-0">
              Stop writing. Start shipping. Drop raw thoughts, PDFs, or links. Ozigi transforms them into platform-ready posts that sound authentically like you—not a template.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
              <Link
                href="/demo"
                className="bg-brand-navy text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-opacity-90 transition shadow-lg text-center group"
              >
                Start for free
                <span className="inline-block ml-1 group-hover:translate-x-1 transition">→</span>
              </Link>
              <Link
                href="/docs"
                className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition shadow-sm text-center"
              >
                See how it works
              </Link>
            </div>
<div className="flex flex-wrap items-center gap-6 pt-4 justify-center lg:justify-start text-slate-500 hidden md:flex">
  <div className="flex items-center gap-1 text-sm">
    <span className="text-brand-red">✓</span> No credit card
  </div>
  <div className="flex items-center gap-1 text-sm">
    <span className="text-brand-red">✓</span> 5 free campaigns
  </div>
  <div className="flex items-center gap-1 text-sm">
    <span className="text-brand-red">✓</span> 7‑day Pro trial
  </div>
</div>
          </motion.div>

          {/* Right Column: Vertical Slider */}

<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.7, delay: 0.2 }}
  className="flex-1 relative flex justify-center items-center w-full"
>
  <div className="relative w-full max-w-full md:max-w-md min-h-[340px] md:h-[340px]">
    <AnimatePresence mode="wait">
      <motion.div
        key={currentCard}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="hero-card absolute inset-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 md:p-6 overflow-y-auto pb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          {cardData[currentCard].icon}
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            {cardData[currentCard].platform} • {cardData[currentCard].type}
          </span>
        </div>
        <div
          className="text-sm text-slate-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: cardData[currentCard].content }}
        />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {cardData.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentCard(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentCard ? "bg-brand-red w-4" : "bg-slate-300"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
  <div className="absolute -z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl" />
</motion.div>
        </div>

        {/* Social proof row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-5 md:mt-8 flex flex-wrap justify-center gap-4 md:gap-8 text-center"
        >
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-left">
              <div className="text-2xl font-black text-brand-navy">1,200+</div>
              <div className="text-xs uppercase tracking-widest text-slate-500">posts shipped</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="text-left">
              <div className="text-2xl font-black text-brand-navy">10s</div>
              <div className="text-xs uppercase tracking-widest text-slate-500">content generation</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-left">
              <div className="text-2xl font-black text-brand-navy">0</div>
              <div className="text-xs uppercase tracking-widest text-slate-500">AI-speak detected</div>
            </div>
          </div>
        </motion.div>
      </div>

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </section>
  );
}
