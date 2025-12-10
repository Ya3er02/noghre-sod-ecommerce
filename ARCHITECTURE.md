# 🏛️ Noghre-SOD Reborn 2.0 - Architecture Documentation

**Version:** 2.0.0  
**Author:** Ya3er02  
**Last Updated:** December 2025  
**License:** MIT  

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Architecture Pattern](#architecture-pattern)
4. [Directory Structure](#directory-structure)
5. [Service Isolation](#service-isolation)
6. [Fault Tolerance](#fault-tolerance)
7. [Technology Stack](#technology-stack)
8. [Development Guide](#development-guide)
9. [Deployment](#deployment)
10. [Monitoring & Observability](#monitoring--observability)

---

## 🎯 Overview

Noghre-SOD Reborn is a **resilient, modular monorepo** for a silver trading e-commerce platform with AI capabilities. The architecture prioritizes **zero-downtime updates** and **graceful degradation**.

### Key Goals

✅ **Core services NEVER go down** - Even if AI or pricing services fail, users can still browse and buy  
✅ **Feature flags enable/disable modules** - Deploy new features without full redeployment  
✅ **Circuit breaker pattern** - Prevents cascading failures across services  
✅ **Free-tier AI integration** - Uses Google Gemini 1.5 Flash to minimize costs  
✅ **Production-ready from day one** - Proper logging, health checks, error handling  

---

## 🏗️ Core Principles

### Rule 1: The Core Never Dies

The **Core Service** (Auth, User Management, Product Catalog) is the foundation. It implements:
- ✅ Essential business logic only
- ✅ Read-optimized product queries
- ✅ JWT-based authentication
- ✅ Zero external API dependencies for critical paths

**If Core fails → Application is completely down. Prevent this at all costs.**

### Rule 2: Satellite Services Are Isolated

Non-essential services (AI, Pricing, Trading) are separated:
- 🔄 Can be deployed/restarted independently
- 🔄 Failures don't cascade to Core
- 🔄 Can use feature flags to disable gracefully

### Rule 3: Always Have a Fallback

Every external API call has a fallback:
- 📊 Gemini AI fails? Use mock trend analysis
- 💰 Pricing API fails? Use cached prices
- 🤖 Intelligence service down? Show static content

### Rule 4: Feature Flags Control Everything

```javascript
// Enable/disable features without redeploying
await flagManager.setFlag('FEATURE_AI_ADVISOR', false);
await flagManager.setFlag('FEATURE_LIVE_PRICING', true);
```

---

## 🎭 Architecture Pattern: Modular Monorepo

```
MONOREPO (Turborepo)
├── apps/ (User-facing applications)
│   ├── web (Next.js 15 Storefront)
│   └── admin (React Admin Dashboard)
├── services/ (Backend microservices)
│   ├── core (Auth, User, Products - CORE)
│   ├── pricing (Silver Price Engine - SATELLITE)
│   ├── trade (Buy/Sell Logic - SATELLITE)
│   └── intelligence (AI Advisor - SATELLITE)
├── packages/ (Shared code)
│   ├── database (Prisma + PostgreSQL)
│   ├── ui (Shadcn components)
│   ├── utils (Circuit breaker, Feature flags)
│   └── config (ESLint, TypeScript, etc.)
└── docker-compose.yml
```

### Why Modular Monorepo?

| Aspect | Monolith ❌ | Microservices ❌ | Modular Monorepo ✅ |
|--------|-----------|-----------------|-------------------|
| Complexity | Low | Very High | Medium |
| Deployments | All or nothing | Complex coordination | Per-service |
| Shared Code | Duplication | HTTP overhead | Native imports |
| Development | Fast feedback | Debugging nightmare | Best of both |
| Scaling | Vertical only | Horizontal easy | Flexible |

---

## 📁 Directory Structure

```
noghre-sod-reborn/
│
├── apps/
│   ├── web/                          # Next.js 15 Storefront
│   │   ├── app/
│   │   │   ├── page.tsx             # Homepage
│   │   │   ├── products/[id]/       # Product page
│   │   │   └── dashboard/           # User dashboard
│   │   ├── components/
│   │   │   ├── ai-widget.tsx        # AI advisor widget
│   │   │   ├── price-display.tsx    # Price component
│   │   │   └── header.tsx           # Navigation
│   │   └── lib/
│   │       └── api-client.ts        # API client wrapper
│   │
│   └── admin/                        # React Admin Panel
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   └── services/
│       └── Dockerfile
│
├── services/
│   ├── core/                         # ⭐ CORE SERVICE (NEVER DOWN)
│   │   ├── src/
│   │   │   ├── index.ts            # Express server
│   │   │   ├── auth.ts             # Auth middleware & logic
│   │   │   ├── users/
│   │   │   │   └── routes.ts       # User endpoints
│   │   │   └── products/
│   │   │       └── routes.ts       # Product endpoints (read-only)
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── intelligence/                 # 🤖 AI SERVICE (GRACEFUL FALLBACK)
│   │   ├── src/
│   │   │   ├── index.ts            # Express server
│   │   │   ├── ai-agent.ts         # Gemini integration
│   │   │   └── fallback.ts         # Mock data fallback
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── pricing/                      # 💰 PRICING SERVICE (ISOLATED)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── silver-price.ts     # Live price fetcher
│   │   │   └── cache.ts            # Redis caching
│   │   └── Dockerfile
│   │
│   └── trade/                        # 🔄 TRADING SERVICE (ISOLATED)
│       ├── src/
│       │   ├── index.ts
│       │   ├── cart.ts             # Shopping cart logic
│       │   ├── order.ts            # Order creation
│       │   └── payment.ts          # Payment processing
│       └── Dockerfile
│
├── packages/
│   ├── database/                     # Prisma ORM
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Complete data model
│   │   │   └── migrations/
│   │   └── src/
│   │       └── index.ts            # Prisma client export
│   │
│   ├── ui/                           # Shadcn components
│   │   ├── components/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── input.tsx
│   │   └── package.json
│   │
│   ├── utils/                        # Shared utilities
│   │   ├── src/
│   │   │   ├── circuit-breaker.ts  # Fault tolerance
│   │   │   ├── feature-flags.ts    # Feature management
│   │   │   └── api-client.ts       # HTTP client
│   │   └── package.json
│   │
│   └── config/                       # Shared configs
│       ├── eslint-config/
│       ├── typescript-config/
│       └── tsconfig.json
│
├── docker-compose.yml                # Local dev environment
├── turbo.json                        # Turborepo config
├── package.json                      # Root workspace
├── .env.example                      # Env template
├── ARCHITECTURE.md                   # This file
├── README.md                         # Quick start
└── .gitignore
```

---

## 🔌 Service Isolation

### Core Service (Port 3001)
**Must haves:** Auth, User profiles, Product catalog, Order history  
**Must NOT have:** External API calls (except DB)  
**Failure impact:** 🔴 CRITICAL - Entire app down  

```typescript
// Core endpoints (always available)
GET    /health
POST   /auth/register
POST   /auth/login
GET    /auth/me
GET    /products
GET    /products/:id
```

### Intelligence Service (Port 3002)
**Features:** Gemini AI, Trend analysis, Trading advice  
**Fallback:** Mock data (no external API needed)  
**Failure impact:** 🟡 MODERATE - App works without insights  

```typescript
// Intelligence endpoints (graceful fallback)
POST   /analyze          # Trend analysis
POST   /advice           # Trading advice
GET    /history          # AI interaction history
GET    /trends           # Trend analysis history
GET    /status           # Service status
```

### Pricing Service (Port 3003)
**Features:** Live silver prices, Price alerts, Historical data  
**Caching:** Redis (5-minute TTL)  
**Failure impact:** 🟡 MODERATE - Uses cached prices  

### Trading Service (Port 3004)
**Features:** Shopping cart, Order creation, Payment  
**Dependency:** Requires Core service  
**Failure impact:** 🟡 MODERATE - Users can still browse  

---

## 🛡️ Fault Tolerance

### Circuit Breaker Pattern

Prevents cascading failures:

```
CLOSED (normal) → call external service
     ↓
Threshold failures exceeded
     ↓
OPEN (stop calling) → return cached/fallback
     ↓
Timeout elapsed
     ↓
HALF_OPEN (test recovery)
     ↓
Success → CLOSED (normal again)
```

**Configuration:**
```javascript
const breaker = createCircuitBreaker('gemini-api', {
  failureThreshold: 5,           // 5 failures → OPEN
  timeout: 60000,                // 60s before HALF_OPEN
  resetTimeout: 30000            // 30s between resets
});

try {
  const result = await breaker.execute(() => {
    return callGeminiAPI();
  });
} catch (error) {
  if (error instanceof CircuitBreakerOpenError) {
    // API failing, use fallback
    return getMockAdvice();
  }
}
```

### Feature Flags

Dynamically enable/disable modules:

```typescript
// Redis-backed feature flags
const flags = getFeatureFlagsManager(redis);

if (await flags.isEnabled('FEATURE_AI_ADVISOR')) {
  // Show AI widget
} else {
  // Show static content
}

// Disable features on-the-fly (no restart needed)
await flags.setFlag('FEATURE_AI_ADVISOR', false);
await flags.enableFallbackMode(); // Disable all non-essential
```

### Graceful Degradation

Ensure core functionality even with failures:

```typescript
// Good: Works with or without AI
const advice = await getAdvice().catch(() => getMockAdvice());

// Good: Shows cached prices if live API fails
const price = await getLivePrice().catch(() => getCachedPrice());

// Good: Falls back to mock data
const analysis = isUsingFallback() ? getMockAnalysis() : await analyze();
```

---

## 📚 Technology Stack

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| **Package Manager** | Bun | Latest | Fast, Node-compatible |
| **Monorepo** | Turborepo | 2.0+ | Task orchestration, caching |
| **Frontend** | Next.js | 15 | App router, SSR, optimal perf |
| **Frontend Styling** | Tailwind CSS | v4 | Utility-first, small bundle |
| **UI Components** | Shadcn/UI | Latest | Copy-paste components |
| **State Mgmt** | Zustand | Latest | Lightweight, simple |
| **Data Fetching** | TanStack Query | v5 | Automatic caching, sync |
| **Backend** | Express.js | Latest | Lightweight, flexible |
| **Language** | TypeScript | 5.3+ | Type safety, better DX |
| **Validation** | Zod | Latest | Runtime type validation |
| **Database** | PostgreSQL | 16 | ACID, reliability |
| **ORM** | Prisma | 5+ | Type-safe, auto migrations |
| **Caching** | Redis | 7 | Feature flags, sessions |
| **AI** | Google Gemini | 1.5 Flash | Free tier, powerful |
| **Containerization** | Docker & Compose | Latest | Local dev, prod parity |
| **Reverse Proxy** | Nginx | Alpine | Lightweight, routing |

---

## 🚀 Development Guide

### Prerequisites

```bash
# Install Bun (Node.js package manager)
curl -fsSL https://bun.sh/install | bash

# Install Docker & Docker Compose
# macOS: brew install docker docker-compose
# Linux: sudo apt-get install docker docker-compose
# Windows: Download Docker Desktop
```

### Setup

```bash
# Clone repository
git clone https://github.com/Ya3er02/noghre-sod-ecommerce.git
cd noghre-sod-ecommerce

# Copy environment template
cp .env.example .env.local

# Update .env.local with your settings
# - Add GEMINI_API_KEY if you have it (optional, fallback works)
# - Update DATABASE_URL if using custom PostgreSQL

# Install dependencies
bun install
```

### Local Development

```bash
# Start all services with Docker Compose
docker compose up -d

# Apply database migrations
bun run db:push

# Seed sample data (optional)
bun run db:seed

# Start development servers
bun run dev

# Now access:
# Frontend: http://localhost:3000
# Core API: http://localhost:3001
# Intelligence: http://localhost:3002
# Pricing: http://localhost:3003
# Trading: http://localhost:3004
```

### Useful Commands

```bash
# Lint code
bun run lint

# Type check
bun run type-check

# Run tests
bun run test

# Build all services
bun run build

# Database migrations
bun run db:migrate
bun run db:push
bun run db:seed

# Docker commands
docker compose logs -f                    # View logs
docker compose exec core-service bash    # Shell into service
docker compose down -v                   # Cleanup
```

---

## 🚢 Deployment

### Docker Build

```bash
# Build all images
docker compose build

# Push to registry
docker tag noghre-core-service gcr.io/project/core:1.0.0
docker push gcr.io/project/core:1.0.0
```

### Environment Variables (Production)

```bash
# Database
DATABASE_URL=postgresql://user:pass@db.example.com/noghre_sod

# Cache
REDIS_URL=redis://:password@redis.example.com:6379

# API Keys
GEMINI_API_KEY=your-api-key-here

# Feature Flags
FEATURE_FLAGS_ENABLED=true
FEATURE_AI_ADVISOR=true
FEATURE_LIVE_PRICING=true

# Security
JWT_SECRET=your-long-secret-key-min-32-chars
NODE_ENV=production
```

### Kubernetes (Optional)

```yaml
# Example: Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: noghre-core
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: core
        image: gcr.io/project/core:latest
        ports:
        - containerPort: 3001
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
```

---

## 📊 Monitoring & Observability

### Health Checks

Every service has a `/health` endpoint:

```bash
curl http://localhost:3001/health
{
  "status": "healthy",
  "database": true,
  "features": { ... },
  "timestamp": "2025-12-10T12:00:00Z"
}
```

### Logging

Structured logging with timestamps:

```typescript
console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
console.error('[ERROR]', error);
```

### Circuit Breaker Monitoring

```typescript
const { state, metrics } = breaker.getStatus();
console.log(`Circuit breaker: ${state}`);
console.log(`Failures: ${metrics.failureCount}`);
```

### Database Monitoring

```typescript
const health = await isDatabaseHealthy();
if (!health) {
  console.error('Database connection failed');
  // Trigger alerts
}
```

---

## 📈 Performance Optimization

### Caching Strategy

```
User Request
    ↓
Redis Cache (5min TTL)
    ↓ (miss)
Database Query
    ↓
Store in Cache
    ↓
Response
```

### Database Optimization

- Indexes on frequently queried columns
- Connection pooling with Prisma
- Read replicas for scaling (optional)

### Frontend Optimization

- Next.js App Router (no more pages/ confusion)
- Image optimization with `next/image`
- Code splitting and lazy loading
- Tailwind CSS purging

---

## 🔐 Security

### Authentication

- JWT with 7-day expiry
- Secure password hashing (bcrypt recommended)
- Rate limiting on auth endpoints

### Data Protection

- PostgreSQL encryption (PGCRYPTO)
- Redis password protection
- CORS configuration
- Input validation with Zod

### API Security

- Environment variable secrets (never commit)
- HTTPS in production
- API rate limiting
- Request sanitization

---

## 📝 Contributing

When adding features:

1. **Keep Core minimal** - Only essential business logic
2. **Isolate new services** - Separate directories, independent deployment
3. **Add fallbacks** - Every external API call needs graceful degradation
4. **Use feature flags** - Control rollout gradually
5. **Test locally** - Use `docker-compose up` to verify
6. **Document changes** - Update this file if architecture changes

---

## 🤝 Support

For questions or issues:
- Open a GitHub issue
- Check existing issues first
- Include reproduction steps

---

## 📜 License

MIT - See LICENSE file

---

**Last Updated:** December 10, 2025  
**Next Review:** March 2026
