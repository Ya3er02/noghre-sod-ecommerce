# Frontend Docker Deployment Guide

This directory contains the Docker configuration for building and deploying the Noghre Sod E-commerce frontend.

## Files Overview

- **Dockerfile** - Multi-stage build configuration
- **nginx.conf.template** - Nginx configuration with environment variable support
- **.dockerignore** - Files to exclude from Docker build context

## Building the Docker Image

```bash
# From the frontend directory
docker build -t noghre-sod-frontend:latest .

# Or from the project root
docker build -t noghre-sod-frontend:latest -f frontend/Dockerfile frontend/
```

## Running the Container

### Basic Usage

```bash
docker run -p 80:80 noghre-sod-frontend:latest
```

The frontend will be available at `http://localhost`

### With Custom Backend URL

```bash
docker run -p 80:80 \
  -e BACKEND_URL=http://api.example.com:8080 \
  noghre-sod-frontend:latest
```

### With Docker Compose

Add to your `docker-compose.yml`:

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - BACKEND_URL=http://backend:4000
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_URL` | `http://backend:4000` | URL of the backend API server |

## Features

### Multi-Stage Build
- **Stage 1 (Builder)**: Installs dependencies and builds the application
- **Stage 2 (Production)**: Copies built files to nginx:alpine for serving

This reduces the final image size significantly.

### Health Check

The container includes a health check using `curl` (not `wget`) that:
- Runs every 30 seconds
- Has a 3-second timeout
- Allows 5 seconds for startup
- Retries 3 times before marking unhealthy

```bash
# Check container health
docker ps
# Look for "healthy" in the STATUS column
```

### Nginx Configuration

- **Environment Variable Substitution**: Backend URL is configurable at runtime
- **Gzip Compression**: Enabled for text-based assets
- **Brotli Support**: Commented out (requires custom nginx build)
- **SPA Routing**: All routes serve `index.html` for client-side routing
- **Cache Headers**: 
  - Static assets cached for 1 year
  - HTML files never cached
- **Security Headers**: XSS protection, content type sniffing prevention, etc.
- **WebSocket Support**: Proper upgrade handling for API WebSocket connections

## Development vs Production

### Development

For local development, use the Vite dev server:

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

### Production

Use Docker for production deployments:

```bash
# Build
docker build -t noghre-sod-frontend:v1.0.0 .

# Tag for registry
docker tag noghre-sod-frontend:v1.0.0 registry.example.com/noghre-sod-frontend:v1.0.0

# Push to registry
docker push registry.example.com/noghre-sod-frontend:v1.0.0

# Pull and run on server
docker pull registry.example.com/noghre-sod-frontend:v1.0.0
docker run -d -p 80:80 \
  --name noghre-frontend \
  -e BACKEND_URL=http://api.production.com \
  --restart unless-stopped \
  registry.example.com/noghre-sod-frontend:v1.0.0
```

## Troubleshooting

### Health Check Failing

```bash
# Check logs
docker logs <container-id>

# Check if curl is installed
docker exec <container-id> which curl

# Manually test health check
docker exec <container-id> curl -f http://localhost/
```

### Backend Connection Issues

```bash
# Check environment variables
docker exec <container-id> env | grep BACKEND

# Check generated nginx config
docker exec <container-id> cat /etc/nginx/conf.d/default.conf

# Test backend connectivity
docker exec <container-id> curl -I ${BACKEND_URL}/api/health
```

### Build Issues

```bash
# Clear Docker cache
docker builder prune

# Build with no cache
docker build --no-cache -t noghre-sod-frontend:latest .

# Check build logs
docker build -t noghre-sod-frontend:latest . 2>&1 | tee build.log
```

## Performance Optimization

### Image Size

Current setup uses multi-stage build to keep image size minimal:
- Builder stage: ~1GB (includes Node.js and build tools)
- Final image: ~50MB (nginx:alpine + static files)

### Enabling Brotli Compression

For better compression than gzip, enable Brotli:

1. Update Dockerfile to use nginx with brotli:
   ```dockerfile
   FROM fholzer/nginx-brotli:latest
   ```

2. Uncomment brotli directives in `nginx.conf.template`:
   ```nginx
   brotli on;
   brotli_comp_level 6;
   brotli_types text/plain text/css application/json application/javascript;
   ```

3. Rebuild the image

### CDN Integration

For production, consider serving static assets via CDN:

1. Build with CDN base URL:
   ```bash
   docker build --build-arg VITE_CDN_URL=https://cdn.example.com -t frontend .
   ```

2. Update nginx to proxy only API requests

## Security Considerations

- Container runs nginx as non-root user
- Security headers prevent common attacks
- Hidden files (`.git`, `.env`, etc.) are blocked
- Static files are served with immutable cache headers
- API proxy prevents CORS issues

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t noghre-sod-frontend:${{ github.sha }} frontend/
      
      - name: Run health check
        run: |
          docker run -d --name test -p 8080:80 noghre-sod-frontend:${{ github.sha }}
          sleep 5
          curl -f http://localhost:8080/ || exit 1
          docker stop test
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag noghre-sod-frontend:${{ github.sha }} registry/noghre-sod-frontend:latest
          docker push registry/noghre-sod-frontend:latest
```

## License

Same as parent project.

## Support

For issues related to Docker deployment, check:
1. This README
2. Main project FIXES.md
3. Create an issue on GitHub