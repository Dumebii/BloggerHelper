"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import Script from "next/script";
import { Lock, GitMerge, Zap, Calendar } from "lucide-react";


export default function CompetitorCompare() {
  return (
    <>
       {/* Bento Grid Features */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Voice Constraints */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-indigo-500/10"></div>
              <Lock className="w-10 h-10 text-indigo-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3 text-white">Your Brand Voice, Mathematically Enforced.</h3>
              <p className="text-slate-400 leading-relaxed">
                Tired of editing out generic AI enthusiasm? Ozigi uses strict under‑the‑hood voice constraints.
                You get professional, highly technical, or strictly branded output on the very first try.
              </p>
            </div>

            {/* Multimodal / Cross-platform */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-violet-500/10"></div>
              <GitMerge className="w-10 h-10 text-violet-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3 text-white">One Idea. Any Format. Every Platform.</h3>
              <p className="text-slate-400 leading-relaxed">
                Ozigi is platform‑agnostic and fully multimodal. Feed it a software architecture diagram,
                and watch it generate cohesive narratives tailored for every channel in your stack.
              </p>
            </div>

            {/* Zero Prompt */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all group overflow-hidden relative">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -ml-20 -mb-20 transition-all group-hover:bg-emerald-500/10"></div>
              <Zap className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3 text-white">Zero Prompt Engineering.</h3>
              <p className="text-slate-400 leading-relaxed">
                You shouldn’t need a degree in “talking to AI”. Ozigi abstracts the complex instruction layers away.
                Bring your core idea, and our backend engine handles the complex prompt orchestration for you.
              </p>
            </div>

            {/* Creation vs Scheduling */}
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all group overflow-hidden relative">
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mb-20 transition-all group-hover:bg-blue-500/10"></div>
              <Calendar className="w-10 h-10 text-blue-400 mb-6" />
              <h3 className="text-2xl font-bold mb-3 text-white">Don’t Just Schedule It. Create It.</h3>
              <p className="text-slate-400 leading-relaxed">
                Traditional management tools expect you to bring the finished work. Ozigi solves the actual
                problem: the blank page. We handle the heavy lifting of ideation and generation.
              </p>
            </div>
          </div>
        </section>
    
        </>
        
  )};