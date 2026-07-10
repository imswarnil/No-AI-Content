import Link from "next/link";

export const metadata = {
  title: "Who qualifies — No AI Content",
  description: "What counts as human-written, and which uses of AI are allowed.",
};

const ALLOWED = [
  ["Spelling & grammar", "Fixing typos and grammar in text you wrote."],
  ["Rephrasing your own words", "Asking AI to tighten a sentence you already drafted."],
  ["Pressure-testing ideas", "Debating or stress-testing your thinking — you still write it."],
  ["Research assistance", "Summarizing sources you then read and verify yourself."],
  ["Translating your writing", "Translating text you authored into another language."],
  ["Outlining help", "Sketching structure, as long as you write the actual prose."],
];

const NOT_ALLOWED = [
  ["Full articles from a prompt", "Generating whole posts end-to-end from a topic."],
  ["AI writes, you lightly edit", "The words are the machine's; you just tweaked them."],
  ["Auto-generated SEO / listicles", "Bulk content spun up to rank, not to say something."],
  ["Ghost-written by AI", "Published as yours, but a model actually wrote it."],
  ["No human idea behind it", "The thinking, not just the typing, came from AI."],
];

export default function Eligibility() {
  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <span className="pill-tag">📜 The honest line</span>
          <h1>
            What counts as <span className="grad">human-written</span>?
          </h1>
          <p className="lede">
            This isn&apos;t anti-AI. It&apos;s pro-human. Use AI to sharpen your thinking and polish
            your words — just don&apos;t let it do the writing and thinking for you.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="elig-grid">
          <div className="elig-card ok">
            <h2>✅ Allowed — you still qualify</h2>
            <ul>
              {ALLOWED.map(([t, d]) => (
                <li key={t}>
                  <strong>{t}</strong>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="elig-card no">
            <h2>🚫 Not allowed — disqualifies</h2>
            <ul>
              {NOT_ALLOWED.map(([t, d]) => (
                <li key={t}>
                  <strong>{t}</strong>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24, textAlign: "center" }}>
          <p className="muted" style={{ marginBottom: 16 }}>
            The rule of thumb: <strong>if a reader deleted the AI&apos;s contribution, your post
            should still exist.</strong> The ideas and the words are yours; AI just helps you say
            them better.
          </p>
          <Link className="btn" href="/#build">
            I qualify — make my stamp
          </Link>{" "}
          <Link className="btn ghost" href="/check">
            Check my site first
          </Link>
        </div>
      </section>

      <footer className="footer">
        <p>
          ✒︎ <strong>NAC — No AI Content</strong>. Free &amp; open source.
        </p>
        <p className="muted">
          <Link href="/">Home</Link> · <Link href="/directory">Directory</Link>
        </p>
      </footer>
    </main>
  );
}
