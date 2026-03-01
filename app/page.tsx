"use client";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../lib/supabase";

interface CampaignDay {
  day: number;
  x: string;
  linkedin: string;
  discord: string;
  [key: string]: string | number;
}

interface PostCardProps {
  platform: string;
  content: string;
  day: number;
  webhookUrl: string;
}

const PostCard = ({ platform, content, day, webhookUrl }: PostCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isCopied, setIsCopied] = useState(false); // New state for copy feedback

  const charLimit = 250;
  const isLong = editedContent.length > charLimit;
  const displayContent =
    isExpanded || isEditing
      ? editedContent
      : editedContent.substring(0, charLimit) + "...";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      alert("❌ Failed to copy text.");
    }
  };

  const handlePost = async () => {
    if (platform.toLowerCase() !== "discord") return;

    if (!webhookUrl) {
      alert("❌ Please configure your Discord Webhook in Identity Settings.");
      return;
    }

    setIsPosting(true);
    try {
      const res = await fetch("/api/post-discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent, webhookUrl }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Shared to your Discord server!");
      } else {
        alert(
          `❌ Post failed: ${data.error || "Check your webhook settings."}`
        );
      }
    } catch (err) {
      alert("❌ Post failed. Check connection.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-white border-l-4 border-red-700 rounded-r-2xl p-6 mb-6 shadow-sm hover:shadow-md transition-all border-y border-r border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <span className="bg-red-50 text-red-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest">
          Day {day}
        </span>

        {/* New Action Bar with Copy Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className={`${
              isCopied
                ? "text-green-600"
                : "text-slate-400 hover:text-slate-600"
            } text-[11px] font-black uppercase transition-colors tracking-widest`}
          >
            {isCopied ? "✅ Copied" : "📋 Copy"}
          </button>
          <div className="w-[1px] h-3 bg-slate-200"></div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-slate-400 hover:text-red-600 text-[11px] font-black uppercase transition-colors tracking-widest"
          >
            {isEditing ? "💾 Save" : "✏️ Edit"}
          </button>
        </div>
      </div>

      <div className="mt-2 min-h-[100px]">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full min-h-[180px] p-4 text-sm text-slate-900 border border-red-100 rounded-xl outline-none bg-red-50/30 font-mono leading-relaxed focus:ring-2 focus:ring-red-500/20"
          />
        ) : (
          <div className="prose prose-slate prose-sm max-w-none text-slate-900 font-medium leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayContent}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {!isEditing && isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-red-700 text-[11px] mt-4 font-black uppercase tracking-tighter hover:underline"
        >
          {isExpanded ? "↑ Show Less" : "↓ Read More"}
        </button>
      )}

      {/* Conditionally render the Deploy button ONLY for Discord to keep the UI clean */}
      {platform.toLowerCase() === "discord" && (
        <div className="mt-6 pt-5 border-t border-slate-100 flex gap-3">
          <button
            onClick={handlePost}
            disabled={isPosting || isEditing}
            className="flex-1 bg-red-700 text-white text-[11px] font-black py-3.5 rounded-xl active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 transition-all uppercase tracking-[0.2em] shadow-lg shadow-red-900/10"
          >
            {isPosting ? "Processing..." : `Deploy to ${platform}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [inputContent, setInputContent] = useState("");
  const [sourceType, setSourceType] = useState<"url" | "context">("url");
  const [campaign, setCampaign] = useState<CampaignDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [personaVoice, setPersonaVoice] = useState("");
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [isSavingPersona, setIsSavingPersona] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
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
          "You are a professional technical writer and developer educator. Your tone is highly technical, concise, and structured for maximum readability."
      );
      setDiscordWebhook(data.discord_webhook || "");
    }
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
          display_name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.preferred_username ||
            "Writer",
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
    if (!session?.user) {
      setError("Please authenticate via GitHub to orchestrate context.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: inputContent,
          sourceType: sourceType,
          personaVoice: personaVoice, // Explicitly sending the persona here!
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server Error");

      const cleanJson = data.output.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.campaign) setCampaign(parsed.campaign);
    } catch (err: any) {
      setError(err.message || "Failed to orchestrate strategy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 selection:bg-red-100 selection:text-red-900">
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

      <header className="relative bg-slate-950 pt-20 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800">
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

          <div className="mt-10 max-w-2xl mx-auto w-full">
            <div className="flex justify-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setSourceType("url")}
                className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-t-xl transition-colors ${
                  sourceType === "url"
                    ? "bg-white text-slate-900"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                🔗 Web Link
              </button>
              <button
                type="button"
                onClick={() => setSourceType("context")}
                className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-t-xl transition-colors ${
                  sourceType === "context"
                    ? "bg-white text-slate-900"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                📝 Added Context
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-0 p-1.5 bg-white rounded-b-3xl rounded-tr-3xl shadow-2xl border-[6px] border-slate-900 focus-within:border-red-900/30 transition-colors">
              {sourceType === "url" ? (
                <input
                  className="flex-1 px-6 py-4 outline-none text-slate-900 text-lg font-bold placeholder:text-slate-300 bg-transparent"
                  placeholder="Paste source URL here..."
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  disabled={!session}
                />
              ) : (
                <textarea
                  className="flex-1 px-6 py-4 outline-none text-slate-900 text-sm font-medium placeholder:text-slate-300 bg-transparent min-h-[140px] resize-y"
                  placeholder={
                    session
                      ? "Paste your notes here..."
                      : "Please connect GitHub..."
                  }
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  disabled={!session}
                />
              )}
              <button
                onClick={generateCampaign}
                disabled={loading || !inputContent || !session}
                className="bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-800 transition-all active:scale-95 disabled:bg-slate-200 mt-2 md:mt-0"
              >
                {loading ? "Reasoning..." : "Ingest"}
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

      <main className="max-w-7xl mx-auto p-12">
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
        {!campaign.length && !loading && (
          <div className="text-center py-40 border-2 border-dashed border-slate-200 rounded-[40px] bg-white/40">
            <p className="text-slate-300 font-bold uppercase tracking-[0.3em] text-[10px]">
              Awaiting Context Injection 🌿
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
