"use client";

export default function GuestModeBanner({
  onSignIn,
}: {
  onSignIn: () => void;
}) {
  return (
    <div className="mb-8 p-6 md:p-8 rounded-[2rem] bg-slate-900 text-white border-4 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
      <div>
        <div className="inline-block px-3 py-1 mb-3 rounded-full bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
          Guest Mode
        </div>
        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">
          Unlock the Full Context Engine
        </h3>
        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl">
          Sign in to save your campaign history, access the multi-platform
          distribution grid, and eventually post directly to X, LinkedIn and
          Discord.
        </p>
      </div>
      <button
        onClick={onSignIn}
        className="bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shrink-0 active:scale-95 w-full sm:w-auto"
      >
        Sign In to Continue
      </button>
    </div>
  );
}
