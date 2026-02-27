"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- Sub-Component: Social Post Card ---
const PostCard = ({ platform, content, day, url }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  // Logic for truncation
  const charLimit = 250;
  const isLong = content.length > charLimit;
  const displayContent = isExpanded
    ? content
    : content.substring(0, charLimit) + "...";

  const handlePost = async () => {
    if (platform.toLowerCase() !== "discord") {
      alert(
        `${platform} API integration required for auto-posting. Copy/Paste for now!`
      );
      return;
    }

    setIsPosting(true);
    try {
      // Assuming you set up a /api/post-discord route
      const res = await fetch("/api/post-discord", {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      if (res.ok) alert("Successfully posted to Discord!");
    } catch (err) {
      alert("Failed to post to Discord. Check your Webhook URL.");
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
        <span className="text-slate-400 text-xs font-medium uppercase">
          {platform}
        </span>
      </div>

      <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {displayContent}
        </ReactMarkdown>
      </div>

      {isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 text-xs mt-3 font-semibold hover:text-blue-800 transition-colors"
        >
          {isExpanded ? "↑ Show Less" : "↓ Read More"}
        </button>
      )}

      <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
        <button
          onClick={handlePost}
          disabled={isPosting}
          className="flex-1 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-blue-600 disabled:bg-slate-300 transition-all"
        >
          {isPosting ? "Posting..." : `Post to ${platform}`}
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(content)}
          className="px-3 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          title="Copy to clipboard"
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
  const [campaign, setCampaign] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateCampaign = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ articleUrl: url }),
      });
      const data = await res.json();

      // Clean the AI output in case it wrapped JSON in markdown blocks
      const cleanJson = data.output.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      setCampaign(parsed.campaign);
    } catch (err) {
      setError(
        "Failed to generate campaign. Ensure your API returns valid JSON."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 py-8 px-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-blue-600">
          BloggerHelper <span className="text-blue-600"></span>
        </h1>
        <p className="text-slate-500 mt-2 text-sm max-w-lg mx-auto">
          Turn your articles into a multi-day social media blitz using
          BloggerHelper.
        </p>

        <div className="mt-8 max-w-2xl mx-auto flex gap-2 p-1 bg-white border border-slate-300 rounded-2xl shadow-inner focus-within:border-blue-500 transition-all">
          <input
            className="flex-1 bg-transparent px-4 py-3 outline-none text-slate-700"
            placeholder="Paste your dev.to article URL (e.g. https://dev.to/user/post)..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={generateCampaign}
            disabled={loading || !url}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-md"
          >
            {loading ? "Strategizing..." : "Build Campaign"}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-red-500 text-xs font-medium">{error}</p>
        )}
      </header>

      {/* Campaign Board */}
      <main className="max-w-7xl mx-auto p-8">
        {!campaign.length && !loading && (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
            <p className="text-slate-400 font-medium italic">
              No campaign generated yet. Enter a URL to start.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {["X", "LinkedIn", "Discord"].map((platform) => (
            <div key={platform} className="flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                  {platform} Pipeline
                </h2>
              </div>

              <div className="space-y-2">
                {campaign.map((dayData, idx) => (
                  <PostCard
                    key={idx}
                    day={dayData.day}
                    platform={platform}
                    content={dayData[platform.toLowerCase()]}
                    url={url}
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
