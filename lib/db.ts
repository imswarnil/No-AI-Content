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
      first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_seen  TIMESTAMPTZ NOT NULL DEFAULT now(),
      hits       BIGINT NOT NULL DEFAULT 0
    )
  `;
  schemaReady = true;
}

export type SiteRow = {
  domain: string;
  author: string | null;
  message: string | null;
  first_seen: string;
  last_seen: string;
  hits: string; // BIGINT comes back as a string
};

/** Record a badge load from a given domain. Upserts and increments the hit count. */
export async function recordHit(
  domain: string,
  author: string | null,
  message: string | null,
): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO sites (domain, author, message, hits)
    VALUES (${domain}, ${author}, ${message}, 1)
    ON CONFLICT (domain) DO UPDATE
      SET last_seen = now(),
          hits      = sites.hits + 1,
          author    = COALESCE(EXCLUDED.author, sites.author),
          message   = COALESCE(EXCLUDED.message, sites.message)
  `;
}

/** All embedding sites, most recently active first. */
export async function listSites(): Promise<SiteRow[]> {
  await ensureSchema();
  const rows = await sql`
    SELECT domain, author, message, first_seen, last_seen, hits
    FROM sites
    ORDER BY last_seen DESC
  `;
  return rows as SiteRow[];
}
