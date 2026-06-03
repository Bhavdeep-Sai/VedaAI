import 'server-only';
import { Queue } from 'bullmq';
import { createFreshRedisConnection } from '@/lib/redis/redis.client';

export const QUEUE_NAME = 'generation-queue';

let queue: Queue | null = null;

export function getGenerationQueue(): Queue {
  if (!queue) {
    queue = new Queue(QUEUE_NAME, {
      connection: createFreshRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: { count: 50, age: 3600 },
        removeOnFail: { count: 100, age: 86400 },
      },
    });

    queue.on('error', (error) => {
      console.error('[Queue] Error:', error);
    });

    console.log('[Queue] Generation queue initialized');
  }
  return queue;
}

export async function closeGenerationQueue(): Promise<void> {
  if (queue) {
    await queue.close();
    queue = null;
  }
}
