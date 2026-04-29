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
    const assetBase = process.env.NEXT_ASSET_BASE_URL || 'http://localhost:8081';

    return [
      {
        source: '/api/:path*',
        destination: `${upstreamApiBase}/:path*`,
      },
      {
        source: '/media/:path*',
        destination: `${assetBase}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig 