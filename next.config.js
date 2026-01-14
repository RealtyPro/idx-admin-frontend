/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
  productionBrowserSourceMaps: false,
  swcMinify: true,
}

module.exports = nextConfig 