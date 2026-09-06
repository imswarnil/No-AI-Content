import Link from "next/link";
import {
  IconScale,
  IconCheck,
  IconX,
  IconFeather,
  IconSearch,
  IconGlobe,
  IconFileText,
  IconRobot,
  IconAlert,
  IconCopy,
} from "../components/icons";

export const metadata = {
  title: "Who qualifies — No AI Content",
  description: "What counts as human-written, and which uses of AI are allowed.",
};

const ALLOWED = [
  [IconCheck, "Spelling & grammar", "Fixing typos and grammar in text you wrote."],
  [IconFeather, "Rephrasing your own words", "Asking AI to tighten a sentence you already drafted."],
  [IconScale, "Pressure-testing ideas", "Debating or stress-testing your thinking — you still write it."],
  [IconSearch, "Research assistance", "Summarizing sources you then read and verify yourself."],
  [IconGlobe, "Translating your writing", "Translating text you authored into another language."],
  [IconFileText, "Outlining help", "Sketching structure, as long as you write the actual prose."],
] as const;

const NOT_ALLOWED = [
  [IconRobot, "Full articles from a prompt", "Generating whole posts end-to-end from a topic."],
  [IconAlert, "AI writes, you lightly edit", "The words are the machine's; you just tweaked them."],
  [IconCopy, "Auto-generated SEO / listicles", "Bulk content spun up to rank, not to say something."],
  [IconRobot, "Ghost-written by AI", "Published as yours, but a model actually wrote it."],
  [IconAlert, "No human idea behind it", "The thinking, not just the typing, came from AI."],
] as const;

export default function Eligibility() {
  return (
    <div className="page">
      <div className="stack">
        <header className="page-head">
          <div>
            <span className="pill-tag">
              <IconScale size={12} /> The honest line
            </span>
            <h1>What counts as human-written?</h1>
            <p className="page-sub">
              This isn&apos;t anti-AI. It&apos;s pro-human. Use AI to sharpen your thinking and
              polish your words — just don&apos;t let it do the writing and thinking for you.
            </p>
          </div>
        </header>

        <div className="elig-grid">
          <div className="elig-card ok">
            <h2>
              <IconCheck size={17} /> Allowed — you still qualify
            </h2>
            <ul>
              {ALLOWED.map(([Icon, t, d]) => (
                <li key={t}>
                  <span className="elig-icon">
                    <Icon size={15} />
                  </span>
                  <span className="elig-li-body">
                    <strong>{t}</strong>
                    <span>{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="elig-card no">
            <h2>
              <IconX size={17} /> Not allowed — disqualifies
            </h2>
            <ul>
              {NOT_ALLOWED.map(([Icon, t, d]) => (
                <li key={t}>
                  <span className="elig-icon">
                    <Icon size={15} />
                  </span>
                  <span className="elig-li-body">
                    <strong>{t}</strong>
                    <span>{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>The rule of thumb</h2>
              <p>
                If a reader deleted the AI&apos;s contribution, your post should still exist. The
                ideas and the words are yours; AI just helps you say them better.
              </p>
            </div>
            <div className="page-actions">
              <Link className="btn primary" href="/badge">
                I qualify — make my badge
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
