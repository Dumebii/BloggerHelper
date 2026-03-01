"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 1. Define the shape of a single campaign day
interface CampaignDay {
  day: number;
  x: string;
  linkedin: string;
  discord: string;
  [key: string]: string | number; // Allows dynamic access like dayData[platform.toLowerCase()]
}

// 2. Define the props for the PostCard component
interface PostCardProps {
  platform: string;
  content: string;
  day: number;
}

// --- Sub-Component: Social Post Card with Types ---
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
    if (platform.toLowerCase() !== "discord") {
      alert(`${platform} integration is in the v2 roadmap!`);
      return;
    }

    setIsPosting(true);
    try {
      const res = await fetch("/api/post-discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent }),
      });
      if (res.ok) {
        alert("✅ Posted to Discord!");
      } else {
        throw new Error("Failed");
      }
    } catch (err) {
      alert("❌ Post failed. Verify your Webhook.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-3">
        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
          Day {day}
        </span>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-slate-400 hover:text-blue-600 text-xs font-semibold uppercase transition-colors flex items-center gap-1"
        >
          {isEditing ? "💾 Save" : "✏️ Edit"}
        </button>
      </div>

      <div className="mt-2 min-h-[100px]">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full min-h-[180px] p-3 text-sm text-slate-700 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 font-mono"
          />
        ) : (
          <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayContent}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {!isEditing && isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 text-[11px] mt-3 font-bold hover:text-blue-800 uppercase"
        >
          {isExpanded ? "↑ Show Less" : "↓ Read More"}
        </button>
      )}

      <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
        <button
          onClick={handlePost}
          disabled={isPosting || isEditing}
          className="flex-1 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-blue-600 disabled:bg-slate-300 transition-all active:scale-95"
        >
          {isPosting ? "Sending..." : `Push to ${platform}`}
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(editedContent);
            alert("Copied!");
          }}
          className="px-3 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500"
        >
          📋
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function Home() {
  const [url, setUrl] = useState("");
  // 3. Initialize state with the CampaignDay type to fix the 'never' error
  const [campaign, setCampaign] = useState<CampaignDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateCampaign = async () => {
    setLoading(true);
    setError("");
    setCampaign([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ articleUrl: url }),
      });

      const data = await res.json();
      const cleanJson = data.output.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.campaign) {
        setCampaign(parsed.campaign);
      } else {
        throw new Error("Invalid Campaign format");
      }
    } catch (err) {
      setError("Generation failed. Please verify the URL and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 py-10 px-6 text-center shadow-sm">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
          Agentic Scheduler <span className="text-blue-600">v2</span>
        </h1>
        <div className="mt-8 max-w-2xl mx-auto flex gap-2 p-1 bg-white border border-slate-300 rounded-2xl">
          <input
            className="flex-1 bg-transparent px-5 py-3 outline-none text-slate-700 text-sm"
            placeholder="Paste article URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={generateCampaign}
            disabled={loading || !url}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-md"
          >
            {loading ? "Thinking..." : "Generate"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {!campaign.length && !loading && (
          <div className="text-center py-32 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
            <p className="text-slate-400 font-medium italic">
              Enter a URL to architect your strategy.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {["X", "LinkedIn", "Discord"].map((platform) => (
            <div key={platform} className="flex flex-col">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-2">
                {platform} Pipeline
              </h2>
              <div className="space-y-4">
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
      </main>
    </div>
  );
}
