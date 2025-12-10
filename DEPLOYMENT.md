# Deployment Guide - Noghre-SOD Reborn 2.0

## Docker Deployment

### Build Images

```bash
# Build all services
docker compose build

# Or build specific service
docker compose build core-service
```

### Environment Variables (Production)

Create `.env.production`:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db-host:5432/noghre_sod
REDIS_URL=redis://:password@redis-host:6379
GEMINI_API_KEY=your-api-key
JWT_SECRET=your-secure-32-char-minimum-secret
```

### Deploy to Container Registry

```bash
# Google Cloud
docker tag noghre-core-service gcr.io/PROJECT_ID/core:1.0.0
docker push gcr.io/PROJECT_ID/core:1.0.0

# Docker Hub
docker tag noghre-core-service username/core:1.0.0
docker push username/core:1.0.0
```

## Kubernetes Deployment

Basic example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: core-service
  template:
    metadata:
      labels:
        app: core-service
    spec:
      containers:
      - name: core
        image: gcr.io/PROJECT_ID/core:1.0.0
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
```

## Health Checks

All services expose health endpoints:

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
```

## Monitoring

- Check logs: `docker compose logs -f`
- Monitor health: Check `/health` endpoint regularly
- Set up alerts on circuit breaker state changes

## Zero-Downtime Updates

1. Deploy new version in parallel
2. Use blue-green deployment strategy
3. Feature flags control feature rollout
4. Database migrations run before service start

See [ARCHITECTURE.md](./ARCHITECTURE.md) for more details.
