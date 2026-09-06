"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Share from "./components/Share";
import StoryCanvas from "./components/StoryCanvas";
import Pulse from "./components/Pulse";
import WidgetPreview from "./components/WidgetPreview";
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
  IconArrowRight,
  IconPlay,
} from "./components/icons";
import { PRESETS, STYLES, PLATFORMS } from "@/lib/badge";

// The style gallery below is read-only on the homepage — the interactive
// builder lives on its own page (/badge) now, so these previews just show
// the default message rather than tracking form state.
const GALLERY_AUTHOR = "";
const GALLERY_MESSAGE = PRESETS[0];
const GALLERY_THEME = "light";

const STEPS = [
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
        <em>declaration</em> you choose to make, not a verdict a machine hands down.
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

  const [origin, setOrigin] = useState("");
  const [storyOpen, setStoryOpen] = useState(false);

  // Feeds the read-only style gallery below — widget.js is loaded from the
  // origin the page is actually viewed on, so local development previews
  // against the local copy.
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
              <Link className="btn primary lg" href="/badge">
                Create your badge
              </Link>
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
          <p>
            Pick whichever fits where your words live — all customizable on the{" "}
            <Link href="/badge">badge builder</Link>.
          </p>
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
                      theme={GALLERY_THEME}
                      author={GALLERY_AUTHOR}
                      message={GALLERY_MESSAGE}
                    />
                  </div>
                  <Link className="gallery-meta" href={`/badge?style=${s.key}`}>
                    <strong>{s.name}</strong>
                    <span>{s.blurb}</span>
                  </Link>
                </div>
              ))}
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
                {STEPS.map((s, i) => (
                  <div className="row-item" key={s.title}>
                    <span className="row-num">{i + 1}</span>
                    <span className="row-body">
                      <strong>{s.title}</strong>
                      <span className="muted">{s.body}</span>
                    </span>
                  </div>
                ))}
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

      {/* ---------- RULES / BROWSE ---------- */}
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
          <Link className="cta-card" href="/browse">
            <span className="cta-emoji">
              <IconCompass size={20} />
            </span>
            <strong>Browse the roll</strong>
            <span className="muted">
              Every site that&apos;s claimed the stamp — a public, re-verified directory of
              human-written work.
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
