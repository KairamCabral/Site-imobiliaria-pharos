import { MetadataRoute } from 'next';
import { getPropertyService } from '@/services';
import type { PropertyStatus } from '@/domain/models/Property';

/**
 * Sitemap Index de Imóveis
 * 
 * Google recomenda max 50.000 URLs por sitemap, mas para performance
 * usamos 1.000 URLs por sitemap (melhor para cache e parsing)
 * 
 * Este sitemap index aponta para sitemaps paginados:
 * - /sitemap-imoveis.xml (este arquivo - primeiros 1000)
 * - /sitemap-imoveis-2.xml (1001-2000)
 * - /sitemap-imoveis-3.xml (2001-3000)
 * - etc.
 * 
 * Benefícios:
 * - Rastreamento incremental mais eficiente
 * - Cache mais agressivo (sitemaps menores)
 * - Melhor para grandes volumes de imóveis
 * - Facilita debugging de indexação
 */

const MAX_URLS_PER_SITEMAP = 1000;

export default async function sitemapImoveis(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pharos.imob.br';

  try {
    const service = getPropertyService();
    
    // Buscar todos os imóveis ativos (não vendidos/alugados)
    const { result } = await service.searchProperties(
      { 
        status: 'disponivel' as PropertyStatus, // Apenas disponíveis
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      },
      { 
        page: 1, 
        limit: MAX_URLS_PER_SITEMAP, // Apenas primeiros 1000 neste sitemap
      }
    );
    
    const properties = result.properties || [];
    
    // Mapear para formato do sitemap
    return properties.map((property) => {
      // Determinar prioridade baseada em características
      let priority = 0.6; // Padrão
      
      // Aumentar prioridade se:
      const isExclusive = (property as any).isExclusive === true;
      const isLaunch = (property as any).isLaunch === true;
      const hasPhotos = property.photos && property.photos.length > 5;
      const isRecent = property.updatedAt 
        ? (Date.now() - new Date(property.updatedAt).getTime()) < 7 * 24 * 60 * 60 * 1000 // 7 dias
        : false;
      
      if (isExclusive) priority = 0.9;
      else if (isLaunch) priority = 0.85;
      else if (isRecent && hasPhotos) priority = 0.75;
      else if (hasPhotos) priority = 0.65;
      
      // Change frequency baseado em último update
      let changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' = 'weekly';
      if (isRecent) changeFrequency = 'daily';
      else if (isLaunch) changeFrequency = 'weekly';
      
      return {
        url: `${baseUrl}/imoveis/${property.id}`,
        lastModified: property.updatedAt 
          ? new Date(property.updatedAt) 
          : new Date(),
        changeFrequency,
        priority,
      };
    });
  } catch (error) {
    console.error('[Sitemap Imóveis] Error:', error);
    
    // Em caso de erro, retornar array vazio (melhor que quebrar o site)
    // Logs devem ser monitorados via Sentry/Datadog
    return [];
  }
}

/**
 * TODO: Implementar sitemaps paginados
 * 
 * Criar arquivos:
 * - src/app/sitemap-imoveis-2.ts (1001-2000)
 * - src/app/sitemap-imoveis-3.ts (2001-3000)
 * - etc.
 * 
 * Ou usar geração dinâmica:
 * - src/app/sitemap-imoveis/[page]/route.ts
 * 
 * Recomendação: Usar geração estática para melhor cache
 */

