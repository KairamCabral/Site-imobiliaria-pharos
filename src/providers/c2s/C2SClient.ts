/**
 * Contact2Sale API Client
 * 
 * Cliente HTTP robusto para integração com a API do Contact2Sale
 * Features:
 * - Retry automático com exponential backoff
 * - Rate limiting
 * - Timeout configurável
 * - Logging detalhado
 * - Tratamento de erros específicos
 */

import type {
  C2SConfig,
  C2SLeadPayload,
  C2SLeadResponse,
  C2SLeadsListResponse,
  C2SSeller,
  C2SSellersResponse,
  C2STagResponse,
  C2SVisitData,
  C2SActivityData,
  C2SDoneDealData,
  C2SWebhookConfig,
  C2SWebhookAction,
  C2SDistributionQueue,
  C2SDistributionQueueSeller,
  C2SError,
  C2SSuccessResponse,
} from './types';

import {
  loadC2SConfig,
  validateC2SConfig,
  retryWithBackoff,
  isRetryableError,
  createLog,
  createErrorLog,
  sleep,
} from './utils';

/**
 * Opções para requisição HTTP
 */
interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: any;
  timeout?: number;
  skipRetry?: boolean;
}

/**
 * Cliente C2S
 */
export class C2SClient {
  private config: C2SConfig;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 100; // ms entre requisições (rate limiting)

  constructor(config?: Partial<C2SConfig>) {
    this.config = { ...loadC2SConfig(), ...config };
    
    const validation = validateC2SConfig(this.config);
    if (!validation.valid) {
      console.warn('[C2S Client] Configuração incompleta:', validation.errors);
    }
  }

  /**
   * Health check do serviço
   */
  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      // Tenta buscar lista de leads com limite 1
      await this.request({
        method: 'GET',
        endpoint: '/leads',
        timeout: 5000,
        skipRetry: true,
      });

      const latency = Date.now() - startTime;
      
      return {
        healthy: true,
        latency,
      };
    } catch (error: any) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Cria um novo lead no C2S
   */
  async createLead(payload: C2SLeadPayload): Promise<C2SLeadResponse> {
    createLog('createLead', { 
      customer: payload.name,
      source: payload.source,
    });

    // Remove campos undefined do payload (C2S não aceita)
    const cleanPayload = this.removeUndefinedFields(payload);

    // Formata no padrão JSON:API que o C2S espera
    const jsonApiPayload = {
      data: {
        type: 'lead',
        attributes: cleanPayload,
      },
    };

    // LOG DETALHADO para debug
    console.log('[C2S] 📤 PAYLOAD COMPLETO:', JSON.stringify(jsonApiPayload, null, 2));

    const response = await this.request<C2SLeadResponse>({
      method: 'POST',
      endpoint: '/leads', // Endpoint correto: /leads (PLURAL)
      body: jsonApiPayload,
    });

    createLog('createLead success', {
      leadId: response.lead_id,
      customer: payload.name,
      receivedBy: response.received_by?.name,
    });

    return response;
  }

  /**
   * Remove campos undefined recursivamente
   */
  private removeUndefinedFields(obj: any): any {
    if (obj === null || obj === undefined) {
      return undefined;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefinedFields(item)).filter(item => item !== undefined);
    }

    if (typeof obj === 'object') {
      const cleaned: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = this.removeUndefinedFields(value);
        
        // Só adiciona se não for undefined
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
      
      // Retorna undefined se o objeto ficou vazio
      return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    }

    return obj;
  }

  /**
   * Atualiza um lead existente
   */
  async updateLead(leadId: string, data: Partial<C2SLeadPayload>): Promise<C2SLeadResponse> {
    createLog('updateLead', { leadId });

    const response = await this.request<C2SLeadResponse>({
      method: 'PUT',
      endpoint: `/leads/${leadId}`,
      body: data,
    });

    return response;
  }

  /**
   * Busca leads com filtros
   */
  async getLeads(params?: {
    page?: number;
    perpage?: number;
    sort?: string;
    status?: string;
    phone?: string;
    email?: string;
    tags?: string;
    created_gte?: string;
    created_lt?: string;
    updated_gte?: string;
    updated_lt?: string;
  }): Promise<C2SLeadsListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/leads${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return await this.request<C2SLeadsListResponse>({
      method: 'GET',
      endpoint,
    });
  }

  /**
   * Busca um lead específico por ID
   */
  async getLead(leadId: string): Promise<C2SLeadResponse> {
    return await this.request<C2SLeadResponse>({
      method: 'GET',
      endpoint: `/leads/${leadId}`,
    });
  }

  /**
   * Marca lead como interagido
   */
  async markLeadAsInteracted(leadId: string): Promise<C2SSuccessResponse> {
    return await this.request<C2SSuccessResponse>({
      method: 'POST',
      endpoint: `/leads/${leadId}/interact`,
      body: {},
    });
  }

  /**
   * Cria uma mensagem/observação no lead
   */
  async createLeadMessage(leadId: string, message: string): Promise<C2SSuccessResponse> {
    createLog('createLeadMessage', { leadId, messageLength: message.length });

    return await this.request<C2SSuccessResponse>({
      method: 'POST',
      endpoint: `/leads/${leadId}/create_message`,
      body: {
        body: message,
      },
    });
  }

  /**
   * Cria uma tag para um lead
   */
  async createLeadTag(leadId: string, tagName: string): Promise<C2STagResponse> {
    createLog('createLeadTag', { leadId, tagName });

    return await this.request<C2STagResponse>({
      method: 'POST',
      endpoint: `/leads/${leadId}/tags`,
      body: { name: tagName },
    });
  }

  /**
   * Busca tags de um lead
   */
  async getLeadTags(leadId: string): Promise<C2STagResponse[]> {
    return await this.request<C2STagResponse[]>({
      method: 'GET',
      endpoint: `/leads/${leadId}/tags`,
    });
  }

  /**
   * Busca todos os sellers (corretores)
   */
  async getSellers(): Promise<C2SSeller[]> {
    const response = await this.request<C2SSellersResponse>({
      method: 'GET',
      endpoint: '/sellers',
    });

    return response.data.map(item => ({
      id: item.id,
      ...item.attributes,
    }));
  }

  /**
   * Cria um novo seller
   */
  async createSeller(seller: Omit<C2SSeller, 'id'>): Promise<C2SSeller> {
    const response = await this.request<{ data: { id: string; attributes: C2SSeller } }>({
      method: 'POST',
      endpoint: '/sellers',
      body: seller,
    });

    return {
      id: response.data.id,
      ...response.data.attributes,
    };
  }

  /**
   * Atualiza um seller existente
   */
  async updateSeller(sellerId: string, seller: Partial<C2SSeller>): Promise<C2SSeller> {
    const response = await this.request<{ data: { id: string; attributes: C2SSeller } }>({
      method: 'PUT',
      endpoint: `/sellers/${sellerId}`,
      body: seller,
    });

    return {
      id: response.data.id,
      ...response.data.attributes,
    };
  }

  /**
   * Cria uma mensagem para um lead
   */
  async createMessage(leadId: string, message: string): Promise<C2SSuccessResponse> {
    return await this.request<C2SSuccessResponse>({
      method: 'POST',
      endpoint: `/leads/${leadId}/messages`,
      body: { message },
    });
  }

  /**
   * Cria uma visita agendada
   */
  async createVisit(data: C2SVisitData): Promise<C2SSuccessResponse> {
    createLog('createVisit', {
      leadId: data.lead_id,
      scheduledDate: data.scheduled_date,
    });

    return await this.request<C2SSuccessResponse>({
      method: 'POST',
      endpoint: '/visits',
      body: data,
    });
  }

  /**
   * Cria uma atividade
   */
  async createActivity(data: C2SActivityData): Promise<C2SSuccessResponse> {
    createLog('createActivity', {
      leadId: data.lead_id,
      type: data.type,
    });

    return await this.request<C2SSuccessResponse>({
      method: 'POST',
      endpoint: '/activities',
      body: data,
    });
  }

  /**
   * Marca lead como negócio fechado
   */
  async markDoneDeal(data: C2SDoneDealData): Promise<C2SSuccessResponse> {
    createLog('markDoneDeal', {
      leadId: data.lead_id,
      price: data.done_price,
    });

    return await this.request<C2SSuccessResponse>({
      method: 'POST',
      endpoint: `/leads/${data.lead_id}/done`,
      body: data,
    });
  }

  /**
   * Registra webhook para receber notificações
   */
  async subscribeWebhook(config: C2SWebhookConfig): Promise<C2SSuccessResponse> {
    createLog('subscribeWebhook', config);

    return await this.request<C2SSuccessResponse>({
      method: 'POST',
      endpoint: '/leads/subscribe',
      body: config,
    });
  }

  /**
   * Remove registro de webhook
   */
  async unsubscribeWebhook(hookAction: C2SWebhookAction): Promise<C2SSuccessResponse> {
    createLog('unsubscribeWebhook', { hookAction });

    return await this.request<C2SSuccessResponse>({
      method: 'POST',
      endpoint: '/leads/unsubscribe',
      body: { hook_action: hookAction },
    });
  }

  /**
   * Busca filas de distribuição
   */
  async getDistributionQueues(): Promise<C2SDistributionQueue[]> {
    const response = await this.request<{ data: C2SDistributionQueue[] }>({
      method: 'GET',
      endpoint: '/distribution_queues',
    });

    return response.data;
  }

  /**
   * Busca sellers de uma fila de distribuição
   */
  async getDistributionQueueSellers(queueId: string): Promise<C2SDistributionQueueSeller[]> {
    const response = await this.request<{ distribution_queue_sellers: C2SDistributionQueueSeller[] }>({
      method: 'GET',
      endpoint: `/distribution_queues/${queueId}/sellers`,
    });

    return response.distribution_queue_sellers;
  }

  /**
   * Requisição HTTP genérica com retry e rate limiting
   */
  private async request<T>(options: RequestOptions): Promise<T> {
    // Rate limiting: aguarda intervalo mínimo entre requisições
    await this.applyRateLimit();

    const { method, endpoint, body, timeout, skipRetry } = options;
    const url = `${this.config.apiUrl}${endpoint}`;

    const makeRequest = async (): Promise<T> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout || this.config.timeout);

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiToken}`,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          let errorData: any;
          
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }

          throw {
            statusCode: response.status,
            message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            errors: errorData.errors,
            success: false,
          } as C2SError;
        }

        const data = await response.json();
        return data as T;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          throw {
            statusCode: 408,
            message: 'Request timeout',
            success: false,
          } as C2SError;
        }

        throw error;
      }
    };

    try {
      if (skipRetry) {
        return await makeRequest();
      }

      // Retry com exponential backoff para erros recuperáveis
      return await retryWithBackoff(
        makeRequest,
        this.config.retryAttempts,
        this.config.retryDelay,
        (attempt, error) => {
          if (isRetryableError(error)) {
            createLog('request retry', {
              attempt,
              method,
              endpoint,
              error: error.message,
            });
          }
        }
      );
    } catch (error: any) {
      createErrorLog('request failed', error, {
        method,
        endpoint,
        body,
      });

      throw error;
    }
  }

  /**
   * Aplica rate limiting entre requisições
   */
  private async applyRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await sleep(waitTime);
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Retorna estatísticas de uso do cliente
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
      config: {
        apiUrl: this.config.apiUrl,
        timeout: this.config.timeout,
        retryAttempts: this.config.retryAttempts,
      },
    };
  }
}

/**
 * Instância singleton do cliente
 */
let clientInstance: C2SClient | null = null;

/**
 * Retorna instância do cliente C2S (singleton)
 */
export function getC2SClient(): C2SClient {
  if (!clientInstance) {
    clientInstance = new C2SClient();
  }
  return clientInstance;
}

/**
 * Reseta instância do cliente (útil para testes)
 */
export function resetC2SClient(): void {
  clientInstance = null;
}

