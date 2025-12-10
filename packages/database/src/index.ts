/**
 * Database Package - Shared Prisma Client
 * This package exports a singleton Prisma client for all services
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Prisma Client Singleton
 * Ensures only one instance is created across the application
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ============================================
// Export Prisma Models & Types
// ============================================

export type {
  User,
  Product,
  Order,
  OrderItem,
  Payment,
  Shipment,
  Price,
  PriceHistory,
  PriceAlert,
  Inventory,
  AIAdvisor,
  TrendAnalysis,
  Profile,
  Address,
  AuditLog,
} from '@prisma/client';

export {
  UserRole,
  ProductCategory,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  PaymentMethod,
  TriggerType,
} from '@prisma/client';

// ============================================
// Database Connection Health Check
// ============================================

/**
 * Health check function for database connectivity
 * @returns Promise<boolean> - true if database is accessible
 */
export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// ============================================
// Graceful Shutdown
// ============================================

/**
 * Gracefully disconnect Prisma client
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('Database connection closed');
}

// Handle SIGINT and SIGTERM for graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await disconnectDatabase();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}
