"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Heart, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function Wishes() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  const message = 
    "To my wonderful sister Huda, today we celebrate the beautiful light you bring into all of our lives. " +
    "You have always been more than just a sister; you are my confidante, my supporter, and my dearest friend. " +
    "Through every laugh we've shared, every memory we've crafted, and every step we've taken, your kind heart and resilient spirit have inspired me. " +
    "I want you to know how deeply you are loved, how much you are appreciated, and how blessed I feel to walk this life with you. " +
    "May this year wrap you in joy, lead you to your biggest dreams, and fill your days with endless love. " +
    "Happy Birthday, my amazing sister. You deserve the world.";

  const words = message.split(" ");

  useGSAP(() => {
    if (!textRef.current || !containerRef.current) return;

    const wordSpans = textRef.current.querySelectorAll(".reveal-word");

    // Animate opacity and color of each word based on scroll
    gsap.fromTo(
      wordSpans,
      {
        opacity: 0.1,
        color: "rgba(255, 255, 255, 0.1)",
        y: 5,
      },
      {
        opacity: 1,
        color: (i, target) => {
          // Highlight specific words (like Huda, sister, love, Birthday, dreams) in gold or rose
          const text = target.textContent?.toLowerCase() || "";
          if (text.includes("huda") || text.includes("sister") || text.includes("loved") || text.includes("love")) {
            return "#ff2a5f";
          }
          if (text.includes("birthday") || text.includes("dreams") || text.includes("blessed") || text.includes("world")) {
            return "#d4af37";
          }
          return "#ffffff";
        },
        y: 0,
        stagger: 0.1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          end: "bottom 30%",
          scrub: 0.5,
        },
      }
    );
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      id="wishes"
      className="relative min-h-[140vh] w-full flex flex-col justify-center items-center py-32 px-6 bg-[#030303]"
    >
      {/* Decorative stars */}
      <div className="absolute top-1/4 left-1/10 text-white/5 animate-pulse">
        <Sparkles className="w-8 h-8" />
      </div>
      <div className="absolute bottom-1/4 right-1/10 text-[#d4af37]/5 animate-pulse" style={{ animationDelay: "1s" }}>
        <Heart className="w-12 h-12" />
      </div>

      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Intro Tag */}
        <div className="flex items-center gap-2 mb-10 px-4 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
          <Heart className="w-3.5 h-3.5 text-[#ff2a5f] animate-beat" />
          <span className="text-xs uppercase tracking-widest text-white/60 font-semibold">
            From The Heart
          </span>
        </div>

        {/* Big scroll text container */}
        <p
          ref={textRef}
          className="font-cinzel text-2xl sm:text-4xl md:text-5xl font-semibold tracking-wide leading-relaxed sm:leading-loose text-left md:text-center select-none"
        >
          {words.map((word, idx) => (
            <span
              key={idx}
              className="reveal-word inline-block mr-[0.25em] mb-2 transition-all duration-300 transform"
            >
              {word}
            </span>
          ))}
        </p>

        {/* Small detail */}
        <div className="mt-16 flex items-center gap-2 text-white/20 text-xs tracking-widest uppercase font-bold">
          <span>Scroll to continue</span>
          <div className="w-1 h-1 rounded-full bg-[#d4af37] animate-ping" />
        </div>
      </div>
    </div>
  );
}
