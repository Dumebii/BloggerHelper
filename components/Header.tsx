"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SettingsModal from "./SettingsModal";
import { supabase } from "@/lib/supabase/client";

interface HeaderProps {
  session?: any;
  onSignIn?: () => void;
  onOpenMobileSidebar?: () => void;
}

export default function Header({ session: propSession, onSignIn, onOpenMobileSidebar }: HeaderProps) {
  const [session, setSession] = useState<any>(propSession || null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  // Fetch session internally if the parent component didn't pass it
  useEffect(() => {
    if (!propSession) {
      const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      };
      getSession();
    } else {
      setSession(propSession);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [propSession]);

  // Handle global settings modal trigger (used by Distillery)
  useEffect(() => {
    const handleOpenSettings = () => setIsSettingsOpen(true);
    window.addEventListener("openSettingsModal", handleOpenSettings);
    return () => window.removeEventListener("openSettingsModal", handleOpenSettings);
  }, []);

  // Close dropdown when clicking outside
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
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <>
      <header className={`w-full z-40 transition-all ${isDashboard ? 'bg-transparent' : 'bg-white border-b border-slate-200'}`}>
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between ${isDashboard ? 'w-full' : 'max-w-7xl'}`}>
          
          {/* --- LEFT SIDE: Brand & Mobile Toggle --- */}
          <div className="flex items-center gap-4">
            {/* Show Hamburger ONLY on Dashboard for Mobile */}
            {isDashboard && (
              <button 
                onClick={onOpenMobileSidebar}
                className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 focus:outline-none bg-white rounded-lg shadow-sm border border-slate-200"
                aria-label="Open sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Show Brand ONLY when NOT on Dashboard (sidebar handles dashboard logo) */}
            {!isDashboard && (
              <Link href="/" className="text-2xl font-black text-slate-800 tracking-tighter">
                Ozigi.
              </Link>
            )}
          </div>

          {/* --- RIGHT SIDE: Navigation & Profile --- */}
          <div className="flex items-center gap-4">
            {/* Landing Page Navigation */}
            {!isDashboard && !session && (
              <nav className="hidden md:flex gap-6 mr-4 text-sm font-semibold text-slate-600">
                <Link href="/pricing" className="hover:text-slate-900 transition">Pricing</Link>
                <Link href="/demo" className="hover:text-slate-900 transition">Demo</Link>
              </nav>
            )}

            {/* User Profile Dropdown (when logged in) */}
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-slate-200 hover:border-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 overflow-hidden shadow-sm"
                >
                  {session.user.user_metadata?.avatar_url ? (
                    <img
                      src={session.user.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-black text-slate-500 uppercase">
                      {session.user.email?.[0] || "U"}
                    </span>
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {session.user.user_metadata?.full_name || "Account"}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {session.user.email}
                      </p>
                    </div>

                    {!isDashboard && (
                      <Link
                        href="/dashboard"
                        className="block w-full text-left px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    {/* Settings button removed – accessible via sidebar */}
                    
                    <div className="h-px bg-slate-100 my-1" />
                    
                    <button
                      onClick={signOut}
                      disabled={isLoggingOut}
                      className="block w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-between group"
                    >
                      {isLoggingOut ? "Logging out..." : "Log Out"}
                      <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not Logged In Actions (Landing Page) */
              <div className="flex items-center gap-3">
                <button
                  onClick={onSignIn}
                  className="hidden md:block text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
                >
                  Log in
                </button>
                <button
                  onClick={onSignIn}
                  className="bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all hover:shadow-md active:scale-95"
                >
                  Try Ozigi Free
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {isSettingsOpen && (
        <SettingsModal
          session={session}
          onEmailAdded={() => {
            // Optionally show a success message or refresh user data
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
}