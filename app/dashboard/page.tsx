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
import DynamicLoader from "../../components/DynamicLoader";
import { usePostHog } from "posthog-js/react";

export default function Dashboard() {
  const posthog = usePostHog(); // ✨ Initialize PostHog
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<CampaignDay[]>([]);
  const [inputs, setInputs] = useState<{
    url: string;
    text: string;
    personaId: string;
    additionalInfo: string;
    file: File | null;
    tweetFormat: "single" | "thread";
  }>({
    url: "",
    text: "",
    file: null,
    tweetFormat: "single",
    personaId: "default",
    additionalInfo: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pastCampaigns, setPastCampaigns] = useState<any[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userPersonas, setUserPersonas] = useState<
    { id: string; name: string; prompt: string }[]
  >([]);

  const campaignRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // URL Error Catcher
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const searchParams = new URLSearchParams(window.location.search);
    const errorDesc =
      hashParams.get("error_description") ||
      searchParams.get("error_description");

    if (errorDesc) {
      setErrorMessage(decodeURIComponent(errorDesc).replace(/\+/g, " "));
      window.history.replaceState(null, "", window.location.pathname);
    }

    // Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      if (session?.user) fetchHistory(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      setSession(session);
      if (session?.user) {
        fetchHistory(session.user.id);
        // 🚨 UPGRADED TOKEN CATCHER 🚨
        if (session.provider_token) {
          // Because users can link accounts, we must figure out WHICH provider this token belongs to.
          // We do this by finding the most recently updated identity in their session.
          const identities = session.user.identities || [];
          const latestIdentity = identities.reduce((prev: any, current: any) =>
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
              provider: provider, // Accurately logs 'x' or 'linkedin_oidc' even if they signed up with Google
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id, provider" }
          );
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ✨ 1. Define the function OUTSIDE the useEffect so the whole file can use it
  const fetchPersonas = async () => {
    console.log("1. fetchPersonas triggered...");

    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    if (!currentSession) {
      console.log("2. No session found. Aborting fetch.");
      return;
    }

    console.log("3. Session found, fetching from database...");
    const { data, error } = await supabase
      .from("user_personas")
      .select("id, name, prompt")
      .eq("user_id", currentSession.user.id)
      .order("created_at", { ascending: false });

    if (data) {
      console.log("4. Personas fetched successfully:", data);
      setUserPersonas(data);
    } else if (error) {
      console.error("4. Failed to fetch personas:", error);
    }
  };

  useEffect(() => {
    console.log("0. Dashboard Component Mounted. Running useEffect...");
    fetchPersonas();

    window.addEventListener("refreshPersonas", fetchPersonas);

    return () => {
      window.removeEventListener("refreshPersonas", fetchPersonas);
    };
  }, []); // <-- Double-checking this is strictly empty!

  const fetchHistory = async (userId: string) => {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setPastCampaigns(data);
  };

  const restoreCampaign = (record: any) => {
    setInputs({
      url: record.source_url || "",
      text: record.source_notes || "",
      file: null,
      tweetFormat: "single",
      personaId: "default", // ✨ FIXED: Added missing property
      additionalInfo: "",
    });
    setCampaign(record.generated_content);
    setIsHistoryOpen(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage("");
    setCampaign([]); // Instantly clears the old grid

    // ✨ THE UPGRADE: Find the selected persona's exact instructions
    let finalVoicePrompt = "Senior Content Engineer"; // The ultimate fallback

    if (inputs.personaId && inputs.personaId !== "default") {
      // 1. Look up the specific persona from the database array we fetched
      const selectedPersona = userPersonas.find(
        (p) => p.id === inputs.personaId
      );
      if (selectedPersona && selectedPersona.prompt) {
        finalVoicePrompt = selectedPersona.prompt;
      }
    } else if (session?.user?.user_metadata?.persona) {
      // 2. Fallback to their old workspace preference if they just selected "Default"
      finalVoicePrompt = session.user.user_metadata.persona;
    }

    console.log("🤖 Injecting Voice Prompt into AI:", finalVoicePrompt);

    try {
      const formData = new FormData();
      if (inputs.url) formData.append("urlContext", inputs.url);
      if (inputs.text) formData.append("textContext", inputs.text);
      if (inputs.file) formData.append("file", inputs.file);
      if (inputs.additionalInfo) {
        formData.append("additionalInfo", inputs.additionalInfo);
      }
      formData.append("tweetFormat", inputs.tweetFormat);

      // ✨ Injecting the dynamic prompt into the API payload
      formData.append("personaVoice", finalVoicePrompt);

      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        // ✨ NEW: Sanitized Error Message instead of revealing backend stack traces
        setErrorMessage(
          "We encountered a hiccup connecting to the AI engine. Please try again."
        );
        setLoading(false);
        return;
      }

      const cleanJson = data.output
        .replace(/```json/gi, "")
        .replace(/```/gi, "");
      const finalCampaign = JSON.parse(cleanJson);

      if (finalCampaign.campaign) {
        setCampaign(finalCampaign.campaign);
        posthog.capture("campaign_generated", {
          format: inputs.tweetFormat,
          persona_used:
            finalVoicePrompt === "Senior Content Engineer"
              ? "Default"
              : "Custom",
          has_additional_info: inputs.additionalInfo.length > 0,
        });
        setTimeout(() => {
          campaignRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);

        if (session?.user) {
          await supabase.from("campaigns").insert({
            user_id: session.user.id,
            source_url: inputs.url,
            source_notes: inputs.text,
            generated_content: finalCampaign.campaign,
          });
          fetchHistory(session.user.id);
        }
      }
    } catch (err) {
      console.error("Context error:", err);
      // ✨ NEW: Sanitized JSON parsing error
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
            <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2 shadow-sm">
              <span className="text-lg">⚠️</span> {errorMessage}
            </div>
          )}

          {!loading ? (
            <Distillery
              session={session}
              inputs={inputs}
              setInputs={setInputs}
              onGenerate={handleGenerate}
              loading={loading}
              userPersonas={userPersonas}
              onOpenSettings={() => {
                window.dispatchEvent(new Event("openSettingsModal"));
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[400px] animate-in fade-in zoom-in-95 duration-500">
              <DynamicLoader />
            </div>
          )}

          {campaign.length > 0 && !loading && (
            <div className="mt-16 scroll-mt-32" ref={campaignRef}>
              <DistributionGrid campaign={campaign} session={session} />
            </div>
          )}
        </div>
      </main>

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
      <Footer />
    </div>
  );
}
