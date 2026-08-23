"use client";

import { useEffect, useState } from "react";

type Stats = { visits: number; agree: number; disagree: number };

/**
 * The pulse: how many humans have visited, and whether they feel the same way.
 * One visit per browser session (sessionStorage), one vote per browser
 * (localStorage) — honest counts without cookies or accounts.
 */
export default function Pulse() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [voted, setVoted] = useState<"agree" | "disagree" | "">("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setVoted((localStorage.getItem("nac_vote") as "agree" | "disagree") || "");
    const seen = sessionStorage.getItem("nac_visited");
    const req = seen
      ? fetch("/api/pulse")
      : fetch("/api/pulse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "visit" }),
        });
    if (!seen) sessionStorage.setItem("nac_visited", "1");
    req
      .then((r) => r.json())
      .then((j) => j.ok && setStats(j.stats))
      .catch(() => {});
  }, []);

  async function vote(choice: "agree" | "disagree") {
    if (voted || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: choice }),
      });
      const j = await res.json();
      if (j.ok) {
        setStats(j.stats);
        setVoted(choice);
        localStorage.setItem("nac_vote", choice);
      }
    } catch {
      /* counting is best-effort */
    } finally {
      setBusy(false);
    }
  }

  const total = stats ? stats.agree + stats.disagree : 0;
  const agreePct = total > 0 ? Math.round((stats!.agree / total) * 100) : 0;

  return (
    <div className="pulse">
      <div className="pulse-stat">
        <span className="pulse-num">{stats ? stats.visits.toLocaleString() : "—"}</span>
        <span className="pulse-lbl">humans have visited this page</span>
      </div>

      <div className="pulse-poll">
        <p className="pulse-q">Do you think the same way — that the web needs more human writing?</p>
        {voted ? (
          <>
            <div className="pulse-bar" role="img" aria-label={`${agreePct}% agree`}>
              <div className="pulse-fill" style={{ width: `${agreePct}%` }} />
            </div>
            <p className="pulse-result">
              <strong>{agreePct}% agree</strong>
              <span className="muted">
                {" "}
                · {total.toLocaleString()} vote{total === 1 ? "" : "s"} · you said{" "}
                {voted === "agree" ? "yes" : "no"}
              </span>
            </p>
          </>
        ) : (
          <div className="pulse-btns">
            <button className="btn primary" onClick={() => vote("agree")} disabled={busy}>
              Yes, same here
            </button>
            <button className="btn" onClick={() => vote("disagree")} disabled={busy}>
              Not really
            </button>
            {total > 0 && (
              <span className="muted pulse-hint">{total.toLocaleString()} people have answered</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
