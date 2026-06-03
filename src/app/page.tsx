"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import Hero from "@/components/Hero";
import GiftChallenge from "@/components/GiftChallenge";
import Wishes from "@/components/Wishes";
import FinalSurprise from "@/components/FinalSurprise";
import AudioPlayer from "@/components/AudioPlayer";

// Dynamically import ThreeBackground and CursorSparkle to bypass SSR (Canvas & Window API dependencies)
const ThreeBackground = dynamic(() => import("@/components/ThreeBackground"), {
  ssr: false,
});

const CursorSparkle = dynamic(() => import("@/components/CursorSparkle"), {
  ssr: false,
});

export default function Home() {
  return (
    <SmoothScroll>
      {/* Interactive 3D Stars/Golden Dust Background */}
      <ThreeBackground />

      {/* Sparks/Hearts trailing mouse cursor (Desktop only) */}
      <CursorSparkle />

      {/* Floating Translucent Translucent Apple Navbar */}
      <Navbar />

      {/* Audio Ambient Synthesizer Controls */}
      <AudioPlayer />

      <main className="relative flex-1 w-full flex flex-col">
        {/* Hero Landing Stage */}
        <Hero />

        {/* Interactive 3-attempt Gift Challenge Game */}
        <GiftChallenge />

        {/* Scroll opacity Word-by-word Reveal Wishes */}
        <Wishes />

        {/* Celebration Finale, Canvas Fireworks & Blowable Birthday Cake */}
        <FinalSurprise />
      </main>
    </SmoothScroll>
  );
}
