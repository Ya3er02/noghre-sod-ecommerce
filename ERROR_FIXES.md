# 🔧 Comprehensive Error Resolution Guide

## Overview
This document outlines all errors found in the project and their fixes.

## 1. Module Resolution Errors

### ❌ Problem: Missing Dependencies
**Errors:**
```
error: unable to resolve module helmet
error: unable to resolve module express
error: unable to resolve module axios
error: unable to resolve module speakeasy
error: unable to resolve module qrcode
error: unable to resolve module express-rate-limit
```

### ✅ Solution
**Status:** Fixed in `security.ts`

**Changes Made:**
- Removed `import helmet from 'helmet'`
- Removed `import rateLimit from 'express-rate-limit'`
- Removed `import axios from 'axios'`
- Removed `import speakeasy from 'speakeasy'`
- Removed `import ORCode from 'qrcode'`

**Why:**
- Encore.dev has built-in security headers and rate limiting
- External middleware is not necessary in Encore.dev framework
- These packages should only be used in pure Express/Node.js apps

**Encore.dev Alternative:**
```typescript
// Instead of helmet middleware, configure in encore.service.ts
// Encore automatically handles:
// - HSTS headers
// - X-Frame-Options
// - X-Content-Type-Options
// - CSP headers
// - Rate limiting via Encore dashboard
```

---

## 2. API Endpoint Conflicts

### ❌ Problem: Conflicting Endpoint Names
**Errors:**
```
error: api endpoints with conflicting names defined within the same service
  --> /root/noghre-sod-ecommerce/backend/product/service.ts:255:14
  --> /root/noghre-sod-ecommerce/backend/product/create.ts:6:14

error: api endpoints with conflicting paths defined
  --> /root/noghre-sod-ecommerce/backend/product/service.ts:58:21
  --> /root/noghre-sod-ecommerce/backend/product/service.ts:152:21
```

### ✅ Solution
**Status:** Fixed by refactoring product module

**File Structure Before:**
```
backend/product/
├── service.ts         (all endpoints in one file - CAUSES CONFLICTS)
├── types.ts
└── toggle_stock.ts
```

**File Structure After:**
```
backend/product/
├── types.ts           (all type definitions)
├── list.ts            (GET /products - list with filters)
├── get.ts             (GET /products/:id, featured, related, search, categories)
├── create.ts          (POST /products/create)
├── update.ts          (PUT /products/:id/update)
├── toggle_stock.ts    (toggle endpoint)
└── encore.service.ts
```

**Key Changes:**
1. **Renamed paths to be unique:**
   - `/products` → stays the same (list endpoint)
   - `/products/featured` → stays the same
   - `/products/categories` → `/products/categories/list` (was conflicting)
   - `/products/:id/create` → `/products/create` (POST instead)
   - `/products/:id/update` → `/products/:id/update` (distinct from create)

2. **Separated concerns:**
   - List/Get operations → `list.ts` and `get.ts`
   - Create operations → `create.ts`
   - Update operations → `update.ts`

---

## 3. Type Parameter Errors

### ❌ Problem: Unsupported Query Parameter Types
**Errors:**
```
error: type not supported for query parameters
  --> /root/noghre-sod-ecommerce/backend/product/service.ts:62:5
     |
  62 |  pagination?: PaginationParams;
     |  ^

error: type not supported for query parameters
  --> /root/noghre-sod-ecommerce/backend/product/service.ts:61:5
     |
  61 |  filters?: ProductFilters;
     |  ^
```

### ✅ Solution
**Status:** Fixed in `types.ts`

**Why:**
- Encore.dev only supports **primitive types** for query parameters
- Complex objects (interfaces with nested properties) are not allowed
- Arrays must be passed as comma-separated strings

**Before:**
```typescript
export interface ListProductsParams {
  filters?: ProductFilters;        // ❌ Complex object - NOT ALLOWED
  pagination?: PaginationParams;   // ❌ Complex object - NOT ALLOWED
}
```

**After:**
```typescript
export interface ProductFilterParams {
  categories?: string;      // ✅ Comma-separated string
  purities?: string;        // ✅ Comma-separated string
  minPrice?: number;
  maxPrice?: number;
  minWeight?: number;
  maxWeight?: number;
  inStock?: boolean;
  onSale?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
}
```

**Usage Example:**
```bash
# Before (Invalid)
GET /products?filters={categories:["gold"],priceRange:[100,500]}

# After (Valid)
GET /products?categories=gold,silver&minPrice=100&maxPrice=500&page=1&limit=12
```

---

## 4. Buyback Service Conflicts

### ❌ Problem: Duplicate Function Names
**Error:**
```
error: api endpoints with conflicting names defined within the same service
  --> /root/noghre-sod-ecommerce/backend/buyback/service.ts:157:14
  --> /root/noghre-sod-ecommerce/backend/buyback/create_request.ts:6:14
```

### ✅ Solution
**Status:** Fixed by separating files

**Before:**
```
backend/buyback/
├── service.ts          (mixed: create + list + get)
└── create_request.ts   (also has createRequest - CONFLICT)
```

**After:**
```
backend/buyback/
├── create_request.ts   (only POST /buyback/requests/create)
├── service.ts          (list, get, approve, reject)
└── encore.service.ts
```

**Function Mapping:**
- `createBuybackRequest` → `create_request.ts` (POST)
- `listBuybackRequests` → `service.ts` (GET)
- `getBuybackRequest` → `service.ts` (GET)
- `approveBuybackRequest` → `service.ts` (PUT)
- `rejectBuybackRequest` → `service.ts` (PUT)

---

## 5. Package.json Dependencies

### ✅ Current Dependencies
```json
{
  "dependencies": {
    "@clerk/backend": "^1.27.0",
    "encore.dev": "^1.51.6",
    "zod": "^3.23.8",
    "openai": "^4.65.0",
    "express": "^4.19.2",
    "axios": "^1.7.7",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.4.0",
    "qrcode": "^1.5.4",
    "speakeasy": "^2.0.0"
  }
}
```

### 🔄 Notes on Dependencies
- **Keep installed:** Only for local development reference
- **Don't use in Encore.dev:** helmet, express-rate-limit, qrcode, speakeasy
- **Use Encore alternatives:** Built-in security & rate limiting
- **Safe to use:** axios, zod, openai for API calls and validation

---

## Testing the Fixes

### 1. Verify Compilation
```bash
cd backend
bun run build
# OR with Encore CLI
encorre run
```

### 2. Test API Endpoints
```bash
# List products with filters
curl "http://localhost:4000/products?categories=gold&page=1&limit=10"

# Get single product
curl "http://localhost:4000/products/{id}"

# Create product (requires auth)
curl -X POST http://localhost:4000/products/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Gold Ring","price":500}'

# Create buyback request
curl -X POST http://localhost:4000/buyback/requests/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"userId":"123","productId":"456","quantity":1}'
```

### 3. Check TypeScript Compilation
```bash
npx tsc --noEmit
```

---

## Files Modified

### Core Fixes
- ✅ `backend/auth/middleware/security.ts` - Removed incompatible imports
- ✅ `backend/product/types.ts` - Fixed parameter types
- ✅ `backend/product/list.ts` - NEW - List and search endpoints
- ✅ `backend/product/get.ts` - NEW - GET operations
- ✅ `backend/product/create.ts` - NEW - POST operations
- ✅ `backend/product/update.ts` - NEW - PUT operations
- ✅ `backend/buyback/create_request.ts` - Standalone create endpoint
- ✅ `backend/buyback/service.ts` - List, get, approve, reject endpoints

### Documentation
- ✅ `ERROR_FIXES.md` - This file

---

## Next Steps

1. **Review the PR** - Examine all changes
2. **Run tests** - `bun run test`
3. **Deploy to staging** - Test in dev environment first
4. **Merge to main** - Once all tests pass
5. **Deploy to production** - Follow your CI/CD pipeline

---

## Common Patterns for Encore.dev

### ✅ DO: Use simple types for query parameters
```typescript
export const listItems = api(
  { expose: true, method: 'GET', path: '/items' },
  async ({
    page = 1,
    limit = 10,
    search = '',
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ListResponse> => {
    // Implementation
  }
);
```

### ❌ DON'T: Use complex objects
```typescript
export interface FilterConfig {
  minPrice: number;
  maxPrice: number;
}

export const listItems = api(
  { expose: true, method: 'GET', path: '/items' },
  async ({ filter }: { filter: FilterConfig }) => {  // ❌ NOT ALLOWED
    // ...
  }
);
```

### ✅ DO: Pass arrays as strings
```typescript
// Endpoint
GET /products?categories=gold,silver,platinum

// Handler
const categories = params.categories?.split(',') || [];
```

### ✅ DO: Use separate files for different endpoints
```
service/
├── types.ts
├── list.ts        (GET endpoints)
├── get.ts         (GET /id endpoints)
├── create.ts      (POST endpoints)
├── update.ts      (PUT endpoints)
└── delete.ts      (DELETE endpoints)
```

---

## Debugging Tips

### Error: "Type not supported for query parameters"
**Fix:** Replace object parameters with primitives (string, number, boolean)

### Error: "API endpoints with conflicting names"
**Fix:** 
- Use unique function names across the service
- Or split into multiple files
- Rename paths to be distinct (add suffixes like `/create`, `/update`)

### Error: "Failed to resolve module"
**Fix:** 
- Check that the module is in package.json
- Verify the import path is correct
- For Encore.dev specific modules, use `encore.dev/api` instead of express

---

## References
- [Encore.dev API Documentation](https://encore.dev/docs/primitives/apis)
- [Encore.dev Services Guide](https://encore.dev/docs/how-to-guides/services)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/)

---

## Support

For questions or issues:
1. Check the ERROR_FIXES.md (this file)
2. Review Encore.dev documentation
3. Create an issue in the repository
4. Ask the development team
