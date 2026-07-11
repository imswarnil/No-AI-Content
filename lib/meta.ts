/**
 * Fetches a site's homepage once and extracts (a) public metadata (title +
 * description) for richer directory cards, and (b) whether the NAC widget
 * <script> is still present — the directory only lists sites where it is.
 * Results are cached in the `sites` table.
 *
 * `hasWidget` is tri-state: true/false when the homepage was readable, null
 * when the site couldn't be reached (unknown — keep the previous verdict; an
 * outage shouldn't delist anyone).
 */

export type SiteMeta = {
  title: string | null;
  description: string | null;
  hasWidget: boolean | null;
};

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

function decode(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

/** <meta name|property="key" content="..."> — tolerates either attribute order. */
function metaContent(html: string, key: string): string | null {
  const k = key.replace(/[:]/g, "\\$&");
  const a = html.match(
    new RegExp(`<meta[^>]+(?:name|property)=["']${k}["'][^>]*content=["']([^"']+)["']`, "i"),
  );
  if (a) return decode(a[1]);
  const b = html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:name|property)=["']${k}["']`, "i"),
  );
  return b ? decode(b[1]) : null;
}

export async function fetchSiteMeta(domain: string): Promise<SiteMeta> {
  try {
    const res = await fetch(`https://${domain}`, {
      headers: { "User-Agent": "NAC-Bot/1.0 (+https://nac.imswarnil.com)" },
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return { title: null, description: null, hasWidget: null };
    // Metadata lives in <head>; 200 KB is plenty and bounds memory.
    const html = (await res.text()).slice(0, 200_000);

    // The embed is `<script src="…/widget.js" data-…>` — a script tag whose
    // src ends in widget.js is our badge (any host, so localhost/self-hosted
    // NAC instances verify too).
    const hasWidget = /<script[^>]+src=["'][^"']*\/widget\.js[^"']*["']/i.test(html);

    const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title =
      metaContent(html, "og:site_name") ||
      metaContent(html, "og:title") ||
      (titleTag ? decode(titleTag[1]) : null);
    const description =
      metaContent(html, "description") || metaContent(html, "og:description");

    return {
      title: title ? title.slice(0, 120) : null,
      description: description ? description.slice(0, 220) : null,
      hasWidget,
    };
  } catch {
    return { title: null, description: null, hasWidget: null };
  }
}
