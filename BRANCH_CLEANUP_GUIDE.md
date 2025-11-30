# 🧹 راهنمای پاکسازی Branch‌ها

این راهنما به شما کمک می‌کند تمام branch‌های اضافی را پاک کنید و فقط یک base واحد (main) نگه دارید.

---

## 📋 وضعیت فعلی

### Branch‌های موجود (15 عدد)

```
✅ main                                          - Branch اصلی (نگهداری)
❌ automated-fixes/comprehensive-improvements   - Merge شده
❌ automated-fixes/security-performance-v2     - قدیمی
❌ backup/pre-fixes-20251130-1540              - Backup (اختیاری)
❌ feature/comprehensive-improvements           - قدیمی
❌ feature/comprehensive-ui-fixes               - قدیمی
❌ dependabot/github_actions/actions/checkout-6
❌ dependabot/github_actions/actions/labeler-6
❌ dependabot/github_actions/actions/upload-artifact-5
❌ dependabot/github_actions/oven-sh/setup-bun-2
❌ dependabot/npm_and_yarn/backend/clerk/backend-2.24.0
❌ dependabot/npm_and_yarn/frontend/lucide-react-0.555.0
❌ dependabot/npm_and_yarn/frontend/vite-7.2.4
❌ dependabot/npm_and_yarn/frontend/vitejs/plugin-react-5.1.1
❌ dependabot/npm_and_yarn/frontend/zod-4.1.13
```

---

## 🔒 مرحله 0: امنیت (Backup)

قبل از پاک کردن branch‌اه، مطمئن شوید تمام کدهای مهم در main هستند:

```bash
# بررسی main
git checkout main
git pull origin main

# مشاهده آخرین commit‌ها
git log --oneline -10

# بررسی تفاوت با branch‌های دیگر (اختیاری)
git diff main automated-fixes/comprehensive-improvements
```

✅ **تأیید شد**: تمام بهبودها از PR #3 در main موجود هستند.

---

## 🛠️ روش 1: پاک کردن از طریق GitHub UI (ساده‌تر)

### مرحله 1: رفتن به صفحه Branches

1. بروید به: https://github.com/Ya3er02/noghre-sod-ecommerce/branches
2. لیست تمام branch‌ها را خواهید دید

### مرحله 2: پاک کردن Branch‌ها

برای هر branch زیر، روی آیکون سطل زباله (🗑️) کلیک کنید:

#### Branch‌های automated-fixes
- [ ] `automated-fixes/comprehensive-improvements`
- [ ] `automated-fixes/security-performance-v2`

#### Branch‌های feature
- [ ] `feature/comprehensive-improvements`
- [ ] `feature/comprehensive-ui-fixes`

#### Branch‌های Dependabot (9 عدد)
- [ ] `dependabot/github_actions/actions/checkout-6`
- [ ] `dependabot/github_actions/actions/labeler-6`
- [ ] `dependabot/github_actions/actions/upload-artifact-5`
- [ ] `dependabot/github_actions/oven-sh/setup-bun-2`
- [ ] `dependabot/npm_and_yarn/backend/clerk/backend-2.24.0`
- [ ] `dependabot/npm_and_yarn/frontend/lucide-react-0.555.0`
- [ ] `dependabot/npm_and_yarn/frontend/vite-7.2.4`
- [ ] `dependabot/npm_and_yarn/frontend/vitejs/plugin-react-5.1.1`
- [ ] `dependabot/npm_and_yarn/frontend/zod-4.1.13`

#### Branch backup (اختیاری)
- [ ] `backup/pre-fixes-20251130-1540` - اگر نیازی ندارید، می‌توانید پاک کنید

---

## 💻 روش 2: پاک کردن از طریق Git CLI (سریع‌تر)

### مرحله 1: رفتن به main

```bash
cd /path/to/noghre-sod-ecommerce
git checkout main
git pull origin main
```

### مرحله 2: پاک کردن Local Branches

```bash
# پاک automated-fixes
git branch -D automated-fixes/comprehensive-improvements
git branch -D automated-fixes/security-performance-v2

# پاک feature branches
git branch -D feature/comprehensive-improvements
git branch -D feature/comprehensive-ui-fixes

# پاک dependabot branches (local)
git branch -D dependabot/github_actions/actions/checkout-6
git branch -D dependabot/github_actions/actions/labeler-6
git branch -D dependabot/github_actions/actions/upload-artifact-5
git branch -D dependabot/github_actions/oven-sh/setup-bun-2
git branch -D dependabot/npm_and_yarn/backend/clerk/backend-2.24.0
git branch -D dependabot/npm_and_yarn/frontend/lucide-react-0.555.0
git branch -D dependabot/npm_and_yarn/frontend/vite-7.2.4
git branch -D dependabot/npm_and_yarn/frontend/vitejs/plugin-react-5.1.1
git branch -D dependabot/npm_and_yarn/frontend/zod-4.1.13

# (اختیاری) پاک backup
git branch -D backup/pre-fixes-20251130-1540
```

### مرحله 3: پاک کردن Remote Branches

```bash
# پاک automated-fixes
git push origin --delete automated-fixes/comprehensive-improvements
git push origin --delete automated-fixes/security-performance-v2

# پاک feature branches
git push origin --delete feature/comprehensive-improvements
git push origin --delete feature/comprehensive-ui-fixes

# پاک dependabot branches (remote)
git push origin --delete dependabot/github_actions/actions/checkout-6
git push origin --delete dependabot/github_actions/actions/labeler-6
git push origin --delete dependabot/github_actions/actions/upload-artifact-5
git push origin --delete dependabot/github_actions/oven-sh/setup-bun-2
git push origin --delete dependabot/npm_and_yarn/backend/clerk/backend-2.24.0
git push origin --delete dependabot/npm_and_yarn/frontend/lucide-react-0.555.0
git push origin --delete dependabot/npm_and_yarn/frontend/vite-7.2.4
git push origin --delete dependabot/npm_and_yarn/frontend/vitejs/plugin-react-5.1.1
git push origin --delete dependabot/npm_and_yarn/frontend/zod-4.1.13

# (اختیاری) پاک backup
git push origin --delete backup/pre-fixes-20251130-1540
```

### مرحله 4: پاکسازی Remote References

```bash
# پاک کردن reference‌های remote branch‌های پاک شده
git fetch --prune

# بررسی branch‌های باقی‌مانده
git branch -a
```

**باید فقط اینها را ببینید:**
```
* main
  remotes/origin/main
```

---

## 🛡️ روش 3: اسکریپت خودکار (آسان‌ترین)

### ساخت فایل cleanup script

```bash
# ساخت فایل cleanup.sh
cat > cleanup-branches.sh << 'EOF'
#!/bin/bash

echo "🧹 شروع پاکسازی branch‌ها..."

# Array of branches to delete
BRANCHES=(
  "automated-fixes/comprehensive-improvements"
  "automated-fixes/security-performance-v2"
  "feature/comprehensive-improvements"
  "feature/comprehensive-ui-fixes"
  "dependabot/github_actions/actions/checkout-6"
  "dependabot/github_actions/actions/labeler-6"
  "dependabot/github_actions/actions/upload-artifact-5"
  "dependabot/github_actions/oven-sh/setup-bun-2"
  "dependabot/npm_and_yarn/backend/clerk/backend-2.24.0"
  "dependabot/npm_and_yarn/frontend/lucide-react-0.555.0"
  "dependabot/npm_and_yarn/frontend/vite-7.2.4"
  "dependabot/npm_and_yarn/frontend/vitejs/plugin-react-5.1.1"
  "dependabot/npm_and_yarn/frontend/zod-4.1.13"
)

# Delete remote branches
echo ""
echo "🌐 پاک کردن remote branches..."
for branch in "${BRANCHES[@]}"; do
  echo "  ❌ $branch"
  git push origin --delete "$branch" 2>/dev/null || echo "    ⚠️  قبلاً پاک شده یا وجود ندارد"
done

# Delete local branches
echo ""
echo "💻 پاک کردن local branches..."
for branch in "${BRANCHES[@]}"; do
  echo "  ❌ $branch"
  git branch -D "$branch" 2>/dev/null || echo "    ⚠️  قبلاً پاک شده یا وجود ندارد"
done

# Cleanup references
echo ""
echo "🧹 پاکسازی remote references..."
git fetch --prune

# Show remaining branches
echo ""
echo "✅ پاکسازی کامل شد!"
echo ""
echo "🎉 Branch‌های باقی‌مانده:"
git branch -a
EOF

chmod +x cleanup-branches.sh
```

### اجرای اسکریپت

```bash
# مطمئن شوید در branch main هستید
git checkout main
git pull origin main

# اجرای اسکریپت
./cleanup-branches.sh
```

---

## ✅ بررسی نهایی

بعد از پاکسازی:

```bash
# بررسی local branches
git branch
# باید فقط نمایش دهد: * main

# بررسی remote branches
git branch -r
# باید فقط نمایش دهد: origin/main

# بررسی تمام branches
git branch -a
# باید فقط نمایش دهد:
#   * main
#     remotes/origin/main
```

### بررسی روی GitHub

1. بروید به: https://github.com/Ya3er02/noghre-sod-ecommerce/branches
2. باید فقط `main` را ببینید

---

## 📊 وضعیت بعد از پاکسازی

```
✅ main - Branch اصلی با تمام بهبودها
```

### مزایای پاکسازی

✅ **سادگی** - فقط یک branch برای کار کردن  
✅ **وضوح** - همیشه می‌دانید جدیدترین کد کجاست  
✅ **تمیزی** - مخزن سازماندهی شده  
✅ **آمادگی** - آماده برای deployment  

---

## 🚀 مراحل بعدی

بعد از پاکسازی branch‌ها:

1. ✅ مخزن تمیز و سازماندهی شده
2. 🔧 بروزرسانی وابستگی‌ها (Tailwind 4.1.17)
3. 🔐 تنظیم GitHub Secrets
4. 🔑 Rotate Clerk API key
5. 🚀 آماده‌سازی برای deployment

---

## ❓ سؤالات متداول

### آیا اطلاعات گم نمی‌شود؟
خیر، تمام بهبودها قبلاً در main merge شده‌اند.

### آیا می‌توانم بعداً branch‌های جدید بسازم؟
بله، برای feature‌های جدید می‌توانید branch‌های جدید بسازید.

### آیا backup branch را باید پاک کنم؟
اختیاری است. اگر می‌خواهید backup نگه دارید، نگه دارید.

### چه می‌شود اگر اشتباهی پاک کنم؟
تمام commit‌ها در main هستند. می‌توانید branch‌ها را دوباره از history بسازید.

---

**تاریخ ایجاد:** 1404/09/10  
**آخرین بروزرسانی:** 1404/09/10  
**مرتبط با Issue:** #14
