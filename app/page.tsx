"use client";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../lib/supabase"; // Ensure your client is exported from here

// --- Interfaces ---
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
}

// --- Sub-Component: Social Post Card (Remains unchanged) ---
const PostCard = ({ platform, content, day }: PostCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const charLimit = 250;
  const isLong = editedContent.length > charLimit;
  const displayContent =
    isExpanded || isEditing
      ? editedContent
      : editedContent.substring(0, charLimit) + "...";

  const handlePost = async () => {
    if (platform.toLowerCase() !== "discord") return;
    setIsPosting(true);
    try {
      const res = await fetch("/api/post-discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent }),
      });
      if (res.ok) alert("✅ Shared to Discord!");
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
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-slate-400 hover:text-red-600 text-[11px] font-black uppercase transition-colors tracking-widest"
        >
          {isEditing ? "💾 Save" : "✏️ Edit"}
        </button>
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

      <div className="mt-6 pt-5 border-t border-slate-100 flex gap-3">
        <button
          onClick={handlePost}
          disabled={isPosting || isEditing}
          className="flex-1 bg-red-700 text-white text-[11px] font-black py-3.5 rounded-xl active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 transition-all uppercase tracking-[0.2em] shadow-lg shadow-red-900/10"
        >
          {isPosting ? "Processing..." : `Deploy to ${platform}`}
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [inputContent, setInputContent] = useState("");
  const [sourceType, setSourceType] = useState<"url" | "context">("url");
  const [campaign, setCampaign] = useState<CampaignDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Listen for Auth State Changes
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

  // 2. Auth Handlers
  const signInWithGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

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
          // Sending the cryptographically verified User ID to pull your Persona
          userId: session.user.id,
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
      <header className="relative bg-slate-950 pt-20 pb-24 px-6 text-center overflow-hidden">
        {/* The Auth Bridge UI */}
        <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {session.user.user_metadata.preferred_username ||
                  "Authenticated"}
              </span>
              <button
                onClick={signOut}
                className="text-red-500 hover:text-red-400 text-xs font-bold uppercase transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGithub}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full border border-slate-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-xl"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                ></path>
              </svg>
              Connect GitHub
            </button>
          )}
        </div>

        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-slate-900/40 rounded-full blur-[100px]"></div>

        <div className="relative z-10 flex flex-col items-center mt-8">
          <div className="mb-6 bg-red-700 p-4 rounded-3xl shadow-2xl shadow-red-950/40 group hover:rotate-6 transition-transform duration-500 cursor-pointer">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L19 12L12 22L5 12L12 2Z" fill="white" />
              <circle
                cx="16"
                cy="8"
                r="4"
                fill="#7f1d1d"
                className="group-hover:fill-red-900 transition-colors"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Writer<span className="text-red-600">Helper</span>
          </h1>
          <p className="text-slate-500 mt-3 text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-4">
            <span className="w-8 h-[1px] bg-slate-800"></span>
            Context Tank 🌿
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
                  className="flex-1 px-6 py-4 outline-none text-slate-900 text-lg font-bold placeholder:text-slate-300 bg-transparent transition-all"
                  placeholder="Paste source URL here..."
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  disabled={!session}
                />
              ) : (
                <textarea
                  className="flex-1 px-6 py-4 outline-none text-slate-900 text-sm font-medium placeholder:text-slate-300 bg-transparent min-h-[140px] resize-y transition-all"
                  placeholder={
                    session
                      ? "Paste your 5G optimization research gaps, transcripts, or drafts here..."
                      : "Please connect GitHub to unlock the Context Tank..."
                  }
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  disabled={!session}
                />
              )}
              <button
                onClick={generateCampaign}
                disabled={loading || !inputContent || !session}
                className="bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-800 transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 mt-2 md:mt-0"
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

      {/* Main Campaign Grid */}
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
