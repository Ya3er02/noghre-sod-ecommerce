import { z } from 'zod';

const envSchema = z.object({
  VITE_CLIENT_TARGET: z.string().url('VITE_CLIENT_TARGET must be a valid URL'),
  VITE_CLERK_PUBLISHABLE_KEY: z
    .string()
    .startsWith('pk_', 'VITE_CLERK_PUBLISHABLE_KEY must start with pk_'),
  VITE_API_URL: z.string().url('VITE_API_URL must be a valid URL').optional(),
  MODE: z.enum(['development', 'production', 'test']),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse({
      VITE_CLIENT_TARGET: import.meta.env.VITE_CLIENT_TARGET,
      VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      MODE: import.meta.env.MODE,
    });
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error(
      'Invalid environment configuration. Please check your .env.local file.'
    );
  }
}

export const env = validateEnv();