import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/drilling-rpg',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
