// apps/woe-app/next.config.mjs
const nextConfig = {
  experimental: {
    turbo: { rules: {} },
  },
  transpilePackages: [
    '@woe/excalidraw-wrapper',
    '@excalidraw/excalidraw', // ← add this
  ],
};
export default nextConfig;
