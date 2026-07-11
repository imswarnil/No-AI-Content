import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// `neon()` is an HTTP-based, serverless-friendly Postgres client — ideal for Vercel
// functions. It's created lazily on first query so an unset DATABASE_URL doesn't
// crash the build; it only errors when an API route actually runs a query.
let _sql: NeonQueryFunction<false, false> | null = null;

export const sql: NeonQueryFunction<false, false> = ((...args: any[]) => {
  if (!_sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "[no-ai-content] DATABASE_URL is not set. Add it to your environment (see .env.example).",
      );
    }
    _sql = neon(connectionString);
  }
  return (_sql as any)(...args);
}) as unknown as NeonQueryFunction<false, false>;

let schemaReady = false;

/**
 * Lazily creates the `sites` table on first use. Idempotent and safe to call
 * on every request; the CREATE runs only once per warm serverless instance.
 */
export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS sites (
      domain     TEXT PRIMARY KEY,
      author     TEXT,
      message    TEXT,
      region     TEXT,
      category   TEXT,
      first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_seen  TIMESTAMPTZ NOT NULL DEFAULT now(),
      hits       BIGINT NOT NULL DEFAULT 0
    )
  `;
  // Add columns for instances created before region/category existed.
  await sql`ALTER TABLE sites ADD COLUMN IF NOT EXISTS region TEXT`;
  await sql`ALTER TABLE sites ADD COLUMN IF NOT EXISTS category TEXT`;
  // Fetched site metadata (directory cards): page title, description, last attempt.
  await sql`ALTER TABLE sites ADD COLUMN IF NOT EXISTS title TEXT`;
  await sql`ALTER TABLE sites ADD COLUMN IF NOT EXISTS description TEXT`;
  await sql`ALTER TABLE sites ADD COLUMN IF NOT EXISTS meta_at TIMESTAMPTZ`;
  // Widget-presence verification: was the badge found on the homepage at the
  // last check? NULL = never determined (unreachable / not yet checked).
  await sql`ALTER TABLE sites ADD COLUMN IF NOT EXISTS has_widget BOOLEAN`;
  await sql`ALTER TABLE sites ADD COLUMN IF NOT EXISTS check_at TIMESTAMPTZ`;
  schemaReady = true;
}

export type SiteRow = {
  domain: string;
  author: string | null;
  message: string | null;
  region: string | null;
  category: string | null;
  title: string | null;
  description: string | null;
  has_widget: boolean | null;
  check_at: string | null;
  first_seen: string;
  last_seen: string;
  hits: string; // BIGINT comes back as a string
};

/**
 * Persist a homepage check: metadata + whether the widget was found.
 * hasWidget=null (site unreachable) keeps the previous verdict — an outage
 * shouldn't delist a site. meta_at/check_at stamp the attempt regardless so
 * dead sites aren't re-fetched on every page view.
 */
export async function saveSiteCheck(
  domain: string,
  title: string | null,
  description: string | null,
  hasWidget: boolean | null,
): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE sites
    SET title       = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        has_widget  = COALESCE(${hasWidget}, has_widget),
        meta_at     = now(),
        check_at    = now()
    WHERE domain = ${domain}
  `;
}

const TRACK_GRACE_DAYS = 7;

/**
 * Is the badge considered present right now? Listed while either:
 *  - the last homepage check found the widget (or no check has concluded yet
 *    — new sites get the benefit of the doubt until verified), or
 *  - the badge pinged /api/track within the last 7 days (covers widgets that
 *    live on inner pages the homepage check can't see).
 */
export function isWidgetPresent(s: { has_widget: boolean | null; last_seen: string }): boolean {
  if (s.has_widget !== false) return true;
  return Date.now() - new Date(s.last_seen).getTime() < TRACK_GRACE_DAYS * 24 * 3600 * 1000;
}

/** Record a badge load from a given domain. Upserts and increments the hit count. */
export async function recordHit(
  domain: string,
  author: string | null,
  message: string | null,
  region: string | null = null,
  category: string | null = null,
): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO sites (domain, author, message, region, category, hits)
    VALUES (${domain}, ${author}, ${message}, ${region}, ${category}, 1)
    ON CONFLICT (domain) DO UPDATE
      SET last_seen = now(),
          hits      = sites.hits + 1,
          author    = COALESCE(EXCLUDED.author, sites.author),
          message   = COALESCE(EXCLUDED.message, sites.message),
          region    = COALESCE(EXCLUDED.region, sites.region),
          category  = COALESCE(EXCLUDED.category, sites.category)
  `;
}

/** All embedding sites, most recently active first. */
export async function listSites(): Promise<SiteRow[]> {
  await ensureSchema();
  const rows = await sql`
    SELECT domain, author, message, region, category, title, description,
           has_widget, check_at, first_seen, last_seen, hits
    FROM sites
    ORDER BY last_seen DESC
  `;
  return rows as SiteRow[];
}
