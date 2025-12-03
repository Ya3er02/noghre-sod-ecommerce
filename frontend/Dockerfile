# ===================================
# Stage 1: Build the frontend
# ===================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* bun.lockb* ./

# Install dependencies
# Note: Using npm by default, adjust if using yarn, pnpm, or bun
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
# Note: Vite automatically sets NODE_ENV=production during build
RUN npm run build

# ===================================
# Stage 2: Production nginx server
# ===================================
FROM nginx:alpine

# Install curl for healthcheck
# Using curl instead of wget as it's lighter and more standard
RUN apk add --no-cache curl

# Remove default nginx configuration
RUN rm -rf /etc/nginx/conf.d/*

# Copy nginx configuration template
# This will be processed by nginx to substitute environment variables
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Set default environment variables
# These can be overridden at runtime
ENV BACKEND_URL=http://backend:4000

# Expose port
EXPOSE 80

# Healthcheck using curl (not wget)
# Ensures the server is responding correctly
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fS --retry 1 http://localhost/ || exit 1

# nginx:alpine automatically processes templates in /etc/nginx/templates/
# and substitutes environment variables at container startup
# Start nginx
CMD ["nginx", "-g", "daemon off;"]