import type { Metadata } from "next";

const TITLE = "Free AI Content Detector — transparent, open-source AI text checker";
const DESCRIPTION =
  "Check if writing reads AI-generated with NAC's free, open-source AI content detector. A transparent signal-based engine — no black box — that shows exactly which phrases, vocabulary and rhythm patterns pushed the score, plus an optional Claude-powered second opinion.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/check" },
  keywords: [
    "AI content detector",
    "AI detector",
    "AI text detector",
    "free AI checker",
    "detect AI writing",
    "ChatGPT detector",
    "AI writing checker",
    "human writing checker",
    "open source AI detector",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/check",
  },
};

const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is this AI content detector free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The NAC detector is free and open source (MIT). Paste text or a URL and it scores the writing instantly — no signup, no limits.",
      },
    },
    {
      "@type": "Question",
      name: "How does the detector work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It runs a transparent, signal-based engine: AI cliché phrases, LLM-favored vocabulary, sentence-length burstiness, personal voice, contractions, punctuation habits and more. Every signal and its weight is shown, and the exact flagged phrases are listed so you can rewrite them.",
      },
    },
    {
      "@type": "Question",
      name: "Can any tool reliably detect AI-generated text?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. All AI detectors — including this one — produce false positives on real human writing. NAC's score is honest guidance to help you strengthen your own voice, never proof of AI authorship.",
      },
    },
  ],
};

export default function CheckLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />
      {children}
    </>
  );
}
