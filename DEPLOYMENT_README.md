# Noghre Sod - Production Deployment on Parspack

## 🎯 Overview

This branch (`deploy/parspack-server-setup`) contains everything needed to deploy Noghre Sod e-commerce platform on your Parspack cloud server.

### Server Details
- **IP**: 193.242.125.25
- **Location**: Tehran3 / DC: THR-DC4
- **Resources**: 4GB RAM, 50GB Storage, 5 vCPU
- **OS**: Ubuntu 22.04 (recommended)

### Architecture Stack
- **Frontend**: React 19 + Vite + TypeScript
- **Backend**: Encore.ts (TypeScript backend framework)
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Web Server**: Nginx
- **Authentication**: Clerk
- **Deployment**: Docker + Docker Compose

---

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)

```bash
# Connect to your server
ssh root@193.242.125.25

# Run one-command deployment
curl -o deploy-parspack.sh https://raw.githubusercontent.com/Ya3er02/noghre-sod-ecommerce/deploy/parspack-server-setup/deploy-parspack.sh && chmod +x deploy-parspack.sh && ./deploy-parspack.sh
```

**Deployment time**: 5-10 minutes

### Option 2: Manual Deployment

See [PARSPACK_DEPLOYMENT.md](PARSPACK_DEPLOYMENT.md) for step-by-step manual instructions.

---

## 🔑 Clerk Configuration

Your Clerk authentication is pre-configured with your credentials:

**Backend (`.env.production`):**
```env
CLERK_SECRET_KEY=sk_test_N60B1ZvJFGvvw1eMZTR6nHv9cmUrfmLtlWL0XEIPot
CLERK_PUBLISHABLE_KEY=pk_test_ZmFzdC1saWdlci05Ni5jbGVyay5hY2NvdW50cy5kZXYk
```

**Frontend (`frontend/.env.production`):**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZmFzdC1saWdlci05Ni5jbGVyay5hY2NvdW50cy5kZXYk
```

**Important**: These are test keys. For production deployment, replace with production keys from [Clerk Dashboard](https://dashboard.clerk.com).

---

## 📦 What's Included

### Configuration Files
- `.env.production` - Backend environment variables with Clerk keys
- `frontend/.env.production` - Frontend environment variables
- `docker-compose.yml` - Docker services configuration
- `nginx.conf` - Nginx reverse proxy configuration

### Deployment Scripts
- `deploy-parspack.sh` - Automated deployment script
- Scripts automatically:
  - Install all dependencies
  - Build frontend
  - Start Docker services
  - Configure Nginx
  - Setup firewall

### Documentation
- `PARSPACK_DEPLOYMENT.md` - Complete deployment guide (Persian)
- `PARSPACK_QUICKSTART.md` - Quick start guide (English)
- `DEPLOYMENT_README.md` - This file

---

## ✅ Post-Deployment Checklist

After deployment, verify:

1. **Services Running**
   ```bash
   docker-compose ps
   ```
   All should show "Up"

2. **Frontend Accessible**
   - Browser: http://193.242.125.25
   - Should show the Noghre Sod homepage

3. **Backend API Working**
   ```bash
   curl http://193.242.125.25/api/health
   ```
   Should return: `{"status":"ok"}`

4. **Database Connected**
   ```bash
   docker-compose exec postgres pg_isready -U noghre_user
   ```

5. **Clerk Authentication**
   - Try to sign up/sign in
   - Should redirect to Clerk authentication

---

## 🐛 Troubleshooting

### Quick Diagnostics

```bash
# Check all services
cd /opt/noghre-sod-ecommerce
docker-compose ps

# View logs
docker-compose logs -f

# Restart everything
docker-compose restart
```

### Common Issues

**Backend not starting:**
```bash
docker-compose logs backend
# Check for Clerk key errors or database connection issues
```

**Frontend not loading:**
```bash
# Rebuild frontend
cd /opt/noghre-sod-ecommerce/frontend
bun run build
systemctl reload nginx
```

**Database connection error:**
```bash
# Check PostgreSQL
docker-compose logs postgres
docker-compose restart postgres
```

For more troubleshooting, see [PARSPACK_DEPLOYMENT.md](PARSPACK_DEPLOYMENT.md#-troubleshooting).

---

## 🔄 Updates and Maintenance

### Update Application

```bash
cd /opt/noghre-sod-ecommerce
git pull origin deploy/parspack-server-setup
./deploy-parspack.sh
```

### View Logs

```bash
# Real-time logs (all services)
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Database Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U noghre_user noghre_sod_db > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20241202.sql | docker-compose exec -T postgres psql -U noghre_user -d noghre_sod_db
```

---

## 🔐 Security Recommendations

### Immediate Actions
1. ✅ Firewall configured (UFW) - ports 22, 80, 443 only
2. ✅ Strong database password set
3. ✅ Strong Redis password set
4. ✅ Clerk authentication enabled

### Next Steps for Production
1. **Setup HTTPS/SSL**
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d yourdomain.com
   ```

2. **Change to Production Clerk Keys**
   - Get production keys from [Clerk Dashboard](https://dashboard.clerk.com)
   - Update `.env.production` and `frontend/.env.production`
   - Restart services

3. **Setup Automated Backups**
   ```bash
   # Add to crontab
   crontab -e
   # Add: 0 2 * * * cd /opt/noghre-sod-ecommerce && docker-compose exec -T postgres pg_dump -U noghre_user noghre_sod_db | gzip > /opt/backups/noghre-sod/backup_$(date +\%Y\%m\%d).sql.gz
   ```

4. **Monitor Resources**
   ```bash
   docker stats
   ```

5. **Regular Updates**
   - Update system: `apt update && apt upgrade`
   - Update application: `git pull && ./deploy-parspack.sh`

---

## 📊 Monitoring

### Health Checks

```bash
# Quick health check script
curl http://193.242.125.25/api/health && echo " - API OK" || echo " - API FAILED"
curl -s http://193.242.125.25 > /dev/null && echo "Frontend OK" || echo "Frontend FAILED"
```

### Resource Usage

```bash
# Container stats
docker stats --no-stream

# Disk usage
df -h

# Memory usage
free -h
```

### Log Files

```bash
# Nginx logs
tail -f /var/log/nginx/noghre-sod-access.log
tail -f /var/log/nginx/noghre-sod-error.log

# Docker logs
cd /opt/noghre-sod-ecommerce
docker-compose logs -f --tail=100
```

---

## 📞 Support

### Documentation
- [Full Deployment Guide (Persian)](PARSPACK_DEPLOYMENT.md)
- [Quick Start Guide](PARSPACK_QUICKSTART.md)
- [Original README](README.md)

### Links
- **Frontend**: http://193.242.125.25
- **Backend API**: http://193.242.125.25/api
- **Repository**: https://github.com/Ya3er02/noghre-sod-ecommerce
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Parspack Panel**: https://my.parspack.com

### Getting Help
- GitHub Issues: https://github.com/Ya3er02/noghre-sod-ecommerce/issues
- Email: info@noghresood.com

---

## 📝 Project Status

- **Branch**: `deploy/parspack-server-setup`
- **Status**: ✅ Ready for Deployment
- **Last Updated**: 2024-12-02
- **Version**: 1.0.0

### Completed
- ✅ Clerk authentication configured
- ✅ Environment variables set for Parspack server
- ✅ Automated deployment script created
- ✅ Docker configuration optimized
- ✅ Nginx configuration ready
- ✅ Documentation complete (Persian & English)

### TODO for Production
- ⚠️ Setup HTTPS/SSL certificate
- ⚠️ Change to production Clerk keys
- ⚠️ Configure automated backups
- ⚠️ Setup monitoring alerts
- ⚠️ Domain name configuration (optional)

---

**Happy Deploying! 🎉**