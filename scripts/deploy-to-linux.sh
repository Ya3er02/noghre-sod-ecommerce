#!/bin/bash

# Noghre Sod E-commerce - Linux Deployment Script
# Usage: bash scripts/deploy-to-linux.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════════"
echo "  Noghre Sod E-commerce - Linux Deployment Script"
echo "═══════════════════════════════════════════════════════════════"
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Please do not run this script as root${NC}"
   echo "Run: bash scripts/deploy-to-linux.sh"
   exit 1
fi

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
print_info "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    print_info "Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js installed"
fi

# Check Bun
if ! command -v bun &> /dev/null; then
    print_error "Bun is not installed"
    print_info "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
    echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
    print_success "Bun installed"
fi

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed"
    print_info "Installing PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_success "PostgreSQL installed"
fi

# Check Redis
if ! command -v redis-cli &> /dev/null; then
    print_error "Redis is not installed"
    print_info "Installing Redis..."
    sudo apt install -y redis-server
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    print_success "Redis installed"
fi

# Check Nginx
if ! command -v nginx &> /dev/null; then
    print_error "Nginx is not installed"
    print_info "Installing Nginx..."
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_success "Nginx installed"
fi

# Check PM2
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed"
    print_info "Installing PM2..."
    sudo npm install -g pm2
    print_success "PM2 installed"
fi

# Check Encore CLI
if ! command -v encore &> /dev/null; then
    print_error "Encore CLI is not installed"
    print_info "Installing Encore CLI..."
    curl -L https://encore.dev/install.sh | bash
    export PATH="$HOME/.encore/bin:$PATH"
    echo 'export PATH="$HOME/.encore/bin:$PATH"' >> ~/.bashrc
    print_success "Encore CLI installed"
fi

print_success "All prerequisites installed"

# Prompt for environment variables
print_info "Setting up environment variables..."

echo ""
echo "Please provide the following information:"
echo ""

# Database credentials
read -p "PostgreSQL password (16+ characters): " -s POSTGRES_PASSWORD
echo ""
if [ ${#POSTGRES_PASSWORD} -lt 16 ]; then
    print_error "Password must be at least 16 characters"
    exit 1
fi

# Redis password
read -p "Redis password (16+ characters): " -s REDIS_PASSWORD
echo ""
if [ ${#REDIS_PASSWORD} -lt 16 ]; then
    print_error "Password must be at least 16 characters"
    exit 1
fi

# Clerk keys
read -p "Clerk Secret Key (sk_live_...): " CLERK_SECRET_KEY
if [[ ! $CLERK_SECRET_KEY == sk_live_* ]]; then
    print_error "Clerk Secret Key must start with sk_live_ for production"
    exit 1
fi

read -p "Clerk Publishable Key (pk_live_...): " CLERK_PUBLISHABLE_KEY
if [[ ! $CLERK_PUBLISHABLE_KEY == pk_live_* ]]; then
    print_error "Clerk Publishable Key must start with pk_live_ for production"
    exit 1
fi

# Domain
read -p "Your domain (e.g., example.com): " DOMAIN

# Generate secrets
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

print_success "Environment variables collected"

# Setup database
print_info "Setting up PostgreSQL database..."

sudo -u postgres psql << EOF
CREATE DATABASE noghre_sod;
CREATE USER noghre_user WITH ENCRYPTED PASSWORD '$POSTGRES_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE noghre_sod TO noghre_user;
\q
EOF

print_success "Database created"

# Configure Redis
print_info "Configuring Redis..."

sudo sed -i "s/# requirepass.*/requirepass $REDIS_PASSWORD/" /etc/redis/redis.conf
sudo systemctl restart redis-server

print_success "Redis configured"

# Install dependencies
print_info "Installing project dependencies..."

bun install
cd frontend && bun install && cd ..
cd backend && bun install && cd ..

print_success "Dependencies installed"

# Create environment files
print_info "Creating environment files..."

# Backend .env
cat > backend/.env.local << EOF
NODE_ENV=production
HOST=0.0.0.0
PORT=4000

FRONTEND_URL=https://$DOMAIN
BACKEND_URL=https://api.$DOMAIN

DATABASE_URL=postgresql://noghre_user:$POSTGRES_PASSWORD@localhost:5432/noghre_sod
POSTGRES_USER=noghre_user
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=noghre_sod

REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_URL=redis://:$REDIS_PASSWORD@localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

ENCORE_APP_ID=noghre-sod
ENCORE_RUNTIME_ENV=production

CLERK_SECRET_KEY=$CLERK_SECRET_KEY
CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY

JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET

CORS_ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN

LOG_LEVEL=info

MAX_FILE_SIZE=10485760
UPLOAD_DIR=/var/www/uploads
EOF

# Frontend .env
cat > frontend/.env.production << EOF
VITE_API_URL=https://api.$DOMAIN
VITE_CLIENT_TARGET=https://$DOMAIN
VITE_CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY
EOF

print_success "Environment files created"

# Build frontend
print_info "Building frontend..."

cd frontend
bun run build
cd ..

print_success "Frontend built"

# Run migrations
print_info "Running database migrations..."

cd backend
encore db migrate --service product || true
encore db migrate --service buyback || true
encore db migrate --service price || true
cd ..

print_success "Migrations completed"

# Setup PM2
print_info "Setting up PM2 for backend..."

cat > backend/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'noghre-sod-backend',
    script: 'encore',
    args: 'run',
    cwd: '$PWD/backend',
    env: {
      NODE_ENV: 'production',
      ENCORE_ENVIRONMENT: 'production'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/pm2/noghre-backend-error.log',
    out_file: '/var/log/pm2/noghre-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

cd backend
pm2 start ecosystem.config.js
pm2 save
cd ..

print_success "Backend started with PM2"

# Setup Nginx
print_info "Configuring Nginx..."

sudo tee /etc/nginx/sites-available/noghre-sod > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    root $PWD/frontend/dist;
    index index.html;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /health.html {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/noghre-sod /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl reload nginx

print_success "Nginx configured"

# Setup Firewall
print_info "Configuring firewall..."

sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

print_success "Firewall configured"

# Setup SSL (optional)
echo ""
read -p "Do you want to setup SSL with Let's Encrypt? (y/n): " setup_ssl

if [[ $setup_ssl == "y" || $setup_ssl == "Y" ]]; then
    print_info "Installing Certbot..."
    
    sudo apt install -y certbot python3-certbot-nginx
    
    print_info "Obtaining SSL certificate..."
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    print_success "SSL certificate installed"
fi

# Setup PM2 startup
pm2 startup | grep -v "PM2" | bash
pm2 save

print_success "PM2 startup configured"

echo ""
echo -e "${GREEN}"
echo "═══════════════════════════════════════════════════════════════"
echo "  🎉 Deployment Completed Successfully!"
echo "═══════════════════════════════════════════════════════════════"
echo -e "${NC}"

echo ""
print_info "Your application is now running:"
echo "   - Frontend: http://$DOMAIN"
echo "   - Backend API: http://localhost:4000"
echo "   - Health Check: http://localhost:4000/health"
echo ""

print_info "Useful commands:"
echo "   - View backend logs: pm2 logs noghre-sod-backend"
echo "   - View backend status: pm2 status"
echo "   - Restart backend: pm2 restart noghre-sod-backend"
echo "   - View nginx logs: sudo tail -f /var/log/nginx/error.log"
echo ""

print_info "Next steps:"
echo "   1. Point your domain DNS to this server's IP"
echo "   2. Wait for DNS propagation (5-30 minutes)"
echo "   3. Visit https://$DOMAIN to see your site"
echo ""

print_warning "IMPORTANT: Save these credentials securely!"
echo "   - PostgreSQL Password: [HIDDEN]"
echo "   - Redis Password: [HIDDEN]"
echo "   - JWT Secret: [HIDDEN]"
echo "   - Session Secret: [HIDDEN]"
echo ""

print_success "Deployment completed! 🚀"
