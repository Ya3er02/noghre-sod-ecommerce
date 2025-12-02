#!/bin/bash

# ============================================
# Noghre Sod - Parspack Server Deployment
# ============================================
# Automated deployment script for Parspack cloud server
# Server: 193.242.125.25 (Tehran3 / DC: THR-DC4)
# Resources: 4GB RAM, 50GB Storage, 5 vCPU

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="193.242.125.25"
APP_DIR="/opt/noghre-sod-ecommerce"
LOG_DIR="/var/log/noghre-sod"
BACKUP_DIR="/opt/backups/noghre-sod"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Noghre Sod - Parspack Deployment Script${NC}"
echo -e "${BLUE}  Server: ${SERVER_IP}${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Error: This script must be run as root${NC}"
   exit 1
fi

echo -e "${GREEN}✓ Running as root${NC}"

# ============================================
# Step 1: System Update
# ============================================
echo -e "\n${YELLOW}[1/10] Updating system packages...${NC}"
apt update && apt upgrade -y
echo -e "${GREEN}✓ System updated${NC}"

# ============================================
# Step 2: Install Dependencies
# ============================================
echo -e "\n${YELLOW}[2/10] Installing dependencies...${NC}"

# Install basic tools
apt install -y curl wget git build-essential nginx ufw fail2ban unzip

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

# Install Node.js (for frontend build)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}✓ Node.js installed${NC}"
else
    echo -e "${GREEN}✓ Node.js already installed${NC}"
fi

# Install Bun (faster package manager)
if ! command -v bun &> /dev/null; then
    echo "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
    echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
    echo -e "${GREEN}✓ Bun installed${NC}"
else
    echo -e "${GREEN}✓ Bun already installed${NC}"
fi

echo -e "${GREEN}✓ All dependencies installed${NC}"

# ============================================
# Step 3: Create Directories
# ============================================
echo -e "\n${YELLOW}[3/10] Creating directories...${NC}"

mkdir -p $APP_DIR
mkdir -p $LOG_DIR
mkdir -p $BACKUP_DIR
mkdir -p /var/www/html

echo -e "${GREEN}✓ Directories created${NC}"

# ============================================
# Step 4: Clone Repository
# ============================================
echo -e "\n${YELLOW}[4/10] Cloning repository...${NC}"

if [ -d "$APP_DIR/.git" ]; then
    echo "Repository exists, pulling latest changes..."
    cd $APP_DIR
    git fetch origin
    git checkout deploy/parspack-server-setup
    git pull origin deploy/parspack-server-setup
else
    echo "Cloning repository..."
    git clone -b deploy/parspack-server-setup https://github.com/Ya3er02/noghre-sod-ecommerce.git $APP_DIR
    cd $APP_DIR
fi

echo -e "${GREEN}✓ Repository ready${NC}"

# ============================================
# Step 5: Build Frontend
# ============================================
echo -e "\n${YELLOW}[5/10] Building frontend...${NC}"

cd $APP_DIR/frontend

# Install dependencies
if command -v bun &> /dev/null; then
    echo "Installing with Bun..."
    bun install
    bun run build
else
    echo "Installing with npm..."
    npm install
    npm run build
fi

echo -e "${GREEN}✓ Frontend built${NC}"

# ============================================
# Step 6: Setup Docker Services
# ============================================
echo -e "\n${YELLOW}[6/10] Setting up Docker services...${NC}"

cd $APP_DIR

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}Error: .env.production not found!${NC}"
    echo "Creating from template..."
    cp .env.production.example .env.production
    echo -e "${YELLOW}Please edit $APP_DIR/.env.production with your credentials${NC}"
fi

# Build and start services
docker-compose down 2>/dev/null || true
docker-compose build
docker-compose up -d

echo -e "${GREEN}✓ Docker services started${NC}"

# ============================================
# Step 7: Configure Nginx
# ============================================
echo -e "\n${YELLOW}[7/10] Configuring Nginx...${NC}"

# Copy Nginx configuration
cp $APP_DIR/nginx.conf /etc/nginx/sites-available/noghre-sod

# Create symbolic link
ln -sf /etc/nginx/sites-available/noghre-sod /etc/nginx/sites-enabled/noghre-sod

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
systemctl enable nginx

echo -e "${GREEN}✓ Nginx configured${NC}"

# ============================================
# Step 8: Configure Firewall
# ============================================
echo -e "\n${YELLOW}[8/10] Configuring firewall...${NC}"

# Configure UFW
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

echo -e "${GREEN}✓ Firewall configured${NC}"

# ============================================
# Step 9: Setup Monitoring & Logging
# ============================================
echo -e "\n${YELLOW}[9/10] Setting up monitoring...${NC}"

# Create log rotation config
cat > /etc/logrotate.d/noghre-sod <<EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
}
EOF

# Setup systemd service for Docker Compose
cat > /etc/systemd/system/noghre-sod.service <<EOF
[Unit]
Description=Noghre Sod E-commerce Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable noghre-sod.service

echo -e "${GREEN}✓ Monitoring configured${NC}"

# ============================================
# Step 10: Health Check
# ============================================
echo -e "\n${YELLOW}[10/10] Running health checks...${NC}"

sleep 5  # Wait for services to start

# Check Docker containers
echo "Checking Docker containers..."
docker-compose ps

# Check Nginx
echo "\nChecking Nginx..."
systemctl status nginx --no-pager

# Test frontend
echo "\nTesting frontend..."
if curl -sf http://localhost > /dev/null; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Frontend check failed${NC}"
fi

# Test backend
echo "\nTesting backend..."
if curl -sf http://localhost/api/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Backend check failed (may need time to start)${NC}"
fi

# ============================================
# Deployment Summary
# ============================================
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Deployment Complete! 🎉${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${BLUE}Frontend URL:${NC} http://$SERVER_IP"
echo -e "${BLUE}Backend URL:${NC} http://$SERVER_IP/api"
echo ""
echo -e "${YELLOW}Important Commands:${NC}"
echo -e "  View logs:        cd $APP_DIR && docker-compose logs -f"
echo -e "  Restart services: cd $APP_DIR && docker-compose restart"
echo -e "  Stop services:    cd $APP_DIR && docker-compose down"
echo -e "  Update app:       cd $APP_DIR && git pull && ./deploy-parspack.sh"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Verify Clerk credentials in: $APP_DIR/.env.production"
echo -e "  2. Check logs: docker-compose logs -f"
echo -e "  3. Visit: http://$SERVER_IP"
echo ""
echo -e "${BLUE}Documentation:${NC} $APP_DIR/PARSPACK_DEPLOYMENT.md"
echo -e "${GREEN}================================================${NC}"