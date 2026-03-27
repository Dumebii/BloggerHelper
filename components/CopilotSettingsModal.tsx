"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface CopilotSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
}

export default function CopilotSettingsModal({ isOpen, onClose, session }: CopilotSettingsModalProps) {
  const [context, setContext] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchContext = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('copilot_context')
          .eq('id', session.user.id)
          .single();
        if (data?.copilot_context) setContext(data.copilot_context);
      };
      fetchContext();
    }
  }, [session]);

  const handleSave = async () => {
    setIsSaving(true);
    await supabase
      .from('profiles')
      .update({ copilot_context: context.trim() || null })
      .eq('id', session.user.id);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto relative border-2 border-brand-red/20 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-brand-red font-black text-xl"
        >
          ✕
        </button>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6 text-brand-navy">Copilot Settings</h2>
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Tell the AI about your business, audience, and goals. The copilot will use this context to give you better, more tailored advice.
          </p>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={8}
            className="w-full bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-red"
            placeholder="e.g., I run a B2B SaaS for technical creators. We help them generate social media content. My audience is developers and founders who value efficiency and authenticity. My goal is to help them build a personal brand without spending hours writing."
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-brand-red text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-opacity-90 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Context"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}