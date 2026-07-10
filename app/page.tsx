"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function Home() {
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState(
    "This content is written by a human. No AI-generated content.",
  );
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const embedCode = useMemo(() => {
    const attrs = [
      `src="${origin}/widget.js"`,
      author ? `data-author="${escapeAttr(author)}"` : "",
      `data-message="${escapeAttr(message)}"`,
      `data-theme="${theme}"`,
      "async",
    ]
      .filter(Boolean)
      .join("\n  ");
    return `<script\n  ${attrs}\n></script>`;
  }, [origin, author, message, theme]);

  // Live preview: re-render the actual widget whenever inputs change.
  useEffect(() => {
    const el = previewRef.current;
    if (!el || !origin) return;
    el.innerHTML = "";
    const s = document.createElement("script");
    s.src = `${origin}/widget.js`;
    if (author) s.setAttribute("data-author", author);
    s.setAttribute("data-message", message);
    s.setAttribute("data-theme", theme);
    s.setAttribute("data-preview", "1"); // widget still tracks; that's fine for your own domain
    el.appendChild(s);
  }, [origin, author, message, theme]);

  async function copy() {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="container">
      <div className="hero">
        <h1>🌱 No AI Content</h1>
        <p>
          A free, open-source badge that lets authors publicly declare their work is
          human-written. Customize it, copy the snippet, and paste it on your site.
        </p>
        <p className="muted">
          Privacy-friendly: the badge only records the <strong>domain</strong> it runs on —
          no visitor tracking, no cookies, no personal data.
        </p>
      </div>

      <div className="card">
        <h2>1. Customize your badge</h2>
        <div className="row">
          <div>
            <label>Author / brand name (optional)</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label>Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark")}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
        <label>Message</label>
        <textarea value={message} rows={2} onChange={(e) => setMessage(e.target.value)} />

        <label>Live preview</label>
        <div className="preview-area" ref={previewRef} />
      </div>

      <div className="card">
        <h2>2. Copy this snippet into your site</h2>
        <p className="muted">Paste it anywhere in your HTML — a footer, an about page, a blog post.</p>
        <pre>{embedCode}</pre>
        <div style={{ marginTop: 16 }}>
          <button className="btn" onClick={copy}>
            {copied ? "✓ Copied!" : "Copy embed code"}
          </button>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 32 }}>
        Are you the operator of this instance?{" "}
        <a href="/dashboard">View the usage dashboard →</a>
      </p>
    </main>
  );
}

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
