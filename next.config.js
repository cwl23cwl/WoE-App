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
      
      // Increase chunk loading timeout
      config.output = {
        ...config.output,
        chunkLoadTimeout: 30000, // 30 seconds instead of default 10s
      };
    }
    
    // Handle React version conflicts by aliasing React versions
    config.resolve.alias = {
      ...config.resolve.alias,
      // Force React versions to be consistent
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
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
      {
        message: /Module not found.*react\/jsx-runtime/,
      }
    ];
    
    // Add fallback for missing modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
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