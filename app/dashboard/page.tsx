"use client";
import { useState, useRef, useEffect } from "react";
import { Mail, Sparkles, User } from "lucide-react";
import Distillery from "@/components/ContextEngine";
import DistributionGrid from "@/components/DistributionGrid";
import GuestModeBanner from "@/components/GuestModeBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import SkeletonGrid from "@/components/SkeletonGrid";
import ScheduledPostsModal from "@/components/ScheduledPostsModal";
import SettingsModal from "@/components/SettingsModal";
import Sidebar from "@/components/dashboard/Sidebar";
import StatsWidget from "@/components/dashboard/StatsWidget";
import EmailBanner from "@/components/dashboard/EmailBanner";
import HistoryModal from "@/components/dashboard/HistoryModal";
import SubscribersModal from "@/components/dashboard/SubscribersModal";
import PersonasModal from "@/components/dashboard/PersonasModal";
import { useSession } from "@/components/hooks/useSession";
import { usePersonas } from "@/components/hooks/usePersonas";
import { useCampaignHistory } from "@/components/hooks/useCampaignHistory";
import { useStats } from "@/components/hooks/useStats";
import { useEmailBanner } from "@/components/hooks/useEmailBanner";
import { supabase } from "@/lib/supabase/client";
import CopilotPanel from "@/components/CopilotPannel";
import CopilotSettingsModal from "@/components/CopilotSettingsModal";


export default function Dashboard() {
  // --- SESSION ---
  const { session, sessionLoading } = useSession();

  // --- CORE STATE ---
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<any[]>([]);
  const [inputs, setInputs] = useState({
    url: "",
    text: "",
    files: [],
    fileUrls: [],
    platforms: ["x", "linkedin", "discord", "email"],
    tweetFormat: "single" as const,
    additionalInfo: "",
    personaId: "default",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [emailContent, setEmailContent] = useState<string | null>(null);
  const campaignRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  // --- DATA HOOKS ---
  const { personas, refreshPersonas } = usePersonas(session?.user?.id);
  const { pastCampaigns, fetchHistory, restoreCampaign } = useCampaignHistory(session?.user?.id);
  const { stats, isLoadingStats, refreshStats } = useStats(session?.user?.id);
  const { needsEmail, setNeedsEmail, dismissBanner } = useEmailBanner(!session?.user?.email);

  // --- MODAL STATES ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isScheduledOpen, setIsScheduledOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSubscribersOpen, setIsSubscribersOpen] = useState(false);
  const [isPersonasOpen, setIsPersonasOpen] = useState(false);

  // --- SIDEBAR STATES ---
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  //copilot states
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isCopilotSettingsOpen, setIsCopilotSettingsOpen] = useState(false);
  

  // --- NAVIGATION ITEMS ---
  const navItems = [
    {
      label: "Generation History",
      icon: <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      onClick: () => setIsHistoryOpen(true),
    },
    {
      label: "Scheduled Posts",
      icon: <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      onClick: () => setIsScheduledOpen(true),
    },
    {
      label: "Subscribers",
      icon: <Mail className="w-5 h-5 opacity-70" />,
      onClick: () => setIsSubscribersOpen(true),
    },
    {
      label: "Personas",
      icon: <User className="w-5 h-5 opacity-70" />,
      onClick: () => setIsPersonasOpen(true),
    },
    {
      label: "Settings & Integrations",
      icon: <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      onClick: () => setIsSettingsOpen(true),
    },
    {
  label: "Copilot Settings",
  icon: <Sparkles className="w-5 h-5 opacity-70" />, // import Sparkles from lucide-react
  onClick: () => setIsCopilotSettingsOpen(true),
},
  ];

  // --- HANDLERS ---
const handleGenerate = async () => {
  setLoading(true);
  setErrorMessage("");
  console.log("Session in generate:", session);
  if (!session?.access_token) {
    setErrorMessage("Your session expired. Please log in again.");
    setLoading(false);
    return;
  }
  setCampaign([]);

  try {
    let selectedVoice =
      "Expert Social Media Copywriter who adapts perfectly to the provided context";
    if (inputs.personaId && inputs.personaId !== "default") {
      const found = personas.find((p: any) => p.id === inputs.personaId);
      if (found && found.prompt) {
        selectedVoice = found.prompt;
      }
    }

    const payload = {
      sourceMaterial: {
        url: inputs.url,
        rawText: inputs.text,
        assetUrls: inputs.fileUrls,
      },
      campaignDirectives: {
        platforms: inputs.platforms,
        tweetFormat: inputs.tweetFormat,
        additionalContext: inputs.additionalInfo,
        personaVoice: selectedVoice,
      },
    };

    console.log("🚀 Firing payload to AI:", payload);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMsg =
        "We encountered a hiccup connecting to the AI engine. Please try again.";
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

      if (session?.user) {
        await supabase.from("campaigns").insert({
          user_id: session.user.id,
          source_url: inputs.url,
          source_notes: inputs.text || inputs.fileUrls.join(", "),
          generated_content: finalCampaign,
        });
        fetchHistory(session.user.id); // from useCampaignHistory
        refreshStats(); // from useStats
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

  const handleEmailAdded = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) setNeedsEmail(false);
  };

  // --- EFFECTS ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("openSettings") === "true") {
      window.dispatchEvent(new Event("openSettingsModal"));
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);
  useEffect(() => {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const searchParams = new URLSearchParams(window.location.search);
  const errorDesc = hashParams.get("error_description") || searchParams.get("error_description");

  if (errorDesc) {
    setErrorMessage(decodeURIComponent(errorDesc).replace(/\+/g, " "));
    window.history.replaceState(null, "", window.location.pathname);
  }
}, []);

  // --- RENDER ---
  if (sessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        navItems={navItems}
        stats={
          <StatsWidget
            stats={stats}
            isLoadingStats={isLoadingStats}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        }
      />

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      <main className="flex-1 h-full overflow-y-auto relative bg-slate-50">
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <Header
            session={session}
            onSignIn={() => setIsAuthModalOpen(true)}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />


        </div>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
          <EmailBanner
            needsEmail={needsEmail}
            onDismiss={dismissBanner}
            onGoToSettings={() => setIsSettingsOpen(true)}
          />

          {!session && <GuestModeBanner onSignIn={() => setIsAuthModalOpen(true)} />}

          {errorMessage && (
            <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
              <span className="text-xl">⚠️</span> {errorMessage}
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 mt-6">
            {!loading && campaign.length === 0 && (
              <Distillery
                session={session}
                userPersonas={personas}
                inputs={inputs}
                setInputs={setInputs}
                loading={loading}
                onOpenSettings={() => {
                  window.dispatchEvent(new Event("openSettingsModal"));
                  setIsSettingsOpen(true);
                }}
                onGenerate={handleGenerate}
              />
            )}

            {loading && (
              <div className="mt-8 flex justify-center">
                <SkeletonGrid />
              </div>
            )}

            {!loading && campaign.length > 0 && (
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
                    emailContent={emailContent}
                    setEmailContent={setEmailContent}
                    onStatsChange={refreshStats}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Floating Copilot Button */}
<button
  onClick={() => setIsCopilotOpen(true)}
  className="fixed bottom-6 right-6 z-40 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
  aria-label="Open Copilot"
>
  <span className="text-2xl">✨</span>
</button>
        <Footer />
      </main>

      {/* MODALS */}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
      {isScheduledOpen && <ScheduledPostsModal onClose={() => setIsScheduledOpen(false)} onStatsChange={refreshStats} />}
      {isSettingsOpen && <SettingsModal session={session} onClose={() => setIsSettingsOpen(false)} onEmailAdded={handleEmailAdded} />}
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} pastCampaigns={pastCampaigns} onRestore={(rec) => restoreCampaign(rec, setInputs, setCampaign)} />
      <SubscribersModal isOpen={isSubscribersOpen} onClose={() => setIsSubscribersOpen(false)} session={session} />
      <PersonasModal isOpen={isPersonasOpen} onClose={() => setIsPersonasOpen(false)} session={session} />
        <CopilotSettingsModal
  isOpen={isCopilotSettingsOpen}
  onClose={() => setIsCopilotSettingsOpen(false)}
  session={session}
/>
        <CopilotPanel
  isOpen={isCopilotOpen}
  onClose={() => setIsCopilotOpen(false)}
  onSendToEngine={(text) => {
    // Pre-fill Distillery's text input with the assistant's message
    setInputs(prev => ({ ...prev, text: text }));
    setIsCopilotOpen(false);
    // Optionally scroll to Distillery
  }}
/>

    </div>
  );
}