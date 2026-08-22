"use client";

import { useEffect, useState } from "react";
import {
  BrandX,
  BrandBluesky,
  BrandThreads,
  BrandMastodon,
  BrandLinkedIn,
  BrandFacebook,
  BrandReddit,
  BrandHN,
  BrandWhatsApp,
  BrandTelegram,
  BrandPinterest,
  IconMail,
  IconCopy,
  IconCheck,
  IconDownload,
  IconShare,
} from "./icons";

const TEXT =
  "I stand with human-written blogs. NAC is a free, open-source stamp that says a human is behind the words —";

/**
 * Share the movement — 15 ways. Every target opens a prefilled composer;
 * nothing here talks to any platform's API, so there's nothing to configure.
 */
export default function Share() {
  const [url, setUrl] = useState("https://nac.imswarnil.com");
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin);
    setCanNative(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const eu = encodeURIComponent(url);
  const et = encodeURIComponent(TEXT);
  const both = encodeURIComponent(`${TEXT} ${url}`);

  type Target = { key: string; label: string; Glyph: (p: { size?: number }) => JSX.Element; href: string };

  const targets: Target[] = [
    { key: "x", label: "X / Twitter", Glyph: BrandX, href: `https://twitter.com/intent/tweet?text=${et}&url=${eu}` },
    { key: "bluesky", label: "Bluesky", Glyph: BrandBluesky, href: `https://bsky.app/intent/compose?text=${both}` },
    { key: "threads", label: "Threads", Glyph: BrandThreads, href: `https://www.threads.net/intent/post?text=${both}` },
    { key: "mastodon", label: "Mastodon", Glyph: BrandMastodon, href: `https://mastodonshare.com/?text=${et}&url=${eu}` },
    { key: "linkedin", label: "LinkedIn", Glyph: BrandLinkedIn, href: `https://www.linkedin.com/sharing/share-offsite/?url=${eu}` },
    { key: "facebook", label: "Facebook", Glyph: BrandFacebook, href: `https://www.facebook.com/sharer/sharer.php?u=${eu}` },
    { key: "reddit", label: "Reddit", Glyph: BrandReddit, href: `https://www.reddit.com/submit?url=${eu}&title=${et}` },
    { key: "hn", label: "Hacker News", Glyph: BrandHN, href: `https://news.ycombinator.com/submitlink?u=${eu}&t=${encodeURIComponent("NAC — a stamp for human-written blogs")}` },
    { key: "whatsapp", label: "WhatsApp", Glyph: BrandWhatsApp, href: `https://wa.me/?text=${both}` },
    { key: "telegram", label: "Telegram", Glyph: BrandTelegram, href: `https://t.me/share/url?url=${eu}&text=${et}` },
    { key: "pinterest", label: "Pinterest", Glyph: BrandPinterest, href: `https://pinterest.com/pin/create/button/?url=${eu}&media=${encodeURIComponent(url + "/logo.svg")}&description=${et}` },
    { key: "email", label: "Email", Glyph: IconMail, href: `mailto:?subject=${encodeURIComponent("A stamp for human-written blogs")}&body=${both}` },
  ];

  async function copy() {
    await navigator.clipboard.writeText(`${TEXT} ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function downloadLogo() {
    const a = document.createElement("a");
    a.href = "/logo.svg";
    a.download = "nac-no-ai-content.svg";
    a.click();
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: "NAC — No AI Content", text: TEXT, url });
    } catch {
      /* user dismissed */
    }
  }

  return (
    <div className="share-grid" role="list" aria-label="Share NAC">
      {targets.map((t) => (
        <a
          key={t.key}
          role="listitem"
          className="share-tile"
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="share-glyph">
            <t.Glyph size={19} />
          </span>
          <span className="share-label">{t.label}</span>
        </a>
      ))}
      <button className="share-tile" onClick={copy} type="button">
        <span className="share-glyph">
          {copied ? <IconCheck size={19} /> : <IconCopy size={19} />}
        </span>
        <span className="share-label">{copied ? "Copied!" : "Copy link"}</span>
      </button>
      <button className="share-tile" onClick={downloadLogo} type="button">
        <span className="share-glyph">
          <IconDownload size={19} />
        </span>
        <span className="share-label">Logo as image</span>
      </button>
      {canNative && (
        <button className="share-tile" onClick={nativeShare} type="button">
          <span className="share-glyph">
            <IconShare size={19} />
          </span>
          <span className="share-label">More…</span>
        </button>
      )}
    </div>
  );
}
