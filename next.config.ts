import type { NextConfig } from 'next';

const nextConfig: NextConfig = {

  // Serve uploaded files from /uploads static path
  async rewrites() {
    return [
      {
        source: '/uploads/:filename*',
        destination: '/api/serve-file/:filename*',
      },
    ];
  },

  // Webpack configuration for Node.js-only modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure 'canvas' fallback for jsPDF in server context
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
    }
    return config;
  },

  // Increase server action body size for file uploads
  serverExternalPackages: [
    'mongoose',
    'ioredis',
    'bullmq',
    'pdf-parse',
  ],

  // Image optimization
  images: {
    domains: [],
  },
};

export default nextConfig;
