import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const isCloudflare = 
  process.env.NEXT_CF_DEPLOY === 'true' || 
  process.env.CF_PAGES === '1' || 
  process.env.OPEN_NEXT === 'true';

const basePath = process.env.BASE_PATH || '';

const nextConfig: NextConfig = {
  // Cloudflare OpenNext requires 'standalone'
  // GitHub Pages / Itch.io requires 'export'
  output: isCloudflare ? 'standalone' : 'export',
  
  // GitHub Pages: use /drilling-rpg
  // Itch.io / Cloudflare: must use empty or relative paths
  basePath: isCloudflare ? '' : basePath,
  assetPrefix: isCloudflare ? '' : (basePath ? `${basePath}/` : './'),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
