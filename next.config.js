/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // People search "ai content detector", "ai checker" etc. — catch the
    // obvious URL guesses and land them on the detector.
    const aliases = ["/detector", "/ai-content-detector", "/ai-detector", "/ai-checker", "/detect"];
    return aliases.map((source) => ({ source, destination: "/check", permanent: true }));
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
