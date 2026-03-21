"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import { motion, Variants } from "framer-motion";
import PricingWaitlistModal from "./PricingWaitlistModal";
import { supabase } from "@/lib/supabase/client";
import CompetitorCompare from "./CompetitorCompare";


export default function Hero() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const prevSession = useRef<any>(null);

const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      prevSession.current = initialSession;
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      
      if (event === "SIGNED_IN" && !prevSession.current) {
        router.push("/dashboard");
      }
      
      prevSession.current = newSession;
    });

    return () => subscription.unsubscribe();
    console.log("Hero mounted, URL:", window.location.href);
supabase.auth.getSession().then(({ data: { session } }) => {
  console.log("Initial session check:", session);
  setSession(session);
  prevSession.current = session;
});
  }, [router]);

  // --- Animation Variants ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

  const [isScheduledOpen, setIsScheduledOpen] = useState(false);
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code) {
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) console.error("Exchange error:", error);
      // Clean the URL
      window.history.replaceState({}, document.title, "/");
    });
  }
}, []);


  return (
    <div className="bg-[#fafafa] font-sans text-slate-900 min-h-screen flex flex-col">

      <main className="flex-1">
        
{/* --- 1. HERO SECTION (Unified with Framer Motion) --- */}
<motion.section 
  className="relative overflow-hidden pb-10 md:pb-12 flex flex-col items-center justify-center selection:bg-slate-200 selection:text-slate-900 border-b border-slate-200/60"
  // remove pt-28 md:pt-32
  initial="hidden"
  animate="visible"
  variants={staggerContainer}
>
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-slate-400/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6 text-center z-10 w-full">
            {/* <motion.div variants={fadeUp} className="flex justify-center mb-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-700">
                  New: Multi-platform content campaigns
                </span>
              </div>
            </motion.div> */}

            <motion.div variants={fadeUp} className="flex flex-col items-center justify-center mb-4 gap-1">
              <div className="overflow-hidden pb-1 px-4">
<h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-6 leading-[1.1] uppercase">
            <span className="block uppercase">The intelligent</span>
            <span className="block text-indigo-600 uppercase">content engine for technical creators</span>
          </h1>
              </div>

            </motion.div>

            <motion.div variants={fadeUp}>
              {/* Bullet points */}
              <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm font-medium text-slate-700">
                <span className="flex items-center gap-1">✅ No prompt engineering – just drop raw notes</span>
                <span className="flex items-center gap-1">✅ Generates X, LinkedIn, Discord drafts in your voice</span>
                <span className="flex items-center gap-1">✅ Works with URLs, PDFs, images, and messy text</span>
              </div>
<p className="mt-6 text-lg md:text-xl text-slate-600 pb-5 font-medium max-w-2xl mx-auto leading-relaxed">
            Drop in raw notes, a URL, or a PDF. Ozigi generates platform-ready posts for X, LinkedIn, and Discord in your voice — without the AI-speak. No prompt engineering required.
          </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/demo"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-1 active:translate-y-0 text-center"
              >
                Try the Engine Free
              </Link>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-1 active:translate-y-0"
              >
                Sign Up – It’s Free
              </button>
            </motion.div>

            {/* 🔥 Social proof */}
            <motion.div variants={fadeUp} className="mt-10 flex justify-center">
               <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md py-4 px-8 rounded-full border border-slate-200 shadow-lg">
                   <div className="flex -space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
                      <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-white shadow-sm"></div>
                      <div className="w-10 h-10 rounded-full bg-slate-400 border-2 border-white shadow-sm"></div>
                      <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-xs text-white font-black tracking-tighter shadow-sm">140+</div>
                   </div>
                   <div className="text-left flex flex-col justify-center">
                       <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">300+ Campaigns</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Successfully generated</p>
                   </div>
               </div>
            </motion.div>

          </div>
        </motion.section>
<CompetitorCompare />
        
        {/* --- 2. HOW IT WORKS --- */}
        <section id="how-it-works" className="py-16 md:py-24 bg-white border-b border-slate-200/60 relative">
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              variants={fadeUp}
              className="text-center mb-16 md:mb-20"
            >
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">
                How The Engine Works
              </h2>
              <p className="text-slate-500 font-medium text-lg">Three steps from raw context to polished Content.</p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
            >
              <motion.div variants={fadeUp} className="bg-slate-50 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 hover:border-slate-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out group cursor-default">
                <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-xl font-black text-slate-900 mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  1
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-4">Ingest Context</h3>
                <p className="text-base text-slate-600 font-medium leading-relaxed">
                  Paste a URL, dump unformatted meeting transcripts, or upload a PDF/image. Ozigi extracts the core narrative without you needing to summarize it first.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="bg-slate-50 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 hover:border-slate-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out group cursor-default">
                <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-xl font-black text-slate-900 mb-8 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  2
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-4">Apply Voice Persona</h3>
                <p className="text-base text-slate-600 font-medium leading-relaxed">
                  Create and save custom voice personas. The engine applies strict stylistic constraints to your selected persona, bypassing AI detection to sound exactly like you every time.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="bg-slate-50 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 hover:border-slate-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out group cursor-default">
                <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-xl font-black text-slate-900 mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  3
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-4">Omnichannel Routing</h3>
                <p className="text-base text-slate-600 font-medium leading-relaxed">
                  Instantly receive structured content. Push directly to X (Twitter) via Web Intents, LinkedIn, or drop straight into your Discord server.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>


        {/* Change 5: Social Proof / HITL Callout Block */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="w-full max-w-6xl mx-auto px-6 py-16"
        >
          <div className="rounded-[2.5rem] border border-slate-800 bg-slate-900 p-8 md:p-14 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
            <div className="max-w-2xl space-y-4">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                AI handles the 90%. <br className="hidden md:block"/>You own the 10% that matters.
              </h3>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">
                Every generated post has an Edit button. Add the insider detail, the specific joke, the context only you know. Publish when it&apos;s yours.
              </p>
            </div>
            <Link 
              href="/docs#human-in-the-loop" 
              className="whitespace-nowrap rounded-xl bg-slate-800 px-8 py-4 text-sm font-bold text-white shadow-sm hover:bg-slate-700 ring-1 ring-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              See how the Edit workflow works &rarr;
            </Link>
          </div>
        </motion.section>

        {/* --- 3. THE MOAT: CHAOS IN, STRATEGY OUT --- */}
        <section className="w-full max-w-6xl mx-auto py-24 px-6">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-slate-900 mb-16">
              Chaos In. Strategy Out.
            </motion.h2>
            
            <div className="grid md:grid-cols-2 gap-8 w-full items-stretch">
              {/* Left: Standard AI Output */}
              <motion.div variants={fadeUp} className="rounded-[2.5rem] border border-slate-200 bg-white p-10 flex flex-col items-center shadow-sm">
                <div className="text-xl font-black italic uppercase tracking-tighter text-slate-400 mb-8">🤖 Standard AI Output</div>
                
                <div className="w-full h-full min-h-[14rem] bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 italic mb-8 border border-dashed border-slate-200 p-6 text-center text-sm font-medium leading-relaxed">
                  "Here are 5 key takeaways from this PDF about Scaling automation. Number 1 will shock you! 🚀 In conclusion, AI is changing the landscape of development for everyone..."
                </div>

                <div className="rounded-full bg-red-50 px-4 py-1.5 text-sm font-bold text-red-600 ring-1 ring-inset ring-red-100">
                  Sounds like a template
                </div>
              </motion.div>
              
              {/* Right: The Ozigi Engine (WITH SIDE-BY-SIDE PROOF) */}
              <motion.div variants={fadeUp} className="rounded-[2.5rem] border border-indigo-100 bg-indigo-50/50 p-10 flex flex-col items-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
                <div className="text-xl font-black italic uppercase tracking-tighter text-indigo-600 mb-8">⚡ The Ozigi Engine</div>
                
                {/* Side-by-Side Proof Container */}
                <div className="w-full h-auto min-h-[14rem] bg-white rounded-2xl flex flex-col md:flex-row items-stretch text-slate-700 mb-8 border border-indigo-100 shadow-sm overflow-hidden text-xs sm:text-sm font-medium">
                  {/* Quality description column */}
                  <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-indigo-50 bg-indigo-50/30 flex items-center justify-center text-center italic text-slate-500">
                    [ Well-structured thread with your actual technical insights, pacing, and tone. No emojis or robotic conclusions. ]
                  </div>
                  {/* Real Post Proof column */}
                  <div className="flex-1 p-5 flex items-center justify-start bg-white text-slate-900 leading-relaxed">
                    <span>Scaling automation requires treating test code like production code. Poor architecture, like ignoring POM or SOLID, sinks suites faster than flaky environments. Data management is non-negotiable.</span>
                  </div>
                </div>

                <div className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-600 ring-1 ring-inset ring-emerald-100">
                  Sounds like a person
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* --- 4. VERSATILE USE CASES --- */}
        <section className="py-24 md:py-32 bg-[#fafafa]">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              variants={fadeUp}
              className="text-center mb-16 md:mb-24"
            >
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">
                Built For Professionals
              </h2>
              <p className="text-slate-500 font-medium text-lg">An engine built to adapt to your industry.</p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
            >
              <motion.div variants={fadeUp} className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-slate-300 hover:-translate-y-2 transition-all duration-500 ease-out cursor-default">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Use Case 01</h3>
                <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Technical Writing</h4>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  Turn dry API documentation, GitHub release notes, or complex architectural concepts into highly engaging X threads and LinkedIn posts without losing technical accuracy.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-slate-300 hover:-translate-y-2 transition-all duration-500 ease-out cursor-default">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Use Case 02</h3>
                <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Founders & Marketing</h4>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  Convert messy product strategy documents, customer interview transcripts, or rough ideas into polished thought leadership campaigns that drive Go-To-Market outcomes.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-slate-300 hover:-translate-y-2 transition-all duration-500 ease-out cursor-default">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Use Case 03</h3>
                <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Digital Educators</h4>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  Upload a PDF of your latest course curriculum or workshop slides, and let Ozigi extract the core lessons to build an automated, multi-day promotional campaign.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-slate-300 hover:-translate-y-2 transition-all duration-500 ease-out cursor-default">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Use Case 04</h3>
                <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Content Creators</h4>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  Paste the URL of your latest YouTube video or podcast episode. The engine will instantly read the transcript and spin out native hooks and posts for your audience.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
        <section id="pricing" className="w-full max-w-5xl mx-auto pt-12 pb-32 px-6 scroll-mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black italic uppercase tracking-tighter text-slate-900">Pricing</h2>
            <p className="mt-4 text-lg font-medium text-slate-500">Free to start. No credit card required.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch text-left">
            {/* Free Tier */}
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 flex flex-col shadow-sm hover:shadow-xl transition-shadow">
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">Free</h3>
              <p className="text-slate-500 font-medium mb-8 pb-8 border-b border-slate-100">Perfect for getting started.</p>
              
              <ul className="space-y-5 text-slate-600 font-medium mb-10 flex-grow">
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs">✓</span> 
                  5 campaigns/month
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs">✓</span> 
                  1 saved persona
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs">✓</span> 
                  X + Discord publishing
                </li>
              </ul>
              
              <Link href="/dashboard" className="w-full rounded-xl bg-slate-100 px-4 py-4 text-center text-sm font-bold text-slate-900 hover:bg-slate-200 transition-colors">
                Get Started
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="rounded-[2.5rem] border border-indigo-200 bg-indigo-50 p-10 relative overflow-hidden flex flex-col shadow-md">
              <div className="flex items-baseline gap-3 mb-2">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-indigo-900">Pro</h3>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                  Coming soon
                </span>
              </div>
              <p className="text-slate-600 font-medium mb-8 pb-8 border-b border-indigo-100/50">For serious creators scaling up.</p>
              
              <ul className="space-y-5 text-slate-700 font-medium mb-10 flex-grow">
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-200 text-indigo-700 text-xs">✓</span> 
                  Unlimited campaigns
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-200 text-indigo-700 text-xs">✓</span> 
                  Unlimited personas
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-200 text-indigo-700 text-xs">✓</span> 
                  LinkedIn OAuth + Image Gen
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-200 text-indigo-700 text-xs">✓</span> 
                  Priority model access
                </li>
              </ul>
              
              <button
                onClick={() => setIsWaitlistOpen(true)}
                className="w-full rounded-xl bg-indigo-200/50 px-4 py-4 text-center text-sm font-bold text-indigo-400 hover:bg-indigo-300/50 hover:text-indigo-600 transition-colors"
              >
                Join the Waitlist
              </button>
              {isWaitlistOpen && <PricingWaitlistModal onClose={() => setIsWaitlistOpen(false)} />}
            </div>
          </div>
        </section>
      </main>
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  );
}
