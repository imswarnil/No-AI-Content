/**
 * Story scenes — the art half of the 16:9 player.
 *
 * Every scene is a plain SVG on a 240×200 stage. Nothing animates from here:
 * the shapes carry class names (`draw`, `rise`, `pop`, `spin`) and globals.css
 * owns the timing, so one set of keyframes drives all five and
 * prefers-reduced-motion can switch the whole thing off in one rule.
 *
 * `pathLength="100"` normalises every stroke, so a single dash rule draws a
 * 20px tick and a 300px circle at the same visual speed.
 */

type P = { d?: string; delay?: number; className?: string };

/** A stroke that draws itself on. */
function Draw({ d, delay = 0, className = "" }: P) {
  return (
    <path
      d={d}
      pathLength={100}
      className={`draw ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

const stage = {
  viewBox: "0 0 240 200",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: "false" as const,
};

/* ------------------------------------------------------------------ 01
   A page being written by hand: the sheet draws, then the ruled lines
   appear one after another, then the nib travels the last line. */
export function SceneWritten() {
  return (
    <svg {...stage}>
      <Draw d="M64 24h84l28 28v124H64z" delay={0} />
      <Draw d="M148 24v28h28" delay={300} />
      <g className="ink">
        <Draw d="M86 78h68" delay={620} />
        <Draw d="M86 98h68" delay={760} />
        <Draw d="M86 118h52" delay={900} />
        <Draw d="M86 138h60" delay={1040} />
      </g>
      {/* the nib that made them */}
      <g className="nib">
        <Draw d="M160 128l16-16 8 8-16 16-10 2z" delay={1200} className="accent" />
        <Draw d="M170 138l-8 8" delay={1400} className="accent" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ 02
   The flood: identical machine-made pages stack in, faster and faster,
   each one flatter and greyer than the last. */
export function SceneFlood() {
  const cards = [0, 1, 2, 3, 4, 5];
  return (
    <svg {...stage}>
      {cards.map((n) => (
        /* Two groups on purpose: the outer one holds the position, the inner
           one is animated. A CSS transform would otherwise beat the
           `transform` attribute and stack every card at the origin. */
        <g key={n} transform={`translate(${16 + n * 16} ${128 - n * 19})`}>
          <g className="pop" style={{ animationDelay: `${120 + n * 130}ms` }}>
            <rect x="0" y="0" width="96" height="46" rx="6" className="muted-stroke" />
            <path d="M12 17h60" className="muted-stroke" />
            <path d="M12 29h44" className="muted-stroke" />
          </g>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ 03
   The honest line: a balance. The beam draws, then settles level —
   a chip on one pan, a hand-drawn spark on the other. */
export function SceneBalance() {
  return (
    <svg {...stage}>
      <Draw d="M120 40v120" delay={0} />
      <Draw d="M92 168h56" delay={200} />
      <g className="beam">
        <Draw d="M52 68h136" delay={380} />
        <Draw d="M52 68l-16 34a20 20 0 0 0 32 0z" delay={640} />
        <Draw d="M188 68l16 34a20 20 0 0 1-32 0z" delay={780} className="accent" />
      </g>
      {/* machine side */}
      <g className="pop" style={{ animationDelay: "1000ms" }}>
        <rect x="42" y="36" width="20" height="20" rx="4" className="muted-stroke" />
        <path d="M48 32v4M56 32v4M48 56v4M56 56v4" className="muted-stroke" />
      </g>
      {/* human side */}
      <g className="pop" style={{ animationDelay: "1160ms" }}>
        <path d="M188 30v16M180 38h16M183 32l10 10M193 32l-10 10" className="accent-stroke" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ 04
   The stamp: the outer ring sweeps around, the dashed inner ring counter-
   rotates, the nib mark lands, and the whole seal presses down once. */
export function SceneSeal() {
  return (
    <svg {...stage}>
      <g className="press">
        <circle cx="120" cy="100" r="52" pathLength={100} className="draw accent" />
        <circle
          cx="120"
          cy="100"
          r="42"
          pathLength={100}
          className="draw spin"
          strokeDasharray="4 3"
          style={{ animationDelay: "260ms" }}
        />
        <Draw
          d="M120 74c9 0 15 12 15 24l-15 19-15-19c0-12 6-24 15-24z"
          delay={620}
          className="accent"
        />
        <Draw d="M120 92v22" delay={900} className="accent" />
      </g>
      {/* the desk it lands on */}
      <Draw d="M44 172h152" delay={1180} />
    </svg>
  );
}

/* ------------------------------------------------------------------ 05
   The roll: three sites line up, each getting its seal in turn. */
export function SceneRoll() {
  const cols = [0, 1, 2];
  return (
    <svg {...stage}>
      {cols.map((n) => (
        <g key={n} transform={`translate(${22 + n * 68} 52)`}>
          <g className="pop" style={{ animationDelay: `${140 + n * 180}ms` }}>
            <rect x="0" y="0" width="54" height="72" rx="7" />
            <path d="M12 18h30" />
            <path d="M12 30h22" />
          </g>
          <g className="pop" style={{ animationDelay: `${620 + n * 180}ms` }}>
            <circle cx="27" cy="54" r="11" className="accent-stroke" />
            <path d="M22 54l4 4 8-8" className="accent-stroke" />
          </g>
        </g>
      ))}
      <Draw d="M22 148h196" delay={1300} />
    </svg>
  );
}

/* ------------------------------------------------------------------ 06
   "I like AI. I just don't like AI-generated content."

   The whole argument in one frame, as two parallel rows that draw in
   sequence. Top: the same chip hands over a pen — the tool, and a tick.
   Bottom: the chip hands over a finished page of perfectly even lines — the
   content, and a cross. Identical left-hand side both times, so the eye lands
   on the only thing that changed: what came out the other end. */
export function SceneWhy() {
  return (
    <svg {...stage}>
      {/* ---- the tool: yes ---- */}
      <g>
        <Draw d="M26 46h40v32H26z" delay={0} />
        <Draw d="M22 54h4M22 62h4M22 70h4" delay={160} />
        <Draw d="M66 54h4M66 62h4M66 70h4" delay={160} />
        <Draw d="M80 62h30" delay={340} />
        <Draw d="M104 56l6 6-6 6" delay={460} />
        {/* a pen, handed over */}
        <Draw d="M128 74l16-16 8 8-16 16-10 2z" delay={620} />
        <Draw d="M140 70l6 6" delay={760} />
        <Draw d="M176 62l6 6 12-14" delay={900} className="accent" />
      </g>

      {/* ---- the content: no ---- */}
      <g>
        <Draw d="M26 124h40v32H26z" delay={1120} />
        <Draw d="M22 132h4M22 140h4M22 148h4" delay={1260} />
        <Draw d="M66 132h4M66 140h4M66 148h4" delay={1260} />
        <Draw d="M80 140h30" delay={1400} />
        <Draw d="M104 134l6 6-6 6" delay={1520} />
        {/* a finished page — every line exactly as long as the last */}
        <Draw d="M126 112h30l8 8v52h-38z" delay={1660} />
        <Draw d="M156 112v8h8" delay={1800} />
        <g className="ink">
          <Draw d="M134 134h22" delay={1920} />
          <Draw d="M134 144h22" delay={2000} />
          <Draw d="M134 154h22" delay={2080} />
          <Draw d="M134 164h22" delay={2160} />
        </g>
        <Draw d="M180 132l14 14M194 132l-14 14" delay={2300} className="no" />
      </g>
    </svg>
  );
}
