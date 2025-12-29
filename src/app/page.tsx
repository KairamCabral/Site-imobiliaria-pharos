import HomeClient from './HomeClient';
import { getCachedPropertyList } from '@/lib/data/propertyQueries';
import { sortByPriority } from '@/utils/propertyPriority';
import type { Imovel } from '@/types';
import { listarEmpreendimentos } from '@/data/empreendimentos';

// Cache por 5 minutos para melhor performance
export const revalidate = 300;

type CacheLayer = 'memory' | 'redis' | 'origin';

type SectionMeta = {
  lastUpdated: number | null;
  cacheLayer: CacheLayer;
};

const DEFAULT_LIMIT = 6;
const FETCH_LIMIT = 300; // ✅ Aumentado para garantir que TODOS os exclusivos sejam incluídos (incluindo os que estão mais distantes na ordenação)

function pickExclusiveProperties(list: Imovel[], limit: number = DEFAULT_LIMIT): Imovel[] {
  const exclusivos = list.filter((item) => item.exclusivo === true);
  return [...exclusivos].sort(sortByPriority as any);
}

function pickSuperHighlights(list: Imovel[], limit: number = DEFAULT_LIMIT): Imovel[] {
  const highlights = list.filter((item) => item.lancamento === true);

  if (highlights.length === 0) {
    return [];
  }

  return [...highlights].sort(sortByPriority as any).slice(0, limit);
}

function pickFrontSea(list: Imovel[], limit: number = DEFAULT_LIMIT): Imovel[] {
  const frenteMar = list.filter((item) => item.vistaParaMar === true);

  if (frenteMar.length === 0) {
    return sortByDistance(list).slice(0, limit);
  }

  return [...frenteMar].sort(sortByPriority as any).slice(0, limit);
}

function sortByDistance(list: Imovel[]): Imovel[] {
  return [...list]
    .map((item) => ({ item, distance: getDistance(item) }))
    .filter(({ distance }) => Number.isFinite(distance))
    .sort((a, b) => a.distance - b.distance)
    .map(({ item }) => item);
}

function getDistance(imovel: Imovel): number {
  const distance = (imovel as any).distanciaMar ?? (imovel as any).distancia_mar_m;
  return typeof distance === 'number' ? distance : Number.POSITIVE_INFINITY;
}

function buildMeta(fetchedAt: number | undefined, cacheLayer: CacheLayer): SectionMeta {
  return {
    lastUpdated: fetchedAt ?? null,
    cacheLayer,
  };
}

export default async function HomePage() {
  // Usando try-catch para evitar travar a página
  let balnearioData, frenteMarData, empreendimentosResult;
  
  try {
    [balnearioData, frenteMarData, empreendimentosResult] = await Promise.all([
      getCachedPropertyList(
        {
          city: 'Balneário Camboriú',
          sortBy: 'updatedAt',
          sortOrder: 'desc',
          providersToUse: ['vista-only'],
        },
        { page: 1, limit: FETCH_LIMIT },
      ),
      getCachedPropertyList(
        {
          city: 'Balneário Camboriú',
          sortBy: 'price',
          sortOrder: 'desc',
          providersToUse: ['vista-only'],
        },
        { page: 1, limit: FETCH_LIMIT },
      ),
      listarEmpreendimentos({ page: 1, limit: 6 }),
    ]);
  } catch (error) {
    console.error('❌ [HomePage] Erro ao carregar dados:', error);
    // Fallback com dados vazios
    balnearioData = { properties: [], pagination: { page: 1, limit: FETCH_LIMIT, total: 0, totalPages: 0 }, cacheLayer: 'origin' as const, fetchedAt: Date.now() };
    frenteMarData = { properties: [], pagination: { page: 1, limit: FETCH_LIMIT, total: 0, totalPages: 0 }, cacheLayer: 'origin' as const, fetchedAt: Date.now() };
    empreendimentosResult = { items: [], pagination: { page: 1, limit: 6, total: 0, totalPages: 0 } };
  }

  const empreendimentos = empreendimentosResult;

  // Usar dados de Balneário Camboriú para todas as seções
  const exclusivos = pickExclusiveProperties(balnearioData.properties);
  const superDestaque = pickSuperHighlights(balnearioData.properties);
  const frenteMar = pickFrontSea(frenteMarData.properties);

  return (
    <HomeClient
      exclusivos={exclusivos}
      superDestaque={superDestaque}
      frenteMar={frenteMar}
      exclusivosMeta={buildMeta(balnearioData.fetchedAt, balnearioData.cacheLayer)}
      frenteMarMeta={buildMeta(frenteMarData.fetchedAt, frenteMarData.cacheLayer)}
      empreendimentos={empreendimentos.items}
    />
  );
}


