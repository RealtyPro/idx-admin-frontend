/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  devIndicators: {
    position: 'bottom-right',
  },
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig 