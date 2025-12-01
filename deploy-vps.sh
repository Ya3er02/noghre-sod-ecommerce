#!/bin/bash

# ============================================
# Noghre Sod E-commerce VPS Deployment Script
# ============================================
# This script is IDEMPOTENT - safe to run multiple times
# Run as root on Ubuntu 22.04
#
# USAGE:
#   Basic:           ./deploy-vps.sh
#   Regen Secrets:   REGEN_SECRETS=true ./deploy-vps.sh
#   Or with flag:    ./deploy-vps.sh --regen-secrets
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/Ya3er02/noghre-sod-ecommerce.git"
APP_DIR="/opt/noghre-sod-ecommerce"
NGINX_SITE="noghre-sod"
SERVER_IP="193.242.125.25"
BACKUP_DIR="/root/noghre_backups"

# Parse command line arguments
REGEN_SECRETS="${REGEN_SECRETS:-false}"
for arg in "$@"; do
    case $arg in
        --regen-secrets)
            REGEN_SECRETS="true"
            shift
            ;;
    esac
done

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

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# ============================================
# 1. System Update
# ============================================
log_info "Updating system packages..."
apt-get update -y
apt-get upgrade -y

log_info "Installing base dependencies..."
apt-get install -y curl wget git build-essential ca-certificates gnupg lsb-release unzip software-properties-common

# ============================================
# 2. Install Docker (Secure - No Pipe to Bash)
# ============================================
if ! command -v docker &> /dev/null; then
    log_info "Installing Docker (Secure method)..."
    
    # Setup keyrings directory
    install -m 0755 -d /etc/apt/keyrings
    
    # Download GPG key to temp file first (not piping directly)
    log_debug "Downloading Docker GPG key..."
    curl -fsSL -o /tmp/docker.gpg https://download.docker.com/linux/ubuntu/gpg
    
    # Verify and install the key
    gpg --dearmor -o /etc/apt/keyrings/docker.gpg /tmp/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    rm /tmp/docker.gpg
    
    # Add Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    systemctl start docker
    systemctl enable docker
    log_info "Docker installed successfully"
else
    log_info "Docker already installed"
fi

# ============================================
# 3. Install Bun (Pinned Version with Checksum)
# ============================================
if ! command -v bun &> /dev/null; then
    log_info "Installing Bun (Pinned v1.1.0 with checksum verification)..."
    
    # SECURITY: Pinned version prevents supply-chain attacks via version drift
    BUN_VERSION="1.1.0"
    BUN_FILE="bun-linux-x64.zip"
    BUN_URL="https://github.com/oven-sh/bun/releases/download/bun-v${BUN_VERSION}/${BUN_FILE}"
    # Official SHA256 for Bun v1.1.0 Linux x64 from GitHub releases
    EXPECTED_SHA="2a8ca276e5b652721e30472486491c64555c5a0686b2981f394c851515683604"
    
    cd /tmp
    log_debug "Downloading Bun v${BUN_VERSION}..."
    curl -fsSL -o "${BUN_FILE}" "${BUN_URL}"
    
    # Verify checksum
    log_debug "Verifying SHA256 checksum..."
    echo "${EXPECTED_SHA}  ${BUN_FILE}" | sha256sum -c -
    if [ $? -ne 0 ]; then
        log_error "Bun checksum verification FAILED! Aborting installation."
        rm -f "${BUN_FILE}"
        exit 1
    fi
    
    log_debug "Checksum verified. Installing..."
    unzip -q "${BUN_FILE}"
    mv bun-linux-x64/bun /usr/local/bin/bun
    chmod +x /usr/local/bin/bun
    rm -rf bun-linux-x64 "${BUN_FILE}"
    
    # Add to PATH
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
    echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
    
    log_info "Bun ${BUN_VERSION} installed and verified successfully"
else
    log_info "Bun already installed"
fi

# ============================================
# 4. Install Encore (No Direct Pipe)
# ============================================
if ! command -v encore &> /dev/null; then
    log_info "Installing Encore CLI (Safe method)..."
    
    # SECURITY NOTE: Encore doesn't publish checksums for their install script.
    # We mitigate curl|bash risk by downloading to file first and verifying
    # the download succeeded before execution.
    ENCORE_INSTALLER="/tmp/install_encore.sh"
    
    log_debug "Downloading Encore installer..."
    curl -fsSL -o "$ENCORE_INSTALLER" "https://encore.dev/install.sh"
    
    # Ensure file exists and has content
    if [ ! -s "$ENCORE_INSTALLER" ]; then
        log_error "Failed to download Encore installer or file is empty."
        exit 1
    fi
    
    # Execute local script
    log_debug "Running Encore installer..."
    chmod +x "$ENCORE_INSTALLER"
    bash "$ENCORE_INSTALLER"
    rm "$ENCORE_INSTALLER"
    
    # Add to PATH
    export PATH="$HOME/.encore/bin:$PATH"
    echo 'export PATH="$HOME/.encore/bin:$PATH"' >> ~/.bashrc
    
    log_info "Encore CLI installed successfully"
else
    log_info "Encore already installed"
fi

# ============================================
# 5. Install Nginx
# ============================================
if ! command -v nginx &> /dev/null; then
    log_info "Installing Nginx..."
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    log_info "Nginx installed successfully"
else
    log_info "Nginx already installed"
fi

# ============================================
# 6. Clone/Update Repository (Safe Git Update)
# ============================================
if [ -d "$APP_DIR" ]; then
    log_info "Repository exists at $APP_DIR"
    cd "$APP_DIR"
    
    # Fetch latest changes
    log_debug "Fetching latest changes from origin..."
    git fetch origin
    
    # CHECK FOR LOCAL CHANGES (Safety backup before destructive reset)
    if [ -n "$(git status --porcelain)" ]; then
        log_warn "Local changes detected on VPS!"
        
        # Create backup directory
        mkdir -p "$BACKUP_DIR"
        
        # Generate timestamped backup
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        PATCH_FILE="$BACKUP_DIR/local_changes_${TIMESTAMP}.patch"
        FILELIST="$BACKUP_DIR/untracked_files_${TIMESTAMP}.txt"
        
        log_info "Backing up local changes to $PATCH_FILE..."
        git diff HEAD > "$PATCH_FILE"
        
        # Capture untracked files list
        git ls-files --others --exclude-standard > "$FILELIST" 2>/dev/null || true
        
        if [ -s "$PATCH_FILE" ]; then
            log_info "✅ Tracked changes backed up successfully"
            log_info "   To restore: cd $APP_DIR && git apply $PATCH_FILE"
        fi
        
        if [ -s "$FILELIST" ]; then
            log_info "✅ Untracked files list saved to $FILELIST"
        fi
    fi
    
    # NOW safe to reset
    log_info "Syncing with remote branch (vps-migration)..."
    git reset --hard origin/vps-migration
    git pull origin vps-migration
else
    log_info "Cloning repository..."
    git clone -b vps-migration "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# ============================================
# 7. Environment Configuration with Secret Management
# ============================================
ENV_FILE="$APP_DIR/.env.production"
ENV_BACKUP="$BACKUP_DIR/env_backup_$(date +%Y%m%d_%H%M%S).env"

if [ ! -f "$ENV_FILE" ]; then
    # FIRST TIME SETUP - Generate all secrets
    log_info "Creating .env.production with generated secrets..."
    
    JWT_SECRET=$(openssl rand -base64 48)
    SESSION_SECRET=$(openssl rand -base64 48)
    POSTGRES_PASSWORD=$(openssl rand -base64 24)
    REDIS_PASSWORD=$(openssl rand -base64 24)
    
    cat > "$ENV_FILE" << EOF
NODE_ENV=production
HOST=0.0.0.0
PORT=4000
FRONTEND_URL=http://${SERVER_IP}
BACKEND_URL=http://${SERVER_IP}/api
DATABASE_URL=postgresql://noghre_user:${POSTGRES_PASSWORD}@postgres:5432/noghre_sod_db
POSTGRES_USER=noghre_user
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=noghre_sod_db
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
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
    
    log_info "✅ .env.production created with secure random secrets"
    
elif [ "$REGEN_SECRETS" = "true" ]; then
    # SECRET REGENERATION MODE
    log_warn "SECRET REGENERATION MODE ENABLED!"
    log_info "Backing up existing .env.production..."
    
    mkdir -p "$BACKUP_DIR"
    cp "$ENV_FILE" "$ENV_BACKUP"
    log_info "✅ Backup saved to: $ENV_BACKUP"
    
    # Generate new secrets
    log_info "Generating new secrets..."
    NEW_JWT_SECRET=$(openssl rand -base64 48)
    NEW_SESSION_SECRET=$(openssl rand -base64 48)
    NEW_POSTGRES_PASSWORD=$(openssl rand -base64 24)
    NEW_REDIS_PASSWORD=$(openssl rand -base64 24)
    
    # Update secrets in-place (preserving Clerk keys and other config)
    log_info "Updating secrets in .env.production..."
    sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${NEW_JWT_SECRET}|" "$ENV_FILE"
    sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=${NEW_SESSION_SECRET}|" "$ENV_FILE"
    sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${NEW_POSTGRES_PASSWORD}|" "$ENV_FILE"
    sed -i "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=${NEW_REDIS_PASSWORD}|" "$ENV_FILE"
    
    # Update connection strings with new passwords
    sed -i "s|postgresql://noghre_user:[^@]*@|postgresql://noghre_user:${NEW_POSTGRES_PASSWORD}@|" "$ENV_FILE"
    sed -i "s|redis://:[^@]*@|redis://:${NEW_REDIS_PASSWORD}@|" "$ENV_FILE"
    
    log_info "✅ Secrets regenerated successfully!"
    log_warn "⚠️  Database and Redis will be recreated with new passwords."
    log_warn "⚠️  All existing data will be lost unless you restore from backup!"
    
else
    # SUBSEQUENT RUNS - .env.production exists, no regeneration
    log_info ".env.production already exists (preserving existing secrets)"
    log_debug "To regenerate secrets, run: REGEN_SECRETS=true $0"
fi

# ============================================
# ALWAYS SHOW CLERK REMINDER (Critical Security)
# ============================================
if grep -q "YOUR_CLERK.*_KEY_HERE" "$ENV_FILE"; then
    echo ""
    log_warn "═══════════════════════════════════════════════════════════"
    log_warn "⚠️  CLERK API KEYS NOT CONFIGURED!"
    log_warn "═══════════════════════════════════════════════════════════"
    log_warn "You MUST update these keys in: $ENV_FILE"
    log_warn ""
    log_warn "   CLERK_SECRET_KEY=sk_live_YOUR_CLERK_SECRET_KEY_HERE"
    log_warn "   CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY_HERE"
    log_warn "   VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY_HERE"
    log_warn ""
    log_warn "Get keys from: https://dashboard.clerk.com"
    log_warn "After updating, restart backend: cd $APP_DIR && docker compose restart backend"
    log_warn "═══════════════════════════════════════════════════════════"
    echo ""
fi

# ============================================
# 8. Build Frontend
# ============================================
log_info "Building frontend..."
cd frontend
bun install
bun run build
cd ..

# ============================================
# 9. Docker Compose
# ============================================
log_info "Starting Docker containers..."
docker compose down 2>/dev/null || true
docker compose build
docker compose up -d
sleep 10

# Verify containers started
log_debug "Checking container status..."
docker compose ps

# ============================================
# 10. Configure Nginx
# ============================================
log_info "Configuring Nginx..."
cp nginx.conf /etc/nginx/sites-available/${NGINX_SITE}
ln -sf /etc/nginx/sites-available/${NGINX_SITE} /etc/nginx/sites-enabled/${NGINX_SITE}
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx

# ============================================
# 11. Setup Firewall
# ============================================
if command -v ufw &> /dev/null; then
    log_info "Configuring firewall (UFW)..."
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    log_info "✅ Firewall configured (SSH, HTTP, HTTPS allowed)"
fi

# ============================================
# 12. Create Systemd Service
# ============================================
log_info "Creating systemd service..."
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

# ============================================
# DEPLOYMENT COMPLETE
# ============================================
echo ""
log_info "════════════════════════════════════════════════════════════"
log_info "🎉 DEPLOYMENT COMPLETE!"
log_info "════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Application URL:    http://${SERVER_IP}"
echo "📁 Application Path:   ${APP_DIR}"
echo "🔐 Backup Location:    ${BACKUP_DIR}"
echo ""
log_info "Next Steps:"
echo "   1. Update Clerk API keys in: $ENV_FILE"
echo "   2. Restart backend: cd $APP_DIR && docker compose restart backend"
echo "   3. Test application: curl http://${SERVER_IP}"
echo ""
log_info "Useful Commands:"
echo "   - View logs:        docker compose logs -f"
echo "   - Restart all:      docker compose restart"
echo "   - Stop all:         docker compose down"
echo "   - Check status:     docker compose ps"
echo "   - Regenerate keys:  REGEN_SECRETS=true $0"
echo ""
log_info "════════════════════════════════════════════════════════════"
echo ""
