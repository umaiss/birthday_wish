"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }

      // Track active section
      const sections = ["hero", "memories", "challenge", "wishes", "surprise"];
      const currentScroll = window.scrollY + window.innerHeight / 3;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (currentScroll >= top && currentScroll < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(`#${id}`, { offset: 0, duration: 1.5 });
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const navItems = [
    { label: "Home", id: "hero" },
    { label: "Memories", id: "memories" },
    { label: "Challenge", id: "challenge" },
    { label: "Wishes", id: "wishes" },
    { label: "Surprise", id: "surprise" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-black/20 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => scrollToSection("hero")}
          className="flex items-center gap-2 group text-white hover:text-[#d4af37] transition-all duration-300"
        >
          <Sparkles className="w-5 h-5 text-[#d4af37] group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-cinzel tracking-wider text-sm font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent group-hover:from-[#d4af37] group-hover:to-[#ff2a5f]">
            Huda's Day ❤️
          </span>
        </button>

        {/* Links */}
        <div className="flex items-center gap-6 md:gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`text-xs uppercase tracking-widest font-semibold transition-all duration-300 hover:text-white ${
                activeSection === item.id ? "text-[#d4af37]" : "text-white/60"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-[#d4af37] via-[#ff2a5f] to-[#d4af37] shadow-[0_0_10px_#d4af37]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </nav>
  );
}
