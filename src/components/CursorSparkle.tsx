"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  type: "sparkle" | "heart" | "star";
  rotation: number;
}

export default function CursorSparkle() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Check if device supports hover (desktop)
    const mediaQuery = window.matchMedia("(hover: hover)");
    setIsMobile(!mediaQuery.matches);

    const handleMouseMove = (e: MouseEvent) => {
      if (!mediaQuery.matches) return;

      const colors = ["#d4af37", "#ff2a5f", "#ffffff", "#ff8da1", "#ffd700"];
      const types: ("sparkle" | "heart" | "star")[] = ["sparkle", "heart", "star"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomType = types[Math.floor(Math.random() * types.length)];

      const newParticle: Particle = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 12 + 6,
        color: randomColor,
        type: randomType,
        rotation: Math.random() * 360,
      };

      setParticles((prev) => [...prev.slice(-15), newParticle]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  if (isMobile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              opacity: 1,
              scale: 1,
              x: p.x,
              y: p.y,
              rotate: p.rotation,
            }}
            animate={{
              opacity: 0,
              scale: 0,
              x: p.x + (Math.random() - 0.5) * 50,
              y: p.y + (Math.random() - 0.5) * 50 + 20, // drift downwards
              rotate: p.rotation + 90,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: p.size,
              height: p.size,
              color: p.color,
            }}
          >
            {p.type === "heart" && (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}
            {p.type === "sparkle" && (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            )}
            {p.type === "star" && (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
              </svg>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
