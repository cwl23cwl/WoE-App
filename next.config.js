const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  
  // Handle React version compatibility issues
  transpilePackages: ['@excalidraw/excalidraw', 'jotai-scope'],
  
  webpack: (config, { dev, isServer }) => {
    // Increase timeout for large chunks like Excalidraw
    if (dev) {
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };
      
      // Increase chunk loading timeout and add retry logic
      config.output = {
        ...config.output,
        chunkLoadTimeout: 60000, // 60 seconds for large chunks
        crossOriginLoading: 'anonymous',
      };
      
      // Add specific optimization for Excalidraw chunking
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            excalidraw: {
              test: /[\\/]node_modules[\\/]@excalidraw[\\/]/,
              name: 'excalidraw',
              chunks: 'all',
              enforce: true,
              priority: 20,
            },
          },
        },
      };
    }
    
    // Add aliases for forked packages
    config.resolve.alias = {
      ...config.resolve.alias,
      '@excalidraw/common': path.resolve(__dirname, '../woe-excalidraw/packages/common/src'),
      '@excalidraw/element': path.resolve(__dirname, '../woe-excalidraw/packages/element/src'),
      '@excalidraw/math': path.resolve(__dirname, '../woe-excalidraw/packages/math/src'),
      '@excalidraw/utils': path.resolve(__dirname, '../woe-excalidraw/packages/utils/src'),
    };
    
    // Add fallback for missing modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
    // Ignore SES lockdown warnings and intrinsic removal warnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /lockdown-install/,
      },
      {
        message: /SES Removing/,
      },
      {
        message: /Removing intrinsics/,
      },
    ];
    
    return config;
  },
  
  // Additional React compatibility settings
  reactStrictMode: false, // Disable strict mode for better Excalidraw compatibility
  
  // Suppress build warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig