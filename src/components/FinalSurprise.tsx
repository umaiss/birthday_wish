"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Sparkles, Heart, RotateCcw } from "lucide-react";

// Types for fireworks
interface Firework {
  x: number;
  y: number;
  targetY: number;
  color: string;
  speed: number;
  angle: number;
  size: number;
  exploded: boolean;
  particles: FireworkParticle[];
}

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
}

export default function FinalSurprise() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [candles, setCandles] = useState([
    { id: 1, lit: true, smoke: false },
    { id: 2, lit: true, smoke: false },
    { id: 3, lit: true, smoke: false },
  ]);
  const [wished, setWished] = useState(false);

  const playPuffSound = () => {
    try {
      const webkitCtx = (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new (window.AudioContext || webkitCtx)();
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.15);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {
      console.warn(e);
    }
  };

  const playChimeSound = () => {
    try {
      const webkitCtx = (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new (window.AudioContext || webkitCtx)();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.4);
      });
    } catch (e) {
      console.warn(e);
    }
  };

  // Blow out candle handler
  const blowCandle = (id: number) => {
    setCandles((prev) =>
      prev.map((c) => {
        if (c.id === id && c.lit) {
          playPuffSound();
          // trigger smoke
          setTimeout(() => {
            setCandles((curr) => curr.map((x) => (x.id === id ? { ...x, smoke: false } : x)));
          }, 1000);
          return { ...c, lit: false, smoke: true };
        }
        return c;
      })
    );
  };

  useEffect(() => {
    const activeCandles = candles.filter((c) => c.lit);
    if (activeCandles.length === 0 && !wished) {
      requestAnimationFrame(() => {
        setWished(true);
      });
      playChimeSound();
      // Blast massive confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [candles, wished]);

  // Restart scrolling from top
  const handleCelebrateAgain = () => {
    setCandles([
      { id: 1, lit: true, smoke: false },
      { id: 2, lit: true, smoke: false },
      { id: 3, lit: true, smoke: false },
    ]);
    setWished(false);

    const lenis = (window as unknown as { lenis?: { scrollTo: (target: string, options?: { offset?: number; duration?: number }) => void } }).lenis;
    if (lenis) {
      lenis.scrollTo("#hero", { offset: 0, duration: 2.0 });
    } else {
      document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Canvas Fireworks simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const fireworks: Firework[] = [];
    const colors = ["#d4af37", "#ff2a5f", "#ffffff", "#b76e79", "#70d6ff", "#ffd166"];

    const createFirework = (x: number, y: number) => {
      const targetY = Math.random() * (height * 0.4) + height * 0.1;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      fireworks.push({
        x,
        y,
        targetY,
        color,
        speed: Math.random() * 3 + 4,
        angle: Math.atan2(targetY - y, 0),
        size: Math.random() * 2 + 1.5,
        exploded: false,
        particles: [],
      });
    };

    const explode = (fw: Firework) => {
      fw.exploded = true;
      const count = 60;
      for (let i = 0; i < count; i++) {
        const angle = (i * Math.PI * 2) / count + (Math.random() - 0.5) * 0.5;
        const speed = Math.random() * 4 + 2;
        fw.particles.push({
          x: fw.x,
          y: fw.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + (Math.random() - 0.5),
          color: fw.color,
          alpha: 1,
          life: Math.random() * 30 + 40,
        });
      }
    };

    // Automated firework scheduler
    let lastLaunch = 0;
    const launchInterval = 1200; // ms

    const draw = (time: number) => {
      ctx.fillStyle = "rgba(3, 3, 3, 0.2)"; // Fade trail
      ctx.fillRect(0, 0, width, height);

      // Automated launch
      if (time - lastLaunch > launchInterval) {
        createFirework(Math.random() * (width * 0.8) + width * 0.1, height);
        lastLaunch = time;
      }

      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];

        if (!fw.exploded) {
          // Travel upwards
          fw.y -= fw.speed;
          
          // Draw rocket particle
          ctx.beginPath();
          ctx.arc(fw.x, fw.y, fw.size, 0, Math.PI * 2);
          ctx.fillStyle = fw.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = fw.color;
          ctx.fill();

          if (fw.y <= fw.targetY) {
            explode(fw);
          }
        } else {
          // Draw explosion particles
          let alive = false;
          fw.particles.forEach((p) => {
            if (p.life > 0) {
              alive = true;
              p.x += p.vx;
              p.y += p.vy;
              p.vy += 0.05; // gravity
              p.life--;
              p.alpha = p.life / 70;

              ctx.beginPath();
              ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
              ctx.fillStyle = p.color;
              ctx.globalAlpha = p.alpha;
              ctx.shadowBlur = 6;
              ctx.shadowColor = p.color;
              ctx.fill();
              ctx.globalAlpha = 1; // reset alpha
            }
          });

          // Remove dead fireworks
          if (!alive) {
            fireworks.splice(i, 1);
          }
        }
      }

      ctx.shadowBlur = 0; // reset shadow
      animationFrameId = requestAnimationFrame(draw);
    };

    // Click canvas to spawn custom firework
    const handleCanvasClick = (e: MouseEvent) => {
      createFirework(e.clientX, height);
      explode(fireworks[fireworks.length - 1]);
      fireworks[fireworks.length - 1].y = e.clientY;
    };
    canvas.addEventListener("click", handleCanvasClick);

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (canvas) canvas.removeEventListener("click", handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section
      id="surprise"
      className="relative min-h-screen w-full flex flex-col justify-center items-center py-24 px-6 overflow-hidden bg-black"
    >
      {/* Canvas fireworks overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair z-0" />

      {/* Main wrapper */}
      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center select-none">
        
        {/* Floating Balloons Decorative */}
        <div className="absolute top-10 left-10 w-16 h-20 rounded-full bg-[#d4af37]/20 blur-[1px] animate-bounce pointer-events-none" style={{ animationDuration: '6s' }} />
        <div className="absolute top-20 right-10 w-12 h-16 rounded-full bg-[#ff2a5f]/20 blur-[1px] animate-bounce pointer-events-none" style={{ animationDuration: '5s', animationDelay: '1s' }} />

        {/* Celebration Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-4"
        >
          <span className="text-[#d4af37] text-xs uppercase tracking-widest font-semibold mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d4af37]" /> Make A Wish <Sparkles className="w-4 h-4 text-[#d4af37]" />
          </span>
          <h2 className="font-cinzel text-3xl sm:text-5xl md:text-7xl font-black text-white leading-tight">
            Happy Birthday, <br />
            <span className="text-shimmer drop-shadow-[0_10px_35px_rgba(212,175,55,0.25)]">
              My Amazing Sister ❤️
            </span>
          </h2>
          <p className="font-outfit text-white/70 text-base sm:text-xl font-light tracking-wide mt-4">
            May all your dreams come true.
          </p>
        </motion.div>

        {/* Birthday Cake Container */}
        <div className="my-16 relative flex flex-col items-center">
          
          {/* Candle Blow Instruction overlay */}
          <AnimatePresence>
            {!wished && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -top-12 z-20 bg-black/60 backdrop-blur-md border border-[#d4af37]/20 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-[#d4af37] animate-pulse"
              >
                Tap candles to blow them out! 🕯️
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Cake */}
          <div className="w-64 h-56 relative flex flex-col justify-end items-center mt-6">
                 {/* Candles Placement */}
            <div className="absolute bottom-36 flex justify-center gap-8 w-full z-40">
              {candles.map((candle) => (
                <div
                  key={candle.id}
                  onClick={() => blowCandle(candle.id)}
                  className="relative cursor-pointer flex flex-col items-center"
                >
                  {/* Smoke particle animation */}
                  <AnimatePresence>
                    {candle.smoke && (
                      <motion.div
                        initial={{ opacity: 0.8, y: -10, scale: 0.5, filter: "blur(1px)" }}
                        animate={{ opacity: 0, y: -40, scale: 2, filter: "blur(3px)" }}
                        className="absolute -top-10 w-2 h-8 bg-white/40 rounded-full"
                        transition={{ duration: 1.0 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Flame */}
                  <AnimatePresence>
                    {candle.lit && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{
                          scale: [1, 1.15, 1],
                          y: [0, -2, 0],
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="w-3.5 h-6 bg-gradient-to-t from-orange-600 via-yellow-400 to-yellow-100 rounded-full absolute -top-5 blur-[1px] shadow-[0_0_15px_#f97316]"
                      />
                    )}
                  </AnimatePresence>

                  {/* Candle Stick */}
                  <div className="w-2.5 h-10 bg-gradient-to-b from-[#d4af37] via-[#ff2a5f] to-[#d4af37] rounded-t-sm shadow-md" />
                </div>
              ))}
            </div>

            {/* Cake Tiers (CSS-styled stacking cylinders) */}
            
            {/* Top Tier (Smallest) */}
            <div className="w-36 h-12 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full border border-pink-300/20 shadow-md relative z-30">
              {/* Dripping frosting effect */}
              <div className="absolute bottom-0 left-0 w-full h-3 bg-pink-600 rounded-b-xl opacity-80" />
            </div>

            {/* Middle Tier */}
            <div className="w-48 h-16 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full border border-amber-500/20 -mt-6 shadow-lg relative z-20">
              <div className="absolute bottom-0 left-0 w-full h-4 bg-amber-800 rounded-b-xl opacity-80" />
              {/* Golden sprinkles decorations */}
              <div className="absolute top-2 left-6 w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
              <div className="absolute top-3 right-10 w-1.5 h-1.5 bg-white rounded-full" />
              <div className="absolute top-4 left-1/2 w-1.5 h-1.5 bg-[#ff2a5f] rounded-full" />
            </div>

            {/* Bottom Tier (Largest) */}
            <div className="w-60 h-20 bg-gradient-to-r from-[#ff2a5f] to-[#ff2a5f] rounded-full border border-pink-500/20 -mt-8 shadow-2xl relative z-10">
              <div className="absolute bottom-0 left-0 w-full h-5 bg-rose-900 rounded-b-xl opacity-85" />
              {/* Golden sprinkles */}
              <div className="absolute top-4 left-12 w-2 h-2 bg-[#d4af37] rounded-full" />
              <div className="absolute top-6 right-16 w-1.5 h-1.5 bg-white rounded-full" />
              <div className="absolute top-3 right-8 w-2 h-2 bg-[#d4af37] rounded-full" />
              <div className="absolute top-5 left-1/3 w-1.5 h-1.5 bg-[#ff2a5f] rounded-full" />
            </div>

            {/* Golden Plate */}
            <div className="w-64 h-5 bg-gradient-to-r from-[#d4af37] via-yellow-200 to-[#d4af37] rounded-full -mt-4 shadow-xl border-t border-yellow-100/30" />
          </div>

        </div>

        {/* Wishes Reveal message */}
        <AnimatePresence>
          {wished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-12 bg-white/5 border border-[#d4af37]/30 backdrop-blur-xl px-8 py-5 rounded-3xl max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#d4af37]/10 rounded-full blur-xl animate-pulse" />
              <Heart fill="#ff2a5f" className="w-6 h-6 text-[#ff2a5f] mx-auto mb-3 animate-ping" />
              <h4 className="text-[#d4af37] font-cinzel text-lg font-bold tracking-widest uppercase mb-1">
                A Sweet Wish For You
              </h4>
              <p className="text-white/80 font-light text-xs sm:text-sm leading-relaxed">
                May your eyes always shine with happiness, your heart remain filled with peace, and every single prayer you make today be answered. ✨
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Celebrate Again Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCelebrateAgain}
          className="relative group px-8 py-4 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5 hover:bg-[#d4af37]/10 transition-all duration-300 flex items-center gap-3 cursor-pointer shadow-lg"
        >
          <RotateCcw className="w-4 h-4 text-[#d4af37]" />
          <span className="text-xs uppercase tracking-widest font-semibold text-white">
            Celebrate Again
          </span>
        </motion.button>
      </div>
    </section>
  );
}
