# 🐧 راهنمای نصب و اجرا روی سرور لینوکس

## نکته مهم قبل از شروع

**این راهنما برای سرورهای Ubuntu/Debian نوشته شده است. برای CentOS/RHEL از `yum` به جای `apt` استفاده کنید.**

---

## 📋 پیش‌نیازها

- سرور لینوکس (Ubuntu 20.04+ یا Debian 11+)
- دسترسی SSH به سرور
- حداقل 2GB RAM
- حداقل 20GB فضای دیسک
- دسترسی root یا sudo

---

## 🚀 راهنمای نصب گام‌به‌گام

### مرحله 1: اتصال به سرور

```bash
# از کامپیوتر محلی خود
ssh root@YOUR_SERVER_IP

# یا با کاربر عادی
ssh username@YOUR_SERVER_IP
```

### مرحله 2: به‌روزرسانی سیستم

```bash
# به‌روزرسانی لیست پکیج‌ها
sudo apt update

# ارتقا پکیج‌های نصب شده
sudo apt upgrade -y

# نصب ابزارهای پایه
sudo apt install -y curl wget git build-essential
```

### مرحله 3: نصب Node.js (v18+)

```bash
# نصب Node.js 20.x (توصیه می‌شود)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# بررسی نسخه
node --version  # باید v20.x.x نمایش دهد
npm --version
```

### مرحله 4: نصب Bun (مدیر پکیج)

```bash
# نصب Bun
curl -fsSL https://bun.sh/install | bash

# اضافه کردن Bun به PATH
export PATH="$HOME/.bun/bin:$PATH"
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# بررسی نسخه
bun --version
```

### مرحله 5: نصب PostgreSQL

```bash
# نصب PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# شروع سرویس
sudo systemctl start postgresql
sudo systemctl enable postgresql

# ساخت دیتابیس و کاربر
sudo -u postgres psql << EOF
CREATE DATABASE noghre_sod;
CREATE USER noghre_user WITH ENCRYPTED PASSWORD 'YOUR_STRONG_PASSWORD_16CHARS';
GRANT ALL PRIVILEGES ON DATABASE noghre_sod TO noghre_user;
\q
EOF
```

### مرحله 6: نصب Redis

```bash
# نصب Redis
sudo apt install -y redis-server

# تنظیم رمز عبور Redis
sudo nano /etc/redis/redis.conf

# پیدا کردن خط زیر و uncomment کردن:
# requirepass YOUR_REDIS_PASSWORD_16CHARS

# راه‌اندازی مجدد Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# تست Redis
redis-cli
# در Redis CLI:
AUTH YOUR_REDIS_PASSWORD_16CHARS
ping
# باید PONG نمایش دهد
exit
```

### مرحله 7: نصب Nginx

```bash
# نصب Nginx
sudo apt install -y nginx

# شروع سرویس
sudo systemctl start nginx
sudo systemctl enable nginx

# بررسی وضعیت
sudo systemctl status nginx
```

### مرحله 8: کلون کردن پروژه

```bash
# رفتن به دایرکتوری home
cd ~

# کلون پروژه
git clone https://github.com/Ya3er02/noghre-sod-ecommerce.git

# ورود به پوشه پروژه
cd noghre-sod-ecommerce

# بررسی برنچ (باید main باشد)
git branch
```

### مرحله 9: ساخت فایل‌های Environment

```bash
# فایل محیطی اصلی (root)
cat > .env.production << 'EOF'
NODE_ENV=production
EOF

# فایل محیطی Backend
cat > backend/.env.local << 'EOF'
# Node Environment
NODE_ENV=production

# Server Configuration
HOST=0.0.0.0
PORT=4000

# URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Database
DATABASE_URL=postgresql://noghre_user:YOUR_STRONG_PASSWORD_16CHARS@localhost:5432/noghre_sod
POSTGRES_USER=noghre_user
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD_16CHARS
POSTGRES_DB=noghre_sod

# Redis
REDIS_PASSWORD=YOUR_REDIS_PASSWORD_16CHARS
REDIS_URL=redis://:YOUR_REDIS_PASSWORD_16CHARS@localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Encore
ENCORE_APP_ID=noghre-sod
ENCORE_RUNTIME_ENV=production

# Clerk (Generate at https://dashboard.clerk.com)
CLERK_SECRET_KEY=sk_live_YOUR_CLERK_SECRET_KEY
CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY

# JWT & Security (Generate: openssl rand -base64 32)
JWT_SECRET=YOUR_32_CHAR_RANDOM_STRING
SESSION_SECRET=YOUR_32_CHAR_RANDOM_STRING

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=info

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/var/www/uploads
EOF

# فایل محیطی Frontend
cat > frontend/.env.production << 'EOF'
VITE_API_URL=https://api.yourdomain.com
VITE_CLIENT_TARGET=https://yourdomain.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY
EOF
```

**⚠️ مهم:** فایل‌های بالا را ویرایش کنید و:
1. `YOUR_STRONG_PASSWORD_16CHARS` را با رمز دیتابیس واقعی جایگزین کنید
2. `YOUR_REDIS_PASSWORD_16CHARS` را با رمز Redis واقعی جایگزین کنید
3. `YOUR_CLERK_SECRET_KEY` و `YOUR_CLERK_PUBLISHABLE_KEY` را از داشبورد Clerk بگیرید
4. `YOUR_32_CHAR_RANDOM_STRING` را با دستور زیر تولید کنید:

```bash
# تولید JWT_SECRET
openssl rand -base64 32

# تولید SESSION_SECRET
openssl rand -base64 32
```

### مرحله 10: نصب Dependencies

```bash
# نصب dependencies اصلی
bun install

# نصب dependencies Frontend
cd frontend
bun install
cd ..

# نصب dependencies Backend
cd backend
bun install
cd ..
```

### مرحله 11: Build کردن Frontend

```bash
# رفتن به پوشه frontend
cd frontend

# Build برای production
bun run build

# بررسی فولدر dist
ls -la dist/

cd ..
```

### مرحله 12: نصب Encore CLI

```bash
# نصب Encore CLI
curl -L https://encore.dev/install.sh | bash

# اضافه کردن به PATH
export PATH="$HOME/.encore/bin:$PATH"
echo 'export PATH="$HOME/.encore/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# بررسی نسخه
encore version
```

### مرحله 13: اجرای Migration های دیتابیس

```bash
# رفتن به پوشه backend
cd backend

# اجرای migrations
encore db migrate --service product
encore db migrate --service buyback
encore db migrate --service price

cd ..
```

### مرحله 14: تنظیم Nginx برای Frontend

```bash
# ساخت فایل تنظیمات Nginx
sudo nano /etc/nginx/sites-available/noghre-sod
```

محتوای فایل:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /home/YOUR_USERNAME/noghre-sod-ecommerce/frontend/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health.html {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
```

فعال‌سازی تنظیمات:

```bash
# لینک به sites-enabled
sudo ln -s /etc/nginx/sites-available/noghre-sod /etc/nginx/sites-enabled/

# حذف تنظیمات پیش‌فرض (اختیاری)
sudo rm /etc/nginx/sites-enabled/default

# تست تنظیمات
sudo nginx -t

# راه‌اندازی مجدد Nginx
sudo systemctl reload nginx
```

### مرحله 15: راه‌اندازی Backend با PM2

```bash
# نصب PM2
sudo npm install -g pm2

# رفتن به پوشه backend
cd backend

# ساخت فایل ecosystem PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'noghre-sod-backend',
    script: 'encore',
    args: 'run',
    cwd: '/home/YOUR_USERNAME/noghre-sod-ecommerce/backend',
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

# ویرایش فایل و جایگزینی YOUR_USERNAME
sed -i "s/YOUR_USERNAME/$USER/g" ecosystem.config.js

# ساخت دایرکتوری log
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# شروع backend
pm2 start ecosystem.config.js

# ذخیره تنظیمات PM2
pm2 save

# راه‌اندازی خودکار در startup
pm2 startup
# دستور خروجی را کپی و اجرا کنید

cd ..
```

### مرحله 16: تنظیم Reverse Proxy برای Backend

```bash
# ویرایش فایل Nginx
sudo nano /etc/nginx/sites-available/noghre-sod
```

اضافه کردن این بخش:

```nginx
# API proxy
location /api {
    proxy_pass http://localhost:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

راه‌اندازی مجدد Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### مرحله 17: نصب SSL با Let's Encrypt (اختیاری اما توصیه می‌شود)

```bash
# نصب Certbot
sudo apt install -y certbot python3-certbot-nginx

# دریافت گواهی SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# تست تمدید خودکار
sudo certbot renew --dry-run
```

### مرحله 18: تنظیم Firewall

```bash
# نصب UFW (اگر نصب نیست)
sudo apt install -y ufw

# اجازه SSH
sudo ufw allow OpenSSH

# اجازه HTTP و HTTPS
sudo ufw allow 'Nginx Full'

# فعال‌سازی Firewall
sudo ufw enable

# بررسی وضعیت
sudo ufw status
```

---

## ✅ بررسی نصب

### 1. بررسی Backend

```bash
# بررسی وضعیت PM2
pm2 status

# مشاهده لاگ‌ها
pm2 logs noghre-sod-backend

# تست health endpoint
curl http://localhost:4000/health
```

### 2. بررسی Frontend

```bash
# تست Nginx
curl http://localhost/

# یا از مرورگر
# http://yourdomain.com
```

### 3. بررسی دیتابیس

```bash
# اتصال به PostgreSQL
sudo -u postgres psql -d noghre_sod

# لیست جداول
\dt

# خروج
\q
```

### 4. بررسی Redis

```bash
# اتصال به Redis
redis-cli

# احراز هویت
AUTH YOUR_REDIS_PASSWORD

# تست
ping

# خروج
exit
```

---

## 🔄 دستورات مدیریت

### مدیریت Backend

```bash
# مشاهده وضعیت
pm2 status

# توقف
pm2 stop noghre-sod-backend

# شروع
pm2 start noghre-sod-backend

# راه‌اندازی مجدد
pm2 restart noghre-sod-backend

# مشاهده لاگ‌ها
pm2 logs noghre-sod-backend

# پاک کردن لاگ‌ها
pm2 flush
```

### مدیریت Nginx

```bash
# بررسی وضعیت
sudo systemctl status nginx

# توقف
sudo systemctl stop nginx

# شروع
sudo systemctl start nginx

# راه‌اندازی مجدد
sudo systemctl restart nginx

# reload (بدون downtime)
sudo systemctl reload nginx

# تست تنظیمات
sudo nginx -t
```

### مدیریت PostgreSQL

```bash
# بررسی وضعیت
sudo systemctl status postgresql

# توقف
sudo systemctl stop postgresql

# شروع
sudo systemctl start postgresql

# راه‌اندازی مجدد
sudo systemctl restart postgresql

# بکاپ دیتابیس
sudo -u postgres pg_dump noghre_sod > backup_$(date +%Y%m%d).sql

# بازگردانی
sudo -u postgres psql noghre_sod < backup_20241204.sql
```

### مدیریت Redis

```bash
# بررسی وضعیت
sudo systemctl status redis-server

# توقف
sudo systemctl stop redis-server

# شروع
sudo systemctl start redis-server

# راه‌اندازی مجدد
sudo systemctl restart redis-server
```

---

## 🔄 به‌روزرسانی پروژه

```bash
# رفتن به پوشه پروژه
cd ~/noghre-sod-ecommerce

# دریافت آخرین تغییرات
git pull origin main

# نصب dependencies جدید (در صورت نیاز)
bun install
cd frontend && bun install && cd ..
cd backend && bun install && cd ..

# Build frontend
cd frontend
bun run build
cd ..

# اجرای migrations جدید (در صورت نیاز)
cd backend
encore db migrate --service product
encore db migrate --service buyback
encore db migrate --service price
cd ..

# راه‌اندازی مجدد backend
pm2 restart noghre-sod-backend

# reload Nginx
sudo systemctl reload nginx
```

---

## 🐛 عیب‌یابی

### Backend شروع نمی‌شود

```bash
# بررسی لاگ‌ها
pm2 logs noghre-sod-backend --lines 100

# بررسی environment variables
pm2 env noghre-sod-backend

# اجرای دستی برای دیدن خطا
cd backend
ENCORE_ENVIRONMENT=production encore run
```

### خطای اتصال دیتابیس

```bash
# بررسی PostgreSQL
sudo systemctl status postgresql

# بررسی اتصال
sudo -u postgres psql -d noghre_sod -c "SELECT 1;"

# بررسی رمز عبور
sudo -u postgres psql -d noghre_sod -U noghre_user
```

### خطای 502 Bad Gateway

```bash
# بررسی backend در حال اجراست
pm2 status

# بررسی لاگ Nginx
sudo tail -f /var/log/nginx/error.log

# تست اتصال مستقیم
curl http://localhost:4000/health
```

### Frontend لود نمی‌شود

```bash
# بررسی Nginx
sudo systemctl status nginx

# بررسی فایل‌های build
ls -la ~/noghre-sod-ecommerce/frontend/dist/

# بررسی لاگ Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Redis اتصال ندارد

```bash
# بررسی وضعیت
sudo systemctl status redis-server

# تست اتصال
redis-cli -a YOUR_REDIS_PASSWORD ping

# بررسی لاگ
sudo tail -f /var/log/redis/redis-server.log
```

---

## 📊 مانیتورینگ

### نصب ابزارهای مانیتورینگ

```bash
# htop برای مشاهده منابع
sudo apt install -y htop
htop

# iotop برای I/O
sudo apt install -y iotop
sudo iotop

# نمایش استفاده دیسک
df -h

# نمایش استفاده RAM
free -h
```

### مانیتورینگ با PM2

```bash
# نمایش منابع استفاده شده
pm2 monit

# نمایش اطلاعات دقیق
pm2 show noghre-sod-backend
```

---

## 🔒 امنیت

### تنظیمات امنیتی پایه

```bash
# غیرفعال کردن root login در SSH
sudo nano /etc/ssh/sshd_config
# تغییر: PermitRootLogin no

# راه‌اندازی مجدد SSH
sudo systemctl restart sshd

# نصب fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# تنظیم automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 📝 یادداشت‌های مهم

1. **همیشه از environment variables استفاده کنید** - هیچ‌وقت رمزهای عبور را در کد ننویسید
2. **بکاپ منظم** - هر روز از دیتابیس بکاپ بگیرید
3. **مانیتورینگ** - لاگ‌ها را به صورت منظم بررسی کنید
4. **به‌روزرسانی** - به صورت هفتگی سیستم را به‌روزرسانی کنید
5. **SSL** - حتماً از HTTPS استفاده کنید

---

## 📞 پشتیبانی

در صورت مشکل:

1. لاگ‌ها را بررسی کنید:
   ```bash
   pm2 logs noghre-sod-backend
   sudo tail -f /var/log/nginx/error.log
   ```

2. health endpoint را چک کنید:
   ```bash
   curl http://localhost:4000/health
   ```

3. به مستندات پروژه مراجعه کنید:
   - [DEPLOYMENT.md](../backend/DEPLOYMENT.md)
   - [SECURITY_IMPROVEMENTS.md](../SECURITY_IMPROVEMENTS.md)

---

**موفق باشید! 🚀**
