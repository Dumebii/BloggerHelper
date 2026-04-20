"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import AuthModal from "../components/AuthModal";

// ── Platform icons ────────────────────────────────────────────────────────────

const LinkedInIcon = () => (
  <svg className="w-4 h-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-3.5 h-3.5 text-slate-900" viewBox="0 0 1200 1227" fill="currentColor">
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-4 h-4 text-[#5865F2]" viewBox="0 0 127.14 96.36" fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77.7,77.7,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z" />
  </svg>
);

// ── Card data ─────────────────────────────────────────────────────────────────

const CARDS = [
  {
    id: "linkedin",
    platform: "LinkedIn",
    icon: <LinkedInIcon />,
    author: {
      name: "Dumebi Okolo",
      title: "Founder · Ozigi",
      usePhoto: true,
    },
    body: `I watched a client's reach drop 60% in two weeks because they relied on the same generic templates everyone else uses.\n\n360Brew is hunting for those patterns. We've spent the last month mapping these distribution traps to understand why some technical posts land while the 'hustle' accounts are flatlining.\n\nThe system rewards first-person accounts with specific, verifiable outcomes. If you can't point to a specific decision — like choosing connection pooling over caching to save 140ms on cold starts — the algorithm classifies you as noise.\n\nWe built Ozigi to solve this by enforcing these signals.\n\nHow are you adjusting your technical posts to avoid the generic AI reach penalty?`,
    stats: { likes: 247, comments: 38 },
    accent: "text-[#0A66C2]",
    bg: "bg-[#0A66C2]/8",
  },
  {
    id: "twitter",
    platform: "X (Twitter)",
    icon: <XIcon />,
    author: {
      name: "Dumebi Okolo",
      title: "@dumebi_okolo",
      usePhoto: true,
    },
    body: `most "AI content" fails because it optimises for length, not signal.\n\nthe algorithm doesn't care how many words you used.\n\nit cares whether a real human wrote something worth reading.\n\nhere's what that looks like in practice 🧵`,
    stats: { likes: 891, retweets: 203 },
    accent: "text-slate-900",
    bg: "bg-slate-100",
  },
  {
    id: "discord",
    platform: "Discord",
    icon: <DiscordIcon />,
    author: {
      name: "dumebi",
      title: "Admin · Ozigi HQ",
      usePhoto: true,
    },
    body: `📦 shipped: persona system v2\n\nnot just "set your tone" — you now define your actual character. technical depth, sentence rhythm, phrases you'd never say, things you always say.\n\nevery draft that comes out is already shaped like you before you touch the edit button.\n\ngo try it → ozigi.app/dashboard/personas`,
    stats: { likes: 54, comments: 21 },
    accent: "text-[#5865F2]",
    bg: "bg-[#5865F2]/8",
  },
];

// ── Swipeable card ─────────────────────────────────────────────────────────────

const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY = 300;

function SwipeCard({
  card,
  onSwipe,
  isTop,
  stackIndex,
}: {
  card: (typeof CARDS)[0];
  onSwipe: (dir: "left" | "right") => void;
  isTop: boolean;
  stackIndex: number;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Visual hint labels
  const likeOpacity = useTransform(x, [20, 80], [0, 1]);
  const passOpacity = useTransform(x, [-80, -20], [1, 0]);

  const stackOffset = stackIndex * 6;
  const stackRotate = stackIndex === 1 ? 3 : stackIndex === 2 ? -2 : 0;
  const stackScale = 1 - stackIndex * 0.04;

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        zIndex: 10 - stackIndex,
        originX: 0.5,
        originY: 1,
      }}
      initial={{
        scale: stackScale,
        y: stackOffset,
        rotate: stackRotate,
      }}
      animate={{
        scale: stackScale,
        y: stackOffset,
        rotate: stackRotate,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        style={isTop ? { x, rotate, opacity } : {}}
        drag={isTop ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragEnd={(_, info) => {
          if (
            Math.abs(info.offset.x) > SWIPE_THRESHOLD ||
            Math.abs(info.velocity.x) > SWIPE_VELOCITY
          ) {
            onSwipe(info.offset.x > 0 ? "right" : "left");
          }
        }}
        whileDrag={{ cursor: "grabbing" }}
        className={`w-full h-full bg-white rounded-3xl border border-slate-100 shadow-xl p-6 flex flex-col select-none ${isTop ? "cursor-grab" : ""}`}
      >
        {/* Like / Pass labels */}
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-6 left-6 border-2 border-green-400 text-green-500 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg rotate-[-12deg]"
            >
              Publish ✓
            </motion.div>
            <motion.div
              style={{ opacity: passOpacity }}
              className="absolute top-6 right-6 border-2 border-brand-red text-brand-red text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg rotate-[12deg]"
            >
              Regen ↺
            </motion.div>
          </>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            {card.icon}
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {card.platform}
            </span>
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${card.accent} ${card.bg}`}>
            With Ozigi
          </span>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-brand-navy flex-shrink-0">
            {card.author.usePhoto ? (
              <Image
                src="/dumebi-okolo.jpg"
                alt={card.author.name}
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-white text-xs font-black">
                DO
              </span>
            )}
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{card.author.name}</p>
            <p className="text-xs text-slate-400 truncate">{card.author.title}</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line line-clamp-[9]">
            {card.body}
          </p>
        </div>

        {/* Engagement */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 flex-shrink-0">
          <button className="flex items-center gap-1.5 text-slate-400">
            <span className="text-sm leading-none">👍</span>
            <span className="text-xs font-semibold text-slate-500">{card.stats.likes}</span>
          </button>
          <button className="flex items-center gap-1.5 text-slate-400">
            <span className="text-sm leading-none">💬</span>
            <span className="text-xs font-semibold text-slate-500">{card.stats.comments}</span>
          </button>
          {isTop && (
            <p className="ml-auto text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              drag to swipe
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

export default function Hero() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const prevSession = useRef<any>(null);
  const [cards, setCards] = useState(CARDS);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      prevSession.current = s;
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "SIGNED_IN" && !prevSession.current) router.push("/dashboard");
      prevSession.current = newSession;
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const handleSwipe = (_dir: "left" | "right") => {
    setCards((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first]; // cycle swiped card to the back
    });
  };

  return (
    <section className="relative bg-brand-offwhite flex flex-col min-h-[92vh]">

      {/* Main layout */}
      <div className="flex-1 flex items-center w-full max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 w-full">

          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 space-y-5 text-center lg:text-left"
          >
            <h1 className="text-[72px] md:text-[88px] lg:text-[100px] font-black text-brand-navy leading-none tracking-tighter">
              Create
            </h1>

            <p className="text-2xl md:text-[2rem] lg:text-[2.25rem] font-black text-brand-red leading-snug tracking-tight">
              content that sounds like you,<br className="hidden sm:block" /> not like AI.
            </p>

            <p className="text-sm text-slate-500 font-semibold tracking-wide">
              AI-powered content engine
            </p>

            <div className="pt-2">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 font-black text-sm uppercase tracking-widest text-brand-navy hover:text-brand-red transition-colors group"
              >
                Start for free
                <span className="inline-block group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </div>
          </motion.div>

          {/* Right: swipeable card deck */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex items-center justify-center w-full"
          >
            <div
              className="relative w-full max-w-[340px]"
              style={{ height: 420 }}
            >
              <AnimatePresence>
                {cards.slice(0, 3).map((card, i) => (
                  <SwipeCard
                    key={card.id}
                    card={card}
                    isTop={i === 0}
                    stackIndex={i}
                    onSwipe={handleSwipe}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Bottom pill */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
        className="pb-6 flex justify-center"
      >
        <div className="bg-brand-navy text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-sm">
          Ozigi — Content That Sounds Human
        </div>
      </motion.div>

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </section>
  );
}
