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
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [slackWebhook, setSlackWebhook] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSenderName, setEmailSenderName] = useState("");
  const [replyToEmail, setReplyToEmail] = useState(""); // 👈 new

  // --- Database Persona State ---
  const [newPersonaName, setNewPersonaName] = useState("");
  const [newPersonaPrompt, setNewPersonaPrompt] = useState("");
  const [isSavingPersona, setIsSavingPersona] = useState(false);

  // --- OAuth Linking State ---
  const [connections, setConnections] = useState<string[]>([]);
  const [linkLoading, setLinkLoading] = useState<string | null>(null);

  // --- Deletion State ---
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch connections and profile data
  useEffect(() => {
    if (session?.user?.user_metadata) {
      setPersona(session.user.user_metadata.persona || "");
      setDiscordWebhook(session.user.user_metadata.discord_webhook || "");
      setSlackWebhook(session.user.user_metadata.slack_webhook || "");
    }
    fetchConnections();
  }, [session]);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('email, email_sender_name, reply_to_email')
          .eq('id', session.user.id)
          .single();
        if (data?.email) setEmail(data.email);
        if (data?.email_sender_name) setEmailSenderName(data.email_sender_name);
        if (data?.reply_to_email) setReplyToEmail(data.reply_to_email);
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

  const handleSaveWorkspace = async () => {
    setIsSaving(true);

    // Update user metadata (persona, discord webhook)
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { persona: persona.trim(), discord_webhook: discordWebhook.trim(), slack_webhook: slackWebhook.trim() },
    });

    // Update profiles table (email, email_sender_name, discord_webhook, slack_webhook, reply_to_email)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        email: email.trim() || null,
        email_sender_name: emailSenderName.trim() || null,
        reply_to_email: replyToEmail.trim() || null,
        discord_webhook: discordWebhook.trim() || null,
        slack_webhook: slackWebhook.trim() || null,
      })
      .eq('id', session.user.id);

    if (profileError) {
      console.error("Failed to update profile:", profileError.message);
    } else {
      if (email.trim() && email !== session?.user?.email) {
        onEmailAdded(); // notify parent email was added/changed
      }
    }

    setIsSaving(false);
    if (!metadataError && !profileError) onClose();
    else console.error("Failed to update settings");
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

        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6 text-brand-red">
          Settings
        </h2>

        <div className="space-y-8">
          {/* WORKSPACE PREFERENCES */}
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
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
              />
                <a
    href="/docs/webhooks"
    target="_blank"
    rel="noopener noreferrer"
    className="text-[10px] text-slate-400 hover:text-brand-red mt-1 inline-block"
  >
    How to create a Discord webhook?
  </a>
            </div>
            <div>
              <label htmlFor="slackWebhook" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Slack Webhook URL
              </label>
              <input
                id="slackWebhook"
                type="url"
                className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-red-500/50 text-sm font-medium text-slate-900"
                placeholder="https://hooks.slack.com/services/..."
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
              />
                <a
    href="/docs/webhooks"
    target="_blank"
    rel="noopener noreferrer"
    className="text-[10px] text-slate-400 hover:text-brand-red mt-1 inline-block"
  >
    How to create a Slack webhook?
  </a>
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

            {/* Newsletter Sender Name */}
            <div>
              <label htmlFor="emailSenderName" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Newsletter Sender Name
              </label>
              <input
                id="emailSenderName"
                type="text"
                className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-red-500/50 text-sm font-medium text-slate-900"
                placeholder="e.g., Ozigi Weekly Roundups"
                value={emailSenderName}
                onChange={(e) => setEmailSenderName(e.target.value)}
              />
              <p className="text-[8px] text-slate-400 mt-1">
                This name will appear as the sender in your newsletters.
              </p>
            </div>

            {/* Reply-to Email */}
            <div>
              <label htmlFor="replyToEmail" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Reply-to Email
              </label>
              <input
                id="replyToEmail"
                type="email"
                className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 outline-none focus:border-red-500/50 text-sm font-medium text-slate-900"
                placeholder="your@email.com"
                value={replyToEmail}
                onChange={(e) => setReplyToEmail(e.target.value)}
              />
              <p className="text-[8px] text-slate-400 mt-1">
                Where replies to your newsletter will go. If empty, your account email will be used.
              </p>
            </div>

            <button
              onClick={handleSaveWorkspace}
              disabled={isSaving}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 text-[10px] sm:text-xs shadow-lg mt-2"
            >
              {isSaving ? "Saving..." : "Save Workspace Settings"}
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