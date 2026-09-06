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

const HOWTO_LD = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to add a No AI Content badge to your website",
  description: DESCRIPTION,
  totalTime: "PT2M",
  estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
  step: [
    {
      "@type": "HowToStep",
      name: "Customize your seal",
      text: "Pick a style, add your name, region and topic in the badge builder.",
      url: "https://nac.imswarnil.com/badge",
    },
    {
      "@type": "HowToStep",
      name: "Get your snippet",
      text: "Copy the one-line embed code, or download it as a file.",
      url: "https://nac.imswarnil.com/badge#install",
    },
    {
      "@type": "HowToStep",
      name: "Paste it on your site",
      text: "Add the snippet to your sidebar, footer, or byline — works on WordPress, Ghost, Webflow, Framer, and plain HTML.",
      url: "https://nac.imswarnil.com/badge#install",
    },
  ],
};

export default function BadgeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOWTO_LD) }} />
      {children}
    </>
  );
}
