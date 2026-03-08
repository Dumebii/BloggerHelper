"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // ✨ FIXED: The Tab-Switching Trap
  // We use this ref to remember if the user was ALREADY logged in before the event fired.
  const prevSession = useRef<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      prevSession.current = initialSession;
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      
      // ONLY redirect if they went from NOT logged in to LOGGED IN.
      // This ignores background tab-refresh events!
      if (event === "SIGNED_IN" && !prevSession.current) {
        router.push("/dashboard");
      }
      
      prevSession.current = newSession;
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="bg-[#fafafa] font-sans text-slate-900 min-h-screen flex flex-col">
      <Header
        session={session}
        onSignIn={() => setIsAuthModalOpen(true)}
        onOpenHistory={() => {}}
      />

      <main className="flex-1">
        {/* --- HERO SECTION --- */}
        <section className="relative overflow-hidden pt-24 pb-20 min-h-[85vh] flex flex-col items-center justify-center selection:bg-slate-200 selection:text-slate-900 border-b border-slate-200/60">
          
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-slate-400/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6 text-center z-10 w-full mt-8 md:mt-0">
            <div className="flex justify-center mb-8 animate-in fade-in zoom-in-95 duration-1000 ease-out">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-slate-800 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-700">
                  Ozigi v3: The Universal Context Update
                </span>
              </div>
            </div>

            {/* ✨ FIXED: The "Uprooting" Animation and Blank Page Copy */}
            <div className="flex flex-col items-center justify-center mb-8 gap-2">
              <div className="overflow-hidden pb-1 px-4">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter text-slate-900 leading-[0.9] animate-in slide-in-from-bottom-[100%] duration-1000 ease-out">
                  Cure Blank Page
                </h1>
              </div>
              <div className="overflow-hidden pt-1 pb-4 px-4">
                <span className="inline-block text-5xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-900 leading-[0.9] animate-in slide-in-from-bottom-[100%] duration-1000 delay-150 ease-out">
                  Syndrome.
                </span>
              </div>
            </div>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 font-medium leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 ease-out">
              Staring at a blinking cursor trying to figure out what to post? Turn your existing context—raw notes, web links, or PDFs—into structured, multi-platform campaigns in your exact voice. No brainstorming required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500 ease-out">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-1 active:translate-y-0"
              >
                Start Engineering Content
              </button>
              <Link
                href="/docs"
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-1 active:translate-y-0"
              >
                Read the Documentation
              </Link>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section className="py-24 md:py-32 bg-white border-b border-slate-200/60 relative">
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">
                How The Engine Works
              </h2>
              <p className="text-slate-500 font-medium text-lg">Three steps from raw context to polished distribution.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="bg-slate-50 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 hover:border-slate-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out group cursor-default">
                <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-xl font-black text-slate-900 mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  1
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-4">Ingest Context</h3>
                <p className="text-base text-slate-600 font-medium leading-relaxed">
                  Paste a URL, dump unformatted meeting transcripts, or upload a PDF. Ozigi extracts the core narrative without you needing to summarize it first.
                </p>
              </div>

              {/* ✨ FIXED: Persona Copy Update */}
              <div className="bg-slate-50 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 hover:border-slate-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out group cursor-default">
                <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-xl font-black text-slate-900 mb-8 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  2
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-4">Apply Voice Persona</h3>
                <p className="text-base text-slate-600 font-medium leading-relaxed">
                  Create and save custom voice profiles. The engine applies strict stylistic constraints to your selected persona, bypassing AI detection to sound exactly like you every time.
                </p>
              </div>

              <div className="bg-slate-50 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 hover:border-slate-300 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out group cursor-default">
                <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-xl font-black text-slate-900 mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  3
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-4">Omnichannel Routing</h3>
                <p className="text-base text-slate-600 font-medium leading-relaxed">
                  Instantly receive a structured campaign. Push directly to X (Twitter) via Web Intents, format for LinkedIn, or drop straight into your Discord server.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- VERSATILE USE CASES --- */}
        <section className="py-24 md:py-32 bg-[#fafafa]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">
                Built For Professionals
              </h2>
              <p className="text-slate-500 font-medium text-lg">A chameleon engine that adapts to your industry.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-slate-300 hover:-translate-y-2 transition-all duration-500 ease-out cursor-default">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Use Case 01</h3>
                <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Technical Writing</h4>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  Turn dry API documentation, GitHub release notes, or complex architectural concepts into highly engaging X threads and LinkedIn posts without losing technical accuracy.
                </p>
              </div>

              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-slate-300 hover:-translate-y-2 transition-all duration-500 ease-out cursor-default">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Use Case 02</h3>
                <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Founders & Marketing</h4>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  Convert messy product strategy documents, customer interview transcripts, or rough ideas into polished thought leadership campaigns that drive Go-To-Market outcomes.
                </p>
              </div>

              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-slate-300 hover:-translate-y-2 transition-all duration-500 ease-out cursor-default">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Use Case 03</h3>
                <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Digital Educators</h4>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  Upload a PDF of your latest course curriculum or workshop slides, and let Ozigi extract the core lessons to build an automated, multi-day promotional campaign.
                </p>
              </div>

              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-slate-300 hover:-translate-y-2 transition-all duration-500 ease-out cursor-default">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Use Case 04</h3>
                <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Content Creators</h4>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  Paste the URL of your latest YouTube video or podcast episode. The engine will instantly read the transcript and spin out native hooks and posts for your audience.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  );
}
