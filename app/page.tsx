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
        onOpenHistory={() => {}} // Not needed on landing page
      />

      <main className="pt-28 md:pt-32 pb-8 flex-1">
        {/* We pass a simple redirect to the Hero instead of a state toggle */}
        <Hero onStart={() => (window.location.href = "/dashboard")} />
          <section className="py-24 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
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