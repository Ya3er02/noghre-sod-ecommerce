# Noghre Sod - Parspack Deployment Quick Start

## 🚀 Deploy in 5 Minutes

### Server Information
- **IP Address**: 193.242.125.25
- **Location**: Tehran3 / DC: THR-DC4
- **Resources**: 4GB RAM, 50GB Storage, 5 vCPU
- **Username**: root

---

## Step 1: Connect to Your Server

```bash
ssh root@193.242.125.25
```

## Step 2: Run Automated Deployment

```bash
# Download and execute deployment script
curl -o deploy-parspack.sh https://raw.githubusercontent.com/Ya3er02/noghre-sod-ecommerce/deploy/parspack-server-setup/deploy-parspack.sh
chmod +x deploy-parspack.sh
./deploy-parspack.sh
```

The script will automatically:
- ✅ Update system packages
- ✅ Install Docker, Node.js, Bun, and other dependencies
- ✅ Clone the repository
- ✅ Build the frontend
- ✅ Start Docker services (Backend, PostgreSQL, Redis)
- ✅ Configure Nginx
- ✅ Setup firewall (UFW)
- ✅ Configure Clerk authentication

**Installation time**: ~5-10 minutes

---

## Step 3: Verify Deployment

### Check Services Status

```bash
cd /opt/noghre-sod-ecommerce
docker-compose ps
```

You should see:
- ✅ noghre_sod_backend (running)
- ✅ noghre_sod_postgres (running)
- ✅ noghre_sod_redis (running)

### Test Frontend

Open in browser: `http://193.242.125.25`

Or test with curl:
```bash
curl http://193.242.125.25
```

### Test Backend API

```bash
curl http://193.242.125.25/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

---

## Your Clerk Configuration

Your Clerk credentials are already configured in `.env.production`:

```env
CLERK_SECRET_KEY=sk_test_N60B1ZvJFGvvw1eMZTR6nHv9cmUrfmLtlWL0XEIPot
CLERK_PUBLISHABLE_KEY=pk_test_ZmFzdC1saWdlci05Ni5jbGVyay5hY2NvdW50cy5kZXYk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZmFzdC1saWdlci05Ni5jbGVyay5hY2NvdW50cy5kZXYk
```

**Note**: These are test keys. For production, get your production keys from [Clerk Dashboard](https://dashboard.clerk.com).

---

## Common Commands

### View Logs

```bash
cd /opt/noghre-sod-ecommerce

# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Restart Services

```bash
cd /opt/noghre-sod-ecommerce

# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Stop/Start Services

```bash
cd /opt/noghre-sod-ecommerce

# Stop
docker-compose down

# Start
docker-compose up -d
```

---

## Update Application

```bash
cd /opt/noghre-sod-ecommerce

# Pull latest changes
git pull origin deploy/parspack-server-setup

# Rebuild and restart
./deploy-parspack.sh
```

---

## Troubleshooting

### Backend not responding

```bash
# Check logs
docker-compose logs backend

# Restart
docker-compose restart backend
```

### Frontend not loading

```bash
# Rebuild frontend
cd /opt/noghre-sod-ecommerce/frontend
bun run build

# Reload Nginx
systemctl reload nginx
```

### Database connection error

```bash
# Check PostgreSQL
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U noghre_user
```

---

## Important URLs

- **Frontend**: http://193.242.125.25
- **Backend API**: http://193.242.125.25/api
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Parspack Panel**: https://my.parspack.com
- **GitHub Repository**: https://github.com/Ya3er02/noghre-sod-ecommerce

---

## Next Steps

1. ✅ **Deployment Complete** - Your app is running!
2. 🔐 **Setup HTTPS** (Recommended for production):
   ```bash
   # Install Certbot
   apt install -y certbot python3-certbot-nginx
   
   # Get SSL certificate (requires domain)
   certbot --nginx -d yourdomain.com
   ```
3. 📊 **Monitor logs** regularly
4. 💾 **Setup automated backups**
5. 🔄 **Update regularly** with `./deploy-parspack.sh`

---

## Security Checklist

- ✅ Firewall enabled (ports 22, 80, 443 only)
- ✅ Strong database password
- ✅ Strong Redis password
- ✅ Clerk authentication configured
- ⚠️ **TODO**: Enable HTTPS with SSL certificate
- ⚠️ **TODO**: Setup automated database backups
- ⚠️ **TODO**: Change to production Clerk keys

---

## Need Help?

- 📖 Full documentation: [PARSPACK_DEPLOYMENT.md](PARSPACK_DEPLOYMENT.md)
- 🐛 Report issues: [GitHub Issues](https://github.com/Ya3er02/noghre-sod-ecommerce/issues)
- 📧 Contact: info@noghresood.com

---

**Deployment Date**: 2024-12-02  
**Version**: 1.0.0  
**Status**: ✅ Ready for Testing