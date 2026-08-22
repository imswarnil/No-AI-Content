"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import StoryModal from "./StoryModal";
import Share from "./components/Share";
import Pulse from "./components/Pulse";
import {
  IconFeather,
  IconUsers,
  IconCompass,
  IconLeaf,
  IconScale,
  IconSearch,
  IconCheck,
  IconPlay,
} from "./components/icons";
import { ArtInfinite, ArtJudgement } from "./components/ScrollArt";
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

  // The embedded stamp's own "What is this?" button asks the page to explain
  // itself before falling back to opening the site. Here we're already home,
  // so answer it in place. ?story=1 is the same entry point for a stamp
  // clicked on somebody else's blog.
  useEffect(() => {
    const onExplain = (e: Event) => {
      e.preventDefault();
      setStoryOpen(true);
    };
    window.addEventListener("nac:explain", onExplain);
    if (new URLSearchParams(window.location.search).get("story")) setStoryOpen(true);
    return () => window.removeEventListener("nac:explain", onExplain);
  }, []);

  // Reveal-on-scroll: fade + lift elements marked `.reveal` as they enter view.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
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
      {/* ---------- HERO ---------- */}
      <section className="hero split">
        <div className="hero-copy">
          <span className="pill-tag">
            <IconFeather size={13} /> NAC · Open source · Free forever
          </span>
          <h1>
            Real writing by <span className="grad">real humans</span>.
          </h1>
          <p className="lede">
            <strong>NAC — No AI Content.</strong> A notary-style stamp for blogs written by a
            person, not generated end-to-end by a machine. Add it to your site to tell readers the
            ideas and words are yours.
          </p>
          <div className="hero-cta">
            <a className="btn lg" href="#build">
              Create your stamp
            </a>
            <button className="btn lg ghost" onClick={() => setStoryOpen(true)}>
              <IconPlay size={15} /> What is this?
            </button>
          </div>
          <p className="manifesto">
            I miss the old web — blogs where a human actually thought and wrote. Using AI to
            sharpen a sentence or pressure-test an idea is fine. Publishing a soulless,
            end-to-end AI-generated post as your own is not. This stamp is a small, honest
            signal that a person is still behind the words.
          </p>
        </div>

        {/* The right column is the product itself — the real widget, running. */}
        <div className="hero-stage" aria-label="Live preview of the NAC stamp">
          <div className="hero-stage-frame">
            <WidgetPreview origin={origin} style="stamp" theme={theme} author={author} message={message} />
          </div>
          <span className="hero-stage-cap">
            Live preview · this is the actual embed
          </span>
        </div>
      </section>

      {/* ---------- WHY THIS PROJECT EXISTS ---------- */}
      <section className="statement reveal">
        <span className="kicker">Why this exists</span>
        <p className="big">
          Content became <span className="muted-word">infinite</span>.<br />
          Meaning became <span className="grad">scarce</span>.
        </p>
        <p className="support">
          The internet is filling with text no person ever thought or wrote — polished, generic,
          and empty. NAC exists to push the other way: a public, verifiable signal that lets real
          writers stand up and say <em>these words are mine</em>, and lets readers find them.
        </p>
        <ArtInfinite />
      </section>

      {/* ---------- THE MOTIVE (tinted band) ---------- */}
      <div className="band">
        <section className="statement reveal">
          <span className="kicker">The motive</span>
          <p className="big">
            A machine can imitate your <span className="muted-word">style</span>.
            <br />
            It can&apos;t replace your <span className="grad">judgement</span>.
          </p>
          <p className="support">
            Readers are learning to distrust polished, generic prose. A human voice — with a real
            point of view, lived detail, and the odd rough edge — is becoming the rarest and most
            valuable thing on the web. NAC is not anti-AI: use AI to refine your thinking. It&apos;s
            anti-<em>pretending</em> — against machines writing and humans taking the credit.
          </p>
          <ArtJudgement />
        </section>
      </div>

      {/* ---------- WHY USE NAC (value grid) ---------- */}
      <section className="section reveal">
        <h2 className="sec-title">Why writers add the seal</h2>
        <p className="sec-sub">Three reasons it&apos;s worth one line of code.</p>
        <div className="why-grid">
          <div className="why-card">
            <span className="ico"><IconUsers size={22} /></span>
            <h3>Earn reader trust</h3>
            <p>
              A visible, verifiable declaration tells visitors a person stands behind every word —
              not a content farm.
            </p>
          </div>
          <div className="why-card">
            <span className="ico"><IconCompass size={22} /></span>
            <h3>Get discovered</h3>
            <p>
              Every stamp lists your site on the public Browse page of human writers, filterable by
              topic and region.
            </p>
          </div>
          <div className="why-card">
            <span className="ico"><IconLeaf size={22} /></span>
            <h3>Stand for something</h3>
            <p>
              Join a growing movement of people who still write by hand — and help keep the open web
              worth reading.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="section reveal" style={{ paddingBottom: 24 }}>
        <h2 className="sec-title">How NAC works</h2>
        <p className="sec-sub">Live in under two minutes. No account, no cost.</p>
        <div className="steps four">
          <a className="step" href="/check">
            <span className="step-n">1</span>
            <strong>Verify your writing</strong>
            <span className="muted">
              Run your page through the open detector — see how human it reads before you claim the
              stamp.
            </span>
          </a>
          <div className="step">
            <span className="step-n">2</span>
            <strong>Customize your seal</strong>
            <span className="muted">Pick a style, add your name, region &amp; category.</span>
          </div>
          <div className="step">
            <span className="step-n">3</span>
            <strong>Copy one line of code</strong>
            <span className="muted">Paste the snippet into your sidebar, footer, or byline.</span>
          </div>
          <div className="step">
            <span className="step-n">4</span>
            <strong>Get listed &amp; re-verified</strong>
            <span className="muted">
              Your site joins the Browse page — and NAC keeps checking the stamp is really there.
            </span>
          </div>
        </div>
      </section>

      {/* ---------- STYLES SHOWCASE ---------- */}
      <section id="styles" className="section reveal">
        <h2 className="sec-title">Nine styles, one honest signal</h2>
        <p className="sec-sub">
          Notary seal, wax seal, passport visa, postmark, ribbon, certificate, typewriter, banner,
          pill — pick whichever fits where your words live. All customizable.
        </p>
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
      <section id="build" className="section reveal">
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
              Region &amp; category become filters on the <a href="/browse">Browse page</a> so
              readers can find you.
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
            {copied ? (
              <>
                <IconCheck size={15} /> Copied!
              </>
            ) : (
              "Copy embed code"
            )}
          </button>
        </div>
      </section>

      {/* ---------- ELIGIBILITY / VERIFY ---------- */}
      <section className="section reveal" style={{ paddingTop: 0 }}>
        <div className="two-cta">
          <a className="cta-card" href="/eligibility">
            <span className="cta-emoji"><IconScale size={26} /></span>
            <strong>Do I qualify?</strong>
            <span className="muted">
              See which uses of AI are allowed (refining, grammar) and which aren&apos;t (generating
              whole posts).
            </span>
          </a>
          <a className="cta-card" href="/check">
            <span className="cta-emoji"><IconSearch size={26} /></span>
            <strong>Verify my writing</strong>
            <span className="muted">
              The testing layer behind the stamp: a transparent AI-likeness score, with third-party
              cross-checks if you want a second opinion.
            </span>
          </a>
        </div>
      </section>

      {/* ---------- PROMOTE / HOW TO ADD ---------- */}
      <section className="section reveal">
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

      {/* ---------- THE PULSE: visitors + poll ---------- */}
      <section className="section reveal">
        <h2 className="sec-title">You&apos;re not alone in this</h2>
        <p className="sec-sub">
          Live counts from this very page — no cookies, no accounts, just honest tallies.
        </p>
        <Pulse />
      </section>

      {/* ---------- SPREAD THE WORD ---------- */}
      <section className="section reveal">
        <h2 className="sec-title">Spread the word</h2>
        <p className="sec-sub">
          The stamp only works if readers recognize it. Share NAC wherever your people are.
        </p>
        <Share />
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section reveal">
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
              Honestly, no tool can — AI detectors routinely mislabel real human writing. The stamp
              is a <em>declaration</em> you choose to make. The optional{" "}
              <a href="/check">verification layer</a> gives constructive feedback to help you
              improve, not a verdict.
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

      {/* ---------- THE ASK — one inverse band, near the end ---------- */}
      <section className="section reveal">
        <div className="cta-band">
          <span className="kicker">The ask</span>
          <h2>If a human wrote it, say so.</h2>
          <p>
            Every badge on a real blog makes the next reader trust the open web a little more.
            Put the stamp where your words live — it takes one line of code, costs nothing,
            and tells everyone who lands on your site that a person is behind the writing.
          </p>
          <div className="hero-cta">
            <a className="btn lg" href="#build">
              Add the badge to your site
            </a>
            <a className="btn lg ghost" href="/browse">
              Meet the humans already in →
            </a>
          </div>
        </div>
      </section>

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
