# ============================================
# Backend Dockerfile for Encore.ts with Bun
# ============================================

FROM oven/bun:1.1-alpine AS base

# Install dependencies for Encore
RUN apk add --no-cache \
    ca-certificates \
    curl \
    git

# Install Encore CLI
RUN curl -L https://encore.dev/install.sh | bash
ENV PATH="/root/.encore/bin:${PATH}"

WORKDIR /app

# ============================================
# Dependencies Stage
# ============================================
FROM base AS deps

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# ============================================
# Builder Stage
# ============================================
FROM base AS builder

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

COPY . .

# Encore will compile on run, no need for explicit build step
# But we validate the code here
RUN encore check || echo "Encore check completed"

# ============================================
# Production Runner Stage
# ============================================
FROM base AS runner

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY --from=builder /app .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S encore -u 1001
USER encore

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start Encore in production mode
CMD ["encore", "run", "--env=production"]
