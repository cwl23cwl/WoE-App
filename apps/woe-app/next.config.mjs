// apps/woe-app/next.config.mjs
const nextConfig = {
  experimental: {
    turbo: { rules: {} },
  },
  transpilePackages: [
    '@excalidraw/excalidraw',
    '@excalidraw/math',
    '@excalidraw/common',
    '@excalidraw/element',
    '@excalidraw/utils',
  ],
};
export default nextConfig;
