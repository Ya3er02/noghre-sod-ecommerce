# نقره سود - راهنمای نصب و راه‌اندازی

## پیش‌نیازها

- **Node.js** 18 یا بالاتر
- **Bun** (آخرین نسخه)
- **Git**

---

## مراحل نصب

### 1︎⃣ کلون کردن پروژه

```bash
git clone https://github.com/Ya3er02/noghre-sod-ecommerce.git
cd noghre-sod-ecommerce
```

### 2︎⃣ نصب Bun (اگر نصب نیست)

```bash
curl -fsSL https://bun.sh/install | bash
```

### 3︎⃣ تنظیمات Environment Variables

#### Frontend

```bash
cd frontend
cp .env.example .env.local
```

سپس فایل `.env.local` را ویرایش کرده و مقادیر زیر را وارد کنید:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_clerk_key_here
VITE_CLIENT_TARGET=http://localhost:4000
VITE_API_URL=http://localhost:4000
MODE=development
```

⚠️ **مهم:** کلید Clerk را از [Clerk Dashboard](https://dashboard.clerk.com) دریافت کنید.

### 4︎⃣ نصب وابستگی‌ها

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

### 5︎⃣ اجرای پروژه در محیط توسعه

#### Frontend

```bash
cd frontend
bun run dev
```

فرانت‌اند روی `http://localhost:5173` اجرا می‌شود.

#### Backend (در ترمینال جدا)

```bash
cd backend
encore run
```

### 6︎⃣ Build برای Production

```bash
cd frontend
bun run build
bun run preview
```

---

## مشکلات رایج

### خطای Environment Variables

اگر خطای validation دریافت کردید، مطمئن شوید که:

1️⃣ فایل `.env.local` در مسیر `frontend/` وجود دارد  
2️⃣ تمام متغیرهای لازم تعریف شده‌اند  
3️⃣ کلید Clerk با `pk_` شروع می‌شود  

### خطای Type

برای بررسی خطاهای TypeScript:

```bash
cd frontend
bun run type-check
```

---

## دستورات مفید

```bash
# اجرای توسعه
cd frontend && bun run dev

# Build تولید
cd frontend && bun run build

# بررسی Type
cd frontend && bun run type-check

# بررسی امنیتی
cd frontend && bun audit

# Preview بیلد
cd frontend && bun run preview
```

---

## متغیرهای محیطی (Environment Variables)

### لازم:

- `VITE_CLERK_PUBLISHABLE_KEY` - کلید عمومی Clerk
- `VITE_CLIENT_TARGET` - URL سرور Backend

### اختیاری:

- `VITE_API_URL` - URL API جایگزین
- `VITE_SENTRY_DSN` - برای Error Tracking

---

## پشتیبانی

برای گزارش مشکلات، لطفاً در [GitHub Issues]( https://github.com/Ya3er02/noghre-sod-ecommerce/issues) مطرح کنید.
