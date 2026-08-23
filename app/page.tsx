"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Share from "./components/Share";
import StoryCanvas from "./components/StoryCanvas";
import Pulse from "./components/Pulse";
import { useRevealOnScroll } from "./components/reveal";
import {
  SceneWritten,
  SceneFlood,
  SceneBalance,
  SceneSeal,
  SceneRoll,
  SceneWhy,
} from "./components/scenes";
import {
  IconFeather,
  IconUsers,
  IconCompass,
  IconLeaf,
  IconScale,
  IconSearch,
  IconCheck,
  IconArrowRight,
  IconPlay,
} from "./components/icons";
import { CATEGORIES, REGIONS } from "@/lib/taxonomy";

type Style =
  | "stamp"
  | "wax"
  | "passport"
  | "postmark"
  | "ribbon"
  | "certificate"
  | "typewriter"
  | "banner"
  | "compact";

const PRESETS = [
  "Written by a human. AI is used only to refine ideas — never to generate.",
  "100% human-written. No AI-generated text.",
  "The words are mine. AI helps me edit, not write.",
  "Human-first writing. AI assists — the human decides.",
];

const STYLES: { key: Style; name: string; blurb: string }[] = [
  { key: "stamp", name: "Notary stamp", blurb: "The signature seal — for sidebars" },
  { key: "wax", name: "Wax seal", blurb: "Pressed in molten ink" },
  { key: "passport", name: "Passport visa", blurb: "Admitted to the open web" },
  { key: "postmark", name: "Postmark", blurb: "Hand-delivered writing" },
  { key: "ribbon", name: "Prize ribbon", blurb: "100% human, award-style" },
  { key: "certificate", name: "Certificate", blurb: "Serial-numbered declaration" },
  { key: "typewriter", name: "Typewriter byline", blurb: "A quiet mono signature" },
  { key: "banner", name: "Banner", blurb: "Best for footers / about pages" },
  { key: "compact", name: "Compact pill", blurb: "Best for inline / bylines" },
];

const STEPS = [
  {
    title: "Verify your writing",
    body: "Run a page through the open detector — see how human it reads before you claim the stamp.",
    href: "/check",
  },
  { title: "Customize your seal", body: "Pick a style, add your name, region and topic." },
  { title: "Copy one line of code", body: "Paste the snippet into your sidebar, footer, or byline." },
  {
    title: "Get listed and re-verified",
    body: "Your site joins the public roll — and NAC keeps checking the stamp is really there.",
  },
];

const REASONS = [
  {
    Icon: IconUsers,
    title: "Earn reader trust",
    body: "A visible, verifiable declaration tells visitors a person stands behind every word — not a content farm.",
  },
  {
    Icon: IconCompass,
    title: "Get discovered",
    body: "Every stamp lists your site on the public roll of human writers, filterable by topic and region.",
  },
  {
    Icon: IconLeaf,
    title: "Stand for something",
    body: "Join a growing group of people who still write by hand — and help keep the open web worth reading.",
  },
];

const PLATFORMS: { tag: string; name: string; body: React.ReactNode }[] = [
  {
    tag: "WP",
    name: "WordPress",
    body: (
      <>
        Appearance → Widgets → add a <em>Custom HTML</em> block → paste.
      </>
    ),
  },
  {
    tag: "Gh",
    name: "Ghost",
    body: (
      <>
        Settings → Code injection, or drop an <em>HTML card</em> into a post.
      </>
    ),
  },
  { tag: "</>", name: "Plain HTML", body: "Paste it anywhere in your template." },
  {
    tag: "◆",
    name: "Webflow / Framer",
    body: (
      <>
        Add an <em>Embed / Code</em> element and paste the snippet.
      </>
    ),
  },
];

const FAQ: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is NAC anti-AI?",
    a: "No — it's pro-human. Using AI to fix grammar, tighten a sentence, or pressure-test an idea is fine. What NAC stands against is publishing whole posts generated end-to-end by a machine and passing them off as your own writing.",
  },
  {
    q: "Do you track my visitors?",
    a: (
      <>
        No. NAC records only the <strong>domain</strong> the badge runs on, plus a timestamp and a
        count. No IP addresses, no cookies, no visitor profiles.
      </>
    ),
  },
  {
    q: "Can NAC prove my content is AI-free?",
    a: (
      <>
        Honestly, no tool can — AI detectors routinely mislabel real human writing. The stamp is a{" "}
        <em>declaration</em> you choose to make. The optional <Link href="/check">verification
        layer</Link> gives constructive feedback to help you improve, not a verdict.
      </>
    ),
  },
  {
    q: "Is it really free?",
    a: "Yes. NAC is free and open source (MIT). Host it yourself or use the shared instance — no account required to add the badge.",
  },
  {
    q: "Where can I put the badge?",
    a: "Anywhere you can paste HTML — a sidebar widget, a footer, an about page, or a byline. It works on WordPress, Ghost, Webflow, Framer, and plain HTML sites.",
  },
];

export default function Home() {
  useRevealOnScroll();

  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState(PRESETS[0]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [style, setStyle] = useState<Style>("stamp");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  // Any badge on the page — including the nine in the style gallery — asks the
  // host to explain itself through a cancelable event. Calling preventDefault
  // tells the widget we handled it, so it doesn't also open a second copy in a
  // new tab. `?story=1` is the same entry point for a badge clicked on
  // somebody else's blog.
  useEffect(() => {
    const onExplain = (e: Event) => {
      e.preventDefault();
      setStoryOpen(true);
    };
    window.addEventListener("nac:explain", onExplain);
    if (new URLSearchParams(window.location.search).get("story")) setStoryOpen(true);
    return () => window.removeEventListener("nac:explain", onExplain);
  }, []);

  const embedCode = useMemo(() => {
    const attrs = [
      `src="${origin}/widget.js"`,
      author ? `data-author="${escapeAttr(author)}"` : "",
      `data-message="${escapeAttr(message)}"`,
      `data-style="${style}"`,
      `data-theme="${theme}"`,
      region ? `data-region="${escapeAttr(region)}"` : "",
      category ? `data-category="${escapeAttr(category)}"` : "",
      "async",
    ]
      .filter(Boolean)
      .join("\n  ");
    return `<script\n  ${attrs}\n></script>`;
  }, [origin, author, message, style, theme, region, category]);

  async function copy() {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="container hero">
        <div className="hero-inner">
          <div>
            <span className="eyebrow">
              <IconFeather size={13} /> Open source · Free forever
            </span>
            <h1>Real writing by real humans.</h1>
            <p className="lede">
              NAC is a notary-style stamp for blogs written by a person, not generated end-to-end
              by a machine. One line of code tells your readers the ideas and the words are yours.
            </p>
            <div className="hero-cta">
              <a className="btn primary lg" href="#build">
                Create your badge
              </a>
              <button className="btn lg" onClick={() => setStoryOpen(true)}>
                <IconPlay size={15} /> Watch the story
              </button>
            </div>
            <p className="hero-note">No account. No cost. Only your domain is ever recorded.</p>
          </div>
          <div className="reveal in figure-art" aria-hidden>
            <div className="scene-art">
              <SceneWritten />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- THE ARGUMENT ---------- */}
      <section className="section sunken" id="why">
        <div className="container">
          <div className="sec-head reveal">
            <span className="eyebrow">Why this exists</span>
            <h2>The web is filling with words nobody meant.</h2>
            <p>
              This isn&apos;t a complaint about technology. It&apos;s about what happens to reading
              when nobody is behind the writing.
            </p>
          </div>

          <div className="figure-row reveal">
            <div className="figure-art" aria-hidden>
              <div className="scene-art">
                <SceneFlood />
              </div>
            </div>
            <div className="figure-body">
              <h2>Then everything started to rhyme.</h2>
              <p>
                Pages spun up by the thousand — fluent, confident, and saying nothing at all. Every
                article opens the same way, hedges in the same places, and lands on the same
                shapeless conclusion.
              </p>
              <p>
                The scarce thing is no longer words. It&apos;s someone who actually has something
                to say, and the taste to say it well.
              </p>
            </div>
          </div>

          {/* The personal note — the reason the project exists at all. */}
          <div className="figure-row flip personal reveal">
            <div className="figure-art" aria-hidden>
              <div className="scene-art">
                <SceneWhy />
              </div>
            </div>
            <div className="figure-body">
              <h2>I like AI. I just don&apos;t like AI-generated content.</h2>
              <p>
                I use AI every day and I&apos;m glad it exists. It sharpens my sentences, catches my
                typos, and argues with my bad ideas better than most people will.
              </p>
              <p>
                But reading a page that no person actually wrote puts me off, and I honestly
                can&apos;t fully explain why. Something about it feels like being handed a letter
                nobody signed. This is me doing something about that feeling instead of just
                complaining about it.
              </p>
            </div>
          </div>

          <div className="figure-row reveal">
            <div className="figure-art" aria-hidden>
              <div className="scene-art">
                <SceneBalance />
              </div>
            </div>
            <div className="figure-body">
              <h2>The line isn&apos;t AI or no AI.</h2>
              <p>
                Use it to sharpen a sentence or pressure-test an argument. Just don&apos;t hand over
                the thinking. The rule of thumb: if you deleted the AI&apos;s contribution and your
                post vanished with it, it was never really yours.
              </p>
              <Link className="btn" href="/eligibility">
                See exactly what counts <IconArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="figure-row flip reveal">
            <div className="figure-art" aria-hidden>
              <div className="scene-art">
                <SceneSeal />
              </div>
            </div>
            <div className="figure-body">
              <h2>So: press a seal on it.</h2>
              <p>
                A notary-style mark you put on your own work. It isn&apos;t a verdict handed down by
                a detector — no detector is reliable enough for that. It&apos;s a signature: a
                person saying, plainly, that they wrote this.
              </p>
            </div>
          </div>

          <div className="figure-row reveal">
            <div className="figure-art" aria-hidden>
              <div className="scene-art">
                <SceneRoll />
              </div>
            </div>
            <div className="figure-body">
              <h2>One line of code. You&apos;re on the roll.</h2>
              <p>
                Your site joins a public, browsable list of human writers — and stays there only
                while the seal does. Every listing is re-checked, so the roll stays honest.
              </p>
              <Link className="btn" href="/browse">
                Browse the roll <IconArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- WHY WRITERS ADD IT ---------- */}
      <section className="section container">
        <div className="sec-head reveal">
          <span className="eyebrow">Why writers add it</span>
          <h2>Three reasons it&apos;s worth one line of code.</h2>
        </div>
        <div className="grid-3 reveal">
          {REASONS.map(({ Icon, title, body }) => (
            <article className="panel" key={title}>
              <div className="panel-body">
                <span className="feature-icon">
                  <Icon size={18} />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- STYLES ---------- */}
      <section className="section container" id="styles">
        <div className="sec-head reveal">
          <span className="eyebrow">The badge</span>
          <h2>Nine styles, one honest signal.</h2>
          <p>Pick whichever fits where your words live. All of them are customizable.</p>
        </div>
        <div className="panel reveal">
          <div className="panel-body flush">
            <div className="gallery">
              {STYLES.map((s) => (
                <div className="gallery-item" key={s.key}>
                  <div className="gallery-stage">
                    <WidgetPreview
                      origin={origin}
                      style={s.key}
                      theme={theme}
                      author={author}
                      message={message}
                    />
                  </div>
                  <div className="gallery-meta">
                    <strong>{s.name}</strong>
                    <span>{s.blurb}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- BUILDER ---------- */}
      <section className="section sunken" id="build">
        <div className="container">
          <div className="sec-head reveal">
            <span className="eyebrow">Make yours</span>
            <h2>Build your badge.</h2>
            <p>Nothing is stored until you paste the snippet on your own site.</p>
          </div>

          <div className="builder reveal">
            <div className="panel">
              <div className="panel-body">
                <div className="field">
                  <label htmlFor="nac-author">Your name or brand</label>
                  <input
                    id="nac-author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Jane Doe"
                  />
                  <p className="field-hint">Optional — shown on the badge itself.</p>
                </div>

                <div className="field">
                  <label htmlFor="nac-preset">What it says</label>
                  <select
                    id="nac-preset"
                    value={PRESETS.includes(message) ? message : "__custom"}
                    onChange={(e) => e.target.value !== "__custom" && setMessage(e.target.value)}
                  >
                    {PRESETS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                    <option value="__custom">Custom…</option>
                  </select>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    aria-label="Badge message"
                    style={{ marginTop: "var(--space-2)" }}
                  />
                </div>

                <div className="row">
                  <div className="field">
                    <label htmlFor="nac-style">Style</label>
                    <select id="nac-style" value={style} onChange={(e) => setStyle(e.target.value as Style)}>
                      {STYLES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="nac-badge-theme">Badge theme</label>
                    <select
                      id="nac-badge-theme"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as "light" | "dark")}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="field">
                    <label htmlFor="nac-region">Country or region</label>
                    <input
                      id="nac-region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="e.g. India"
                      list="nac-regions"
                    />
                    <datalist id="nac-regions">
                      {REGIONS.map((r) => (
                        <option key={r} value={r} />
                      ))}
                    </datalist>
                  </div>
                  <div className="field">
                    <label htmlFor="nac-category">Topic</label>
                    <input
                      id="nac-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Tech, Travel, Personal"
                      list="nac-categories"
                    />
                    <datalist id="nac-categories">
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <p className="field-hint">
                  Region and topic become filters on the <Link href="/browse">Browse page</Link> so
                  readers can find you.
                </p>
              </div>
            </div>

            <div className="stack">
              <div className="panel">
                <div className="panel-head">
                  <h3>Live preview</h3>
                  <span className="badge accent">This is the real embed</span>
                </div>
                <div className="panel-body">
                  <div className={`preview-stage ${theme}`}>
                    <WidgetPreview
                      origin={origin}
                      style={style}
                      theme={theme}
                      author={author}
                      message={message}
                    />
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <h3>Your snippet</h3>
                  <button className="btn primary sm" onClick={copy}>
                    {copied ? (
                      <>
                        <IconCheck size={13} /> Copied
                      </>
                    ) : (
                      "Copy"
                    )}
                  </button>
                </div>
                <div className="panel-body">
                  <pre>{embedCode}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="section container">
        <div className="sec-head reveal">
          <span className="eyebrow">How it works</span>
          <h2>Live in under two minutes.</h2>
        </div>
        <div className="grid-2 reveal">
          <div className="panel">
            <div className="panel-body flush">
              <div className="rows">
                {STEPS.map((s, i) =>
                  s.href ? (
                    <Link className="row-item linked" href={s.href} key={s.title}>
                      <span className="row-num">{i + 1}</span>
                      <span className="row-body">
                        <strong>{s.title}</strong>
                        <span className="muted">{s.body}</span>
                      </span>
                      <span className="row-arrow">
                        <IconArrowRight size={14} />
                      </span>
                    </Link>
                  ) : (
                    <div className="row-item" key={s.title}>
                      <span className="row-num">{i + 1}</span>
                      <span className="row-body">
                        <strong>{s.title}</strong>
                        <span className="muted">{s.body}</span>
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head">
              <h3>Where to paste it</h3>
            </div>
            <div className="panel-body flush">
              <div className="rows">
                {PLATFORMS.map((p) => (
                  <div className="row-item" key={p.name}>
                    <span className="row-num mono">{p.tag}</span>
                    <span className="row-body">
                      <strong>{p.name}</strong>
                      <span className="muted">{p.body}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- RULES / VERIFY ---------- */}
      <section className="section container tight">
        <div className="two-cta reveal">
          <Link className="cta-card" href="/eligibility">
            <span className="cta-emoji">
              <IconScale size={20} />
            </span>
            <strong>Do I qualify?</strong>
            <span className="muted">
              Which uses of AI are allowed (refining, grammar) and which aren&apos;t (generating
              whole posts).
            </span>
          </Link>
          <Link className="cta-card" href="/check">
            <span className="cta-emoji">
              <IconSearch size={20} />
            </span>
            <strong>Verify my writing</strong>
            <span className="muted">
              A transparent AI-likeness score with third-party cross-checks — feedback, not a
              verdict.
            </span>
          </Link>
        </div>
      </section>

      {/* ---------- PULSE ---------- */}
      <section className="section container tight">
        <div className="panel reveal">
          <div className="panel-head">
            <div>
              <h3>You&apos;re not alone in this</h3>
              <p>Live counts from this page — no cookies, no accounts, just honest tallies.</p>
            </div>
          </div>
          <div className="panel-body flush">
            <Pulse />
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section container">
        <div className="sec-head reveal">
          <span className="eyebrow">Questions</span>
          <h2>The five people ask before they paste the snippet.</h2>
        </div>
        <div className="panel reveal">
          <div className="panel-body flush">
            <div className="faq">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- SHARE ---------- */}
      <section className="section container tight">
        <div className="sec-head reveal">
          <span className="eyebrow">Spread the word</span>
          <h2>The stamp only works if readers recognize it.</h2>
        </div>
        <div className="panel reveal">
          <div className="panel-body flush">
            <Share />
          </div>
        </div>
      </section>

      <StoryCanvas open={storyOpen} onClose={() => setStoryOpen(false)} />
    </>
  );
}

/** Renders the real widget.js into an isolated node for preview. */
function WidgetPreview({
  origin,
  style,
  theme,
  author,
  message,
}: {
  origin: string;
  style: Style;
  theme: string;
  author: string;
  message: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host || !origin) return;
    host.innerHTML = "";
    const s = document.createElement("script");
    s.src = `${origin}/widget.js`;
    if (author) s.setAttribute("data-author", author);
    s.setAttribute("data-message", message);
    s.setAttribute("data-style", style);
    s.setAttribute("data-theme", theme);
    host.appendChild(s);
  }, [origin, style, theme, author, message]);
  return <div ref={ref} className="widget-host" />;
}

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
