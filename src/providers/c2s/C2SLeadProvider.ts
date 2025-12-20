/**
 * Contact2Sale Lead Provider
 * 
 * Provider de leads que envia dados para o Contact2Sale
 * Implementa enriquecimento de dados, tags automáticas e tratamento de erros
 */

import type { LeadInput, LeadResult } from '@/domain/models';
import type { Property } from '@/domain/models/Property';
import type { C2SLeadResponse } from './types';

import { getC2SClient } from './C2SClient';
import { mapLeadInputToC2SPayload } from './mappers';
import { generateAutoTags } from './tags';
import { loadC2SFeatureFlags, createLog, createErrorLog } from './utils';
import { getListingProvider } from '../registry';

/**
 * Provider de Leads para Contact2Sale
 */
export class C2SLeadProvider {
  private client = getC2SClient();
  private featureFlags = loadC2SFeatureFlags();
  private propertyProvider = getListingProvider();

  /**
   * Cria um lead no C2S
   */
  async createLead(lead: LeadInput): Promise<LeadResult> {
    // Verifica se integração está habilitada
    if (!this.featureFlags.enabled) {
      createLog('createLead', 'C2S integration disabled');
      return {
        success: false,
        message: 'Integração C2S desabilitada',
      };
    }

    try {
      // Busca dados do imóvel se propertyId for fornecido
      let property: Property | undefined;
      
      if (lead.propertyId) {
        try {
          property = await this.propertyProvider.getPropertyDetails(lead.propertyId);
        } catch (error) {
          createErrorLog('getPropertyDetails', error, { propertyId: lead.propertyId });
          // Continua sem os dados do imóvel
        }
      }

      // Converte para payload C2S (com company_id e seller_id se configurados)
      const payload = mapLeadInputToC2SPayload(lead, property, {
        companyId: this.client['config'].companyId,
        defaultSellerId: this.client['config'].defaultSellerId,
      });

      // Gera tags automáticas se habilitado
      const tags: string[] = ['site']; // Tag padrão para leads do site
      
      if (this.featureFlags.autoTags) {
        const autoTags = generateAutoTags(lead, property);
        tags.push(...autoTags);
        
        createLog('autoTags', {
          leadName: lead.name,
          tagsCount: tags.length,
          tags: tags,
        });
      }
      
      payload.tags = tags;

      // Cria lead no C2S
      const response = await this.client.createLead(payload);

      // Marca lead como interagido (opcional, para workflows)
      // Envia detalhes organizados como mensagem
      try {
        const { buildLeadDetailsMessage } = await import('./mappers');
        const detailsMessage = buildLeadDetailsMessage(lead, property);
        
        if (detailsMessage) {
          await this.client.createLeadMessage(response.lead_id, detailsMessage);
        }
      } catch (error) {
        // Não crítico, apenas log
        createErrorLog('createLeadMessage', error);
      }

      // Marca lead como interagido (primeira ação automatizada)
      try {
        await this.client.markLeadAsInteracted(response.lead_id);
      } catch (error) {
        // Não crítico, apenas log
        createErrorLog('markLeadAsInteracted', error);
      }

      return {
        success: true,
        leadId: response.lead_id,
        message: 'Lead criado com sucesso no C2S',
      };
    } catch (error: any) {
      createErrorLog('createLead', error, {
        leadName: lead.name,
        propertyCode: lead.propertyCode,
      });

      return {
        success: false,
        message: 'Erro ao criar lead no C2S',
        errors: [error.message || 'Erro desconhecido'],
      };
    }
  }

  /**
   * Cria lead com enriquecimento completo de dados
   */
  async createEnrichedLead(
    lead: LeadInput,
    options?: {
      property?: Property;
      additionalTags?: string[];
      skipAutoTags?: boolean;
    }
  ): Promise<LeadResult> {
    if (!this.featureFlags.enabled) {
      return {
        success: false,
        message: 'Integração C2S desabilitada',
      };
    }

    try {
      // Usa property fornecido ou busca
      let property = options?.property;
      
      if (!property && lead.propertyId) {
        try {
          property = await this.propertyProvider.getPropertyDetails(lead.propertyId);
        } catch (error) {
          createErrorLog('getPropertyDetails', error);
        }
      }

      // Converte para payload C2S
      const payload = mapLeadInputToC2SPayload(lead, property);

      // Adiciona tags
      const tags: string[] = [];
      
      if (!options?.skipAutoTags && this.featureFlags.autoTags) {
        tags.push(...generateAutoTags(lead, property));
      }
      
      if (options?.additionalTags) {
        tags.push(...options.additionalTags);
      }

      if (tags.length > 0) {
        payload.tags = Array.from(new Set(tags)); // Remove duplicatas
      }

      // Cria lead
      const response = await this.client.createLead(payload);

      // Envia detalhes organizados como mensagem
      try {
        const { buildLeadDetailsMessage } = await import('./mappers');
        const detailsMessage = buildLeadDetailsMessage(lead, property);
        
        if (detailsMessage) {
          await this.client.createLeadMessage(response.lead_id, detailsMessage);
        }
      } catch (error) {
        // Não crítico, apenas log
        createErrorLog('createLeadMessage', error);
      }

      return {
        success: true,
        leadId: response.lead_id,
        message: 'Lead enriquecido criado no C2S',
      };
    } catch (error: any) {
      createErrorLog('createEnrichedLead', error);

      return {
        success: false,
        message: 'Erro ao criar lead enriquecido',
        errors: [error.message],
      };
    }
  }

  /**
   * Atualiza tags de um lead existente
   */
  async updateLeadTags(leadId: string, tags: string[]): Promise<void> {
    if (!this.featureFlags.autoTags) return;

    try {
      for (const tag of tags) {
        await this.client.createLeadTag(leadId, tag);
      }
      
      createLog('updateLeadTags', { leadId, tagsCount: tags.length });
    } catch (error) {
      createErrorLog('updateLeadTags', error, { leadId });
    }
  }

  /**
   * Cria atividade de agendamento de visita
   */
  async createVisitActivity(
    leadId: string,
    visitData: {
      scheduledDate: string;
      propertyCode?: string;
      sellerId?: string;
      notes?: string;
    }
  ): Promise<LeadResult> {
    if (!this.featureFlags.visitIntegration) {
      return {
        success: false,
        message: 'Integração de visitas desabilitada',
      };
    }

    try {
      await this.client.createVisit({
        lead_id: leadId,
        seller_id: visitData.sellerId,
        property_code: visitData.propertyCode,
        scheduled_date: visitData.scheduledDate,
        notes: visitData.notes,
        status: 'scheduled',
      });

      // Adiciona tag de visita agendada
      if (this.featureFlags.autoTags) {
        await this.client.createLeadTag(leadId, 'agendou-visita');
        await this.client.createLeadTag(leadId, 'hot-lead');
      }

      return {
        success: true,
        message: 'Visita agendada no C2S',
      };
    } catch (error: any) {
      createErrorLog('createVisitActivity', error, { leadId });

      return {
        success: false,
        message: 'Erro ao agendar visita no C2S',
        errors: [error.message],
      };
    }
  }

  /**
   * Marca lead como negócio fechado
   */
  async markDoneDeal(
    leadId: string,
    details: {
      price?: number;
      notes?: string;
    }
  ): Promise<LeadResult> {
    try {
      await this.client.markDoneDeal({
        lead_id: leadId,
        done: true,
        done_price: details.price,
        done_details: details.notes,
        closed_at: new Date().toISOString(),
      });

      createLog('markDoneDeal', { leadId, price: details.price });

      return {
        success: true,
        message: 'Negócio fechado registrado no C2S',
      };
    } catch (error: any) {
      createErrorLog('markDoneDeal', error, { leadId });

      return {
        success: false,
        message: 'Erro ao marcar negócio fechado',
        errors: [error.message],
      };
    }
  }

  /**
   * Health check do provider
   */
  async healthCheck(): Promise<{ healthy: boolean; message?: string; latency?: number }> {
    if (!this.featureFlags.enabled) {
      return {
        healthy: false,
        message: 'Integração C2S desabilitada',
      };
    }

    try {
      const result = await this.client.healthCheck();
      return result;
    } catch (error: any) {
      return {
        healthy: false,
        message: error.message || 'Erro ao conectar com C2S',
      };
    }
  }

  /**
   * Retorna estatísticas do provider
   */
  getStats() {
    return {
      ...this.client.getStats(),
      featureFlags: this.featureFlags,
    };
  }
}

/**
 * Instância singleton do provider
 */
let providerInstance: C2SLeadProvider | null = null;

/**
 * Retorna instância do C2SLeadProvider (singleton)
 */
export function getC2SLeadProvider(): C2SLeadProvider {
  if (!providerInstance) {
    providerInstance = new C2SLeadProvider();
  }
  return providerInstance;
}

/**
 * Reseta instância do provider (útil para testes)
 */
export function resetC2SLeadProvider(): void {
  providerInstance = null;
}

