# Critical Configuration Fixes

This document tracks all critical configuration issues and their fixes for the Noghre Sod E-commerce platform.

## Table of Contents

1. [Frontend Configuration Issues](#frontend-configuration-issues)
   - [LiquidChrome Component - useEffect Dependency Issue](#1-liquidchrome-component---useeffect-dependency-issue)
   - [Frontend Dockerfile - HEALTHCHECK Issue](#2-frontend-dockerfile---healthcheck-issue)
   - [Frontend nginx.conf - Brotli Module Issue](#3-frontend-nginxconf---brotli-module-issue)
   - [Frontend nginx.conf - Hardcoded Backend URL](#4-frontend-nginxconf---hardcoded-backend-url)
   - [Frontend package.json - Windows Build Script Issue](#5-frontend-packagejson---windows-build-script-issue)
2. [Status](#status)

---

## Frontend Configuration Issues

### 1. LiquidChrome Component - useEffect Dependency Issue

**File:** `frontend/components/LiquidChrome.tsx` (Line ~169)

**Issue:**
The `useEffect` hook depends on the `baseColor` array reference, which can cause infinite re-renders when callers pass an inline array. This happens because array references change on each render even if the values are the same.

**Problem Code:**
```typescript
useEffect(() => {
  // ... effect code ...
}, [baseColor, speed, amplitude, frequencyX, frequencyY, interactive]);
```

**Solution:**
Replace `baseColor` in the dependency list with a stable scalar value by joining the array into a string.

**Fixed Code:**
```typescript
const colorKey = baseColor.join(',');

useEffect(() => {
  // ... effect code ...
}, [colorKey, speed, amplitude, frequencyX, frequencyY, interactive]);
```

**Alternative Solutions:**
1. Document that callers must memoize `baseColor` with `useMemo`
2. Accept `baseColor` as a ref instead of a prop

**Recommendation:** Use the `colorKey` solution as it's the most user-friendly and doesn't require callers to change their code.

---

### 2. Frontend Dockerfile - HEALTHCHECK Issue

**File:** `frontend/Dockerfile` (Lines ~28-29, file needs to be created)

**Issue:**
The `HEALTHCHECK` directive uses `wget`, which is not present in the `nginx:alpine` base image, causing false health check failures.

**Problem Code:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1
```

**Solution:**
Replace `wget` with `curl` and install `curl` in the image.

**Fixed Code:**
```dockerfile
# Install curl for healthcheck
RUN apk add --no-cache curl

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fS --retry 1 http://localhost/ || exit 1
```

**Why curl?**
- Smaller footprint than wget
- Actually performs HTTP verification
- Standard in most nginx configurations

---

### 3. Frontend nginx.conf - Brotli Module Issue

**File:** `frontend/nginx.conf` (Lines ~15-18, file needs to be created for frontend)

**Issue:**
The configuration references `ngx_brotli` directives, but this module is not included in the standard `nginx:alpine` image, causing nginx to fail on startup.

**Problem Directives:**
```nginx
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript;
```

**Solutions (Pick One):**

**Option A: Remove Brotli (Simpler)**
```nginx
# TODO: Add ngx_brotli support in Dockerfile when needed
# brotli on;
# brotli_comp_level 6;
# brotli_types text/plain text/css application/json application/javascript;

# Rely on gzip compression only
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript 
           application/json application/javascript application/xml+rss;
```

**Option B: Build with Brotli (Preferred for Production)**
Update `frontend/Dockerfile` to use an nginx image with brotli or build it:
```dockerfile
# Use nginx with brotli module
FROM fholzer/nginx-brotli:latest

# Or build from source
FROM nginx:alpine as builder
RUN apk add --no-cache git gcc make musl-dev pcre-dev zlib-dev \
    && git clone --recursive https://github.com/google/ngx_brotli.git \
    && cd /usr/src \
    && nginx -V 2>&1 | grep "configure arguments:" | sed 's/.*arguments: //' > /tmp/nginx_config \
    && ./configure $(cat /tmp/nginx_config) --add-dynamic-module=/ngx_brotli \
    && make modules
```

**Recommendation:** Start with Option A (comment out brotli), then implement Option B when needed for production optimization.

---

### 4. Frontend nginx.conf - Hardcoded Backend URL

**File:** `frontend/nginx.conf` (Lines ~40-41, file needs to be created for frontend)

**Issue:**
The `proxy_pass` directive is hardcoded to `http://backend:4000`, making it inflexible for different deployment environments.

**Problem Code:**
```nginx
location /api {
    proxy_pass http://backend:4000;
    # ...
}
```

**Solution:**
Use environment variable substitution to make the backend URL configurable at runtime.

**Step 1: Update nginx.conf to use template**
Rename to `nginx.conf.template`:
```nginx
location /api {
    proxy_pass ${BACKEND_URL};
    # ...
}
```

**Step 2: Update Dockerfile to process template**
```dockerfile
# Copy nginx config template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Set default backend URL
ENV BACKEND_URL=http://backend:4000

# nginx:alpine automatically processes templates in /etc/nginx/templates/
```

**Step 3: Override at runtime**
```bash
# Docker run
docker run -e BACKEND_URL=http://api.example.com:8080 your-image

# docker-compose.yml
environment:
  - BACKEND_URL=http://backend:4000
```

**Alternative: Use entrypoint script**
```dockerfile
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
```

```bash
#!/bin/sh
# docker-entrypoint.sh
BACKEND_URL=${BACKEND_URL:-http://backend:4000}
envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
```

---

### 5. Frontend package.json - Windows Build Script Issue

**File:** `frontend/package.json` (Line ~11)

**Issue:**
The build script uses POSIX-only syntax `NODE_ENV=production`, which breaks on Windows systems.

**Problem Code:**
```json
{
  "scripts": {
    "build": "NODE_ENV=production tsc --noEmit && vite build"
  }
}
```

**Solution A: Remove NODE_ENV (Simplest)**
Vite automatically sets `NODE_ENV=production` during build, so it's redundant.

**Fixed Code:**
```json
{
  "scripts": {
    "build": "tsc && vite build"
  }
}
```

**Solution B: Use cross-env (If explicitly needed)**
```json
{
  "scripts": {
    "build": "cross-env NODE_ENV=production tsc --noEmit && vite build"
  },
  "devDependencies": {
    "cross-env": "^7.0.3"
  }
}
```

Then run:
```bash
npm install --save-dev cross-env
# or
yarn add -D cross-env
# or
bun add -d cross-env
```

**Recommendation:** Use Solution A since Vite handles `NODE_ENV` automatically. This eliminates the dependency and simplifies the build process.

---

## Status

| Issue | File | Status | Priority |
|-------|------|--------|----------|
| useEffect dependency | `frontend/components/LiquidChrome.tsx` | ✅ Fixed | High |
| HEALTHCHECK wget | `frontend/Dockerfile` | ✅ Fixed | High |
| Brotli module | `frontend/nginx.conf` | ✅ Fixed | Medium |
| Hardcoded backend URL | `frontend/nginx.conf` | ✅ Fixed | High |
| Windows build script | `frontend/package.json` | ✅ Fixed | High |

---

## Implementation Checklist

- [x] Document all issues in FIXES.md
- [x] Fix LiquidChrome.tsx useEffect dependency
- [x] Create frontend/Dockerfile with curl healthcheck
- [x] Create frontend/nginx.conf.template with environment variable support
- [x] Update frontend/package.json build script to remove POSIX-only syntax
- [ ] Test all changes in development environment
- [ ] Test Docker build and deployment
- [ ] Update CI/CD pipeline if necessary
- [ ] Update documentation

---

## Notes

- All fixes are backward compatible where possible
- Environment variables use sensible defaults
- Solutions prioritize simplicity and maintainability
- Windows compatibility has been ensured for all build scripts

---

**Last Updated:** December 3, 2024  
**Maintainer:** Ya3er02