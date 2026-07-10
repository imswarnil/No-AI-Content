import { NextRequest, NextResponse } from "next/server";
import { listSites } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: returns all embedding sites. Requires the ADMIN_TOKEN. */
export async function GET(req: NextRequest) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "ADMIN_TOKEN not configured" }, { status: 500 });
  }

  const provided =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    req.nextUrl.searchParams.get("token");

  if (provided !== token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const sites = await listSites();
  const totalHits = sites.reduce((sum, s) => sum + Number(s.hits), 0);
  return NextResponse.json({ ok: true, count: sites.length, totalHits, sites });
}
