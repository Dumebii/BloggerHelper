"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";
import SettingsModal from "./SettingsModal";

export default function Header({
  session,
  onOpenHistory,
  onSignIn,
  onOpenScheduled,
}: {
  session: any;
  onOpenHistory: () => void;
  onSignIn: () => void;
  onOpenScheduled: () => void;
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // 👈 loading state for logout
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleOpenSettings = () => {
      setIsSettingsOpen(true);
    };
    window.addEventListener("openSettingsModal", handleOpenSettings);
    return () => {
      window.removeEventListener("openSettingsModal", handleOpenSettings);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const signOut = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // The onAuthStateChange listener will update the session
    } catch (error) {
      console.error("Sign out error:", error);
      alert("Failed to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  const avatarUrl = session?.user?.user_metadata?.avatar_url;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex flex-col items-center pt-5 gap-4">
        {pathname === "/" && (
          <Link
            href="/dashboard"
            className="pointer-events-auto inline-flex items-center justify-center bg-slate-900 px-5 py-1.5 text-xs sm:text-sm font-semibold text-slate-100 rounded-full shadow-md hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg transition-all group border border-slate-700/50"
          >
            <span className="flex items-center gap-2">
              <span className="text-amber-400">⚡</span> 
              Ozigi is live — try it free today
              <span className="group-hover:translate-x-1 transition-transform opacity-60 ml-1">&rarr;</span>
            </span>
          </Link>
        )}
        <div className="w-full px-4 md:px-8 pointer-events-none">
          <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-xl border-2 border-slate-900 rounded-[2rem] p-3 md:p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto transition-all">
            <Link
              href="/"
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-red-700 rounded-xl md:rounded-2xl rotate-3 group-hover:rotate-12 transition-all flex items-center justify-center shadow-lg shadow-red-900/20">
                <img
                  src="/icon.svg"
                  alt="Ozigi Logo"
                  className="w-8 h-8 md:w-10 md:h-10 object-contain transition-transform group-hover:scale-105"
                />
              </div>
              <span className="font-black italic uppercase tracking-tighter text-xl md:text-2xl hidden sm:block text-slate-900">
                Ozigi
              </span>
            </Link>

            <div className="flex items-center gap-2 md:gap-4">
              <nav className="hidden md:flex items-center gap-4 mr-2 border-r border-slate-200 pr-4">
                <Link 
                  href="/docs" 
                  className={`text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors ${pathname === '/docs' ? 'text-red-700' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Docs
                </Link>
                <Link 
                  href="/architecture" 
                  className={`text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors ${pathname === '/architecture' ? 'text-red-700' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Architecture
                </Link>
              </nav>
              {pathname === "/" ? (
                <Link
                  href="/demo"
                  className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-700 transition-colors px-2 md:px-4"
                >
                  Live Demo
                </Link>
              ) : (
                session && (
                  <>
                    <button
                      onClick={onOpenHistory}
                      className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-700 transition-colors px-2 md:px-4 hidden sm:block"
                    >
                      History
                    </button>
                    <button
                      onClick={onOpenScheduled}
                      className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-700 transition-colors px-2 md:px-4 hidden sm:block"
                    >
                      Scheduled
                    </button>
                  </>
                )
              )}

              {!session ? (
                <button
                  onClick={onSignIn}
                  className="bg-red-700 text-white px-5 md:px-8 py-2 md:py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-red-800 transition-all shadow-lg active:scale-95 shrink-0"
                >
                  Sign In
                </button>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-300 overflow-hidden border-2 border-white hover:border-red-400 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shrink-0"
                    disabled={isLoggingOut}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs">
                        {session.user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setIsSettingsOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Settings
                      </button>
                      <hr className="my-2 border-slate-100" />
                      <button
                        onClick={signOut}
                        disabled={isLoggingOut}
                        className="block w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoggingOut ? "Logging out..." : "Log Out"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {isSettingsOpen && (
        <SettingsModal
          session={session}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
}