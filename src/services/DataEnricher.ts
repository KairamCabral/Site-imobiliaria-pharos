/**
 * Data Enricher Service
 * 
 * Serviço para enriquecimento automático de dados de leads
 * - Detecção de device (mobile/desktop/tablet)
 * - Parsing de User Agent
 * - Extração de UTM params
 * - Timezone e timestamp
 */

import type { LeadInput } from '@/domain/models';

export interface EnrichedData {
  device_type?: 'mobile' | 'desktop' | 'tablet';
  browser?: string;
  os?: string;
  timezone?: string;
  timestamp?: string;
  ip?: string;
  
  // Campos já enriquecidos
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer_url?: string;
}

export class DataEnricher {
  /**
   * Enriquece dados do lead com informações contextuais
   */
  enrichLead(lead: LeadInput, request?: Request | { headers: Headers }): LeadInput {
    const enrichedData = this.extractEnrichedData(request);
    
    // Adiciona dados enriquecidos aos metadados
    const metadata = {
      ...lead.metadata,
      ...enrichedData,
    };

    return {
      ...lead,
      metadata,
    };
  }

  /**
   * Extrai dados enriquecidos do request
   */
  private extractEnrichedData(request?: Request | { headers: Headers }): EnrichedData {
    const data: EnrichedData = {};

    if (!request) {
      return data;
    }

    // Extrai User Agent
    const userAgent = request.headers.get('user-agent') || '';
    if (userAgent) {
      const deviceInfo = this.parseUserAgent(userAgent);
      data.device_type = deviceInfo.deviceType;
      data.browser = deviceInfo.browser;
      data.os = deviceInfo.os;
    }

    // Timezone do cliente (se disponível nos headers)
    const timezone = request.headers.get('x-timezone');
    if (timezone) {
      data.timezone = timezone;
    }

    // Timestamp atual
    data.timestamp = new Date().toISOString();

    // IP do cliente (se disponível)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    data.ip = forwarded?.split(',')[0].trim() || realIp || undefined;

    return data;
  }

  /**
   * Parse do User Agent para detectar device, browser e OS
   */
  private parseUserAgent(userAgent: string): {
    deviceType: 'mobile' | 'desktop' | 'tablet';
    browser?: string;
    os?: string;
  } {
    const ua = userAgent.toLowerCase();

    // Detecta tipo de device
    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        userAgent
      )
    ) {
      deviceType = 'mobile';
    }

    // Detecta browser
    let browser: string | undefined;
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('edge')) browser = 'Edge';
    else if (ua.includes('opera')) browser = 'Opera';
    else if (ua.includes('msie') || ua.includes('trident')) browser = 'Internet Explorer';

    // Detecta OS
    let os: string | undefined;
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac os')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    return { deviceType, browser, os };
  }

  /**
   * Enriquece dados com informações do imóvel
   */
  async enrichWithPropertyData(
    lead: LeadInput,
    propertyData?: {
      codigo?: string;
      titulo?: string;
      preco?: number;
      quartos?: number;
      area?: number;
      tipo?: string;
      url?: string;
    }
  ): Promise<LeadInput> {
    if (!propertyData) {
      return lead;
    }

    const metadata = {
      ...lead.metadata,
      imovel_codigo: propertyData.codigo,
      imovel_titulo: propertyData.titulo,
      imovel_preco: propertyData.preco,
      imovel_quartos: propertyData.quartos,
      imovel_area: propertyData.area,
      imovel_tipo: propertyData.tipo,
      imovel_url: propertyData.url,
    };

    return {
      ...lead,
      metadata,
    };
  }

  /**
   * Extrai UTM params de uma URL
   */
  extractUtmParams(url: string): {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  } {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;

      return {
        source: params.get('utm_source') || undefined,
        medium: params.get('utm_medium') || undefined,
        campaign: params.get('utm_campaign') || undefined,
        term: params.get('utm_term') || undefined,
        content: params.get('utm_content') || undefined,
      };
    } catch {
      return {};
    }
  }

  /**
   * Valida e limpa dados antes de enviar
   */
  sanitize(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      // Remove valores null, undefined ou strings vazias
      if (value === null || value === undefined || value === '') {
        continue;
      }

      // Limpa strings
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

/**
 * Instância singleton do serviço
 */
let enricherInstance: DataEnricher | null = null;

/**
 * Retorna instância do DataEnricher (singleton)
 */
export function getDataEnricher(): DataEnricher {
  if (!enricherInstance) {
    enricherInstance = new DataEnricher();
  }
  return enricherInstance;
}

