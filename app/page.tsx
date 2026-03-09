"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import Hero from "../components/Hero";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="bg-[#fafafa] font-sans text-slate-900 min-h-screen flex flex-col">
      <Header
        session={session}
        onSignIn={() => setIsAuthModalOpen(true)}
        onOpenHistory={() => {}}
      />

      <main className="pt-28 md:pt-32 pb-8 flex-1">
        <Hero onStart={() => (window.location.href = "/dashboard")} />
        
        {/* ✨ NEW: The "Moat" Comparison Section */}
        <section className="py-24 px-6 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 mb-6">
                Chaos In. <span className="text-red-700">Strategy Out.</span>
              </h2>
              <p className="text-lg font-medium text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Most AI tools wrap your insights in corporate buzzwords and predictable emojis. 
                Ozigi uses a strict editorial brief and a "Banned Lexicon" to force a pragmatic, human cadence. 
                See the difference.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Standard AI Card */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-[2.5rem] p-8 md:p-10 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🤖</span>
                  <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Standard AI Output</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex-1 shadow-sm">
                  <p className="text-slate-500 font-medium leading-relaxed">
                    🚀 <span className="font-bold">Navigating the complex landscape</span> of Cloud infrastructure! 
                    Today I <span className="font-bold">delved</span> into a <span className="font-bold">robust</span> Supabase auth bug. 
                    It is a <span className="font-bold">testament</span> to how <span className="font-bold">crucial</span> OAuth handshakes are in the <span className="font-bold">realm</span> of web dev. 
                    Let's <span className="font-bold">unlock</span> seamless integration together! 👇 #TechLife #Coding #WebDev
                  </p>
                </div>
                <div className="mt-6 flex justify-center">
                   <span className="text-xs font-black uppercase tracking-widest text-red-700 bg-red-50 px-4 py-2 rounded-lg">Fails Anti-AI Detection</span>
                </div>
              </div>

              {/* Ozigi Engine Card */}
              <div className="bg-slate-900 border-2 border-slate-900 rounded-[2.5rem] p-8 md:p-10 flex flex-col shadow-2xl relative overflow-hidden">
                {/* Subtle background accent */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-700/20 blur-3xl rounded-full pointer-events-none"></div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <span className="text-2xl">⚡</span>
                  <h3 className="text-xl font-black uppercase tracking-widest text-white">The Ozigi Engine</h3>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex-1 shadow-inner relative z-10">
                  <p className="text-slate-300 font-medium leading-relaxed">
                    Stop debugging your Auth in a silo. I just lost 4 hours to a single missing domain in Google Cloud. <br/><br/>
                    The OAuth handshake doesn't care about your feelings. Check your authorized domains first. Save the headache.
                  </p>
                </div>
                <div className="mt-6 flex justify-center relative z-10">
                   <span className="text-xs font-black uppercase tracking-widest text-green-400 bg-green-400/10 px-4 py-2 rounded-lg border border-green-400/20">Passes as Human 100%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Existing Architecture & Docs Section */}
        <section className="py-24 px-6 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto">
            {/* ... Keep your existing Architecture & Docs cards here ... */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 mb-6 leading-[0.9]">
                  Intelligence <br />
                  Built on Rigor.
                </h2>
                <p className="text-lg font-medium text-slate-500 leading-relaxed">
                  Ozigi isn't a "Black Box." We believe that to trust an AI strategy, you need to understand the architecture behind it. We've open-sourced our decision records to show you exactly how your context is processed.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <a href="/architecture" className="group p-8 md:p-12 bg-white rounded-[2.5rem] border-2 border-transparent hover:border-slate-900 transition-all flex flex-col justify-between h-full shadow-sm hover:shadow-xl">
                <div>
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                    <span className="text-2xl">🏗️</span>
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Architecture Decisions</h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-8">
                    Deep dive into the "Why" behind Ozigi. Explore our performance benchmarks and why we chose specific engines to ensure your content strategies are stable and accurate.
                  </p>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-red-700 group-hover:translate-x-2 transition-transform inline-block">
                  See how it works →
                </span>
              </a>

              <a href="/docs" className="group p-8 md:p-12 bg-white rounded-[2.5rem] border-2 border-transparent hover:border-slate-900 transition-all flex flex-col justify-between h-full shadow-sm hover:shadow-xl">
                <div>
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Ozigi Handbook</h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-8">
                    A comprehensive guide to mastering the Context Engine. Learn how to feed Ozigi the best raw information to generate high-performing social distribution strategies.
                  </p>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-red-700 group-hover:translate-x-2 transition-transform inline-block">
                  Explore the Handbook →
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
      <Footer />
    </div>
  );
}