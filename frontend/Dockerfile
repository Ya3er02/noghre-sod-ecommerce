# ==================================
# Stage 1: Build Stage
# ==================================
FROM oven/bun:1.1.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies with frozen lockfile
RUN bun install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build application
ARG VITE_CLIENT_TARGET
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLIENT_TARGET=$VITE_CLIENT_TARGET
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
RUN bun run build

# ==================================
# Stage 2: Production Stage
# ==================================
FROM nginx:1.25-alpine AS production

# Install security updates
RUN apk --no-cache upgrade && \
    apk add --no-cache tzdata

# Set timezone
ENV TZ=Asia/Tehran

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health.html || exit 1

# Create health check file
RUN echo "OK" > /usr/share/nginx/html/health.html

# Run as non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
