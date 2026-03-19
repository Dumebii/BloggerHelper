"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import Script from "next/script";
import Hero from "../components/Hero";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import { supabase } from "@/lib/supabase/client";

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

  // --- SEO Structured Data ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Ozigi",
    "applicationCategory": "BusinessApplication",
    "description": "An AI content engine that turns raw notes, PDFs, and URLs into platform-ready social media posts for X, LinkedIn, and Discord — without sounding like AI wrote them.",
    "url": "https://ozigi.app",
    "operatingSystem": "Web",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free",
        "price": "0",
        "priceCurrency": "USD",
      },
      {
        "@type": "Offer",
        "name": "Pro",
        "price": "15",
        "priceCurrency": "USD",
        "billingDuration": "P1M",
      },
      {
        "@type": "Offer",
        "name": "Power",
        "price": "39",
        "priceCurrency": "USD",
        "billingDuration": "P1M",
      },
    ],
    "author": {
      "@type": "Person",
      "name": "Dumebi Okolo",
      "url": "https://x.com/DumebiTheWriter",
    },
  };

  return (
    <div className="bg-[#fafafa] font-sans text-slate-900 min-h-screen flex flex-col overflow-hidden">
      {/* Inject JSON-LD to the DOM */}
      <Script
        id="ozigi-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header
        session={session}
        onSignIn={() => setIsAuthModalOpen(true)}
      />

      <main className="pt-16 md:pt-32 pb-8 flex-1">
        
        {/* 1. HERO COMPONENT */}
        <Hero  />
        
        {/* 3. ARCHITECTURE & DOCS SECTION */}
        <section className="py-24 px-6 bg-slate-50 border-b border-slate-200 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              variants={fadeUp}
              className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16"
            >
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 mb-6 leading-[0.9]">
                  Intelligence <br />
                  Built on Rigor.
                </h2>
                <p className="text-lg font-medium text-slate-500 leading-relaxed">
                  Ozigi isn't a "Black Box." We believe that to trust an AI strategy, you need to understand the architecture behind it. We've open-sourced our decision records to show you exactly how your context is processed.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.1 }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
            >
              <motion.a 
                href="/architecture" 
                variants={fadeUp}
                whileHover={{ y: -5 }}
                className="group p-8 md:p-12 bg-white rounded-[2.5rem] border-2 border-transparent hover:border-slate-900 transition-all flex flex-col justify-between h-full shadow-sm hover:shadow-xl"
              >
                <div>
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform duration-300">
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
              </motion.a>

              <motion.a 
                href="/docs" 
                variants={fadeUp}
                whileHover={{ y: -5 }}
                className="group p-8 md:p-12 bg-white rounded-[2.5rem] border-2 border-transparent hover:border-slate-900 transition-all flex flex-col justify-between h-full shadow-sm hover:shadow-xl"
              >
                <div>
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform duration-300">
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
              </motion.a>
            </motion.div>
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