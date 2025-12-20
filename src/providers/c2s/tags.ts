/**
 * Sistema de Tags Automáticas para Leads C2S
 * 
 * Gera tags inteligentes baseadas em regras de negócio
 */

import type { LeadInput } from '@/domain/models';
import type { Property } from '@/domain/models/Property';
import { normalizeText } from './utils';

/**
 * Regras de tags por valor do imóvel
 */
function getValueTags(price?: number): string[] {
  if (!price) return [];

  if (price >= 1000000) {
    return ['valor:alto', 'alto-padrao'];
  } else if (price >= 500000) {
    return ['valor:medio'];
  } else {
    return ['valor:entry', 'primeira-compra'];
  }
}

/**
 * Tags por tipo de imóvel
 */
function getPropertyTypeTags(type?: string): string[] {
  if (!type) return [];

  const typeNormalized = normalizeText(type);
  
  const tags = [`tipo:${typeNormalized}`];

  // Tags adicionais por tipo
  if (typeNormalized === 'cobertura') {
    tags.push('premium');
  }
  
  if (typeNormalized === 'terreno') {
    tags.push('investimento');
  }

  return tags;
}

/**
 * Tags por localização
 */
function getLocationTags(property?: Property): string[] {
  if (!property || !property.address) return [];

  const tags: string[] = [];

  // Tag de bairro
  if (property.address.neighborhood) {
    const bairroSlug = normalizeText(property.address.neighborhood);
    tags.push(`bairro:${bairroSlug}`);

    // Regiões específicas de Balneário Camboriú (exemplo)
    const praias = ['centro', 'barra-sul', 'pioneiros', 'nações'];
    if (praias.some(praia => bairroSlug.includes(praia))) {
      tags.push('regiao:praia');
    }
  }

  // Tag de cidade
  if (property.address.city) {
    const cidadeSlug = normalizeText(property.address.city);
    tags.push(`cidade:${cidadeSlug}`);
  }

  // Tags especiais de localização
  if (property.features?.oceanView) {
    tags.push('vista-mar', 'premium');
  }

  if (property.distanciaMar !== undefined && property.distanciaMar === 0) {
    tags.push('frente-mar', 'premium');
  } else if (property.distanciaMar !== undefined && property.distanciaMar <= 200) {
    tags.push('proximo-mar');
  }

  return tags;
}

/**
 * Tags por características do imóvel
 */
function getFeatureTags(property?: Property): string[] {
  if (!property) return [];

  const tags: string[] = [];

  // Status e destaques
  if (property.isLaunch) {
    tags.push('lancamento', 'novidade');
  }

  if (property.isExclusive) {
    tags.push('exclusivo', 'premium');
  }

  if (property.superHighlight) {
    tags.push('super-destaque');
  }

  if (property.obraStatus === 'pronto') {
    tags.push('pronto', 'pronto-morar');
  } else if (property.obraStatus === 'construcao') {
    tags.push('em-construcao', 'na-planta');
  }

  // Características físicas
  const bedrooms = property.specs.bedrooms || 0;
  if (bedrooms >= 4) {
    tags.push('familia-grande');
  }

  const suites = property.specs.suites || 0;
  if (suites >= 2) {
    tags.push('multiplas-suites');
  }

  const parking = property.specs.parkingSpots || 0;
  if (parking >= 2) {
    tags.push('multiplas-vagas');
  }

  const area = property.specs.totalArea || property.specs.privateArea || 0;
  if (area >= 200) {
    tags.push('grande-metragem', 'espacoso');
  }

  // Características especiais
  if (property.features?.furnished) {
    tags.push('mobiliado');
  }

  if (property.features?.petFriendly) {
    tags.push('pet-friendly');
  }

  return tags;
}

/**
 * Tags por origem e UTMs
 */
function getOriginTags(lead: LeadInput): string[] {
  const tags: string[] = [];

  // Tag de origem
  if (lead.source) {
    tags.push(`origem:${lead.source}`);
  }

  // Tags de UTM
  if (lead.utm) {
    if (lead.utm.source) {
      tags.push(`utm-source:${normalizeText(lead.utm.source)}`);
    }

    if (lead.utm.medium) {
      tags.push(`utm-medium:${normalizeText(lead.utm.medium)}`);
    }

    if (lead.utm.campaign) {
      const campaignSlug = normalizeText(lead.utm.campaign);
      tags.push(`campanha:${campaignSlug}`);
    }
  }

  return tags;
}

/**
 * Tags por intenção do lead
 */
function getIntentTags(intent?: string): string[] {
  if (!intent) return [];

  const intentMap: Record<string, string[]> = {
    'buy': ['intencao:compra', 'comprador'],
    'rent': ['intencao:aluguel', 'locatario'],
    'sell': ['intencao:venda', 'vendedor', 'lead-reverso'],
    'evaluate': ['intencao:avaliacao', 'potencial-vendedor'],
    'info': ['intencao:informacao', 'pesquisando'],
  };

  return intentMap[intent] || [];
}

/**
 * Tags de comportamento e contexto
 */
function getBehaviorTags(lead: LeadInput, property?: Property): string[] {
  const tags: string[] = [];

  // Primeiro contato
  tags.push('primeiro-contato');

  // Aceita comunicação
  if (lead.acceptsWhatsapp) {
    tags.push('aceita-whatsapp');
  }

  if (lead.acceptsMarketing) {
    tags.push('aceita-marketing');
  }

  // Horário do contato (análise de urgência)
  const hour = new Date().getHours();
  if (hour >= 8 && hour <= 18) {
    tags.push('horario-comercial');
  } else {
    tags.push('fora-horario', 'urgente');
  }

  // Fim de semana
  const day = new Date().getDay();
  if (day === 0 || day === 6) {
    tags.push('final-semana', 'engajado');
  }

  return tags;
}

/**
 * Tags por finalidade
 */
function getFinalidadeTags(finalidade?: string): string[] {
  if (!finalidade) return [];

  const finalidadeNormalized = normalizeText(finalidade);
  
  if (finalidadeNormalized.includes('venda')) {
    return ['finalidade:venda'];
  }
  
  if (finalidadeNormalized.includes('aluguel')) {
    return ['finalidade:aluguel'];
  }
  
  if (finalidadeNormalized.includes('temporada')) {
    return ['finalidade:temporada', 'investidor'];
  }

  return [];
}

/**
 * Gera todas as tags automáticas para um lead
 */
export function generateAutoTags(lead: LeadInput, property?: Property): string[] {
  const allTags: string[] = [
    ...getOriginTags(lead),
    ...getIntentTags(lead.intent),
    ...getBehaviorTags(lead, property),
  ];

  if (property) {
    allTags.push(
      ...getValueTags(property.pricing.sale || property.pricing.rent),
      ...getPropertyTypeTags(property.type),
      ...getFinalidadeTags(property.purpose),
      ...getLocationTags(property),
      ...getFeatureTags(property)
    );
  }

  // Remove duplicatas e tags vazias
  const uniqueTags = Array.from(new Set(allTags.filter(tag => tag && tag.length > 0)));

  // Limita a 20 tags para não sobrecarregar o sistema
  return uniqueTags.slice(0, 20);
}

/**
 * Gera tags específicas para um tipo de evento
 */
export function generateEventTags(eventType: 'visit' | 'contact' | 'proposal'): string[] {
  const eventMap: Record<string, string[]> = {
    'visit': ['agendou-visita', 'hot-lead', 'alta-intencao'],
    'contact': ['fez-contato'],
    'proposal': ['recebeu-proposta', 'negociacao-avancada'],
  };

  return eventMap[eventType] || [];
}

/**
 * Gera tags baseadas em valor e localização para regras de distribuição
 */
export function generateDistributionTags(property?: Property): string[] {
  if (!property) return [];

  const tags: string[] = [];

  const price = property.pricing.sale || property.pricing.rent || 0;

  // Classificação por valor para distribuição
  if (price >= 2000000) {
    tags.push('vip', 'alto-valor');
  } else if (price >= 1000000) {
    tags.push('medio-alto-valor');
  }

  // Classificação por região para distribuição regional
  if (property.address?.neighborhood) {
    const bairroNormalized = normalizeText(property.address.neighborhood);
    
    // Regiões nobres (exemplo - ajustar conforme realidade)
    const regiõesNobres = ['centro', 'barra-sul', 'pioneiros'];
    if (regiõesNobres.some(regiao => bairroNormalized.includes(regiao))) {
      tags.push('regiao-nobre');
    }
  }

  return tags;
}

