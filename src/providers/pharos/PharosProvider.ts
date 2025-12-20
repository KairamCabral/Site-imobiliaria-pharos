/**
 * Pharos Provider (Futuro)
 * 
 * Implementação futura para o CRM próprio da Pharos
 * Por enquanto, apenas stub com NotImplemented
 */

import type {
  Property,
  PropertyList,
  PropertyFilters,
  Pagination,
  Photo,
  LeadInput,
  LeadResult,
} from '@/domain/models';
import type {
  IListingProvider,
  ProviderCapabilities,
} from '@/domain/contracts';

export class PharosProvider implements IListingProvider {
  getName(): string {
    return 'Pharos';
  }

  getCapabilities(): ProviderCapabilities {
    return {
      supportsFiltering: true,
      supportsPagination: true,
      supportsDeltaSync: true,
      supportsSearch: true,
      supportsLeadCreation: true,
      supportsAppointmentScheduling: true,
      supportsWebhooks: true,
      supportsVideoCall: true,
      supportsVirtualTour: true,
      maxPageSize: 100,
    };
  }

  async listProperties(
    filters: PropertyFilters,
    pagination: Pagination
  ): Promise<PropertyList> {
    throw new Error('[PharosProvider] Not implemented yet. Use Vista provider for now.');
  }

  async getPropertyDetails(id: string): Promise<Property> {
    throw new Error('[PharosProvider] Not implemented yet. Use Vista provider for now.');
  }

  async getPropertyPhotos(id: string): Promise<Photo[]> {
    throw new Error('[PharosProvider] Not implemented yet. Use Vista provider for now.');
  }

  async createLead(lead: LeadInput): Promise<LeadResult> {
    throw new Error('[PharosProvider] Not implemented yet. Use Vista provider for now.');
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    return {
      healthy: false,
      message: 'PharosProvider not implemented yet',
    };
  }
}

