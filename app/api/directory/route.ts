import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PUBLIC endpoint: the roll of sites displaying the badge.
 * Returns domain + author only (no counts, no timestamps beyond join date) so it
 * can be shown openly. Domains are already public — the badge is on a public page.
 */
export async function GET() {
  try {
    await ensureSchema();
    const rows = (await sql`
      SELECT domain, author, first_seen
      FROM sites
      ORDER BY first_seen ASC
    `) as { domain: string; author: string | null; first_seen: string }[];

    return NextResponse.json(
      { ok: true, count: rows.length, sites: rows },
      { headers: { "Cache-Control": "public, max-age=60" } }
    );
  } catch (err) {
    console.error("[directory] error", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
