import 'server-only';
import Redis from 'ioredis';

export const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

declare global {
  // eslint-disable-next-line no-var
  var __redis: { client: Redis | null; subscriber: Redis | null };
}

const cache = global.__redis ?? { client: null, subscriber: null };
global.__redis = cache;

function createRedisClient(name: string): Redis {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError: (err: Error) => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
    lazyConnect: false,
  });

  client.on('connect', () => console.log(`[Redis:${name}] Connected`));
  client.on('error', (err: Error & { code?: string, errors?: Array<{code: string}> }) => {
    if (
      err.code === 'ECONNREFUSED' ||
      err.message.includes('ECONNREFUSED') ||
      (err.errors && err.errors.some((e) => e.code === 'ECONNREFUSED'))
    ) {
      // Suppress massive connection retry spam
      return;
    }
    console.error(`[Redis:${name}] Error:`, err);
  });
  client.on('reconnecting', () => {
    // Suppress reconnecting spam to keep console clean
  });

  return client;
}

export function getRedisClient(): Redis {
  if (!cache.client) {
    cache.client = createRedisClient('main');
  }
  return cache.client;
}

/** Separate subscriber client — cannot be reused for commands */
export function getRedisSubscriber(): Redis {
  if (!cache.subscriber) {
    cache.subscriber = createRedisClient('subscriber');
  }
  return cache.subscriber;
}

/** Create a fresh Redis connection (used by BullMQ workers) */
export function createFreshRedisConnection(): Redis {
  return new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

export default getRedisClient;
