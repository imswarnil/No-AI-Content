/**
 * Fetches a site's public metadata (title + description) for richer directory
 * cards. Results are cached in the `sites` table (`meta_at` stamps the attempt,
 * even on failure, so a dead site isn't re-fetched on every page view).
 */

export type SiteMeta = { title: string | null; description: string | null };

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
    if (!res.ok) return { title: null, description: null };
    // Metadata lives in <head>; 200 KB is plenty and bounds memory.
    const html = (await res.text()).slice(0, 200_000);

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
    };
  } catch {
    return { title: null, description: null };
  }
}
