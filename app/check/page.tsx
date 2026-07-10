"use client";

import { useState } from "react";
import Link from "next/link";

type Improvement = { issue: string; fix: string };
type Result = {
  verdict: "reads_human" | "mixed_signals" | "reads_ai_generated";
  confidence: string;
  summary: string;
  strengths: string[];
  improvements: Improvement[];
};

const VERDICT: Record<string, { label: string; tone: string; emoji: string }> = {
  reads_human: { label: "Reads human", tone: "ok", emoji: "✅" },
  mixed_signals: { label: "Mixed signals", tone: "warn", emoji: "🤔" },
  reads_ai_generated: { label: "Reads AI-generated", tone: "no", emoji: "🚫" },
};

export default function Check() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function run() {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Analysis failed");
      setResult(json.result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const v = result ? VERDICT[result.verdict] : null;

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <span className="pill-tag">🔍 Human-ness review</span>
          <h1>
            Does your writing read <span className="grad">human</span>?
          </h1>
          <p className="lede">
            Paste a page and get specific, constructive feedback on where it reads generic — and how
            to make it unmistakably yours.
          </p>
          <div className="check-box">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-blog.com/a-post"
              onKeyDown={(e) => e.key === "Enter" && run()}
            />
            <button className="btn lg" onClick={run} disabled={loading}>
              {loading ? "Reading…" : "Check it"}
            </button>
          </div>
          <p className="disclaimer">
            ⚠️ Honest caveat: no tool can <em>prove</em> content is AI-free — detectors routinely
            mislabel real human writing. This is qualitative guidance to help you improve, not a
            verdict on you as a person.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        {error && (
          <div className="card" style={{ borderColor: "#fecaca" }}>
            <p style={{ color: "#dc2626", margin: 0 }}>⚠ {error}</p>
          </div>
        )}

        {loading && (
          <div className="card">
            <p className="muted" style={{ margin: 0 }}>
              Fetching the page and reviewing the writing… this can take ~15–30 seconds.
            </p>
          </div>
        )}

        {result && v && (
          <>
            <div className={`verdict ${v.tone}`}>
              <span className="ve">{v.emoji}</span>
              <div>
                <strong>{v.label}</strong>
                <span className="muted"> · confidence: {result.confidence}</span>
                <p style={{ margin: "6px 0 0" }}>{result.summary}</p>
              </div>
            </div>

            {result.strengths.length > 0 && (
              <div className="card" style={{ marginTop: 18 }}>
                <h2 style={{ marginTop: 0 }}>What reads human ✅</h2>
                <ul className="feedback">
                  {result.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.improvements.length > 0 && (
              <div className="card" style={{ marginTop: 18 }}>
                <h2 style={{ marginTop: 0 }}>Where to make it more you — it&apos;s not you, it&apos;s the AI-flavored parts 🖋️</h2>
                <ul className="feedback">
                  {result.improvements.map((im, i) => (
                    <li key={i}>
                      <strong>{im.issue}</strong>
                      <span className="fix">→ {im.fix}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="card" style={{ marginTop: 18, textAlign: "center" }}>
              {result.verdict === "reads_human" ? (
                <>
                  <p style={{ marginTop: 0 }}>Looks great. Claim your stamp and get listed. 🎉</p>
                  <Link className="btn" href="/#build">
                    Create my stamp
                  </Link>
                </>
              ) : (
                <>
                  <p style={{ marginTop: 0 }} className="muted">
                    Tighten the spots above, add your own experience and voice, then re-check.
                  </p>
                  <Link className="btn ghost" href="/eligibility">
                    See what qualifies
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </section>

      <footer className="footer">
        <p>
          🌱 <strong>No AI Content</strong> — free &amp; open source.
        </p>
        <p className="muted">
          <Link href="/">Home</Link> · <Link href="/directory">Directory</Link> ·{" "}
          <Link href="/eligibility">Rules</Link>
        </p>
      </footer>
    </main>
  );
}
