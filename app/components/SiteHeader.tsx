"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconSun, IconMoon, IconGithub, IconX } from "./icons";

/** The seal mark, inline so it stays crisp and follows the accent token. */
export function SealMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden focusable="false">
      <rect width="32" height="32" rx="7" fill="var(--accent)" />
      <circle
        cx="16"
        cy="16"
        r="11.5"
        fill="none"
        stroke="rgba(255,255,255,.9)"
        strokeWidth="1.6"
        strokeDasharray="3.1 2.2"
      />
      <path
        d="M16 8.6c2.5 0 4.1 3.4 4.1 6.6L16 20.4l-4.1-5.2c0-3.2 1.6-6.6 4.1-6.6Z"
        fill="none"
        stroke="#fff"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path d="M16 13.4v6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="16" cy="13" r="1.4" fill="#fff" />
    </svg>
  );
}

export const REPO = "https://github.com/imswarnil/No-AI-Content";

const LINKS = [
  { href: "/manifesto", label: "Manifesto" },
  { href: "/browse", label: "Browse" },
  { href: "/eligibility", label: "Rules" },
  { href: "/check", label: "Verify" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation, otherwise it covers the page you
  // just opened.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className={`site-nav ${open ? "open" : ""}`}>
      <div className="site-nav-inner">
        <Link className="brand" href="/">
          <SealMark />
          <span className="brand-text">
            <strong>NAC</strong>
            <span>No AI Content</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={active ? "on" : undefined}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="nav-actions">
          <ThemeToggle />
          <a
            className="icon-btn"
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="NAC on GitHub"
          >
            <IconGithub size={17} />
          </a>
          <Link className="btn primary nav-cta" href="/#build">
            Get the badge
          </Link>
          <button
            type="button"
            className="icon-btn nav-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <IconX size={18} /> : <MenuGlyph />}
          </button>
        </div>
      </div>
    </header>
  );
}

function MenuGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden focusable="false">
      <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* Theme toggle — writes data-theme on <html>, the same hook base.css switches
   on. The pre-paint script in layout.tsx sets it before first paint, so this
   only has to handle the flip. */
function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    setTheme(attr === "dark" ? "dark" : "light");
  }, []);

  function flip() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("nac_theme", next);
  }

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={flip}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? <IconMoon size={17} /> : <IconSun size={17} />}
    </button>
  );
}
