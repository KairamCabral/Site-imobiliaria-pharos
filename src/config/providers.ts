/**
 * Configuração de Providers
 * 
 * Centraliza configurações, credenciais e URLs dos providers
 */

export interface ProviderConfig {
  name: string;
  enabled: boolean;
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

/**
 * Configuração do Vista CRM
 */
export const VISTA_CONFIG: ProviderConfig = {
  name: 'Vista',
  enabled: true,
  baseUrl: process.env.VISTA_BASE_URL || 'https://gabarito-rest.vistahost.com.br',
  apiKey: process.env.VISTA_API_KEY || '',
  timeout: 30000, // 30 segundos
  retries: 3,
};

export const DWV_CONFIG: ProviderConfig = {
  name: 'DWV',
  enabled: true,
  baseUrl: process.env.DWV_BASE_URL || 'https://api.dwvapp.com.br',
  apiKey: process.env.DWV_API_TOKEN,
  timeout: Number(process.env.DWV_TIMEOUT_MS || 15000),
  retries: 2,
  headers: {
    token: process.env.DWV_API_TOKEN || '',
    Accept: 'application/json',
  },
};

/**
 * Configuração do Pharos CRM (futuro)
 */
export const PHAROS_CONFIG: ProviderConfig = {
  name: 'Pharos',
  enabled: false,
  baseUrl: process.env.NEXT_PUBLIC_PHAROS_BASE_URL || '',
  apiKey: process.env.NEXT_PUBLIC_PHAROS_API_KEY || '',
  timeout: 30000,
  retries: 3,
};

/**
 * Provider ativo (via feature flag)
 */
export type ActiveProvider = 'vista' | 'pharos' | 'mock' | 'dwv' | 'dual';

export const ACTIVE_PROVIDER: ActiveProvider = 
  (process.env.NEXT_PUBLIC_LISTING_PROVIDER as ActiveProvider) || 'vista';

/**
 * Configuração de cache
 */
export const CACHE_CONFIG = {
  // TTL em segundos
  listingsTTL: 300, // 5 minutos
  detailsTTL: 600, // 10 minutos
  photosTTL: 3600, // 1 hora
  
  // Habilitar/desabilitar cache
  enabled: process.env.NODE_ENV === 'production',
};

/**
 * Configuração de logs
 */
export const LOGGING_CONFIG = {
  enabled: true,
  // Exibe logs verbosos somente quando ativado explicitamente
  logRequests: process.env.NEXT_PUBLIC_DEBUG_VISTA === '1',
  logResponses: process.env.NEXT_PUBLIC_DEBUG_VISTA === '1' && process.env.NODE_ENV === 'development',
  // Erros só aparecem quando flags de debug estiverem ativas
  logErrors: process.env.NEXT_PUBLIC_DEBUG_VISTA_ERRORS === '1' || process.env.NEXT_PUBLIC_DEBUG_VISTA === '1',
};

