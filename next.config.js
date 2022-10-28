/** @type {import('next').NextConfig} */

const dedicatedEndPoint = 'https://ivuschua.infura-ipfs.io';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['ipfs.infura.io',dedicatedEndPoint]
  }
}

module.exports = nextConfig
