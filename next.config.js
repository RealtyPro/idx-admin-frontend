/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: [],
  },
  devIndicators: {
    position: 'bottom-right',
  },
  productionBrowserSourceMaps: false,
  async rewrites() {
    const upstreamApiBase = process.env.NEXT_API_BASE_URL || 'http://localhost:3001';

    return [
      {
        source: '/api/:path*',
        destination: `${upstreamApiBase}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig 