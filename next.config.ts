import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "60mb",
      allowedOrigins: ["*"],
      maxDuration: 60, // 60 seconds timeout for server actions
    },
  },
  images: {
    domains: ["limpopochefs-media.s3.eu-north-1.amazonaws.com"],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  serverRuntimeConfig: {
    timeoutMs: 60000, // 60 seconds server-side timeout
  },
};

export default nextConfig;
