import { unstable_cache } from 'next/cache';

import type { PropertyFilters, Pagination, PropertyList } from '@/domain/models';
import { getPropertyService } from '@/services';
import { stableSerialize } from '@/lib/cache';
import { adaptPropertiesToImoveis } from '@/utils/propertyAdapter';
import type { Imovel } from '@/types';

type PropertyListPagination = PropertyList['pagination'];

type CachedPropertyList = {
  properties: Imovel[];
  pagination: PropertyListPagination;
  cacheLayer: 'memory' | 'redis' | 'origin';
  fetchedAt: number;
};

type FetchPayload = {
  properties: Imovel[];
  pagination: PropertyListPagination;
  fetchedAt: number;
  cacheLayer: 'memory' | 'redis' | 'origin';
};

async function fetchPropertyList(
  hash: string,
  filters: PropertyFilters,
  pagination: Pagination,
): Promise<FetchPayload> {
  try {
    const service = getPropertyService();
    const { result, cache } = await service.searchProperties(filters, pagination);

    return {
      properties: adaptPropertiesToImoveis(result.properties),
      pagination: result.pagination,
      fetchedAt: cache.fetchedAt,
      cacheLayer: cache.layer,
    };
  } catch (error) {
    // ✅ Fallback: não derrubar build se API falhar
    console.error('[PropertyQueries] ❌ Erro ao buscar imóveis:', error);
    
    return {
      properties: [],
      pagination: { page: pagination.page, limit: pagination.limit, total: 0, totalPages: 0 },
      fetchedAt: Date.now(),
      cacheLayer: 'origin',
    };
  }
}

// ✅ Cache mais agressivo: 5 minutos
const cachedList = unstable_cache(fetchPropertyList, ['properties:list'], {
  revalidate: 300, // 5 minutos (antes: 120)
  tags: ['properties:list'],
});

export async function getCachedPropertyList(
  filters: PropertyFilters = {},
  pagination: Pagination = { page: 1, limit: 20 },
): Promise<CachedPropertyList> {
  const normalizedFilters = { ...filters };
  const normalizedPagination: Pagination = {
    page: pagination.page ?? 1,
    limit: pagination.limit ?? 20,
  };

  const hash = stableSerialize({ filters: normalizedFilters, pagination: normalizedPagination });
  return cachedList(hash, normalizedFilters, normalizedPagination);
}


