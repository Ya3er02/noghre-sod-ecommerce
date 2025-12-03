import { api } from 'encore.dev/api';

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    clerk: 'up' | 'down';
  };
}

const startTime = Date.now();

// Helper function with timeout
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    ),
  ]);
};

export const health = api(
  { expose: true, method: 'GET', path: '/health' },
  async (): Promise<HealthResponse> => {
    // Check database connection with real query
    let dbStatus: 'up' | 'down' = 'down';
    try {
      // TODO: Replace with your actual DB client
      // Example: await withTimeout(db.query('SELECT 1'), 2000);
      // For now, using a placeholder that will be replaced when DB is integrated
      await withTimeout(
        Promise.resolve(), // Replace with actual DB query
        2000
      );
      dbStatus = 'up';
    } catch (error) {
      console.error('Database health check failed:', error);
      dbStatus = 'down';
    }

    // Check Redis connection with PING command
    let redisStatus: 'up' | 'down' = 'down';
    try {
      // TODO: Replace with your actual Redis client
      // Example: await withTimeout(redis.ping(), 2000);
      // For now, using a placeholder that will be replaced when Redis is integrated
      await withTimeout(
        Promise.resolve(), // Replace with actual Redis PING
        2000
      );
      redisStatus = 'up';
    } catch (error) {
      console.error('Redis health check failed:', error);
      redisStatus = 'down';
    }

    // Check Clerk integration with minimal API call
    let clerkStatus: 'up' | 'down' = 'down';
    try {
      // TODO: Replace with minimal Clerk SDK check
      // Example: await withTimeout(clerkClient.users.getCount(), 2000);
      // For now, using a placeholder that will be replaced when Clerk is integrated
      await withTimeout(
        Promise.resolve(), // Replace with actual Clerk API check
        2000
      );
      clerkStatus = 'up';
    } catch (error) {
      console.error('Clerk health check failed:', error);
      clerkStatus = 'down';
    }

    // Determine overall status - include clerkStatus in degraded calculation
    const allUp = dbStatus === 'up' && redisStatus === 'up' && clerkStatus === 'up';
    const someUp = dbStatus === 'up' || redisStatus === 'up' || clerkStatus === 'up';

    return {
      status: allUp ? 'healthy' : someUp ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000), // seconds
      version: process.env.npm_package_version || '2.0.0',
      services: {
        database: dbStatus,
        redis: redisStatus,
        clerk: clerkStatus,
      },
    };
  }
);

// Readiness check (for Kubernetes/Docker)
export const ready = api(
  { expose: true, method: 'GET', path: '/ready' },
  async (): Promise<{ ready: boolean }> => {
    try {
      // Add critical dependency checks
      return { ready: true };
    } catch (error) {
      throw new Error('Service not ready');
    }
  }
);

// Liveness check (for Kubernetes/Docker)
export const live = api(
  { expose: true, method: 'GET', path: '/live' },
  async (): Promise<{ alive: boolean }> => {
    return { alive: true };
  }
);
