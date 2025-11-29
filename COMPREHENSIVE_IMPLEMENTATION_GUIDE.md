# راهنمای جامع پیاده‌سازی بهبودی‌ها

## 📝 فهرست مطالب

1. [معرفی](#معرفی)
2. [پیش‌نیازها](#پیش‌نیازها)
3. [نصب و راه‌اندازی](#نصب-و-راه‌اندازی)
4. [پیکربندی امنیتی](#پیکربندی-امنیتی)
5. [چندزبانه‌سازی](#چندزبانه‌سازی)
6. [یکپارچه‌سازی API قیمت](#یکپارچه‌سازی-api-قیمت)
7. [هوش مصنوعی](#هوش-مصنوعی)
8. [PWA](#pwa)
9. [تست و رفع عیب](#تست-و-رفع-عیب)

---

## معرفی

این برنچ شامل بهبودی‌های جامع در تمام جنبه‌های پلتفرم نقره سود است:

### ویژگی‌های جدید:

- ✅ **امنیت پیشرفته**: MFA, Rate Limiting, رمزنگاری داده‌ها
- ✅ **چندزبانه**: پشتیبانی کامل فارسی، عربی، انگلیسی
- ✅ **قیمت لحظه‌ای**: اتصال به APIهای معتبر قیمت نقره
- ✅ **هوش مصنوعی**: تحلیل محصول، پشتیبانی خودکار
- ✅ **PWA**: اپلیکیشن وب قابل نصب
- ✅ **بهینه‌سازی Performance**: Code splitting, Caching, CDN

---

## پیش‌نیازها

### نرم‌افزارهای مورد نیاز:

```bash
# Node.js v20 or higher
node --version  # v20.0.0+

# Bun (Package Manager)
curl -fsSL https://bun.sh/install | bash

# Docker (optional, for containerization)
docker --version
```

### API Keys مورد نیاز:

1. **OpenAI API Key** - برای هوش مصنوعی
2. **Metals-API Key** - برای قیمت نقره
3. **Metal Price API Key** - برای قیمت نقره (منبع دوم)
4. **Clerk API Key** - برای احراز هویت

---

## نصب و راه‌اندازی

### 1. کلون کردن برنچ

```bash
git clone https://github.com/Ya3er02/noghre-sod-ecommerce.git
cd noghre-sod-ecommerce
git checkout feature/comprehensive-improvements
```

### 2. نصب Dependencies

```bash
# Backend
cd backend
bun install

# Frontend
cd ../frontend
bun install

# نصب پکیج‌های جدید
bun add speakeasy qrcode express-rate-limit helmet
bun add i18next react-i18next i18next-browser-languagedetector i18next-http-backend
bun add openai axios
```

### 3. پیکربندی Environment Variables

#### Backend `.env`:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/noghresood"

# Encryption
ENCRYPTION_KEY="YOUR_32_BYTE_HEX_KEY_HERE"
OTP_SECRET="YOUR_OTP_SECRET_HERE"

# APIs
OPENAI_API_KEY="sk-..."
METALS_API_KEY="YOUR_METALS_API_KEY"
METAL_PRICE_API_KEY="YOUR_METAL_PRICE_API_KEY"

# Authentication
CLERK_SECRET_KEY="sk_..."

# Redis (for caching)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Environment
NODE_ENV="development"
PORT="4000"
```

#### Frontend `.env`:

```env
VITE_API_URL="http://localhost:4000"
VITE_CLERK_PUBLISHABLE_KEY="pk_..."
VITE_APP_NAME="نقره سود"
```

### 4. تولید Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. راه‌اندازی Development

```bash
# Terminal 1: Backend
cd backend
encore run

# Terminal 2: Frontend
cd frontend
bun run dev
```

مرورگر را باز کنید: `http://localhost:5173`

---

## پیکربندی امنیتی

### 1. فعال‌سازی Rate Limiting

```typescript
// backend/index.ts
import { apiLimiter, loginLimiter, securityHeaders } from './auth/middleware/security';
import cors from 'cors';

const app = express();

// Security Headers
app.use(securityHeaders);

// CORS
app.use(cors(corsOptions));

// Rate Limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);
```

### 2. فعال‌سازی MFA

```typescript
// در فرآیند ثبت‌نام
const { secret, qrCode, backupCodes } = await mfaService.generateMFASecret(
  userId,
  userEmail
);

// ذخیره در دیتابیس
await db.users.update({
  where: { id: userId },
  data: {
    mfaSecret: encryption.encrypt(secret),
    mfaBackupCodes: backupCodes.map(code => encryption.hash(code)),
    mfaEnabled: false, // کاربر بعداً فعال می‌کند
  },
});
```

### 3. رمزنگاری داده‌ها

```typescript
// models/user.entity.ts
import { encryptionTransformer } from '../db/encryption.service';

@Entity()
export class User {
  @Column({ 
    type: 'text',
    transformer: encryptionTransformer 
  })
  nationalId: string; // شماره ملی

  @Column({ 
    type: 'text',
    transformer: encryptionTransformer 
  })
  bankAccount: string; // حساب بانکی
}
```

---

## چندزبانه‌سازی

### 1. راه‌اندازی i18n

```typescript
// frontend/main.tsx
import './lib/i18n/config';
import { Suspense } from 'react';

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <YourApp />
    </Suspense>
  );
}
```

### 2. استفاده در Components

```typescript
import { useTranslation } from 'react-i18next';
import { useCurrencyFormatter } from '../lib/formatters';

function ProductCard({ product }) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();

  return (
    <div>
      <h3>{product.name}</h3>
      <p>{formatCurrency(product.price)}</p>
      <button>{t('actions.add_to_cart')}</button>
    </div>
  );
}
```

### 3. اضافه کردن ترجمه‌های جدید

```json
// public/locales/fa/product.json
{
  "silver_price_live": "قیمت لحظه‌ای نقره",
  "per_ounce": "هر اونس",
  "per_gram": "هر گرم",
  "change_24h": "تغییرات 24 ساعته"
}
```

---

## یکپارچه‌سازی API قیمت

### 1. راه‌اندازی Service

```typescript
// backend/price/price.controller.ts
import { silverPriceService } from './services/silver-price.service';

export async function getCurrentPrice(req, res) {
  try {
    const price = await silverPriceService.getCurrentPrice();
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: 'خطا در دریافت قیمت' });
  }
}
```

### 2. استفاده در Frontend

```typescript
import { LiveSilverPrice } from '../components/LiveSilverPrice';

function HomePage() {
  return (
    <div>
      <LiveSilverPrice />
      {/* ... */}
    </div>
  );
}
```

---

## هوش مصنوعی

### 1. تحلیل تصاویر محصول

```typescript
import { productAnalysisAI } from './ai/services/product-analysis.service';

const analysis = await productAnalysisAI.analyzeProductImage(
  'https://example.com/product.jpg'
);

if (!analysis.isAuthentic) {
  console.warn('محصول مشکوک:', analysis.concerns);
}
```

### 2. چت‌بات پشتیبانی

```typescript
import { customerSupportAI } from './ai/services/customer-support.service';

const response = await customerSupportAI.handleCustomerQuery(
  'چگونه می‌توانم محصول بفروشم؟',
  {
    userId: 'user123',
    history: [],
    metadata: { language: 'fa', userType: 'seller' },
  }
);

if (response.shouldEscalate) {
  // ارجاع به پشتیبانی انسانی
}
```

---

## PWA

### 1. تست Manifest

```bash
# باز کردن DevTools
# Application > Manifest
```

### 2. نصب بر موبایل

1. باز کردن سایت در Chrome موبایل
2. کلیک روی "Add to Home Screen"
3. استفاده مانند اپلیکیشن نیتیو

---

## تست و رفع عیب

### چک لیست تست:

- [ ] تمام صفحات به درستی بارگذاری می‌شوند
- [ ] RTL/LTR برای هر سه زبان کار می‌کند
- [ ] قیمت نقره بروزرسانی می‌شود
- [ ] MFA در Login کار می‌کند
- [ ] Rate Limiting فعال است
- [ ] چت‌بات AI پاسخ می‌دهد
- [ ] PWA قابل نصب است

### تست Performance:

```bash
# Lighthouse Score
npx lighthouse http://localhost:5173 --view

# هدف: Score > 90 در همه موارد
```

---

## مشکلات رایج

### 1. Encryption Key Error

```bash
Error: ENCRYPTION_KEY environment variable is required
```

**حل:** تولید کلید جدید و اضافه به `.env`

### 2. OpenAI API Error

```bash
Error: Invalid API key
```

**حل:** بررسی `OPENAI_API_KEY` در `.env`

### 3. i18n Not Loading

**حل:** بررسی مسیر فایل‌های ترجمه در `public/locales/`

---

## پشتیبانی

برای سوالات و مشکلات:
- GitHub Issues: [https://github.com/Ya3er02/noghre-sod-ecommerce/issues](https://github.com/Ya3er02/noghre-sod-ecommerce/issues)
- Email: support@noghresood.shop
