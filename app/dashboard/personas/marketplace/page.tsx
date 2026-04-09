"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Users, 
  Sparkles, 
  ArrowLeft,
  Loader2,
  Check,
  Star
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/dashboard/Sidebar";
import { useSession } from "@/components/hooks/useSession";
import { usePlanStatus } from "@/components/hooks/usePlanStatus";
import { getMarketplacePersonas, savePersonaAndRedirect, type MarketplacePersona } from "@/lib/supabase/personas";

// Persona card icons - simple colored backgrounds
const PERSONA_COLORS: Record<string, string> = {
  "Battle-Tested Engineer": "bg-orange-500",
  "DevRel Champion": "bg-blue-500",
  "Technical Founder": "bg-purple-500",
  "Data Storyteller": "bg-green-500",
  "Thought Leader": "bg-indigo-500",
  "Technical Writer": "bg-teal-500",
  "Community Builder": "bg-pink-500",
  "Product Mapper": "bg-amber-500",
};

export default function PersonaMarketplacePage() {
  const router = useRouter();
  const { session, sessionLoading } = useSession();
  const { planStatus, stats, isLoading: isLoadingStats } = usePlanStatus(session);

  const [personas, setPersonas] = useState<MarketplacePersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Fetch marketplace personas
  useEffect(() => {
    async function fetchPersonas() {
      setLoading(true);
      const data = await getMarketplacePersonas();
      setPersonas(data);
      setLoading(false);
    }
    fetchPersonas();
  }, []);

  // Handle save persona
  const handleSavePersona = async (persona: MarketplacePersona) => {
    if (!session?.user?.id) {
      toast.error("Please sign in to save personas");
      return;
    }

    setSavingId(persona.id);

    const result = await savePersonaAndRedirect(
      session.user.id,
      persona.name,
      persona.prompt
    );

    if (result.success && result.personaId) {
      setSavedIds((prev) => new Set([...prev, persona.id]));
      toast.success(`"${persona.name}" saved to your personas!`);
      
      // Redirect to dashboard with persona pre-selected
      router.push(`/dashboard?persona=${result.personaId}`);
    } else {
      toast.error(result.error || "Failed to save persona");
    }

    setSavingId(null);
  };

  // Loading state
  if (sessionLoading) {
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

  // Separate featured and regular personas
  const featuredPersonas = personas.filter((p) => p.is_featured);
  const regularPersonas = personas.filter((p) => !p.is_featured);

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
          isLoadingStats={isLoadingStats}
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
                <Users className="w-6 h-6 text-brand-red" />
              </div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">
                Persona Marketplace
              </h1>
            </div>
            <p className="text-slate-500 text-sm max-w-2xl">
              Choose from our curated collection of expert voices. Each persona is crafted to help you create authentic, engaging content in a specific style.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
            </div>
          ) : (
            <>
              {/* Featured Personas */}
              {featuredPersonas.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
                      Featured Personas
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featuredPersonas.map((persona) => (
                      <PersonaCard
                        key={persona.id}
                        persona={persona}
                        isFeatured
                        isSaving={savingId === persona.id}
                        isSaved={savedIds.has(persona.id)}
                        onSave={() => handleSavePersona(persona)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Personas */}
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 mb-4">
                  All Personas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regularPersonas.map((persona) => (
                    <PersonaCard
                      key={persona.id}
                      persona={persona}
                      isFeatured={false}
                      isSaving={savingId === persona.id}
                      isSaved={savedIds.has(persona.id)}
                      onSave={() => handleSavePersona(persona)}
                    />
                  ))}
                </div>
              </div>

              {personas.length === 0 && (
                <div className="text-center py-20 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No personas available yet. Check back soon!</p>
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

// Persona Card Component
interface PersonaCardProps {
  persona: MarketplacePersona;
  isFeatured: boolean;
  isSaving: boolean;
  isSaved: boolean;
  onSave: () => void;
}

function PersonaCard({ persona, isFeatured, isSaving, isSaved, onSave }: PersonaCardProps) {
  const bgColor = PERSONA_COLORS[persona.name] || "bg-slate-500";

  return (
    <div
      className={`bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg ${
        isFeatured ? "border-amber-200 ring-2 ring-amber-100" : "border-slate-200"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={`${bgColor} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-lg font-black">
              {persona.name.charAt(0)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900 truncate">{persona.name}</h3>
              {isFeatured && (
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-slate-500 line-clamp-2">
              {persona.description}
            </p>
          </div>
        </div>

        {/* Voice Preview */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
            {persona.prompt.slice(0, 150)}...
          </p>
        </div>

        {/* Action */}
        <button
          onClick={onSave}
          disabled={isSaving || isSaved}
          className={`mt-4 w-full py-2.5 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 ${
            isSaved
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-brand-navy text-white hover:bg-slate-800"
          } disabled:opacity-50`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : isSaved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Use This Persona
            </>
          )}
        </button>
      </div>
    </div>
  );
}
