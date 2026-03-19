"use client";
import { useState, useEffect, useRef } from "react";
import { CampaignDay } from "../../lib/types";
import Link from "next/link";
import Distillery from "../../components/ContextEngine";
import DistributionGrid from "../../components/DistributionGrid";
import GuestModeBanner from "../../components/GuestModeBanner";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AuthModal from "../../components/AuthModal";
import SkeletonGrid from "@/components/SkeletonGrid";
import ScheduledPostsModal from "../../components/ScheduledPostsModal";
import SettingsModal from "../../components/SettingsModal";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";


export default function Dashboard() {
  // --- CORE DASHBOARD STATE ---
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<CampaignDay[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const [sessionLoading, setSessionLoading] = useState(true);
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const campaignRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  // --- SIDEBAR & STATS STATE ---
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ campaignsGenerated: 0, scheduledCount: 0, personasSaved: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [needsEmail, setNeedsEmail] = useState(false);

  // --- ORIGINAL EFFECTS ---
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handlePersonaRefresh = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id && isMounted.current) {
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

    // Modify the initial session fetch to set sessionLoading false
supabase.auth.getSession().then(({ data: { session } }) => {
  if (isMounted.current) {
    setSession(session);
    setSessionLoading(false); // 👈 done loading
    if (session?.user) {
      fetchHistory(session.user.id);
      fetchPersonas(session.user.id);
      if (!session.user.email) setNeedsEmail(true);
    }
  }
});

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted.current) {
        setSession(session);
      }
      if (session?.user && isMounted.current) {
        fetchHistory(session.user.id);
        fetchPersonas(session.user.id);
        if (!session.user.email) setNeedsEmail(true);

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
      } else if (isMounted.current) {
        setPersonas([]);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("refreshPersonas", handlePersonaRefresh);
    };
  }, []);
  // Add redirect effect
const router = useRouter();

useEffect(() => {
  if (!sessionLoading && !session) {
    router.push('/'); // redirect to home
  }
}, [sessionLoading, session, router]);

  // --- STATS FETCH (corrected: scheduledCount from pending posts) ---
  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user) {
        setIsLoadingStats(false);
        return;
      }
      try {
        const [statsRes, scheduledRes] = await Promise.all([
          supabase
            .from("user_stats")
            .select("campaigns_generated, posts_published, personas_saved")
            .eq("user_id", session.user.id)
            .single(),
          supabase
            .from("scheduled_posts")
            .select("*", { count: "exact", head: true })
            .eq("user_id", session.user.id)
            .eq("status", "pending")
        ]);

        if (statsRes.data) {
          setStats({
            campaignsGenerated: statsRes.data.campaigns_generated || 0,
            scheduledCount: scheduledRes.count || 0,
            personasSaved: statsRes.data.personas_saved || 0,
          });
        }
      } catch (e) {
        console.error("Failed to fetch stats", e);
      }
      setIsLoadingStats(false);
    };
    fetchStats();
  }, [session]);

  // --- ORIGINAL FUNCTIONS ---
  const fetchHistory = async (userId: string) => {
    if (!isMounted.current) return;
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data && isMounted.current) setPastCampaigns(data);
  };

  const fetchPersonas = async (userId: string) => {
    if (!isMounted.current) return;
    const { data } = await supabase
      .from("user_personas")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data && isMounted.current) setPersonas(data);
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
      const finalCampaign = JSON.parse(cleanJson);

      if (finalCampaign.campaign) {
        setCampaign(finalCampaign.campaign);
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
            generated_content: finalCampaign.campaign,
          });
          fetchHistory(session.user.id);
            refreshStats(); // 👈 update stats

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

  // --- Email added callback (refresh session and hide banner) ---
  const handleEmailAdded = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (session?.user?.email) setNeedsEmail(false);
  };

  // Inside Dashboard component, after fetchStats definition
const refreshStats = () => {
setStats((prev) => ({ ...prev, scheduledCount: prev.scheduledCount + 1 }));
};

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("openSettings") === "true") {
      window.dispatchEvent(new Event("openSettingsModal"));
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  // --- Define navigation items for the sidebar ---
  const navItems = [
    {
      label: "Generation History",
      icon: (
        <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => setIsHistoryOpen(true),
    },
    {
      label: "Scheduled Posts",
      icon: (
        <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => setIsScheduledOpen(true),
    },
    {
      label: "Settings & Integrations",
      icon: (
        <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: () => setIsSettingsOpen(true),
    },
  ];

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

if (!session) {
  return null; // will redirect, but prevent flash
}

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* LEFT SIDEBAR */}
      <aside
        className={`
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 transition-all duration-300 ease-in-out
          fixed md:relative z-50 h-full bg-white border-r border-slate-200 flex flex-col shadow-2xl md:shadow-none
          ${isSidebarCollapsed ? "w-20" : "w-64 md:w-72"}
        `}
      >
        {/* Header with toggle */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          {!isSidebarCollapsed ? (
            <Link href="/" className="text-2xl font-black text-slate-800 tracking-tighter">
              Ozigi.
            </Link>
          ) : (
            <div className="w-10 h-10 bg-red-700 rounded-xl flex items-center justify-center mx-auto">
              <span className="text-white font-black text-xl">O</span>
            </div>
          )}
          <button
            className="hidden md:block text-slate-400 hover:text-slate-600"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? "→" : "←"}
          </button>
          <button className="md:hidden text-slate-400" onClick={() => setIsMobileSidebarOpen(false)}>
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => { item.onClick(); setIsMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!isSidebarCollapsed && item.label}
            </button>
          ))}
        </nav>

        {/* Stats widget */}
        {session && (
          <div className={`p-5 border-t border-slate-100 bg-slate-50/50 ${isSidebarCollapsed ? 'text-center' : ''}`}>
            {!isSidebarCollapsed && (
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Your Impact</h3>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-sm flex flex-col justify-center">
                {isLoadingStats ? (
                  <div className="h-6 w-10 bg-slate-200 animate-pulse mx-auto rounded" />
                ) : (
                  <span className="block text-2xl font-black text-slate-800">{stats.campaignsGenerated}</span>
                )}
                {!isSidebarCollapsed && (
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                    Campaigns
                  </span>
                )}
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shadow-sm flex flex-col justify-center">
                {isLoadingStats ? (
                  <div className="h-6 w-10 bg-slate-200 animate-pulse mx-auto rounded" />
                ) : (
                  <span className="block text-2xl font-black text-slate-800">{stats.scheduledCount}</span>
                )}
                {!isSidebarCollapsed && (
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                    Scheduled
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 h-full overflow-y-auto relative bg-slate-50">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <Header
            session={session}
            onSignIn={() => setIsAuthModalOpen(true)}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
          {/* Email reminder banner */}
          {needsEmail && (
            <div className="bg-orange-100 border border-orange-300 text-orange-800 p-4 rounded-xl mb-8 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center shadow-sm relative">
              <button
                onClick={() => setNeedsEmail(false)}
                className="absolute top-2 right-2 text-orange-600 hover:text-orange-800 sm:static sm:order-last sm:ml-auto"
                aria-label="Dismiss"
              >
                ✕
              </button>
              <div>
                <h3 className="font-bold text-sm">Action Required: Secure your account</h3>
                <p className="text-xs mt-1">
                  You signed in with X. Please add an email address in Settings for account recovery and newsletter
                  features.
                </p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="shrink-0 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition"
              >
                Go to Settings
              </button>
            </div>
          )}

          {/* Guest banner */}
          {!session && <GuestModeBanner onSignIn={() => setIsAuthModalOpen(true)} />}

          {/* Error message */}
          {errorMessage && (
            <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4">
              <span className="text-xl">⚠️</span> {errorMessage}
            </div>
          )}

          {/* Main content area */}
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
                      onStatsChange={refreshStats} // new prop

                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </main>

      {/* MODALS */}
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
      {isScheduledOpen && <ScheduledPostsModal onClose={() => setIsScheduledOpen(false)}   onStatsChange={refreshStats} // new prop
 />}
      {isSettingsOpen && (
        <SettingsModal
          session={session}
          onClose={() => setIsSettingsOpen(false)}
          onEmailAdded={handleEmailAdded} // 👈 pass the callback
          
        />
      )}

      {/* History Modal (improved contrast) */}
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
                    {/* Improved contrast: darker text */}
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                      {new Date(record.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 truncate">
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
    </div>
  );
}