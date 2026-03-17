"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { CampaignDay } from "../../lib/types";
import Link from "next/link";
import Distillery from "../../components/ContextEngine";
import DistributionGrid from "../../components/DistributionGrid";
import UpgradeBanner from "../../components/GuestModeBanner";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthModal from "../../components/AuthModal";
import DynamicLoader from "../../components/DynamicLoader"; // 👈 import
import SkeletonGrid from "@/components/SkeletonGrid";
import ScheduledPostsModal from "../../components/ScheduledPostsModal";

export default function Dashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<CampaignDay[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const [isScheduledOpen, setIsScheduledOpen] = useState(false);

  const [inputs, setInputs] = useState({
    url: "",
    text: "",
    files: [],
    fileUrls: [],
    platforms: ["x", "linkedin", "discord"],
    tweetFormat: "single" as const,
    additionalInfo: "",
    personaId: "default",
  });
  
  const [errorMessage, setErrorMessage] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pastCampaigns, setPastCampaigns] = useState<any[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const campaignRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePersonaRefresh = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id) {
          fetchPersonas(session.user.id);
        }
      });
    };
    window.addEventListener("refreshPersonas", handlePersonaRefresh);

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    const errorDesc =
      hashParams.get("error_description") ||
      searchParams.get("error_description");

    if (errorDesc) {
      setErrorMessage(decodeURIComponent(errorDesc).replace(/\+/g, " "));
      window.history.replaceState(null, "", window.location.pathname);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchHistory(session.user.id);
        fetchPersonas(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        fetchHistory(session.user.id);
        fetchPersonas(session.user.id);
        
        if (session.provider_token) {
          const identities = session.user.identities || [];
          const latestIdentity = identities.reduce((prev, current) =>
            new Date(prev.updated_at || 0).getTime() >
            new Date(current.updated_at || 0).getTime()
              ? prev
              : current
          );

          const provider = latestIdentity
            ? latestIdentity.provider
            : session.user.app_metadata.provider;

          await supabase.from("user_tokens").upsert(
            {
              user_id: session.user.id,
              provider: provider,
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id, provider" }
          );
        }
      } else {
        setPersonas([]);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("refreshPersonas", handlePersonaRefresh);
    };
  }, []);

  const fetchHistory = async (userId: string) => {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setPastCampaigns(data);
  };

  const fetchPersonas = async (userId: string) => {
    const { data } = await supabase
      .from("user_personas")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setPersonas(data);
  };

  const restoreCampaign = (record: any) => {
    setInputs({
      url: record.source_url || "",
      text: record.source_notes || "",
      files: [],
      fileUrls: [],
      platforms: ["x", "linkedin", "discord"],
      tweetFormat: "single",
      additionalInfo: "",
      personaId: "default",
    });
    setCampaign(record.generated_content);
    setIsHistoryOpen(false);
  };

const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage("");
    setCampaign([]);

    try {
      // 1. Resolve the Persona Voice
      let selectedVoice = "Expert Social Media Copywriter who adapts perfectly to the provided context";
      if (inputs.personaId && inputs.personaId !== "default") {
        const found = personas.find((p: any) => p.id === inputs.personaId);
        if (found && found.prompt) {
          selectedVoice = found.prompt;
        }
      }

      // 2. Construct the ultimate AI JSON Payload
      const payload = {
        sourceMaterial: {
          url: inputs.url,
          rawText: inputs.text,
          assetUrls: inputs.fileUrls, // 🚀 Injecting the Cloudflare R2 links!
        },
        campaignDirectives: {
          platforms: inputs.platforms,
          tweetFormat: inputs.tweetFormat,
          additionalContext: inputs.additionalInfo,
          personaVoice: selectedVoice, 
        }
      };

      console.log("🚀 Firing payload to AI:", payload);

      // 3. Send as application/json instead of FormData
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMsg = "We encountered a hiccup connecting to the AI engine. Please try again.";
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch (parseError) {
          console.error("Failed to parse error response");
        }
        setErrorMessage(errorMsg);
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.error) {
        setErrorMessage(data.error);
        setLoading(false);
        return;
      }

      // 4. Parse the LLM output
      const cleanJson = data.output
        .replace(/```json/gi, "")
        .replace(/```/gi, "");
      const finalCampaign = JSON.parse(cleanJson);

      if (finalCampaign.campaign) {
        setCampaign(finalCampaign.campaign);
        setTimeout(() => {
          campaignRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);

        // 5. Save to Supabase History
        if (session?.user) {
          await supabase.from("campaigns").insert({
            user_id: session.user.id,
            source_url: inputs.url,
            // Optionally, you could append the fileUrls to source_notes so you know what was referenced
            source_notes: inputs.text || inputs.fileUrls.join(", "), 
            generated_content: finalCampaign.campaign,
          });
          fetchHistory(session.user.id);
        }
      }
    } catch (err) {
      console.error("Context error:", err);
      setErrorMessage(
        "The AI returned an unexpected format. Please try tweaking your context and generating again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fafafa] font-sans text-slate-900 min-h-screen flex flex-col">
      <Header
        session={session}
        onSignIn={() => setIsAuthModalOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenScheduled={() => setIsScheduledOpen(true)} // 👈 new
      />

      {isHistoryOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl border-4 border-slate-900 relative max-h-[80vh] flex flex-col">
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-red-600 font-black text-xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6">
              Strategy History
            </h2>
            <div className="overflow-y-auto space-y-4">
              {pastCampaigns.map((record) => (
                <div
                  key={record.id}
                  className="border border-slate-200 p-4 rounded-xl flex justify-between items-center group hover:bg-red-50/20"
                >
                  <div className="truncate pr-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(record.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-medium truncate">
                      {record.source_url || "Custom Text Strategy"}
                    </p>
                  </div>
                  <button
                    onClick={() => restoreCampaign(record)}
                    className="bg-slate-900 text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="pt-28 md:pt-32 pb-8 flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 w-full">
          {!session && (
            <UpgradeBanner onSignIn={() => setIsAuthModalOpen(true)} />
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-700 transition-colors mb-8"
          >
            <span className="text-lg leading-none">←</span> Back to Home
          </Link>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-12">
            Context Engine
          </h2>

          {errorMessage && (
            <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
              <span className="text-xl">⚠️</span> {errorMessage}
            </div>
          )}

          {/* Show Distillery only when NOT loading and no campaign */}
          {!loading && !campaign.length && (
            <Distillery
              session={session}
              userPersonas={personas}
              inputs={inputs}
              setInputs={setInputs}
              loading={loading}
              onOpenSettings={() => window.dispatchEvent(new Event("openSettingsModal"))}
              onGenerate={handleGenerate}
            />
          )}

          {/* Show loader while loading */}
          {loading && (
            <div className="mt-8 flex justify-center">
              <SkeletonGrid />
            </div>
          )}

          {/* Show campaign when ready */}
          {campaign.length > 0 && !loading && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-8">
              <div className="flex justify-between items-center mb-8">
                <button
                  onClick={() => setCampaign([])}
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-700 transition-colors bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md active:scale-95"
                >
                  ← Architect New Campaign
                </button>
              </div>
              <div className="scroll-mt-32" ref={campaignRef}>
                <DistributionGrid
                  campaign={campaign}
                  selectedPlatforms={inputs.platforms}
                  session={session}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
        {isScheduledOpen && (
  <ScheduledPostsModal onClose={() => setIsScheduledOpen(false)} />
)}
      <Footer />
    </div>
  );
}