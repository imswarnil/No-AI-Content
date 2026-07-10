import { NextRequest, NextResponse } from "next/server";
import { detectAI } from "@/lib/detect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let u = raw.trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try {
    const p = new URL(u);
    return p.protocol === "http:" || p.protocol === "https:" ? p.toString() : null;
  } catch {
    return null;
  }
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "NAC-Bot/1.0 (+https://nac.imswarnil.com)" },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Site returned ${res.status}`);
  const html = await res.text();
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20000);
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    // Direct text takes priority; otherwise fetch the URL.
    let text: string | null =
      typeof body?.text === "string" && body.text.trim().length > 0 ? body.text : null;
    let source = "text";

    if (!text) {
      const url = cleanUrl(body?.url);
      if (!url) {
        return NextResponse.json(
          { ok: false, error: "Provide some text, or a valid URL." },
          { status: 400 },
        );
      }
      try {
        text = await fetchText(url);
        source = url;
      } catch (e: any) {
        return NextResponse.json(
          { ok: false, error: `Couldn't read that page: ${e.message || "fetch failed"}` },
          { status: 422 },
        );
      }
    }

    if (!text || text.trim().split(/\s+/).length < 40) {
      return NextResponse.json(
        { ok: false, error: "Not enough text to analyze (need ~40+ words)." },
        { status: 422 },
      );
    }

    const result = detectAI(text);
    return NextResponse.json({ ok: true, source, result });
  } catch (err) {
    console.error("[detect] error", err);
    return NextResponse.json({ ok: false, error: "Detection failed." }, { status: 500 });
  }
}
