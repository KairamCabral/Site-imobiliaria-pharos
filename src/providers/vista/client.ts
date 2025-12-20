/**
 * Cliente HTTP Resiliente para Vista CRM
 * 
 * Implementa retry, timeout, logs e tratamento de erros
 */

import { VISTA_CONFIG, LOGGING_CONFIG } from '@/config/providers';
import type { VistaPesquisa } from './types';

/**
 * Opções de requisição
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  timeout?: number;
  retries?: number;
}

/**
 * Resultado de requisição
 */
interface RequestResult<T> {
  data: T;
  status: number;
  duration: number;
}

/**
 * Cliente HTTP para Vista CRM
 */
export class VistaClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;
  private maxRetries: number;

  constructor() {
    this.baseUrl = VISTA_CONFIG.baseUrl;
    this.apiKey = VISTA_CONFIG.apiKey || '';
    if (!this.apiKey) {
      // ✅ Aviso menos verboso - não derrubar build
      if (process.env.NODE_ENV === 'development') {
        console.warn('[VistaClient] ⚠️  VISTA_API_KEY não configurada. Requisições irão falhar.');
      }
    }
    this.timeout = VISTA_CONFIG.timeout || 30000;
    this.maxRetries = VISTA_CONFIG.retries || 1; // ✅ Reduzido de 3 para 1
  }

  /**
   * Faz requisição GET
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<RequestResult<T>> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * Faz requisição POST
   */
  async post<T>(
    endpoint: string,
    body: any,
    params?: Record<string, any>,
    options?: { disableCadastroWrapper?: boolean }
  ): Promise<RequestResult<T>> {
    const shouldWrapInCadastro = !options?.disableCadastroWrapper;

    const hasBody = body !== undefined && body !== null;

    const payloadParams = shouldWrapInCadastro
      ? {
          ...(params || {}),
          ...(hasBody ? { cadastro: body } : {}),
        }
      : params;

    const url = this.buildUrl(endpoint, payloadParams);

    // Quando usamos o parâmetro cadastro, a API já espera os dados via querystring.
    // Ainda assim enviamos o corpo para manter compatibilidade com endpoints que aceitam ambos.
    const requestBody = shouldWrapInCadastro ? (hasBody ? body : undefined) : body;

    // Evita enviar corpo vazio quando não necessário.
    const hasBodyContent =
      requestBody !== undefined &&
      requestBody !== null &&
      ((typeof requestBody === 'object' && Object.keys(requestBody).length > 0) ||
        typeof requestBody !== 'object');

    return this.request<T>(url, {
      method: 'POST',
      body: hasBodyContent ? requestBody : undefined,
    });
  }

  /**
   * Monta URL com parâmetros
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    // Remove barra inicial se houver
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    const url = new URL(`${this.baseUrl}/${cleanEndpoint}`);
    
    // Adiciona chave da API
    url.searchParams.set('key', this.apiKey);
    
    // Adiciona parâmetros adicionais
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Se for objeto, converte para JSON
          if (typeof value === 'object') {
            url.searchParams.set(key, JSON.stringify(value));
          } else {
            url.searchParams.set(key, String(value));
          }
        }
      });
    }
    
    return url.toString();
  }

  /**
   * Executa requisição com retry
   */
  private async request<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<RequestResult<T>> {
    const startTime = Date.now();
    let lastError: Error | null = null;
    
    const retries = options.retries ?? this.maxRetries;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (LOGGING_CONFIG.logRequests && attempt === 0) {
          console.log(`[Vista] ${options.method || 'GET'} ${url}`);
        }
        
        const result = await this.executeRequest<T>(url, options);
        
        const duration = Date.now() - startTime;
        
        if (LOGGING_CONFIG.logResponses) {
          console.log(`[Vista] Response: ${result.status} (${duration}ms)`);
        }
        
        return {
          ...result,
          duration,
        };
      } catch (error) {
        lastError = error as Error;
        
        // ✅ Nunca retry em 401 (auth error)
        const is401 = error && typeof error === 'object' && 'status' in error && error.status === 401;
        
        if (is401 || !this.isRetryableError(error)) {
          throw this.handleError(error, url, options.method);
        }
        
        // Se não tiver mais tentativas, lança erro
        if (attempt >= retries) {
          break;
        }
        
        // Backoff exponencial
        const delay = this.calculateBackoff(attempt);
        
        if (LOGGING_CONFIG.logErrors) {
          console.warn(
            `[Vista] Attempt ${attempt + 1}/${retries + 1} failed. Retrying in ${delay}ms...`,
            error
          );
        }
        
        await this.sleep(delay);
      }
    }
    
    // Se chegou aqui, esgotou todas as tentativas
    throw this.handleError(lastError, url, options.method);
  }

  /**
   * Executa a requisição HTTP
   */
  private async executeRequest<T>(
    url: string,
    options: RequestOptions
  ): Promise<{ data: T; status: number }> {
    const controller = new AbortController();
    const timeout = options.timeout || this.timeout;
    
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      };
      
      if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
      }
      
      const response = await fetch(url, fetchOptions);
      
      // Se não for 2xx, lança erro
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      return {
        data,
        status: response.status,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Verifica se o erro é retryable (transitório)
   */
  private isRetryableError(error: any): boolean {
    // Timeout
    if (error.name === 'AbortError') return true;
    
    // Network errors
    if (error.message?.includes('fetch')) return true;
    
    // HTTP 5xx (erro do servidor)
    if (error.message?.includes('HTTP 5')) return true;
    
    // HTTP 429 (rate limit)
    if (error.message?.includes('HTTP 429')) return true;
    
    // HTTP 408 (request timeout)
    if (error.message?.includes('HTTP 408')) return true;
    
    return false;
  }

  /**
   * Calcula delay do backoff exponencial
   */
  private calculateBackoff(attempt: number): number {
    // 1s, 2s, 4s, 8s...
    const baseDelay = 1000;
    return Math.min(baseDelay * Math.pow(2, attempt), 10000);
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Trata erros e retorna erro padronizado
   */
  private handleError(error: any, url: string, method?: string): Error {
    const operation = `${method || 'GET'} ${url}`;
    
    const shouldLogError =
      LOGGING_CONFIG.logErrors || process.env.NODE_ENV === 'development';

    if (shouldLogError) {
      console.error(`[Vista] Error in ${operation}:`, error);
    }
    
    // Extrai mensagem
    let message = 'Erro desconhecido ao comunicar com Vista CRM';
    
    if (error.name === 'AbortError') {
      message = 'Timeout ao comunicar com Vista CRM';
    } else if (error.message) {
      message = error.message;
    }
    
    const vistaError = new Error(`[Vista Client] ${message}`);
    (vistaError as any).originalError = error;
    (vistaError as any).operation = operation;
    
    return vistaError;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Tenta fazer uma requisição simples
      await this.get('/imoveis/listar', {
        pesquisa: {
          paginacao: { pagina: 1, quantidade: 1 }
        }
      });
      return true;
    } catch (error) {
      console.error('[Vista] Health check failed:', error);
      return false;
    }
  }
}

/**
 * Instância singleton do cliente
 */
let clientInstance: VistaClient | null = null;

export function getVistaClient(): VistaClient {
  if (!clientInstance) {
    clientInstance = new VistaClient();
  }
  return clientInstance;
}

