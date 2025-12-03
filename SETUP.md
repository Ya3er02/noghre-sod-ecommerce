# نقره سود - راهنمای نصب و راه‌اندازی

## پیش‌نیازها

- Node.js 18 یا بالاتر
- Bun (آخرین نسخه)
- Git

## مراحل نصب

### 1. کلون کردن پروژه

```bash
git clone https://github.com/Ya3er02/noghre-sod-ecommerce.git
cd noghre-sod-ecommerce
```

### 2. نصب Bun (اگر نصب نیست)

```bash
curl -fsSL https://bun.sh/install | bash
```

### 3. تنظیمات Environment Variables

#### Frontend

```bash
cd frontend
cp .env.example .env.local
```

سپس فایل `.env.local` را ویرایش کرده و مقادیر زیر را وارد کنید:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
VITE_CLIENT_TARGET=http://localhost:4000
VITE_API_URL=http://localhost:4000
MODE=development
```

### 4. نصب وابستگی‌ها

#### Frontend

```bash
cd frontend
bun install
```

#### Backend

```bash
cd ../backend
bun install
```

### 5. اجرای پروژه در محیط توسعه

#### Frontend

```bash
cd frontend
bun run dev
```

فرانت‌اند روی `http://localhost:5173` اجرا می‌شود.

#### Backend

```bash
cd backend
bun run dev
```

Backend روی `http://localhost:4000` اجرا می‌شود.

### 6. Build برای Production

```bash
cd frontend
bun run build
```

## مشکلات رایج

### خطای Environment Variables

اگر خطای validation دریافت کردید، مطمئن شوید که:

1. فایل `.env.local` در مسیر صحیح است (`frontend/.env.local`)
2. تمام متغیرهای لازم تعریف شده‌اند
3. کلید Clerk با `pk_` شروع می‌شود
4. URLها معتبر هستند

### خطای Type

برای بررسی خطاهای TypeScript:

```bash
cd frontend
bunx tsc --noEmit
```

### خطای Build

اگر build با خطا مواجه شد:

1. پوشه `node_modules` را پاک کنید
2. فایل `bun.lockb` را پاک کنید
3. دوباره `bun install` اجرا کنید

```bash
rm -rf node_modules bun.lockb
bun install
```

## دستورات مفید

```bash
# اجرای تست‌ها
bun test

# بررسی Type
bunx tsc --noEmit

# Lint کردن کد
bunx eslint .

# بررسی امنیتی وابستگی‌ها
bun audit

# پاک کردن cache
bun run clean
```

## محیط Production

برای اطلاعات کامل در مورد استقرار روی سرور VPS، لطفاً به فایل [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) مراجعه کنید.

## پشتیبانی

برای گزارش مشکلات، لطفاً در [GitHub Issues](https://github.com/Ya3er02/noghre-sod-ecommerce/issues) مطرح کنید.

## منابع مفید

- [Bun Documentation](https://bun.sh/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Clerk Documentation](https://clerk.com/docs)