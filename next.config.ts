import type { NextConfig } from "next";
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

const imageRemotePatterns: RemotePattern[] = [
  {
    protocol: 'https',
    hostname: 'cdn.vistahost.com.br',
  },
  {
    protocol: 'https',
    hostname: '*.vistahost.com.br',
  },
  {
    protocol: 'https',
    hostname: 'www.vistasoft.com.br',
  },
  {
    protocol: 'http',
    hostname: 'www.vistasoft.com.br',
  },
  {
    protocol: 'https',
    hostname: '*.vista.imobi',
  },
  {
    protocol: 'https',
    hostname: 'dwvimagesv1.b-cdn.net',
  },
  {
    protocol: 'https',
    hostname: '*.b-cdn.net',
  },
  {
    protocol: 'https',
    hostname: 'via.placeholder.com',
  },
  {
    protocol: 'https',
    hostname: '*.amazonaws.com',
  },
  {
    protocol: 'https',
    hostname: '*.cloudfront.net',
  },
  {
    protocol: 'https',
    hostname: '*.googleapis.com',
  },
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'http',
    hostname: 'localhost',
  },
];

const imageDomains = [
  'dwvimagesv1.b-cdn.net',
];

const nextConfig: NextConfig = {
  // ✅ Timeout de 180s para SSG (rede de segurança)
  staticPageGenerationTimeout: 180,
  eslint: {
    ignoreDuringBuilds: true,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: imageRemotePatterns,
    domains: imageDomains,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24,
    unoptimized: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
