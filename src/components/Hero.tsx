"use client";

import { motion } from "framer-motion";
import { ChevronDown, Heart, Star, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function Hero() {
  const [typedText, setTypedText] = useState("");
  const [floatingBalloons, setFloatingBalloons] = useState<{
    id: number;
    x: number;
    y: number;
    delay: number;
    duration: number;
    size: number;
    color: string;
    driftX: number;
  }[]>([]);
  const [floatingHearts, setFloatingHearts] = useState<{
    id: number;
    x: number;
    delay: number;
    duration: number;
    size: number;
    rotateDrift: number;
  }[]>([]);

  const fullText = "Today is all about you...";

  useEffect(() => {
    let index = 0;
    const timeout = setInterval(() => {
      setTypedText((prev) => prev + fullText.charAt(index));
      index++;
      if (index >= fullText.length) {
        clearInterval(timeout);
      }
    }, 120);

    // Generate floating elements configuration only on client mount
    const balloons = Array.from({ length: 8 }).map((_, i) => {
      const xVal = Math.random() * 80 + 10;
      return {
        id: i,
        x: xVal,
        y: Math.random() * 50 + 50,
        delay: Math.random() * 4,
        duration: Math.random() * 10 + 15,
        size: Math.random() * 30 + 20,
        color: i % 2 === 0 ? "rgba(212, 175, 55, 0.4)" : "rgba(255, 42, 95, 0.4)",
        driftX: xVal + (Math.random() - 0.5) * 10,
      };
    });
    const hearts = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      delay: Math.random() * 5,
      duration: Math.random() * 8 + 10,
      size: Math.random() * 20 + 10,
      rotateDrift: Math.random() * 45 - 22.5,
    }));

    requestAnimationFrame(() => {
      setFloatingBalloons(balloons);
      setFloatingHearts(hearts);
    });

    return () => clearInterval(timeout);
  }, []);

  const handleNextSection = () => {
    const lenis = (window as unknown as { lenis?: { scrollTo: (target: string, options?: { offset?: number; duration?: number }) => void } }).lenis;
    if (lenis) {
      lenis.scrollTo("#memories", { offset: 0, duration: 1.5 });
    } else {
      document.getElementById("memories")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-black via-black/95 to-[#050505] px-6 py-20"
    >
      {/* Floating Balloons Animation */}
      {floatingBalloons.map((balloon) => (
        <motion.div
          key={`balloon-${balloon.id}`}
          className="absolute rounded-full pointer-events-none filter blur-[1px]"
          style={{
            left: `${balloon.x}%`,
            width: balloon.size,
            height: balloon.size * 1.2,
            backgroundColor: balloon.color,
            boxShadow: "inset -5px -5px 15px rgba(0,0,0,0.3), 0 10px 20px rgba(0,0,0,0.1)",
          }}
          initial={{ y: "100vh", opacity: 0 }}
          animate={{
            y: "-20vh",
            opacity: [0, 0.8, 0.8, 0],
            x: [`${balloon.x}%`, `${balloon.driftX}%`],
          }}
          transition={{
            duration: balloon.duration,
            repeat: Infinity,
            delay: balloon.delay,
            ease: "linear",
          }}
        />
      ))}

      {/* Floating Hearts Animation */}
      {floatingHearts.map((heart) => (
        <motion.div
          key={`heart-${heart.id}`}
          className="absolute text-[#ff2a5f] pointer-events-none opacity-40"
          style={{
            left: `${heart.x}%`,
            fontSize: heart.size,
          }}
          initial={{ y: "100vh", scale: 0 }}
          animate={{
            y: "-10vh",
            scale: [0.5, 1.2, 1, 0.5],
            opacity: [0, 0.6, 0.6, 0],
            rotate: [0, heart.rotateDrift],
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: "easeOut",
          }}
        >
          <Heart fill="currentColor" className="w-full h-full" />
        </motion.div>
      ))}

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        {/* Top tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-[#d4af37]/20 bg-[#d4af37]/5 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-spin" style={{ animationDuration: '4s' }} />
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
            Special Dedication
          </span>
        </motion.div>

        {/* Shimmering Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-cinzel text-4xl sm:text-6xl md:text-8xl font-black tracking-tight leading-tight mb-8"
        >
          <span className="block text-white">Happy Birthday,</span>
          <span className="text-shimmer drop-shadow-[0_10px_30px_rgba(255,42,95,0.2)]">
            Sister ❤️
          </span>
        </motion.h1>

        {/* Typewriter subtitle */}
        <div className="h-8 mb-12 flex items-center justify-center">
          <span className="font-outfit text-lg sm:text-2xl text-white/70 font-light tracking-wide">
            {typedText}
          </span>
          <span
            className="inline-block w-[2px] h-6 bg-[#d4af37] ml-1 animate-pulse"
          />
        </div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.0, ease: "easeOut" }}
          onClick={handleNextSection}
          className="relative group px-8 py-4 rounded-full border border-white/10 glass-panel shadow-[0_0_20px_rgba(212,175,55,0.05)] hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:border-[#d4af37]/30 transition-all duration-500 scale-100 hover:scale-105 active:scale-95 cursor-pointer"
        >
          {/* Internal glowing effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#d4af37]/10 to-[#ff2a5f]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <span className="relative z-10 flex items-center gap-3 text-sm font-semibold tracking-wider uppercase text-white group-hover:text-[#d4af37] transition-colors duration-300">
            Open Your Birthday Surprise
            <ChevronDown className="w-4 h-4 text-white group-hover:text-[#d4af37] group-hover:translate-y-1 transition-all duration-300" />
          </span>
        </motion.button>
      </div>

      {/* Decorative stars */}
      <div className="absolute top-1/4 left-1/10 text-white/20 animate-pulse"><Star fill="currentColor" className="w-4 h-4" /></div>
      <div className="absolute top-1/3 right-1/8 text-[#d4af37]/20 animate-pulse" style={{ animationDelay: '1s' }}><Sparkles className="w-5 h-5" /></div>
      <div className="absolute bottom-1/4 left-1/8 text-[#ff2a5f]/20 animate-pulse" style={{ animationDelay: '2s' }}><Heart fill="currentColor" className="w-4 h-4" /></div>
      <div className="absolute bottom-1/3 right-1/10 text-white/20 animate-pulse" style={{ animationDelay: '1.5s' }}><Star fill="currentColor" className="w-3 h-3" /></div>
    </section>
  );
}
