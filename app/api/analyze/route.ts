import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Honest "human-ness review". This does NOT claim to definitively detect AI —
 * reliable AI-content detection is not possible, and detectors routinely
 * false-flag real human writing. Instead we fetch the page text and ask Claude
 * for a qualitative assessment with specific, constructive feedback and a soft
 * verdict, clearly labelled as guidance.
 */

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: {
      type: "string",
      enum: ["reads_human", "mixed_signals", "reads_ai_generated"],
      description: "Soft, non-definitive verdict.",
    },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    summary: { type: "string", description: "1-2 sentence plain-language summary." },
    strengths: {
      type: "array",
      items: { type: "string" },
      description: "Signals that read as genuinely human.",
    },
    improvements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          issue: { type: "string", description: "Where it reads generic / AI-like." },
          fix: { type: "string", description: "Concrete way to add human personalization." },
        },
        required: ["issue", "fix"],
      },
    },
  },
  required: ["verdict", "confidence", "summary", "strengths", "improvements"],
} as const;

function cleanUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let u = raw.trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/** Fetch the page and reduce to visible-ish text. */
async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "NoAIContentBot/1.0 (+https://noaicontent)" },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Site returned ${res.status}`);
  const html = await res.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 12000);
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "The analyzer is not configured (missing ANTHROPIC_API_KEY)." },
        { status: 501 },
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {}
    const url = cleanUrl(body?.url);
    if (!url) {
      return NextResponse.json({ ok: false, error: "Please enter a valid website URL." }, { status: 400 });
    }

    let text: string;
    try {
      text = await fetchText(url);
    } catch (e: any) {
      return NextResponse.json(
        { ok: false, error: `Couldn't read that page: ${e.message || "fetch failed"}` },
        { status: 422 },
      );
    }
    if (text.length < 400) {
      return NextResponse.json(
        { ok: false, error: "There wasn't enough readable text on that page to assess." },
        { status: 422 },
      );
    }

    const client = new Anthropic();
    const prompt = `You are reviewing writing for the "No AI Content" project, which celebrates human-written blogs. A human uses AI only to refine (grammar, tightening, translating), never to generate whole posts.

IMPORTANT: You cannot definitively detect AI. Detectors are unreliable and false-flag real humans (especially non-native English). Do NOT pretend certainty. Give a QUALITATIVE, constructive assessment: point to specific passages that read generic/templated/AI-like, and give concrete ways to add human personalization (personal anecdote, specific opinion, first-hand detail, distinctive voice). Be encouraging and fair — a plain, competent human writer should read as human.

Page text follows (may be truncated):
"""
${text}
"""

Return the structured assessment.`;

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 2000,
      thinking: { type: "adaptive" },
      output_config: { format: { type: "json_schema", schema: SCHEMA as any } },
      messages: [{ role: "user", content: prompt }],
    } as any);

    const textBlock = response.content.find((b: any) => b.type === "text") as any;
    const result = JSON.parse(textBlock?.text ?? "{}");

    return NextResponse.json({ ok: true, url, result });
  } catch (err: any) {
    console.error("[analyze] error", err);
    return NextResponse.json(
      { ok: false, error: "The analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
