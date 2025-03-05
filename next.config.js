/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "https://mwfejtgqjajkqhdfjtzh.supabase.co/storage/v1/s3",
      "m.media-amazon.com",
    ],
  },
};

module.exports = nextConfig;
