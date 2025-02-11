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
};

// Only add webpack config if not using Turbopack
if (process.env.NEXT_TURBO !== "1") {
  nextConfig.webpack = (config) => {
    config.performance = {
      ...config.performance,
      maxAssetSize: 50 * 1024 * 1024,
      maxEntrypointSize: 50 * 1024 * 1024,
    };
    return config;
  };
}

export default nextConfig;
