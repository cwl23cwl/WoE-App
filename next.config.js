// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Never use Konva's Node entry (which needs native 'canvas')
      'konva/lib/index-node.js': 'konva/lib/index.js',
      // If anything tries to import native 'canvas', stub it out
      canvas: false,
    };
    return config;
  },
};

module.exports = nextConfig;