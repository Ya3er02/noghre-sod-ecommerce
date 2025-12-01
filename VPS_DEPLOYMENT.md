# VPS Deployment Guide

## Overview

This guide explains how to deploy Noghre Sod E-commerce on your VPS using Docker, Docker Compose, and Nginx.

## Prerequisites

- Ubuntu 22.04 VPS
- Root access via SSH
- Public IP: 193.242.125.25
- Domain name (optional, for SSL)

## Quick Start

### 1. SSH into your VPS

```bash
ssh root@193.242.125.25
```

### 2. Download and run deployment script

```bash
curl -o deploy-vps.sh https://raw.githubusercontent.com/Ya3er02/noghre-sod-ecommerce/vps-migration/deploy-vps.sh
chmod +x deploy-vps.sh
./deploy-vps.sh
```

### 3. Update environment variables

```bash
nano /opt/noghre-sod-ecommerce/.env.production
```

Add your Clerk API keys:
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`

### 4. Restart backend

```bash
cd /opt/noghre-sod-ecommerce
docker compose restart backend
```

### 5. Verify deployment

```bash
# Check containers
docker compose ps

# View logs
docker compose logs -f

# Test frontend
curl http://193.242.125.25

# Test backend
curl http://193.242.125.25/api
```

## Architecture

```text
Internet (193.242.125.25)
    ↓
Nginx (Port 80)
    ├── / → Frontend (/opt/noghre-sod-ecommerce/frontend/dist)
    └── /api → Backend (http://127.0.0.1:4000)
              ↓
        Docker Compose
              ├── Backend (Encore.ts on port 4000)
              ├── PostgreSQL (port 5432)
              └── Redis (port 6379)
```

## Manual Installation

If you prefer manual setup instead of using the script:

### Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker

# Install Bun
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Install Encore
curl -L https://encore.dev/install.sh | bash
export PATH="$HOME/.encore/bin:$PATH"

# Install Nginx
apt install -y nginx
```

### Clone Repository

```bash
git clone -b vps-migration https://github.com/Ya3er02/noghre-sod-ecommerce.git /opt/noghre-sod-ecommerce
cd /opt/noghre-sod-ecommerce
```

### Configure Environment

```bash
cp .env.production.example .env.production
nano .env.production
# Fill in all required values
```

### Build Frontend

```bash
cd frontend
bun install
bun run build
cd ..
```

### Start Services

```bash
docker compose build
docker compose up -d
```

### Configure Nginx

```bash
cp nginx.conf /etc/nginx/sites-available/noghre-sod
ln -s /etc/nginx/sites-available/noghre-sod /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

## SSL Setup (Optional)

If you have a domain name pointed to your VPS:

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com

# Certbot will automatically configure Nginx for HTTPS
```

## Maintenance

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f postgres
docker compose logs -f redis

# Nginx logs
tail -f /var/log/nginx/noghre-sod-access.log
tail -f /var/log/nginx/noghre-sod-error.log
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend

# Restart Nginx
systemctl restart nginx
```

### Update Application

```bash
cd /opt/noghre-sod-ecommerce
git pull origin vps-migration

# Rebuild frontend
cd frontend
bun install
bun run build
cd ..

# Restart backend
docker compose build backend
docker compose up -d backend

# Reload Nginx
systemctl reload nginx
```

### Backup Database

```bash
# Backup
docker compose exec postgres pg_dump -U noghre_user noghre_sod_db > backup.sql

# Restore
cat backup.sql | docker compose exec -T postgres psql -U noghre_user noghre_sod_db
```

## Troubleshooting

### Backend not responding

```bash
# Check if backend container is running
docker compose ps

# View backend logs
docker compose logs backend

# Restart backend
docker compose restart backend
```

### Frontend not loading

```bash
# Check if build exists
ls -la /opt/noghre-sod-ecommerce/frontend/dist

# Rebuild frontend
cd /opt/noghre-sod-ecommerce/frontend
bun run build

# Check Nginx status
systemctl status nginx

# Test Nginx config
nginx -t
```

### Database connection issues

```bash
# Check PostgreSQL logs
docker compose logs postgres

# Connect to database
docker compose exec postgres psql -U noghre_user -d noghre_sod_db

# Check DATABASE_URL in .env.production
cat /opt/noghre-sod-ecommerce/.env.production | grep DATABASE
```

### Port conflicts

```bash
# Check what's using port 80
sudo lsof -i :80

# Check what's using port 4000
sudo lsof -i :4000
```

## Security Recommendations

1. **Change default passwords** in `.env.production`
2. **Setup SSL/HTTPS** with Let's Encrypt
3. **Configure firewall** (UFW is configured by the script)
4. **Regular updates**: `apt update && apt upgrade`
5. **Backup database** regularly
6. **Monitor logs** for suspicious activity
7. **Use strong Clerk API keys**
8. **Rotate secrets** periodically using `REGEN_SECRETS=true ./deploy-vps.sh`

## Support

If you encounter issues:

1. Check logs: `docker compose logs -f`
2. Verify environment variables: `cat .env.production`
3. Test services individually
4. Check GitHub Issues

## Additional Resources

- [Encore Documentation](https://encore.dev/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Clerk Documentation](https://clerk.com/docs)
