"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-triggered SVG figures for the statement bands.
 *
 * The animation is deliberately *not* a fade. Each figure draws itself the way
 * the sentence beside it argues: the machine side repeats identically and
 * arrives on a metronome, the human side is drawn once, unevenly, by hand.
 * That contrast is the point — so the art has to run when the words are read,
 * which means an IntersectionObserver rather than a page-load animation.
 *
 * Everything below sets class names only; globals.css owns the keyframes, so
 * prefers-reduced-motion can flatten all of it in one rule.
 */
function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // No observer (or an old browser) should still show the finished drawing,
    // never an empty box.
    if (!("IntersectionObserver" in window)) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setSeen(true);
            io.unobserve(e.target); // draw once; replaying on every scroll is noise
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, seen };
}

const svgProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: "false" as const,
};

/* ------------------------------------------------------------------
   "Content became infinite. Meaning became scarce."

   Twelve machine-ruled lines march in on a fixed beat, identical length,
   perfectly stacked. One human line is drawn last, alone, and wanders. */
export function ArtInfinite() {
  const { ref, seen } = useInView<HTMLDivElement>();
  const rows = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className={`scroll-art ${seen ? "in" : ""}`} ref={ref}>
      <svg {...svgProps} viewBox="0 0 420 200">
        <g className="art-machine">
          {rows.map((n) => (
            <path
              key={n}
              pathLength={100}
              className="art-line"
              style={{ animationDelay: `${n * 55}ms` }}
              d={`M18 ${14 + n * 15}h250`}
            />
          ))}
        </g>
        {/* the one that a person made */}
        <g className="art-human">
          <path
            pathLength={100}
            className="art-line art-hand"
            style={{ animationDelay: "820ms" }}
            d="M300 92c14-9 26 4 38-3s20-14 34-9 22 15 34 9"
          />
          <path
            pathLength={100}
            className="art-line art-hand"
            style={{ animationDelay: "1040ms" }}
            d="M300 112c18 6 28-7 42-5s24 11 38 6"
          />
        </g>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------
   "A machine can imitate your style. It can't replace your judgement."

   A perfect sine wave is traced, then a hand-drawn one lands on top of it —
   close, but never the same curve. The fork at the end is the judgement: two
   roads, and only the human line picks one. */
export function ArtJudgement() {
  const { ref, seen } = useInView<HTMLDivElement>();

  return (
    <div className={`scroll-art ${seen ? "in" : ""}`} ref={ref}>
      <svg {...svgProps} viewBox="0 0 420 200">
        {/* the imitation — mechanically perfect, drawn first */}
        <path
          pathLength={100}
          className="art-line art-ghost"
          d="M20 110c22 0 22-44 44-44s22 44 44 44 22-44 44-44 22 44 44 44 22-44 44-44"
        />
        {/* the original — same idea, human hand */}
        <path
          pathLength={100}
          className="art-line art-hand"
          style={{ animationDelay: "420ms" }}
          d="M20 118c24-3 20-46 45-43s19 47 43 45 24-46 46-42 20 44 43 41"
        />
        {/* the fork: judgement */}
        <g className="art-fork">
          <path
            pathLength={100}
            className="art-line art-ghost"
            style={{ animationDelay: "1000ms" }}
            d="M240 118c40 4 60 30 96 34"
          />
          <path
            pathLength={100}
            className="art-line art-hand art-chosen"
            style={{ animationDelay: "1140ms" }}
            d="M240 118c42-6 62-34 100-38"
          />
          <circle className="art-dot" cx="340" cy="80" r="5" style={{ animationDelay: "1600ms" }} />
        </g>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------
   The closing band: a seal drawing itself, then pressing.
   Used on the manifesto so the argument lands on the mark it argues for. */
export function ArtSeal() {
  const { ref, seen } = useInView<HTMLDivElement>();

  return (
    <div className={`scroll-art tight ${seen ? "in" : ""}`} ref={ref}>
      <svg {...svgProps} viewBox="0 0 220 200">
        <g className="art-press">
          <circle pathLength={100} className="art-line art-accent" cx="110" cy="96" r="62" />
          <circle
            pathLength={100}
            className="art-line art-spin"
            cx="110"
            cy="96"
            r="50"
            strokeDasharray="4 3"
            style={{ animationDelay: "220ms" }}
          />
          <path
            pathLength={100}
            className="art-line art-accent"
            style={{ animationDelay: "560ms" }}
            d="M110 64c11 0 18 14 18 28l-18 23-18-23c0-14 7-28 18-28z"
          />
          <path
            pathLength={100}
            className="art-line art-accent"
            style={{ animationDelay: "820ms" }}
            d="M110 86v26"
          />
        </g>
        <path
          pathLength={100}
          className="art-line"
          style={{ animationDelay: "1120ms" }}
          d="M28 178h164"
        />
      </svg>
    </div>
  );
}
