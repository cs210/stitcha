import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		domains: [
			'mwfejtgqjajkqhdfjtzh.supabase.co',
			'media.licdn.com',
			'm.media-amazon.com',
			'www.shutterstock.com',
			'http2.mlstatic.com',
			'encrypted-tbn0.gstatic.com',
		],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		formats: ['image/webp'],
		minimumCacheTTL: 60,
	},
};

export default nextConfig;
