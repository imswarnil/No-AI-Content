/**
 * NAC heuristic "AI-likeness" engine — YOUR logic, no API.
 *
 * ⚠️ This is a transparent signal scorer, NOT a proof of AI authorship. No
 * heuristic can reliably detect AI text — they all false-flag real humans.
 * Treat the score as guidance and tune the weights/lists below freely.
 *
 * Each signal returns an `aiLikeness` in [0,1] (0 = very human, 1 = very AI).
 * The final score is a weighted average, 0–100. Everything here is data you
 * can edit: WEIGHTS, and the word/phrase lists.
 */

// ------------------------------------------------------------------ tunables

export const WEIGHTS = {
  cliches: 0.18, // stock AI phrases ("in today's fast-paced world")
  llmVocab: 0.16, // words LLMs overuse ("delve", "tapestry", "leverage")
  transitions: 0.11, // formal connectors ("moreover", "furthermore")
  burstiness: 0.16, // sentence-length variety (humans vary a lot)
  personalVoice: 0.13, // first-person + concrete specifics
  contractions: 0.09, // humans contract ("don't"); formal AI expands
  filler: 0.07, // intensifiers/hedges ("very", "crucial", "various")
  punctuation: 0.05, // em-dash / semicolon habit (LLMs love "—")
  starters: 0.05, // many sentences opening with the same word ("The… The… This…")
};

export const CLICHES = [
  "in today's fast-paced world",
  "in the ever-evolving",
  "it's important to note",
  "it is important to note",
  "when it comes to",
  "at the end of the day",
  "plays a crucial role",
  "plays a vital role",
  "a testament to",
  "in the realm of",
  "in conclusion",
  "in summary",
  "navigating the",
  "the world of",
  "a game-changer",
  "game changer",
  "unlock the potential",
  "unleash the power",
  "in this article",
  "in this blog post",
  "let's dive in",
  "dive into",
  "on the other hand",
  "as a result",
  "more than ever",
  "the digital age",
];

export const LLM_VOCAB = [
  "delve",
  "tapestry",
  "realm",
  "landscape",
  "leverage",
  "leveraging",
  "underscore",
  "underscores",
  "testament",
  "intricate",
  "intricacies",
  "pivotal",
  "boasts",
  "seamless",
  "seamlessly",
  "robust",
  "holistic",
  "myriad",
  "plethora",
  "endeavor",
  "utilize",
  "utilizing",
  "facilitate",
  "elevate",
  "embark",
  "unlock",
  "foster",
  "harness",
  "showcasing",
  "vibrant",
  "bustling",
  "meticulous",
  "meticulously",
  "cornerstone",
  "paramount",
  "multifaceted",
  "nuanced",
  "profound",
  "transformative",
];

export const TRANSITIONS = [
  "however",
  "moreover",
  "furthermore",
  "additionally",
  "consequently",
  "therefore",
  "thus",
  "hence",
  "nonetheless",
  "notably",
  "importantly",
  "ultimately",
  "overall",
  "subsequently",
  "accordingly",
  "indeed",
];

export const FILLER = [
  "very",
  "really",
  "quite",
  "actually",
  "basically",
  "literally",
  "various",
  "numerous",
  "significant",
  "crucial",
  "essential",
  "vital",
  "key",
  "comprehensive",
  "valuable",
  "effective",
  "innovative",
  "cutting-edge",
];

export const FIRST_PERSON = [
  "i",
  "me",
  "my",
  "mine",
  "myself",
  "we",
  "us",
  "our",
  "ours",
];

// ------------------------------------------------------------------ types

export type Signal = {
  key: string;
  label: string;
  detail: string;
  aiLikeness: number; // 0..1
  weight: number;
  lean: "ai" | "human" | "neutral";
};

export type Match = { phrase: string; count: number; kind: "cliche" | "vocab" };

export type Detection = {
  score: number; // 0..100 (higher = more AI-like)
  verdict: "reads_human" | "mixed_signals" | "reads_ai_generated";
  confidence: "low" | "medium" | "high";
  signals: Signal[]; // sorted by contribution, descending
  matches: Match[]; // the actual flagged phrases/words, most frequent first
  stats: {
    words: number;
    sentences: number;
    avgSentenceLen: number;
    burstiness: number; // coefficient of variation of sentence length
    uniqueRatio: number;
  };
};

// ------------------------------------------------------------------ helpers

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/\b[\p{L}'’-]+\b/gu) || []) as string[];
}
function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+(?:\s+|$)/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 2);
}
function countWords(tokens: string[], set: Set<string>): number {
  let n = 0;
  for (const t of tokens) if (set.has(t)) n++;
  return n;
}
function collectMatches(
  lower: string,
  tokens: string[],
): { matches: Match[]; clicheN: number; vocabN: number } {
  const tally = new Map<string, Match>();
  let clicheN = 0;
  for (const p of CLICHES) {
    let idx = lower.indexOf(p);
    let n = 0;
    while (idx !== -1) {
      n++;
      idx = lower.indexOf(p, idx + p.length);
    }
    if (n > 0) {
      clicheN += n;
      tally.set(p, { phrase: p, count: n, kind: "cliche" });
    }
  }
  const vocabSet = new Set(LLM_VOCAB);
  let vocabN = 0;
  for (const t of tokens) {
    if (!vocabSet.has(t)) continue;
    vocabN++;
    const cur = tally.get(t);
    if (cur) cur.count++;
    else tally.set(t, { phrase: t, count: 1, kind: "vocab" });
  }
  const matches = Array.from(tally.values()).sort((a, b) => b.count - a.count);
  return { matches, clicheN, vocabN };
}
function lean(ai: number): Signal["lean"] {
  return ai >= 0.55 ? "ai" : ai <= 0.35 ? "human" : "neutral";
}

// ------------------------------------------------------------------ engine

export function detectAI(raw: string): Detection {
  const text = (raw || "").replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();
  const tokens = tokenize(text);
  const sentences = splitSentences(text);
  const words = tokens.length;

  // Sentence-length burstiness (coefficient of variation).
  const lens = sentences.map((s) => s.split(/\s+/).length);
  const mean = lens.reduce((a, b) => a + b, 0) / (lens.length || 1);
  const variance = lens.reduce((a, b) => a + (b - mean) ** 2, 0) / (lens.length || 1);
  const burstiness = mean > 0 ? Math.sqrt(variance) / mean : 0.5;

  const per1k = (count: number) => (words ? (count / words) * 1000 : 0);
  const uniqueRatio = words ? new Set(tokens).size / words : 0;

  // --- signals ---
  const { matches, clicheN, vocabN } = collectMatches(lower, tokens);
  const clicheDens = per1k(clicheN);
  const sCliches: Signal = {
    key: "cliches",
    label: "AI cliché phrases",
    detail: `${clicheN} found (${clicheDens.toFixed(1)}/1k words)`,
    aiLikeness: clamp01(clicheDens / 6),
    weight: WEIGHTS.cliches,
    lean: lean(clamp01(clicheDens / 6)),
  };

  const vocabDens = per1k(vocabN);
  const sVocab: Signal = {
    key: "llmVocab",
    label: "LLM-favored vocabulary",
    detail: `${vocabN} found (${vocabDens.toFixed(1)}/1k words)`,
    aiLikeness: clamp01(vocabDens / 8),
    weight: WEIGHTS.llmVocab,
    lean: lean(clamp01(vocabDens / 8)),
  };

  const transN = countWords(tokens, new Set(TRANSITIONS));
  const transDens = per1k(transN);
  const sTrans: Signal = {
    key: "transitions",
    label: "Formal transition words",
    detail: `${transN} found (${transDens.toFixed(1)}/1k words)`,
    aiLikeness: clamp01(transDens / 18),
    weight: WEIGHTS.transitions,
    lean: lean(clamp01(transDens / 18)),
  };

  // Low burstiness (uniform sentences) reads AI. CV ~0.7 human, ~0.25 AI.
  const burstAi = clamp01((0.7 - burstiness) / 0.5);
  const sBurst: Signal = {
    key: "burstiness",
    label: "Sentence-length variety",
    detail:
      burstiness < 0.4
        ? "Very uniform sentence lengths"
        : burstiness < 0.6
          ? "Somewhat uniform"
          : "Natural, varied rhythm",
    aiLikeness: burstAi,
    weight: WEIGHTS.burstiness,
    lean: lean(burstAi),
  };

  const fpN = countWords(tokens, new Set(FIRST_PERSON));
  // Concrete specifics (numbers, years) also read human.
  const numN = (text.match(/\b\d[\d,.]*\b/g) || []).length;
  const voiceDens = per1k(fpN + numN);
  const voiceAi = clamp01(1 - voiceDens / 22);
  const sVoice: Signal = {
    key: "personalVoice",
    label: "Personal voice & specifics",
    detail: `${fpN} first-person, ${numN} concrete numbers`,
    aiLikeness: voiceAi,
    weight: WEIGHTS.personalVoice,
    lean: lean(voiceAi),
  };

  const contrN = (text.match(/[a-z]['’](t|s|re|ve|ll|d|m)\b/gi) || []).length;
  const contrDens = per1k(contrN);
  const contrAi = clamp01(1 - contrDens / 14);
  const sContr: Signal = {
    key: "contractions",
    label: "Contractions",
    detail: `${contrN} found (${contrDens.toFixed(1)}/1k words)`,
    aiLikeness: contrAi,
    weight: WEIGHTS.contractions,
    lean: lean(contrAi),
  };

  const fillerN = countWords(tokens, new Set(FILLER));
  const fillerDens = per1k(fillerN);
  const sFiller: Signal = {
    key: "filler",
    label: "Filler / intensifiers",
    detail: `${fillerN} found (${fillerDens.toFixed(1)}/1k words)`,
    aiLikeness: clamp01(fillerDens / 22),
    weight: WEIGHTS.filler,
    lean: lean(clamp01(fillerDens / 22)),
  };

  // Em-dash / semicolon habit. LLMs reach for "—" far more than most bloggers.
  const dashN = (text.match(/—|--/g) || []).length + (text.match(/;/g) || []).length;
  const dashDens = per1k(dashN);
  const dashAi = clamp01(dashDens / 10);
  const sPunct: Signal = {
    key: "punctuation",
    label: "Em-dashes & semicolons",
    detail: `${dashN} found (${dashDens.toFixed(1)}/1k words)`,
    aiLikeness: dashAi,
    weight: WEIGHTS.punctuation,
    lean: lean(dashAi),
  };

  // Repetitive sentence openers ("The… The… This… This…") read templated.
  const starters = sentences
    .map((s) => (s.split(/\s+/)[0] || "").toLowerCase().replace(/[^a-z']/g, ""))
    .filter(Boolean);
  let dupStarters = 0;
  if (starters.length >= 5) {
    const freq = new Map<string, number>();
    for (const w of starters) freq.set(w, (freq.get(w) || 0) + 1);
    for (const n of freq.values()) if (n > 1) dupStarters += n - 1;
  }
  const dupRatio = starters.length >= 5 ? dupStarters / starters.length : 0;
  const startAi = starters.length >= 5 ? clamp01((dupRatio - 0.15) / 0.45) : 0.4;
  const sStart: Signal = {
    key: "starters",
    label: "Sentence-opener variety",
    detail:
      starters.length < 5
        ? "Too few sentences to judge"
        : `${Math.round(dupRatio * 100)}% of sentences reuse an opener`,
    aiLikeness: startAi,
    weight: WEIGHTS.starters,
    lean: starters.length < 5 ? "neutral" : lean(startAi),
  };

  const signals = [sCliches, sVocab, sTrans, sBurst, sVoice, sContr, sFiller, sPunct, sStart];

  const totalW = signals.reduce((a, s) => a + s.weight, 0) || 1;
  const score = Math.round(
    (signals.reduce((a, s) => a + s.weight * s.aiLikeness, 0) / totalW) * 100,
  );

  const verdict =
    score >= 60 ? "reads_ai_generated" : score >= 38 ? "mixed_signals" : "reads_human";
  const confidence = words < 150 ? "low" : words < 500 ? "medium" : "high";

  signals.sort((a, b) => b.weight * b.aiLikeness - a.weight * a.aiLikeness);

  return {
    score,
    verdict,
    confidence,
    signals,
    matches: matches.slice(0, 14),
    stats: {
      words,
      sentences: sentences.length,
      avgSentenceLen: Math.round(mean),
      burstiness: Math.round(burstiness * 100) / 100,
      uniqueRatio: Math.round(uniqueRatio * 100) / 100,
    },
  };
}
