"use client";

import { useState } from "react";
import Link from "next/link";

type Signal = {
  key: string;
  label: string;
  detail: string;
  aiLikeness: number;
  weight: number;
  lean: "ai" | "human" | "neutral";
};
type Detection = {
  score: number;
  verdict: "reads_human" | "mixed_signals" | "reads_ai_generated";
  confidence: string;
  signals: Signal[];
  stats: { words: number; sentences: number; avgSentenceLen: number; burstiness: number; uniqueRatio: number };
};

const VERDICT: Record<string, { label: string; tone: string; emoji: string }> = {
  reads_human: { label: "Reads human", tone: "ok", emoji: "✅" },
  mixed_signals: { label: "Mixed signals", tone: "warn", emoji: "🤔" },
  reads_ai_generated: { label: "Leans AI-generated", tone: "no", emoji: "🤖" },
};

export default function Check() {
  const [mode, setMode] = useState<"url" | "text">("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [det, setDet] = useState<Detection | null>(null);
  const [source, setSource] = useState("");

  // optional Claude second opinion
  const [ai, setAi] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr, setAiErr] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    setDet(null);
    setAi(null);
    setAiErr("");
    try {
      const payload = mode === "url" ? { url } : { text };
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Analysis failed");
      setDet(json.result);
      setSource(json.source);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function secondOpinion() {
    setAiLoading(true);
    setAiErr("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: source }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Review unavailable");
      setAi(json.result);
    } catch (e: any) {
      setAiErr(e.message);
    } finally {
      setAiLoading(false);
    }
  }

  const v = det ? VERDICT[det.verdict] : null;

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <span className="pill-tag">🔍 NAC detector · your own logic</span>
          <h1>
            How <span className="grad">AI-like</span> does it read?
          </h1>
          <p className="lede">
            A transparent, signal-based score — no black box. See exactly which patterns pushed the
            result, and how to make the writing unmistakably yours.
          </p>

          <div className="mode-toggle">
            <button className={mode === "url" ? "on" : ""} onClick={() => setMode("url")}>
              From a URL
            </button>
            <button className={mode === "text" ? "on" : ""} onClick={() => setMode("text")}>
              Paste text
            </button>
          </div>

          {mode === "url" ? (
            <div className="check-box">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-blog.com/a-post"
                onKeyDown={(e) => e.key === "Enter" && run()}
              />
              <button className="btn lg" onClick={run} disabled={loading}>
                {loading ? "Reading…" : "Analyze"}
              </button>
            </div>
          ) : (
            <div style={{ maxWidth: 620, margin: "22px auto 12px" }}>
              <textarea
                rows={7}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste at least a few paragraphs of writing…"
                style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid var(--border)", fontSize: 15, fontFamily: "inherit" }}
              />
              <button className="btn lg" onClick={run} disabled={loading} style={{ marginTop: 12 }}>
                {loading ? "Analyzing…" : "Analyze"}
              </button>
            </div>
          )}

          <p className="disclaimer">
            ⚠️ Honest by design: this is a <strong>heuristic signal score, not proof</strong>. No
            tool can reliably detect AI — real human writing gets false-flagged all the time. Use it
            to improve, never to accuse.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 12 }}>
        {error && (
          <div className="card" style={{ borderColor: "#fecaca" }}>
            <p style={{ color: "#dc2626", margin: 0 }}>⚠ {error}</p>
          </div>
        )}

        {det && v && (
          <>
            <div className={`verdict ${v.tone}`}>
              <span className="ve">{v.emoji}</span>
              <div style={{ flex: 1 }}>
                <strong>{v.label}</strong>
                <span className="muted"> · confidence: {det.confidence}</span>
                <div className="meter">
                  <div className={`meter-fill ${v.tone}`} style={{ width: `${det.score}%` }} />
                </div>
                <span className="muted" style={{ fontSize: 13 }}>
                  AI-likeness score: <strong>{det.score}/100</strong> · {det.stats.words} words ·
                  avg {det.stats.avgSentenceLen} words/sentence · variety {det.stats.burstiness}
                </span>
              </div>
            </div>

            <div className="card" style={{ marginTop: 18 }}>
              <h2 style={{ marginTop: 0 }}>Why — the signals</h2>
              <p className="muted" style={{ marginTop: -4 }}>
                Each bar shows how AI-like that signal read. Green leans human, red leans AI.
              </p>
              <div className="sig-list">
                {det.signals.map((s) => (
                  <div className="sig-row" key={s.key}>
                    <div className="sig-head">
                      <span className="sig-label">{s.label}</span>
                      <span className={`sig-tag ${s.lean}`}>
                        {s.lean === "ai" ? "AI-leaning" : s.lean === "human" ? "Human-leaning" : "Neutral"}
                      </span>
                    </div>
                    <div className="sig-bar">
                      <div className={`sig-fill ${s.lean}`} style={{ width: `${Math.round(s.aiLikeness * 100)}%` }} />
                    </div>
                    <span className="sig-detail muted">{s.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginTop: 18, textAlign: "center" }}>
              {det.verdict === "reads_human" ? (
                <>
                  <p style={{ marginTop: 0 }}>Reads human. Claim your stamp and get listed. 🎉</p>
                  <Link className="btn" href="/#build">
                    Create my stamp
                  </Link>
                </>
              ) : (
                <p style={{ marginTop: 0 }} className="muted">
                  Add more of your own voice — first-person experience, specific details, varied
                  sentence lengths, and contractions — then re-run.
                </p>
              )}

              {source.startsWith("http") && (
                <div style={{ marginTop: 14 }}>
                  {!ai && (
                    <button className="btn ghost" onClick={secondOpinion} disabled={aiLoading}>
                      {aiLoading ? "Asking Claude…" : "Want a deeper read? Get an AI second opinion"}
                    </button>
                  )}
                  {aiErr && <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>⚠ {aiErr}</p>}
                </div>
              )}
            </div>

            {ai && (
              <div className="card" style={{ marginTop: 18 }}>
                <h2 style={{ marginTop: 0 }}>🖋️ Claude&apos;s take — {ai.summary}</h2>
                {ai.improvements?.length > 0 && (
                  <ul className="feedback">
                    {ai.improvements.map((im: any, i: number) => (
                      <li key={i}>
                        <strong>{im.issue}</strong>
                        <span className="fix">→ {im.fix}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <footer className="footer">
        <p>
          ✒︎ <strong>NAC — No AI Content</strong>. Free &amp; open source.
        </p>
        <p className="muted">
          <Link href="/">Home</Link> · <Link href="/directory">Directory</Link> ·{" "}
          <Link href="/eligibility">Rules</Link>
        </p>
      </footer>
    </main>
  );
}
