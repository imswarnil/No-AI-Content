import type { Metadata } from "next";

const TITLE = "Build your No AI Content badge — free notary-style stamp";
const DESCRIPTION =
  "Customize your NAC badge — pick a style, add your name, region and topic — and copy the one-line embed snippet. Free, no account, nothing stored until you paste it on your own site.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/badge" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/badge",
  },
};

export default function BadgeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
