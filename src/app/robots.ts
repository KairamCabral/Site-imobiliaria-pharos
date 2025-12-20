import { MetadataRoute } from 'next';

/**
 * robots.txt configurado para SEO
 * Define regras de crawling para buscadores
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://pharosnegocios.com.br';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
        ],
      },
      // Configurações específicas para Google
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
        ],
      },
      // Configurações para Bing
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

