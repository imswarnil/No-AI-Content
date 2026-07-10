"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Slide = {
  emoji: string;
  title: string;
  body: string;
  narration: string;
  accent: string;
};

const SLIDES: Slide[] = [
  {
    emoji: "📖",
    title: "The old web",
    body: "Blogs where a person actually sat down and thought, then wrote.",
    narration:
      "Remember the old web? Blogs where a real person sat down, thought hard, and wrote in their own voice.",
    accent: "#16a34a",
  },
  {
    emoji: "🤖",
    title: "Then came the flood",
    body: "Endless posts generated end-to-end by machines. Fast, polished, and soulless.",
    narration:
      "Then came the flood. Endless articles generated end to end by machines. Fast, polished, and completely soulless.",
    accent: "#dc2626",
  },
  {
    emoji: "🌱",
    title: "We're not anti-AI",
    body: "Use AI to sharpen a sentence or pressure-test an idea. Just don't let it do the writing for you.",
    narration:
      "But we are not anti A-I. Use it to sharpen a sentence, or to pressure-test an idea. Just don't let it do the writing and the thinking for you.",
    accent: "#2563eb",
  },
  {
    emoji: "🖋️",
    title: "So we made a stamp",
    body: "A modern notary seal — hard to copy, honest to display — that says a human is still behind the words.",
    narration:
      "So we made a stamp. A modern notary seal, hard to copy, honest to display, that says a human is still behind the words.",
    accent: "#15803d",
  },
  {
    emoji: "🤝",
    title: "Add yours",
    body: "Paste one line of code, and join a public directory of humans who still write by hand.",
    narration:
      "Add yours. Paste one line of code, and join a growing directory of humans who still write by hand.",
    accent: "#7c3aed",
  },
];

export default function StoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [muted, setMuted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const speak = useCallback(
    (text: string, onEnd: () => void) => {
      const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
      if (!synth || muted) {
        timerRef.current = setTimeout(onEnd, 5200);
        return;
      }
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1;
      u.pitch = 1;
      u.onend = onEnd;
      // Fallback in case onend never fires (some browsers)
      timerRef.current = setTimeout(onEnd, Math.max(5000, text.length * 65));
      synth.speak(u);
    },
    [muted],
  );

  const stopAudio = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  // Drive the slideshow whenever the active slide changes.
  useEffect(() => {
    if (!open) return;
    stopAudio();
    const advance = () => setI((cur) => (cur < SLIDES.length - 1 ? cur + 1 : cur));
    speak(SLIDES[i].narration, advance);
    return stopAudio;
  }, [open, i, muted, speak, stopAudio]);

  // Reset + cleanup on open/close.
  useEffect(() => {
    if (open) setI(0);
    else stopAudio();
  }, [open, stopAudio]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((c) => Math.min(SLIDES.length - 1, c + 1));
      if (e.key === "ArrowLeft") setI((c) => Math.max(0, c - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;

  return (
    <div className="story-back" onClick={onClose}>
      <div className="story" onClick={(e) => e.stopPropagation()}>
        <div className="story-bar">
          {SLIDES.map((_, k) => (
            <span key={k} className={`seg ${k <= i ? "on" : ""}`} />
          ))}
        </div>

        <button className="story-x" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="story-stage" key={i}>
          <div className="story-emoji" style={{ background: `${s.accent}1a`, color: s.accent }}>
            {s.emoji}
          </div>
          <h2 style={{ color: s.accent }}>{s.title}</h2>
          <p>{s.body}</p>
        </div>

        <div className="story-controls">
          <button className="sc" onClick={() => setI((c) => Math.max(0, c - 1))} disabled={i === 0}>
            ‹ Back
          </button>
          <button className="sc mute" onClick={() => setMuted((m) => !m)}>
            {muted ? "🔇 Muted" : "🔊 Narrating"}
          </button>
          {last ? (
            <a className="sc primary" href="/#build" onClick={onClose}>
              Make my stamp →
            </a>
          ) : (
            <button className="sc primary" onClick={() => setI((c) => Math.min(SLIDES.length - 1, c + 1))}>
              Next ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
