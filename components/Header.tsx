"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import AuthModal from "./AuthModal";
import SettingsModal from "./SettingsModal"; // Import the new modal

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const signIn = async () =>
    await supabase.auth.signInWithOAuth({ provider: "github" });
  const signOut = async () => await supabase.auth.signOut();

  // Extract avatar from GitHub metadata
  const avatarUrl = session?.user?.user_metadata?.avatar_url;

  return (
    <>
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
          <span className="font-black italic uppercase tracking-tighter text-red-900">
            Ozigi
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {session && view === "dashboard" && (
            <button
              onClick={onOpenHistory}
              className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors shrink-0"
              aria-label="View History"
            >
              📚 <span className="hidden sm:inline">History</span>
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
            <div className="flex items-center gap-3 md:gap-4 border-l border-slate-200 pl-3 md:pl-4 ml-1 md:ml-2">
              {/* Settings / Profile Button */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                title="Workspace Settings"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">
                    👤
                  </div>
                )}
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-900 hidden lg:block">
                  Settings
                </span>
              </button>

              <button
                onClick={signOut}
                className="bg-slate-900 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shrink-0"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-red-700 text-white px-5 md:px-8 py-2 md:py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-red-800 transition-all shadow-lg active:scale-95 shrink-0"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Render Modal conditionally over the UI */}
      {isSettingsOpen && (
        <SettingsModal
          session={session}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Render Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
}
