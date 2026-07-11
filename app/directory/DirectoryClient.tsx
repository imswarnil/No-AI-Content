"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, REGIONS } from "@/lib/taxonomy";

export type DirSite = {
  domain: string;
  author: string | null;
  region: string | null;
  category: string | null;
  title: string | null;
  description: string | null;
  first_seen: string;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

function parseList(s: string): Set<string> {
  return new Set(s.split(",").map((x) => x.trim()).filter(Boolean));
}

function facetCounts(values: (string | null)[], defaults: string[]): [string, number][] {
  const m = new Map<string, number>(defaults.map((d) => [d, 0]));
  for (const v of values) if (v) m.set(v, (m.get(v) || 0) + 1);
  return Array.from(m).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/**
 * Sidebar directory: checkbox facets (category, region) + instant search.
 * Checkboxes are OR within a group and AND across groups. Selections are
 * mirrored into the URL (?q=&category=a,b&region=x) so views stay shareable.
 */
export default function DirectoryClient({
  sites,
  initialRegions,
  initialCategories,
  initialQuery,
}: {
  sites: DirSite[];
  initialRegions: string;
  initialCategories: string;
  initialQuery: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [cats, setCats] = useState<Set<string>>(() => parseList(initialCategories));
  const [regs, setRegs] = useState<Set<string>>(() => parseList(initialRegions));

  // Facet options: the suggested taxonomy plus anything sites actually
  // declared. Options with sites float to the top; empty ones stay pickable.
  const catCounts = useMemo(() => facetCounts(sites.map((s) => s.category), CATEGORIES), [sites]);
  const regCounts = useMemo(() => facetCounts(sites.map((s) => s.region), REGIONS), [sites]);

  function syncUrl(next: { q?: string; cats?: Set<string>; regs?: Set<string> }) {
    const p = new URLSearchParams();
    const nq = next.q ?? q;
    const nc = next.cats ?? cats;
    const nr = next.regs ?? regs;
    if (nq) p.set("q", nq);
    if (nc.size) p.set("category", Array.from(nc).join(","));
    if (nr.size) p.set("region", Array.from(nr).join(","));
    const s = p.toString();
    window.history.replaceState(null, "", s ? `/directory?${s}` : "/directory");
  }

  function toggleIn(set: Set<string>, value: string): Set<string> {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  function clearAll() {
    setQ("");
    setCats(new Set());
    setRegs(new Set());
    syncUrl({ q: "", cats: new Set(), regs: new Set() });
  }

  const needle = q.trim().toLowerCase();
  const filtered = sites.filter(
    (s) =>
      (cats.size === 0 || (s.category != null && cats.has(s.category))) &&
      (regs.size === 0 || (s.region != null && regs.has(s.region))) &&
      (!needle ||
        s.domain.toLowerCase().includes(needle) ||
        (s.title || "").toLowerCase().includes(needle) ||
        (s.description || "").toLowerCase().includes(needle) ||
        (s.author || "").toLowerCase().includes(needle) ||
        (s.category || "").toLowerCase().includes(needle) ||
        (s.region || "").toLowerCase().includes(needle)),
  );

  const hasFilters = needle !== "" || cats.size > 0 || regs.size > 0;

  return (
    <div className="dir-layout">
      <aside className="dir-side" aria-label="Directory filters">
        <input
          className="dir-search-input"
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            syncUrl({ q: e.target.value });
          }}
          placeholder="Search sites…"
          aria-label="Search the directory"
        />

        <fieldset className="facet">
          <legend>Category</legend>
          <div className="facet-list">
            {catCounts.map(([cat, n]) => (
              <label key={cat} className={`cbx ${n === 0 && !cats.has(cat) ? "empty" : ""}`}>
                <input
                  type="checkbox"
                  checked={cats.has(cat)}
                  onChange={() => {
                    const next = toggleIn(cats, cat);
                    setCats(next);
                    syncUrl({ cats: next });
                  }}
                />
                <span className="cbx-label">{cat}</span>
                {n > 0 && <span className="cbx-count">{n}</span>}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="facet">
          <legend>Country / region</legend>
          <div className="facet-list">
            {regCounts.map(([r, n]) => (
              <label key={r} className={`cbx ${n === 0 && !regs.has(r) ? "empty" : ""}`}>
                <input
                  type="checkbox"
                  checked={regs.has(r)}
                  onChange={() => {
                    const next = toggleIn(regs, r);
                    setRegs(next);
                    syncUrl({ regs: next });
                  }}
                />
                <span className="cbx-label">{r}</span>
                {n > 0 && <span className="cbx-count">{n}</span>}
              </label>
            ))}
          </div>
        </fieldset>

        {hasFilters && (
          <button className="link-btn" onClick={clearAll}>
            Clear all filters
          </button>
        )}
      </aside>

      <div className="dir-main">
        <p className="dir-count muted" role="status">
          {filtered.length} of {sites.length} site{sites.length === 1 ? "" : "s"}
        </p>

        {filtered.length === 0 ? (
          <p className="sec-sub" style={{ textAlign: "left" }}>
            {sites.length === 0 ? (
              <>
                No sites yet. <Link href="/#build">Create your stamp</Link> and you&apos;ll appear
                here.
              </>
            ) : (
              <>
                No sites match that filter.{" "}
                <button className="link-btn" onClick={clearAll}>
                  Clear filters
                </button>
              </>
            )}
          </p>
        ) : (
          <div className="dir-grid">
            {filtered.map((s) => (
              <a
                key={s.domain}
                className="dir-card"
                href={`https://${s.domain}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="dir-favi"
                  src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=64`}
                  alt=""
                  width={32}
                  height={32}
                  loading="lazy"
                />
                <span className="dir-meta">
                  <strong>{s.title || s.domain}</strong>
                  {s.description && <span className="dir-desc muted">{s.description}</span>}
                  <span className="dir-sub muted">
                    {[s.title ? s.domain : null, s.author, s.category, s.region]
                      .filter(Boolean)
                      .join(" · ") || `since ${fmt(s.first_seen)}`}
                  </span>
                </span>
                <span className="dir-arrow" aria-hidden>
                  ↗
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
