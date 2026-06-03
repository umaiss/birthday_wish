"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Calendar, Heart, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function Memories() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollSectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!scrollSectionRef.current || !containerRef.current) return;

    const scrollSection = scrollSectionRef.current;
    const cards = scrollSection.querySelectorAll(".memory-card");
    const totalWidth = scrollSection.scrollWidth - window.innerWidth;

    // Timeline horizontal scroll pinning animation
    const pin = gsap.to(scrollSection, {
      x: -totalWidth,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1,
        start: "top top",
        end: `+=${totalWidth}`,
        invalidateOnRefresh: true,
      },
    });

    // Animate cards individually on entrance
    cards.forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: card,
            containerAnimation: pin,
            start: "left 90%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => {
      pin.scrollTrigger?.kill();
    };
  }, { scope: containerRef });

  const timelineEvents = [
    {
      year: "The Beginning",
      title: "The Sparks of Childhood",
      text: "From our earliest days, you've filled my life with light, energy, and wonder. Every game, every spark of laughter, and every shared dream formed the foundation of the bond we share today.",
      img: "/images/sparkler.png",
      tag: "Childhood",
    },
    {
      year: "The Journey",
      title: "Shared Sunsets & Endless Dreams",
      text: "As we grew, our talks got deeper and our dreams grew bigger. Standing by each other's side through every sunset, sharing secrets that only we understood, and building an unbreakable friendship.",
      img: "/images/sister.png",
      tag: "Friendship",
    },
    {
      year: "The Triumphs",
      title: "Celebrating Every Milestone",
      text: "We clinked glasses for every achievement, big or small. You've been my biggest cheerleader, and seeing you succeed brings me more joy than anything else in this world.",
      img: "/images/toast.png",
      tag: "Celebration",
    },
    {
      year: "Forever Sister",
      title: "The Gift of You",
      text: "Having you as my sister is the greatest gift life has given me. You are my anchor, my confidante, and my best friend. Today, we celebrate the incredible person you are.",
      img: "/images/giftbox.png",
      tag: "Gratitude",
    },
  ];

  return (
    <div ref={containerRef} id="memories" className="relative bg-[#050505]">
      {/* Sticky full-screen wrapper */}
      <div className="h-screen w-full overflow-hidden flex flex-col justify-center relative">
        
        {/* Decorative background typography */}
        <div className="absolute top-20 left-12 font-cinzel text-white/5 text-7xl sm:text-9xl pointer-events-none font-bold uppercase tracking-widest select-none">
          Our Timeline
        </div>

        {/* Scroll helper */}
        <div className="absolute bottom-12 left-12 z-20 hidden md:flex items-center gap-3 text-xs uppercase tracking-widest text-[#d4af37]/60 font-semibold animate-pulse">
          <span>Scroll down to travel through time</span>
          <ArrowRight className="w-4 h-4 text-[#d4af37]" />
        </div>

        {/* Horizontal scroll section */}
        <div
          ref={scrollSectionRef}
          className="flex items-center gap-12 px-12 md:px-24 w-max h-[70vh] relative"
        >
          {/* Timeline Title Card */}
          <div className="w-[85vw] md:w-[35vw] flex-shrink-0 flex flex-col justify-center pr-12">
            <span className="text-[#d4af37] text-xs uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
              <span className="w-6 h-[1px] bg-[#d4af37]" /> Chronology of Love
            </span>
            <h2 className="font-cinzel text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white mb-6">
              Birthday <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#ff2a5f]">
                Memories
              </span>
            </h2>
            <p className="text-white/60 font-light text-base leading-relaxed">
              Every year spent with you is a treasure box of moments. Swipe or scroll down to wander through the beautiful chapters we've written together.
            </p>
          </div>

          {/* Timeline Nodes */}
          {timelineEvents.map((event, idx) => (
            <div
              key={idx}
              className="memory-card w-[85vw] md:w-[28vw] h-[55vh] flex-shrink-0 glass-panel rounded-3xl p-6 relative flex flex-col justify-between overflow-hidden shadow-2xl border border-white/10 hover:border-[#d4af37]/30 transition-colors duration-500 group"
            >
              {/* Image background wrapper */}
              <div className="relative w-full h-[45%] rounded-2xl overflow-hidden mb-4">
                <Image
                  src={event.img}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 filter saturate-[0.85] group-hover:saturate-100"
                  sizes="(max-width: 768px) 100vw, 30vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[#d4af37] text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border border-white/10">
                  {event.tag}
                </span>
              </div>

              {/* Card Content */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-cinzel text-[#d4af37] text-lg font-bold tracking-wider">
                      {event.year}
                    </span>
                    <Calendar className="w-4 h-4 text-white/40" />
                  </div>
                  <h3 className="text-white font-semibold text-lg sm:text-xl font-outfit mb-3 group-hover:text-[#d4af37] transition-colors duration-300">
                    {event.title}
                  </h3>
                  <p className="text-white/60 font-light text-xs sm:text-sm leading-relaxed line-clamp-4 md:line-clamp-5">
                    {event.text}
                  </p>
                </div>

                {/* Bottom detail */}
                <div className="flex items-center gap-1.5 mt-4 text-[10px] uppercase font-bold tracking-widest text-[#ff2a5f]/80">
                  <Heart fill="currentColor" className="w-3 h-3 text-[#ff2a5f]" />
                  <span>With Love</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
