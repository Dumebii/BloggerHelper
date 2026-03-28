"use client";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Ozigi" className="h-8 w-auto logo-spin" />
            <span className="text-2xl font-black text-brand-navy tracking-tighter">
              Ozigi
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-brand-red transition">
              Blog
            </Link>
            <Link href="https://ozigi.app/docs" className="text-sm font-semibold text-slate-600 hover:text-brand-red transition">
              Docs
            </Link>
            <Link href="https://ozigi.app/architecture" className="text-sm font-semibold text-slate-600 hover:text-brand-red transition">
              Architecture
            </Link>
            <Link href="https://ozigi.app/pricing" className="text-sm font-semibold text-slate-600 hover:text-brand-red transition">
              Pricing
            </Link>
            <a
              href="https://ozigi.app/dashboard"
              className="bg-brand-navy text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all hover:shadow-md active:scale-95"
            >
              Try Ozigi Free
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100">
            <nav className="flex flex-col gap-3">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-slate-600 hover:text-brand-red transition py-2">
                Blog
              </Link>
              <Link href="https://ozigi.app/docs" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-slate-600 hover:text-brand-red transition py-2">
                Docs
              </Link>
              <Link href="https://ozigi.app/architecture" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-slate-600 hover:text-brand-red transition py-2">
                Architecture
              </Link>
              <Link href="https://ozigi.app/pricing" onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-slate-600 hover:text-brand-red transition py-2">
                Pricing
              </Link>
              <a
                href="https://ozigi.app/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="bg-brand-navy text-white text-center text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all"
              >
                Try Ozigi Free
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}