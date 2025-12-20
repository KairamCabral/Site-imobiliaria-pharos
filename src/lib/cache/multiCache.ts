import { getRedisClient } from './redis';
import { memoryDelete, memoryDeleteByPrefix, memoryGet, memorySet, memoryStats } from './memory';

type CacheLayer = 'memory' | 'redis' | 'origin';

export type MultiCacheMeta = {
  layer: CacheLayer;
  expiresAt: number;
  ttl: number;
  fetchedAt: number;
};

export type MultiCacheResult<T> = {
  data: T;
  meta: MultiCacheMeta;
};

type Fetcher<T> = () => Promise<T>;

export type MultiCacheOptions<T> = {
  namespace: string;
  key: string;
  ttl: number;
  fetcher: Fetcher<T>;
  serialize?: (value: MultiCacheResult<T>) => string;
  deserialize?: (value: string) => MultiCacheResult<T>;
};

const inflight = new Map<string, Promise<MultiCacheResult<unknown>>>();

const DEFAULT_SERIALIZER = <T>(value: MultiCacheResult<T>): string => JSON.stringify(value);
const DEFAULT_DESERIALIZER = <T>(value: string): MultiCacheResult<T> => JSON.parse(value) as MultiCacheResult<T>;

function buildFullKey(namespace: string, key: string) {
  return `${namespace}:${key}`;
}

export async function getOrSetMultiCache<T>(options: MultiCacheOptions<T>): Promise<MultiCacheResult<T>> {
  const { namespace, key, ttl, fetcher, serialize = DEFAULT_SERIALIZER, deserialize = DEFAULT_DESERIALIZER } = options;
  const fullKey = buildFullKey(namespace, key);
  const now = Date.now();

  const memoryEntry = memoryGet<MultiCacheResult<T>>(fullKey);
  if (memoryEntry) {
    return {
      data: memoryEntry.value.data,
      meta: {
        layer: 'memory',
        expiresAt: memoryEntry.value.meta.expiresAt,
        ttl: Math.max(memoryEntry.value.meta.expiresAt - now, 0),
        fetchedAt: memoryEntry.value.meta.fetchedAt,
      },
    };
  }

  const inflightPromise = inflight.get(fullKey);
  if (inflightPromise) {
    return inflightPromise as Promise<MultiCacheResult<T>>;
  }

  const resolver: Promise<MultiCacheResult<T>> = (async (): Promise<MultiCacheResult<T>> => {
    const redis = getRedisClient();
    if (redis) {
      try {
        const redisValue = await redis.get(fullKey);
        if (redisValue) {
          const payload = deserialize(redisValue);
          const expiresAt = payload.meta.expiresAt || now + ttl;
          const normalizedPayload: MultiCacheResult<T> = {
            data: payload.data,
            meta: {
              layer: (payload.meta.layer as CacheLayer) ?? 'redis',
              expiresAt,
              ttl: Math.max(expiresAt - now, 0),
              fetchedAt: payload.meta.fetchedAt ?? now,
            },
          };

          memorySet(fullKey, normalizedPayload, Math.max(expiresAt - now, 0));

          return {
            data: normalizedPayload.data,
            meta: {
              layer: 'redis',
              expiresAt,
              ttl: Math.max(expiresAt - now, 0),
              fetchedAt: normalizedPayload.meta.fetchedAt,
            },
          };
        }
      } catch (error) {
        console.warn('[cache] Falha ao ler do Redis, seguindo para fetch:', error);
      }
    }

    const data = await fetcher();
    const expiresAt = now + ttl;
    const payload: MultiCacheResult<T> = {
      data,
      meta: {
        layer: 'origin',
        expiresAt,
        ttl,
        fetchedAt: now,
      },
    };

    memorySet(fullKey, payload, ttl);

    if (redis) {
      try {
        await redis.set(fullKey, serialize(payload), 'PX', ttl);
      } catch (error) {
        console.warn('[cache] Falha ao gravar no Redis:', error);
      }
    }

    return payload;
  })();

  inflight.set(fullKey, resolver as Promise<MultiCacheResult<unknown>>);

  try {
    const result = await resolver;
    memorySet(fullKey, result, Math.max(result.meta.expiresAt - now, 0));
    return result;
  } finally {
    inflight.delete(fullKey);
  }
}

export async function invalidateMultiCache(namespace: string, key?: string) {
  const redis = getRedisClient();

  if (key) {
    const fullKey = buildFullKey(namespace, key);
    memoryDelete(fullKey);
    await redis?.del(fullKey).catch(() => undefined);
    return;
  }

  const prefix = `${namespace}:`;
  memoryDeleteByPrefix(prefix);

  if (redis) {
    let cursor = '0';
    const pattern = `${prefix}*`;

    do {
      // eslint-disable-next-line no-await-in-loop
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;

      if (keys.length > 0) {
        // eslint-disable-next-line no-await-in-loop
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  }
}

export function multiCacheStats() {
  return {
    memory: memoryStats(),
    redis: Boolean(getRedisClient()),
  };
}


