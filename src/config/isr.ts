/**
 * ISR (Incremental Static Regeneration) Configuration
 * 
 * Estratégia otimizada de revalidação para cada tipo de página
 * Balanceia freshness vs. performance vs. origin load
 * 
 * Princípios:
 * - Páginas estáticas: long revalidate (1h+)
 * - Páginas dinâmicas: short revalidate (2-5min)
 * - On-demand revalidation via webhooks
 */

export const ISR_CONFIG = {
  /**
   * Home Page
   * - Conteúdo muda pouco
   * - Alta prioridade de cache
   * - Revalidate: 5min
   */
  home: {
    revalidate: 300, // 5 minutos
    tags: ['home', 'properties:featured'],
    description: 'Homepage com destaques',
  },

  /**
   * Listagem de Imóveis
   * - Conteúdo muda frequentemente
   * - Muitas variações (filtros)
   * - Revalidate: 2min
   */
  propertyList: {
    revalidate: 120, // 2 minutos
    tags: ['properties:list'],
    description: 'Listagem de imóveis',
  },

  /**
   * Detalhes do Imóvel
   * - Conteúdo muda raramente
   * - Muitas páginas para cachear
   * - Revalidate: 10min
   */
  propertyDetail: {
    revalidate: 600, // 10 minutos
    tags: ['properties:detail'],
    description: 'Página de detalhes do imóvel',
  },

  /**
   * Empreendimentos
   * - Conteúdo estável
   * - Poucas páginas
   * - Revalidate: 30min
   */
  developments: {
    revalidate: 1800, // 30 minutos
    tags: ['developments'],
    description: 'Listagem de empreendimentos',
  },

  /**
   * Landing Pages (Cidade/Bairro)
   * - Conteúdo estático
   * - SEO importante
   * - Revalidate: 1h
   */
  landingPages: {
    revalidate: 3600, // 1 hora
    tags: ['landing-pages'],
    description: 'Landing pages SEO',
  },

  /**
   * Páginas Institucionais
   * - Conteúdo muito estável
   * - Revalidate: 1 dia
   */
  static: {
    revalidate: 86400, // 1 dia
    tags: ['static'],
    description: 'Páginas institucionais (sobre, contato, etc)',
  },

  /**
   * Blog/Guias
   * - Conteúdo ocasional
   * - Revalidate: 1h
   */
  content: {
    revalidate: 3600, // 1 hora
    tags: ['content', 'blog'],
    description: 'Blog posts e guias',
  },
} as const;

/**
 * Helper para obter configuração ISR por tipo de página
 */
export function getISRConfig(pageType: keyof typeof ISR_CONFIG) {
  return ISR_CONFIG[pageType];
}

/**
 * Revalidate Tags
 * Para on-demand revalidation via revalidateTag()
 */
export const REVALIDATE_TAGS = {
  // Todas as páginas de imóveis
  allProperties: 'properties:*',
  
  // Páginas específicas
  propertyById: (id: string) => `property:${id}`,
  developmentBySlug: (slug: string) => `development:${slug}`,
  cityBySlug: (slug: string) => `city:${slug}`,
  neighborhoodBySlug: (slug: string) => `neighborhood:${slug}`,
  
  // Grupos
  homepage: 'home',
  listings: 'properties:list',
  developments: 'developments',
  blog: 'content',
} as const;

/**
 * Helper para revalidar múltiplas tags
 */
export function getRevalidateTags(context: {
  propertyId?: string;
  developmentSlug?: string;
  citySlug?: string;
  neighborhoodSlug?: string;
}): string[] {
  const tags: string[] = [];
  
  if (context.propertyId) {
    tags.push(REVALIDATE_TAGS.propertyById(context.propertyId));
    tags.push('properties:list'); // Atualizar listagens
    tags.push('home'); // Atualizar home se for destaque
  }
  
  if (context.developmentSlug) {
    tags.push(REVALIDATE_TAGS.developmentBySlug(context.developmentSlug));
    tags.push('developments');
  }
  
  if (context.citySlug) {
    tags.push(REVALIDATE_TAGS.cityBySlug(context.citySlug));
  }
  
  if (context.neighborhoodSlug) {
    tags.push(REVALIDATE_TAGS.neighborhoodBySlug(context.neighborhoodSlug));
  }
  
  return tags;
}

/**
 * Estratégia de cache por hora do dia
 * Para otimizar revalidations baseado em padrões de tráfego
 */
export function getAdaptiveRevalidate(baseRevalidate: number): number {
  if (typeof window !== 'undefined') return baseRevalidate;
  
  const hour = new Date().getHours();
  
  // Horário comercial (9h-18h): revalidate mais frequente
  if (hour >= 9 && hour <= 18) {
    return baseRevalidate;
  }
  
  // Fora do horário: revalidate menos frequente (2x)
  return baseRevalidate * 2;
}

/**
 * Cache Tags para Next.js 15
 * Para usar com fetch() e revalidateTag()
 */
export function generateCacheTags(pageType: string, identifiers?: Record<string, string>): string[] {
  const tags = [pageType];
  
  if (identifiers) {
    Object.entries(identifiers).forEach(([key, value]) => {
      tags.push(`${key}:${value}`);
    });
  }
  
  return tags;
}

/**
 * Helper para on-demand revalidation via API
 * 
 * Uso:
 * POST /api/revalidate
 * { "tags": ["property:PH1234", "properties:list"] }
 */
export async function triggerRevalidation(tags: string[], secret?: string): Promise<boolean> {
  try {
    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret && { 'Authorization': `Bearer ${secret}` }),
      },
      body: JSON.stringify({ tags }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('[ISR] Revalidation error:', error);
    return false;
  }
}

/**
 * Calcular TTL ideal baseado em freshness requirement
 */
export function calculateOptimalTTL(params: {
  importance: 'critical' | 'high' | 'medium' | 'low';
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  trafficVolume: 'high' | 'medium' | 'low';
}): number {
  const { importance, updateFrequency, trafficVolume } = params;
  
  // Base TTL por frequência de atualização
  const baseTTL = {
    realtime: 60, // 1 min
    hourly: 300, // 5 min
    daily: 3600, // 1 hora
    weekly: 86400, // 1 dia
  }[updateFrequency];
  
  // Ajustar por importância
  const importanceMultiplier = {
    critical: 0.5, // Mais curto
    high: 1,
    medium: 2,
    low: 4, // Mais longo
  }[importance];
  
  // Ajustar por volume de tráfego
  const trafficMultiplier = {
    high: 1.5, // Cache mais agressivo
    medium: 1,
    low: 0.5, // Cache menos agressivo
  }[trafficVolume];
  
  return Math.round(baseTTL * importanceMultiplier * trafficMultiplier);
}

