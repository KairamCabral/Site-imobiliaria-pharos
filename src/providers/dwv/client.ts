import { DWV_CONFIG, LOGGING_CONFIG } from '@/config/providers';

type HttpMethod = 'GET' | 'POST';

interface RequestOptions {
  method?: HttpMethod;
  params?: Record<string, any>;
  body?: unknown;
  timeout?: number;
}

export class DwvClient {
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;
  private headers: Record<string, string>;

  constructor() {
    if (!DWV_CONFIG.apiKey) {
      console.warn('[DwvClient] DWV_API_TOKEN não configurado. Requisições irão falhar.');
    }

    this.baseUrl = (DWV_CONFIG.baseUrl || 'https://api.dwvapp.com.br').replace(/\/$/, '');
    this.timeout = DWV_CONFIG.timeout || 15000;
    this.maxRetries = DWV_CONFIG.retries ?? 2;
    this.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(DWV_CONFIG.headers || {}),
    };
    if (DWV_CONFIG.apiKey) {
      // Garante que o header token sempre esteja presente.
      this.headers.token = DWV_CONFIG.apiKey;
    }
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(path, { method: 'GET', params });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body });
  }

  private async request<T>(path: string, options: RequestOptions): Promise<T> {
    const url = this.buildUrl(path, options.params);
    const method = options.method || 'GET';
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= this.maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.timeout);

        const response = await fetch(url, {
          method,
          signal: controller.signal,
          headers: this.headers,
          body: method === 'GET' ? undefined : JSON.stringify(options.body ?? {}),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const payload = await response.text();
          throw new Error(`DWV responded ${response.status}: ${payload}`);
        }

        const json = (await response.json()) as T;

        if (LOGGING_CONFIG.logResponses) {
          console.log(`[DWV] ${method} ${url} → OK`);
        }

        return json;
      } catch (error) {
        lastError = error;
        attempt += 1;

        const shouldRetry = this.isRetryable(error) && attempt <= this.maxRetries;
        if (!shouldRetry) {
          break;
        }

        const backoff = Math.min(1000 * Math.pow(2, attempt), 4000);
        if (LOGGING_CONFIG.logErrors) {
          console.warn(`[DWV] tentativa ${attempt} falhou (${error}). Retentando em ${backoff}ms`);
        }
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('[DwvClient] Requisição falhou sem detalhes');
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        url.searchParams.append(key, Array.isArray(value) ? value.join(',') : String(value));
      });
    }
    return url.toString();
  }

  private isRetryable(error: unknown): boolean {
    if (error instanceof Error) {
      if (error.name === 'AbortError') return true;
      if (/429|5\d{2}/.test(error.message)) return true;
    }
    return false;
  }
}

let clientInstance: DwvClient | null = null;

export function getDwvClient(): DwvClient {
  if (!clientInstance) {
    clientInstance = new DwvClient();
  }
  return clientInstance;
}

