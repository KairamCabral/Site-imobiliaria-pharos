import { MetadataRoute } from 'next';
import { listarEmpreendimentos } from '@/data/empreendimentos';

/**
 * Sitemap de Empreendimentos
 * Segmentado para melhor rastreio pelo Google
 */
export default async function sitemapEmpreendimentos(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pharos.imob.br';

  try {
    const { items: empreendimentos } = await listarEmpreendimentos({ page: 1, limit: 200 });
    
    return empreendimentos.map((emp) => ({
      url: `${baseUrl}/empreendimentos/${emp.slug}`,
      lastModified: emp.updatedAt ? new Date(emp.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('[Sitemap Empreendimentos] Error:', error);
    return [];
  }
}

