"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * The manifesto — the "why this exists" page. Big statement blocks with
 * reveal-on-scroll, matching the homepage motion language.
 */
export default function Manifesto() {
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

  return (
    <main>
      {/* ---------- NAV ---------- */}
      <header className="nav">
        <Link className="brand" href="/">
          <span className="brand-seal" aria-hidden>
            ✒︎
          </span>
          <span className="brand-name">
            NAC<span className="brand-sub">No AI Content</span>
          </span>
        </Link>
        <nav className="nav-links">
          <Link href="/manifesto">Manifesto</Link>
          <Link href="/directory">Directory</Link>
          <Link href="/eligibility">Rules</Link>
          <Link href="/check">Check</Link>
          <Link className="btn sm" href="/#build">
            Get your stamp
          </Link>
        </nav>
      </header>

      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="hero-inner">
          <span className="pill-tag">✒︎ The manifesto</span>
          <h1>
            The web is worth <span className="grad">writing for</span>.
          </h1>
          <p className="lede">
            Why we built a badge for people who still put their own thoughts into their own
            words — and why it matters more every month.
          </p>
        </div>
      </section>

      {/* ---------- STATEMENT 1 ---------- */}
      <section className="statement reveal">
        <span className="kicker">What changed</span>
        <p className="big">
          Content became <span className="muted-word">infinite</span>.
          <br />
          Meaning became <span className="grad">scarce</span>.
        </p>
        <p className="support">
          Anyone can now generate a thousand polished, competent, forgettable articles before
          lunch. The scarce thing is no longer words — it&apos;s a person who actually has something
          to say and the taste to say it well.
        </p>
      </section>

      {/* ---------- PROSE ---------- */}
      <div className="band">
        <section className="statement reveal" style={{ paddingBottom: 40 }}>
          <div className="prose" style={{ textAlign: "left" }}>
            <p className="lead">
              We&apos;re not against AI. We use it every day — to catch a typo, tighten a clumsy
              sentence, argue against a weak idea. Used like that, it makes human writing better.
            </p>
            <p>
              What we&apos;re against is the quiet swap: a machine doing the thinking and the
              writing, then a person putting their name on it. That&apos;s not authorship. It&apos;s
              laundering. And it&apos;s drowning the open web in text that no one really means.
            </p>
            <blockquote>
              If you deleted the AI&apos;s contribution and your post vanished with it, it was
              never really yours.
            </blockquote>
            <h2>What NAC actually is</h2>
            <p>
              NAC is a small, honest badge you add to your site in one line of code. It doesn&apos;t
              scan or &ldquo;prove&rdquo; anything — no detector can, and the ones that claim to
              routinely mislabel real human writing. It&apos;s a declaration you choose to make,
              backed by a public directory so readers can find people like you.
            </p>
            <ul>
              <li>A visible signal that a human is behind the words.</li>
              <li>A public directory of writers, filterable by topic and region.</li>
              <li>Free, open source, and privacy-first — only the domain is recorded.</li>
            </ul>
            <h2>Why it matters</h2>
            <p>
              Trust is becoming the whole game. As generic AI prose floods every feed, a genuine
              human voice — a real point of view, lived detail, the occasional rough edge — is the
              rarest and most valuable thing a reader can find. NAC helps them find yours, and it
              helps the writers who still care about the craft recognize each other.
            </p>
            <p>
              It&apos;s a small thing. But small, honest signals are how a healthier web gets
              rebuilt — one page at a time.
            </p>
          </div>
        </section>
      </div>

      {/* ---------- CLOSING STATEMENT ---------- */}
      <section className="statement reveal">
        <span className="kicker">The ask</span>
        <p className="big">
          If a human wrote it, <span className="grad">say so.</span>
        </p>
        <p className="support">
          Add the seal, join the directory, and help keep the web worth reading.
        </p>
        <div className="hero-cta" style={{ marginTop: 30 }}>
          <Link className="btn lg" href="/#build">
            Create your stamp
          </Link>
          <Link className="btn lg ghost" href="/directory">
            See who&apos;s in →
          </Link>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="footer">
        <p>
          ✒︎ <strong>NAC — No AI Content</strong>. Free &amp; open source.
        </p>
        <p className="muted">
          <Link href="/">Home</Link> · <Link href="/directory">Directory</Link> ·{" "}
          <Link href="/eligibility">Rules</Link> · <Link href="/check">Check my site</Link>
        </p>
      </footer>
    </main>
  );
}
