/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // People search "ai content detector", "ai checker" etc. — land them on
    // the homepage, which explains what NAC actually is.
    const aliases = ["/detector", "/ai-content-detector", "/ai-detector", "/ai-checker", "/detect", "/check"];
    return [
      ...aliases.map((source) => ({ source, destination: "/", permanent: true })),
      // The directory is now "Browse" — keep old links working.
      { source: "/directory", destination: "/browse", permanent: true },
    ];
  },
  async headers() {
    // Allow the widget script + track endpoint to be loaded/called cross-origin
    return [
      {
        source: "/widget.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
