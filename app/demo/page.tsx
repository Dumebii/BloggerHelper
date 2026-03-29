"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Distillery from "../../components/ContextEngine";
import DistributionGrid from "../../components/DistributionGrid";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthModal from "../../components/AuthModal";
import { PLATFORMS } from "@/lib/platforms";

export default function DemoSandbox() {
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<any[]>([]);
  const [emailContent, setEmailContent] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const campaignRef = useRef<HTMLDivElement>(null);

  const [inputs, setInputs] = useState({
    url: "",
    text: "",
    fileUrls: [],
    files: [],
    platforms: [PLATFORMS.X, PLATFORMS.LINKEDIN, PLATFORMS.DISCORD],
    tweetFormat: "single" as const,
    additionalInfo: "",
    personaId: "default",
  });

  const handleGenerate = async () => {
    setLoading(true);
    setCampaign([]);
    setEmailContent(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Demo-Mode": "true",
        },
        body: JSON.stringify({
          sourceMaterial: {
            url: inputs.url,
            rawText: inputs.text,
            assetUrls: inputs.fileUrls,
          },
          campaignDirectives: {
            platforms: inputs.platforms,
            tweetFormat: inputs.tweetFormat,
            additionalContext: inputs.additionalInfo,
            personaVoice: "Expert Social Media Copywriter", // default persona
          },
        }),
      });

      if (response.status === 403) {
        const data = await response.json();
        if (data.error === "demo_limit_reached") {
          toast.error("Demo limit reached. Sign up to continue.");
          setLoading(false);
          return;
        }
      }

      if (!response.ok) {
        throw new Error("Generation failed");
      }

      const data = await response.json();
      const cleanJson = data.output.replace(/```json/gi, "").replace(/```/gi, "");
      const finalResponse = JSON.parse(cleanJson);
      const finalCampaign = finalResponse.campaign || [];
      const finalEmail = finalResponse.email || null;

      if (finalCampaign.length > 0) {
        setCampaign(finalCampaign);
        setEmailContent(finalEmail);
        setTimeout(() => {
          campaignRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
        toast.success("Content generated!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
              <br />
              <span className="text-xs text-red-500 font-bold mt-2 block">
                One free generation per IP address. Sign up to unlock unlimited usage.
              </span>
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <Distillery
              session={null}
              userPersonas={[]}
              inputs={inputs}
              setInputs={setInputs}
              loading={loading}
              onGenerate={handleGenerate}
            />
          </div>

          {campaign.length > 0 && !loading && (
            <div
              className="mt-16 scroll-mt-32 animate-in fade-in slide-in-from-bottom-8 duration-700"
              ref={campaignRef}
            >
              <div className="mb-8 p-6 bg-slate-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div>
                  <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">
                    Wow. That was fast.
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">
                    Create a free account to unlock full content generation, custom personas,
                    direct social integrations and full history storage.
                  </p>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  Sign Up Free
                </button>
              </div>
              <DistributionGrid
                campaign={campaign}
                session={null}
                selectedPlatforms={inputs.platforms}
                emailContent={emailContent}
                setEmailContent={setEmailContent}
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
