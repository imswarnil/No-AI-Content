"use client";

import { useEffect, useState } from "react";

type Site = {
  domain: string;
  author: string | null;
  message: string | null;
  has_widget: boolean | null;
  check_at: string | null;
  first_seen: string;
  last_seen: string;
  hits: string;
};

/** Mirrors isWidgetPresent in lib/db.ts (client component can't import it). */
function listedInDirectory(s: Site): boolean {
  if (s.has_widget !== false) return true;
  return Date.now() - new Date(s.last_seen).getTime() < 7 * 24 * 3600 * 1000;
}

export default function Dashboard() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<{ count: number; totalHits: number; sites: Site[] } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Remember the token locally so you don't retype it each visit.
  useEffect(() => {
    const saved = localStorage.getItem("nac_admin_token");
    if (saved) {
      setToken(saved);
      load(saved);
    }
  }, []);

  async function load(t: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/sites?token=${encodeURIComponent(t)}`);
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed to load");
      setData(json);
      localStorage.setItem("nac_admin_token", t);
    } catch (e: any) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="hero">
        <h1>Usage dashboard</h1>
        <p className="muted">Sites currently embedding your No AI Content badge.</p>
      </div>

      <div className="card">
        <label>Admin token</label>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Your ADMIN_TOKEN"
            onKeyDown={(e) => e.key === "Enter" && load(token)}
          />
          <button className="btn" onClick={() => load(token)} disabled={loading}>
            {loading ? "Loading…" : "Load"}
          </button>
        </div>
        {error && (
          <p style={{ color: "#dc2626", marginTop: 12, fontSize: 14 }}>⚠ {error}</p>
        )}
      </div>

      {data && (
        <>
          <div className="stat-grid" style={{ marginTop: 24 }}>
            <div className="stat">
              <div className="num">{data.count}</div>
              <div className="lbl">Sites using the badge</div>
            </div>
            <div className="stat">
              <div className="num">{data.totalHits.toLocaleString()}</div>
              <div className="lbl">Total badge loads</div>
            </div>
            <div className="stat">
              <div className="num">
                {data.sites.filter((s) => isRecent(s.last_seen)).length}
              </div>
              <div className="lbl">Active in last 7 days</div>
            </div>
          </div>

          <div className="card">
            <h2>Embedding sites</h2>
            {data.sites.length === 0 ? (
              <p className="muted">No sites yet. Once someone embeds the widget, they’ll appear here.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Author</th>
                      <th>Directory</th>
                      <th>Loads</th>
                      <th>First seen</th>
                      <th>Last seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sites.map((s) => (
                      <tr key={s.domain}>
                        <td>
                          <a href={`https://${s.domain}`} target="_blank" rel="noreferrer">
                            {s.domain}
                          </a>
                        </td>
                        <td>{s.author || <span className="muted">—</span>}</td>
                        <td>
                          {listedInDirectory(s) ? (
                            <span title={s.has_widget ? "Widget found on homepage" : "Not verified yet / recent badge loads"}>
                              ✅ listed
                            </span>
                          ) : (
                            <span className="muted" title="Widget not found on homepage and no badge loads in 7 days">
                              🚫 hidden
                            </span>
                          )}
                        </td>
                        <td>{Number(s.hits).toLocaleString()}</td>
                        <td className="muted">{fmt(s.first_seen)}</td>
                        <td className="muted">{fmt(s.last_seen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function isRecent(iso: string) {
  return Date.now() - new Date(iso).getTime() < 7 * 24 * 60 * 60 * 1000;
}
