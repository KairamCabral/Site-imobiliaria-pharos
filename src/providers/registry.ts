/**
 * Provider Registry
 * 
 * Sistema de seleção de provider com feature flag
 */

import type { IListingProvider } from '@/domain/contracts';
import { VistaProvider } from './vista';
import { PharosProvider } from './pharos';
import { DwvProvider } from './dwv';
import { DualProvider } from './dual';
import { ACTIVE_PROVIDER } from '@/config/providers';

/**
 * Cache da instância do provider ativo
 */
let providerInstance: IListingProvider | null = null;

/**
 * Retorna o provider ativo baseado na feature flag
 */
export function getListingProvider(): IListingProvider {
  // Se já existe instância, retorna (singleton)
  if (providerInstance) {
    return providerInstance;
  }

  // Cria instância baseada na config
  switch (ACTIVE_PROVIDER) {
    case 'vista':
      console.log('[Provider Registry] Using Vista CRM');
      providerInstance = new VistaProvider();
      break;

    case 'dwv':
      console.log('[Provider Registry] Using DWV API');
      providerInstance = new DwvProvider();
      break;

    case 'pharos':
      console.log('[Provider Registry] Using Pharos CRM');
      providerInstance = new PharosProvider();
      break;

    case 'dual':
      console.log('[Provider Registry] Using Dual Provider (DWV + Vista)');
      providerInstance = new DualProvider();
      break;

    case 'mock':
      console.log('[Provider Registry] Using Mock Provider (development)');
      // Para desenvolvimento, usa Vista por enquanto
      providerInstance = new VistaProvider();
      break;

    default:
      console.warn(`[Provider Registry] Unknown provider "${ACTIVE_PROVIDER}". Falling back to Vista.`);
      providerInstance = new VistaProvider();
  }

  return providerInstance;
}

/**
 * Reseta instância do provider (útil para testes ou troca em runtime)
 */
export function resetProvider(): void {
  providerInstance = null;
}

/**
 * Retorna informações sobre o provider ativo
 */
export function getProviderInfo(): {
  name: string;
  capabilities: any;
  active: string;
} {
  const provider = getListingProvider();
  
  return {
    name: provider.getName(),
    capabilities: provider.getCapabilities(),
    active: ACTIVE_PROVIDER,
  };
}

