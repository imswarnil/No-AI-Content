#!/usr/bin/env node
/**
 * Wipe the roll and the counters.
 *
 *   node scripts/reset-stats.mjs            # dry run — shows what would go
 *   node scripts/reset-stats.mjs --yes      # actually delete
 *   node scripts/reset-stats.mjs --yes --keep-metrics   # roll only
 *
 * Dry run is the default on purpose: this deletes production rows and there is
 * no undo. Read the summary it prints before adding --yes.
 *
 * DATABASE_URL is read from the environment, falling back to .env so it works
 * the same way the app does locally.
 */

import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

function loadEnv() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const file = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(file)) return null;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    if (key !== "DATABASE_URL") continue;
    return t
      .slice(i + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return null;
}

const url = loadEnv();
if (!url) {
  console.error("DATABASE_URL is not set (checked the environment and .env).");
  process.exit(1);
}

const apply = process.argv.includes("--yes");
const keepMetrics = process.argv.includes("--keep-metrics");
const sql = neon(url);

const sites = await sql`SELECT domain, hits, has_widget, first_seen FROM sites ORDER BY first_seen`;
let metrics = [];
try {
  metrics = await sql`SELECT key, value FROM metrics ORDER BY key`;
} catch {
  /* the metrics table may not exist yet */
}

const totalHits = sites.reduce((n, s) => n + Number(s.hits || 0), 0);

console.log(`\n  sites:   ${sites.length} row(s), ${totalHits} recorded badge load(s)`);
for (const s of sites) {
  const verdict = s.has_widget === null ? "unverified" : s.has_widget ? "verified" : "not found";
  console.log(`    - ${s.domain}  (${s.hits} hits, ${verdict})`);
}
console.log(`  metrics: ${metrics.length} counter(s)`);
for (const m of metrics) console.log(`    - ${m.key} = ${m.value}`);

if (!apply) {
  console.log("\n  Dry run. Nothing was deleted.");
  console.log("  Re-run with --yes to wipe the above.\n");
  process.exit(0);
}

await sql`DELETE FROM sites`;
if (!keepMetrics) {
  try {
    await sql`DELETE FROM metrics`;
  } catch {
    /* nothing to clear */
  }
}

console.log(
  `\n  Deleted ${sites.length} site row(s)${keepMetrics ? "" : ` and ${metrics.length} counter(s)`}.\n`,
);
