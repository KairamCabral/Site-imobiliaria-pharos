/**
 * Lead Service
 * 
 * Serviço para gerenciamento de leads (contatos)
 * Integrado com Contact2Sale (C2S) para CRM
 */

import type { LeadInput, LeadResult } from '@/domain/models';
import { getListingProvider } from '@/providers/registry';
import { getC2SLeadProvider } from '@/providers/c2s/C2SLeadProvider';
import { loadC2SFeatureFlags } from '@/providers/c2s/utils';
import { getLeadQueue } from '@/providers/c2s/LeadQueue';
import { MauticProvider } from '@/providers/mautic';

/**
 * Serviço de Leads
 */
export class LeadService {
  private provider = getListingProvider();
  private c2sProvider = getC2SLeadProvider();
  private c2sFeatureFlags = loadC2SFeatureFlags();
  private mauticProvider: MauticProvider | null = null;

  constructor() {
    // Inicializa Mautic se configurado
    if (process.env.MAUTIC_BASE_URL) {
      try {
        this.mauticProvider = new MauticProvider();
        console.log('[LeadService] Mautic integração ativada');
      } catch (error) {
        console.warn('[LeadService] Mautic não disponível:', error);
      }
    }
  }

  /**
   * Cria um novo lead
   */
  async createLead(lead: LeadInput): Promise<LeadResult> {
    try {
      // Validações básicas
      if (!lead.name || lead.name.trim().length === 0) {
        return {
          success: false,
          message: 'Nome é obrigatório',
          errors: ['Nome é obrigatório'],
        };
      }

      if (!lead.email && !lead.phone) {
        return {
          success: false,
          message: 'Email ou telefone é obrigatório',
          errors: ['Informe ao menos email ou telefone'],
        };
      }

      // Email básico validation
      if (lead.email && !this.isValidEmail(lead.email)) {
        return {
          success: false,
          message: 'Email inválido',
          errors: ['Email inválido'],
        };
      }

      // Verifica se deve pular Vista
      const skipVista = lead.metadata?.skipVista === true;
      
      // Envia para o C2S (se habilitado) - PRIMEIRO
      let c2sResult: LeadResult | null = null;
      
      if (this.c2sFeatureFlags.enabled) {
        try {
          c2sResult = await this.c2sProvider.createLead(lead);
          console.log('[LeadService] Lead enviado para C2S:', c2sResult);
        } catch (error) {
          console.error('[LeadService] Erro ao enviar lead para C2S:', error);
          
          // Adiciona à fila de retry
          const queue = getLeadQueue();
          queue.addToQueue(lead, undefined, (error as Error).message);
        }
      }
      
      // Envia para Mautic (se habilitado E skipVista = true)
      if (skipVista && this.mauticProvider) {
        try {
          const mauticResult = await this.mauticProvider.createLead(lead);
          console.log('[LeadService] Lead enviado para Mautic:', mauticResult);
        } catch (error) {
          console.error('[LeadService] Erro ao enviar lead para Mautic:', error);
        }
      }
      
      // Envia para o provider principal (Vista/DWV) - OPCIONAL
      let providerResult: LeadResult;
      
      if (skipVista) {
        // Se pulou Vista, retorna resultado do C2S ou sucesso padrão
        providerResult = c2sResult || {
          success: true,
          message: 'Lead enviado para C2S com sucesso',
        };
      } else {
        // Envia para o provider principal (Vista/DWV + Mautic automático)
        providerResult = await this.provider.createLead(lead);
      }
      
      return providerResult;
    } catch (error) {
      console.error('[LeadService] Error creating lead:', error);
      
      return {
        success: false,
        message: 'Erro ao enviar contato. Tente novamente.',
        errors: [String(error)],
      };
    }
  }

  /**
   * Validação simples de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Cria lead de interesse em imóvel (com enriquecimento C2S)
   */
  async createPropertyInterestLead(
    propertyId: string,
    propertyCode: string,
    contact: {
      name: string;
      email?: string;
      phone?: string;
      phoneInternational?: string;
      ddi?: string;
      message?: string;
      propertyTitle?: string;
      realtorId?: string;
      realtorName?: string;
      realtorPhone?: string;
      realtorEmail?: string;
      source?: string;
      page?: string;
      utms?: any;
      idempotencyKey?: string;
      timestamp?: string;
    }
  ): Promise<LeadResult> {
    const lead: LeadInput = {
      name: contact.name,
      email: contact.email,
      phone: contact.phoneInternational || contact.phone,
      message: contact.message || `Interesse no imóvel ${propertyCode}`,
      subject: `Interesse no imóvel ${propertyCode}`,
      propertyId,
      propertyCode,
      intent: 'buy',
      source: (contact.source || 'site') as 'site',
      utm: contact.utms,
      referralUrl: contact.page,
      metadata: {
        realtorId: contact.realtorId,
        realtorName: contact.realtorName,
        realtorPhone: contact.realtorPhone,
        realtorEmail: contact.realtorEmail,
        propertyTitle: contact.propertyTitle,
        idempotencyKey: contact.idempotencyKey,
        timestamp: contact.timestamp,
        ddi: contact.ddi,
      },
    };

    return this.createLead(lead);
  }

  /**
   * Cria lead de contato geral
   */
  async createGeneralContactLead(contact: {
    name: string;
    email?: string;
    phone?: string;
    message: string;
    subject?: string;
  }): Promise<LeadResult> {
    const lead: LeadInput = {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
      subject: contact.subject || 'Contato pelo site',
      intent: 'info',
      source: 'site',
    };

    return this.createLead(lead);
  }
}

/**
 * Instância singleton do serviço
 */
let serviceInstance: LeadService | null = null;

/**
 * Retorna instância do LeadService (singleton)
 */
export function getLeadService(): LeadService {
  if (!serviceInstance) {
    serviceInstance = new LeadService();
  }
  return serviceInstance;
}

