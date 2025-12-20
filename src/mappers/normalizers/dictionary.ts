/**
 * Dicionário de Normalização
 * 
 * Mapeia vocabulário de diferentes providers para o padrão Pharos
 */

import type { PropertyType, PropertyStatus, PropertyPurpose } from '@/domain/models';

/**
 * VISTA → PHAROS
 */

// Mapeamento de Status
export const VISTA_STATUS_MAP: Record<string, PropertyStatus> = {
  'Ativo': 'disponivel',
  'Disponível': 'disponivel',
  'Disponivel': 'disponivel',
  'Reservado': 'reservado',
  'Em Reserva': 'reservado',
  'Vendido': 'vendido',
  'Alugado': 'alugado',
  'Locado': 'alugado',
  'Lançamento': 'lancamento',
  'Lancamento': 'lancamento',
  'Em Construção': 'em-construcao',
  'Em Construcao': 'em-construcao',
  'Inativo': 'inativo',
  'Indisponível': 'inativo',
  'Indisponivel': 'inativo',
};

// Mapeamento de Tipos de Imóvel
// IMPORTANTE: Ordem importa! Cobertura deve vir antes de Casa para evitar conflito com "C"
export const VISTA_TYPE_MAP: Record<string, PropertyType> = {
  // Cobertura (prioridade para evitar conflito com Casa)
  'Cobertura': 'cobertura',
  'CO': 'cobertura',
  'COB': 'cobertura',
  'Cob': 'cobertura',
  
  // Apartamento
  'Apartamento': 'apartamento',
  'Apto': 'apartamento',
  'A': 'apartamento',
  'U': 'apartamento', // Vista usa "U" para unidade/apartamento
  'AP': 'apartamento',
  'Ap': 'apartamento',
  
  // Casa
  'Casa': 'casa',
  'C': 'casa',
  
  // Terreno
  'Terreno': 'terreno',
  'T': 'terreno',
  'Lote': 'terreno',
  
  // Comercial
  'Comercial': 'comercial',
  'Sala Comercial': 'sala',
  'Sala': 'sala',
  'Conjunto': 'sala',
  'Loja': 'loja',
  'Ponto Comercial': 'loja',
  
  // Outros
  'Galpão': 'galpao',
  'Galpao': 'galpao',
  'Chácara': 'chacara',
  'Chacara': 'chacara',
  'Sítio': 'chacara',
  'Sitio': 'chacara',
  'Fazenda': 'fazenda',
  'Diferenciado': 'diferenciado',
  'Dif': 'diferenciado',
  'DIF': 'diferenciado',
  'D': 'diferenciado', // Código curto usado pelo Vista
};

// Mapeamento de Finalidade
export const VISTA_PURPOSE_MAP: Record<string, PropertyPurpose> = {
  'Venda': 'venda',
  'Vender': 'venda',
  'Aluguel': 'aluguel',
  'Alugar': 'aluguel',
  'Locação': 'aluguel',
  'Locacao': 'aluguel',
  'Venda/Aluguel': 'ambos',
  'Venda e Aluguel': 'ambos',
};

/**
 * Normaliza status do Vista para padrão Pharos
 */
export function normalizeVistaStatus(vistaStatus: string): PropertyStatus {
  const normalized = VISTA_STATUS_MAP[vistaStatus];
  if (!normalized) {
    // Log desabilitado para performance (muito verboso)
    // console.warn(`[Dictionary] Status desconhecido do Vista: "${vistaStatus}". Usando "disponivel" como fallback.`);
    return 'disponivel';
  }
  return normalized;
}

/**
 * Normaliza tipo de imóvel do Vista para padrão Pharos
 */
export function normalizeVistaType(vistaType: string): PropertyType {
  if (!vistaType || typeof vistaType !== 'string') {
    console.warn(`[Dictionary] TipoImovel inválido:`, vistaType);
    return 'apartamento';
  }
  
  // Tentar match exato primeiro
  let normalized = VISTA_TYPE_MAP[vistaType];
  
  // Se não encontrou, tentar case-insensitive
  if (!normalized) {
    const vistaTypeUpper = vistaType.toUpperCase();
    const key = Object.keys(VISTA_TYPE_MAP).find(k => k.toUpperCase() === vistaTypeUpper);
    if (key) {
      normalized = VISTA_TYPE_MAP[key];
    }
  }
  
  if (!normalized) {
    // Log desabilitado para performance (muito verboso)
    // console.warn(`[Dictionary] Tipo de imóvel desconhecido do Vista: "${vistaType}". Usando "apartamento" como fallback.`);
    return 'apartamento';
  }
  
  return normalized;
}

/**
 * Normaliza finalidade do Vista para padrão Pharos
 */
export function normalizeVistaPurpose(vistaPurpose: string): PropertyPurpose {
  const normalized = VISTA_PURPOSE_MAP[vistaPurpose];
  if (!normalized) {
    // Log desabilitado para performance (muito verboso)
    // console.warn(`[Dictionary] Finalidade desconhecida do Vista: "${vistaPurpose}". Usando "venda" como fallback.`);
    return 'venda';
  }
  return normalized;
}

/**
 * PHAROS → VISTA (para queries)
 */

export const PHAROS_TO_VISTA_TYPE: Record<PropertyType, string> = {
  'apartamento': 'Apartamento',
  'casa': 'Casa',
  'cobertura': 'Cobertura',
  'terreno': 'Terreno',
  'comercial': 'Comercial',
  'sala': 'Sala Comercial',
  'loja': 'Loja',
  'galpao': 'Galpão',
  'chacara': 'Chácara',
  'fazenda': 'Fazenda',
  'diferenciado': 'Diferenciado',
};

export const PHAROS_TO_VISTA_PURPOSE: Record<PropertyPurpose, string> = {
  'venda': 'Venda',
  'aluguel': 'Aluguel',
  'ambos': 'Venda/Aluguel',
};

/**
 * Converte tipo Pharos para Vista (para filtros)
 */
export function toVistaType(pharosType: PropertyType): string {
  return PHAROS_TO_VISTA_TYPE[pharosType] || 'Apartamento';
}

/**
 * Converte finalidade Pharos para Vista (para filtros)
 */
export function toVistaPurpose(pharosPurpose: PropertyPurpose): string {
  return PHAROS_TO_VISTA_PURPOSE[pharosPurpose] || 'Venda';
}

