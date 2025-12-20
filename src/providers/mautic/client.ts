/**
 * Mautic HTTP Client
 * 
 * Cliente HTTP resiliente para comunicação com Mautic API
 */

import type { MauticConfig, MauticResponse } from './types';

export class MauticClient {
  private config: MauticConfig;
  private authHeader: string;

  constructor(config: MauticConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };

    // Prepara header de autenticação
    if (this.config.authType === 'basic') {
      const credentials = Buffer.from(
        `${this.config.username}:${this.config.password}`
      ).toString('base64');
      this.authHeader = `Basic ${credentials}`;
    } else {
      // OAuth2 - implementação futura
      throw new Error('OAuth2 não implementado ainda. Use authType: "basic"');
    }
  }

  /**
   * Realiza requisição HTTP com retry
   */
  async request<T = any>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    retries = 3
  ): Promise<MauticResponse<T>> {
    const url = `${this.config.baseUrl}/api${endpoint}`;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[Mautic] ${method} ${endpoint} (attempt ${attempt}/${retries})`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': this.authHeader,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseData = await response.json().catch(() => ({}));

        // Sucesso
        if (response.ok) {
          console.log(`[Mautic] ✅ ${method} ${endpoint} - ${response.status}`);
          return responseData as MauticResponse<T>;
        }

        // Erro do servidor
        console.error(`[Mautic] ❌ ${method} ${endpoint} - ${response.status}`, responseData);
        
        // Não tenta retry em erros de cliente (4xx)
        if (response.status >= 400 && response.status < 500) {
          return {
            errors: [{
              code: response.status,
              message: responseData.errors?.[0]?.message || response.statusText,
              details: responseData,
            }],
          };
        }

        // Retry em erros de servidor (5xx)
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[Mautic] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        return {
          errors: [{
            code: response.status,
            message: `Erro após ${retries} tentativas: ${response.statusText}`,
            details: responseData,
          }],
        };

      } catch (error: any) {
        console.error(`[Mautic] Error on attempt ${attempt}:`, error.message);
        
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        return {
          errors: [{
            code: 0,
            message: `Erro de rede: ${error.message}`,
            details: error,
          }],
        };
      }
    }

    // Fallback (nunca deve chegar aqui)
    return {
      errors: [{
        code: 0,
        message: 'Erro desconhecido',
      }],
    };
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string): Promise<MauticResponse<T>> {
    return this.request<T>('GET', endpoint);
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data: any): Promise<MauticResponse<T>> {
    return this.request<T>('POST', endpoint, data);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data: any): Promise<MauticResponse<T>> {
    return this.request<T>('PATCH', endpoint, data);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<MauticResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }

  /**
   * Health check - testa conexão com Mautic
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/contacts?limit=1');
      return !response.errors || response.errors.length === 0;
    } catch {
      return false;
    }
  }
}

