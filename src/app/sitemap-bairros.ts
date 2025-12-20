import { MetadataRoute } from 'next';
import { createBairroSlug } from '@/utils/locationSlug';

/**
 * Sitemap de Páginas de Bairros
 * Segmentado para melhor rastreio pelo Google
 */
export default function sitemapBairros(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pharos.imob.br';
  const currentDate = new Date();

  const bairros = [
    'Centro',
    'Barra Sul', 
    'Pioneiros',
    'Nações',
    'Estados',
    'Praia Brava',
    'Barra Norte',
    'Praia dos Amores',
  ];

  return bairros
    .map((bairro) => createBairroSlug(bairro, 'Balneário Camboriú'))
    .map((bairroSlug) => ({
      url: `${baseUrl}/imoveis/bairro/${bairroSlug}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));
}

