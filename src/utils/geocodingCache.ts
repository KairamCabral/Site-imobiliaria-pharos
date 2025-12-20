/**
 * Sistema de Cache Avançado para Geocoding
 * Usa IndexedDB para performance superior e persistência confiável
 */

const DB_NAME = 'pharos_geocoding_cache';
const STORE_NAME = 'geocoding';
const DB_VERSION = 1;
const CACHE_EXPIRATION_DAYS = 30;

interface CacheEntry {
  address: string;
  lat: number;
  lng: number;
  timestamp: number;
}

class GeocodingCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private memoryCache: Map<string, { lat: number; lng: number }> = new Map();

  /**
   * Inicializa o banco IndexedDB
   */
  private async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.warn('[GeocodingCache] Falha ao abrir IndexedDB, usando memória apenas');
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[GeocodingCache] ✅ IndexedDB inicializado');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'address' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('[GeocodingCache] Store criada');
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Normaliza endereço para chave única
   */
  private normalizeAddress(address: string): string {
    return address
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[^\w\sàáâãèéêìíòóôõùúçñ]/g, '');
  }

  /**
   * Busca coordenadas no cache (memória → IndexedDB)
   */
  async get(address: string): Promise<{ lat: number; lng: number } | null> {
    const key = this.normalizeAddress(address);

    // 1. Tenta cache em memória (instantâneo)
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key)!;
    }

    // 2. Tenta IndexedDB
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry: CacheEntry | undefined = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        // Verifica expiração
        const age = Date.now() - entry.timestamp;
        const maxAge = CACHE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
        
        if (age > maxAge) {
          this.delete(address); // Remove cache expirado
          resolve(null);
          return;
        }

        // Atualiza cache em memória
        const coords = { lat: entry.lat, lng: entry.lng };
        this.memoryCache.set(key, coords);
        resolve(coords);
      };

      request.onerror = () => resolve(null);
    });
  }

  /**
   * Salva coordenadas no cache (memória + IndexedDB)
   */
  async set(address: string, lat: number, lng: number): Promise<void> {
    const key = this.normalizeAddress(address);
    const coords = { lat, lng };

    // 1. Salva em memória (instantâneo)
    this.memoryCache.set(key, coords);

    // 2. Salva em IndexedDB (persistente)
    await this.init();
    if (!this.db) return;

    const entry: CacheEntry = {
      address: key,
      lat,
      lng,
      timestamp: Date.now(),
    };

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.warn('[GeocodingCache] Erro ao salvar no IndexedDB');
        resolve();
      };
    });
  }

  /**
   * Remove entrada do cache
   */
  private async delete(address: string): Promise<void> {
    const key = this.normalizeAddress(address);
    this.memoryCache.delete(key);

    await this.init();
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  }

  /**
   * Busca múltiplos endereços de uma vez (batch)
   */
  async getMany(addresses: string[]): Promise<Map<string, { lat: number; lng: number }>> {
    const results = new Map<string, { lat: number; lng: number }>();
    
    await Promise.all(
      addresses.map(async (address) => {
        const coords = await this.get(address);
        if (coords) {
          results.set(address, coords);
        }
      })
    );

    return results;
  }

  /**
   * Salva múltiplos endereços de uma vez (batch)
   */
  async setMany(entries: Array<{ address: string; lat: number; lng: number }>): Promise<void> {
    await Promise.all(entries.map((entry) => this.set(entry.address, entry.lat, entry.lng)));
  }

  /**
   * Limpa cache expirado
   */
  async cleanup(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const maxAge = CACHE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
      const cutoffTime = Date.now() - maxAge;

      const request = index.openCursor();
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const entry: CacheEntry = cursor.value;
          if (entry.timestamp < cutoffTime) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          console.log('[GeocodingCache] Limpeza concluída');
          resolve();
        }
      };

      request.onerror = () => resolve();
    });
  }

  /**
   * Retorna estatísticas do cache
   */
  async getStats(): Promise<{ total: number; memorySize: number }> {
    await this.init();
    
    const memorySize = this.memoryCache.size;
    
    if (!this.db) {
      return { total: memorySize, memorySize };
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => {
        resolve({ total: request.result, memorySize });
      };

      request.onerror = () => {
        resolve({ total: memorySize, memorySize });
      };
    });
  }
}

// Singleton global
export const geocodingCache = new GeocodingCache();

// Limpar cache ao carregar (mantém apenas dados válidos)
if (typeof window !== 'undefined') {
  geocodingCache.cleanup();
}

