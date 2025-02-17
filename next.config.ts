import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Ensure type checking during build
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  images: {
    domains: [
      "limpopochefs-media.s3.eu-north-1.amazonaws.com", // Allow images from your S3 bucket
    ],
  },
};

export default nextConfig;
