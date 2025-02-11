import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  webpack: (config) => {
    config.performance = {
      ...config.performance,
      maxAssetSize: 50 * 1024 * 1024, // 50MB
      maxEntrypointSize: 50 * 1024 * 1024, // 50MB
    };
    return config;
  },
};

export default nextConfig;
