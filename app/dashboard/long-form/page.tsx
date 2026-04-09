"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronDown, 
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
  const [activeTab, setActiveTab] = useState<"input" | "output">("input");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Check access
  const hasAccess = planStatus?.plan === "organization" || planStatus?.plan === "enterprise";

  // Handle generate
  const handleGenerate = async () => {
    if (!context.trim() || context.length < 50) {
      toast.error("Please enter at least 50 characters of context");
      return;
    }

    setIsGenerating(true);

    try {
      // Get persona voice if selected
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

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate article");
      }

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

  // Copy section to clipboard
  const handleCopySection = async (index: number, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedSection(index);
    setTimeout(() => setCopiedSection(null), 2000);
    toast.success("Copied to clipboard");
  };

  // Copy full article
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

  // Loading state
  if (sessionLoading || planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );
  }

  // Not logged in
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
          {/* Back button */}
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-brand-red/10 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-brand-red" />
              </div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                Long-Form Content
              </h1>
              <span className="text-xs font-bold uppercase tracking-widest bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                Org+
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              Generate in-depth articles, guides, and thought leadership pieces
            </p>
          </div>

          {/* Access gate */}
          {!hasAccess ? (
            <div className="bg-white border-4 border-slate-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-slate-400" />
              </div>
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
                <button
                  onClick={() => setActiveTab("input")}
                  className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors ${
                    activeTab === "input"
                      ? "bg-brand-navy text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  Input
                </button>
                <button
                  onClick={() => setActiveTab("output")}
                  disabled={!article}
                  className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest transition-colors disabled:opacity-50 ${
                    activeTab === "output"
                      ? "bg-brand-navy text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  Output
                </button>
              </div>

              {activeTab === "input" ? (
                <div className="bg-white border-4 border-slate-200 rounded-2xl p-6 space-y-6">
                  {/* Context Input */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      Source Context *
                    </label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Paste your source material here: articles, notes, research, URLs content, etc. The more context you provide, the better the output."
                      className="w-full h-48 p-4 border border-slate-200 rounded-xl text-sm resize-none focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      {context.length} characters ({context.length < 50 ? "min 50 required" : "ready"})
                    </p>
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Persona */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                        Voice/Persona
                      </label>
                      <select
                        value={selectedPersonaId}
                        onChange={(e) => setSelectedPersonaId(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-brand-red outline-none appearance-none bg-white"
                      >
                        <option value="default">Default (no specific voice)</option>
                        {personas?.map((p) => (
                          <option key={p.uuid} value={p.uuid}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tone */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                        Tone
                      </label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-brand-red outline-none appearance-none bg-white"
                      >
                        {TONE_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label} - {t.desc}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Structure */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                        Structure
                      </label>
                      <select
                        value={structure}
                        onChange={(e) => setStructure(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-brand-red outline-none appearance-none bg-white"
                      >
                        {STRUCTURE_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label} - {s.desc}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Length */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                        Target Length
                      </label>
                      <select
                        value={targetLength}
                        onChange={(e) => setTargetLength(Number(e.target.value))}
                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-brand-red outline-none appearance-none bg-white"
                      >
                        {LENGTH_OPTIONS.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Additional Instructions */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                      Additional Instructions (Optional)
                    </label>
                    <textarea
                      value={additionalInstructions}
                      onChange={(e) => setAdditionalInstructions(e.target.value)}
                      placeholder="Any specific requirements, focus areas, or constraints..."
                      className="w-full h-24 p-4 border border-slate-200 rounded-xl text-sm resize-none focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
                    />
                  </div>

                  {/* Generate Button */}
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
              ) : (
                /* Output Tab */
                article && (
                  <div className="space-y-6">
                    {/* Article Header */}
                    <div className="bg-white border-4 border-slate-200 rounded-2xl p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h2 className="text-2xl font-black text-slate-900 mb-1">
                            {article.title}
                          </h2>
                          {article.subtitle && (
                            <p className="text-slate-500">{article.subtitle}</p>
                          )}
                        </div>
                        <button
                          onClick={handleCopyAll}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
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

                    {/* Sections */}
                    {article.sections.map((section, index) => (
                      <div
                        key={index}
                        className="bg-white border border-slate-200 rounded-xl p-6 group"
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <h3 className="text-lg font-bold text-slate-900">
                            {section.heading}
                          </h3>
                          <button
                            onClick={() => handleCopySection(index, `## ${section.heading}\n\n${section.content}`)}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium transition-all"
                          >
                            {copiedSection === index ? (
                              <>
                                <Check className="w-3 h-3 text-green-600" />
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
                          <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">
                            {section.content}
                          </p>
                        </div>
                        <p className="text-xs text-slate-400 mt-4">
                          {section.wordCount} words
                        </p>
                      </div>
                    ))}

                    {/* New Generation Button */}
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
                )
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
