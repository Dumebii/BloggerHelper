import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-10">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="Ozigi Logo" className="h-8 w-auto logo-spin" />
              <span className="text-lg font-black italic uppercase tracking-tighter text-white">
                Ozigi
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              An Agentic Content Engine built to close the gap between raw research and structured distribution.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-5">
              Features
            </h4>
            <div className="flex flex-col gap-3">
              <Link href="https://ozigi.app/docs/multimodal-pipeline" className="text-sm text-slate-500 hover:text-white transition-colors">
                Multimodal Ingestion
              </Link>
              <Link href="https://ozigi.app/docs/the-banned-lexicon" className="text-sm text-slate-500 hover:text-white transition-colors">
                Banned Lexicon
              </Link>
              <Link href="https://ozigi.app/docs/system-personas" className="text-sm text-slate-500 hover:text-white transition-colors">
                System Personas
              </Link>
              <Link href="https://ozigi.app/docs/human-in-the-loop" className="text-sm text-slate-500 hover:text-white transition-colors">
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
              <a href="https://github.com/dumebii/ozigi" target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-white transition-colors">
                GitHub
              </a>
              <a href="https://dev.to/dumebii" target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-white transition-colors">
                Blog
              </a>
              <Link href="https://ozigi.app/write" className="text-sm text-slate-500 hover:text-brand-red transition-colors font-semibold">
                Write for Ozigi
              </Link>
              <a href="https://linkedin.com/in/dumebi-okolo" target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-white transition-colors">
                LinkedIn
              </a>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-5">
              Connect
            </h4>
            <div className="flex flex-col gap-3">
              <a href="mailto:hello@ozigi.app" className="text-sm text-slate-500 hover:text-white transition-colors">
                Email Us
              </a>
              <Link href="https://ozigi.app/demo" className="text-sm text-slate-500 hover:text-white transition-colors">
                Live Demo
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <Link href="https://ozigi.app/privacy-policy" className="text-sm text-slate-500 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="https://ozigi.app/terms" className="text-sm text-slate-500 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <a href="/feed.xml" target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-brand-red transition-colors flex items-center gap-1" title="Subscribe to RSS feed">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="6.18" cy="17.82" r="2.18"/>
                <path d="M4 4.44v2.83c5.33 0 9.67 4.34 9.67 9.67h2.83c0-7.07-5.76-12.5-12.5-12.5zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.53-4.37-9.9-9.9-9.9z"/>
              </svg>
              RSS
            </a>
          </div>
          <p className="text-xs text-slate-600">© 2026 Ozigi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
