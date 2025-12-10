# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install bun
RUN npm install -g bun

# Copy root files
COPY package.json bun.lockb ./
COPY turbo.json .

# Copy workspaces
COPY packages ./packages
COPY services/intelligence ./services/intelligence

# Install dependencies
RUN bun install

# Build
RUN bun run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Install bun
RUN npm install -g bun

# Install curl for health checks
RUN apk add --no-cache curl

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/intelligence ./services/intelligence
COPY --from=builder /app/packages ./packages
COPY package.json .

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

# Start service
CMD ["bun", "run", "services/intelligence/src/index.ts"]
