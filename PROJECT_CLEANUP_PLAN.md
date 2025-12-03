# 📋 نقشه جامع بازسازی و تمیزکاری پروژه

## 🎯 هدف
بازسازی کامل ساختار پروژه، حذف فایل‌های اضافی و بهینه‌سازی برای شروع درست

---

## ⚠️ مشکلات شناسایی شده

### 1. فایل‌های تکراری و غیرضروری (14 فایل)

```
❌ باید حذف شوند:
├── BRANCH_CLEANUP_GUIDE.md              (راهنمای cleanup branch - دیگر نیازی نیست)
├── COMPLETE_REBUILD_GUIDE.md            (راهنمای rebuild قدیمی)
├── COMPREHENSIVE_IMPLEMENTATION_GUIDE.md (راهنمای اجرا - تکراری)
├── DEPLOYMENT_GUIDE.md                   (راهنمای deploy تکراری)
├── DEPLOYMENT_README.md                  (راهنمای deploy تکراری 2)
├── IMPLEMENTATION_SUMMARY.md             (خلاصه اجرا - غیرضروری)
├── PARSPACK_DEPLOYMENT.md                (راهنمای Parspack اختصاصی)
├── PARSPACK_QUICKSTART.md                (Quickstart Parspack)
├── QUICK_START.md                        (Quickstart تکراری)
├── SECURITY_INCIDENT_FIX.md              (مستندات حادثه امنیتی قدیمی)
├── TRACKED_ENV_FILES_CLEANUP.md          (مستندات cleanup env)
├── VPS_DEPLOYMENT.md                     (راهنمای VPS اختصاصی)
├── FIXES.md                              (فایل fixes موقت)
└── SETUP.md                              (راهنمای setup تکراری)

✅ فایل‌های ضروری که می‌مانند:
├── README.md                             (مستندات اصلی)
├── DEVELOPMENT.md                        (راهنمای توسعه)
├── SECURITY.md                           (سیاست امنیتی)
└── CHANGELOG.md                          (تاریخچه تغییرات)
```

### 2. مشکل امنیتی حیاتی: فایل .env.production در Git

```bash
🚨 خطر امنیتی بالا!
فایل: .env.production
وضعیت: در git commit شده
خطر: افشای اطلاعات حساس (API keys, database credentials, secrets)
```

**اقدامات فوری:**
1. حذف از git history
2. تغییر تمام secrets افشا شده
3. اضافه کردن به .gitignore

### 3. فایل‌های موقت و غیرضروری در root

```
❌ نباید در root باشند:
├── nginx.conf                    (باید در deployment/ باشد)
├── deploy-parspack.sh            (باید در scripts/deployment/ باشد)
├── deploy-vps.sh                 (باید در scripts/deployment/ باشد)
└── package.json (root)           (احتمالاً غیرضروری)
```

---

## 📁 ساختار پیشنهادی (بهینه)

```
noghre-sod-ecommerce/
├── 📄 README.md                          # مستندات اصلی پروژه
├── 📄 CHANGELOG.md                       # تاریخچه تغییرات
├── 📄 LICENSE                            # مجوز استفاده
├── 📄 .gitignore                         # فایل‌های ignore
├── 📄 .env.example                       # نمونه environment variables
├── 📄 docker-compose.yml                 # Docker configuration
│
├── 📁 .github/                           # GitHub workflows
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── 📁 docs/                              # مستندات جامع
│   ├── 📄 README.md                     # فهرست مستندات
│   ├── 📁 development/
│   │   ├── SETUP.md                     # راهنمای نصب
│   │   ├── DEVELOPMENT.md               # راهنمای توسعه
│   │   └── CONTRIBUTING.md              # راهنمای مشارکت
│   ├── 📁 deployment/
│   │   ├── README.md                    # مقدمه deployment
│   │   ├── DOCKER.md                    # استفاده از Docker
│   │   ├── VPS.md                       # deploy روی VPS
│   │   └── PARSPACK.md                  # deploy روی Parspack
│   ├── 📁 architecture/
│   │   ├── OVERVIEW.md                  # نمای کلی معماری
│   │   ├── BACKEND.md                   # معماری Backend
│   │   └── FRONTEND.md                  # معماری Frontend
│   └── 📁 security/
│       ├── SECURITY.md                  # سیاست امنیتی
│       └── BEST_PRACTICES.md            # بهترین شیوه‌ها
│
├── 📁 frontend/                          # کد Frontend
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 vite.config.ts
│   ├── 📄 Dockerfile
│   ├── 📄 .dockerignore
│   ├── 📄 .env.example
│   ├── 📄 nginx.conf.template
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   ├── 📁 pages/
│   │   ├── 📁 hooks/
│   │   ├── 📁 lib/
│   │   ├── 📁 styles/
│   │   └── 📄 main.tsx
│   └── 📁 public/
│
├── 📁 backend/                           # کد Backend
│   ├── 📄 encore.app
│   ├── 📄 Dockerfile
│   ├── 📄 .dockerignore
│   ├── 📄 .env.example
│   └── (ساختار Encore.dev)
│
├── 📁 scripts/                           # اسکریپت‌های کمکی
│   ├── 📁 deployment/
│   │   ├── deploy-vps.sh
│   │   ├── deploy-parspack.sh
│   │   └── deploy-docker.sh
│   ├── 📁 database/
│   │   ├── migrate.sh
│   │   └── seed.sh
│   └── 📁 utils/
│       ├── cleanup.sh
│       └── backup.sh
│
└── 📁 config/                            # فایل‌های پیکربندی
    ├── nginx.conf                       # Nginx config for production
    ├── lighthouserc.json                # Lighthouse CI
    └── sonar-project.properties         # SonarQube
```

---

## 🔧 مراحل اجرای Cleanup

### مرحله 1: پشتیبان‌گیری (ایمن‌سازی)

```bash
# 1. کلون کامل repository (با تمام history)
git clone --mirror https://github.com/Ya3er02/noghre-sod-ecommerce.git backup-repo

# 2. آرشیو از branch فعلی
cd noghre-sod-ecommerce
tar -czf ../noghre-sod-backup-$(date +%Y%m%d).tar.gz .

# 3. تأیید backup
ls -lh ../noghre-sod-backup-*.tar.gz
```

### مرحله 2: حذف فایل .env.production از Git History

```bash
# استفاده از git-filter-repo (روش امن)
# نصب git-filter-repo
pip install git-filter-repo

# حذف فایل از تمام history
git filter-repo --invert-paths --path .env.production

# force push (بعد از اطمینان)
git push origin --force --all

# ⚠️ مهم: بعد از این، همه کاربران باید repository را دوباره clone کنند
```

### مرحله 3: حذف فایل‌های تکراری

```bash
# ساخت branch جدید
git checkout -b refactor/cleanup-structure

# حذف فایل‌های تکراری
git rm BRANCH_CLEANUP_GUIDE.md
git rm COMPLETE_REBUILD_GUIDE.md
git rm COMPREHENSIVE_IMPLEMENTATION_GUIDE.md
git rm DEPLOYMENT_GUIDE.md
git rm DEPLOYMENT_README.md
git rm IMPLEMENTATION_SUMMARY.md
git rm PARSPACK_DEPLOYMENT.md
git rm PARSPACK_QUICKSTART.md
git rm QUICK_START.md
git rm SECURITY_INCIDENT_FIX.md
git rm TRACKED_ENV_FILES_CLEANUP.md
git rm VPS_DEPLOYMENT.md
git rm FIXES.md
git rm SETUP.md

# Commit تغییرات
git commit -m "chore: remove redundant documentation files"
```

### مرحله 4: ایجاد ساختار docs/ جدید

```bash
# ساخت ساختار پوشه‌های جدید
mkdir -p docs/{development,deployment,architecture,security}
mkdir -p scripts/{deployment,database,utils}
mkdir -p config

# انتقال فایل‌های موجود
mv DEVELOPMENT.md docs/development/
mv SECURITY.md docs/security/
mv nginx.conf config/
mv lighthouserc.json config/
mv sonar-project.properties config/
mv deploy-*.sh scripts/deployment/

# Commit
git add .
git commit -m "refactor: reorganize project structure with docs/ and scripts/"
```

### مرحله 5: بروزرسانی .gitignore

```bash
# اضافه کردن به .gitignore
cat >> .gitignore << 'EOF'

# Environment files (NEVER commit these!)
.env
.env.local
.env.*.local
.env.production
.env.staging
*.env

# Sensitive data
secrets/
*.key
*.pem
*.cert

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
.next/
out/

# Dependencies
node_modules/

# Temporary files
*.tmp
*.temp
EOF

git add .gitignore
git commit -m "security: enhance .gitignore to prevent sensitive files"
```

### مرحله 6: ایجاد README.md اصلی جدید

```bash
# یک README.md تمیز و حرفه‌ای ایجاد می‌شود
# (محتوا در ادامه)
```

### مرحله 7: تست و Review

```bash
# بررسی تغییرات
git log --oneline -10
git diff main..refactor/cleanup-structure

# اجرای تست‌ها
cd frontend && npm test
cd ../backend && encore test

# اگر همه چیز OK بود:
git push origin refactor/cleanup-structure
```

### مرحله 8: Pull Request و Merge

```bash
# ایجاد PR از طریق GitHub
# Review دقیق تغییرات
# Merge به main
```

---

## 🔒 اقدامات امنیتی فوری

### 1. تغییر تمام Secrets افشا شده

```bash
# چک‌لیست secrets که باید تغییر کنند:
☐ Database credentials (username/password)
☐ API keys (Clerk, payment gateways, etc.)
☐ JWT secrets
☐ Encryption keys
☐ Third-party service tokens
☐ OAuth client secrets
```

### 2. بررسی Git History

```bash
# جستجوی secrets در history
git log -p -S "password" --all
git log -p -S "api_key" --all
git log -p -S "secret" --all

# استفاده از ابزارهای خودکار
npx @dotenvx/dotenvx scan
# یا
git secrets --scan-history
```

### 3. فعال‌سازی GitHub Secret Scanning

1. به Settings → Security → Code security and analysis
2. فعال کردن:
   - Secret scanning
   - Push protection
   - Dependabot alerts

---

## 📝 محتوای README.md جدید

```markdown
# 🛍️ Noghre Sod E-commerce Platform

> [translate:پلتفرم تجارت الکترونیک نقره سود - فروشگاه آنلاین محصولات نقره]

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://react.dev/)
[![Encore](https://img.shields.io/badge/Encore-1.51-blueviolet)](https://encore.dev/)

## 📋 فهرست

- [درباره پروژه](#درباره-پروژه)
- [ویژگی‌ها](#ویژگی‌ها)
- [تکنولوژی‌ها](#تکنولوژی‌ها)
- [شروع سریع](#شروع-سریع)
- [مستندات](#مستندات)
- [مشارکت](#مشارکت)
- [لایسنس](#لایسنس)

## 🎯 درباره پروژه

نقره سود یک پلتفرم تجارت الکترونیک مدرن برای خرید و فروش محصولات نقره است که با آخرین تکنولوژی‌های وب توسعه یافته است.

## ✨ ویژگی‌ها

- ✅ UI/UX مدرن و واکنش‌گرا
- ✅ احراز هویت امن با Clerk
- ✅ سیستم پرداخت آنلاین
- ✅ مدیریت محصولات
- ✅ سبد خرید و checkout
- ✅ پنل ادمین جامع
- ✅ پشتیبانی از زبان فارسی
- ✅ بهینه‌سازی SEO
- ✅ PWA Support

## 🛠️ تکنولوژی‌ها

### Frontend
- **React 19.2** - UI Framework
- **TypeScript 5.8** - Type Safety
- **Vite 6.2** - Build Tool
- **TailwindCSS 4.1** - Styling
- **React Router 7.6** - Routing
- **Tanstack Query 5.85** - Data Fetching
- **Clerk** - Authentication

### Backend
- **Encore.dev 1.51** - Backend Framework
- **TypeScript** - Language
- **PostgreSQL** - Database

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Nginx** - Web Server

## 🚀 شروع سریع

### پیش‌نیازها

```bash
- Node.js 18+
- Bun 1.0+ (یا npm/yarn)
- Docker (اختیاری)
```

### نصب

```bash
# Clone repository
git clone https://github.com/Ya3er02/noghre-sod-ecommerce.git
cd noghre-sod-ecommerce

# نصب dependencies (Frontend)
cd frontend
bun install

# نصب dependencies (Backend)
cd ../backend
bun install
```

### اجرا (Development)

```bash
# Terminal 1: Backend
cd backend
encore run

# Terminal 2: Frontend
cd frontend
bun dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:4000

### اجرا با Docker

```bash
docker-compose up -d
```

## 📚 مستندات

مستندات کامل در پوشه [`docs/`](docs/) موجود است:

- [راهنمای نصب و راه‌اندازی](docs/development/SETUP.md)
- [راهنمای توسعه](docs/development/DEVELOPMENT.md)
- [راهنمای Deployment](docs/deployment/)
- [معماری سیستم](docs/architecture/)
- [امنیت](docs/security/SECURITY.md)

## 🤝 مشارکت

مشارکت شما استقبال می‌شود! لطفاً [راهنمای مشارکت](docs/development/CONTRIBUTING.md) را مطالعه کنید.

## 📄 لایسنس

MIT License - جزئیات در [LICENSE](LICENSE)

## 📧 تماس

- **سازنده**: Yaser (Ya3er02)
- **GitHub**: [@Ya3er02](https://github.com/Ya3er02)
- **Repository**: [noghre-sod-ecommerce](https://github.com/Ya3er02/noghre-sod-ecommerce)

---

<div align="center">
  ساخته شده با ❤️ در ایران
</div>
```

---

## ✅ Checklist اجرا

### قبل از شروع
- [ ] پشتیبان کامل از repository
- [ ] هماهنگی با تیم (اگر وجود دارد)
- [ ] اطمینان از backup محلی

### حذف فایل‌های حساس
- [ ] حذف .env.production از git history
- [ ] تغییر تمام secrets افشا شده
- [ ] بروزرسانی .gitignore
- [ ] فعال‌سازی GitHub secret scanning

### پاکسازی فایل‌ها
- [ ] حذف 14 فایل مستندات تکراری
- [ ] حذف فایل‌های موقت
- [ ] انتقال فایل‌ها به مکان صحیح

### ساختاردهی جدید
- [ ] ایجاد ساختار docs/
- [ ] ایجاد ساختار scripts/
- [ ] ایجاد ساختار config/
- [ ] انتقال فایل‌های موجود

### مستندات
- [ ] ایجاد README.md جدید
- [ ] ایجاد مستندات در docs/
- [ ] بروزرسانی CHANGELOG.md

### تست و اعتبارسنجی
- [ ] تست build frontend
- [ ] تست build backend
- [ ] تست Docker build
- [ ] بررسی CI/CD

### Deployment
- [ ] ایجاد PR
- [ ] Code review
- [ ] Merge به main
- [ ] اطلاع‌رسانی به تیم

---

## 📊 نتیجه نهایی

### قبل از Cleanup
```
تعداد فایل‌های root: 30+
فایل‌های مستندات تکراری: 14
مشکلات امنیتی: 1 (بحرانی)
ساختار: نامرتب
```

### بعد از Cleanup
```
تعداد فایل‌های root: 8-10
فایل‌های مستندات تکراری: 0
مشکلات امنیتی: 0
ساختار: منظم و حرفه‌ای
```

### مزایا
- ✅ ساختار تمیز و قابل نگهداری
- ✅ امنیت بهبود یافته
- ✅ مستندات سازماندهی شده
- ✅ آماده برای production
- ✅ استانداردهای صنعتی

---

## 🆘 پشتیبانی

اگر سوالی دارید:
1. [مستندات](docs/) را بررسی کنید
2. [Issues](https://github.com/Ya3er02/noghre-sod-ecommerce/issues) را جستجو کنید
3. Issue جدید ایجاد کنید

---

**آخرین بروزرسانی**: 3 دسامبر 2024  
**نسخه**: 2.0.0  
**وضعیت**: در حال بازسازی