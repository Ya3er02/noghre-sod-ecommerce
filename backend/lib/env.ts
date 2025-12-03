import { z } from 'zod';

// Environment schema for backend
const backendEnvSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Server configuration
  HOST: z.string().default('0.0.0.0'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('4000'),
  
  // URLs
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  BACKEND_URL: z.string().url('BACKEND_URL must be a valid URL').optional(),
  
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),
  POSTGRES_USER: z.string().min(1, 'POSTGRES_USER is required'),
  POSTGRES_PASSWORD: z.string().min(8, 'POSTGRES_PASSWORD must be at least 8 characters'),
  POSTGRES_DB: z.string().min(1, 'POSTGRES_DB is required'),
  
  // Redis
  REDIS_PASSWORD: z.string().min(8, 'REDIS_PASSWORD must be at least 8 characters'),
  REDIS_URL: z.string().url('REDIS_URL must be a valid connection string'),
  REDIS_HOST: z.string().default('redis'),
  REDIS_PORT: z.string().regex(/^\d+$/).transform(Number).default('6379'),
  
  // Encore
  ENCORE_APP_ID: z.string().min(1, 'ENCORE_APP_ID is required'),
  ENCORE_RUNTIME_ENV: z.enum(['local', 'development', 'staging', 'production']).default('development'),
  
  // Clerk Authentication
  CLERK_SECRET_KEY: z.string().startsWith('sk_', 'CLERK_SECRET_KEY must start with sk_'),
  CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'CLERK_PUBLISHABLE_KEY must start with pk_'),
  
  // JWT & Security
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  
  // CORS
  CORS_ALLOWED_ORIGINS: z.string().transform(val => val.split(',').map(s => s.trim())),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().regex(/^\d+$/).transform(Number).default('10485760'),
  UPLOAD_DIR: z.string().default('/app/uploads'),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;

function validateBackendEnv(): BackendEnv {
  try {
    const parsed = backendEnvSchema.parse(process.env);
    
    // Additional security checks
    if (parsed.NODE_ENV === 'production') {
      // Ensure production uses live Clerk keys
      if (!parsed.CLERK_SECRET_KEY.startsWith('sk_live_')) {
        console.warn('⚠️  WARNING: Production should use live Clerk keys (sk_live_...)');
      }
      
      // Ensure HTTPS in production
      if (!parsed.FRONTEND_URL.startsWith('https://') && 
          !parsed.FRONTEND_URL.includes('localhost')) {
        console.warn('⚠️  WARNING: Production should use HTTPS');
      }
    }
    
    console.log('✅ Environment variables validated successfully');
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('❌ Environment validation error:', error);
    }
    
    throw new Error(
      'Invalid backend environment configuration. Check your .env file.'
    );
  }
}

// Export validated environment
export const env = validateBackendEnv();

// Export individual validated variables for convenience
export const {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  REDIS_URL,
  CLERK_SECRET_KEY,
  CORS_ALLOWED_ORIGINS,
  JWT_SECRET,
  SESSION_SECRET,
} = env;
