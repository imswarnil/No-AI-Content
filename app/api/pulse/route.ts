import { NextRequest, NextResponse } from "next/server";
import { bumpMetric, getPulse } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → current stats. */
export async function GET() {
  try {
    const stats = await getPulse();
    return NextResponse.json({ ok: true, stats });
  } catch (err) {
    console.error("[pulse] get error", err);
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 500 });
  }
}

/**
 * POST { event: "visit" | "agree" | "disagree" } → increment + return stats.
 * The client keeps its own once-per-browser guards (sessionStorage for visits,
 * localStorage for the vote); the server just counts.
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}
    const event = body?.event;
    if (event === "visit") await bumpMetric("visits");
    else if (event === "agree") await bumpMetric("poll_agree");
    else if (event === "disagree") await bumpMetric("poll_disagree");
    else return NextResponse.json({ ok: false, error: "unknown event" }, { status: 400 });

    const stats = await getPulse();
    return NextResponse.json({ ok: true, stats });
  } catch (err) {
    console.error("[pulse] post error", err);
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 500 });
  }
}
