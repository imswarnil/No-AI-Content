import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nac.imswarnil.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/manifesto", "/directory", "/eligibility", "/check"];
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : path === "/check" ? 0.9 : 0.7,
  }));
}
