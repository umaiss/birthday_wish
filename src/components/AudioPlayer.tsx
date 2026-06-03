"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  // Play ambient chimes using Web Audio API
  const playNote = (
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    type: "sine" | "triangle" = "sine"
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);

    // Apply soft attack and decay
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.06, startTime + 0.05); // low volume
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const playChord = (
    ctx: AudioContext,
    notes: number[],
    startTime: number,
    duration: number
  ) => {
    notes.forEach((freq) => {
      // Play chord pad with soft triangles
      playNote(ctx, freq, startTime, duration, "triangle");
    });
  };

  useEffect(() => {
    isPlayingRef.current = isPlaying;

    if (!isPlaying) {
      if (schedulerRef.current) {
        clearInterval(schedulerRef.current);
        schedulerRef.current = null;
      }
      return;
    }

    // Initialize audio context
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Frequencies
    // Chords: Cmaj7, Am7, Fmaj7, G7
    // Melody: Happy Birthday (transposed to C major, slow)
    const chords = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
      [110.00, 146.83, 164.81, 220.00], // Am7 (A2, D3, E3, A3)
      [87.31, 130.81, 174.61, 218.27],  // Fmaj7 (F2, C3, F3, A3)
      [98.00, 146.83, 196.00, 246.94],  // G7 (G2, D3, G3, B3)
    ];

    const melody = [
      // Happy birthday melody notes & relative timing (in beats)
      { note: 261.63, beat: 0, dur: 0.5 }, // C4
      { note: 261.63, beat: 0.5, dur: 0.5 }, // C4
      { note: 293.66, beat: 1, dur: 1.0 }, // D4
      { note: 261.63, beat: 2, dur: 1.0 }, // C4
      { note: 349.23, beat: 3, dur: 1.0 }, // F4
      { note: 329.63, beat: 4, dur: 2.0 }, // E4

      { note: 261.63, beat: 6, dur: 0.5 }, // C4
      { note: 261.63, beat: 6.5, dur: 0.5 }, // C4
      { note: 293.66, beat: 7, dur: 1.0 }, // D4
      { note: 261.63, beat: 8, dur: 1.0 }, // C4
      { note: 392.00, beat: 9, dur: 1.0 }, // G4
      { note: 349.23, beat: 10, dur: 2.0 }, // F4

      { note: 261.63, beat: 12, dur: 0.5 }, // C4
      { note: 261.63, beat: 12.5, dur: 0.5 }, // C4
      { note: 523.25, beat: 13, dur: 1.0 }, // C5
      { note: 440.00, beat: 14, dur: 1.0 }, // A4
      { note: 349.23, beat: 15, dur: 1.0 }, // F4
      { note: 329.63, beat: 16, dur: 1.0 }, // E4
      { note: 293.66, beat: 17, dur: 2.0 }, // D4

      { note: 466.16, beat: 19, dur: 0.5 }, // Bb4
      { note: 466.16, beat: 19.5, dur: 0.5 }, // Bb4
      { note: 440.00, beat: 20, dur: 1.0 }, // A4
      { note: 349.23, beat: 21, dur: 1.0 }, // F4
      { note: 392.00, beat: 22, dur: 1.0 }, // G4
      { note: 349.23, beat: 23, dur: 3.0 }, // F4
    ];

    const tempo = 90; // bpm
    const beatDuration = 60 / tempo; // duration of a beat in seconds
    const totalMelodyBeats = 26;
    const cycleDuration = totalMelodyBeats * beatDuration;

    const playSequence = () => {
      if (!isPlayingRef.current) return;
      const now = ctx.currentTime;

      // Play soft ambient chords in background
      for (let i = 0; i < 4; i++) {
        const chordStart = now + i * 6 * beatDuration;
        const chordDur = 5.5 * beatDuration;
        playChord(ctx, chords[i % chords.length], chordStart, chordDur);
      }

      // Play chime melody
      melody.forEach((m) => {
        const noteStart = now + m.beat * beatDuration;
        const noteDur = m.dur * beatDuration;
        playNote(ctx, m.note, noteStart, noteDur, "sine");
      });
    };

    // Play immediately
    playSequence();

    // Loop
    schedulerRef.current = setInterval(playSequence, cycleDuration * 1000) as any;

    return () => {
      if (schedulerRef.current) {
        clearInterval(schedulerRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <button
      onClick={() => setIsPlaying(!isPlaying)}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center p-3 rounded-full border border-white/10 glass-panel shadow-lg hover:scale-110 active:scale-95 transition-all group duration-300"
      aria-label="Toggle ambient music"
      id="ambient-music-btn"
    >
      {isPlaying ? (
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-[#d4af37] animate-pulse" />
          <span className="text-xs text-[#d4af37]/80 font-medium max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap">
            Sound On
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <VolumeX className="w-5 h-5 text-white/60" />
          <span className="text-xs text-white/40 font-medium max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap">
            Sound Off
          </span>
        </div>
      )}
    </button>
  );
}
