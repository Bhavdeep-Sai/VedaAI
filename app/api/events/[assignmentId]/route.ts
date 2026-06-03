import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  ctx: RouteContext<'/api/events/[assignmentId]'>,
) {
  const { assignmentId } = await ctx.params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let subscriber: import('ioredis').Redis | null = null;
      let closed = false;

      const send = (data: object) => {
        if (closed) return;
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch {
          closed = true;
        }
      };

      // Send initial heartbeat
      send({ type: 'connected', assignmentId });

      try {
        const { getRedisSubscriber } = await import('@/lib/redis/redis.client');
        // Create a fresh subscriber to avoid shared state issues
        const { createFreshRedisConnection } = await import('@/lib/redis/redis.client');
        subscriber = createFreshRedisConnection();

        const channel = `gen:progress:${assignmentId}`;
        await subscriber.subscribe(channel);

        subscriber.on('message', (_channel: string, message: string) => {
          try {
            const parsed = JSON.parse(message);
            send(parsed);

            // Close stream when generation finishes
            if (
              parsed.type === 'generation-completed' ||
              parsed.type === 'generation-failed'
            ) {
              setTimeout(() => {
                closed = true;
                subscriber?.disconnect();
                try {
                  controller.close();
                } catch {}
              }, 500);
            }
          } catch {
            // Ignore parse errors
          }
        });

        // Also check if generation is already completed (page refresh case)
        const { getRedisClient } = await import('@/lib/redis/redis.client');
        const redis = getRedisClient();
        const cached = await redis.get(`gen:status:${assignmentId}`);
        if (cached) {
          const cachedStatus = JSON.parse(cached);
          if (
            cachedStatus.type === 'generation-completed' ||
            cachedStatus.type === 'generation-failed'
          ) {
            send(cachedStatus);
            setTimeout(() => {
              closed = true;
              subscriber?.disconnect();
              try {
                controller.close();
              } catch {}
            }, 100);
          }
        }
      } catch (error) {
        console.error('[SSE] Error setting up subscriber:', error);
        send({ type: 'error', message: 'Failed to connect to event stream' });
        closed = true;
        try {
          controller.close();
        } catch {}
      }

      // Cleanup on abort
      request.signal.addEventListener('abort', () => {
        closed = true;
        subscriber?.disconnect();
        try {
          controller.close();
        } catch {}
      });

      // Heartbeat every 25 seconds to prevent timeouts
      const heartbeat = setInterval(() => {
        if (closed) {
          clearInterval(heartbeat);
          return;
        }
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
