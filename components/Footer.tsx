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
                  src="/icon.svg"
                  alt="Ozigi Logo"
                  className="w-9 h-9 object-contain"
                />
              </div>
              <span className="text-lg font-black italic uppercase tracking-tighter text-white">
                Ozigi
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              An Agentic Content Engine built to close the gap between raw research and structured distribution.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-5">
              Product
            </h4>
            <div className="flex flex-col gap-3">
              <Link href="/docs" className="text-sm text-slate-500 hover:text-white transition-colors">
                Documentation
              </Link>
              <Link href="/architecture" className="text-sm text-slate-500 hover:text-white transition-colors">
                Architecture
              </Link>
              <Link href="/dashboard" className="text-sm text-slate-500 hover:text-white transition-colors">
                Dashboard
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
                href="https://github.com/dumebii"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-slate-500 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://dev.to/dumebii"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-slate-500 hover:text-white transition-colors"
              >
                Blog
              </a>
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
                href="mailto:okolodumebi@gmail.com"
                className="text-sm text-slate-500 hover:text-white transition-colors"
              >
                Email Us
              </a>
              <Link href="/demo" className="text-sm text-slate-500 hover:text-white transition-colors">
                Live Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © 2026 Ozigi. All rights reserved.
          </p>
          <p className="text-xs text-slate-700">
            Built for Content Wizzes.
          </p>
        </div>
      </div>
    </footer>
  );
}
