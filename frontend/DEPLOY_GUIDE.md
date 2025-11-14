# راهنمای رفع خطای Deploy

## مشکل فعلی:
سایت deploy شده اما تغییرات جدید اعمال نشده است.

## علت احتمالی:
1. Build ناموفق بوده
2. کش مرورگر
3. تغییرات Push نشده

## راه‌حل قطعی:

### گام 1: بررسی تغییرات در GitHub
```bash
git log --oneline -10
```

باید commit های زیر را ببینید:
- feat: Add LiquidBackground and 3D cards to AboutPage
- feat: Add 3D card styles for readable content  
- perf: Reduce animation speed for smoother experience
- feat: Update HomePage with new LiquidBackground
- feat: Add responsive CSS for Liquid Background
- feat: Add new LiquidBackground with black and silver

### گام 2: Deploy مجدد

#### روش A: از طریق Liara CLI
```bash
cd frontend
npm install
npm run build
liara deploy
```

#### روش B: از طریق داشبورد Liara
1. به console.liara.ir بروید
2. پروژه noghresood-f را باز کنید
3. روی "استقرار مجدد" کلیک کنید

### گام 3: پاک کردن کش
```bash
# در مرورگر:
Ctrl + Shift + Delete
# یا:
Ctrl + F5 (Hard Refresh)
```

### گام 4: تست
به https://noghresood.shop بروید و باید:
- ✅ پس‌زمینه سیاه با انیمیشن نقره‌ای ببینید
- ✅ متن‌ها در کارت‌های شفاف سه‌بعدی باشند
- ✅ انیمیشن آرام و نرم باشد

## اگر هنوز مشکل دارید:

### خطای احتمالی 1: Module not found
```
Error: Cannot find module '@/components/LiquidBackground'
```

**راه‌حل:**
مطمئن شوید tsconfig.json یا vite.config.ts دارای این تنظیمات است:
```typescript
alias: {
  '@': path.resolve(__dirname, './'),
}
```

### خطای احتمالی 2: Build Error
```
TypeScript error in LiquidBackground.tsx
```

**راه‌حل:**
```bash
cd frontend
npm run build
# خطا را بخوانید و برطرف کنید
```

### خطای احتمالی 3: CSS not loading
**راه‌حل:**
مطمئن شوید `LiquidBackground.css` در همان پوشه components وجود دارد.

## نکات مهم:
- همیشه قبل از deploy، build محلی بگیرید
- لاگ‌های Liara را چک کنید
- از `liara logs` برای دیدن خطاها استفاده کنید

## کامندهای مفید Liara:
```bash
# دیدن لاگ‌ها
liara logs

# دیدن وضعیت app
liara app ls

# restart کردن
liara restart
```
