import { supabase } from "../lib/supabase";

export default function Header({
  session,
  view,
  setView,
  onOpenHistory,
}: {
  session: any;
  view: string;
  setView: (v: "landing" | "dashboard") => void;
  onOpenHistory: () => void;
}) {
  const signIn = async () =>
    await supabase.auth.signInWithOAuth({ provider: "github" });
  const signOut = async () => await supabase.auth.signOut();

  return (
    <nav
      className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center"
      aria-label="Main Navigation"
    >
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setView("landing")}
        role="button"
        aria-label="Go to Homepage"
      >
        <div className="bg-red-700 p-1.5 rounded-lg shrink-0">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M12 2L19 12L12 22L5 12L12 2Z" fill="white" />
          </svg>
        </div>
        {/* Hides the text on very small screens to prevent overlap */}
        <span className="font-black italic uppercase tracking-tighter text-slate-900 hidden sm:block">
          OziGi
        </span>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {session && view === "dashboard" && (
          <button
            onClick={onOpenHistory}
            className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors shrink-0"
            aria-label="View History"
          >
            📚 <span className=" sm:inline">History</span>
          </button>
        )}
        {view === "dashboard" && (
          <button
            onClick={() => setView("landing")}
            className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 shrink-0"
          >
            Home
          </button>
        )}

        {session ? (
          <button
            onClick={signOut}
            className="bg-slate-900 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shrink-0"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={signIn}
            className="bg-red-700 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shrink-0"
          >
            Connect to Github
          </button>
        )}
      </div>
    </nav>
  );
}
