import HomeClient from './HomeClient';
import { getCachedPropertyList } from '@/lib/data/propertyQueries';
import { sortByPriority } from '@/utils/propertyPriority';
import type { Imovel } from '@/types';
import { listarEmpreendimentos } from '@/data/empreendimentos';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

type CacheLayer = 'memory' | 'redis' | 'origin';

type SectionMeta = {
  lastUpdated: number | null;
  cacheLayer: CacheLayer;
};

const DEFAULT_LIMIT = 6;
const FETCH_LIMIT = 200;

function pickExclusiveProperties(list: Imovel[], limit: number = DEFAULT_LIMIT): Imovel[] {
  const exclusivos = list.filter((item) => item.exclusivo === true);

  if (exclusivos.length === 0) {
    return [...list]
      .sort((a, b) => (b.preco ?? 0) - (a.preco ?? 0))
      .slice(0, limit);
  }

  return [...exclusivos].sort(sortByPriority as any).slice(0, limit);
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
  const [balnearioData, frenteMarData, empreendimentosResult] = await Promise.all([
    getCachedPropertyList(
      {
        city: 'Balneário Camboriú',
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        providersToUse: ['vista-only'], // Home usa apenas Vista
      },
      { page: 1, limit: FETCH_LIMIT },
    ),
    getCachedPropertyList(
      {
        sortBy: 'price',
        sortOrder: 'desc',
        providersToUse: ['vista-only'], // Home usa apenas Vista
      },
      { page: 1, limit: FETCH_LIMIT },
    ),
    listarEmpreendimentos({ page: 1, limit: 6 }),
  ]);

  const empreendimentos = empreendimentosResult;

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


