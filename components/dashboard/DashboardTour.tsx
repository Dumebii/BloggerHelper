"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
  /** If true, the tour will skip this step when the element isn't found */
  optional?: boolean;
}

const allSteps: TourStep[] = [
  {
    target: "[data-tour='distillery-textarea']",
    title: "Step 1: Add Your Context",
    description:
      "Paste a URL, meeting notes, or any raw text here. Ozigi reads it all and builds your campaign from it.",
    position: "bottom",
  },
  {
    target: "[data-tour='platform-selector']",
    title: "Choose Your Platforms",
    description:
      "Toggle which platforms you want content for. Active platforms are highlighted — click any to exclude it.",
    position: "bottom",
  },
  {
    target: "[data-tour='persona-selector']",
    title: "Pick Your Voice",
    description:
      "Select a saved persona or create a new one in Settings. Your persona defines the tone across every post.",
    position: "bottom",
  },
  {
    target: "[data-tour='advanced-toggle']",
    title: "Advanced Options",
    description:
      "Expand this to add campaign directives like target audience, and give your campaign a name for history.",
    position: "top",
  },
  {
    target: "[data-tour='generate-button']",
    title: "Generate Your Campaign",
    description:
      "Hit this to start the AI engine. It creates tailored posts for every selected platform simultaneously.",
    position: "top",
  },
  {
    target: "[data-tour='campaign-cards']",
    title: "Your Campaign Cards",
    description:
      "After generation, each platform gets its own card. Edit, copy, schedule, or generate graphics right here.",
    position: "top",
    optional: true,
  },
  {
    target: "[data-tour='sidebar-history']",
    title: "Generation History",
    description:
      "Every campaign you generate is saved here automatically. Restore any past campaign with one click.",
    position: "right",
  },
  {
    target: "[data-tour='sidebar-scheduled']",
    title: "Scheduled Posts",
    description: "Manage and cancel posts you've queued up for publishing. Your schedule, your control.",
    position: "right",
  },
  {
    target: "[data-tour='sidebar-subscribers']",
    title: "Subscribers",
    description: "Manage your email newsletter list. Add, remove, and export subscribers anytime.",
    position: "right",
  },
  {
    target: "[data-tour='sidebar-personas']",
    title: "Personas",
    description:
      "Create and manage custom voices. Each persona is a distinct tone profile reused across all your content.",
    position: "right",
  },
  {
    target: "[data-tour='sidebar-personas-marketplace']",
    title: "Personas Marketplace",
    description:
      "Browse and import pre-built personas from industry experts. Customize any marketplace persona to match your voice.",
    position: "right",
    optional: true,
  },
  {
    target: "[data-tour='sidebar-long-form']",
    title: "Long-Form Content",
    description:
      "Generate in-depth articles and blog posts (500-8,000 words) with AI. Perfect for thought leadership and detailed guides.",
    position: "right",
    optional: true,
  },
  {
    target: "[data-tour='sidebar-email-lists']",
    title: "Email Lists",
    description:
      "Manage your subscriber lists and segments. Build your audience and send targeted campaigns.",
    position: "right",
    optional: true,
  },
  {
    target: "[data-tour='sidebar-settings']",
    title: "Settings & Integrations",
    description:
      "Connect Discord, Slack, LinkedIn, set up email delivery, and manage your account from here.",
    position: "right",
  },
  {
    target: "[data-tour='sidebar-copilot-settings']",
    title: "Copilot Settings",
    description:
      "Tell your AI assistant about your audience and goals so it gives you sharper, more relevant suggestions.",
    position: "right",
  },
  {
    target: "[data-tour='copilot-button']",
    title: "Ozigi Copilot",
    description:
      "Your always-on AI assistant. Ask questions, brainstorm ideas, or refine drafts. Available on the Organization plan.",
    position: "left",
    optional: true,
  },
];

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface DashboardTourProps {
  isReady: boolean;
  hasCopilot?: boolean;
}

const TOOLTIP_WIDTH = 320;
const TOOLTIP_GAP = 14;
const VIEWPORT_PADDING = 12;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Re-reads the element's bounding rect AFTER any scroll settles.
 * Returns a rect relative to the viewport (for `fixed` positioning).
 */
function getLiveRect(element: Element): DOMRect {
  return element.getBoundingClientRect();
}

export default function DashboardTour({ isReady, hasCopilot = false }: DashboardTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [highlight, setHighlight] = useState<HighlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<React.CSSProperties>({});
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [isPositioning, setIsPositioning] = useState(false);

  const findAttemptRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollSettleRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // ─── Filter steps ────────────────────────────────────────────────────────────
  useEffect(() => {
    let filtered = [...allSteps];
    if (!hasCopilot) {
      filtered = filtered.filter((s) => s.target !== "[data-tour='copilot-button']");
    }
    setSteps(filtered);
  }, [hasCopilot]);

  // ─── Auto-start ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isReady) return;
    const completed = localStorage.getItem("ozigi_tour_completed");
    if (!completed) {
      const t = setTimeout(() => setShowTour(true), 600);
      return () => clearTimeout(t);
    }
  }, [isReady]);

  // ─── Position tooltip around a rect ──────────────────────────────────────────
  const computeTooltipPosition = useCallback(
    (rect: DOMRect, position: TourStep["position"] = "bottom"): React.CSSProperties => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const tooltipHeight = 180; // conservative estimate

      let style: React.CSSProperties = {};

      switch (position) {
        case "bottom": {
          let top = rect.bottom + TOOLTIP_GAP;
          let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
          // Flip to top if overflows bottom
          if (top + tooltipHeight > vh - VIEWPORT_PADDING) {
            top = rect.top - tooltipHeight - TOOLTIP_GAP;
          }
          left = clamp(left, VIEWPORT_PADDING, vw - TOOLTIP_WIDTH - VIEWPORT_PADDING);
          top = clamp(top, VIEWPORT_PADDING, vh - tooltipHeight - VIEWPORT_PADDING);
          style = { top, left };
          break;
        }
        case "top": {
          let top = rect.top - tooltipHeight - TOOLTIP_GAP;
          let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
          if (top < VIEWPORT_PADDING) {
            top = rect.bottom + TOOLTIP_GAP;
          }
          left = clamp(left, VIEWPORT_PADDING, vw - TOOLTIP_WIDTH - VIEWPORT_PADDING);
          top = clamp(top, VIEWPORT_PADDING, vh - tooltipHeight - VIEWPORT_PADDING);
          style = { top, left };
          break;
        }
        case "right": {
          let left = rect.right + TOOLTIP_GAP;
          let top = rect.top + rect.height / 2 - tooltipHeight / 2;
          if (left + TOOLTIP_WIDTH > vw - VIEWPORT_PADDING) {
            left = rect.left - TOOLTIP_WIDTH - TOOLTIP_GAP;
          }
          left = clamp(left, VIEWPORT_PADDING, vw - TOOLTIP_WIDTH - VIEWPORT_PADDING);
          top = clamp(top, VIEWPORT_PADDING, vh - tooltipHeight - VIEWPORT_PADDING);
          style = { top, left };
          break;
        }
        case "left": {
          let left = rect.left - TOOLTIP_WIDTH - TOOLTIP_GAP;
          let top = rect.top + rect.height / 2 - tooltipHeight / 2;
          if (left < VIEWPORT_PADDING) {
            left = rect.right + TOOLTIP_GAP;
          }
          left = clamp(left, VIEWPORT_PADDING, vw - TOOLTIP_WIDTH - VIEWPORT_PADDING);
          top = clamp(top, VIEWPORT_PADDING, vh - tooltipHeight - VIEWPORT_PADDING);
          style = { top, left };
          break;
        }
      }
      return style;
    },
    []
  );

  // ─── Update highlight + tooltip position ─────────────────────────────────────
  const applyPosition = useCallback(
    (element: Element, step: TourStep) => {
      const rect = getLiveRect(element);
      const PADDING = 6;
      setHighlight({
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      });
      setTooltipPos(computeTooltipPosition(rect, step.position));
      setIsPositioning(false);
    },
    [computeTooltipPosition]
  );

  // ─── Find element with retries ────────────────────────────────────────────────
  const findAndPosition = useCallback(
    (step: TourStep, attemptsLeft = 25) => {
      if (findAttemptRef.current) clearTimeout(findAttemptRef.current);

      const element = document.querySelector(step.target);
      if (element) {
        // Scroll it into view, then wait for scroll to settle before reading rect
        element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

        if (scrollSettleRef.current) clearTimeout(scrollSettleRef.current);
        scrollSettleRef.current = setTimeout(() => {
          applyPosition(element, step);

          // Re-observe for layout shifts (e.g. sidebar collapse/expand)
          if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
          resizeObserverRef.current = new ResizeObserver(() => {
            applyPosition(element, step);
          });
          resizeObserverRef.current.observe(element);
        }, 350); // wait for smooth scroll
        return;
      }

      if (attemptsLeft > 0) {
        findAttemptRef.current = setTimeout(() => findAndPosition(step, attemptsLeft - 1), 100);
      } else {
        // Element not found — skip if optional, else show centred tooltip
        if (step.optional) {
          setCurrentStep((prev) => prev + 1);
        } else {
          setHighlight(null);
          setIsPositioning(false);
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          setTooltipPos({
            top: vh / 2 - 90,
            left: vw / 2 - TOOLTIP_WIDTH / 2,
          });
        }
      }
    },
    [applyPosition]
  );

  // ─── React to step changes ────────────────────────────────────────────────────
  useEffect(() => {
    if (!showTour || steps.length === 0) return;

    const step = steps[currentStep];
    if (!step) return;

    setIsPositioning(true);
    setHighlight(null);

    if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
    findAndPosition(step);

    return () => {
      if (findAttemptRef.current) clearTimeout(findAttemptRef.current);
      if (scrollSettleRef.current) clearTimeout(scrollSettleRef.current);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
    };
  }, [currentStep, showTour, steps, findAndPosition]);

  // ─── Re-position on window resize ────────────────────────────────────────────
  useEffect(() => {
    if (!showTour) return;
    const onResize = () => {
      if (!steps[currentStep]) return;
      const el = document.querySelector(steps[currentStep].target);
      if (el) applyPosition(el, steps[currentStep]);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [showTour, currentStep, steps, applyPosition]);

  // ─── Navigation ───────────────────────────────────────────────────────────────
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const completeTour = () => {
    localStorage.setItem("ozigi_tour_completed", "true");
    setShowTour(false);
  };

  const skipTour = () => {
    localStorage.setItem("ozigi_tour_completed", "true");
    setShowTour(false);
  };

  if (!showTour || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      {showTour && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="tour-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9000] pointer-events-none"
            style={{ background: "rgba(10,14,26,0.55)", backdropFilter: "blur(1px)" }}
          />

          {/* Clickable backdrop (separate so pointer-events work) */}
          <div
            className="fixed inset-0 z-[9001]"
            onClick={skipTour}
          />

          {/* ── Spotlight cutout ── */}
          <AnimatePresence>
            {highlight && (
              <motion.div
                key={`highlight-${currentStep}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="fixed z-[9002] pointer-events-none rounded-xl"
                style={{
                  top: highlight.top,
                  left: highlight.left,
                  width: highlight.width,
                  height: highlight.height,
                  boxShadow: "0 0 0 9999px rgba(10,14,26,0.55), 0 0 0 2px #E63922, 0 0 20px 4px rgba(230,57,34,0.35)",
                  borderRadius: "12px",
                }}
              />
            )}
          </AnimatePresence>

          {/* ── Tooltip card ── */}
          <AnimatePresence mode="wait">
            {!isPositioning && (
              <motion.div
                key={`tooltip-${currentStep}`}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="fixed z-[9003] pointer-events-auto"
                style={{ width: TOOLTIP_WIDTH, ...tooltipPos }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                  {/* Progress bar */}
                  <div className="h-1 bg-slate-100">
                    <motion.div
                      className="h-full bg-brand-red"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>

                  <div className="p-5">
                    {/* Step counter badge + title */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <span className="inline-block text-[9px] font-black uppercase tracking-widest text-brand-red mb-1">
                          {currentStep + 1} of {steps.length}
                        </span>
                        <h3 className="text-base font-black uppercase tracking-tighter text-brand-navy leading-tight">
                          {step.title}
                        </h3>
                      </div>
                      <button
                        onClick={skipTour}
                        className="text-slate-300 hover:text-slate-500 transition-colors mt-0.5 shrink-0"
                        aria-label="Close tour"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-500 leading-relaxed mb-5">
                      {step.description}
                    </p>

                    {/* Step dots */}
                    <div className="flex items-center gap-1.5 mb-4">
                      {steps.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentStep(i)}
                          className="transition-all duration-200 rounded-full"
                          style={{
                            width: i === currentStep ? 18 : 6,
                            height: 6,
                            background: i === currentStep
                              ? "#E63922"
                              : i < currentStep
                              ? "#0D1B2A"
                              : "#E2E8F0",
                          }}
                          aria-label={`Go to step ${i + 1}`}
                        />
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {currentStep > 0 && (
                          <button
                            onClick={prevStep}
                            className="px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:text-brand-navy rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            ← Back
                          </button>
                        )}
                        <button
                          onClick={nextStep}
                          className="px-5 py-2 bg-brand-red text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-[#C5280A] transition-colors active:scale-95"
                        >
                          {isLast ? "Finish ✓" : "Next →"}
                        </button>
                      </div>
                      <button
                        onClick={skipTour}
                        className="text-[11px] text-slate-300 hover:text-slate-500 transition-colors"
                      >
                        Skip tour
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
