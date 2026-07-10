import { NextRequest, NextResponse } from "next/server";
import { recordHit } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/** Normalize a hostname: strip protocol, path, port, leading "www." and lowercase. */
function cleanDomain(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let d = raw.trim().toLowerCase();
  if (!d) return null;
  d = d.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
  d = d.replace(/^www\./, "");
  // Basic sanity: must contain a dot or be localhost.
  if (d !== "localhost" && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)) return null;
  return d.slice(0, 253);
}

export async function POST(req: NextRequest) {
  try {
    // sendBeacon sends text; parse defensively.
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const domain = cleanDomain(body?.domain);
    if (!domain) {
      return NextResponse.json({ ok: false, error: "invalid domain" }, { status: 400, headers: CORS });
    }

    const author = typeof body?.author === "string" ? body.author.slice(0, 120) : null;
    const message = typeof body?.message === "string" ? body.message.slice(0, 300) : null;

    await recordHit(domain, author, message);
    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch (err) {
    console.error("[track] error", err);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500, headers: CORS });
  }
}
