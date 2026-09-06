"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, REGIONS } from "@/lib/taxonomy";
import {
  IconExternal,
  IconSearch,
  IconCompass,
  IconGlobe,
  IconScale,
  IconCheck,
  IconX,
  IconArrowRight,
  IconChevron,
  IconGrid,
  IconList,
} from "../components/icons";

type View = "grid" | "list";

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

/** One checkbox group. Collapsible, because two 17-item lists is a long rail. */
function Facet({
  legend,
  Icon,
  items,
  selected,
  onToggle,
}: {
  legend: string;
  Icon: (p: { size?: number }) => JSX.Element;
  items: [string, number][];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const chosen = items.filter(([v]) => selected.has(v)).length;

  return (
    <section className={`facet ${open ? "open" : ""}`}>
      <button
        type="button"
        className="facet-head"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon size={15} />
        <span className="facet-legend">{legend}</span>
        {chosen > 0 && <span className="facet-badge">{chosen}</span>}
        <IconChevron size={14} />
      </button>
      {open && (
        <div className="facet-list" role="group" aria-label={legend}>
          {items.map(([value, n]) => (
            <label key={value} className={`cbx ${n === 0 ? "empty" : ""}`}>
              <input
                type="checkbox"
                checked={selected.has(value)}
                onChange={() => onToggle(value)}
              />
              <span className="cbx-box" aria-hidden>
                <IconCheck size={11} />
              </span>
              <span className="cbx-label">{value}</span>
              <span className="cbx-count">{n}</span>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Browse sidebar: checkbox facets (category, region) + instant search.
 * Checkboxes are OR within a group and AND across groups. Selections are
 * mirrored into the URL (?q=&category=a,b&region=x) so views stay shareable.
 */
export default function BrowseClient({
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

  // Remembered per-browser, not per-account — a light convenience, not state
  // that needs to survive anywhere but this device.
  const [view, setView] = useState<View>("grid");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nac_browse_view");
      if (saved === "grid" || saved === "list") setView(saved);
    } catch {}
  }, []);
  function changeView(v: View) {
    setView(v);
    try {
      localStorage.setItem("nac_browse_view", v);
    } catch {}
  }

  // Show the whole taxonomy, sorted by how many sites actually use it. Empty
  // categories stay listed (dimmed) rather than vanishing — a sidebar that
  // reflows every time you tick a box is harder to use than one that doesn't,
  // and the zeroes are honest information: nobody writes about that yet.
  const catCounts = useMemo(
    () => facetCounts(sites.map((s) => s.category), CATEGORIES),
    [sites],
  );
  const regCounts = useMemo(
    () => facetCounts(sites.map((s) => s.region), REGIONS),
    [sites],
  );

  function syncUrl(next: { q?: string; cats?: Set<string>; regs?: Set<string> }) {
    const p = new URLSearchParams();
    const nq = next.q ?? q;
    const nc = next.cats ?? cats;
    const nr = next.regs ?? regs;
    if (nq) p.set("q", nq);
    if (nc.size) p.set("category", Array.from(nc).join(","));
    if (nr.size) p.set("region", Array.from(nr).join(","));
    const s = p.toString();
    window.history.replaceState(null, "", s ? `/browse?${s}` : "/browse");
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
      <aside className="dir-side" aria-label="Browse filters">
        <div className="dir-side-inner">
          <div className="side-search">
            <IconSearch size={15} />
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                syncUrl({ q: e.target.value });
              }}
              placeholder="Search sites…"
              aria-label="Search human-written sites"
            />
          </div>

          <Facet
            legend="Category"
            Icon={IconCompass}
            items={catCounts}
            selected={cats}
            onToggle={(v) => {
              const next = toggleIn(cats, v);
              setCats(next);
              syncUrl({ cats: next });
            }}
          />

          <Facet
            legend="Country / region"
            Icon={IconGlobe}
            items={regCounts}
            selected={regs}
            onToggle={(v) => {
              const next = toggleIn(regs, v);
              setRegs(next);
              syncUrl({ regs: next });
            }}
          />

          {hasFilters && (
            <button className="side-clear" onClick={clearAll}>
              <IconX size={14} /> Clear all filters
            </button>
          )}

          {/* The rules, where someone browsing is most likely to wonder what
              being on this list actually claims. */}
          <div className="side-note">
            <span className="side-note-head">
              <IconScale size={15} /> What listing means
            </span>
            <p>
              Every site here <strong>declares</strong> its writing is human. AI may polish a
              sentence — it may not write the post.
            </p>
            <ul className="side-rules">
              <li>
                <IconCheck size={13} /> Grammar, rephrasing, translation
              </li>
              <li>
                <IconX size={13} /> Whole posts from a prompt
              </li>
            </ul>
            <p className="side-note-foot">
              Listings are re-verified — remove the stamp and the site drops off.
            </p>
            <Link className="side-note-link" href="/eligibility">
              Read the full rules <IconArrowRight size={13} />
            </Link>
          </div>
        </div>
      </aside>

      <div className="dir-main">
        <div className="dir-toolbar">
          <p className="dir-count muted" role="status">
            {filtered.length} of {sites.length} site{sites.length === 1 ? "" : "s"}
          </p>
          <div className="view-toggle" role="group" aria-label="Layout">
            <button
              type="button"
              className={view === "grid" ? "on" : undefined}
              aria-pressed={view === "grid"}
              onClick={() => changeView("grid")}
            >
              <IconGrid size={15} /> Grid
            </button>
            <button
              type="button"
              className={view === "list" ? "on" : undefined}
              aria-pressed={view === "list"}
              onClick={() => changeView("list")}
            >
              <IconList size={15} /> List
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="sec-sub" style={{ textAlign: "left" }}>
            {sites.length === 0 ? (
              <>
                No sites yet. <Link href="/badge">Create your stamp</Link> and you&apos;ll appear
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
          <div className={`dir-grid ${view === "grid" ? "is-grid" : "is-list"}`}>
            {filtered.map((s, i) => (
              <a
                key={s.domain}
                className="dir-card"
                href={`https://${s.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ animationDelay: `${Math.min(i, 20) * 30}ms` }}
              >
                <img
                  className="dir-favi"
                  src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=128`}
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M2.4 9h19.2'/%3E%3Cpath d='M2.4 15h19.2'/%3E%3Cpath d='M12 2a15.5 15.5 0 0 1 0 20'/%3E%3Cpath d='M12 2a15.5 15.5 0 0 0 0 20'/%3E%3C/svg%3E";
                  }}
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
                <span className="dir-arrow">
                  <IconExternal size={16} />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
