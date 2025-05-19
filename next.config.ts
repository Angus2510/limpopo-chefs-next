import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "60mb",
      allowedOrigins: ["*"],
      maxDuration: 60,
    },
  },
  images: {
    domains: [
      "limpopochefs-media.s3.eu-north-1.amazonaws.com",
      "localhost",
      "127.0.0.1",
    ],
    remotePatterns: [
      // {
      //   protocol: "http",
      //   hostname: "localhost",
      //   port: "3000",
      //   pathname: "/img/**",
      // },
    ],
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
    timeoutMs: 60000,
  },
};

export default nextConfig;
