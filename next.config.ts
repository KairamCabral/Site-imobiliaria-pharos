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
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    remotePatterns: imageRemotePatterns,
    domains: imageDomains,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias para melhor cache
    // unoptimized: true, ❌ REMOVIDO - agora Next.js otimiza automaticamente
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [50, 60, 70, 75, 80, 85, 90, 95, 100],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
