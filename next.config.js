/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['ipfs.infura.io','ivuschua.infura-ipfs.io']
  }
}

module.exports = nextConfig
