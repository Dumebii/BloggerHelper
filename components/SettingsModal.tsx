"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface SettingsModalProps {
  session: any;
  onClose: () => void;
  onEmailAdded: () => void;
}

export default function SettingsModal({
  session,
  onClose,
  onEmailAdded,
}: SettingsModalProps) {
  // --- Workspace State ---
  const [persona, setPersona] = useState("");
  const [webhook, setWebhook] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState("");

  // --- Database Persona State ---
  const [newPersonaName, setNewPersonaName] = useState("");
  const [newPersonaPrompt, setNewPersonaPrompt] = useState("");
  const [isSavingPersona, setIsSavingPersona] = useState(false);

  // --- OAuth Linking State ---
  const [connections, setConnections] = useState<string[]>([]);
  const [linkLoading, setLinkLoading] = useState<string | null>(null);

  // --- Subscriber Management State ---
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [newEmails, setNewEmails] = useState("");
  const [isAddingSubscribers, setIsAddingSubscribers] = useState(false);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);

  // --- Deletion State ---
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (session?.user?.user_metadata) {
      setPersona(session.user.user_metadata.persona || "");
      setWebhook(session.user.user_metadata.discord_webhook || "");
    }
    fetchConnections();
    fetchSubscribers(); // 👈 new
  }, [session]);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', session.user.id)
          .single();
        if (data?.email) setEmail(data.email);
      };
      fetchProfile();
    }
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

  const fetchSubscribers = async () => {
    setIsLoadingSubscribers(true);
    try {
      const res = await fetch('/api/subscribers');
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error("Failed to fetch subscribers", error);
    } finally {
      setIsLoadingSubscribers(false);
    }
  };

  const handleSaveWorkspace = async () => {
    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { persona: persona.trim(), discord_webhook: webhook.trim() },
    });

    await supabase
      .from('profiles')
      .update({ discord_webhook: webhook.trim() })
      .eq('id', session.user.id);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ email: email.trim() || null })
      .eq('id', session.user.id);

    if (profileError) {
      console.error("Failed to update email in profiles:", profileError.message);
    } else {
      if (onEmailAdded) onEmailAdded();
    }

    setIsSaving(false);
    if (!error) onClose();
    else console.error("Failed to update settings:", error.message);
  };

  const handleSaveDatabasePersona = async () => {
    const cleanName = newPersonaName.trim();
    const cleanPrompt = newPersonaPrompt.trim();

    if (!cleanName || !cleanPrompt) return;

    setIsSavingPersona(true);
    const { error } = await supabase.from("user_personas").insert({
      user_id: session.user.id,
      name: cleanName,
      prompt: cleanPrompt,
    });
    setIsSavingPersona(false);

    if (!error) {
      window.dispatchEvent(new Event("refreshPersonas"));
      setNewPersonaName("");
      setNewPersonaPrompt("");
      onClose();
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

  // --- Subscriber Handlers ---
  const handleAddSubscribers = async () => {
    const emailList = newEmails
      .split('\n')
      .map(e => e.trim())
      .filter(e => e.length > 0 && e.includes('@'));

    if (emailList.length === 0) return;

    setIsAddingSubscribers(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailList })
      });
      if (res.ok) {
        setNewEmails('');
        await fetchSubscribers();
      } else {
        const data = await res.json();
        alert(`Failed to add: ${data.error}`);
      }
    } catch (error) {
      console.error("Error adding subscribers", error);
    } finally {
      setIsAddingSubscribers(false);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm("Remove this subscriber from your list?")) return;
    try {
      const res = await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubscribers(subscribers.filter(s => s.id !== id));
      } else {
        alert("Failed to remove subscriber");
      }
    } catch (error) {
      console.error("Error deleting subscriber", error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "DANGER: Are you sure? This will permanently delete your account, all connected personas, and generated campaign history. This action CANNOT be undone."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (response.ok) {
        await supabase.auth.signOut();
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        alert(`Failed to delete account: ${errorData.error}`);
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error calling deletion API:", error);
      alert("An unexpected error occurred while trying to delete your account.");
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-slate-900 relative max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
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
          {/* WORKSPACE PREFERENCES */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-100 pb-2">
              Workspace Preferences
            </h3>
            {/* existing workspace fields (persona, webhook, email) */}
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
            <div>
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Email Address (for X reminders)
              </label>
              <input
                id="email"
                type="email"
                className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-red-500/50 text-sm font-medium text-slate-900"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          {/* DATABASE PERSONAS FORM */}
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
              className="w-full bg-red-700 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-red-800 transition-all disabled:opacity-50 disabled:bg-slate-300 text-[10px] sm:text-xs shadow-lg"
            >
              {isSavingPersona ? "Saving..." : "Save Persona"}
            </button>
          </div>

          {/* CONNECTED ACCOUNTS */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-100 pb-2">
              Social Connections
            </h3>
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

          {/* 📧 EMAIL SUBSCRIBERS (new section) */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-100 pb-2">
              📧 Email Subscribers
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Manage your email list. Subscribers will receive your generated newsletters. We'll handle unsubscribes automatically.
            </p>

            <div>
              <label htmlFor="newEmails" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Add emails (one per line)
              </label>
              <textarea
                id="newEmails"
                rows={4}
                className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-red-500/50 text-sm font-medium text-slate-900"
                placeholder="user@example.com&#10;friend@domain.com"
                value={newEmails}
                onChange={(e) => setNewEmails(e.target.value)}
              />
              <button
                onClick={handleAddSubscribers}
                disabled={isAddingSubscribers || !newEmails.trim()}
                className="w-full mt-3 bg-indigo-600 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 text-[10px] sm:text-xs shadow-lg"
              >
                {isAddingSubscribers ? "Adding..." : "Add Emails"}
              </button>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-600">Your Subscribers</span>
                <span className="text-[10px] text-slate-400">{subscribers.length} total</span>
              </div>
              {isLoadingSubscribers ? (
                <div className="text-center py-4 text-slate-400 text-sm">Loading...</div>
              ) : subscribers.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
                  No subscribers yet. Add some above.
                </div>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {subscribers.map((sub) => (
                    <li
                      key={sub.id}
                      className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200"
                    >
                      <div className="truncate flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{sub.email}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{sub.status}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSubscriber(sub.id)}
                        className="ml-2 text-red-500 hover:text-red-700 text-xs font-black px-2 py-1"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* DANGER ZONE */}
          <div className="space-y-4 mt-12 pt-8 border-t-2 border-red-100">
            <h3 className="text-xs font-black uppercase tracking-widest text-red-700 pb-2">
              Danger Zone
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Once you delete your account, there is no going back. All personas, settings, and generated content will be instantly and permanently wiped from our servers.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 text-[10px] sm:text-xs"
            >
              {isDeleting ? "Deleting Account..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}