import { NextResponse } from "next/server";
import { sql, ensureSchema, isWidgetPresent } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PUBLIC endpoint: the roll of sites displaying the badge.
 * Returns domain, author and the self-declared region/category (no counts, no
 * timestamps beyond join date) so it can be shown openly. Domains are already
 * public — the badge is on a public page.
 */
export async function GET() {
  try {
    await ensureSchema();
    const rows = (await sql`
      SELECT domain, author, region, category, title, description, first_seen,
             has_widget, last_seen
      FROM sites
      ORDER BY first_seen ASC
    `) as {
      domain: string;
      author: string | null;
      region: string | null;
      category: string | null;
      title: string | null;
      description: string | null;
      first_seen: string;
      has_widget: boolean | null;
      last_seen: string;
    }[];

    // Same rule as the directory page: only sites whose widget is present now.
    const sites = rows
      .filter(isWidgetPresent)
      .map(({ has_widget, last_seen, ...s }) => s);

    return NextResponse.json(
      { ok: true, count: sites.length, sites },
      { headers: { "Cache-Control": "public, max-age=60" } }
    );
  } catch (err) {
    console.error("[directory] error", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
