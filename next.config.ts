import type { NextConfig } from 'next';

const isExport = process.env.IS_EXPORT === 'true';
const isCloudflare = !isExport;

console.log(`[NextConfig] Build Mode: ${isExport ? 'EXPORT' : 'STANDALONE'} (isExport: ${isExport})`);

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
