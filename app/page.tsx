"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import StoryModal from "./StoryModal";
import { CATEGORIES, REGIONS } from "@/lib/taxonomy";

type Style = "stamp" | "banner" | "compact";

const PRESETS = [
  "Written by a human. AI is used only to refine ideas — never to generate.",
  "100% human-written. No AI-generated text.",
  "The words are mine. AI helps me edit, not write.",
  "Human-first writing. AI assists — the human decides.",
];

const STYLES: { key: Style; name: string; blurb: string }[] = [
  { key: "stamp", name: "Notary stamp", blurb: "The signature seal — for sidebars" },
  { key: "banner", name: "Banner", blurb: "Best for footers / about pages" },
  { key: "compact", name: "Compact pill", blurb: "Best for inline / bylines" },
];

export default function Home() {
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState(PRESETS[0]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [style, setStyle] = useState<Style>("stamp");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
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
    <main>
      {/* ---------- NAV ---------- */}
      <header className="nav">
        <a className="brand" href="/">
          <span className="brand-seal" aria-hidden>
            ✒︎
          </span>
          <span className="brand-name">
            NAC<span className="brand-sub">No AI Content</span>
          </span>
        </a>
        <nav className="nav-links">
          <a href="#styles">Styles</a>
          <a href="#build">Build</a>
          <a href="/directory">Directory</a>
          <a href="/eligibility">Rules</a>
          <a href="/check">Check</a>
          <a className="btn sm" href="#build">
            Get your stamp
          </a>
        </nav>
      </header>

      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="hero-inner">
          <span className="pill-tag">🌱 NAC · Open source · Free forever</span>
          <h1>
            Real writing by <span className="grad">real humans</span>.
          </h1>
          <p className="lede">
            <strong>NAC — No AI Content.</strong> A badge for blogs written by a person, not
            generated end-to-end by a machine. Add it to your sidebar to tell readers the ideas
            and words are yours.
          </p>
          <div className="hero-cta">
            <a className="btn lg" href="#build">
              Create your stamp
            </a>
            <button className="btn lg ghost" onClick={() => setStoryOpen(true)}>
              ▶ What is this?
            </button>
            <a className="btn lg ghost" href="/directory">
              See who uses it →
            </a>
          </div>
          <p className="manifesto">
            I miss the old web — blogs where a human actually thought and wrote. Using AI to
            sharpen a sentence or pressure-test an idea is fine. Publishing a soulless,
            end-to-end AI-generated post as your own is not. This badge is a small, honest
            signal that a person is still behind the words.
          </p>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="section" style={{ paddingBottom: 24 }}>
        <h2 className="sec-title">How NAC works</h2>
        <p className="sec-sub">Live in under two minutes. No account, no cost.</p>
        <div className="steps">
          <div className="step">
            <span className="step-n">1</span>
            <strong>Customize your seal</strong>
            <span className="muted">Pick a style, add your name, region &amp; category.</span>
          </div>
          <div className="step">
            <span className="step-n">2</span>
            <strong>Copy one line of code</strong>
            <span className="muted">Paste the snippet into your sidebar, footer, or byline.</span>
          </div>
          <div className="step">
            <span className="step-n">3</span>
            <strong>Get listed</strong>
            <span className="muted">Your site joins the public directory of human writers.</span>
          </div>
        </div>
      </section>

      {/* ---------- STYLES SHOWCASE ---------- */}
      <section id="styles" className="section">
        <h2 className="sec-title">Three styles, one honest signal</h2>
        <p className="sec-sub">Pick whichever fits where you want it. All are customizable.</p>
        <div className="showcase">
          {STYLES.map((s) => (
            <div className="showcase-card" key={s.key}>
              <WidgetPreview origin={origin} style={s.key} theme={theme} author={author} message={message} />
              <div className="showcase-meta">
                <strong>{s.name}</strong>
                <span>{s.blurb}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- BUILDER ---------- */}
      <section id="build" className="section">
        <h2 className="sec-title">Build your badge</h2>
        <div className="builder">
          <div className="card">
            <label>Your name / brand (optional)</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Jane Doe" />

            <label>What it says</label>
            <select
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
            <textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />

            <div className="row">
              <div>
                <label>Style</label>
                <select value={style} onChange={(e) => setStyle(e.target.value as Style)}>
                  {STYLES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Theme</label>
                <select value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark")}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div>
                <label>Country / region (optional)</label>
                <input
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
              <div>
                <label>Category (optional)</label>
                <input
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
            <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
              Region &amp; category help readers find you in the{" "}
              <a href="/directory">public directory</a>.
            </p>
          </div>

          <div className="card preview-card">
            <label>Live preview</label>
            <div className={`preview-stage ${theme}`}>
              <WidgetPreview origin={origin} style={style} theme={theme} author={author} message={message} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <label>Copy this into your site</label>
          <pre>{embedCode}</pre>
          <button className="btn" onClick={copy} style={{ marginTop: 14 }}>
            {copied ? "✓ Copied!" : "Copy embed code"}
          </button>
        </div>
      </section>

      {/* ---------- ELIGIBILITY / CHECK ---------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="two-cta">
          <a className="cta-card" href="/eligibility">
            <span className="cta-emoji">📜</span>
            <strong>Do I qualify?</strong>
            <span className="muted">
              See which uses of AI are allowed (refining, grammar) and which aren&apos;t (generating
              whole posts).
            </span>
          </a>
          <a className="cta-card" href="/check">
            <span className="cta-emoji">🔍</span>
            <strong>Check my writing</strong>
            <span className="muted">
              Get honest, specific feedback on where your page reads generic — and how to make it
              unmistakably yours.
            </span>
          </a>
        </div>
      </section>

      {/* ---------- PROMOTE / HOW TO ADD ---------- */}
      <section className="section">
        <h2 className="sec-title">Add it to your sidebar</h2>
        <p className="sec-sub">Paste the snippet as an HTML block wherever you want it to show.</p>
        <div className="howto">
          <div className="howto-card">
            <span className="num">WP</span>
            <strong>WordPress</strong>
            <p>Appearance → Widgets → add a <em>Custom HTML</em> block to your sidebar → paste.</p>
          </div>
          <div className="howto-card">
            <span className="num">Gh</span>
            <strong>Ghost</strong>
            <p>Settings → Code injection, or drop an <em>HTML card</em> into a post/page.</p>
          </div>
          <div className="howto-card">
            <span className="num">{"</>"}</span>
            <strong>Plain HTML</strong>
            <p>Paste the snippet anywhere in your template — sidebar, footer, or byline.</p>
          </div>
          <div className="howto-card">
            <span className="num">◆</span>
            <strong>Webflow / Framer</strong>
            <p>Add an <em>Embed / Code</em> element to your layout and paste the snippet.</p>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section">
        <h2 className="sec-title">Questions</h2>
        <div className="faq">
          <details>
            <summary>Is NAC anti-AI?</summary>
            <p>
              No — it&apos;s pro-human. Using AI to fix grammar, tighten a sentence, or pressure-test
              an idea is fine. What NAC stands against is publishing whole posts generated
              end-to-end by a machine and passing them off as your own writing.
            </p>
          </details>
          <details>
            <summary>Do you track my visitors?</summary>
            <p>
              No. NAC records only the <strong>domain</strong> the badge runs on, plus a timestamp
              and a count. No IP addresses, no cookies, no visitor profiles.
            </p>
          </details>
          <details>
            <summary>Can NAC prove my content is AI-free?</summary>
            <p>
              Honestly, no tool can — AI detectors routinely mislabel real human writing. The badge
              is a <em>declaration</em> you choose to make. The optional{" "}
              <a href="/check">Check</a> page gives constructive feedback to help you improve, not a
              verdict.
            </p>
          </details>
          <details>
            <summary>Is it really free?</summary>
            <p>
              Yes. NAC is free and open source (MIT). Host it yourself or use the shared instance —
              no account required to add the badge.
            </p>
          </details>
          <details>
            <summary>Where can I put the badge?</summary>
            <p>
              Anywhere you can paste HTML — a sidebar widget, a footer, an about page, or a byline.
              It works on WordPress, Ghost, Webflow, Framer, and plain HTML sites.
            </p>
          </details>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="footer">
        <p>
          ✒︎ <strong>NAC — No AI Content</strong>. Free &amp; open source. Only the embedding domain
          is recorded; no cookies, no visitor tracking.
        </p>
        <p className="muted">
          <a href="/directory">Directory</a> · <a href="/eligibility">Rules</a> ·{" "}
          <a href="/check">Check my site</a> · <a href="/dashboard">Dashboard</a> ·{" "}
          <a href="https://github.com/imswarnil/No-AI-Content" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </p>
      </footer>

      <StoryModal open={storyOpen} onClose={() => setStoryOpen(false)} />
    </main>
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
