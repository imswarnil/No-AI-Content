import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const TITLE = "No AI Content — the human-written badge for your site";
const DESCRIPTION =
  "A free, open-source embeddable badge that lets authors declare their content is human-written — AI used only to refine, never to generate. Add the notary-style stamp to your blog and join a public directory of humans who still write by hand.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · No AI Content",
  },
  description: DESCRIPTION,
  applicationName: "No AI Content",
  keywords: [
    "no AI content",
    "human written badge",
    "AI-free content",
    "human-written blog",
    "content authenticity",
    "writing badge",
    "no AI widget",
    "human content certification",
  ],
  authors: [{ name: "Swarnil Singh" }],
  creator: "Swarnil Singh",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "No AI Content",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "No AI Content",
      applicationCategory: "WebApplication",
      operatingSystem: "Any (web)",
      description: DESCRIPTION,
      url: SITE_URL,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      license: "https://opensource.org/licenses/MIT",
      isAccessibleForFree: true,
    },
    {
      "@type": "WebSite",
      name: "No AI Content",
      url: SITE_URL,
      description: DESCRIPTION,
    },
    {
      "@type": "Organization",
      name: "No AI Content",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
