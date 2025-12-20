/**
 * Contrato do Provider de Imóveis
 * 
 * Interface que todos os providers (Vista, Pharos, etc.) devem implementar
 */

import type { 
  Property, 
  PropertyList, 
  PropertyFilters, 
  Pagination,
  Photo,
  Lead,
  LeadInput,
  LeadResult
} from '../models';

/**
 * Capacidades suportadas pelo provider
 */
export interface ProviderCapabilities {
  // Leitura
  supportsFiltering: boolean;
  supportsPagination: boolean;
  supportsDeltaSync: boolean; // sync incremental por updatedAt
  supportsSearch: boolean; // busca textual

  // Escrita
  supportsLeadCreation: boolean;
  supportsAppointmentScheduling: boolean;
  
  // Features avançadas
  supportsWebhooks: boolean;
  supportsVideoCall: boolean;
  supportsVirtualTour: boolean;

  // Limites
  maxPageSize: number;
  rateLimit?: {
    requests: number;
    period: 'minute' | 'hour' | 'day';
  };
}

/**
 * Interface principal do Provider
 */
export interface IListingProvider {
  /**
   * Retorna o nome do provider
   */
  getName(): string;

  /**
   * Retorna as capacidades suportadas
   */
  getCapabilities(): ProviderCapabilities;

  /**
   * Lista imóveis com filtros e paginação
   */
  listProperties(
    filters: PropertyFilters,
    pagination: Pagination
  ): Promise<PropertyList>;

  /**
   * Obtém detalhes completos de um imóvel
   */
  getPropertyDetails(id: string): Promise<Property>;

  /**
   * Obtém fotos de um imóvel
   */
  getPropertyPhotos(id: string): Promise<Photo[] | { photos: Photo[]; source: string }>;

  /**
   * Cria um lead (contato de cliente)
   */
  createLead(lead: LeadInput): Promise<LeadResult>;

  /**
   * Health check do provider
   */
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}

/**
 * Erro customizado para providers
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public operation: string,
    public originalError?: any,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

