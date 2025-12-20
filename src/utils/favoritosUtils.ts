/**
 * PHAROS - UTILITÁRIOS DE FAVORITOS
 * Funções auxiliares para trabalhar com favoritos
 */

import type { Favorito, Imovel } from '@/types';
import { imoveisMock } from '@/data/imoveis';

// Cache de imóveis da API para evitar múltiplas requisições
let apiImoveisCache: Imovel[] = [];
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Busca imóveis da API
 * @returns Promise com array de imóveis da API
 */
async function fetchImoveisFromAPI(): Promise<Imovel[]> {
  try {
    // Verificar se o cache ainda é válido
    if (apiImoveisCache.length > 0 && Date.now() - cacheTime < CACHE_DURATION) {
      return apiImoveisCache;
    }

    // Buscar da mesma API que o resto da aplicação usa
    const response = await fetch('/api/properties?limit=1000');
    if (!response.ok) {
      throw new Error(`Erro ao buscar imóveis da API: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      apiImoveisCache = result.data || [];
      cacheTime = Date.now();
      console.log(`✅ Cache de favoritos carregado: ${apiImoveisCache.length} imóveis`);
    } else {
      throw new Error(result.error || 'Erro desconhecido ao buscar imóveis');
    }
    
    return apiImoveisCache;
  } catch (error) {
    console.error('❌ Erro ao buscar imóveis da API para favoritos:', error);
    return [];
  }
}

/**
 * Popula os dados completos do imóvel em um favorito (SÍNCRONO para compatibilidade)
 * @param favorito - Favorito com apenas o ID
 * @returns Favorito com dados completos do imóvel
 */
export function popularImovelNoFavorito(favorito: Favorito): Favorito {
  // Primeiro, tentar no mock local
  let imovel = imoveisMock.find(i => i.id === favorito.id);
  
  // Fallback: tentar com formato de 3 dígitos se não encontrar
  if (!imovel && favorito.id.match(/imovel-\d{2}$/)) {
    const idWith3Digits = favorito.id.replace(/(\d{2})$/, (match) => match.padStart(3, '0'));
    imovel = imoveisMock.find(i => i.id === idWith3Digits);
  }
  
  // Fallback: tentar com formato de 2 dígitos se não encontrar
  if (!imovel && favorito.id.match(/imovel-\d{3}$/)) {
    const idWith2Digits = favorito.id.replace(/0(\d{2})$/, '$1');
    imovel = imoveisMock.find(i => i.id === idWith2Digits);
  }

  // Se não encontrou no mock, tentar no cache da API
  if (!imovel && apiImoveisCache.length > 0) {
    // Buscar por ID ou código (os imóveis do Vista usam código como PH1060, PH1112, etc)
    imovel = apiImoveisCache.find(i => 
      i.id === favorito.id || 
      i.codigo === favorito.id ||
      // Também tentar remover prefixo se houver
      (i.codigo && favorito.id && i.codigo.toString() === favorito.id.toString())
    );
    
    if (imovel) {
      console.log(`✅ Imóvel ${favorito.id} encontrado no cache da API`);
    }
  }
  
  if (!imovel) {
    console.warn(`⚠️  Imóvel ${favorito.id} não encontrado para popular favorito (cache tem ${apiImoveisCache.length} imóveis)`);
    return favorito;
  }
  
  return {
    ...favorito,
    imovel,
  };
}

/**
 * Popula os dados de múltiplos favoritos (SÍNCRONO com cache)
 * Nota: Chame loadAPICache() antes para garantir que os dados da API estejam disponíveis
 * @param favoritos - Array de favoritos
 * @returns Array de favoritos com dados completos
 */
export function popularImoveisNosFavoritos(favoritos: Favorito[]): Favorito[] {
  return favoritos.map(fav => popularImovelNoFavorito(fav));
}

/**
 * Carrega o cache de imóveis da API (deve ser chamado antes de popular favoritos)
 * @returns Promise que resolve quando o cache estiver carregado
 */
export async function loadAPICache(): Promise<void> {
  await fetchImoveisFromAPI();
}

/**
 * Busca um imóvel pelo ID
 * @param id - ID do imóvel
 * @returns Imóvel encontrado ou undefined
 */
export function buscarImovelPorId(id: string): Imovel | undefined {
  let imovel = imoveisMock.find(i => i.id === id);
  
  // Fallback: tentar com formato de 3 dígitos se não encontrar
  if (!imovel && id.match(/imovel-\d{2}$/)) {
    const idWith3Digits = id.replace(/(\d{2})$/, (match) => match.padStart(3, '0'));
    imovel = imoveisMock.find(i => i.id === idWith3Digits);
  }
  
  // Fallback: tentar com formato de 2 dígitos se não encontrar
  if (!imovel && id.match(/imovel-\d{3}$/)) {
    const idWith2Digits = id.replace(/0(\d{2})$/, '$1');
    imovel = imoveisMock.find(i => i.id === idWith2Digits);
  }
  
  return imovel;
}

