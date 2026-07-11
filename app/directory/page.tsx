import type { Metadata } from "next";
import Link from "next/link";
import { sql, ensureSchema, saveSiteCheck, isWidgetPresent } from "@/lib/db";
import { fetchSiteMeta } from "@/lib/meta";
import DirectoryClient, { type DirSite } from "./DirectoryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Directory of human-written blogs — no AI content",
  description:
    "Browse and search blogs and sites that display the No AI Content stamp — written by real people, filterable by category and region. Find blogs which don't use AI to generate content.",
  alternates: { canonical: "/directory" },
};

type DbSite = DirSite & {
  check_at: string | null;
  has_widget: boolean | null;
  last_seen: string;
};

/** Only sites whose widget is verifiably present right now are listed. */
async function getSites(): Promise<DbSite[]> {
  try {
    await ensureSchema();
    const sites = (await sql`
      SELECT domain, author, region, category, title, description,
             has_widget, check_at, first_seen, last_seen
      FROM sites
      ORDER BY first_seen ASC
    `) as DbSite[];
    await checkSites(sites);
    return sites.filter(isWidgetPresent);
  } catch {
    return [];
  }
}

/**
 * One homepage fetch per site yields both the card metadata (title,
 * description) and the widget-presence verdict. At most 6 sites whose last
 * check is >24h old are re-checked per page view (in parallel, 6s timeout
 * each) so the directory keeps loading fast; check_at is stamped even on
 * failure so dead sites aren't retried on every view.
 */
async function checkSites(sites: DbSite[]): Promise<void> {
  const staleBefore = Date.now() - 24 * 3600 * 1000;
  const stale = sites
    .filter((s) => !s.check_at || new Date(s.check_at).getTime() < staleBefore)
    .slice(0, 6);
  if (stale.length === 0) return;

  await Promise.all(
    stale.map(async (s) => {
      const meta = await fetchSiteMeta(s.domain);
      s.title = meta.title ?? s.title;
      s.description = meta.description ?? s.description;
      s.has_widget = meta.hasWidget ?? s.has_widget;
      await saveSiteCheck(s.domain, meta.title, meta.description, meta.hasWidget).catch(() => {});
    }),
  );
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
          sites={all.map(({ check_at, has_widget, last_seen, ...s }) => s)}
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
