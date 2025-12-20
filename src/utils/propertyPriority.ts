/**
 * Utilitário para calcular prioridade de ordenação de imóveis
 * 
 * Regras de negócio:
 * - Prioridade 1 (maior): Exclusivo
 * - Prioridade 2: Super destaque
 * - Prioridade 3: Tem Placa
 * - Prioridade 4: Destaque web
 * - Prioridade 5 (menor): Destaque genérico ou sem prioridade
 */

export interface PropertyPriorityFlags {
  isExclusive?: boolean;
  superHighlight?: boolean;
  hasSignboard?: boolean;
  webHighlight?: boolean;
  isHighlight?: boolean;
}

/**
 * Calcula a prioridade de um imóvel (quanto menor o número, maior a prioridade)
 * 
 * @param property - Objeto com as flags de prioridade
 * @returns Número de 1 a 5 (1 = maior prioridade, 5 = menor)
 */
export function getPropertyPriority(property: PropertyPriorityFlags): number {
  if (property.isExclusive) return 1;
  if (property.superHighlight) return 2;
  if (property.hasSignboard) return 3;
  if (property.webHighlight) return 4;
  if (property.isHighlight) return 5;
  return 6; // Sem prioridade especial
}

/**
 * Função comparadora para ordenar array de imóveis por prioridade
 * Uso: properties.sort(sortByPriority)
 * 
 * @param a - Primeiro imóvel
 * @param b - Segundo imóvel
 * @returns Número negativo se a tem maior prioridade, positivo se b tem maior prioridade
 */
export function sortByPriority(
  a: PropertyPriorityFlags & { updatedAt?: Date | string },
  b: PropertyPriorityFlags & { updatedAt?: Date | string }
): number {
  const priorityA = getPropertyPriority(a);
  const priorityB = getPropertyPriority(b);
  
  // Se prioridades são diferentes, ordena por prioridade
  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }
  
  // Se prioridades são iguais, ordena por data de atualização (mais recente primeiro)
  const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
  const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
  return dateB - dateA;
}

/**
 * Filtra imóveis que devem aparecer na primeira seção da home (Exclusivos)
 */
export function filterExclusiveProperties<T extends PropertyPriorityFlags>(properties: T[]): T[] {
  return properties.filter(p => p.isExclusive === true);
}

/**
 * Filtra imóveis que devem aparecer na segunda seção da home (Super destaque)
 */
export function filterSuperHighlightProperties<T extends PropertyPriorityFlags>(properties: T[]): T[] {
  return properties.filter(p => p.superHighlight === true);
}

/**
 * Filtra imóveis "Frente Mar" (precisa de característica específica)
 */
export function filterOceanFrontProperties<T extends { features?: { oceanView?: boolean } }>(properties: T[]): T[] {
  return properties.filter(p => p.features?.oceanView === true);
}

