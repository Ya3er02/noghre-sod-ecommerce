# نقره سود - راهنمای استقرار روی سرور Parspack

## 📋 مشخصات سرور

- **IP سرور**: 193.242.125.25
- **موقعیت**: Tehran3 / DC: THR-DC4
- **منابع**:
  - RAM: 4 GB
  - Storage: 50 GB
  - vCPU: 5 هسته
  - نوع سرور: ابری (Cloud VPS)

## 🚀 نصب اولیه (برای اولین بار)

### 1. اتصال به سرور

```bash
ssh root@193.242.125.25
```

### 2. اجرای اسکریپت نصب خودکار

```bash
# دانلود و اجرای اسکریپت
curl -o deploy-parspack.sh https://raw.githubusercontent.com/Ya3er02/noghre-sod-ecommerce/deploy/parspack-server-setup/deploy-parspack.sh
chmod +x deploy-parspack.sh
./deploy-parspack.sh
```

این اسکریپت به طور خودکار:
- سیستم را به‌روزرسانی می‌کند
- Docker و ابزارهای لازم را نصب می‌کند
- پروژه را از GitHub کلون می‌کند
- Frontend را build می‌کند
- سرویس‌های Docker را راه‌اندازی می‌کند
- Nginx را پیکربندی می‌کند
- فایروال را تنظیم می‌کند

## ⚙️ تنظیمات Clerk

کلیدهای Clerk شما در فایل `.env.production` تنظیم شده‌اند:

```env
CLERK_SECRET_KEY=sk_test_N60B1ZvJFGvvw1eMZTR6nHv9cmUrfmLtlWL0XEIPot
CLERK_PUBLISHABLE_KEY=pk_test_ZmFzdC1saWdlci05Ni5jbGVyay5hY2NvdW50cy5kZXYk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZmFzdC1saWdlci05Ni5jbGVyay5hY2NvdW50cy5kZXYk
```

### بررسی تنظیمات Clerk

```bash
cd /opt/noghre-sod-ecommerce
cat .env.production | grep CLERK
```

## 🏗️ معماری سیستم

```
Internet (193.242.125.25:80)
    ↓
Nginx (Reverse Proxy)
    ├── / → Frontend (React + Vite)
    │   └── /opt/noghre-sod-ecommerce/frontend/dist
    │
    └── /api → Backend (Encore.ts)
              ↓
        Docker Compose
              ├── Backend Container (Port 4000)
              │   └── Encore.ts + Node.js
              │
              ├── PostgreSQL Container (Port 5432)
              │   └── Database: noghre_sod_db
              │
              └── Redis Container (Port 6379)
                  └── Cache & Sessions
```

## 📂 ساختار فایل‌ها

```
/opt/noghre-sod-ecommerce/          # دایرکتوری اصلی پروژه
├── frontend/                        # فایل‌های Frontend
│   ├── dist/                       # فایل‌های build شده (برای Nginx)
│   ├── src/                        # کدهای منبع
│   └── .env.production             # تنظیمات Frontend
│
├── backend/                         # فایل‌های Backend
│   ├── Dockerfile
│   └── src/
│
├── docker-compose.yml              # تنظیمات Docker
├── .env.production                 # تنظیمات اصلی
├── nginx.conf                      # تنظیمات Nginx
└── deploy-parspack.sh              # اسکریپت deploy

/etc/nginx/
├── sites-available/noghre-sod     # کانفیگ Nginx
└── sites-enabled/noghre-sod       # لینک به کانفیگ

/var/log/noghre-sod/               # لاگ‌های اپلیکیشن
```

## 🔧 دستورات مدیریتی

### مشاهده وضعیت سرویس‌ها

```bash
cd /opt/noghre-sod-ecommerce

# وضعیت کلی
docker-compose ps

# مشاهده لاگ‌ها (همه سرویس‌ها)
docker-compose logs -f

# مشاهده لاگ سرویس خاص
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis

# وضعیت Nginx
systemctl status nginx
```

### ری‌استارت سرویس‌ها

```bash
cd /opt/noghre-sod-ecommerce

# ری‌استارت همه سرویس‌ها
docker-compose restart

# ری‌استارت سرویس خاص
docker-compose restart backend
docker-compose restart postgres

docker-compose restart redis

# ری‌استارت Nginx
systemctl restart nginx
```

### توقف و راه‌اندازی

```bash
cd /opt/noghre-sod-ecommerce

# توقف سرویس‌ها
docker-compose down

# راه‌اندازی مجدد
docker-compose up -d

# راه‌اندازی با rebuild
docker-compose up -d --build
```

## 🔄 به‌روزرسانی پروژه

### به‌روزرسانی از GitHub

```bash
cd /opt/noghre-sod-ecommerce

# دریافت آخرین تغییرات
git pull origin deploy/parspack-server-setup

# Build مجدد Frontend
cd frontend
bun install
bun run build
cd ..

# ری‌استارت Backend
docker-compose build backend
docker-compose up -d backend

# Reload Nginx
systemctl reload nginx
```

### به‌روزرسانی خودکار

```bash
cd /opt/noghre-sod-ecommerce
./deploy-parspack.sh
```

## 🗄️ مدیریت دیتابیس

### اتصال به PostgreSQL

```bash
# اتصال به shell دیتابیس
docker-compose exec postgres psql -U noghre_user -d noghre_sod_db

# اجرای دستورات SQL
docker-compose exec postgres psql -U noghre_user -d noghre_sod_db -c "SELECT * FROM users LIMIT 5;"
```

### پشتیبان‌گیری (Backup)

```bash
# ایجاد backup
docker-compose exec postgres pg_dump -U noghre_user noghre_sod_db > /opt/backups/noghre-sod/backup_$(date +%Y%m%d_%H%M%S).sql

# فشرده‌سازی backup
gzip /opt/backups/noghre-sod/backup_*.sql
```

### بازیابی (Restore)

```bash
# بازیابی از backup
cat /opt/backups/noghre-sod/backup_20241202.sql | docker-compose exec -T postgres psql -U noghre_user -d noghre_sod_db
```

## 🧪 تست سرویس‌ها

### تست Frontend

```bash
# تست با curl
curl http://193.242.125.25

# تست با wget
wget -O - http://193.242.125.25
```

### تست Backend API

```bash
# تست health endpoint
curl http://193.242.125.25/api/health

# تست با جزئیات بیشتر
curl -v http://193.242.125.25/api/health
```

### تست دیتابیس

```bash
# بررسی اتصال
docker-compose exec postgres pg_isready -U noghre_user

# لیست دیتابیس‌ها
docker-compose exec postgres psql -U noghre_user -c "\l"
```

## 🔐 امنیت

### فایروال (UFW)

```bash
# وضعیت فایروال
ufw status

# لیست قوانین
ufw status numbered

# باز کردن پورت جدید
ufw allow 443/tcp  # برای HTTPS
```

### SSL/HTTPS (اختیاری)

برای فعال‌سازی HTTPS با Let's Encrypt:

```bash
# نصب Certbot
apt install -y certbot python3-certbot-nginx

# دریافت گواهی SSL (نیاز به دامنه دارید)
certbot --nginx -d yourdomain.com

# Certbot به طور خودکار Nginx را پیکربندی می‌کند
```

### تغییر رمزهای عبور

برای تغییر رمزهای دیتابیس و Redis:

1. ویرایش `.env.production`:
```bash
nano /opt/noghre-sod-ecommerce/.env.production
```

2. تغییر مقادیر:
```env
POSTGRES_PASSWORD=رمز_جدید
REDIS_PASSWORD=رمز_جدید
```

3. ری‌استارت سرویس‌ها:
```bash
docker-compose down
docker-compose up -d
```

## 📊 مانیتورینگ

### استفاده از منابع

```bash
# استفاده CPU و RAM کانتینرها
docker stats

# فضای دیسک
df -h

# حافظه سیستم
free -h
```

### لاگ‌ها

```bash
# لاگ‌های Docker
cd /opt/noghre-sod-ecommerce
docker-compose logs -f --tail=100

# لاگ‌های Nginx
tail -f /var/log/nginx/noghre-sod-access.log
tail -f /var/log/nginx/noghre-sod-error.log

# لاگ‌های سیستم
journalctl -u noghre-sod -f
```

## 🐛 عیب‌یابی

### Backend کار نمی‌کند

```bash
# بررسی وضعیت
docker-compose ps

# مشاهده لاگ‌ها
docker-compose logs backend

# ری‌استارت
docker-compose restart backend

# اگر مشکل ادامه داشت، rebuild کنید
docker-compose build backend
docker-compose up -d backend
```

### Frontend نمایش داده نمی‌شود

```bash
# بررسی فایل‌های build
ls -la /opt/noghre-sod-ecommerce/frontend/dist

# rebuild frontend
cd /opt/noghre-sod-ecommerce/frontend
bun run build

# بررسی Nginx
nginx -t
systemctl status nginx
systemctl reload nginx
```

### مشکل اتصال دیتابیس

```bash
# بررسی PostgreSQL
docker-compose logs postgres

# تست اتصال
docker-compose exec postgres pg_isready -U noghre_user

# بررسی DATABASE_URL
cat .env.production | grep DATABASE_URL
```

### خطای "port already in use"

```bash
# یافتن پروسس استفاده‌کننده از پورت 80
sudo lsof -i :80

# یافتن پروسس استفاده‌کننده از پورت 4000
sudo lsof -i :4000

# kill کردن پروسس (با PID)
kill -9 <PID>
```

## 📞 پشتیبانی

در صورت بروز مشکل:

1. **لاگ‌ها را بررسی کنید**:
   ```bash
   docker-compose logs -f
   ```

2. **متغیرهای محیطی را چک کنید**:
   ```bash
   cat /opt/noghre-sod-ecommerce/.env.production
   ```

3. **Health check اجرا کنید**:
   ```bash
   curl http://193.242.125.25/api/health
   ```

4. **GitHub Issues را بررسی کنید**:
   https://github.com/Ya3er02/noghre-sod-ecommerce/issues

## 🔗 لینک‌های مفید

- **Frontend**: http://193.242.125.25
- **Backend API**: http://193.242.125.25/api
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Parspack Panel**: https://my.parspack.com
- **Repository**: https://github.com/Ya3er02/noghre-sod-ecommerce

## 📝 یادداشت‌های مهم

- ✅ کلیدهای Clerk تنظیم شده
- ✅ دیتابیس و Redis با رمزهای امن
- ✅ فایروال فعال (پورت‌های 22, 80, 443)
- ⚠️ برای استفاده در production، HTTPS را فعال کنید
- ⚠️ پشتیبان‌گیری منظم از دیتابیس انجام دهید

---

**تاریخ آخرین به‌روزرسانی**: 2024-12-02  
**نسخه**: 1.0.0  
**وضعیت**: آماده استقرار