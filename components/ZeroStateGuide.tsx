export default function ZeroStateGuide({
  onFillExample,
}: {
  onFillExample: () => void;
}) {
  return (
    <div className="mb-12 bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">
          The AI Distribution Engine
        </h2>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">
          Turn a single article, code repository, or messy brain dump into a
          strategic, multi-day social campaign.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl mb-4">
            📝
          </div>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">
            1. The Brain Dump
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Paste your technical article draft, raw meeting notes, or GitHub
            repository URL.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-4 relative">
          <div className="hidden md:block absolute top-10 -left-6 w-12 border-t-2 border-dashed border-slate-200"></div>
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl mb-4">
            🧠
          </div>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">
            2. The Agentic Engine
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Ozigi extracts the hooks and builds a targeted, 3-day distribution
            strategy.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-4 relative">
          <div className="hidden md:block absolute top-10 -left-6 w-12 border-t-2 border-dashed border-slate-200"></div>
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl mb-4">
            🚀
          </div>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">
            3. Distribute
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Generate custom graphics and publish directly to X, LinkedIn, and
            Discord.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onFillExample}
          className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-200 border border-slate-200 px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
        >
          ✨ Load Example Context
        </button>
      </div>
    </div>
  );
}
