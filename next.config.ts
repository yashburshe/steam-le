import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'media.steampowered.com',
        pathname: '/**',
      }, {
        protocol: 'https',
        hostname: 'avatars.steamstatic.com',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
