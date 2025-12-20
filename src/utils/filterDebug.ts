/**
 * Utilitários de Debug e Validação de Filtros
 * 
 * Sistema centralizado de logging e validação para rastreamento
 * completo do fluxo de filtros através da aplicação
 */

import type { PropertyFilters } from '@/domain/models';

/**
 * Estágios do fluxo de filtros
 */
export type FilterStage = 
  | 'frontend-send'      // Enviando do frontend
  | 'api-receive'        // Recebido na API route
  | 'api-processed'      // Processado na API route
  | 'provider-build'     // Construindo query no provider
  | 'provider-response'  // Resposta do provider
  | 'frontend-receive';  // Recebido no frontend

/**
 * Log estruturado de filtros com timestamp
 */
export function logFiltersDebug(stage: FilterStage, data: any): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const stageEmojis: Record<FilterStage, string> = {
    'frontend-send': '📤',
    'api-receive': '📥',
    'api-processed': '⚙️',
    'provider-build': '🔨',
    'provider-response': '✅',
    'frontend-receive': '🎯',
  };
  
  const stageLabels: Record<FilterStage, string> = {
    'frontend-send': 'Frontend → Enviando',
    'api-receive': 'API → Recebendo',
    'api-processed': 'API → Processado',
    'provider-build': 'Provider → Construindo Query',
    'provider-response': 'Provider → Resposta',
    'frontend-receive': 'Frontend → Recebendo',
  };
  
  console.group(`${stageEmojis[stage]} [FILTROS] ${stageLabels[stage]}`);
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  // Se for um objeto, exibir de forma estruturada
  if (data && typeof data === 'object') {
    if (Array.isArray(data)) {
      console.log('📊 Total de itens:', data.length);
      console.table(data.slice(0, 5)); // Primeiros 5 para não poluir
    } else {
      // Separar por tipo de dados
      const arrays: Record<string, any> = {};
      const scalars: Record<string, any> = {};
      
      Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          arrays[key] = value;
        } else {
          scalars[key] = value;
        }
      });
      
      if (Object.keys(scalars).length > 0) {
        console.log('📋 Valores escalares:');
        console.table(scalars);
      }
      
      if (Object.keys(arrays).length > 0) {
        console.log('📚 Arrays:');
        Object.entries(arrays).forEach(([key, value]) => {
          console.log(`  ${key}:`, value);
        });
      }
    }
  } else {
    console.log(data);
  }
  
  console.groupEnd();
}

/**
 * Resultado da validação
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valida estrutura e tipos de PropertyFilters
 */
export function validateFilters(filters: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!filters || typeof filters !== 'object') {
    errors.push('Filtros deve ser um objeto');
    return { valid: false, errors, warnings };
  }
  
  // Validar tipos de arrays
  const arrayFields = [
    'caracteristicasImovel',
    'caracteristicasLocalizacao',
    'caracteristicasEmpreendimento',
  ];
  
  arrayFields.forEach(field => {
    if (filters[field] !== undefined) {
      if (!Array.isArray(filters[field])) {
        errors.push(`${field} deve ser um array`);
      } else if (filters[field].length === 0) {
        warnings.push(`${field} está vazio`);
      }
    }
  });
  
  // Validar tipos de strings
  const stringFields = ['city', 'state', 'propertyCode', 'buildingName', 'search'];
  
  stringFields.forEach(field => {
    if (filters[field] !== undefined && typeof filters[field] !== 'string') {
      errors.push(`${field} deve ser uma string`);
    }
  });
  
  // Validar tipos numéricos
  const numberFields = [
    'minPrice', 'maxPrice', 'minRent', 'maxRent',
    'minBedrooms', 'maxBedrooms', 'minSuites',
    'minBathrooms', 'minParkingSpots', 'minArea', 'maxArea',
  ];
  
  numberFields.forEach(field => {
    if (filters[field] !== undefined) {
      const num = Number(filters[field]);
      if (isNaN(num)) {
        errors.push(`${field} deve ser um número válido`);
      }
    }
  });
  
  // Validar ranges (min < max)
  if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
    if (Number(filters.minPrice) > Number(filters.maxPrice)) {
      errors.push('minPrice não pode ser maior que maxPrice');
    }
  }
  
  if (filters.minArea !== undefined && filters.maxArea !== undefined) {
    if (Number(filters.minArea) > Number(filters.maxArea)) {
      errors.push('minArea não pode ser maior que maxArea');
    }
  }
  
  // Validar booleanos
  const booleanFields = ['furnished', 'petFriendly', 'accessible', 'isExclusive', 'isLaunch', 'superHighlight'];
  
  booleanFields.forEach(field => {
    if (filters[field] !== undefined && typeof filters[field] !== 'boolean') {
      errors.push(`${field} deve ser um booleano`);
    }
  });
  
  // Validar enum de distância do mar
  if (filters.distanciaMarRange !== undefined) {
    const validRanges = ['frente-mar', 'quadra-mar', 'segunda-quadra', 'terceira-quadra', 'ate-500m', 'ate-1km'];
    if (!validRanges.includes(filters.distanciaMarRange)) {
      errors.push(`distanciaMarRange inválido. Deve ser um de: ${validRanges.join(', ')}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Log de validação com resultado visual
 */
export function logValidation(filters: any, label: string = 'Filtros'): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const result = validateFilters(filters);
  
  console.group(`🔍 [VALIDAÇÃO] ${label}`);
  
  if (result.valid) {
    console.log('✅ Validação passou!');
  } else {
    console.error('❌ Validação falhou!');
  }
  
  if (result.errors.length > 0) {
    console.error('Erros:');
    result.errors.forEach(err => console.error(`  ❌ ${err}`));
  }
  
  if (result.warnings.length > 0) {
    console.warn('Avisos:');
    result.warnings.forEach(warn => console.warn(`  ⚠️  ${warn}`));
  }
  
  console.groupEnd();
}

/**
 * Comparar dois objetos de filtros e mostrar diferenças
 */
export function compareFilters(before: any, after: any): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group('🔄 [COMPARAÇÃO] Mudanças nos filtros');
  
  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);
  
  const changes: Array<{ campo: string; antes: any; depois: any }> = [];
  
  allKeys.forEach(key => {
    const beforeVal = before?.[key];
    const afterVal = after?.[key];
    
    if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      changes.push({
        campo: key,
        antes: beforeVal,
        depois: afterVal,
      });
    }
  });
  
  if (changes.length === 0) {
    console.log('Sem mudanças');
  } else {
    console.table(changes);
  }
  
  console.groupEnd();
}

/**
 * Criar snapshot dos filtros para debug
 */
export function snapshotFilters(filters: PropertyFilters, label: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  const snapshot = {
    timestamp: new Date().toISOString(),
    label,
    filters: JSON.parse(JSON.stringify(filters)),
  };
  
  // Salvar no sessionStorage para debug posterior
  try {
    const snapshots = JSON.parse(sessionStorage.getItem('filter-snapshots') || '[]');
    snapshots.push(snapshot);
    // Manter apenas últimos 10
    if (snapshots.length > 10) snapshots.shift();
    sessionStorage.setItem('filter-snapshots', JSON.stringify(snapshots));
  } catch (e) {
    console.warn('Não foi possível salvar snapshot:', e);
  }
}

/**
 * Recuperar histórico de snapshots
 */
export function getFilterHistory(): any[] {
  if (typeof window === 'undefined') return [];
  
  try {
    return JSON.parse(sessionStorage.getItem('filter-snapshots') || '[]');
  } catch {
    return [];
  }
}

/**
 * Limpar histórico de snapshots
 */
export function clearFilterHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.removeItem('filter-snapshots');
  } catch {
    // Silencioso
  }
}

