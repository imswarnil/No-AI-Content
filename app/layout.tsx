import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "No AI Content — Human-written badge for your site",
  description:
    "A free, open-source embeddable badge that lets authors declare their content is human-written, with no AI-generated text.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
