/**
 * Shared Database Instance for Product Module
 * Ensures all product operations use the same database connection
 */

import { SQLDatabase } from 'encore.dev/storage/sqldb';
import * as path from 'path';

// Single database instance shared across all product endpoints
export const db = new SQLDatabase('product', {
  migrations: path.join(__dirname, 'migrations'),
});
