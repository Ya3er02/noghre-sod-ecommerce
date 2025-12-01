#!/bin/bash

# ============================================
# Noghre Sod E-commerce VPS Deployment Script
# ============================================
# This script is IDEMPOTENT - safe to run multiple times
# Run as root on Ubuntu 22.04

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/Ya3er02/noghre-sod-ecommerce.git"
APP_DIR="/opt/noghre-sod-ecommerce"
NGINX_SITE="noghre-sod"
SERVER_IP="193.242.125.25"

# Helper Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. System Update
log_info "Updating system packages..."
apt-get update -y
apt-get upgrade -y

log_info "Installing base dependencies..."
apt-get install -y curl wget git build-essential ca-certificates gnupg lsb-release unzip software-properties-common

# 2. Install Docker
if ! command -v docker &> /dev/null; then
    log_info "Installing Docker..."
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl start docker
    systemctl enable docker
    log_info "Docker installed successfully"
else
    log_info "Docker already installed"
fi

# 3. Install Bun
if ! command -v bun &> /dev/null; then
    log_info "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
    echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
    log_info "Bun installed successfully"
else
    log_info "Bun already installed"
fi

# 4. Install Encore
if ! command -v encore &> /dev/null; then
    log_info "Installing Encore CLI..."
    curl -L https://encore.dev/install.sh | bash
    export PATH="$HOME/.encore/bin:$PATH"
    echo 'export PATH="$HOME/.encore/bin:$PATH"' >> ~/.bashrc
    log_info "Encore installed successfully"
else
    log_info "Encore already installed"
fi

# 5. Install Nginx
if ! command -v nginx &> /dev/null; then
    log_info "Installing Nginx..."
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    log_info "Nginx installed successfully"
else
    log_info "Nginx already installed"
fi

# 6. Clone/Update Repository
if [ -d "$APP_DIR" ]; then
    log_info "Repository exists, pulling latest changes..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard origin/vps-migration
    git pull origin vps-migration
else
    log_info "Cloning repository..."
    git clone -b vps-migration "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# 7. Create .env.production if doesn't exist
if [ ! -f .env.production ]; then
    log_info "Creating .env.production with generated secrets..."
    JWT_SECRET=$(openssl rand -base64 48)
    SESSION_SECRET=$(openssl rand -base64 48)
    POSTGRES_PASSWORD=$(openssl rand -base64 24)
    
    cat > .env.production << EOF
NODE_ENV=production
HOST=0.0.0.0
PORT=4000
FRONTEND_URL=http://${SERVER_IP}
BACKEND_URL=http://${SERVER_IP}/api
DATABASE_URL=postgresql://noghre_user:${POSTGRES_PASSWORD}@postgres:5432/noghre_sod_db
POSTGRES_USER=noghre_user
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=noghre_sod_db
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379
ENCORE_APP_ID=noghre-sod-ecommerce-8e3i
ENCORE_RUNTIME_ENV=production
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}
CORS_ALLOWED_ORIGINS=http://${SERVER_IP},http://localhost:5173
LOG_LEVEL=info
CLERK_SECRET_KEY=sk_live_YOUR_CLERK_SECRET_KEY_HERE
CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY_HERE
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY_HERE
EOF
    log_warn "Created .env.production - REMEMBER TO UPDATE CLERK KEYS!"
fi

# 8. Build Frontend
log_info "Building frontend..."
cd frontend
bun install
bun run build
cd ..

# 9. Docker Compose
log_info "Starting Docker containers..."
docker compose down 2>/dev/null || true
docker compose build
docker compose up -d
sleep 10

# 10. Configure Nginx
log_info "Configuring Nginx..."
cp nginx.conf /etc/nginx/sites-available/${NGINX_SITE}
ln -sf /etc/nginx/sites-available/${NGINX_SITE} /etc/nginx/sites-enabled/${NGINX_SITE}
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# 11. Setup Firewall
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
fi

# 12. Create Systemd Service
cat > /etc/systemd/system/noghre-sod.service << EOF
[Unit]
Description=Noghre Sod E-commerce Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${APP_DIR}
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable noghre-sod.service

echo ""
log_info "============================================"
log_info "Deployment Complete!"
log_info "============================================"
echo ""
echo "🌐 Application: http://${SERVER_IP}"
echo ""
log_warn "IMPORTANT: Update ${APP_DIR}/.env.production with your Clerk API keys!"
echo ""
echo "Then restart backend: cd ${APP_DIR} && docker compose restart backend"
echo ""
