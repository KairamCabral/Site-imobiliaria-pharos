import { MetadataRoute } from 'next';

/**
 * Sitemap Index
 * Aponta para todos os sitemaps segmentados
 * 
 * Benefícios:
 * - Rastreio mais rápido e eficiente
 * - Organização por tipo de conteúdo
 * - Facilita priorização pelo Google
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pharos.imob.br';
  const currentDate = new Date();

  // Sitemap index aponta para sitemaps segmentados
  // Nota: Next.js renderiza sitemaps segmentados automaticamente quando detecta arquivos sitemap-*.ts
  // Este arquivo serve como fallback e para SEO geral
  
  return [
    {
      url: `${baseUrl}/sitemap-estaticas.xml`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sitemap-imoveis.xml`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sitemap-empreendimentos.xml`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sitemap-bairros.xml`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
  ];
}

