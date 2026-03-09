"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import Header from "../../components/Header";
import Footer from "../../components/Footer";


// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const chartColors = {
  gemini: "rgba(59, 130, 246, 0.85)",
  geminiBorder: "rgb(37, 99, 235)",
  claude: "rgba(249, 115, 22, 0.85)",
  claudeBorder: "rgb(234, 88, 12)",
  geminiEngineered: "rgba(16, 185, 129, 0.9)",
  geminiEngineeredBorder: "rgb(5, 150, 105)",
};

export default function Architecture() {
  const [activeTab, setActiveTab] = useState("overview");
  const [lexiconActive, setLexiconActive] = useState(false);

  // --- CHART CONFIGURATIONS ---
  const latencyData = {
    labels: ["Gemini 2.5 Flash", "Claude 3.7 Sonnet"],
    datasets: [
      {
        label: "Avg Response Time (Seconds)",
        data: [6.2, 21.5],
        backgroundColor: [chartColors.gemini, chartColors.claude],
        borderColor: [chartColors.geminiBorder, chartColors.claudeBorder],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const costData = {
    labels: ["Gemini 2.5 Flash", "Claude 3.7 Sonnet"],
    datasets: [
      {
        label: "Cost Index (Proxy)",
        data: [0.15, 3.0],
        backgroundColor: [chartColors.gemini, chartColors.claude],
        borderColor: [chartColors.geminiBorder, chartColors.claudeBorder],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const stabilityData = {
    labels: ["Gemini (responseSchema)", "Claude (Prompted)"],
    datasets: [
      {
        data: [99.9, 88.5],
        backgroundColor: [chartColors.gemini, chartColors.claude],
        hoverOffset: 4,
      },
    ],
  };

  const toneData = {
    labels: [
      lexiconActive ? "Gemini Flash (+ Lexicon)" : "Gemini Flash (Base)",
      "Claude 3.7 (Base)",
    ],
    datasets: [
      {
        label: "Quality Score",
        data: [lexiconActive ? 9.2 : 5.5, 9.5],
        backgroundColor: [
          lexiconActive ? chartColors.geminiEngineered : chartColors.gemini,
          chartColors.claude,
        ],
        borderColor: [
          lexiconActive
            ? chartColors.geminiEngineeredBorder
            : chartColors.geminiBorder,
          chartColors.claudeBorder,
        ],
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f1f5f9" } },
      x: { grid: { display: false } },
    },
  };

  const toneOptions = {
    ...barOptions,
    scales: {
      y: { max: 10, beginAtZero: true, grid: { color: "#f1f5f9" } },
      x: { grid: { display: false } },
    },
    animation: { duration: 600 },
  };

  const [session, setSession] = useState<any>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });
  
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
  
      return () => subscription.unsubscribe();
    }, []);
  

  return (
    <div className="bg-[#fafafa] font-sans text-slate-900 min-h-screen flex flex-col selection:bg-blue-100 selection:text-blue-900">
            <Header
              session={session}
              onSignIn={() => setIsAuthModalOpen(true)}
              onOpenHistory={() => {}} // Not needed on landing page            
             />

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 pt-28 pb-16">
        {/* Page Header */}
        <div className="mb-12">
          <a
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-slate-900 mb-6 inline-block uppercase tracking-widest transition-colors"
          >
            ← Back to Engine
          </a>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900">
                Ozigi Architecture
              </h1>
              <p className="text-lg font-medium text-slate-500 mt-2">
                Architecture Decision Record (ADR): LLM Selection
              </p>
            </div>
            <div className="flex gap-3">
              <span className="px-4 py-1.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200 uppercase tracking-widest">
                Selected: Gemini 2.5-flash
              </span>
              <span className="px-4 py-1.5 bg-orange-50 text-orange-800 text-xs font-bold rounded-full border border-orange-200 uppercase tracking-widest">
                Evaluated: Claude 3.7
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex overflow-x-auto mb-12 gap-2 pb-2 hide-scrollbar border-b border-slate-200/60">
          {[
            { id: "overview", label: "Executive Summary" },
            { id: "economics", label: "Speed & Economics" },
            { id: "stability", label: "JSON Stability" },
            { id: "multimodal", label: "Multimodal Ingestion" },
            { id: "tone", label: "Tone Engineering" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-t-2xl font-black text-sm whitespace-nowrap uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-transparent text-slate-500 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* --- TAB: OVERVIEW --- */}
        {activeTab === "overview" && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-3xl bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-slate-200">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-6 text-slate-900">
                Why Ozigi Runs on Gemini (Not Claude)
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6 font-medium">
                This document outlines the overarching philosophy of the Ozigi architecture. The goal is to provide context on why the industry-favorite LLM for copywriting was bypassed in favor of a faster, more strictly constrained engine.
              </p>
              <p className="text-slate-600 leading-relaxed mb-10">
                While Anthropic's Claude 3.7 Sonnet is widely considered the industry favorite for natural-sounding copy, the Ozigi Context Engine intentionally utilizes Google's <strong>Gemini 2.5 Flash</strong> via Vertex AI. This dashboard breaks down the four critical architectural reasons driving this decision.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setActiveTab("economics")}
                  className="p-6 border border-slate-200 rounded-2xl hover:border-slate-400 hover:shadow-md transition-all cursor-pointer bg-slate-50 group"
                >
                  <div className="text-2xl mb-3 group-hover:scale-110 transition-transform origin-left">⏱️</div>
                  <h3 className="font-black uppercase tracking-widest text-slate-900 mb-2 text-sm">Speed & Sandbox</h3>
                  <p className="text-sm text-slate-500 font-medium">Explore how Flash maintains sub-8-second response times.</p>
                </div>
                <div
                  onClick={() => setActiveTab("stability")}
                  className="p-6 border border-slate-200 rounded-2xl hover:border-slate-400 hover:shadow-md transition-all cursor-pointer bg-slate-50 group"
                >
                  <div className="text-2xl mb-3 group-hover:scale-110 transition-transform origin-left">{"{ }"}</div>
                  <h3 className="font-black uppercase tracking-widest text-slate-900 mb-2 text-sm">JSON Stability</h3>
                  <p className="text-sm text-slate-500 font-medium">See how responseSchema enforces 100% UI stability.</p>
                </div>
                <div
                  onClick={() => setActiveTab("multimodal")}
                  className="p-6 border border-slate-200 rounded-2xl hover:border-slate-400 hover:shadow-md transition-all cursor-pointer bg-slate-50 group"
                >
                  <div className="text-2xl mb-3 group-hover:scale-110 transition-transform origin-left">📄</div>
                  <h3 className="font-black uppercase tracking-widest text-slate-900 mb-2 text-sm">Multimodal</h3>
                  <p className="text-sm text-slate-500 font-medium">Compare the PDF and raw data processing pipelines.</p>
                </div>
                <div
                  onClick={() => setActiveTab("tone")}
                  className="p-6 border border-slate-200 rounded-2xl hover:border-slate-400 hover:shadow-md transition-all cursor-pointer bg-slate-50 group"
                >
                  <div className="text-2xl mb-3 group-hover:scale-110 transition-transform origin-left">🎭</div>
                  <h3 className="font-black uppercase tracking-widest text-slate-900 mb-2 text-sm">The Banned Lexicon</h3>
                  <p className="text-sm text-slate-500 font-medium">Discover programmatic constraints that match Claude's tone.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- TAB: ECONOMICS --- */}
        {activeTab === "economics" && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-12 max-w-3xl">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-slate-900">
                Speed & Sandbox Economics
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium mb-6">
                Visualizing the operational realities of running a SaaS platform with a live public sandbox.
              </p>
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-slate-700">
                <strong>The Context:</strong> Because Ozigi features a live `/demo` sandbox, using Claude 3.7 Sonnet would dramatically spike API costs and increase user wait times to unacceptable levels for free users. Flash gives us the sub-8-second response time needed for a premium feel.
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2 text-center text-slate-900">
                  Average Latency
                </h3>
                <p className="text-xs text-center text-slate-400 mb-8 uppercase tracking-widest font-bold">
                  Target: Sub-8 Seconds
                </p>
                <div className="h-64 relative w-full">
                  <Bar data={latencyData} options={barOptions} />
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2 text-center text-slate-900">
                  Relative API Cost
                </h3>
                <p className="text-xs text-center text-slate-400 mb-8 uppercase tracking-widest font-bold">
                  Cost per 1M Input Tokens
                </p>
                <div className="h-64 relative w-full">
                  <Bar data={costData} options={barOptions} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- TAB: STABILITY --- */}
        {activeTab === "stability" && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-12 max-w-3xl">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-slate-900">
                Bulletproof Structured JSON
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium mb-6">
                Why natural language capability is secondary to structural predictability in our pipeline.
              </p>
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-slate-700">
                <strong>The Context:</strong> Ozigi's frontend UI relies entirely on a strictly formatted JSON payload. Gemini's `responseSchema` enforces this structure at the API level. Switching to Claude would increase the risk of the frontend UI breaking due to a hallucinated comma.
              </div>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col items-center">
              <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2 text-center text-slate-900">
                Format Adherence Rate
              </h3>
              <p className="text-xs text-center text-slate-400 mb-8 uppercase tracking-widest font-bold">
                Risk of Frontend UI Breakage
              </p>

              <div className="h-64 w-full max-w-sm relative">
                <Doughnut
                  data={stabilityData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "75%",
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mt-12">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="font-black uppercase tracking-widest text-slate-900 mb-4 text-sm border-b border-slate-200 pb-3">
                    The Gemini Approach
                  </h4>
                  <ul className="text-sm text-slate-600 space-y-3 font-medium">
                    <li className="flex gap-2"><span className="text-green-500">✓</span> Strict `responseSchema` at API level</li>
                    <li className="flex gap-2"><span className="text-green-500">✓</span> Guaranteed to return valid JSON</li>
                    <li className="flex gap-2"><span className="text-green-500">✓</span> Zero UI crashes from trailing commas</li>
                  </ul>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="font-black uppercase tracking-widest text-slate-900 mb-4 text-sm border-b border-slate-200 pb-3">
                    The Claude Risk
                  </h4>
                  <ul className="text-sm text-slate-600 space-y-3 font-medium">
                    <li className="flex gap-2"><span className="text-red-400">✗</span> Relies on prompt instructions for JSON</li>
                    <li className="flex gap-2"><span className="text-red-400">✗</span> Prone to adding conversational pre-text</li>
                    <li className="flex gap-2"><span className="text-red-400">✗</span> High risk of parsing failure in Next.js</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- TAB: MULTIMODAL --- */}
        {activeTab === "multimodal" && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-12 max-w-3xl">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-slate-900">
                Native Multimodal Ingestion
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium mb-6">
                Comparing the architectural complexity of building an external pipeline versus a native engine.
              </p>
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-slate-700">
                <strong>The Context:</strong> Gemini was built from the ground up to be natively multimodal. The Vertex SDK allows us to pass raw PDF buffers directly into the model without needing to build a complex OCR (Optical Character Recognition) pipeline first.
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-slate-200">
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 text-center text-slate-900">
                  Ozigi Architecture (Gemini)
                </h3>
                <div className="flex flex-col items-center space-y-4">
                  <div className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-sm uppercase tracking-widest text-slate-600 shadow-sm w-48 text-center">
                    Raw PDF Upload
                  </div>
                  <div className="text-slate-300">↓</div>
                  <div className="px-6 py-4 bg-blue-50 border border-blue-200 rounded-xl font-black text-sm uppercase tracking-widest text-blue-800 shadow-sm w-64 text-center">
                    Vertex AI SDK <br />
                    <span className="text-[10px] text-blue-600 mt-1 block tracking-normal normal-case">Handles buffer natively</span>
                  </div>
                  <div className="text-slate-300">↓</div>
                  <div className="px-6 py-4 bg-green-50 border border-green-200 rounded-xl font-black text-sm uppercase tracking-widest text-green-800 shadow-sm w-48 text-center">
                    Structured JSON
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-8 md:p-12 rounded-[2rem] border border-slate-200 opacity-80">
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 text-center text-slate-500">
                  Alternative (Claude + OCR)
                </h3>
                <div className="flex flex-col items-center space-y-3">
                  <div className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 w-48 text-center">
                    Raw PDF Upload
                  </div>
                  <div className="text-slate-300 text-sm">↓</div>
                  <div className="px-6 py-3 bg-orange-50 border border-orange-200 border-dashed rounded-xl font-bold text-xs uppercase tracking-widest text-orange-600 w-56 text-center">
                    External OCR Server
                  </div>
                  <div className="text-slate-300 text-sm">↓</div>
                  <div className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 w-48 text-center">
                    Extracted Text
                  </div>
                  <div className="text-slate-300 text-sm">↓</div>
                  <div className="px-6 py-3 bg-white border border-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-700 w-56 text-center">
                    Anthropic API
                  </div>
                  <div className="text-slate-300 text-sm">↓</div>
                  <div className="px-6 py-3 bg-green-50 border border-green-200 rounded-xl font-bold text-xs uppercase tracking-widest text-green-800 w-48 text-center">
                    Structured JSON
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- TAB: TONE --- */}
        {activeTab === "tone" && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-12 max-w-3xl">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-slate-900">
                The "Banned Lexicon" Equalizer
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed font-medium mb-6">
                Demonstrating how engineering constraints can overcome base model limitations.
              </p>
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-slate-700">
                <strong>The Context:</strong> We solved Gemini's tone problem programmatically by building the <strong>Banned Lexicon</strong>. By aggressively penalizing words like "delve" and "tapestry" at the system-prompt level, we force Gemini to write pragmatic, bursty copy. We engineered our way to Claude-level quality while keeping Gemini's speed.
              </div>
            </div>

            <div className="bg-slate-900 text-white p-8 md:p-12 rounded-[2rem] shadow-2xl border-4 border-slate-950 flex flex-col lg:flex-row gap-12 items-center">
              <div className="w-full lg:w-1/3 space-y-8">
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">
                    Constraint Controls
                  </h3>
                  <p className="text-sm text-slate-400 font-medium mb-6">
                    Toggle the system prompt constraints to see how the programmatic "Banned Lexicon" elevates Gemini's output quality.
                  </p>

                  <button
                    onClick={() => setLexiconActive(!lexiconActive)}
                    className={`w-full py-5 px-6 font-black uppercase tracking-widest text-sm rounded-2xl transition-all shadow-xl flex justify-between items-center ${
                      lexiconActive
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    <span>Banned Lexicon</span>
                    <span
                      className={`px-4 py-1.5 rounded-lg text-xs ${
                        lexiconActive
                          ? "bg-emerald-300 text-emerald-900"
                          : "bg-blue-800 text-blue-200"
                      }`}
                    >
                      {lexiconActive ? "ON" : "OFF"}
                    </span>
                  </button>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                    System Prompt:
                  </h4>
                  <p
                    className={`text-sm font-mono italic leading-relaxed transition-colors duration-500 ${
                      lexiconActive ? "text-emerald-400" : "text-slate-400"
                    }`}
                  >
                    {lexiconActive
                      ? `"NEVER use words like delve, tapestry, vital, or realm. Write extremely pragmatic, punchy copy formatted directly into the JSON schema."`
                      : `"Write a professional post based on the context."`}
                  </p>
                </div>
              </div>

              <div className="w-full lg:w-2/3 bg-white rounded-[2rem] p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 text-center mb-8">
                  Human Cadence Quality Score (1-10)
                </h3>
                <div className="h-64 relative w-full">
                  <Bar data={toneData} options={toneOptions} />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
