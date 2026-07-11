import type { Metadata } from "next";
import Link from "next/link";
import { sql, ensureSchema, saveSiteMeta } from "@/lib/db";
import { fetchSiteMeta } from "@/lib/meta";
import DirectoryClient, { type DirSite } from "./DirectoryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Directory of human-written blogs — no AI content",
  description:
    "Browse and search blogs and sites that display the No AI Content stamp — written by real people, filterable by category and region. Find blogs which don't use AI to generate content.",
  alternates: { canonical: "/directory" },
};

type DbSite = DirSite & { meta_at: string | null };

async function getSites(): Promise<DbSite[]> {
  try {
    await ensureSchema();
    const sites = (await sql`
      SELECT domain, author, region, category, title, description, first_seen, meta_at
      FROM sites
      ORDER BY first_seen ASC
    `) as DbSite[];
    return await enrichMeta(sites);
  } catch {
    return [];
  }
}

/**
 * Lazily pull each site's title + description. At most 6 stale sites are
 * fetched per page view (in parallel, 6s timeout each) so the directory keeps
 * loading fast while the cache fills; meta_at is stamped even on failure so
 * dead sites are retried only monthly.
 */
async function enrichMeta(sites: DbSite[]): Promise<DbSite[]> {
  const staleBefore = Date.now() - 30 * 24 * 3600 * 1000;
  const stale = sites
    .filter((s) => !s.meta_at || new Date(s.meta_at).getTime() < staleBefore)
    .slice(0, 6);
  if (stale.length === 0) return sites;

  await Promise.all(
    stale.map(async (s) => {
      const meta = await fetchSiteMeta(s.domain);
      s.title = meta.title ?? s.title;
      s.description = meta.description ?? s.description;
      await saveSiteMeta(s.domain, meta.title, meta.description).catch(() => {});
    }),
  );
  return sites;
}

export default async function Directory({
  searchParams,
}: {
  searchParams: { region?: string; category?: string; q?: string };
}) {
  const all = await getSites();

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <span className="pill-tag">🖋️ The roll of humans</span>
          <h1>
            Sites that write <span className="grad">by hand</span>.
          </h1>
          <p className="lede">
            {all.length > 0
              ? `${all.length} site${all.length === 1 ? "" : "s"} proudly display the No AI Content stamp. Search or filter to find human-written blogs you'll love.`
              : "Be the first to add the No AI Content stamp to your site."}
          </p>
          <div className="hero-cta">
            <Link className="btn lg" href="/#build">
              Add your site
            </Link>
            <Link className="btn lg ghost" href="/check">
              AI content detector
            </Link>
          </div>
        </div>
      </section>

      <section className="section wide">
        <DirectoryClient
          sites={all.map(({ meta_at, ...s }) => s)}
          initialRegions={searchParams.region || ""}
          initialCategories={searchParams.category || ""}
          initialQuery={searchParams.q || ""}
        />
      </section>

      <footer className="footer">
        <p>
          ✒︎ <strong>NAC — No AI Content</strong>. Free &amp; open source.
        </p>
        <p className="muted">
          <Link href="/">Home</Link> · <Link href="/eligibility">Rules</Link> ·{" "}
          <Link href="/check">Detector</Link> · <Link href="/dashboard">Operator dashboard</Link>
        </p>
      </footer>
    </main>
  );
}
