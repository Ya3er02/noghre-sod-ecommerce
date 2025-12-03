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

export const health = api(
  { expose: true, method: 'GET', path: '/health' },
  async (): Promise<HealthResponse> => {
    // Check database connection
    let dbStatus: 'up' | 'down' = 'down';
    try {
      // Add your database ping logic here
      // const result = await db.query('SELECT 1');
      dbStatus = 'up';
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Check Redis connection
    let redisStatus: 'up' | 'down' = 'down';
    try {
      // Add your Redis ping logic here
      // await redis.ping();
      redisStatus = 'up';
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    // Check Clerk integration
    let clerkStatus: 'up' | 'down' = 'down';
    try {
      // Add minimal Clerk API check
      clerkStatus = 'up';
    } catch (error) {
      console.error('Clerk health check failed:', error);
    }

    // Determine overall status
    const allUp = dbStatus === 'up' && redisStatus === 'up' && clerkStatus === 'up';
    const someUp = dbStatus === 'up' || redisStatus === 'up';

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
