"use client";
import { useState } from "react";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduledFor: string) => void;
  postText: string;
  platform: string;
  day: number;
  imageUrl?: string;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSchedule,
  postText,
  platform,
  day,
  imageUrl,
}: ScheduleModalProps) {
  const [scheduledFor, setScheduledFor] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledFor) return;

    setLoading(true);
    try {
      await onSchedule(scheduledFor);
      onClose();
    } catch (error) {
      console.error("Schedule failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Set minimum datetime to now
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Fix for input
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border-4 border-slate-900 relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-red-600 font-black text-2xl transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">
          Schedule Post
        </h2>
        <p className="text-slate-500 text-sm font-medium mb-6">
          {platform} · Day {day}
        </p>

        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 max-h-32 overflow-y-auto">
          {postText}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="datetime" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Date & Time (your local time)
            </label>
            <input
              type="datetime-local"
              id="datetime"
              required
              min={minDateTime}
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-red-500/50 text-sm font-medium text-slate-900"
            />
          </div>
          {platform.toLowerCase() === "x" && (
  <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
    ⚠️ X posts require manual publishing. We'll remind you when it's time.
  </p>
)}


          <button
            type="submit"
            disabled={loading || !scheduledFor}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:bg-indigo-300 text-xs shadow-lg"
          >
            {loading ? "Scheduling..." : "Schedule Post"}
          </button>
        </form>
      </div>
    </div>
  );
}