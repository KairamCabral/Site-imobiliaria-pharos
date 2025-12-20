/**
 * Property Service
 * 
 * Camada de serviço que orquestra operações de imóveis
 * Intermedia entre UI e Provider, adicionando lógica de negócio quando necessário
 */

import type {
  Property,
  PropertyList,
  PropertyFilters,
  Pagination,
  Photo,
} from '@/domain/models';
import { getListingProvider } from '@/providers/registry';
import {
  getOrSetMultiCache,
  invalidateMultiCache,
  multiCacheStats,
  stableSerialize,
} from '@/lib/cache';

type CacheLayer = 'memory' | 'redis' | 'origin';

type CacheMetadata = {
  key: string;
  hit: boolean;
  layer: CacheLayer;
  expiresAt: number;
  ttl: number;
  fetchedAt: number;
};

export interface SearchPropertiesResult {
  result: PropertyList;
  cache: CacheMetadata;
}

/**
 * Serviço de Imóveis
 */
export class PropertyService {
  private _provider = getListingProvider();
  private readonly CACHE_TTL_MS = 1000 * 60 * 2; // 120 segundos
  // Aumentado para suportar carregamentos completos (Vista 243 + DWV 68)
  private readonly MAX_PAGE_SIZE = 1000;
  private readonly CACHE_NAMESPACE = 'properties:list';
  
  /**
   * Expõe o provider para acesso direto quando necessário
   */
  get provider() {
    return this._provider;
  }

  /**
   * Lista imóveis com filtros e paginação
   */
  async searchProperties(
    filters: PropertyFilters = {},
    pagination: Pagination = { page: 1, limit: 20 }
  ): Promise<SearchPropertiesResult> {
    try {
      const safePagination = this.normalizePagination(pagination);
      const key = this.buildCacheKey(filters, safePagination);
      const cacheResult = await getOrSetMultiCache<PropertyList>({
        namespace: this.CACHE_NAMESPACE,
        key,
        ttl: this.CACHE_TTL_MS,
        fetcher: () => this._provider.listProperties(filters, safePagination),
      });

      return {
        result: {
          // Não filtramos aqui para preservar total exato vindo do provider.
          // A filtragem visual (ex.: esconder imóveis sem fotos) é feita no client,
          // mantendo o contador alinhado ao total de imóveis disponíveis na fonte.
          properties: cacheResult.data.properties,
          pagination: cacheResult.data.pagination,
        },
        cache: {
          key,
          hit: cacheResult.meta.layer !== 'origin',
          layer: cacheResult.meta.layer,
          expiresAt: cacheResult.meta.expiresAt,
          ttl: cacheResult.meta.ttl,
          fetchedAt: cacheResult.meta.fetchedAt,
        },
      };
    } catch (error) {
      console.error('[PropertyService] Error searching properties:', error);
      throw error;
    }
  }

  /**
   * Obtém detalhes de um imóvel por ID
   */
  async getPropertyById(id: string): Promise<Property> {
    try {
      return await this._provider.getPropertyDetails(id);
    } catch (error) {
      console.error(`[PropertyService] Error getting property ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtém detalhes de um imóvel por código
   */
  async getPropertyByCode(code: string): Promise<Property> {
    // Por enquanto, código = id no Vista
    // No futuro, podemos ter busca específica
    return this.getPropertyById(code);
  }

  /**
   * Obtém detalhes de um imóvel (alias de getPropertyById)
   */
  async getPropertyDetails(id: string): Promise<Property> {
    return this.getPropertyById(id);
  }

  /**
   * Obtém fotos de um imóvel
   */
  async getPropertyPhotos(id: string): Promise<Photo[]> {
    try {
      const result = await this._provider.getPropertyPhotos(id);
      // getPropertyPhotos agora retorna { photos, source }
      return Array.isArray(result) ? result : result.photos;
    } catch (error) {
      console.error(`[PropertyService] Error getting photos for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Busca imóveis em destaque
   */
  async getFeaturedProperties(limit: number = 6): Promise<Property[]> {
    try {
      const result = await this._provider.listProperties(
        { sortBy: 'updatedAt', sortOrder: 'desc' },
        { page: 1, limit }
      );

      // Filtra apenas os destacados
      return result.properties.filter(p => p.isHighlight);
    } catch (error) {
      console.error('[PropertyService] Error getting featured properties:', error);
      return [];
    }
  }

  /**
   * Busca imóveis por tipo
   */
  async getPropertiesByType(
    type: string,
    pagination: Pagination = { page: 1, limit: 20 }
  ): Promise<SearchPropertiesResult> {
    const filters: PropertyFilters = {
      type: type as any,
    };

    return this.searchProperties(filters, pagination);
  }

  /**
   * Busca imóveis por cidade
   */
  async getPropertiesByCity(
    city: string,
    pagination: Pagination = { page: 1, limit: 20 }
  ): Promise<SearchPropertiesResult> {
    const filters: PropertyFilters = {
      city,
    };

    return this.searchProperties(filters, pagination);
  }

  /**
   * Busca imóveis por bairro
   */
  async getPropertiesByNeighborhood(
    neighborhood: string,
    pagination: Pagination = { page: 1, limit: 20 }
  ): Promise<SearchPropertiesResult> {
    const filters: PropertyFilters = {
      neighborhood,
    };

    return this.searchProperties(filters, pagination);
  }

  /**
   * Busca imóveis lançamento
   */
  async getLaunchProperties(
    pagination: Pagination = { page: 1, limit: 20 }
  ): Promise<Property[]> {
    try {
      const { result } = await this.searchProperties({}, pagination);
      return result.properties.filter(p => p.isLaunch);
    } catch (error) {
      console.error('[PropertyService] Error getting launch properties:', error);
      return [];
    }
  }

  /**
   * Health check do provider
   */
  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      return await this._provider.healthCheck();
    } catch (error) {
      return {
        healthy: false,
        message: `Health check failed: ${error}`,
      };
    }
  }
  private normalizePagination(pagination: Pagination): Pagination {
    const page = Math.max(1, Number(pagination?.page) || 1);
    const limit = Math.min(
      this.MAX_PAGE_SIZE,
      Math.max(1, Number(pagination?.limit) || 20),
    );

    return { page, limit };
  }

  private buildCacheKey(filters: PropertyFilters, pagination: Pagination): string {
    return stableSerialize({
      filters,
      pagination,
    });
  }

  getCacheStats() {
    return {
      namespace: this.CACHE_NAMESPACE,
      ttlMs: this.CACHE_TTL_MS,
      layers: multiCacheStats(),
    };
  }

  invalidateCache(key?: string) {
    invalidateMultiCache(this.CACHE_NAMESPACE, key).catch((error) => {
      console.warn('[PropertyService] Falha ao invalidar cache:', error);
    });
  }

  /**
   * Retorna informações sobre o provider ativo
   */
  getProviderInfo() {
    return {
      name: this._provider.getName(),
      capabilities: this._provider.getCapabilities(),
    };
  }
}

/**
 * Instância singleton do serviço
 */
let serviceInstance: PropertyService | null = null;

/**
 * Retorna instância do PropertyService (singleton)
 */
export function getPropertyService(): PropertyService {
  if (!serviceInstance) {
    serviceInstance = new PropertyService();
  }
  return serviceInstance;
}

