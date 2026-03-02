export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 text-center border-t border-slate-900">
      <div className="max-w-4xl mx-auto px-6">
        <h3 className="text-white font-black italic uppercase tracking-widest mb-4">
          OziGi
        </h3>
        <p className="text-xs font-medium mb-8 max-w-md mx-auto leading-relaxed">
          An Agentic Content Engine built to close the gap between raw research
          and structured distribution.
        </p>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6 md:mb-8 text-[9px] md:text-[10px] font-black tracking-widest uppercase">
          <a
            href="https://linkedin.com/in/dumebi-okolo"
            target="_blank"
            rel="noreferrer"
            className="hover:text-red-500 transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/dumebii"
            target="_blank"
            rel="noreferrer"
            className="hover:text-red-500 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://dev.to/dumebii"
            target="_blank"
            rel="noreferrer"
            className="hover:text-red-500 transition-colors"
          >
            Dev.to
          </a>
          <a
            href="mailto:okolodumebi@gmail.com"
            className="hover:text-red-500 transition-colors"
          >
            Contact
          </a>
        </div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-slate-600">
          © 2026 WriterHelper. Built for Content Wizzes!.
        </p>
      </div>
    </footer>
  );
}
