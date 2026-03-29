"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PostCardProps {
  platform: string;
  content: string;
  day: number;
  webhookUrl: string;
}

export default function PostCard({
  platform,
  content,
  day,
  webhookUrl,
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

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
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Copied!");
    } catch (err) {
      toast.error("Failed to copy. Please try again.");
    }
  };

  const handlePost = async () => {
    if (platform.toLowerCase() !== "discord") return;
    if (!webhookUrl) {
      toast.error("Configure your Discord webhook in Settings first.");
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
        toast.success("Posted to Discord!");
      } else {
        toast.error(`Failed: ${data.error || "Check your webhook."}`);
      }
    } catch (err) {
      toast.error("Post failed. Check your connection.");
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
}
