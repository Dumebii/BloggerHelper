"use client";
import { useState } from "react";
import DynamicLoader from "@/components/DynamicLoader";

interface DistilleryProps {
  session?: any;
  userPersonas?: { id: string; name: string }[];
  onOpenSettings?: () => void;
  inputs: {
    url: string;
    text: string;
    file?: File | null;
    tweetFormat: "single" | "thread";
    additionalInfo?: string;
    personaId?: string;
  };
  setInputs: (val: any) => void;
  onGenerate: () => void;
  loading: boolean;
}

type Tab = "text" | "link" | "file";

export default function Distillery({
  session,
  userPersonas = [],
  onOpenSettings,
  inputs,
  setInputs,
  onGenerate,
  loading,
}: DistilleryProps) {
  const [activeTab, setActiveTab] = useState<Tab>("link");
  const [showAdvanced, setShowAdvanced] = useState(false); // ✨ NEW: Controls progressive disclosure

  const handlePersonaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "create_new") {
      if (onOpenSettings) onOpenSettings();
      setInputs({ ...inputs, personaId: "default" });
    } else {
      setInputs({ ...inputs, personaId: value });
    }
  };

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[400px]">
        <DynamicLoader />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6 p-2 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
      {/* 🧭 Tab Navigation */}
      <div className="flex p-2 bg-slate-50 rounded-[2rem] gap-1">
        {(["link", "text", "file"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
              activeTab === tab
                ? "bg-white text-red-700 shadow-sm border border-slate-200"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab === "link" && "🔗 URL"}
            {tab === "text" && "📝 Notes"}
            {tab === "file" && "📎 Files"}
          </button>
        ))}
      </div>

      <div className="px-4 pb-4">
        {/* 🔗 LINK TAB */}
        {activeTab === "link" && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center bg-slate-50 rounded-2xl px-5 py-4 border border-slate-200 group focus-within:border-red-500/50 transition-colors">
              <input
                className="flex-1 outline-none text-slate-900 text-sm font-bold bg-transparent"
                placeholder="Paste an article or blog post URL..."
                value={inputs.url}
                onChange={(e) => setInputs({ ...inputs, url: e.target.value })}
              />
            </div>

            {/* ✨ Cleaned up Quick Examples */}
            {!inputs.url && (
              <div className="flex flex-wrap items-center gap-3 mt-1 px-2 text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">Examples:</span>
                <button
                  onClick={() =>
                    setInputs({
                      ...inputs,
                      url: "https://dev.to/dumebii/ozigi-v2-changelog-building-a-modular-agentic-content-engine-with-nextjs-supabase-and-playwright-59mo",
                    })
                  }
                  className="text-slate-500 hover:text-red-600 transition-colors text-left"
                >
                  Ozigi V2
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() =>
                    setInputs({
                      ...inputs,
                      url: "https://currents.dev/posts/how-to-debug-playwright-tests-in-ci",
                    })
                  }
                  className="text-slate-500 hover:text-red-600 transition-colors text-left"
                >
                  Playwright CI
                </button>
              </div>
            )}
          </div>
        )}

        {/* 📝 TEXT TAB */}
        {activeTab === "text" && (
          <div className="flex items-start bg-slate-50 rounded-2xl px-5 py-4 border border-slate-200 group focus-within:border-red-500/50 transition-colors animate-in fade-in slide-in-from-bottom-2">
            <textarea
              className="flex-1 outline-none text-slate-900 text-sm font-medium bg-transparent min-h-[160px] resize-none"
              placeholder="Paste your raw thoughts, meeting transcripts, or rough drafts here..."
              value={inputs.text}
              onChange={(e) => setInputs({ ...inputs, text: e.target.value })}
            />
          </div>
        )}

        {/* 📎 FILE TAB */}
        {activeTab === "file" && (
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-8 border-2 border-dashed border-slate-200 group hover:border-red-500/50 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-2">
            <span className="text-3xl mb-3">📁</span>
            <p className="text-sm font-bold text-slate-900 mb-1">
              Upload PDF or Image
            </p>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
              Support for PDFs, PNGs, and JPEGs
            </p>
            <input
              type="file"
              className="hidden"
              id="file-upload"
              accept=".pdf,image/*"
              onChange={(e) =>
                setInputs({ ...inputs, file: e.target.files?.[0] })
              }
            />
            <label
              htmlFor="file-upload"
              className="mt-4 px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 cursor-pointer"
            >
              {inputs.file ? inputs.file.name : "Select File"}
            </label>
          </div>
        )}

        {/* ✨ The Progressive Disclosure Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full mt-6 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200"
        >
          {showAdvanced
            ? "Hide Advanced Options ⬆"
            : "⚙️ Advanced Options (Personas, Formats) ⬇"}
        </button>

        {/* ✨ The Hidden Engine Room */}
        {showAdvanced && (
          <div className="mt-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-200 animate-in fade-in slide-in-from-top-2 flex flex-col gap-6">
            {/* Persona Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">
                  🗣️ Voice or Persona
                </h4>
              </div>

              {!session ? (
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100 whitespace-nowrap">
                    🔒 Sign in to unlock
                  </span>
                </div>
              ) : (
                <select
                  value={inputs.personaId || "default"}
                  onChange={handlePersonaChange}
                  className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none cursor-pointer hover:border-slate-300"
                >
                  <option value="default">Default (Pragmatic Tech)</option>
                  {userPersonas.map((persona) => (
                    <option key={persona.id} value={persona.id}>
                      {persona.name}
                    </option>
                  ))}
                  <option
                    value="create_new"
                    className="font-black text-red-600"
                  >
                    + Create New Persona
                  </option>
                </select>
              )}
            </div>

            {/* Directives */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2 flex items-center gap-2">
                Campaign Directives
              </label>
              <input
                type="text"
                value={inputs.additionalInfo || ""}
                onChange={(e) =>
                  setInputs({ ...inputs, additionalInfo: e.target.value })
                }
                placeholder="e.g., Target junior devs. (No tone instructions here)"
                className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            {/* X Format Toggle */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2 block">
                X (Twitter) Format
              </label>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() =>
                    setInputs({ ...inputs, tweetFormat: "single" })
                  }
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    inputs.tweetFormat === "single"
                      ? "bg-slate-100 text-slate-900 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Single Tweet
                </button>
                <button
                  onClick={() =>
                    setInputs({ ...inputs, tweetFormat: "thread" })
                  }
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    inputs.tweetFormat === "thread"
                      ? "bg-slate-100 text-slate-900 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Full Thread
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onGenerate}
          disabled={!inputs.url && !inputs.text && !inputs.file}
          className="w-full mt-6 bg-red-700 text-white py-6 rounded-[1.8rem] font-black uppercase tracking-widest hover:bg-red-800 transition-all disabled:bg-slate-200 disabled:text-slate-400 shadow-xl shadow-red-900/10 active:scale-[0.98]"
        >
          Generate Campaign ⚡
        </button>
      </div>
    </section>
  );
}
