import type { Metadata, Viewport } from "next";
import "./base.css";
import "./globals.css";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nac.imswarnil.com";
const TITLE = "NAC — No AI Content · the human-written badge for your site";
const DESCRIPTION =
  "NAC (No AI Content) is a free, open-source embeddable badge that lets authors declare their content is human-written — AI used only to refine, never to generate. Add the notary-style stamp to your blog and join a public, browsable roll of humans who still write by hand.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · NAC",
  },
  description: DESCRIPTION,
  applicationName: "NAC — No AI Content",
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
    siteName: "NAC — No AI Content",
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
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  category: "technology",
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "NAC — No AI Content",
      alternateName: "NAC",
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
      name: "NAC — No AI Content",
      alternateName: "NAC",
      url: SITE_URL,
      description: DESCRIPTION,
    },
    {
      "@type": "Organization",
      name: "NAC — No AI Content",
      alternateName: "NAC",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
    },
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#131417" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme is stamped onto <html> by the pre-paint script below, so the
    // client markup legitimately differs from the server's. Without this,
    // React logs an "Extra attributes from the server: data-theme" mismatch on
    // every single load.
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap"
        />
        {/* Resolve the theme before the first paint. The toggle in the header
            also writes data-theme, but it can only do so after hydration,
            which meant a dark-OS visitor watched the page flash white on
            every cold load. Kept inline and tiny so it costs no round trip. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('nac_theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()",
          }}
        />
        <noscript>
          {/* .reveal starts at opacity 0 and the SVG figures are held at
              frame 0 until JS marks them seen. With scripting off that never
              happens, so the page would render essentially blank. */}
          <style>{`
            .reveal { opacity: 1 !important; transform: none !important; }
            .scene-art .draw { stroke-dashoffset: 0 !important; }
            .scene-art .pop { opacity: 1 !important; }
          `}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
