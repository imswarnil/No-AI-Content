"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconX, IconVolume, IconVolumeMute } from "./components/icons";
import { SceneWritten, SceneFlood, SceneBalance, SceneSeal, SceneRoll } from "./components/scenes";

type Scene = {
  key: string;
  Art: () => JSX.Element;
  kicker: string;
  /** Split into lines so each one can rise on its own beat. */
  lines: string[];
  body: string;
  narration: string;
};

const SCENES: Scene[] = [
  {
    key: "written",
    Art: SceneWritten,
    kicker: "01 — The old web",
    lines: ["Someone had", "something to say."],
    body: "A point of view. Lived detail. The odd rough edge that proves a person was there.",
    narration:
      "The web used to be full of people with something to say. A point of view, lived detail, and the odd rough edge that proved a person was there.",
  },
  {
    key: "flood",
    Art: SceneFlood,
    kicker: "02 — Then the flood",
    lines: ["Then everything", "started to rhyme."],
    body: "Pages spun up by the thousand. Fluent, confident, and saying nothing at all.",
    narration:
      "Then everything started to rhyme. Pages spun up by the thousand — fluent, confident, and saying nothing at all.",
  },
  {
    key: "balance",
    Art: SceneBalance,
    kicker: "03 — The honest line",
    lines: ["The line isn't", "AI or no AI."],
    body: "Use it to sharpen a sentence or argue with an idea. Just don't let it do the thinking.",
    narration:
      "The line isn't A-I or no A-I. Use it to sharpen a sentence, or to argue with an idea. Just don't hand over the thinking.",
  },
  {
    key: "seal",
    Art: SceneSeal,
    kicker: "04 — The stamp",
    lines: ["So: press", "a seal on it."],
    body: "A notary-style mark you put on your own work. Not a verdict — a signature.",
    narration:
      "So we made a seal. A notary-style mark you press onto your own work. It isn't a verdict handed down by a detector — it's your signature.",
  },
  {
    key: "roll",
    Art: SceneRoll,
    kicker: "05 — The roll",
    lines: ["One line of code.", "You're on the roll."],
    body: "Your site joins a public list of human writers — and stays there only while the seal does.",
    narration:
      "One line of code, and you're on the roll: a public list of people who still write their own words. Every listing is re-checked, so the roll stays honest.",
  },
];

/** Fallback pacing when narration is muted or unavailable. */
const SCENE_MS = 5600;

export default function StoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [muted, setMuted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const speak = useCallback(
    (text: string, onEnd: () => void) => {
      const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
      if (!synth || muted) {
        timerRef.current = setTimeout(onEnd, SCENE_MS);
        return;
      }
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      // Soothing narrator: unhurried rate, warm pitch, gentlest voice available.
      const voices = synth.getVoices();
      const prefs = ["Samantha", "Aria", "Google UK English Female", "Google US English", "Karen", "Moira", "Serena", "Daniel"];
      const voice =
        prefs.map((p) => voices.find((v) => v.name.includes(p))).find(Boolean) ||
        voices.find((v) => /^en/i.test(v.lang));
      if (voice) u.voice = voice;
      u.rate = 0.92;
      u.pitch = 1.02;
      u.onend = onEnd;
      // Fallback in case onend never fires (some browsers)
      timerRef.current = setTimeout(onEnd, Math.max(SCENE_MS, text.length * 65));
      synth.speak(u);
    },
    [muted],
  );

  const stopAudio = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  // Drive the slideshow whenever the active scene changes.
  useEffect(() => {
    if (!open) return;
    stopAudio();
    const advance = () => setI((cur) => (cur < SCENES.length - 1 ? cur + 1 : cur));
    speak(SCENES[i].narration, advance);
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
      if (e.key === "ArrowRight") setI((c) => Math.min(SCENES.length - 1, c + 1));
      if (e.key === "ArrowLeft") setI((c) => Math.max(0, c - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock the page behind the overlay while it's up.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;
  const s = SCENES[i];
  const last = i === SCENES.length - 1;

  return (
    <div className="story-back" onClick={onClose} role="dialog" aria-modal="true" aria-label="What is NAC?">
      <div className="story" onClick={(e) => e.stopPropagation()}>
        {/* 16:9 canvas — art on the left half, type on the right. */}
        <div className="story-canvas">
          {/* `key` remounts the scene so every animation replays from frame 0. */}
          <div className="story-scene" key={s.key}>
            <div className="scene-art">
              <s.Art />
            </div>
            <div className="scene-type">
              <span className="scene-kicker">{s.kicker}</span>
              <h2 className="scene-title">
                {s.lines.map((line, n) => (
                  <span className="line" key={n}>
                    <span className="line-in" style={{ animationDelay: `${140 + n * 110}ms` }}>
                      {line}
                    </span>
                  </span>
                ))}
              </h2>
              <p className="scene-body" style={{ animationDelay: `${180 + s.lines.length * 110}ms` }}>
                {s.body}
              </p>
            </div>
          </div>

          <button className="story-x" onClick={onClose} aria-label="Close">
            <IconX size={16} />
          </button>

          <div className="story-bar" aria-hidden>
            {SCENES.map((sc, k) => (
              <button
                key={sc.key}
                className={`seg ${k <= i ? "on" : ""}`}
                onClick={() => setI(k)}
                tabIndex={-1}
              />
            ))}
          </div>
        </div>

        <div className="story-controls">
          <button className="sc" onClick={() => setI((c) => Math.max(0, c - 1))} disabled={i === 0}>
            ‹ Back
          </button>
          <button className="sc mute" onClick={() => setMuted((m) => !m)}>
            {muted ? (
              <>
                <IconVolumeMute size={15} /> Muted
              </>
            ) : (
              <>
                <IconVolume size={15} /> Narrating
              </>
            )}
          </button>
          {last ? (
            <a className="sc primary" href="/#build" onClick={onClose}>
              Make my stamp →
            </a>
          ) : (
            <button className="sc primary" onClick={() => setI((c) => Math.min(SCENES.length - 1, c + 1))}>
              Next ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
