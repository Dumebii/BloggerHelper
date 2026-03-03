"use client";
import { useState } from "react";

interface DistilleryProps {
  inputs: { url: string; text: string; file?: File | null };
  setInputs: (val: any) => void;
  onGenerate: () => void;
  loading: boolean;
}

type Tab = "text" | "link" | "file";

export default function Distillery({
  inputs,
  setInputs,
  onGenerate,
  loading,
}: DistilleryProps) {
  const [activeTab, setActiveTab] = useState<Tab>("link");

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

        {/* 📎 FILE TAB (v3 Roadmap Support) */}
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

        <button
          onClick={onGenerate}
          disabled={loading || (!inputs.url && !inputs.text && !inputs.file)}
          className="w-full mt-6 bg-red-700 text-white py-6 rounded-[1.8rem] font-black uppercase tracking-widest hover:bg-red-800 transition-all disabled:bg-slate-200 shadow-xl shadow-red-900/10 active:scale-[0.98]"
        >
          {loading ? "Architecting Strategy..." : "Generate Social Campaign"}
        </button>
      </div>
    </section>
  );
}
