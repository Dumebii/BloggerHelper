"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Clock, BookOpen, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  TUTORIALS,
  TUTORIAL_CATEGORIES,
  type Tutorial,
  type TutorialCategory,
} from "@/lib/tutorials";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function TutorialsPage() {
  const [activeCategory, setActiveCategory] = useState<TutorialCategory>("All");
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);

  const filtered =
    activeCategory === "All"
      ? TUTORIALS
      : TUTORIALS.filter((t) => t.category === activeCategory);

  // Close modal on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeTutorial) setActiveTutorial(null);
    },
    [activeTutorial]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = activeTutorial ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeTutorial]);

  const totalMinutes = TUTORIALS.reduce((acc, t) => {
    const [m, s] = t.duration.split(":").map(Number);
    return acc + (m || 0) + Math.round((s || 0) / 60);
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-brand-offwhite overflow-hidden">
      <Header />

      {/* ── Hero ── */}
      <section className="relative py-20 md:py-28 px-6 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red/6 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-brand-navy/5 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-6">
              <span className="bg-brand-red/10 text-brand-red text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" />
                Video Docs
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-brand-navy mb-4"
            >
              Learn{" "}
              <span className="text-brand-red">Ozigi</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-slate-500 font-medium max-w-xl mx-auto mb-8"
            >
              Step-by-step video walkthroughs for every part of the product.
              Watch once, ship faster forever.
            </motion.p>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="flex items-center justify-center gap-6 text-sm text-slate-400 font-medium"
            >
              <span className="flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-brand-red" />
                {TUTORIALS.length} {TUTORIALS.length === 1 ? "tutorial" : "tutorials"}
              </span>
              <span className="w-px h-4 bg-slate-200" />
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-red" />
                {totalMinutes} min of content
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Filter bar ── */}
      <div className="px-6 pb-6 max-w-5xl mx-auto w-full">
        <div className="flex flex-wrap gap-2">
          {TUTORIAL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeCategory === cat
                  ? "bg-brand-navy text-white shadow-md"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      <main className="flex-1 px-6 pb-24 max-w-5xl mx-auto w-full">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No tutorials in this category yet.</p>
          </div>
        ) : (
          <motion.div
            key={activeCategory}
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((tutorial) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={tutorial}
                onPlay={() => setActiveTutorial(tutorial)}
              />
            ))}
          </motion.div>
        )}
      </main>

      <Footer />

      {/* ── Video Modal ── */}
      <AnimatePresence>
        {activeTutorial && (
          <VideoModal
            tutorial={activeTutorial}
            onClose={() => setActiveTutorial(null)}
            onNext={() => {
              const idx = TUTORIALS.findIndex((t) => t.id === activeTutorial.id);
              const next = TUTORIALS[idx + 1];
              if (next) setActiveTutorial(next);
            }}
            hasPrev={TUTORIALS.findIndex((t) => t.id === activeTutorial.id) > 0}
            hasNext={
              TUTORIALS.findIndex((t) => t.id === activeTutorial.id) <
              TUTORIALS.length - 1
            }
            onPrev={() => {
              const idx = TUTORIALS.findIndex((t) => t.id === activeTutorial.id);
              const prev = TUTORIALS[idx - 1];
              if (prev) setActiveTutorial(prev);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tutorial Card
// ─────────────────────────────────────────────

function TutorialCard({
  tutorial,
  onPlay,
}: {
  tutorial: Tutorial;
  onPlay: () => void;
}) {
  const thumbnailUrl =
    tutorial.videoId === "REPLACE_WITH_YOUTUBE_ID"
      ? null
      : `https://img.youtube.com/vi/${tutorial.videoId}/maxresdefault.jpg`;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group bg-white rounded-[1.75rem] border border-slate-100 shadow-sm hover:shadow-xl transition-shadow overflow-hidden cursor-pointer"
      onClick={onPlay}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={tutorial.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-navy to-slate-700 flex items-center justify-center">
            <span className="text-white/20 text-xs font-black uppercase tracking-widest">
              Coming Soon
            </span>
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-brand-navy/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-5 h-5 text-brand-navy fill-brand-navy ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        {tutorial.duration !== "0:00" && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded-md">
            {tutorial.duration}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <span className="inline-block text-[10px] font-black uppercase tracking-widest text-brand-red mb-2">
          {tutorial.category}
        </span>
        <h3 className="font-black text-slate-900 leading-snug mb-2 group-hover:text-brand-red transition-colors">
          {tutorial.title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {tutorial.description}
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Video Modal
// ─────────────────────────────────────────────

function VideoModal({
  tutorial,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: {
  tutorial: Tutorial;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}) {
  const isPlaceholder = tutorial.videoId === "REPLACE_WITH_YOUTUBE_ID";

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-brand-navy/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Video embed */}
          <div className="relative aspect-video bg-slate-900">
            {isPlaceholder ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <Play className="w-12 h-12 text-white/20" />
                <p className="text-white/40 text-sm font-medium">
                  Video coming soon — replace the videoId in{" "}
                  <code className="text-white/60">lib/tutorials.ts</code>
                </p>
              </div>
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${tutorial.videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={tutorial.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            )}
          </div>

          {/* Info */}
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-red">
                  {tutorial.category}
                </span>
                <h2 className="text-xl font-black text-brand-navy mt-1 mb-2">
                  {tutorial.title}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {tutorial.description}
                </p>
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Prev / Next navigation */}
            {(hasPrev || hasNext) && (
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
                <button
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Previous
                </button>
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
