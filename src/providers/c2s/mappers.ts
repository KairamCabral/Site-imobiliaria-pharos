/**
 * Mappers para conversão de dados entre o sistema e C2S
 */

import type { LeadInput } from '@/domain/models';
import type { Property } from '@/domain/models/Property';
import type {
  C2SLeadPayload,
  C2SCustomer,
  C2SProduct,
  C2SSeller,
  C2SLeadSource,
  C2SChannel,
  C2SNegotiationType,
  C2SProductType,
} from './types';

import {
  formatPhoneForC2S,
  sanitizeEmail,
  truncateText,
  normalizeText,
} from './utils';

/**
 * Mapeia tipo de imóvel do sistema para C2S
 */
export function mapPropertyTypeToC2S(type: string): C2SProductType {
  const typeMap: Record<string, C2SProductType> = {
    'apartamento': 'Apartamento',
    'casa': 'Casa',
    'cobertura': 'Cobertura',
    'terreno': 'Terreno',
    'comercial': 'Comercial',
    'loft': 'Loft',
    'kitnet': 'Kitnet',
  };

  return typeMap[type.toLowerCase()] || 'Apartamento';
}

/**
 * Mapeia finalidade do imóvel para tipo de negociação C2S
 */
export function mapFinalidadeToNegotiation(finalidade: string): C2SNegotiationType {
  const finalidadeNormalized = normalizeText(finalidade);
  
  if (finalidadeNormalized.includes('venda')) return 'Venda';
  if (finalidadeNormalized.includes('aluguel')) return 'Aluguel';
  if (finalidadeNormalized.includes('temporada')) return 'Temporada';
  
  return 'Venda'; // Default
}

/**
 * Mapeia intenção do lead para fonte
 */
export function mapIntentToSource(intent?: string): C2SLeadSource {
  const intentMap: Record<string, string> = {
    'buy': 'Interessado em Compra',
    'rent': 'Interessado em Aluguel',
    'sell': 'Quero Vender',
    'evaluate': 'Avaliação de Imóvel',
    'info': 'Solicitação de Informação',
  };

  return {
    name: intentMap[intent || 'info'] || 'Site Pharos',
  };
}

/**
 * Mapeia source do lead para canal C2S
 */
export function mapSourceToChannel(source?: string): C2SChannel {
  const sourceMap: Record<string, string> = {
    'site': 'Site',
    'facebook': 'Facebook',
    'instagram': 'Instagram',
    'google': 'Google Ads',
    'email': 'Email Marketing',
    'whatsapp': 'WhatsApp',
    'phone': 'Telefone',
    'referral': 'Indicação',
  };

  return {
    name: sourceMap[source || 'site'] || 'Site',
  };
}

/**
 * Cria objeto Customer para C2S
 */
export function mapToC2SCustomer(lead: LeadInput): C2SCustomer {
  return {
    name: lead.name.trim(),
    email: sanitizeEmail(lead.email || ''),
    phone: formatPhoneForC2S(lead.phone || ''),
    phone2: undefined, // Pode ser expandido se tivermos telefone secundário
    neighbourhood: undefined, // Pode ser extraído de metadados se necessário
  };
}

/**
 * Cria objeto Product (imóvel) para C2S
 */
export function mapToC2SProduct(
  property: Property | undefined,
  propertyCode?: string
): C2SProduct | undefined {
  if (!property && !propertyCode) {
    return undefined;
  }

  if (!property) {
    return {
      description: `Imóvel ${propertyCode}`,
      license_plate: propertyCode,
    };
  }

  const description = truncateText(
    property.description || property.title || `Imóvel ${property.code}`,
    500
  );

  return {
    description,
    brand: property.buildingName || property.buildingDetails?.name,
    model: mapPropertyTypeToC2S(property.type),
    version: property.code,
    license_plate: property.code,
    price: property.pricing.sale || property.pricing.rent,
    real_estate_detail: {
      negotiation_name: mapFinalidadeToNegotiation(property.purpose),
      area: property.specs.totalArea || property.specs.privateArea,
      rooms: property.specs.bedrooms,
      suites: property.specs.suites,
      bathrooms: property.specs.bathrooms,
      garage: property.specs.parkingSpots,
      location: property.address
        ? `${property.address.street || ''}${property.address.number ? ', ' + property.address.number : ''}`
        : undefined,
      neighborhood: property.address?.neighborhood,
      city: property.address?.city,
      state: property.address?.state,
    },
  };
}

/**
 * Cria objeto Seller (corretor) para C2S
 */
export function mapToC2SSeller(
  realtorId?: string,
  realtorName?: string,
  realtorPhone?: string,
  realtorEmail?: string
): C2SSeller | undefined {
  if (!realtorId && !realtorName) {
    return undefined;
  }

  return {
    name: realtorName || 'Equipe Pharos',
    phone: realtorPhone,
    email: realtorEmail,
    company: 'Imobiliária Pharos',
    external_id: realtorId,
  };
}

/**
 * Converte LeadInput do sistema para payload C2S completo
 */
export function mapLeadInputToC2SPayload(
  lead: LeadInput,
  property?: Property,
  config?: { companyId?: string; defaultSellerId?: string }
): C2SLeadPayload {
  // Título LIMPO baseado na intenção
  let description = '';
  
  // Se for formulário de Venda com a Pharos
  if (lead.metadata?.formType === 'venda-com-pharos') {
    description = 'Avaliação de Imóvel';
  } else if (property) {
    // Lead de imóvel específico
    description = `Interesse em Imóvel - ${property.code}`;
  } else {
    // Lead de formulário - título único baseado na intenção
    const intentMap: Record<string, string> = {
      'buy': 'Quero Comprar Imóvel',
      'sell': 'Quero Vender/Captar Imóvel',
      'rent': 'Quero Alugar Imóvel',
      'evaluate': 'Solicito Avaliação de Imóvel',
      'info': 'Solicito Informações',
      'other': 'Contato via Site',
    };
    
    description = intentMap[lead.intent || 'other'] || 'Contato via Site Pharos';
  }

  // Monta source (origem do lead)
  const sourceMap: Record<string, string> = {
    'site': 'Site Pharos',
    'facebook': 'Facebook Pharos',
    'instagram': 'Instagram Pharos',
    'google': 'Google Ads',
    'whatsapp': 'WhatsApp',
    'phone': 'Telefone',
    'referral': 'Indicação',
  };
  
  const source = sourceMap[lead.source || 'site'] || 'Site Pharos';

  // Monta payload no formato FLAT que o C2S espera
  const payload: C2SLeadPayload = {
    name: lead.name.trim(),
    email: sanitizeEmail(lead.email || ''),
    phone: formatPhoneForC2S(lead.phone || ''),
    source: source,
    description: description,
    tags: [], // Tags serão adicionadas depois se necessário
  };

  // Adiciona company_id se fornecido (pode ser obrigatório)
  if (config?.companyId) {
    payload.company_id = config.companyId;
  }

  // Adiciona seller_id padrão se houver (pode ser obrigatório)
  if (config?.defaultSellerId) {
    payload.seller_id = config.defaultSellerId;
  }

  // Adiciona metadata para rastreamento interno
  payload.metadata = {
    referral_url: lead.referralUrl,
    utm_source: lead.utm?.source,
    utm_medium: lead.utm?.medium,
    utm_campaign: lead.utm?.campaign,
    timestamp: new Date().toISOString(),
  };

  return payload;
}

/**
 * Cria mensagem detalhada para enviar após criar o lead
 */
export function buildLeadDetailsMessage(
  lead: LeadInput,
  property?: Property
): string {
  const lines: string[] = [];
  
  if (property) {
    // Detalhes do imóvel
    lines.push(`📋 DETALHES DO INTERESSE`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`Imóvel: ${property.code}`);
    lines.push(`Título: ${property.title}`);
    
    if (property.pricing.sale) {
      lines.push(`Valor Venda: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.pricing.sale)}`);
    }
    if (property.pricing.rent) {
      lines.push(`Valor Aluguel: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.pricing.rent)}`);
    }
    
    lines.push(``);
    
    if (lead.message) {
      lines.push(`💬 Mensagem do Cliente:`);
      lines.push(lead.message);
    }
  } else {
    // Detalhes do lead de formulário
    lines.push(`📋 INFORMAÇÕES DO CONTATO`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    
    // Orçamento
    if (lead.metadata?.orcamento) {
      const orcamentoMap: Record<string, string> = {
        'ate-300k': 'até R$ 300 mil',
        '300k-500k': 'R$ 300 mil - R$ 500 mil',
        '500k-800k': 'R$ 500 mil - R$ 800 mil',
        '800k-1mi': 'R$ 800 mil - R$ 1 milhão',
        '1mi-1.5mi': 'R$ 1 milhão - R$ 1.5 milhão',
        '1.5mi-2mi': 'R$ 1.5 milhão - R$ 2 milhões',
        '2mi-3mi': 'R$ 2 milhões - R$ 3 milhões',
        'acima-3mi': 'Acima de R$ 3 milhões',
      };
      
      const orcamento = orcamentoMap[lead.metadata.orcamento as string] || lead.metadata.orcamento;
      lines.push(`💰 Orçamento: ${orcamento}`);
    }
    
    // Características
    if (lead.metadata?.caracteristicas) {
      lines.push(`✨ Características Desejadas: ${lead.metadata.caracteristicas}`);
    }
    
    // Endereço
    if (lead.metadata?.endereco) {
      const label = lead.intent === 'sell' ? '📍 Endereço do Imóvel' : '📍 Endereço de Interesse';
      lines.push(`${label}: ${lead.metadata.endereco}`);
    }
    
    // DADOS DE CAPTAÇÃO (quando intent = 'sell')
    if (lead.intent === 'sell') {
      if (lead.metadata?.empreendimento) {
        lines.push(`🏢 Empreendimento: ${lead.metadata.empreendimento}`);
      }
      
      if (lead.metadata?.areaPrivativa) {
        lines.push(`📐 Área Privativa: ${lead.metadata.areaPrivativa}m²`);
      }
      
      if (lead.metadata?.dormitorios || lead.metadata?.suites || lead.metadata?.vagas) {
        const detalhes = [];
        if (lead.metadata.dormitorios) detalhes.push(`${lead.metadata.dormitorios} dorm.`);
        if (lead.metadata.suites) detalhes.push(`${lead.metadata.suites} suítes`);
        if (lead.metadata.vagas) detalhes.push(`${lead.metadata.vagas} vagas`);
        lines.push(`🏠 Composição: ${detalhes.join(' • ')}`);
      }
      
      if (lead.metadata?.mobiliado) {
        const mobiliado = lead.metadata.mobiliado === 'sim' ? 'Sim' : 'Não';
        lines.push(`🛋️ Mobiliado: ${mobiliado}`);
      }
    }
    
    // Preferência de contato
    if (lead.metadata?.preferenciaContato) {
      const prefMap: Record<string, string> = {
        'whatsapp': 'WhatsApp',
        'ligacao': 'Ligação Telefônica',
        'email': 'E-mail',
      };
      const pref = prefMap[lead.metadata.preferenciaContato as string] || lead.metadata.preferenciaContato;
      lines.push(`📞 Preferência de Contato: ${pref}`);
    }
    
    lines.push(``);
    
    // Mensagem adicional
    if (lead.message) {
      lines.push(`💬 Observações:`);
      lines.push(lead.message);
      lines.push(``);
    }
    
    lines.push(`🌐 Origem: Site Pharos Negócios`);
    
    // UTM se houver
    if (lead.utm?.source || lead.utm?.campaign) {
      lines.push(``);
      lines.push(`📊 Rastreamento:`);
      if (lead.utm.source) lines.push(`• Origem: ${lead.utm.source}`);
      if (lead.utm.medium) lines.push(`• Mídia: ${lead.utm.medium}`);
      if (lead.utm.campaign) lines.push(`• Campanha: ${lead.utm.campaign}`);
    }
  }
  
  return lines.join('\n');
}

/**
 * Extrai dados relevantes do Property para enriquecimento
 */
export function extractPropertyEnrichmentData(property: Property) {
  return {
    codigo: property.code,
    tipo: property.type,
    finalidade: property.purpose,
    preco: property.pricing.sale || property.pricing.rent,
    area: property.specs.totalArea || property.specs.privateArea,
    quartos: property.specs.bedrooms,
    suites: property.specs.suites,
    banheiros: property.specs.bathrooms,
    vagas: property.specs.parkingSpots,
    bairro: property.address?.neighborhood,
    cidade: property.address?.city,
    estado: property.address?.state,
    empreendimento: property.buildingName,
    destaque: property.isHighlight,
    lancamento: property.isLaunch,
    exclusivo: property.isExclusive,
    vistaParaMar: property.features?.oceanView,
  };
}

