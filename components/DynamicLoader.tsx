"use client";
import { useState, useEffect } from "react";

const loadingSteps = [
  "🔍 Scanning repository structure...",
  "🧠 Analyzing codebase context...",
  "⚙️ Extracting key technical insights...",
  "📝 Drafting X distribution strategy...",
  "💼 Optimizing LinkedIn hooks...",
  "👾 Structuring Discord announcements...",
  "✨ Finalizing your campaign...",
  "⌛Ten more seconds, really... ",
  "🔄️Countdown with me...",
  "10...🕙",
  "9...🕙",
  "8...🕙",
  "7...🕙",
  "6...🕙",
  "5...🕙",
  "4...🕙",
  "3...🕙",
  "2...🕙",
  "1...🕙",
  "Worth the wait, wasn't it? 😁💖",
];

export default function DynamicLoader() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Change the text every 2.5 seconds
    const interval = setInterval(() => {
      setStepIndex((prevIndex) => {
        // Stop at the last message if the AI is taking a bit longer
        if (prevIndex === loadingSteps.length - 1) return prevIndex;
        return prevIndex + 1;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
      {/* Sleek Spinner */}
      <div className="relative flex items-center justify-center w-12 h-12">
        <div className="absolute w-full h-full border-4 border-slate-200 rounded-full"></div>
        <div className="absolute w-full h-full border-4 border-slate-900 rounded-full border-t-transparent animate-spin"></div>
      </div>

      {/* Dynamic Text */}
      <div className="h-12 md:h-6 overflow-hidden flex items-center justify-center px-4">
        <p
          key={stepIndex}
          className="text-xs md:text-sm text-center font-black uppercase tracking-widest text-slate-700 animate-in slide-in-from-bottom-2 fade-in duration-300"
        >
          {loadingSteps[stepIndex]}
        </p>
      </div>
    </div>
  );
}
