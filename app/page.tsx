"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import PostCard from "../components/PostCard";
import Footer from "../components/Footer";

interface CampaignDay {
  day: number;
  x: string;
  linkedin: string;
  discord: string;
  [key: string]: string | number;
}

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [campaign, setCampaign] = useState<CampaignDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [personaVoice, setPersonaVoice] = useState("");
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [isSavingPersona, setIsSavingPersona] = useState(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pastCampaigns, setPastCampaigns] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchHistory(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchHistory(session.user.id);
      } else {
        setPastCampaigns([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("persona_voice, discord_webhook")
      .eq("user_id", userId)
      .maybeSingle();
    if (data) {
      setPersonaVoice(
        data.persona_voice ||
          "You are a professional technical writer and developer educator."
      );
      setDiscordWebhook(data.discord_webhook || "");
    }
  };

  const fetchHistory = async (userId: string) => {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setPastCampaigns(data);
  };

  const savePersona = async () => {
    if (!session?.user) return;
    setIsSavingPersona(true);
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      let dbError;
      if (existingProfile) {
        const { error } = await supabase
          .from("profiles")
          .update({
            persona_voice: personaVoice,
            discord_webhook: discordWebhook,
          })
          .eq("user_id", session.user.id);
        dbError = error;
      } else {
        const { error } = await supabase.from("profiles").insert({
          user_id: session.user.id,
          display_name: session.user.user_metadata?.full_name || "Writer",
          persona_voice: personaVoice,
          discord_webhook: discordWebhook,
        });
        dbError = error;
      }
      if (dbError) throw dbError;
      setIsSettingsOpen(false);
      alert("✅ Identity & Webhook saved successfully!");
    } catch (err: any) {
      alert(`❌ Failed to save settings: ${err.message}`);
    } finally {
      setIsSavingPersona(false);
    }
  };

  const signInWithGithub = async () =>
    await supabase.auth.signInWithOAuth({ provider: "github" });
  const signOut = async () => await supabase.auth.signOut();

  const generateCampaign = async () => {
    if (!session?.user) return setError("Please authenticate via GitHub.");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urlContext: urlInput,
          textContext: textInput,
          personaVoice: personaVoice,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server Error");

      const cleanJson = data.output.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.campaign) {
        setCampaign(parsed.campaign);
        await supabase.from("campaigns").insert({
          user_id: session.user.id,
          source_url: urlInput,
          source_notes: textInput,
          generated_content: parsed.campaign,
        });
        fetchHistory(session.user.id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to orchestrate strategy.");
    } finally {
      setLoading(false);
    }
  };

  const restoreCampaign = (pastRecord: any) => {
    setUrlInput(pastRecord.source_url || "");
    setTextInput(pastRecord.source_notes || "");
    setCampaign(pastRecord.generated_content);
    setIsHistoryOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] font-sans text-slate-900 selection:bg-red-100 selection:text-red-900">
      {/* Modals remain the same... */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl border-4 border-slate-900 relative">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-red-600 font-black text-xl transition-colors"
            >
              ×
            </button>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-1">
              Identity Settings
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
              Configure your Agentic Persona
            </p>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-800 mb-2">
              System Prompt / Voice
            </label>
            <textarea
              value={personaVoice}
              onChange={(e) => setPersonaVoice(e.target.value)}
              className="w-full min-h-[150px] p-4 text-sm text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-red-600/50 bg-slate-50 font-medium leading-relaxed resize-y"
            />
            <label className="block text-xs font-black uppercase tracking-widest text-slate-800 mt-6 mb-2">
              Discord Webhook URL
            </label>
            <input
              value={discordWebhook}
              onChange={(e) => setDiscordWebhook(e.target.value)}
              className="w-full px-4 py-3 text-sm text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-red-600/50 bg-slate-50 font-medium mb-6 transition-colors"
            />
            <button
              onClick={savePersona}
              disabled={isSavingPersona}
              className="w-full bg-red-700 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-red-800 transition-all active:scale-95 disabled:bg-slate-300"
            >
              {isSavingPersona ? "Syncing..." : "Update Persona Matrix"}
            </button>
          </div>
        </div>
      )}

      {isHistoryOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl border-4 border-slate-900 relative max-h-[80vh] flex flex-col">
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-red-600 font-black text-xl transition-colors"
            >
              ×
            </button>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-1">
              Context History
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
              Restore past generations
            </p>

            <div className="overflow-y-auto pr-2 space-y-4 flex-1">
              {pastCampaigns.length === 0 ? (
                <p className="text-slate-400 text-sm italic text-center py-10">
                  No past campaigns found.
                </p>
              ) : (
                pastCampaigns.map((record) => (
                  <div
                    key={record.id}
                    className="border border-slate-200 p-4 rounded-xl hover:border-red-600/30 hover:bg-red-50/20 transition-all flex justify-between items-center group"
                  >
                    <div className="flex-1 truncate pr-4">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                        {new Date(record.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {record.source_url
                          ? `🔗 ${record.source_url}`
                          : "📝 Custom Notes Provided"}
                      </p>
                    </div>
                    <button
                      onClick={() => restoreCampaign(record)}
                      className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <header className="relative bg-slate-950 pt-20 pb-24 px-6 text-center overflow-hidden shrink-0">
        <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800">
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
              >
                📚 History
              </button>
              <div className="w-[1px] h-4 bg-slate-700"></div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-[10px] font-black uppercase tracking-widest text-white hover:text-red-400 transition-colors cursor-pointer flex items-center gap-2"
              >
                ⚙️{" "}
                {session.user.user_metadata.preferred_username ||
                  session.user.user_metadata.full_name ||
                  "Authenticated"}
              </button>
              <div className="w-[1px] h-4 bg-slate-700"></div>
              <button
                onClick={signOut}
                className="text-slate-500 hover:text-red-500 text-[10px] font-bold uppercase transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGithub}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full border border-slate-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-xl"
            >
              Connect GitHub
            </button>
          )}
        </div>

        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-slate-900/40 rounded-full blur-[100px]"></div>

        <div className="relative z-10 flex flex-col items-center mt-8">
          <div className="mb-6 bg-red-700 p-4 rounded-3xl shadow-2xl shadow-red-950/40 cursor-pointer">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L19 12L12 22L5 12L12 2Z" fill="white" />
              <circle cx="16" cy="8" r="4" fill="#7f1d1d" />
            </svg>
          </div>

          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Writer<span className="text-red-600">Helper</span>
          </h1>
          <p className="text-slate-500 mt-3 text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-4">
            <span className="w-8 h-[1px] bg-slate-800"></span> Context Tank 🌿{" "}
            <span className="w-8 h-[1px] bg-slate-800"></span>
          </p>

          <div className="mt-10 max-w-3xl mx-auto w-full">
            <div className="flex flex-col gap-4 p-5 bg-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl border-[4px] border-slate-800/50 focus-within:border-red-900/50 transition-colors">
              <div className="flex items-center bg-white rounded-2xl px-5 py-2 shadow-inner border border-slate-200">
                <span className="text-xl mr-3 opacity-50">🔗</span>
                <input
                  className="flex-1 outline-none text-slate-900 text-sm font-bold bg-transparent py-2 placeholder:text-slate-400"
                  placeholder="Paste an article URL here..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={!session}
                />
              </div>

              <div className="flex items-start bg-white rounded-2xl px-5 py-3 shadow-inner border border-slate-200">
                <span className="text-xl mr-3 mt-1 opacity-50">📝</span>
                <textarea
                  className="flex-1 outline-none text-slate-900 text-sm font-medium bg-transparent min-h-[100px] resize-y placeholder:text-slate-400"
                  placeholder={
                    session
                      ? "Add specific instructions, research gaps, or rough notes for this post..."
                      : "Please connect GitHub to unlock the Context Tank..."
                  }
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={!session}
                />
              </div>

              <button
                onClick={generateCampaign}
                disabled={loading || (!urlInput && !textInput) || !session}
                className="w-full bg-red-700 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-red-800 transition-all active:scale-95 disabled:bg-slate-300 disabled:text-slate-500 mt-1 shadow-lg shadow-red-900/20"
              >
                {loading ? "Reasoning & Ingesting..." : "Synthesize Strategy"}
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-8 text-red-400 text-[10px] font-black uppercase bg-red-950/40 py-2 px-6 rounded-full inline-block border border-red-900/50">
              {error}
            </p>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto p-12 w-full">
        {/* LANDING PAGE HERO (Displays when no campaign is loaded) */}
        {!campaign.length && !loading && (
          <div className="py-20 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 mb-6 italic">
              Turn Research into Reach.
            </h2>
            <p className="text-slate-600 font-medium leading-relaxed mb-10">
              Generic AI tools fail because they lack the author's context,
              voice, and research. WriterHelper is an Agentic Content Engine
              that ingests your raw links and notes, processes them through your
              custom Persona Matrix, and architects ready-to-deploy distribution
              pipelines for X, LinkedIn, and Discord.
            </p>
            {!session && (
              <button
                onClick={signInWithGithub}
                className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
              >
                Connect GitHub to Start
              </button>
            )}
          </div>
        )}

        {/* DISTRIBUTION PIPELINES (Displays when campaign exists) */}
        {campaign.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {["X", "LinkedIn", "Discord"].map((platform) => (
              <div key={platform}>
                <div className="flex items-center gap-3 mb-10 border-b-2 border-slate-100 pb-4">
                  <span className="text-red-600 text-xl font-black italic">
                    ✦
                  </span>
                  <h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-800">
                    {platform} Pipeline
                  </h2>
                </div>
                <div className="space-y-8">
                  {campaign.map((dayData, idx) => (
                    <PostCard
                      key={idx}
                      day={dayData.day}
                      platform={platform}
                      content={String(dayData[platform.toLowerCase()] || "")}
                      webhookUrl={discordWebhook}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
