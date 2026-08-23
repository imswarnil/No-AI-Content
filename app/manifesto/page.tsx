import Link from "next/link";
import { IconFeather } from "../components/icons";

export const metadata = {
  title: "Manifesto",
  description:
    "Why NAC exists: a badge for people who still put their own thoughts into their own words.",
};

/**
 * The manifesto — the "why this exists" page. A reading view: one column, a
 * comfortable measure, no scroll-triggered choreography. It is a document
 * inside the app, so it renders as one.
 */
export default function Manifesto() {
  return (
    <div className="page">
      <div className="stack">
        <header className="page-head">
          <div>
            <span className="pill-tag">
              <IconFeather size={12} /> The manifesto
            </span>
            <h1>The web is worth writing for</h1>
            <p className="page-sub">
              Why we built a badge for people who still put their own thoughts into their own
              words — and why it matters more every month.
            </p>
          </div>
        </header>

        <div className="panel">
          <div className="panel-body">
            <article className="prose">
              <p className="lead">
                We&apos;re not against AI. We use it every day — to catch a typo, tighten a clumsy
                sentence, argue against a weak idea. Used like that, it makes human writing better.
              </p>
              <p>
                What we&apos;re against is the quiet swap: a machine doing the thinking and the
                writing, then a person putting their name on it. That&apos;s not authorship.
                It&apos;s laundering. And it&apos;s drowning the open web in text that no one
                really means.
              </p>
              <blockquote>
                If you deleted the AI&apos;s contribution and your post vanished with it, it was
                never really yours.
              </blockquote>

              <h2>What changed</h2>
              <p>
                Anyone can now generate a thousand polished, competent, forgettable articles before
                lunch. Content became infinite; meaning became scarce. The scarce thing is no longer
                words — it&apos;s a person who actually has something to say and the taste to say it
                well.
              </p>

              <h2>What NAC actually is</h2>
              <p>
                NAC is a small, honest badge you add to your site in one line of code. It doesn&apos;t
                scan or &ldquo;prove&rdquo; anything — no detector can, and the ones that claim to
                routinely mislabel real human writing. It&apos;s a declaration you choose to make,
                backed by a public, browsable roll of humans so readers can find people like you.
              </p>
              <ul>
                <li>A visible signal that a human is behind the words.</li>
                <li>A public, browsable roll of writers, filterable by topic and region.</li>
                <li>Free, open source, and privacy-first — only the domain is recorded.</li>
              </ul>

              <h2>Why it matters</h2>
              <p>
                Trust is becoming the whole game. As generic AI prose floods every feed, a genuine
                human voice — a real point of view, lived detail, the occasional rough edge — is the
                rarest and most valuable thing a reader can find. NAC helps them find yours, and it
                helps the writers who still care about the craft recognize each other.
              </p>
              <p>
                It&apos;s a small thing. But small, honest signals are how a healthier web gets
                rebuilt — one page at a time.
              </p>
            </article>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>If a human wrote it, say so</h2>
              <p>Add the seal, join the roll, and help keep the web worth reading.</p>
            </div>
            <div className="page-actions">
              <Link className="btn" href="/browse">
                See who&apos;s in
              </Link>
              <Link className="btn primary" href="/#build">
                Create a badge
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
