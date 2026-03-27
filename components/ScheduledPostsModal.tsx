"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduled_for: string;
  status: string;
  campaign_id: string | null;
}

interface ScheduledPostsModalProps {
  onClose: () => void;
  onStatsChange?: () => void; // 👈 add this
}

export default function ScheduledPostsModal({ onClose, onStatsChange }: ScheduledPostsModalProps) {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const fetchScheduledPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("status", "pending")
      .order("scheduled_for", { ascending: true });

    if (error) {
      console.error("Error fetching scheduled posts:", error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const handleCancel = async (postId: string) => {
    setCancelling(postId);
    const { error } = await supabase
      .from("scheduled_posts")
      .update({ status: "cancelled" })
      .eq("id", postId);

    if (error) {
      console.error("Error cancelling post:", error);
      alert("Failed to cancel post. Please try again.");
    } else {
      setPosts(posts.filter(p => p.id !== postId));
      if (onStatsChange) onStatsChange(); // 👈 refresh stats after cancellation
    }
    setCancelling(null);
  };

  

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-3xl rounded-3xl p-8 shadow-2xl border-4 border-slate-900 relative max-h-[80vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-red-600 font-black text-xl"
        >
          ×
        </button>

        <h2 className="text-2xl font-black italic text-brand-red uppercase tracking-tighter mb-6">
          Scheduled Posts
        </h2>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No scheduled posts yet.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="border border-slate-200 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-slate-100 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                        {post.platform}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {new Date(post.scheduled_for).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2">{post.content}</p>
                  </div>
                  <button
                    onClick={() => handleCancel(post.id)}
                    disabled={cancelling === post.id}
                    className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {cancelling === post.id ? "Cancelling..." : "Cancel"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}