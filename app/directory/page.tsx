import Link from "next/link";
import { sql, ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = {
  domain: string;
  author: string | null;
  region: string | null;
  category: string | null;
  first_seen: string;
};

async function getSites(): Promise<Row[]> {
  try {
    await ensureSchema();
    return (await sql`
      SELECT domain, author, region, category, first_seen
      FROM sites
      ORDER BY first_seen ASC
    `) as Row[];
  } catch {
    return [];
  }
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

export default async function Directory({
  searchParams,
}: {
  searchParams: { region?: string; category?: string };
}) {
  const all = await getSites();
  const region = searchParams.region || "";
  const category = searchParams.category || "";

  const regions = Array.from(new Set(all.map((s) => s.region).filter(Boolean))) as string[];
  const categories = Array.from(new Set(all.map((s) => s.category).filter(Boolean))) as string[];

  const sites = all.filter(
    (s) => (!region || s.region === region) && (!category || s.category === category),
  );

  const qs = (over: Partial<{ region: string; category: string }>) => {
    const p = new URLSearchParams();
    const r = over.region ?? region;
    const c = over.category ?? category;
    if (r) p.set("region", r);
    if (c) p.set("category", c);
    const s = p.toString();
    return s ? `/directory?${s}` : "/directory";
  };

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
              ? `${all.length} site${all.length === 1 ? "" : "s"} proudly display the No AI Content stamp.`
              : "Be the first to add the No AI Content stamp to your site."}
          </p>
          <div className="hero-cta">
            <Link className="btn lg" href="/#build">
              Add your site
            </Link>
            <Link className="btn lg ghost" href="/check">
              Check my writing
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        {(regions.length > 0 || categories.length > 0) && (
          <div className="filters">
            {regions.length > 0 && (
              <div className="filter-row">
                <span className="flabel">Region</span>
                <Link className={`chip ${!region ? "on" : ""}`} href={qs({ region: "" })}>
                  All
                </Link>
                {regions.map((r) => (
                  <Link key={r} className={`chip ${region === r ? "on" : ""}`} href={qs({ region: r })}>
                    {r}
                  </Link>
                ))}
              </div>
            )}
            {categories.length > 0 && (
              <div className="filter-row">
                <span className="flabel">Category</span>
                <Link className={`chip ${!category ? "on" : ""}`} href={qs({ category: "" })}>
                  All
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    className={`chip ${category === cat ? "on" : ""}`}
                    href={qs({ category: cat })}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {sites.length === 0 ? (
          <p className="sec-sub">
            {all.length === 0 ? (
              <>
                No sites yet. <Link href="/#build">Create your stamp</Link> and you&apos;ll appear here.
              </>
            ) : (
              <>No sites match that filter.</>
            )}
          </p>
        ) : (
          <div className="dir-grid">
            {sites.map((s) => (
              <a
                key={s.domain}
                className="dir-card"
                href={`https://${s.domain}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="dir-favi"
                  src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=64`}
                  alt=""
                  width={32}
                  height={32}
                  loading="lazy"
                />
                <span className="dir-meta">
                  <strong>{s.domain}</strong>
                  <span className="muted">
                    {[s.author, s.category, s.region].filter(Boolean).join(" · ") ||
                      `since ${fmt(s.first_seen)}`}
                  </span>
                </span>
                <span className="dir-arrow" aria-hidden>
                  ↗
                </span>
              </a>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <p>
          🌱 <strong>No AI Content</strong> — free &amp; open source.
        </p>
        <p className="muted">
          <Link href="/">Home</Link> · <Link href="/eligibility">Rules</Link> ·{" "}
          <Link href="/dashboard">Operator dashboard</Link>
        </p>
      </footer>
    </main>
  );
}
