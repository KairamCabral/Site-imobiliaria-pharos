import Redis from 'ioredis';

type RedisClient = Redis;

let redisClient: RedisClient | null = null;
let redisAvailable = true;

export function getRedisClient(): RedisClient | null {
  if (typeof window !== 'undefined') {
    return null;
  }

  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redisAvailable) {
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableAutoPipelining: true,
    });

    redisClient.on('error', (error) => {
      redisAvailable = false;
      redisClient?.disconnect();
      redisClient = null;
      console.error('[cache] Redis indisponível, fallback para memória:', error);
    });

    return redisClient;
  } catch (error) {
    redisAvailable = false;
    redisClient = null;
    console.error('[cache] Falha ao inicializar Redis:', error);
    return null;
  }
}

export async function disconnectRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch {
      // ignorar
    } finally {
      redisClient = null;
    }
  }
}


