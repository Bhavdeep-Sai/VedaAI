/**
 * Next.js 16 Instrumentation Hook
 * Runs once on server startup (Node.js runtime only).
 * Used to initialize the BullMQ worker.
 */
export async function register() {
  // Only run in Node.js runtime, not Edge
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Starting generation worker...');
    try {
      const { startWorker } = await import('./workers/generation.worker');
      startWorker();
      console.log('[Instrumentation] Generation worker started successfully');
    } catch (error) {
      console.error('[Instrumentation] Failed to start generation worker:', error);
      // Don't throw — allow the app to continue even if worker fails to start
    }
  }
}

export async function onRequestError(
  error: { digest: string } & Error,
  request: {
    path: string;
    method: string;
    headers: { [key: string]: string };
  },
  context: {
    routerKind: 'Pages Router' | 'App Router';
    routePath: string;
    routeType: 'render' | 'route' | 'action' | 'middleware';
    renderSource?: 'react-server-components' | 'react-server-components-payload' | 'server-rendering';
    revalidateReason?: 'on-demand' | 'stale' | 'build';
  },
) {
  // Log server errors for observability
  console.error('[Server Error]', {
    digest: error.digest,
    message: error.message,
    path: request.path,
    method: request.method,
    routeType: context.routeType,
  });
}
