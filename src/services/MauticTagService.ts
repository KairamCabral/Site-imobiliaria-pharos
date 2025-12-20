/**
 * Mautic Tag Service
 * 
 * Serviço para gerenciamento inteligente de tags no Mautic
 */

import type { LeadInput, LeadIntent } from '@/domain/models';
import { MauticProvider } from '@/providers/mautic';

export class MauticTagService {
  /**
   * Gera tags automáticas baseadas no lead
   */
  generateTags(lead: LeadInput): string[] {
    const tags: string[] = [];

    // Tag de intenção
    if (lead.intent) {
      tags.push(this.getIntentTag(lead.intent));
    }

    // Tag de origem
    if (lead.source) {
      tags.push(this.getSourceTag(lead.source));
    }

    // Tag de imóvel (se aplicável)
    if (lead.propertyCode) {
      tags.push(`imovel:${lead.propertyCode}`);
    }

    // Tag de corretor (se disponível em metadata)
    if (lead.metadata?.corretor_nome) {
      const corretorTag = this.normalizeTagName(lead.metadata.corretor_nome);
      tags.push(`corretor:${corretorTag}`);
    }

    // Tag de tipo de formulário (se disponível)
    if (lead.metadata?.form_type) {
      tags.push(`form:${lead.metadata.form_type}`);
    }

    // Tags de campanha (UTM)
    if (lead.utm?.campaign) {
      const campaignTag = this.normalizeTagName(lead.utm.campaign);
      tags.push(`campanha:${campaignTag}`);
    }

    // Tag de device type
    if (lead.metadata?.device_type) {
      tags.push(`device:${lead.metadata.device_type}`);
    }

    // Tag de tipo de imóvel (se disponível)
    if (lead.metadata?.imovel_tipo) {
      tags.push(`tipo_imovel:${lead.metadata.imovel_tipo}`);
    }

    return tags;
  }

  /**
   * Retorna tag de intenção formatada
   */
  private getIntentTag(intent: LeadIntent): string {
    const intentMap: Record<LeadIntent, string> = {
      buy: 'intent:comprar',
      rent: 'intent:alugar',
      sell: 'intent:vender',
      partnership: 'intent:parcerias',
      info: 'intent:informacao',
      other: 'intent:outros',
      evaluate: 'intent:avaliar',
    };

    return intentMap[intent] || `intent:${intent}`;
  }

  /**
   * Retorna tag de origem formatada
   */
  private getSourceTag(source: string): string {
    const sourceMap: Record<string, string> = {
      site: 'source:site',
      whatsapp: 'source:whatsapp',
      landing: 'source:landing_page',
      facebook: 'source:facebook',
      instagram: 'source:instagram',
      google: 'source:google',
    };

    return sourceMap[source] || `source:${this.normalizeTagName(source)}`;
  }

  /**
   * Normaliza nome de tag
   * Remove caracteres especiais e converte para formato válido
   */
  private normalizeTagName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9_-]/g, '_') // Substitui caracteres especiais por _
      .replace(/_+/g, '_') // Remove múltiplos underscores
      .replace(/^_|_$/g, ''); // Remove underscores do início/fim
  }

  /**
   * Aplica tags a um contato no Mautic
   */
  async applyTags(
    provider: MauticProvider,
    contactId: number,
    tags: string[]
  ): Promise<boolean> {
    if (tags.length === 0) {
      return true;
    }

    try {
      return await provider.addTagsToContact(contactId, tags);
    } catch (error) {
      console.error('[MauticTagService] Error applying tags:', error);
      return false;
    }
  }

  /**
   * Gera e aplica tags automaticamente
   */
  async generateAndApplyTags(
    provider: MauticProvider,
    contactId: number,
    lead: LeadInput
  ): Promise<string[]> {
    const tags = this.generateTags(lead);
    
    if (tags.length > 0) {
      await this.applyTags(provider, contactId, tags);
    }

    return tags;
  }

  /**
   * Remove tags de um contato
   */
  async removeTags(
    provider: MauticProvider,
    contactId: number,
    tags: string[]
  ): Promise<boolean> {
    if (tags.length === 0) {
      return true;
    }

    try {
      return await provider.removeTagsFromContact(contactId, tags);
    } catch (error) {
      console.error('[MauticTagService] Error removing tags:', error);
      return false;
    }
  }

  /**
   * Atualiza tags de um contato (remove antigas e adiciona novas)
   */
  async updateTags(
    provider: MauticProvider,
    contactId: number,
    oldTags: string[],
    newTags: string[]
  ): Promise<boolean> {
    try {
      // Remove tags antigas
      if (oldTags.length > 0) {
        await this.removeTags(provider, contactId, oldTags);
      }

      // Adiciona novas tags
      if (newTags.length > 0) {
        await this.applyTags(provider, contactId, newTags);
      }

      return true;
    } catch (error) {
      console.error('[MauticTagService] Error updating tags:', error);
      return false;
    }
  }
}

/**
 * Instância singleton do serviço
 */
let tagServiceInstance: MauticTagService | null = null;

/**
 * Retorna instância do MauticTagService (singleton)
 */
export function getMauticTagService(): MauticTagService {
  if (!tagServiceInstance) {
    tagServiceInstance = new MauticTagService();
  }
  return tagServiceInstance;
}

