import type { NextConfig } from 'next';

const isExport = process.env.IS_EXPORT === 'true';

const nextConfig: NextConfig = {
  // Cloudflare OpenNext requires 'standalone'
  // GitHub Pages / Itch.io requires 'export'
  output: isExport ? 'export' : 'standalone',
  
  // GitHub Pages: use /drilling-rpg
  // Itch.io / Cloudflare: must use empty or relative paths
  basePath: isExport ? (process.env.BASE_PATH || '') : '',
  assetPrefix: isExport ? (process.env.BASE_PATH ? `${process.env.BASE_PATH}/` : undefined) : undefined,
  
  // trailingSlash: true 옵션은 Cloudflare Pages의 index 서빙과 충돌할 수 있어 비활성화합니다.
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
