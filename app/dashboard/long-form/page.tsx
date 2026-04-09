"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowLeft,
  Loader2,
  Lock
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/dashboard/Sidebar";
import { useSession } from "@/components/hooks/useSession";
import { usePlanStatus } from "@/components/hooks/usePlanStatus";
import { usePersonas } from "@/components/hooks/usePersonas";

interface LongFormSection {
  heading: string;
  content: string;
  wordCount: number;
}

interface LongFormArticle {
  title: string;
  subtitle?: string;
  sections: LongFormSection[];
  totalWordCount: number;
  metadata: {
    tone: string;
    structure: string;
    generatedAt: string;
  };
}

const TONE_OPTIONS = [
  { value: "professional", label: "Professional", desc: "Authoritative and polished" },
  { value: "casual", label: "Casual", desc: "Conversational and approachable" },
  { value: "technical", label: "Technical", desc: "Precise and detailed" },
  { value: "storytelling", label: "Storytelling", desc: "Narrative and engaging" },
];

const STRUCTURE_OPTIONS = [
  { value: "narrative", label: "Narrative", desc: "Flowing prose with clear arc" },
  { value: "listicle", label: "Listicle", desc: "Numbered list format" },
  { value: "how-to", label: "How-To Guide", desc: "Step-by-step instructions" },
  { value: "opinion", label: "Opinion Piece", desc: "Persuasive argument" },
  { value: "analysis", label: "Deep Analysis", desc: "Thorough examination" },
];

const LENGTH_OPTIONS = [
  { value: 800, label: "Short (~800 words)", desc: "Quick read, 3-4 min" },
  { value: 1500, label: "Medium (~1500 words)", desc: "Standard article, 6-8 min" },
  { value: 2500, label: "Long (~2500 words)", desc: "Deep dive, 10-12 min" },
  { value: 4000, label: "Extended (~4000 words)", desc: "Comprehensive, 15-20 min" },
];

export default function LongFormPage() {
  const router = useRouter();
  const { session, sessionLoading } = useSession();
  const { planStatus, stats, isLoading: planLoading } = usePlanStatus(session);
  const { personas } = usePersonas(session?.user?.id);

  // Form state
  const [context, setContext] = useState("");
  const [selectedPersonaId, setSelectedPersonaId] = useState("default");
  const [tone, setTone] = useState("professional");
  const [structure, setStructure] = useState("narrative");
  const [targetLength, setTargetLength] = useState(1500);
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [article, setArticle] = useState<LongFormArticle | null>(null);
  const [copiedSection, setCopiedSection] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "output" | "history">("input");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const hasAccess = planStatus?.plan === "organization" || planStatus?.plan === "enterprise";

  useEffect(() => {
    if (!session) return;
    fetchHistory();
  }, [session]);

  const fetchHistory = async () => {
    if (!session) return;
    setIsLoadingHistory(true);
    try {
      const response = await fetch("/api/long-form/history", {
        headers: { "Authorization": `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      setHistory(data.articles || []);
    } catch (error) {
      console.error("[LongForm] History fetch error:", error);
      toast.error("Failed to load history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleLoadFromHistory = (historyArticle: any) => {
    const parsedArticle: LongFormArticle = {
      title: historyArticle.title,
      subtitle: historyArticle.metadata?.subtitle,
      totalWordCount: historyArticle.totalWordCount,
      sections: historyArticle.sections || [],
      metadata: {
        tone: historyArticle.tone,
        structure: historyArticle.structure,
        generatedAt: historyArticle.createdAt,
      },
    };
    setArticle(parsedArticle);
    setActiveTab("output");
    toast.success("Article loaded from history");
  };

  const handleGenerate = async () => {
    if (!context.trim() || context.length < 50) {
      toast.error("Please enter at least 50 characters of context");
      return;
    }

    setIsGenerating(true);
    try {
      let personaVoice: string | undefined;
      if (selectedPersonaId !== "default") {
        const persona = personas?.find(p => p.uuid === selectedPersonaId);
        personaVoice = persona?.prompt;
      }

      const response = await fetch("/api/long-form/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: context.trim(),
          personaVoice,
          tone,
          structure,
          targetLength,
          additionalInstructions: additionalInstructions.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate article");

      setArticle(data.article);
      setActiveTab("output");
      toast.success("Article generated successfully!");
    } catch (error: any) {
      console.error("[LongForm] Error:", error);
      toast.error(error.message || "Failed to generate article");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySection = async (index: number, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedSection(index);
    setTimeout(() => setCopiedSection(null), 2000);
    toast.success("Copied to clipboard");
  };

  const handleCopyAll = async () => {
    if (!article) return;
    const fullText = [
      `# ${article.title}`,
      article.subtitle ? `*${article.subtitle}*` : '',
      '',
      ...article.sections.map(s => `## ${s.heading}\n\n${s.content}`),
    ].filter(Boolean).join('\n\n');
    await navigator.clipboard.writeText(fullText);
    toast.success("Full article copied to clipboard");
  };

  if (sessionLoading || planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );
  }

  if (!session) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        session={session}
        onOpenSettings={() => {}}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex flex-1 relative">
        <Sidebar
          navItems={[]}
          stats={stats || { campaignsGenerated: 0, scheduledCount: 0, personasSaved: 0 }}
          planStatus={planStatus}
          isLoadingStats={planLoading}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />

        <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${
          isSidebarCollapsed ? "md:ml-16" : "md:ml-64"
        }`}>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-brand-red" />
              <h1 className="text-3xl font-black uppercase tracking-tighter">
                Long-Form Content
              </h1>
            </div>
            <p className="text-slate-500">Generate articles optimized for your audience</p>
          </div>

          {!hasAccess ? (
            <div className="bg-white border-4 border-slate-200 rounded-2xl p-8 text-center">
              <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Upgrade to Access Long-Form
              </h2>
              <p className="text-slate-500 mb-6">
                Long-form content generation is available on Organization and Enterprise plans.
              </p>
              <button
                onClick={() => router.push("/pricing")}
                className="bg-brand-navy text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors"
              >
                View Plans
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {(["input", "output", "history"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    disabled={tab === "output" && !article}
                    className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors disabled:opacity-50 ${
                      activeTab === tab
                        ? "bg-brand-navy text-white"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {tab === "history" ? `History (${history.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Input Tab */}
              {activeTab === "input" && (
                <div className="bg-white border-4 border-slate-200 rounded-2xl p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      Source Context *
                    </label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Paste your source material here: articles, notes, research, URLs content, etc. The more context you provide, the better the output."
                      className="w-full h-48 p-4 border border-slate-200 rounded-xl text-sm resize-none focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-brand-slate placeholder:text-slate-400"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      {context.length} characters ({context.length < 50 ? "min 50 required" : "ready"})
                    </p>
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs font-semibold text-amber-900 mb-1">💡 Pro Tip:</p>
                      <p className="text-xs text-amber-700">Avoid overly verbose or repetitive context/briefs as they can confuse the model and break the generation cycle. Keep your input concise and focused.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                        Voice/Persona
                      </label>
                      <select
                        value={selectedPersonaId}
                        onChange={(e) => setSelectedPersonaId(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-brand-red outline-none appearance-none bg-white text-brand-slate"
                      >
                        <option value="default">Default (no specific voice)</option>
                        {personas?.map((p) => (
                          <option key={p.uuid} value={p.uuid}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                        Tone
                      </label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-brand-red outline-none appearance-none bg-white text-brand-slate"
                      >
                        {TONE_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>{t.label} - {t.desc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                        Structure
                      </label>
                      <select
                        value={structure}
                        onChange={(e) => setStructure(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-brand-red outline-none appearance-none bg-white text-brand-slate"
                      >
                        {STRUCTURE_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label} - {s.desc}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                        Target Length
                      </label>
                      <select
                        value={targetLength}
                        onChange={(e) => setTargetLength(Number(e.target.value))}
                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-brand-red outline-none appearance-none bg-white text-brand-slate"
                      >
                        {LENGTH_OPTIONS.map((l) => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      Additional Instructions (Optional)
                    </label>
                    <textarea
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.target.value)}
                      placeholder="Any specific requirements, focus areas, or constraints..."
                      className="w-full h-24 p-4 border border-slate-200 rounded-xl text-sm resize-none focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-brand-slate placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || context.length < 50}
                    className="w-full bg-brand-red text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Article...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Long-Form Content
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Output Tab */}
              {activeTab === "output" && article && (
                <div className="space-y-6">
                  <div className="bg-white border-4 border-slate-200 rounded-2xl p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 mb-1">{article.title}</h2>
                        {article.subtitle && (
                          <p className="text-slate-500">{article.subtitle}</p>
                        )}
                      </div>
                      <button
                        onClick={handleCopyAll}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-brand-slate hover:text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copy All
                      </button>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>{article.totalWordCount} words</span>
                      <span>|</span>
                      <span className="capitalize">{article.metadata.tone} tone</span>
                      <span>|</span>
                      <span className="capitalize">{article.metadata.structure} structure</span>
                    </div>
                  </div>

                  {article.sections.map((section, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 group">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h3 className="text-lg font-bold text-slate-900">{section.heading}</h3>
                        <button
                          onClick={() => handleCopySection(index, `## ${section.heading}\n\n${section.content}`)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-brand-slate hover:text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          {copiedSection === index ? (
                            <>
                              <Check className="w-3 h-3 text-green-400" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="prose prose-slate prose-sm max-w-none">
                        <p className="whitespace-pre-wrap text-brand-slate leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 mt-4">{section.wordCount} words</p>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      setArticle(null);
                      setActiveTab("input");
                    }}
                    className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-brand-red hover:text-brand-red transition-colors font-medium"
                  >
                    Generate Another Article
                  </button>
                </div>
              )}

              {/* History Tab */}
              {activeTab === "history" && (
                <div className="bg-white border-4 border-slate-200 rounded-2xl p-6">
                  {isLoadingHistory ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
                    </div>
                  ) : history.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No articles generated yet</p>
                      <p className="text-slate-400 text-sm mt-1">Generate your first article to see it here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h3 className="font-bold text-slate-900 mb-4">Generated Articles</h3>
                      {history.map((historyArticle, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleLoadFromHistory(historyArticle)}
                          className="p-4 border border-slate-200 rounded-xl hover:border-brand-red hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <h4 className="font-bold text-slate-900 group-hover:text-brand-red transition-colors">
                            {historyArticle.title}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span>{historyArticle.totalWordCount} words</span>
                            <span className="capitalize">{historyArticle.structure}</span>
                            <span className="capitalize">{historyArticle.tone}</span>
                            <span>{new Date(historyArticle.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
