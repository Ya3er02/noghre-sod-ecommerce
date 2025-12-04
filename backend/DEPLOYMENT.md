# 🚀 Deployment Guide - Noghre Sood Backend

## Prerequisites

### Required Software
- **Node.js**: v18+ or **Bun**: latest
- **PostgreSQL**: v14+
- **Encore CLI**: latest version

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/noghre_sod

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key

# Authentication (Clerk)
CLERK_SECRET_KEY=your_clerk_secret_key

# Security
OTP_SECRET=your_random_secret_for_otp

# External APIs (Optional)
METALS_API_KEY=your_metals_api_key
EXCHANGE_API_KEY=your_exchange_rate_api_key
```

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
bun install
# or
npm install
```

### 2. Run Database Migrations

Migrations will run automatically when you start the Encore app for the first time.

To manually run migrations:

```bash
for service in product buyback price; do
  echo "Running migrations for $service..."
  encore db migrate --service $service
done
```

### 3. Start Development Server

```bash
encore run
```

The API will be available at `http://localhost:4000`

## Production Deployment

### Deploy to Encore Cloud (Recommended)

```bash
# Login to Encore
encore auth login

# Create app (first time only)
encore app create noghre-sod-backend

# Deploy to staging
encore deploy --env staging

# Deploy to production
encore deploy --env production
```

### Deploy to Custom Server

#### 1. Build Docker Image

```bash
docker build -t noghre-sod-backend .
```

#### 2. Run with Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    image: noghre-sod-backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/noghre_sod
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
    depends_on:
      - db

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=noghre_sod
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run:

```bash
docker-compose up -d
```

## Troubleshooting

### ❌ Error: "migrations directory does not exist"

**Cause**: Migration files are missing for some services.

**Solution**:

```bash
# Create migration directories
mkdir -p backend/product/migrations
mkdir -p backend/buyback/migrations
mkdir -p backend/price/migrations
```

### ❌ Error: "unable to resolve module openai"

**Cause**: Missing npm dependencies.

**Solution**:

```bash
cd backend
bun install openai express axios helmet express-rate-limit qrcode speakeasy
# or
npm install openai express axios helmet express-rate-limit qrcode speakeasy
```

### ❌ Error: "api endpoints with conflicting names"

**Cause**: Multiple files exporting APIs with same names.

**Solution**: Use centralized service files:
- ✅ `product/service.ts` (centralized)
- ❌ Delete: `product/get.ts`, `product/list.ts`, `product/create.ts`, `product/update.ts`

### ❌ Error: "expected named interface type, found Array"

**Cause**: TypeScript type issues with query parameters.

**Solution**: Use proper interface definitions for API parameters:

```typescript
// ❌ Wrong
api(params: { filters: string[] })

// ✅ Correct
interface ListParams {
  categories?: string;
  minPrice?: number;
  maxPrice?: number;
}

api(params: ListParams)
```

### ❌ Error: "missing TimeDuration format"

**Cause**: Invalid cron schedule format.

**Solution**:

```typescript
// ❌ Wrong
every: '1min'

// ✅ Correct
every: '1 minute'
```

## Database Management

### Create Database Backup

```bash
pg_dump -h localhost -U postgres noghre_sod > backup.sql
```

### Restore Database

```bash
psql -h localhost -U postgres noghre_sod < backup.sql
```

### Reset Database (Development Only)

```bash
encore db reset
```

## Monitoring & Logs

### View Logs (Encore Cloud)

```bash
encore logs --env production
```

### View Logs (Docker)

```bash
docker logs -f noghre-sod-backend
```

### Health Check

```bash
curl http://localhost:4000/health
```

## Performance Optimization

### Database Indexing

All critical indexes are automatically created via migrations:

- Product category, purity, price, serial_number
- Buyback requests user_id, status, serial_number
- Price history timestamp

### Caching Strategy

- Silver prices cached in memory
- Updated every 1 minute via cron
- Historical data stored in PostgreSQL

### Rate Limiting

```typescript
// Configured in middleware
windowMs: 15 * 60 * 1000, // 15 minutes
max: 100 // limit each IP to 100 requests per windowMs
```

## Security Checklist

- [ ] Environment variables configured
- [ ] Database credentials secured
- [ ] API keys in secrets manager
- [ ] HTTPS enabled in production
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] Authentication middleware enabled

## Cost Optimization

### Free Tier Options

1. **Encore Cloud**: Free tier available
2. **Supabase PostgreSQL**: Free 500MB database
3. **Railway**: $5/month with free trial
4. **Render**: Free tier with limitations

### Recommended Stack (Zero Cost)

- **Backend**: Encore Cloud (free tier)
- **Database**: Supabase (free tier)
- **AI**: OpenAI API (pay-as-you-go, low usage)
- **Storage**: Supabase Storage (free 1GB)

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: encore deploy --env production
        env:
          ENCORE_TOKEN: ${{ secrets.ENCORE_TOKEN }}
```

## Support

For issues or questions:

1. Check [Encore Documentation](https://encore.dev/docs)
2. Review error logs: `encore logs`
3. Check this troubleshooting guide
4. Contact development team

---

**Last Updated**: December 2024
**Encore Version**: 1.51.6+
