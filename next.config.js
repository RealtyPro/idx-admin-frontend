/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['s3.amazonaws.com', 'adminapi.realtipro.com','http://104.225.217.254:8081'],
  },
  devIndicators: {
    position: 'bottom-right',
  },
  productionBrowserSourceMaps: false,
  async rewrites() {
    const upstreamApiBase = process.env.NEXT_API_BASE_URL || 'http://localhost:3000';
    const assetBase = process.env.NEXT_ASSET_BASE_URL || 'https://adminapi.realtipro.com';

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