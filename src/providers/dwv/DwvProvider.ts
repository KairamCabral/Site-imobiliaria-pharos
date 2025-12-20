import type {
  IListingProvider,
  ProviderCapabilities,
} from '@/domain/contracts';
import type {
  Property,
  PropertyList,
  PropertyFilters,
  Pagination,
  Photo,
  LeadInput,
  LeadResult,
} from '@/domain/models';
import { getDwvClient } from './client';
import type { DwvListResponse, DwvPropertyResponse, DwvProperty } from './types';
import { mapDwvToProperty } from '@/mappers/dwv';

export class DwvProvider implements IListingProvider {
  private client = getDwvClient();

  getName(): string {
    return 'DWV';
  }

  getCapabilities(): ProviderCapabilities {
    return {
      supportsFiltering: true,
      supportsPagination: true,
      supportsDeltaSync: true,
      supportsSearch: true,
      supportsLeadCreation: false,
      supportsAppointmentScheduling: false,
      supportsWebhooks: false,
      supportsVideoCall: false,
      supportsVirtualTour: true,
      maxPageSize: 50,
      rateLimit: {
        requests: 100,
        period: 'minute',
      },
    };
  }

  async listProperties(
    filters: PropertyFilters,
    pagination: Pagination,
  ): Promise<PropertyList> {
    // Atalho: se vier propertyCode, busca direto por detalhes e retorna 1
    if (filters.propertyCode) {
      try {
        const property = await this.getPropertyDetails(filters.propertyCode);
        return {
          properties: property ? [property] : [],
          pagination: {
            page: 1,
            limit: 1,
            total: property ? 1 : 0,
            totalPages: property ? 1 : 0,
          },
        };
      } catch (err) {
        console.warn('[DwvProvider] propertyCode não encontrado, tentando listagem:', err);
        // segue fluxo normal de listagem
      }
    }

    const query = this.buildQueryParams(filters, pagination);
    const response = await this.client.get<DwvListResponse>('/integration/properties', query);

    const data = response?.data ?? [];
    const properties = data.map((item) => mapSafely(item));

    const total = response?.total ?? properties.length;
    const limit = pagination.limit;
    const totalPages = response?.lastPage ?? Math.max(1, Math.ceil(total / Math.max(limit, 1)));

    return {
      properties,
      pagination: {
        page: response?.page ?? pagination.page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getPropertyDetails(id: string): Promise<Property> {
    // Extrair ID numérico se for código P{id}
    const numericId = id.startsWith('P') ? id.substring(1) : id;
    
    try {
      const response = await this.client.get<DwvPropertyResponse>(`/integration/properties/${encodeURIComponent(numericId)}`);
      if (response?.data) {
        return mapDwvToProperty(response.data);
      }
    } catch (error) {
      // Silenciar erro esperado para IDs inválidos
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[DwvProvider] ID não encontrado: ${numericId}`);
      }
    }

    // Fallback: tentar buscar na listagem
    try {
      const list = await this.listProperties({}, { page: 1, limit: 100 });
      const found = list.properties.find(p => p.id === id || p.code === id);
      if (found) {
        return found;
      }
    } catch (error) {
      // Silenciar erro de fallback
    }
    
    throw new Error(`Imóvel ${id} não encontrado no DWV.`);
  }

  async getPropertyPhotos(id: string): Promise<{ photos: Photo[]; source: string }> {
    const property = await this.getPropertyDetails(id);
    return {
      photos: property.photos,
      source: 'dwv',
    };
  }

  async createLead(_: LeadInput): Promise<LeadResult> {
    throw new Error('[DWV] Criação de leads não suportada.');
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      await this.client.get<DwvListResponse>('/integration/properties', { limit: 1 });
      return { healthy: true };
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private buildQueryParams(filters: PropertyFilters, pagination: Pagination) {
    const params: Record<string, string | number> = {
      limit: pagination.limit,
      page: pagination.page,
    };

    // Localização
    // Quando filtrando por código, não restringir por cidade para evitar falso negativo
    if (filters.city && !filters.propertyCode) params.city = asCsv(filters.city);
    if (filters.state) params.state = asCsv(filters.state);
    if (filters.neighborhood) params.neighborhood = asCsv(filters.neighborhood);
    
    // Tipo e Status
    if (filters.type) params.types = asCsv(filters.type);
    if (filters.status) params.status = asCsv(filters.status);
    
    // Busca por código - aceita variações: "593491", "P593491", "p593491"
    if (filters.propertyCode) {
      const code = filters.propertyCode.trim();
      // Se começar com P/p, usar como está; senão, tentar com e sem P
      const searchTerm = /^p\d+$/i.test(code) ? code.substring(1) : code.replace(/^p/i, '');
      params.search = searchTerm;
      console.log('[DwvProvider] 🔍 Busca por código:', filters.propertyCode, '→', searchTerm);
    }
    if (filters.buildingName) params.building_title = filters.buildingName;
    if (filters.search) params.search = filters.search;
    
    // Quartos, Suítes, Vagas
    if (filters.minBedrooms || filters.bedroomsExact?.length) {
      params.bedrooms = filters.bedroomsExact?.length
        ? filters.bedroomsExact.join(',')
        : `${filters.minBedrooms}+`;
    }
    if (filters.minSuites || filters.suitesExact?.length) {
      params.unit_suites = filters.suitesExact?.length
        ? filters.suitesExact.join(',')
        : `${filters.minSuites}+`;
    }
    if (filters.minParkingSpots || filters.parkingExact?.length) {
      params.unit_parking_spaces = filters.parkingExact?.length
        ? filters.parkingExact.join(',')
        : `${filters.minParkingSpots}+`;
    }
    
    // Preço
    if (filters.minPrice) params.min_sale = filters.minPrice;
    if (filters.maxPrice) params.max_sale = filters.maxPrice;
    if (filters.minRent) params.min_rent = filters.minRent;
    if (filters.maxRent) params.max_rent = filters.maxRent;
    
    // Área
    if (filters.minArea) params.min_total_area = filters.minArea;
    if (filters.maxArea) params.max_total_area = filters.maxArea;
    
    // Finalidade
    if (filters.purpose === 'aluguel') params.rent = 'true';
    if (filters.purpose === 'venda') params.rent = 'false';
    
    // Data de atualização
    if (filters.updatedSince) {
      params.last_updates = `${filters.updatedSince.toISOString().slice(0, 10)},${new Date().toISOString().slice(0, 10)}`;
    }

    return params;
  }
}

function asCsv(value: string | string[] | Property['type'] | Property['type'][]): string {
  if (Array.isArray(value)) {
    return value.map(v => String(v)).join(',');
  }
  return String(value);
}

function mapSafely(raw: DwvProperty): Property {
  try {
    return mapDwvToProperty(raw);
  } catch (error) {
    console.error('[DwvProvider] Erro ao mapear imóvel DWV:', error, raw);
    throw error;
  }
}

