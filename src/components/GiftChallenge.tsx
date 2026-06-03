"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, HelpCircle, RefreshCw, Volume2, Sparkles } from "lucide-react";

interface GiftItem {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

const GIFTS: GiftItem[] = [
  { id: "burger", name: "Meg Burger", emoji: "🍔", color: "from-amber-500 to-red-500" },
  { id: "dryer", name: "Hair Dryer", emoji: "💨", color: "from-blue-400 to-indigo-500" },
  { id: "lens", name: "Lens", emoji: "📷", color: "from-purple-500 to-pink-500" },
];

export default function GiftChallenge() {
  const [attempts, setAttempts] = useState<string[]>([]);
  const [shuffling, setShuffling] = useState(false);
  const [openedBoxIdx, setOpenedBoxIdx] = useState<number | null>(null);
  const [boxItems, setBoxItems] = useState<GiftItem[]>(GIFTS);
  const [gameState, setGameState] = useState<"idle" | "readyToPick" | "revealed" | "finished">("idle");
  const [wonItem, setWonItem] = useState<GiftItem | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play synthesized Web Audio sounds
  const playAudioEffect = (type: "shuffle" | "open" | "win" | "lose") => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

      if (type === "shuffle") {
        // Swoosh sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "open") {
        // Ding sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "win") {
        // Joyful arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.3);
        });
      } else if (type === "lose") {
        // Melancholic slide down
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(349.23, ctx.currentTime); // F4
        osc.frequency.linearRampToValueAtTime(220.00, ctx.currentTime + 0.5); // A3
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn("Audio Context blocked or failed:", e);
    }
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // Confetti burst from both sides
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const startShuffle = () => {
    if (gameState === "finished") return;
    setShuffling(true);
    setGameState("idle");
    setOpenedBoxIdx(null);
    playAudioEffect("shuffle");

    // Shuffle the items for 1.2s
    let shufflesCount = 0;
    const interval = setInterval(() => {
      setBoxItems((prev) => [...prev].sort(() => Math.random() - 0.5));
      shufflesCount++;
      if (shufflesCount >= 5) {
        clearInterval(interval);
        setShuffling(false);
        setGameState("readyToPick");
      }
    }, 150);
  };

  const openBox = (index: number) => {
    if (gameState !== "readyToPick" || shuffling) return;

    setOpenedBoxIdx(index);
    setGameState("revealed");
    playAudioEffect("open");

    const pickedItem = boxItems[index];
    const newAttempts = [...attempts, pickedItem.name];
    setAttempts(newAttempts);

    // Evaluate Game if it's the 3rd attempt
    if (newAttempts.length === 3) {
      setTimeout(() => {
        // Count frequencies of attempts
        const counts: Record<string, number> = {};
        newAttempts.forEach((item) => {
          counts[item] = (counts[item] || 0) + 1;
        });

        // Find if any item appears 2 or more times
        let win = false;
        let wonItemName = "";
        Object.entries(counts).forEach(([name, count]) => {
          if (count >= 2) {
            win = true;
            wonItemName = name;
          }
        });

        if (win) {
          const matchItem = GIFTS.find((g) => g.name === wonItemName) || null;
          setWonItem(matchItem);
          playAudioEffect("win");
          triggerConfetti();
        } else {
          setWonItem(null);
          playAudioEffect("lose");
        }
        setGameState("finished");
      }, 1500);
    }
  };

  const resetGame = () => {
    setAttempts([]);
    setOpenedBoxIdx(null);
    setWonItem(null);
    setGameState("idle");
    setBoxItems(GIFTS);
  };

  return (
    <section
      id="challenge"
      className="relative min-h-screen w-full flex flex-col justify-center items-center py-24 px-6 overflow-hidden bg-gradient-to-b from-[#050505] via-black to-[#050505]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,42,95,0.04),transparent_50%)]" />

      {/* Decorative layout title */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <span className="text-[#d4af37] text-xs uppercase tracking-widest font-semibold mb-3 flex items-center justify-center gap-2">
          <span className="w-6 h-[1px] bg-[#d4af37]" /> Interactive Gift Game <span className="w-6 h-[1px] bg-[#d4af37]" />
        </span>
        <h2 className="font-cinzel text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
          The Gift{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff2a5f] to-[#d4af37]">
            Challenge
          </span>
        </h2>
        <p className="text-white/60 font-light text-sm sm:text-base max-w-xl mx-auto">
          Test your luck! Pick a gift box. If you match the same gift twice in three attempts, it's yours!
        </p>
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Game Dashboard */}
        <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 mb-12 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl border border-white/10">
          {/* Attempt Tracker */}
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <span className="text-xs uppercase tracking-widest text-white/40 font-bold">
              Your Attempts: {attempts.length} / 3
            </span>
            <div className="flex items-center gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-12 w-24 rounded-xl flex items-center justify-center border text-xs font-semibold tracking-wider transition-all duration-500 ${attempts[i]
                      ? "border-[#d4af37]/30 bg-[#d4af37]/10 text-white"
                      : "border-white/5 bg-white/5 text-white/30"
                    }`}
                >
                  {attempts[i] ? attempts[i] : `Attempt ${i + 1}`}
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 rounded-xl border border-white/5 bg-white/5 text-white/60 hover:text-[#d4af37] transition-all"
              title="Toggle game sound effects"
            >
              <Volume2 className={`w-4 h-4 ${soundEnabled ? "opacity-100" : "opacity-40"}`} />
            </button>

            {gameState !== "idle" && gameState !== "finished" && (
              <button
                onClick={resetGame}
                className="px-4 py-3 rounded-xl border border-white/10 hover:border-[#ff2a5f]/40 hover:bg-[#ff2a5f]/5 text-white/70 hover:text-white font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
              >
                Reset
              </button>
            )}

            {gameState !== "finished" && (
              <button
                disabled={shuffling || gameState === "readyToPick" || gameState === "revealed"}
                onClick={startShuffle}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ff2a5f] hover:from-[#ff2a5f] hover:to-[#d4af37] text-black font-semibold text-xs tracking-widest uppercase transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${shuffling ? "animate-spin" : ""}`} />
                {attempts.length === 0 ? "Shuffle & Play" : "Next Shuffle"}
              </button>
            )}

            {gameState === "finished" && (
              <button
                onClick={resetGame}
                className="px-6 py-3 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Play Again
              </button>
            )}
          </div>
        </div>

        {/* Gift Boxes Container */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 w-full max-w-3xl justify-center items-center px-4">
          {boxItems.map((gift, idx) => {
            const isOpened = openedBoxIdx === idx;
            const isSelectable = gameState === "readyToPick" && !shuffling;

            return (
              <div key={gift.id} className="flex flex-col items-center">
                <motion.div
                  layout
                  onClick={() => openBox(idx)}
                  className={`relative w-44 h-48 flex items-center justify-center cursor-pointer select-none perspective-1000 group ${isSelectable ? "hover:scale-105" : ""
                    }`}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                >
                  <AnimatePresence>
                    {/* Shadow underneath */}
                    <div className="absolute bottom-2 w-28 h-4 bg-black/40 rounded-full blur-md group-hover:scale-110 transition-transform duration-300" />

                    {/* Box Body */}
                    <div
                      className={`relative w-32 h-32 rounded-2xl flex flex-col justify-end items-center pb-4 transition-all duration-500 shadow-xl border ${isOpened
                          ? "bg-gradient-to-br from-[#d4af37]/10 to-[#ff2a5f]/10 border-[#d4af37]/40"
                          : "bg-gradient-to-br from-zinc-800/80 to-zinc-950/80 border-white/10 group-hover:border-white/20"
                        }`}
                    >
                      {/* Ribbon decorations */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full bg-[#ff2a5f] opacity-80" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-4 bg-[#ff2a5f] opacity-80" />

                      {/* Box Lid */}
                      <motion.div
                        className="absolute -top-1 w-[8.5rem] h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center z-20 shadow-md origin-bottom"
                        animate={
                          isOpened
                            ? { y: -45, rotateX: -65, opacity: 0.8, scale: 0.95 }
                            : { y: 0, rotateX: 0, opacity: 1 }
                        }
                        transition={{ type: "spring", stiffness: 120, damping: 12 }}
                      >
                        {/* Lid Ribbon Knot */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-4 bg-[#ff2a5f] rounded-sm flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
                        </div>
                      </motion.div>

                      {/* Revealed Item Icon */}
                      <AnimatePresence>
                        {isOpened && (
                          <motion.div
                            initial={{ scale: 0, y: 10, opacity: 0 }}
                            animate={{ scale: 1.5, y: -40, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 150, damping: 10 }}
                            className="absolute z-10 flex flex-col items-center"
                          >
                            <span className="text-5xl filter drop-shadow-[0_4px_12px_rgba(212,175,55,0.4)] animate-bounce">
                              {gift.emoji}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Box front query / status indicator */}
                      {!isOpened && (
                        <div className="relative z-10 flex flex-col items-center justify-center h-full pt-6">
                          <HelpCircle className="w-6 h-6 text-white/30 group-hover:text-white/60 group-hover:scale-110 transition-all duration-300" />
                          <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 group-hover:text-white/60 mt-2">
                            {shuffling ? "..." : isSelectable ? "Tap to open" : "?"}
                          </span>
                        </div>
                      )}
                    </div>
                  </AnimatePresence>
                </motion.div>

                {/* Sub name of revealed item */}
                <AnimatePresence>
                  {isOpened && (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-semibold tracking-wider text-[#d4af37] mt-3"
                    >
                      {gift.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Global Game Status Overlay */}
        <AnimatePresence>
          {gameState === "finished" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-16 w-full max-w-lg glass-panel rounded-3xl p-8 border border-white/10 text-center shadow-2xl relative overflow-hidden"
            >
              {wonItem ? (
                <>
                  <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#d4af37]/10 rounded-full blur-xl" />
                  <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-[#ff2a5f]/10 rounded-full blur-xl" />

                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 relative">
                      <Trophy className="w-10 h-10 text-[#d4af37] animate-pulse" />
                      <Sparkles className="w-5 h-5 text-[#ff2a5f] absolute top-1 right-1 animate-ping" />
                    </div>
                  </div>

                  <h3 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
                    Congratulations!
                  </h3>
                  <p className="text-white/80 font-light text-sm sm:text-base mb-6">
                    You won a <span className="font-bold text-[#d4af37] underline decoration-[#ff2a5f] decoration-2 underline-offset-4">{wonItem.name} {wonItem.emoji}</span>!
                  </p>
                  <p className="text-xs text-white/40 italic">
                    (Attempt list: {attempts.join(" → ")})
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-cinzel text-xl sm:text-2xl font-extrabold text-white/80 mb-3 leading-tight">
                    Oops! No matching gift this time 😄
                  </h3>
                  <p className="text-white/50 font-light text-sm mb-6">
                    All 3 attempts revealed different items: <span className="font-medium text-white">{attempts.join(", ")}</span>.
                  </p>
                  <button
                    onClick={resetGame}
                    className="px-6 py-2.5 rounded-full border border-white/10 hover:border-white/30 text-white text-xs font-semibold tracking-widest uppercase transition-all duration-300"
                  >
                    Try Again
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
