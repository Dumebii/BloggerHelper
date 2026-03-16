"use client";
import { useState } from "react";

export default function PricingWaitlistModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server error – please try again later.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join waitlist");

      setStatus("success");
      setMessage("You're on the list! We'll notify you when Pro is ready.");
      setTimeout(() => onClose(), 3000);
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message);
    }
  };

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
          Join the Pro Waitlist
        </h2>
        <p className="text-slate-500 text-sm font-medium mb-6">
          Be the first to know when Ozigi Pro launches. Unlock unlimited campaigns, advanced personas, LinkedIn publishing, and more.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-red-500/50 text-sm font-medium text-slate-900"
              placeholder="you@example.com"
            />
          </div>

          {message && (
            <div className={`text-xs font-medium p-3 rounded-lg ${
              status === "success" ? "bg-green-50 text-green-700 border border-green-200" :
              status === "error" ? "bg-red-50 text-red-700 border border-red-200" : ""
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:bg-indigo-300 text-xs shadow-lg"
          >
            {status === "loading" ? "Joining..." : "Join Waitlist"}
          </button>
        </form>
      </div>
    </div>
  );
}