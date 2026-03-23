"use client";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingCards from "@/components/PricingCards";
import { redirect } from "next/navigation";
import { useState } from "react";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  

  return (
    <div className="bg-[#fafafa] min-h-screen flex flex-col">
      <Header session={session} onSignIn={() => {}} onOpenMobileSidebar={() => {}} />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              No credit card required to start. Upgrade when you're ready to scale.
            </p>
          </div>
<PricingCards onOpenAuthModal={() => setIsAuthModalOpen(true)} />
          </div>
      </main>
      <Footer />
    </div>
  );
}