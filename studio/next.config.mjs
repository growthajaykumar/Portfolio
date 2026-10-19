/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the original URL shape (/work/, /services/seo/) so links and canonicals match.
  trailingSlash: true,
  poweredByHeader: false,
  // studio/ is its own app; don't let Turbopack adopt the parent site's lockfile as the root.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
