import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "https://mwfejtgqjajkqhdfjtzh.supabase.co/storage/v1/s3",
      "media.licdn.com",
      "m.media-amazon.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
