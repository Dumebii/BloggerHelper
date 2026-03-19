"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import Distillery from "../../components/ContextEngine";
import DistributionGrid from "../../components/DistributionGrid";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthModal from "../../components/AuthModal";

// ✨ THE "HERO" PAYLOAD (unchanged)
const simulatedCampaign = [
  {
    day: 1,
    x: "Most AI wrappers fail because they build for the AI, not the workflow.\n\nAfter weeks of fighting with the Vertex SDK, we finally stripped out the generic prompt logic and built a true Context Engine.\n\nStop summarizing your notes. Just dump the raw transcript and let the engine architect the distribution.",
    linkedin: "The biggest lie in the current AI cycle is that you need to be a 'Prompt Engineer' to get good results.\n\nInstead of teaching users how to talk to LLMs, we built an engine that ingests raw, unformatted context (PDFs, URLs, meeting notes) and maps it directly to a saved database persona.\n\nThe result? Zero blank page syndrome. If you are a technical writer, founder, or DevRel, your workflow just got cut in half.",
    discord: "**🚀 The Universal Context Update is live!**\n\nYou can now drop raw URLs or upload PDFs directly into the engine, select your persona, and get a structured omnichannel campaign. \n\nNo more prompt engineering. Let the engine do the heavy lifting."
  },
  {
    day: 2,
    x: "Blank page syndrome isn't a lack of ideas. It is a lack of structured context. \n\nIf you have a 45-minute podcast transcript, you already have 3 weeks of social content. You just need an engine that knows how to route it.",
    linkedin: "How much time did you spend staring at a blinking cursor this week?\n\nContent creation shouldn't start with a blank page. It should start with the work you already did. That API documentation you wrote, the GitHub release notes you finalized, or the customer interview you just recorded—that is your context.\n\nWe built an engine that extracts the core narrative from those raw assets and formats them for your exact audience.",
    discord: "Quick tip for the community: Try dropping your messy, unformatted meeting notes from today's standup into the engine. You will be shocked at how perfectly it extracts the technical insights into an external-facing update."
  },
  {
    day: 3,
    x: "We stopped trying to make AI write 'creatively' and started forcing it to write pragmatically.\n\nBy banning words like 'delve', 'robust', and 'tapestry' at the API level, the output bypasses AI detection and actually sounds like a battle-tested professional.",
    linkedin: "The problem with generative AI isn't the intelligence; it's the vocabulary.\n\nWe got so tired of reading the words 'delve', 'supercharge', and 'tapestry' on our feeds that we hardcoded a 'Banned Lexicon' directly into our backend architecture.\n\nWhen you enforce strict stylistic constraints on an enterprise model like Gemini 2.5 Pro, it stops sounding like a marketing robot and starts sounding like a pragmatic subject matter expert.",
    discord: "**🧠 Engineering Note:** We just updated the system prompt constraints to heavily penalize standard 'AI speak'. Your generated campaigns should sound much more human, bursty, and aggressive now."
  }
];

export default function DemoSandbox() {
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<any[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const campaignRef = useRef<HTMLDivElement>(null);

  // ✅ Updated to match Distillery's expected input shape
  const [inputs, setInputs] = useState({
    url: "",
    text: "",
    fileUrls: [],
    files: [],                      // must be an array
    platforms: ["x", "linkedin", "discord"], // default all platforms
    tweetFormat: "single" as const,
    additionalInfo: "",
    personaId: "default",
  });

  const handleSimulatedGenerate = () => {
    setLoading(true);
    setCampaign([]);

    // Simulate a 4-second wait
    setTimeout(() => {
      setCampaign(simulatedCampaign);
      setLoading(false);
      
      setTimeout(() => {
        campaignRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }, 4000);
  };

  return (
    <div className="bg-[#fafafa] font-sans text-slate-900 min-h-screen flex flex-col">
      <Header session={null} onSignIn={() => setIsAuthModalOpen(true)} />

      <main className="pt-28 md:pt-32 pb-24 flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 w-full">
          
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-700 transition-colors mb-6"
            >
              <span className="text-lg leading-none">←</span> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
              Interactive Sandbox
            </h1>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">
              Paste a link, drop some text, or upload a file. Click generate to see exactly how the engine architects your content. 
              <br/><span className="text-xs text-red-500 font-bold mt-2 block">Demo Mode</span>
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <Distillery
              session={null}
              userPersonas={[]}
              inputs={inputs}
              setInputs={setInputs}
              loading={loading}
              onGenerate={handleSimulatedGenerate} 
            />
          </div>

          {campaign.length > 0 && !loading && (
            <div className="mt-16 scroll-mt-32 animate-in fade-in slide-in-from-bottom-8 duration-700" ref={campaignRef}>
              <div className="mb-8 p-6 bg-slate-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div>
                  <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">Wow. That was fast.</h3>
                  <p className="text-slate-400 text-xs font-medium">
                    Create a free account to unlock full content generation, custom personas, direct social integrations and full history storage.
                  </p>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  Sign Up Free
                </button>
              </div>
              {/* ✅ Pass required selectedPlatforms prop */}
              <DistributionGrid
                campaign={campaign}
                session={null}
                selectedPlatforms={inputs.platforms}
              />
            </div>
          )}
        </div>
      </main>

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
      <Footer />
    </div>
  );
}