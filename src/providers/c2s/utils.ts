/**
 * Utilitários para Contact2Sale Integration
 */

import type { C2SConfig, C2SFeatureFlags } from './types';

/**
 * Carrega configuração do C2S a partir das variáveis de ambiente
 */
export function loadC2SConfig(): C2SConfig {
  return {
    apiUrl: process.env.C2S_API_URL || 'https://api.contact2sale.com/integration',
    apiToken: process.env.C2S_API_TOKEN || '',
    companyId: process.env.C2S_COMPANY_ID,
    defaultSellerId: process.env.C2S_DEFAULT_SELLER_ID,
    webhookSecret: process.env.C2S_WEBHOOK_SECRET,
    timeout: parseInt(process.env.C2S_TIMEOUT_MS || '15000', 10),
    retryAttempts: parseInt(process.env.C2S_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.C2S_RETRY_DELAY_MS || '1000', 10),
  };
}

/**
 * Carrega feature flags do C2S
 */
export function loadC2SFeatureFlags(): C2SFeatureFlags {
  return {
    enabled: process.env.C2S_ENABLED === 'true',
    syncSellers: process.env.C2S_SYNC_SELLERS === 'true',
    autoTags: process.env.C2S_AUTO_TAGS === 'true',
    webhooksEnabled: process.env.C2S_WEBHOOKS_ENABLED === 'true',
    distributionEnabled: process.env.C2S_DISTRIBUTION_ENABLED === 'true',
    visitIntegration: process.env.C2S_VISIT_INTEGRATION === 'true',
  };
}

/**
 * Valida se a configuração do C2S está completa
 */
export function validateC2SConfig(config: C2SConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.apiUrl) {
    errors.push('C2S_API_URL não configurada');
  }

  if (!config.apiToken) {
    errors.push('C2S_API_TOKEN não configurada');
  }

  if (config.apiToken && config.apiToken.length < 20) {
    errors.push('C2S_API_TOKEN parece inválida (muito curta)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Formata número de telefone para o formato C2S
 * Remove todos os caracteres não numéricos
 * 
 * @example
 * formatPhoneForC2S('+55 (48) 99999-9999') => 5548999999999
 * formatPhoneForC2S('48999999999') => 5548999999999 (adiciona DDI Brasil)
 */
export function formatPhoneForC2S(phone: string): string | undefined {
  if (!phone) return undefined;

  // Remove todos os caracteres não numéricos
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 0) return undefined;

  // Se não tem DDI (menos de 11 dígitos), adiciona 55 (Brasil)
  let fullPhone = digits;
  if (digits.length <= 11 && !digits.startsWith('55')) {
    fullPhone = '55' + digits;
  }

  // Validação básica: telefone brasileiro deve ter 12-13 dígitos (com DDI)
  if (fullPhone.length < 12 || fullPhone.length > 13 || !fullPhone.startsWith('55')) {
    console.warn('[C2S Utils] Telefone fora do padrão brasileiro:', phone);
  }

  return fullPhone;
}

/**
 * Normaliza texto removendo acentos e caracteres especiais
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim();
}

/**
 * Gera slug a partir de texto
 */
export function generateSlug(text: string): string {
  return normalizeText(text)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Trunca texto para um tamanho máximo
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Calcula delay com exponential backoff
 */
export function calculateBackoff(attempt: number, baseDelay: number = 1000): number {
  const maxDelay = 30000; // 30 segundos
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  
  // Adiciona jitter (variação aleatória de 0-20%)
  const jitter = delay * 0.2 * Math.random();
  
  return Math.floor(delay + jitter);
}

/**
 * Sleep/delay assíncrono
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry de função com exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  onRetry?: (attempt: number, error: any) => void
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxAttempts - 1) {
        const delay = calculateBackoff(attempt, baseDelay);
        
        if (onRetry) {
          onRetry(attempt + 1, error);
        }
        
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Verifica se erro é recuperável (deve fazer retry)
 */
export function isRetryableError(error: any): boolean {
  // Erros de rede são recuperáveis
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // Status HTTP 5xx são recuperáveis
  if (error.statusCode >= 500 && error.statusCode < 600) {
    return true;
  }

  // Status 429 (Too Many Requests) é recuperável
  if (error.statusCode === 429) {
    return true;
  }

  // Status 408 (Request Timeout) é recuperável
  if (error.statusCode === 408) {
    return true;
  }

  return false;
}

/**
 * Extrai ID numérico de string de ID
 */
export function extractNumericId(id: string | number): number | undefined {
  if (typeof id === 'number') return id;
  
  const match = id.match(/\d+/);
  return match ? parseInt(match[0], 10) : undefined;
}

/**
 * Formata preço para exibição
 */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Cria hash simples para idempotência
 */
export async function createIdempotencyKey(data: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Browser
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

/**
 * Valida e sanitiza email
 */
export function sanitizeEmail(email: string): string | undefined {
  if (!email) return undefined;
  
  const trimmed = email.trim().toLowerCase();
  
  // Validação básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(trimmed) ? trimmed : undefined;
}

/**
 * Cria log estruturado para debugging
 */
export function createLog(context: string, data: any): void {
  const timestamp = new Date().toISOString();
  const prefix = `[C2S ${context}]`;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`${prefix} ${timestamp}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`${prefix} ${timestamp}`, data);
  }
}

/**
 * Cria log de erro
 */
export function createErrorLog(context: string, error: any, additionalData?: any): void {
  const timestamp = new Date().toISOString();
  const prefix = `[C2S ${context} ERROR]`;
  
  console.error(`${prefix} ${timestamp}`, {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    ...additionalData,
  });
}

/**
 * Type guard para verificar se data tem estrutura JSON:API
 */
function isJsonApiFormat(data: unknown): data is { type: string; id: string; attributes: Record<string, unknown> } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    'id' in data &&
    'attributes' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).attributes === 'object'
  );
}

/**
 * Type guard para verificar se data tem estrutura flat
 */
function isFlatFormat(data: unknown): data is { id: string; customer: Record<string, unknown> } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'customer' in data &&
    typeof (data as any).id === 'string' &&
    typeof (data as any).customer === 'object'
  );
}

/**
 * Normaliza o payload do webhook C2S para um formato consistente
 * 
 * Aceita dois formatos possíveis:
 * 1. JSON:API: { type: 'lead', id: '123', attributes: {...} }
 * 2. Flat: { id: '123', customer: {...}, lead_status: {...}, ... }
 * 
 * @param payload - Payload bruto do webhook
 * @returns Lead normalizado ou null se inválido
 */
export function normalizeC2SWebhookPayload(payload: unknown): {
  id: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    phone2?: string;
    neighbourhood?: string;
  };
  lead_status: {
    id: string | number;
    alias: string;
    name?: string;
  };
  funnel_status?: {
    id: string | number;
    alias: string;
    name?: string;
  };
  lead_source?: {
    id: number;
    name: string;
  };
  seller?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  product?: {
    license_plate?: string;
    description?: string;
    price?: number;
    brand?: string;
    model?: string;
  };
  description?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
} | null {
  if (!payload || typeof payload !== 'object') {
    createErrorLog('normalizeWebhook', new Error('Payload inválido'), { payload });
    return null;
  }

  try {
    // Formato JSON:API
    if (isJsonApiFormat(payload)) {
      const { id, attributes } = payload;
      
      // Validações obrigatórias
      if (!attributes.customer || typeof attributes.customer !== 'object') {
        createErrorLog('normalizeWebhook', new Error('Customer ausente no payload JSON:API'), { payload });
        return null;
      }

      if (!attributes.lead_status || typeof attributes.lead_status !== 'object') {
        createErrorLog('normalizeWebhook', new Error('Lead status ausente no payload JSON:API'), { payload });
        return null;
      }

      const customer = attributes.customer as any;
      const leadStatus = attributes.lead_status as any;

      if (!customer.name || typeof customer.name !== 'string') {
        createErrorLog('normalizeWebhook', new Error('Customer name inválido'), { payload });
        return null;
      }

      if (!leadStatus.alias || typeof leadStatus.alias !== 'string') {
        createErrorLog('normalizeWebhook', new Error('Lead status alias inválido'), { payload });
        return null;
      }

      return {
        id,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          phone2: customer.phone2,
          neighbourhood: customer.neighbourhood,
        },
        lead_status: {
          id: leadStatus.id,
          alias: leadStatus.alias,
          name: leadStatus.name,
        },
        funnel_status: attributes.funnel_status ? {
          id: (attributes.funnel_status as any).id,
          alias: (attributes.funnel_status as any).alias,
          name: (attributes.funnel_status as any).name,
        } : undefined,
        lead_source: attributes.lead_source ? {
          id: (attributes.lead_source as any).id,
          name: (attributes.lead_source as any).name,
        } : undefined,
        seller: attributes.seller ? {
          id: (attributes.seller as any).id,
          name: (attributes.seller as any).name,
          email: (attributes.seller as any).email,
          phone: (attributes.seller as any).phone,
        } : undefined,
        product: attributes.product ? {
          license_plate: (attributes.product as any).license_plate,
          description: (attributes.product as any).description,
          price: (attributes.product as any).price,
          brand: (attributes.product as any).brand,
          model: (attributes.product as any).model,
        } : undefined,
        description: attributes.description as string | undefined,
        notes: attributes.notes as string | undefined,
        created_at: attributes.created_at as string | undefined,
        updated_at: attributes.updated_at as string | undefined,
      };
    }

    // Formato Flat
    if (isFlatFormat(payload)) {
      const data = payload as any;

      // Validações obrigatórias
      if (!data.customer.name || typeof data.customer.name !== 'string') {
        createErrorLog('normalizeWebhook', new Error('Customer name inválido no formato flat'), { payload });
        return null;
      }

      if (!data.lead_status || !data.lead_status.alias) {
        createErrorLog('normalizeWebhook', new Error('Lead status inválido no formato flat'), { payload });
        return null;
      }

      return {
        id: data.id,
        customer: {
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone,
          phone2: data.customer.phone2,
          neighbourhood: data.customer.neighbourhood,
        },
        lead_status: {
          id: data.lead_status.id,
          alias: data.lead_status.alias,
          name: data.lead_status.name,
        },
        funnel_status: data.funnel_status,
        lead_source: data.lead_source,
        seller: data.seller,
        product: data.product,
        description: data.description,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    }

    // Formato não reconhecido
    createErrorLog('normalizeWebhook', new Error('Formato de payload não reconhecido'), {
      payload: JSON.stringify(payload, null, 2),
    });
    return null;
  } catch (error: any) {
    createErrorLog('normalizeWebhook', error, { payload });
    return null;
  }
}

