/**
 * Cache em Memória para Vista CRM
 * 
 * Sistema simples de cache para reduzir requisições à API
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  /**
   * Armazena dados no cache
   */
  set<T>(key: string, data: T, ttlMs: number = 300000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }
  
  /**
   * Recupera dados do cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Verifica se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  /**
   * Remove item do cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Retorna estatísticas do cache
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton do cache
export const propertyCache = new MemoryCache();
export const detailsCache = new MemoryCache();
export const photosCache = new MemoryCache();

