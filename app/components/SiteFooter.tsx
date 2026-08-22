import Link from "next/link";
import { IconFeather, IconGithub } from "./icons";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <p>
        <IconFeather size={14} /> <strong>NAC — No AI Content</strong>. Free &amp; open source. Only
        the embedding domain is recorded; no cookies, no visitor tracking.
      </p>
      <p className="muted">
        <Link href="/manifesto">Manifesto</Link> · <Link href="/browse">Browse</Link> ·{" "}
        <Link href="/eligibility">Rules</Link> · <Link href="/check">Verify</Link> ·{" "}
        <Link href="/dashboard">Dashboard</Link> ·{" "}
        <a href="https://github.com/imswarnil/No-AI-Content" target="_blank" rel="noreferrer">
          <IconGithub size={13} /> GitHub
        </a>
      </p>
    </footer>
  );
}
