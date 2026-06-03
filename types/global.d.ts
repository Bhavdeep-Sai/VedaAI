/**
 * Next.js 16 Route Handler type helper.
 * Provides typed context for route handlers with dynamic params.
 * In Next.js 16, `params` is a Promise — must be awaited.
 */
type RouteContext<
  T extends string,
  Params extends Record<string, string | string[]> = Record<string, string>,
> = {
  params: Promise<Params>;
};

/**
 * Global module augmentations
 */
declare global {
  /** Redis cache holder on the global object */
  var __redis: {
    client: import('ioredis').Redis | null;
    subscriber: import('ioredis').Redis | null;
  };

  /** Mongoose connection cache */
  var __mongoose: {
    conn: import('mongoose').Mongoose | null;
    promise: Promise<import('mongoose').Mongoose> | null;
  };
}

export {};
