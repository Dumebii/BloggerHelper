export default function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24 flex flex-col items-center text-center">
      <div className="inline-block px-3 py-1 mb-6 rounded-full bg-red-50 border border-red-100 text-red-700 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">
        Agentic Social Media Manager
      </div>
      {/* Adjusted font sizing: text-5xl for mobile, md:text-7xl for tablets, lg:text-8xl for desktop */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter text-slate-950 mb-6 md:mb-8 leading-[1.1] md:leading-[0.9]">
        TURN YOUR IDEAS INTO <br className="hidden md:block" /> WINNING SOCIAL
        MEDIA <br className="hidden md:block" /> CONTENT{" "}
        <span className="text-red-700 block md:inline md:text-nowrap mt-2 md:mt-0">
          IN YOUR OWN VOICE!
        </span>
      </h1>
      <p className="max-w-2xl text-slate-500 text-base md:text-lg font-medium mb-10 md:mb-12 leading-relaxed px-2 md:px-0">
        Stop struggling to extract content from your context. OziGi
        ingests your long-form articles, personal notes, and meeting transcripts
        to architect a 3-day social media campaign that actually sounds like
        you.
      </p>
      <button
        onClick={onStart}
        className="bg-slate-950 text-white px-8 md:px-12 py-4 md:py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-2xl active:scale-95 text-xs md:text-base w-full sm:w-auto"
        aria-label="Try the Context Engine Now"
      >
        TRY IT NOW
      </button>
    </div>
  );
}
