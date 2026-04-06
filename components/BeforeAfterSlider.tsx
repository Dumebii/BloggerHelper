"use client";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function BeforeAfterSlider() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleSliderDrag = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const position = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleSliderDrag(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      handleSliderDrag(e);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={sliderRef}
      className="relative h-48 rounded-3xl overflow-hidden border-2 border-slate-200 cursor-col-resize bg-white shadow-xl"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* Before Content (Full width base) */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-slate-100 p-6 md:p-8 flex flex-col justify-center overflow-hidden">
        <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
          Generic AI Output
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          The systematic approach to infrastructure optimization requires comprehensive evaluation of multiple interconnected components and operational efficiency metrics across diverse organizational structures...
        </p>
      </div>

      {/* After Content (Revealed from right) */}
      <div
        className="absolute inset-0 bg-white p-6 md:p-8 flex flex-col justify-center overflow-hidden transition-all"
        style={{
          width: `${sliderPosition}%`,
          right: 0,
          left: "auto",
        }}
      >
        <div className="text-xs font-black uppercase tracking-widest text-brand-red mb-3">
          Ozigi Transformed
        </div>
        <p className="text-sm text-slate-900 leading-relaxed font-medium">
          Build resilient systems. Treat test code like production code. Poor test architecture will sink your test suite before flaky environments do. Manage your test data ruthlessly.
        </p>
      </div>

      {/* Slider Handle */}
      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-gradient-to-r from-slate-300 to-brand-red cursor-col-resize shadow-lg"
        style={{ left: `${sliderPosition}%` }}
        transition={{ type: "tween", duration: 0, ease: "linear" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-xl border-2 border-brand-red hover:scale-125 transition-transform">
          <svg
            className="w-5 h-5 text-brand-red"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7M15 5l7 7-7 7"
            />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
