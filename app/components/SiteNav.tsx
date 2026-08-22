"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  IconSearch,
  IconGithub,
  IconSun,
  IconMoon,
  IconX,
  IconBook,
  IconCompass,
  IconScale,
  IconShieldCheck,
} from "./icons";

/** The seal mark, inline so it stays crisp and theme-aware. */
export function SealMark({ size = 30 }: { size?: number }) {
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

/* Each item carries the icon that already stands for that idea elsewhere on
   the site — the scale is "Rules" on /eligibility, the shield is "Verify" on
   /check — so the nav teaches the vocabulary rather than inventing a second. */
const LINKS: { href: string; label: string; Icon: (p: { size?: number }) => JSX.Element }[] = [
  { href: "/manifesto", label: "Manifesto", Icon: IconBook },
  { href: "/browse", label: "Browse", Icon: IconCompass },
  { href: "/eligibility", label: "Rules", Icon: IconScale },
  { href: "/check", label: "Verify", Icon: IconShieldCheck },
];

const REPO = "https://github.com/imswarnil/No-AI-Content";

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="nav">
      <Link className="brand" href="/">
        <span className="brand-seal" aria-hidden>
          <SealMark />
        </span>
        <span className="brand-name">
          NAC<span className="brand-sub">No AI Content</span>
        </span>
      </Link>

      <nav className="nav-links" aria-label="Primary">
        {LINKS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={active ? "on" : undefined}
              /* aria-current is what actually tells a screen reader where it
                 is; the styling just hangs off the same fact. */
              aria-current={active ? "page" : undefined}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="nav-rail">
        <NavSearch />
        <ThemeToggle />
        <GithubStar />
        <Link className="btn sm nav-cta" href="/#build">
          Get your stamp
        </Link>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------
   Search — opens an inline field that filters straight to /browse?q=…, so
   there's no second index to keep in sync with the directory.
   ------------------------------------------------------------------------- */
function NavSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // "/" focuses search the way every developer tool has trained people to expect.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      className={`nav-search ${open ? "open" : ""}`}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = `/browse?q=${encodeURIComponent(q)}`;
      }}
    >
      <button
        type="button"
        className="icon-btn"
        aria-label={open ? "Close search" : "Search sites"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <IconX size={17} /> : <IconSearch size={17} />}
      </button>
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search the roll…"
        aria-label="Search human-written sites"
        tabIndex={open ? 0 : -1}
      />
    </form>
  );
}

/* -------------------------------------------------------------------------
   Theme toggle — writes data-theme on <html>, which is the same hook both
   base.css and nac-theme.css already switch on. Remembered in
   localStorage; absent a choice, the OS decides.
   ------------------------------------------------------------------------- */
function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("nac_theme") as "light" | "dark" | null;
    const initial =
      saved ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
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
      {/* Before hydration `theme` is null — render the sun so the markup is
          stable and the button never flashes the wrong icon. */}
      {theme === "dark" ? <IconMoon size={17} /> : <IconSun size={17} />}
    </button>
  );
}

/* -------------------------------------------------------------------------
   GitHub star — shows the live count when GitHub answers, and stays a plain
   star link when it doesn't (rate limits, offline, blocked).
   ------------------------------------------------------------------------- */
function GithubStar() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("https://api.github.com/repos/imswarnil/No-AI-Content")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j && typeof j.stargazers_count === "number") setStars(j.stargazers_count);
      })
      .catch(() => {
        /* no count is fine — the link still works */
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <a
      className="star-btn"
      href={`${REPO}/stargazers`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={stars === null ? "Star NAC on GitHub" : `Star NAC on GitHub — ${stars} stars`}
      title="Star on GitHub"
    >
      <IconGithub size={16} />
      <span className="star-label">Star</span>
      {stars !== null && <span className="star-count">{stars.toLocaleString()}</span>}
    </a>
  );
}
