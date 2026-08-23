"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * The "What is this?" explainer: a whiteboard-scribe animation.
 *
 * Not a slideshow. Everything lives on ONE board and is drawn onto it by a
 * moving pen; the camera pans and zooms across that board as the story goes,
 * and nothing is ever cleared — at the end it pulls back and you see the whole
 * argument at once. That accumulation is the point, and it's what separates a
 * scribe animation from six slides.
 *
 * Two mechanics do all the work:
 *   - Strokes are drawn by animating `stroke-dashoffset` from their measured
 *     length down to 0, so a line appears to be laid down rather than faded in.
 *   - Text is "written" by a white rectangle sitting on top of it that retreats
 *     left to right. The board is white, so the cover is invisible; this avoids
 *     clip-path entirely, which would otherwise have to reconcile its user
 *     space with the translated group each chapter sits in.
 *
 * One rAF loop drives a single clock and derives every element's state from it.
 * That is what makes scrubbing, pausing and "skip to end" trivial: they are all
 * just a different value of `t`.
 */

const BOARD_W = 2000;
/** Three rows: six chapters, then the closing seal centred beneath them. */
const BOARD_H = 2060;
const CELL_W = 560;
const CELL_H = 560;

/* The camera frames to a fixed 10:7 window rather than to the board's own
   aspect — the board grew a third row for the ending, and tying the framing to
   its proportions would have zoomed every chapter out to compensate. */
const VIEW_ASPECT = 10 / 7;

/** Where a cell sits on the board (3 across). */
function cell(i: number) {
  return { x: 60 + (i % 3) * 640, y: 60 + Math.floor(i / 3) * 660 };
}

type Stroke = { d: string; accent?: "green" | "red"; width?: number };
type Chapter = {
  id: string;
  strokes: Stroke[];
  /** Big handwritten lines, drawn one after another. */
  lines: string[];
  /** Optional smaller aside under them. */
  note?: string;
  /** Spoken aloud when the chapter's text starts being written. */
  narration: string;
  /** Which grid cell to occupy. Defaults to the chapter's position. */
  at?: number;
};

/* Art is written in a local 0–560 box; each chapter is translated into its
   cell, so the numbers below stay readable. */
const CHAPTERS: Chapter[] = [
  {
    id: "old-web",
    lines: ["Someone had", "something to say."],
    narration:
      "The web used to be full of people with something to say. A point of view, lived detail, and the odd rough edge that proved a person was there.",
    strokes: [
      { d: "M150 40h210l60 60v250H150z" },
      { d: "M360 40v60h60" },
      { d: "M190 160h170" },
      { d: "M190 200h170" },
      { d: "M190 240h120" },
      { d: "M190 280h150" },
      { d: "M300 320l44-44 22 22-44 44-28 6z", accent: "green" },
    ],
  },
  {
    id: "flood",
    lines: ["Then everything", "started to rhyme."],
    note: "Fluent, confident, saying nothing at all.",
    narration:
      "Then everything started to rhyme. Pages spun up by the thousand — fluent, confident, and saying nothing at all.",
    strokes: [
      { d: "M90 60h110v150H90z" },
      { d: "M110 95h70M110 125h70M110 155h50" },
      { d: "M225 60h110v150H225z" },
      { d: "M245 95h70M245 125h70M245 155h50" },
      { d: "M360 60h110v150H360z" },
      { d: "M380 95h70M380 125h70M380 155h50" },
      { d: "M90 230h110v150H90z" },
      { d: "M110 265h70M110 295h70M110 325h50" },
      { d: "M225 230h110v150H225z" },
      { d: "M245 265h70M245 295h70M245 325h50" },
      { d: "M360 230h110v150H360z" },
      { d: "M380 265h70M380 295h70M380 325h50" },
    ],
  },
  {
    id: "why",
    lines: ["I like AI. I just don't", "like AI-generated content."],
    note: "I can't fully explain why. So I built this instead of complaining.",
    narration:
      "Here's the honest part. I like A-I. I use it every day and I'm glad it exists. I just don't like A-I generated content. Reading a page no person actually wrote puts me off, and I can't fully explain why. So I built this instead of complaining.",
    strokes: [
      // the tool: chip → pen → tick
      { d: "M70 70h90v70H70z" },
      { d: "M60 88h10M60 105h10M60 122h10" },
      { d: "M160 88h10M160 105h10M160 122h10" },
      { d: "M190 105h70" },
      { d: "M244 92l14 13-14 13" },
      { d: "M290 135l36-36 18 18-36 36-22 4z" },
      { d: "M320 122l14 14" },
      { d: "M400 105l16 16 30-34", accent: "green", width: 7 },
      // the content: chip → finished page → cross
      { d: "M70 250h90v70H70z" },
      { d: "M60 268h10M60 285h10M60 302h10" },
      { d: "M160 268h10M160 285h10M160 302h10" },
      { d: "M190 285h70" },
      { d: "M244 272l14 13-14 13" },
      { d: "M290 235h70l20 20v120h-90z" },
      { d: "M360 235v20h20" },
      { d: "M310 290h50M310 312h50M310 334h50" },
      { d: "M405 265l38 38M443 265l-38 38", accent: "red", width: 7 },
    ],
  },
  {
    id: "line",
    lines: ["The line isn't", "AI or no AI."],
    note: "Use it to sharpen. Just don't hand over the thinking.",
    narration:
      "So the line isn't A-I or no A-I. Use it to sharpen a sentence, or to argue with an idea. Just don't hand over the thinking.",
    strokes: [
      { d: "M280 60v260" },
      { d: "M140 130h280" },
      { d: "M140 130l-50 90h100z" },
      { d: "M420 130l-50 90h100z", accent: "green" },
      { d: "M200 320h160" },
      { d: "M240 320v-40h80v40" },
    ],
  },
  {
    id: "seal",
    lines: ["So: press", "a seal on it."],
    narration:
      "So we made a seal. A notary-style mark you press onto your own work. Not a verdict handed down by a detector — a signature.",
    strokes: [
      { d: "M280 60a130 130 0 1 1-.1 0z", accent: "green", width: 6 },
      { d: "M280 100a90 90 0 1 1-.1 0z" },
      { d: "M280 140c26 0 42 32 42 66l-42 54-42-54c0-34 16-66 42-66z", accent: "green" },
      { d: "M280 200v70", accent: "green" },
      { d: "M120 350h320" },
    ],
  },
  {
    id: "roll",
    lines: ["One line of code.", "You're on the roll."],
    note: "A public list of people who still write their own words.",
    narration:
      "One line of code, and you're on the roll: a public list of people who still write their own words. Every listing is re-checked, so the roll stays honest.",
    strokes: [
      { d: "M100 70h360v60H100z" },
      { d: "M120 100h180" },
      { d: "M330 88l16 16 26-30", accent: "green", width: 6 },
      { d: "M100 160h360v60H100z" },
      { d: "M120 190h150" },
      { d: "M330 178l16 16 26-30", accent: "green", width: 6 },
      { d: "M100 250h360v60H100z" },
      { d: "M120 280h200" },
      { d: "M330 268l16 16 26-30", accent: "green", width: 6 },
      { d: "M100 340h360v60H100z" },
      { d: "M120 370h120" },
    ],
  },
  /* The close. The story used to end on a silent hold over the finished board,
     which read as "the animation stopped" rather than as an ending. Now the
     camera comes down to the mark itself and stamps it, so the last thing on
     screen is the thing you're being asked to look for. `at: 7` centres it in
     the third row, under the six chapters. */
  {
    id: "close",
    at: 7,
    lines: ["NO AI CONTENT"],
    note: "Look for the seal — then go and read the people behind it.",
    narration:
      "This is the seal. No A-I content. If a human wrote it, they can say so — look for the mark, and go find the people behind it.",
    strokes: [
      { d: "M280 40a160 160 0 1 1-.1 0z", accent: "green", width: 7 },
      { d: "M280 78a122 122 0 1 1-.1 0z", width: 4 },
      { d: "M280 128c30 0 48 36 48 78l-48 62-48-62c0-42 18-78 48-78z", accent: "green", width: 6 },
      { d: "M280 200v80", accent: "green", width: 6 },
      { d: "M120 380h320" },
    ],
  },
];

const INK = "#15171a";
const GREEN = "#157a45";
const RED = "#c0392b";

/* Timing. Tuned so the whole board takes roughly 40s, which is about as long
   as anyone will watch — Skip and the scrubber are there for everyone else. */
const CAMERA_MS = 750;
const HOLD_MS = 620;
const END_ZOOM_MS = 1400;
const END_HOLD_MS = 2200;
const strokeMs = (len: number) => Math.min(620, Math.max(150, len * 1.15));
const textMs = (chars: number) => Math.max(520, chars * 34);

type Box = { x: number; y: number; w: number; h: number };
type Act =
  | { kind: "camera"; t0: number; t1: number; from: Box; to: Box }
  | { kind: "stroke"; t0: number; t1: number; i: number; len: number; ox: number; oy: number }
  | { kind: "text"; t0: number; t1: number; i: number; x: number; y: number; w: number };

/* ---------------- Narration ----------------
   Web Speech, which every current browser ships and which costs nothing to
   run. Wrapped so the rest of the component never has to care whether the API
   exists — on a browser without it these are no-ops and the animation plays
   silently. */
function say(text: string) {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1;
  u.pitch = 1;
  u.lang = "en-GB";
  synth.speak(u);
}
function hush() {
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

function lerp(a: number, b: number, p: number) {
  return a + (b - a) * p;
}
/** Ease-in-out — camera moves shouldn't start or stop abruptly. */
function ease(p: number) {
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
}
/** Fit a box into the 2000×1400 aspect, with padding, as a viewBox.

   The padding is deliberately generous. Framed tightly to its cell, each
   chapter fills the screen alone and the whole thing reads as a slideshow with
   a pan between slides — the exact opposite of the point. At this padding the
   neighbouring cells stay visible at the edges, so you can always see the work
   already on the board and the next patch of empty space being moved into. */
function frame(b: Box): Box {
  const pad = 150;
  let w = b.w + pad * 2;
  let h = b.h + pad * 2;
  const aspect = VIEW_ASPECT;
  if (w / h > aspect) h = w / aspect;
  else w = h * aspect;

  let x = b.x + b.w / 2 - w / 2;
  let y = b.y + b.h / 2 - h / 2;
  // Keep the frame on the board. Centred on an edge cell it otherwise hangs
  // off the side — for the bottom-left chapter the viewBox started at x=-274,
  // so a quarter of the screen was blank paper instead of the neighbouring
  // work that makes this read as one continuous board.
  x = w >= BOARD_W ? (BOARD_W - w) / 2 : Math.min(Math.max(x, 0), BOARD_W - w);
  y = h >= BOARD_H ? (BOARD_H - h) / 2 : Math.min(Math.max(y, 0), BOARD_H - h);
  return { x, y, w, h };
}

export default function StoryCanvas({ open, onClose }: { open: boolean; onClose: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const penRef = useRef<SVGGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const textRefs = useRef<(SVGTextElement | null)[]>([]);
  const coverRefs = useRef<(SVGRectElement | null)[]>([]);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  // Narration starts muted. It is triggered by a click so the browser would
  // allow it, but a page that starts talking at you unannounced is hostile —
  // the control is right there in the bar, and the choice is remembered.
  const [muted, setMuted] = useState(true);

  const acts = useRef<Act[]>([]);
  const total = useRef(1);
  const clock = useRef(0);
  const raf = useRef(0);
  const reduced = useRef(false);
  /** When each chapter's narration should begin, in clock milliseconds. */
  const cues = useRef<{ t: number; text: string }[]>([]);
  /** Index of the cue currently being spoken, so it isn't restarted each frame. */
  const spoken = useRef(-1);

  // Flatten the chapters into index-addressable lists once, so refs line up.
  const strokeList: { s: Stroke; ox: number; oy: number }[] = [];
  const textList: { text: string; x: number; y: number; size: number; weight: number }[] = [];
  CHAPTERS.forEach((ch, ci) => {
    const c = cell(ch.at ?? ci);
    ch.strokes.forEach((s) => strokeList.push({ s, ox: c.x, oy: c.y }));
    ch.lines.forEach((line, li) => {
      textList.push({ text: line, x: c.x + 40, y: c.y + 430 + li * 56, size: 46, weight: 700 });
    });
    if (ch.note) {
      textList.push({
        text: ch.note,
        x: c.x + 40,
        y: c.y + 430 + ch.lines.length * 56 + 14,
        size: 26,
        weight: 500,
      });
    }
  });

  // Load the marker face only when the player is actually opened — it exists
  // for this one overlay and shouldn't cost every other page a request.
  useEffect(() => {
    if (!open || document.getElementById("nac-scribe-font")) return;
    const l = document.createElement("link");
    l.id = "nac-scribe-font";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap";
    document.head.appendChild(l);
  }, [open]);

  /** Paint every element for a given moment on the clock. */
  const paint = useCallback((t: number) => {
    const svg = svgRef.current;
    if (!svg) return;

    let vb: Box | null = null;
    let penAt: { x: number; y: number } | null = null;

    for (const a of acts.current) {
      if (a.kind === "camera") {
        if (t >= a.t1) vb = a.to;
        else if (t >= a.t0) {
          const p = ease((t - a.t0) / (a.t1 - a.t0));
          vb = {
            x: lerp(a.from.x, a.to.x, p),
            y: lerp(a.from.y, a.to.y, p),
            w: lerp(a.from.w, a.to.w, p),
            h: lerp(a.from.h, a.to.h, p),
          };
        }
      } else if (a.kind === "stroke") {
        const el = pathRefs.current[a.i];
        if (!el) continue;
        const p = t <= a.t0 ? 0 : t >= a.t1 ? 1 : (t - a.t0) / (a.t1 - a.t0);
        el.style.strokeDashoffset = String(a.len * (1 - p));
        if (p > 0 && p < 1) {
          const pt = el.getPointAtLength(a.len * p);
          penAt = { x: pt.x + a.ox, y: pt.y + a.oy };
        }
      } else {
        const cover = coverRefs.current[a.i];
        if (!cover) continue;
        const p = t <= a.t0 ? 0 : t >= a.t1 ? 1 : (t - a.t0) / (a.t1 - a.t0);
        // The cover is the *unwritten* remainder, retreating to the right.
        cover.setAttribute("x", String(a.x + a.w * p));
        cover.setAttribute("width", String(Math.max(0, a.w * (1 - p) + 6)));
        if (p > 0 && p < 1) penAt = { x: a.x + a.w * p, y: a.y };
      }
    }

    if (vb) svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);

    const pen = penRef.current;
    if (pen) {
      if (penAt) {
        // Counter-scale so the pen stays the same size on screen however far
        // the camera has zoomed in.
        const s = vb ? vb.w / BOARD_W : 1;
        pen.setAttribute("transform", `translate(${penAt.x} ${penAt.y}) scale(${s})`);
        pen.style.opacity = "1";
      } else {
        pen.style.opacity = "0";
      }
    }
  }, []);

  /* Measure, then build the schedule. Text has to be measured after the font
     resolves or every cover rect is sized for the fallback face. */
  useLayoutEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function build() {
      try {
        await (document as any).fonts?.ready;
      } catch {
        /* measuring against the fallback is still better than not running */
      }
      if (cancelled) return;

      reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const list: Act[] = [];
      const cueList: { t: number; text: string }[] = [];
      let t = 0;
      let cam: Box = frame({ x: 0, y: 0, w: BOARD_W, h: BOARD_H });
      let si = 0;
      let ti = 0;

      CHAPTERS.forEach((ch, ci) => {
        const c = cell(ch.at ?? ci);
        const to = frame({ x: c.x, y: c.y, w: CELL_W, h: CELL_H });
        list.push({ kind: "camera", t0: t, t1: t + CAMERA_MS, from: cam, to });
        cam = to;
        t += CAMERA_MS;

        ch.strokes.forEach(() => {
          const el = pathRefs.current[si];
          const len = el ? el.getTotalLength() : 100;
          // The dash pattern has to be the path's OWN length. A single shared
          // dasharray large enough for the longest path leaves every shorter
          // one entirely inside the first dash, so no dashoffset can ever hide
          // it — every stroke was visible from frame one.
          if (el) {
            el.style.strokeDasharray = String(len);
            el.style.strokeDashoffset = String(len);
          }
          const dur = strokeMs(len);
          list.push({
            kind: "stroke",
            t0: t,
            t1: t + dur,
            i: si,
            len,
            ox: strokeList[si].ox,
            oy: strokeList[si].oy,
          });
          t += dur + 40;
          si += 1;
        });

        t += 160;

        // The chapter speaks as its words start being written.
        cueList.push({ t, text: ch.narration });

        const lineCount = ch.lines.length + (ch.note ? 1 : 0);
        for (let n = 0; n < lineCount; n += 1) {
          const el = textRefs.current[ti];
          const w = el ? el.getComputedTextLength() : 200;
          const dur = textMs(textList[ti].text.length);
          list.push({ kind: "text", t0: t, t1: t + dur, i: ti, x: textList[ti].x, y: textList[ti].y, w });
          t += dur + 90;
          ti += 1;
        }

        t += HOLD_MS;
      });

      const whole = frame({ x: 0, y: 0, w: BOARD_W, h: BOARD_H });
      list.push({ kind: "camera", t0: t, t1: t + END_ZOOM_MS, from: cam, to: whole });
      t += END_ZOOM_MS + END_HOLD_MS;

      acts.current = list;
      cues.current = cueList;
      total.current = t;
      paint(0); // start from a blank board rather than whatever markup renders
      setReady(true);
    }

    build();
    return () => {
      cancelled = true;
    };
  }, [open, paint]); // eslint-disable-line react-hooks/exhaustive-deps


  // The clock.
  useEffect(() => {
    if (!open || !ready) return;

    if (reduced.current) {
      clock.current = total.current;
      paint(total.current);
      setProgress(1);
      setDone(true);
      setPlaying(false);
      return;
    }

    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (playing) {
        clock.current = Math.min(total.current, clock.current + dt);
        paint(clock.current);
        setProgress(clock.current / total.current);

        // Speak the chapter the clock has reached, once.
        let cue = -1;
        for (let n = 0; n < cues.current.length; n += 1) {
          if (clock.current >= cues.current[n].t) cue = n;
        }
        if (cue !== spoken.current) {
          spoken.current = cue;
          if (!muted && cue >= 0) say(cues.current[cue].text);
        }

        if (clock.current >= total.current) {
          setPlaying(false);
          setDone(true);
        }
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [open, ready, playing, paint, muted]);

  /* Narration follows the transport. Pausing the animation while a sentence
     keeps talking over a frozen board is the kind of detail that makes a thing
     feel broken. */
  useEffect(() => {
    if (!open) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (playing) synth.resume();
    else synth.pause();
  }, [open, playing]);

  // Remember the choice, and re-speak the current chapter when unmuting.
  useEffect(() => {
    try {
      localStorage.setItem("nac_story_muted", muted ? "1" : "0");
    } catch {
      /* private mode — the preference just won't persist */
    }
    if (muted) hush();
    else spoken.current = -1;
  }, [muted]);

  useEffect(() => {
    try {
      const v = localStorage.getItem("nac_story_muted");
      if (v !== null) setMuted(v === "1");
    } catch {
      /* fall back to the default */
    }
  }, []);

  // Reset whenever the player is opened.
  useEffect(() => {
    if (!open) return;
    clock.current = 0;
    setProgress(0);
    setDone(false);
    setPlaying(true);
  }, [open]);

  // Escape closes; the page behind must not scroll while this is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      // Closing the player must stop the voice; speech outlives the component.
      hush();
    };
  }, [open, onClose]);

  const seek = (p: number) => {
    clock.current = total.current * p;
    paint(clock.current);
    setProgress(p);
    setDone(p >= 0.999);
    // Jumping elsewhere invalidates whatever is mid-sentence.
    hush();
    spoken.current = -1;
  };

  if (!open) return null;

  let si = -1;
  let ti = -1;

  return (
    <div className="scribe" role="dialog" aria-modal="true" aria-label="What is NAC?">
      <div className="scribe-board">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
          className="scribe-svg"
          aria-hidden
          focusable="false"
        >
          {CHAPTERS.map((ch, ci) => {
            const c = cell(ch.at ?? ci);
            return (
              <g key={ch.id} transform={`translate(${c.x} ${c.y})`}>
                {ch.strokes.map((s, n) => {
                  si += 1;
                  const idx = si;
                  return (
                    <path
                      key={n}
                      ref={(el) => {
                        pathRefs.current[idx] = el;
                      }}
                      d={s.d}
                      fill="none"
                      stroke={s.accent === "green" ? GREEN : s.accent === "red" ? RED : INK}
                      strokeWidth={s.width ?? 5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      /* Real values are set once measured; this just keeps the
                         stroke hidden for the frame before that happens. */
                      style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Text sits in board coordinates so its cover rects need no
              transform reconciliation. */}
          {textList.map((tl, n) => {
            ti += 1;
            const idx = ti;
            return (
              <g key={n}>
                <text
                  ref={(el) => {
                    textRefs.current[idx] = el;
                  }}
                  x={tl.x}
                  y={tl.y}
                  fontFamily="'Caveat', ui-rounded, cursive"
                  fontSize={tl.size}
                  fontWeight={tl.weight}
                  fill={tl.size > 30 ? INK : "#5b6672"}
                >
                  {tl.text}
                </text>
                <rect
                  ref={(el) => {
                    coverRefs.current[idx] = el;
                  }}
                  x={tl.x}
                  y={tl.y - tl.size}
                  width={1400}
                  height={tl.size * 1.6}
                  fill="#ffffff"
                />
              </g>
            );
          })}

          {/* The marker. Its tip is the origin, so positioning is just a
              translate to the point currently being drawn. */}
          <g ref={penRef} style={{ opacity: 0 }} aria-hidden>
            <path d="M0 0 L10 -26 L28 -16 L14 6 Z" fill="#2b2b2b" />
            <path d="M12 -24 L34 -62 a10 10 0 0 1 16 9 L30 -14 Z" fill="#3d4450" />
            <circle cx="2" cy="1" r="3" fill={INK} />
          </g>
        </svg>
      </div>

      {/* The same story as text, for anyone not watching it drawn. */}
      <div className="scribe-sr">
        {CHAPTERS.map((ch) => (
          <p key={ch.id}>
            {ch.lines.join(" ")} {ch.note ?? ""}
          </p>
        ))}
      </div>

      <button className="scribe-x" onClick={onClose} aria-label="Close">
        ✕
      </button>

      <div className="scribe-bar">
        <button
          className="scribe-btn"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <button
          className={`scribe-btn ${muted ? "" : "on"}`}
          onClick={() => setMuted((m) => !m)}
          aria-pressed={!muted}
          aria-label={muted ? "Turn narration on" : "Turn narration off"}
          title={muted ? "Narration off" : "Narration on"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <input
          className="scribe-seek"
          type="range"
          min={0}
          max={1000}
          value={Math.round(progress * 1000)}
          onChange={(e) => {
            setPlaying(false);
            seek(Number(e.target.value) / 1000);
          }}
          aria-label="Scrub the animation"
        />
        {done ? (
          <a className="scribe-cta" href="/#build" onClick={onClose}>
            Get the badge
          </a>
        ) : (
          <button
            className="scribe-btn wide"
            onClick={() => {
              setPlaying(false);
              seek(1);
            }}
          >
            Skip
          </button>
        )}
        <button
          className="scribe-btn"
          onClick={() => {
            seek(0);
            setPlaying(true);
          }}
          aria-label="Replay"
        >
          ↻
        </button>
      </div>
    </div>
  );
}
