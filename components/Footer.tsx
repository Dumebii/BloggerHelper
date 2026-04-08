"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Ozigi Logo"
                  className="h-8 w-auto logo-spin"
                />
              </div>
              <span className="text-lg font-black italic uppercase tracking-tighter text-white">
                Ozigi
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              An Automated Content Engine built to close the gap between raw context and content, in your voice.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-5">
              Features
            </h4>
            <div className="flex flex-col gap-3">
              <Link href="/docs/multimodal-pipeline" className="text-sm text-slate-500 hover:text-white transition-colors">
                Multimodal Ingestion
              </Link>
              <Link href="/docs/the-banned-lexicon" className="text-sm text-slate-500 hover:text-white transition-colors">
                Banned Lexicon
              </Link>
              <Link href="/docs/system-personas" className="text-sm text-slate-500 hover:text-white transition-colors">
                System Personas
              </Link>
              <Link href="/docs/human-in-the-loop" className="text-sm text-slate-500 hover:text-white transition-colors">
                Human‑in‑the‑Loop
              </Link>
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-5">
              Community
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://github.com/dumebii/ozigi"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-slate-500 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a href="https://blog.ozigi.app" className="text-sm font-semibold text-slate-600 hover:text-brand-red transition">
                Blog
              </a>
              <Link href="/write" className="text-sm text-slate-500 hover:text-brand-red transition-colors font-semibold">
                Write for Ozigi
              </Link>
              <a
                href="https://linkedin.com/in/dumebi-okolo"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-slate-500 hover:text-white transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-5">
              Connect
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:hello@ozigi.app"
                className="text-sm text-slate-500 hover:text-white transition-colors"
              >
                Email Us
              </a>
              <Link href="/demo" className="text-sm text-slate-500 hover:text-white transition-colors">
                Live Demo
              </Link>
              <a
                href={process.env.NEXT_PUBLIC_CALENDLY_URL || "mailto:hello@ozigi.app"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 hover:text-white transition-colors">
                Contact Sales
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/privacy-policy" className="text-sm text-slate-500 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-slate-500 hover:text-white transition-colors">
            Terms of Service
          </Link>
          <p className="text-xs text-slate-600">
            © 2026 Ozigi. All rights reserved.
          </p>
          <p className="text-xs text-slate-700">
            Built With You In Mind.
          </p>
        </div>
      </div>
    </footer>
  );
}
