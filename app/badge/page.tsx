"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import WidgetPreview from "../components/WidgetPreview";
import { IconCheck, IconX } from "../components/icons";
import { PRESETS, STYLES, escapeAttr, type Style } from "@/lib/badge";
import { CATEGORIES, REGIONS } from "@/lib/taxonomy";

export default function BadgePage() {
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState(PRESETS[0]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [style, setStyle] = useState<Style>("stamp");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    // Arriving from a style card in the homepage gallery — preselect it.
    const wanted = new URLSearchParams(window.location.search).get("style");
    if (wanted && STYLES.some((s) => s.key === wanted)) setStyle(wanted as Style);
  }, []);

  /* The snippet people copy must point at the PUBLIC instance, never at
     whatever origin the builder happens to be open on — see the widget.js
     comment in lib/badge.ts for why. The live preview still uses `origin` so
     local development renders against the local copy. */
  const publicOrigin = (
    process.env.NEXT_PUBLIC_SITE_URL || origin || "https://nac.imswarnil.com"
  ).replace(/\/+$/, "");

  const embedCode = useMemo(() => {
    const attrs = [
      `src="${publicOrigin}/widget.js"`,
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
  }, [publicOrigin, author, message, style, theme, region, category]);

  async function copy() {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="badge-page">
      <div className="badge-page-head">
        <div>
          <h1>Build your badge.</h1>
          <p>Nothing is stored until you paste the snippet on your own site.</p>
        </div>
        <Link className="icon-btn" href="/" aria-label="Close">
          <IconX size={18} />
        </Link>
      </div>

      <div className="badge-page-body">
        <div className="panel">
          <div className="panel-body">
            <div className="field">
              <label htmlFor="nac-author">Your name or brand</label>
              <input
                id="nac-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>

            <div className="field">
              <label htmlFor="nac-preset">What it says</label>
              <select
                id="nac-preset"
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
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-label="Badge message"
                style={{ marginTop: "var(--space-2)" }}
              />
            </div>

            <div className="row">
              <div className="field">
                <label htmlFor="nac-style">Style</label>
                <select id="nac-style" value={style} onChange={(e) => setStyle(e.target.value as Style)}>
                  {STYLES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="nac-badge-theme">Badge theme</label>
                <select
                  id="nac-badge-theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as "light" | "dark")}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label htmlFor="nac-region">Country or region</label>
                <input
                  id="nac-region"
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
              <div className="field">
                <label htmlFor="nac-category">Topic</label>
                <input
                  id="nac-category"
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
            <p className="field-hint">
              Region and topic become filters on the <Link href="/browse">Browse page</Link>.
            </p>
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panel-head">
              <h3>Live preview</h3>
              <span className="badge accent">This is the real embed</span>
            </div>
            <div className="panel-body">
              <div className={`preview-stage ${theme}`}>
                <WidgetPreview origin={origin} style={style} theme={theme} author={author} message={message} />
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h3>Your snippet</h3>
              <button className="btn primary sm" onClick={copy}>
                {copied ? (
                  <>
                    <IconCheck size={13} /> Copied
                  </>
                ) : (
                  "Copy"
                )}
              </button>
            </div>
            <div className="panel-body">
              <pre>{embedCode}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
