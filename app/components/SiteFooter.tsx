import Link from "next/link";
import { IconGithub } from "./icons";
import { SealMark, REPO } from "./SiteHeader";

const COLUMNS: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: "The project",
    links: [
      { href: "/manifesto", label: "Manifesto" },
      { href: "/eligibility", label: "What counts as human-written" },
      { href: "/#styles", label: "Badge styles" },
    ],
  },
  {
    title: "Use it",
    links: [
      { href: "/#build", label: "Create your badge" },
      { href: "/check", label: "Verify your writing" },
      { href: "/browse", label: "Browse the roll" },
    ],
  },
  {
    title: "Open source",
    links: [
      { href: REPO, label: "Source on GitHub", external: true },
      { href: `${REPO}/blob/main/LICENSE`, label: "MIT licence", external: true },
      { href: "/dashboard", label: "Usage dashboard" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <Link className="brand" href="/">
            <SealMark size={26} />
            <span className="brand-text">
              <strong>NAC</strong>
              <span>No AI Content</span>
            </span>
          </Link>
          <p>
            A badge for people who still write their own words. Free, open source, and
            privacy-first — only the embedding domain is recorded. No cookies, no visitor
            tracking.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <nav className="footer-col" key={col.title} aria-label={col.title}>
            <h2>{col.title}</h2>
            <ul>
              {col.links.map((l) =>
                l.external ? (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  </li>
                ) : (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ),
              )}
            </ul>
          </nav>
        ))}
      </div>

      <div className="site-footer-bar">
        <span>© {new Date().getFullYear()} NAC — No AI Content. MIT licensed.</span>
        <a href={REPO} target="_blank" rel="noopener noreferrer">
          <IconGithub size={14} /> GitHub
        </a>
      </div>
    </footer>
  );
}
