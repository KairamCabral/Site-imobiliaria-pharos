/**
 * Mautic Provider
 * 
 * Provider para integração com Mautic CRM/Marketing Automation
 */

import type {
  IListingProvider,
  ProviderCapabilities,
} from '@/domain/contracts';
import type { Property, PropertyFilters, Photo, LeadInput, LeadResult } from '@/domain/models';
import { MauticClient } from './client';
import type {
  MauticConfig,
  MauticContact,
  MauticContactRequest,
  MauticResult,
  MauticLeadOptions,
} from './types';

export class MauticProvider implements IListingProvider {
  private client: MauticClient;
  private config: MauticConfig;

  constructor(config?: Partial<MauticConfig>) {
    this.config = {
      baseUrl: process.env.MAUTIC_BASE_URL || '',
      authType: (process.env.MAUTIC_AUTH_TYPE as 'basic' | 'oauth2') || 'basic',
      username: process.env.MAUTIC_API_USERNAME,
      password: process.env.MAUTIC_API_PASSWORD,
      clientId: process.env.MAUTIC_CLIENT_ID,
      clientSecret: process.env.MAUTIC_CLIENT_SECRET,
      timeout: parseInt(process.env.MAUTIC_TIMEOUT_MS || '30000', 10),
      ...config,
    };

    if (!this.config.baseUrl) {
      console.warn('[MauticProvider] MAUTIC_BASE_URL não configurada');
    }

    this.client = new MauticClient(this.config);
  }

  /**
   * Nome do provider
   */
  getName(): string {
    return 'Mautic';
  }

  /**
   * Capacidades do provider
   */
  getCapabilities(): ProviderCapabilities {
    return {
      supportsFiltering: false,
      supportsPagination: false,
      supportsDeltaSync: false,
      supportsSearch: false,
      supportsLeadCreation: true,
      supportsAppointmentScheduling: false,
      supportsWebhooks: true,
      supportsVideoCall: false,
      supportsVirtualTour: false,
      maxPageSize: 0,
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    if (!this.config.baseUrl) {
      return { healthy: false, message: 'Base URL not configured' };
    }
    const isHealthy = await this.client.healthCheck();
    return { healthy: isHealthy, message: isHealthy ? 'OK' : 'Failed' };
  }

  // ==========================================
  // Métodos não suportados (Mautic é só leads)
  // ==========================================

  async listProperties(filters: PropertyFilters, pagination: any): Promise<any> {
    throw new Error('MauticProvider não suporta listagem de imóveis');
  }

  async getPropertyDetails(id: string): Promise<Property> {
    throw new Error('MauticProvider não suporta detalhes de imóveis');
  }

  async getPropertyPhotos(id: string): Promise<Photo[]> {
    throw new Error('MauticProvider não suporta fotos');
  }

  // ==========================================
  // Métodos de Leads (principal funcionalidade)
  // ==========================================

  /**
   * Cria ou atualiza um lead no Mautic
   */
  async createLead(lead: LeadInput, options?: MauticLeadOptions): Promise<LeadResult> {
    try {
      if (!this.config.baseUrl) {
        return {
          success: false,
          message: 'Mautic não configurado (MAUTIC_BASE_URL ausente)',
          errors: ['Configuração ausente'],
        };
      }

      // Prepara dados do contato
      const contactData = this.buildContactData(lead);

      // Busca contato existente por email
      let contactId: number | undefined;
      let wasUpdated = false;

      if (lead.email) {
        const existing = await this.findContactByEmail(lead.email);
        if (existing) {
          contactId = existing.id;
          wasUpdated = true;
        }
      }

      // Cria ou atualiza contato
      let response;
      if (contactId && wasUpdated) {
        // Atualiza contato existente
        response = await this.client.patch(`/contacts/${contactId}/edit`, contactData);
      } else {
        // Cria novo contato
        response = await this.client.post('/contacts/new', contactData);
      }

      // Verifica erros
      if (response.errors && response.errors.length > 0) {
        return {
          success: false,
          message: response.errors[0].message,
          errors: response.errors.map(e => e.message),
        };
      }

      // Extrai ID do contato
      const contact = response.contact;
      const finalContactId = contact?.id || contactId;

      return {
        success: true,
        leadId: finalContactId?.toString(),
        message: wasUpdated 
          ? 'Contato atualizado no Mautic'
          : 'Contato criado no Mautic',
      };

    } catch (error: any) {
      console.error('[MauticProvider] Error creating lead:', error);
      return {
        success: false,
        message: `Erro ao enviar para Mautic: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Busca contato por email
   */
  private async findContactByEmail(email: string): Promise<MauticContact | null> {
    try {
      const response = await this.client.get(`/contacts?search=email:${encodeURIComponent(email)}`);
      
      if (response.contacts && Object.keys(response.contacts).length > 0) {
        const contactId = Object.keys(response.contacts)[0];
        return response.contacts[contactId];
      }
      
      return null;
    } catch (error) {
      console.error('[MauticProvider] Error finding contact:', error);
      return null;
    }
  }

  /**
   * Constrói dados do contato para enviar ao Mautic
   */
  private buildContactData(lead: LeadInput): MauticContactRequest {
    // Divide nome em primeiro e último
    const nameParts = lead.name.trim().split(' ');
    const firstname = nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';

    const data: MauticContactRequest = {
      email: lead.email,
      firstname,
      lastname,
      mobile: lead.phone,
      phone: lead.phone,
    };

    // Adiciona campos personalizados
    if (lead.message) {
      data.notes = lead.message;
    }

    if (lead.intent) {
      data.lead_intent = lead.intent;
    }

    if (lead.source) {
      data.lead_source = lead.source;
    }

    // UTM tracking
    if (lead.utm) {
      if (lead.utm.source) data.utm_source = lead.utm.source;
      if (lead.utm.medium) data.utm_medium = lead.utm.medium;
      if (lead.utm.campaign) data.utm_campaign = lead.utm.campaign;
      if (lead.utm.term) data.utm_term = lead.utm.term;
      if (lead.utm.content) data.utm_content = lead.utm.content;
    }

    // URL de referência
    if (lead.referralUrl) {
      data.referrer_url = lead.referralUrl;
    }

    // Campos do imóvel (se aplicável)
    if (lead.propertyCode) {
      data.imovel_codigo = lead.propertyCode;
    }

    // Metadados adicionais
    if (lead.metadata) {
      Object.keys(lead.metadata).forEach(key => {
        data[key] = lead.metadata![key];
      });
    }

    return data;
  }

  /**
   * Adiciona tags a um contato
   */
  async addTagsToContact(contactId: number, tags: string[]): Promise<boolean> {
    try {
      for (const tag of tags) {
        await this.client.post(`/contacts/${contactId}/tags/add`, { tag });
      }
      return true;
    } catch (error) {
      console.error('[MauticProvider] Error adding tags:', error);
      return false;
    }
  }

  /**
   * Remove tags de um contato
   */
  async removeTagsFromContact(contactId: number, tags: string[]): Promise<boolean> {
    try {
      for (const tag of tags) {
        await this.client.post(`/contacts/${contactId}/tags/remove`, { tag });
      }
      return true;
    } catch (error) {
      console.error('[MauticProvider] Error removing tags:', error);
      return false;
    }
  }
}

