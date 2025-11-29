# راهنمای امنیتی نقره سود

## 🔒 خلاصه اقدامات امنیتی

این سند شامل تمام اقدامات امنیتی پیاده‌سازی شده در پلتفرم است.

---

## 1. احراز هویت و دسترسی

### Multi-Factor Authentication (MFA/2FA)

**پیاده‌سازی شده:**
- ✅ TOTP-based 2FA با `speakeasy`
- ✅ QR Code برای اسکن در Authenticator Apps
- ✅ Backup Codes برای موارد اضطراری
- ✅ SMS OTP به عنوان گزینه جایگزین

**فایل‌ها:**
- `backend/auth/services/mfa.service.ts`

**نحوه استفاده:**
```typescript
const mfa = await mfaService.generateMFASecret(userId, userEmail);
// ذخیره mfa.secret به صورت رمزشده در database
// نمایش mfa.qrCode به کاربر
```

---

## 2. Rate Limiting

**پیاده‌سازی شده:**
- ✅ General API: 100 requests / 15 min
- ✅ Login: 5 attempts / 15 min
- ✅ OTP: 3 requests / 1 hour

**فایل‌ها:**
- `backend/auth/middleware/security.ts`

**پیکربندی:**
```typescript
import { apiLimiter, loginLimiter, otpLimiter } from './auth/middleware/security';

app.use('/api/', apiLimiter);
app.post('/api/auth/login', loginLimiter, loginController);
app.post('/api/auth/otp', otpLimiter, otpController);
```

---

## 3. رمزنگاری داده‌ها

### Encryption at Rest

**داده‌های رمزنگاری شده:**
- ✅ شماره ملی
- ✅ شماره حساب بانکی
- ✅ اطلاعات تماس حساس
- ✅ MFA Secrets

**الگوریتم:** AES-256-GCM

**فایل‌ها:**
- `backend/db/encryption.service.ts`

**نحوه استفاده:**
```typescript
import { encryption } from './db/encryption.service';

// رمزنگاری
const encrypted = encryption.encrypt(sensitiveData);

// رمزگشایی
const decrypted = encryption.decrypt(encrypted);

// Masking برای نمایش
const masked = encryption.maskData('1234567890123456', 'card');
// Result: "1234-****-****-3456"
```

### Hashing

**برای:**
- ✅ پسوردها
- ✅ Backup Codes
- ✅ Tokens

**الگوریتم:** PBKDF2 with SHA-512 (100,000 iterations)

---

## 4. Security Headers

**پیاده‌سازی شده:**
- ✅ Content Security Policy (CSP)
- ✅ HTTP Strict Transport Security (HSTS)
- ✅ X-Frame-Options (Clickjacking protection)
- ✅ X-Content-Type-Options (MIME sniffing protection)
- ✅ X-XSS-Protection
- ✅ Referrer-Policy

**پیکربندی:**
```typescript
import { securityHeaders } from './auth/middleware/security';

app.use(securityHeaders);
```

---

## 5. Input Validation & Sanitization

**پیاده‌سازی شده:**
- ✅ پاکسازی خودکار تمام inputs
- ✅ حذف HTML tags
- ✅ حذف کاراکترهای خطرناک
- ✅ SQL Injection prevention

**Middleware:**
```typescript
import { sanitizeRequest } from './auth/middleware/security';

app.use(sanitizeRequest);
```

---

## 6. CORS Configuration

**تنظیمات:**
- ✅ Whitelist domains
- ✅ Credentials support
- ✅ Allowed methods/headers

**پیکربندی:**
```typescript
import cors from 'cors';
import { corsOptions } from './auth/middleware/security';

app.use(cors(corsOptions));
```

---

## 7. Payment Security (PCI DSS)

**اصول:**
- ❌ **هرگز اطلاعات کارت را ذخیره نکنید**
- ✅ فقط Token را ذخیره کنید
- ✅ استفاده از Payment Gateway
- ✅ 3D Secure verification

---

## 8. API Keys Management

### امنیت Keys:

1. **هرگز در Git commit نکنید**
2. استفاده از `.env` files
3. استفاده از Secret Management services

### Rotation Policy:

- ✅ ENCRYPTION_KEY: هر 90 روز
- ✅ API Keys: هر 180 روز
- ✅ JWT Secrets: هر 30 روز

---

## 9. Logging & Monitoring

**لوگ کردن:**
- ✅ Failed login attempts
- ✅ MFA failures
- ✅ Rate limit violations
- ✅ Suspicious activities
- ✅ Payment transactions

**❌ هرگز لوگ نکنید:**
- Passwords
- Credit card numbers
- Personal identification numbers
- API keys

---

## 10. بررسی امنیتی

### Checklist:

- [ ] OWASP Top 10 vulnerabilities addressed
- [ ] Regular security audits scheduled
- [ ] Penetration testing completed
- [ ] Dependency vulnerabilities scanned
- [ ] SSL/TLS properly configured
- [ ] Backup and disaster recovery plan

### ابزارهای بررسی:

```bash
# Dependency vulnerabilities
npm audit
bun audit

# OWASP ZAP
zap-cli quick-scan https://noghresood.shop

# SSL Labs
# https://www.ssllabs.com/ssltest/
```

---

## 11. Incident Response Plan

### در صورت نفوذ امنیتی:

1. **Immediate:**
   - قطع دسترسی سیستم آسیب دیده
   - Rotate تمام keys و secrets
   - اعلام به تیم امنیتی

2. **Investigation:**
   - بررسی logs
   - شناسایی نقطه نفوذ
   - ارزیابی خسارت

3. **Recovery:**
   - رفع آسیب‌پذیری
   - Restore from backup
   - تست کامل

4. **Communication:**
   - اعلام به کاربران آسیب دیده
   - گزارش به مقامات ذی‌ربط

---

## 12. Compliance

### استانداردهای پشتیبانی شده:

- ✅ GDPR (General Data Protection Regulation)
- ✅ PCI DSS (Payment Card Industry Data Security Standard)
- ✅ OWASP Top 10
- ✅ ISO 27001 principles

---

## گزارش آسیب‌پذیری

اگر آسیب‌پذیری امنیتی پیدا کردید، لطفاً به صورت محرمانه گزارش دهید:

**Email:** security@noghresood.shop
**PGP Key:** [link to PGP key]

با تشکر از کمک به امنیت پلتفرم! 🔒
