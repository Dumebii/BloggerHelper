"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";
import SettingsModal from "./SettingsModal";

export default function Header({
  session,
  onOpenHistory,
  onSignIn,
}: {
  session: any;
  onOpenHistory: () => void;
  onSignIn: () => void;
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const signOut = async () => await supabase.auth.signOut();
  const avatarUrl = session?.user?.user_metadata?.avatar_url;

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
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Announcement Banner - only on landing page */}
      {pathname === "/" && (
        <div className="fixed top-0 left-0 right-0 z-[60] flex justify-center pt-3 px-4 pointer-events-none">
          <Link
            href="/dashboard"
            className="pointer-events-auto inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-lg hover:bg-slate-800 hover:-translate-y-0.5 transition-all"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ozigi is live — try it free today
            <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      )}

      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          pathname === "/" ? "top-10" : "top-0"
        }`}
      >
        <div className="px-4 md:px-8 pt-3">
          <div
            className={`max-w-6xl mx-auto flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300 ${
              scrolled
                ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-900/5 border border-slate-200/80"
                : "bg-white/60 backdrop-blur-md border border-slate-200/40"
            }`}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                <img
                  src="/icon.svg"
                  alt="Ozigi Logo"
                  className="w-9 h-9 object-contain"
                />
              </div>
              <span className="text-lg font-black italic uppercase tracking-tighter text-slate-900 hidden sm:block">
                Ozigi
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: "/docs", label: "Docs" },
                { href: "/architecture", label: "Architecture" },
                { href: "#pricing", label: "Pricing" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === link.href
                      ? "text-slate-900 bg-slate-100"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {!session ? (
                <>
                  <button
                    onClick={onSignIn}
                    className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onSignIn}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  {pathname !== "/" && (
                    <button
                      onClick={onOpenHistory}
                      className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      History
                    </button>
                  )}
                  <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-full border border-slate-200">
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden border-2 border-white hover:border-indigo-300 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0"
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
                    <button
                      onClick={signOut}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 transition-colors hidden sm:block"
                    >
                      Log Out
                    </button>
                  </div>
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
