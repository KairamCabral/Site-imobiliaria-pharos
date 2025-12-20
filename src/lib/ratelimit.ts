/**
 * Rate Limiting System - Imobiliária Pharos
 * 
 * Sistema de limitação de taxa para proteger APIs contra:
 * - Ataques de força bruta
 * - Spam de formulários
 * - DDoS
 * - Abuso de recursos
 */

import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

/**
 * Cria um rate limiter baseado em LRU Cache
 * 
 * @param options - Configurações do limiter
 * @returns Função de rate limiting
 */
export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // 1 minuto padrão
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;

        return isRateLimited ? reject() : resolve();
      }),
    
    /**
     * Retorna informações sobre o uso atual
     */
    getUsage: (token: string) => {
      const tokenCount = (tokenCache.get(token) as number[]) || [0];
      return {
        current: tokenCount[0],
        remaining: (options?.uniqueTokenPerInterval || 500) - tokenCount[0],
      };
    },
  };
}

/**
 * Rate Limiter Padrão
 * 10 requisições por minuto por IP
 */
export const limiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
});

/**
 * Rate Limiter Estrito
 * Para endpoints sensíveis (criação de leads, agendamentos)
 * 5 requisições por 15 minutos por IP
 */
export const strictLimiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutos
  uniqueTokenPerInterval: 500,
});

/**
 * Rate Limiter para Consultas
 * Mais permissivo para listagens e buscas
 * 30 requisições por minuto por IP
 */
export const queryLimiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 1000,
});

/**
 * Helper: Extrai IP do request
 * Suporta proxies (Vercel, Cloudflare, AWS)
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  
  // Cloudflare
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;
  
  // Proxies padrão
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) return xRealIp;
  
  return 'unknown';
}

/**
 * Helper: Resposta padrão de rate limit excedido
 */
export function rateLimitExceededResponse(retryAfter: number = 900) {
  return Response.json(
    {
      success: false,
      error: 'Muitas requisições. Aguarde alguns minutos e tente novamente.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + retryAfter * 1000).toISOString(),
      },
    }
  );
}

