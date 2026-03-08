"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface SettingsModalProps {
  session: any;
  onClose: () => void;
}

export default function SettingsModal({
  session,
  onClose,
}: SettingsModalProps) {
  // --- Workspace State (The P0 Fix) ---
  const [persona, setPersona] = useState("");
  const [webhook, setWebhook] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // --- Database Persona State ---
  const [newPersonaName, setNewPersonaName] = useState("");
  const [newPersonaPrompt, setNewPersonaPrompt] = useState("");
  const [isSavingPersona, setIsSavingPersona] = useState(false);

  // --- OAuth Linking State ---
  const [connections, setConnections] = useState<string[]>([]);
  const [linkLoading, setLinkLoading] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.user_metadata) {
      setPersona(session.user.user_metadata.persona || "");
      setWebhook(session.user.user_metadata.discord_webhook || "");
    }
    fetchConnections();
  }, [session]);

  const fetchConnections = async () => {
    const { data } = await supabase
      .from("user_tokens")
      .select("provider")
      .eq("user_id", session?.user?.id);

    if (data) {
      setConnections(
        data.map((d) => (d.provider === "twitter" ? "x" : d.provider))
      );
    }
  };

  // Saves the fallback default settings (Discord / Default Voice)
  const handleSaveWorkspace = async () => {
    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { persona: persona.trim(), discord_webhook: webhook.trim() },
    });
    setIsSaving(false);
    if (!error) onClose();
    else console.error("Failed to update settings:", error.message);
  };

  // ✨ FIXED P1 & P2: Saves to DB, validates whitespace, uses Radio Tower instead of reload
  const handleSaveDatabasePersona = async () => {
    const cleanName = newPersonaName.trim();
    const cleanPrompt = newPersonaPrompt.trim();

    if (!cleanName || !cleanPrompt) return; // Basic validation

    setIsSavingPersona(true);
    const { error } = await supabase.from("user_personas").insert({
      user_id: session.user.id,
      name: cleanName,
      prompt: cleanPrompt, 
    });
    setIsSavingPersona(false);

    if (!error) {
      // Broadcast the signal to the Dashboard to fetch the new list silently
      window.dispatchEvent(new Event("refreshPersonas"));
      onClose(); // Close the modal gracefully
    } else {
      alert("Failed to save persona: " + error.message);
    }
  };

  const handleLinkAccount = async (provider: "x" | "linkedin_oidc") => {
    setLinkLoading(provider);
    let scopes = provider === "x" ? "tweet.read tweet.write users.read offline.access" : "w_member_social openid profile email";

    const { error } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: scopes,
      },
    });

    if (error) {
      console.error(`Error linking ${provider}:`, error);
      alert(`Failed to connect account: ${error.message}`);
      setLinkLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-slate-900 relative max-h-[90vh] overflow-y-auto flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-red-600 font-black text-xl transition-colors"
          aria-label="Close Settings"
        >
          ×
        </button>

        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6 text-slate-900">
          Settings
        </h2>

        <div className="space-y-8">
          
          {/* --- ✨ RESTORED P0: WORKSPACE PREFERENCES --- */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-100 pb-2">
              Workspace Preferences
            </h3>

            <div>
              <label htmlFor="defaultPersona" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 mt-4">
                Default Voice (Fallback)
              </label>
              <textarea
                id="defaultPersona"
                className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-red-500/50 text-sm font-medium min-h-[80px] resize-y text-slate-900"
                placeholder="e.g., You are an expert developer educator..."
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="discordWebhook" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Discord Webhook URL
              </label>
              <input
                id="discordWebhook"
                type="url"
                className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-red-500/50 text-sm font-medium text-slate-900"
                placeholder="https://discord.com/api/webhooks/..."
                value={webhook}
                onChange={(e) => setWebhook(e.target.value)}
              />
            </div>

            <button
              onClick={handleSaveWorkspace}
              disabled={isSaving}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 text-[10px] sm:text-xs shadow-lg mt-2"
            >
              {isSaving ? "Saving..." : "Save Workspace Settings"}
            </button>
          </div>

          {/* --- NEW DATABASE PERSONAS FORM --- */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-100 pb-2">
              🗣️ Create Persona
            </h3>
            
            <div>
              <label htmlFor="newPersonaName" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 mt-4">Persona Name</label>
              <input
                id="newPersonaName"
                type="text"
                placeholder="e.g., Snarky DevRel"
                className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-red-500/50 text-sm font-medium text-slate-900"
                value={newPersonaName}
                onChange={(e) => setNewPersonaName(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="newPersonaPrompt" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">System Prompt</label>
              <textarea
                id="newPersonaPrompt"
                placeholder="You are a developer educator who hates corporate buzzwords..."
                className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-red-500/50 text-sm font-medium min-h-[100px] resize-y text-slate-900"
                value={newPersonaPrompt}
                onChange={(e) => setNewPersonaPrompt(e.target.value)}
              />
            </div>

            <button
              disabled={!newPersonaName.trim() || !newPersonaPrompt.trim() || isSavingPersona}
              onClick={handleSaveDatabasePersona}
              className="w-full bg-red-700 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-red-800 transition-all disabled:opacity-50 disabled:bg-slate-300 text-xs shadow-lg"
            >
              {isSavingPersona ? "Saving..." : "Save"}
            </button>
          </div>

          {/* --- CONNECTED ACCOUNTS --- */}
          {/* (Kept identical to your previous working version for X and LinkedIn) */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-100 pb-2">
              Social Connections
            </h3>
            
            {/* LinkedIn Connection */}
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="font-black uppercase tracking-widest text-xs">LinkedIn</span>
              </div>
              {connections.includes("linkedin_oidc") ? (
                <span className="text-[10px] font-black uppercase tracking-widest text-green-700 bg-green-100 px-3 py-1.5 rounded-lg border border-green-200">Connected</span>
              ) : (
                <button
                  onClick={() => handleLinkAccount("linkedin_oidc")}
                  disabled={linkLoading !== null}
                  className="text-[10px] font-black uppercase tracking-widest text-white bg-[#0A66C2] hover:bg-[#004182] px-4 py-2 rounded-lg transition-all shadow-sm"
                >
                  {linkLoading === "linkedin_oidc" ? "Linking..." : "Connect"}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
