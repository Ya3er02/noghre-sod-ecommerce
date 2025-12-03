# 🚀 Deployment Guide - Noghre Sood (نقره سود)

## 🎯 Quick Deploy (VPS)

```bash
# 1. Pull latest changes
cd /path/to/noghre-sod-ecommerce
git pull origin main

# 2. Install dependencies
cd frontend
bun install

# 3. Run VPS deployment script
cd ..
./deploy-vps.sh
```

**Done!** Visit: https://noghresood.shop ✅

---

## 📖 Complete Step-by-Step Guide

### Step 1: Local Testing (RECOMMENDED)

```bash
# Navigate to your repository
cd /path/to/noghre-sod-ecommerce

# Pull latest changes from main
git pull origin main

# Install dependencies
cd frontend
bun install

# Start development server
bun run dev
```

**Visit**: http://localhost:5173

**✅ Verify These**:
- [ ] Brand name shows as "نقره سود" (correct)
- [ ] Vazirmatn font loads correctly
- [ ] LiquidChrome background appears and animates
- [ ] Text is RTL (right-to-left)
- [ ] Animations are smooth
- [ ] Feature cards have glassmorphism effect
- [ ] No console errors
- [ ] All pages load correctly

**If everything looks good → Proceed to Step 2**

---

### Step 2: Build for Production

```bash
# Still in frontend directory
bun run build
```

**Expected Output**:
```
vite v6.2.5 building for production...
✓ built in X seconds
✓ dist/index.html                X kB
✓ dist/assets/index-XXX.js       X kB
✓ dist/assets/index-XXX.css      X kB
```

**✅ Check For**:
- [ ] No build errors
- [ ] Bundle size reasonable (< 500kB recommended)
- [ ] All assets generated in `dist/` folder

**Preview Production Build (Optional)**:
```bash
bun run preview
# Visit http://localhost:4173 to test production build
```

**If build succeeds → Proceed to Step 3**

---

### Step 3: Deploy to VPS

For complete VPS deployment instructions, please refer to [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md).

```bash
# Go back to project root
cd ..

# Run the deployment script
./deploy-vps.sh
```

**During Deployment**:
1. Script will build the frontend
2. Copy files to VPS
3. Restart services
4. Run health checks

**Expected Output**:
```
✓ Build completed successfully
✓ Files uploaded to VPS
✓ Services restarted
✓ Health checks passed
✓ Deployment successful
```

---

### Step 4: Verify Live Site

**Visit**: https://noghresood.shop

**✅ Complete Verification Checklist**:

#### Visual Check
- [ ] Site loads without errors
- [ ] Brand name displays as "نقره سود"
- [ ] Vazirmatn font is rendering properly
- [ ] LiquidChrome background is visible and animating
- [ ] Text direction is RTL
- [ ] Colors match luxury silver theme
- [ ] Feature cards have glassmorphism (frosted glass) effect
- [ ] Shadows and gradients render correctly

#### Functionality Check
- [ ] All pages load (Home, Products, Value, About, Contact, FAQ)
- [ ] Navigation works (header links)
- [ ] Footer links work
- [ ] Buttons are clickable
- [ ] Product cards display correctly
- [ ] Forms are functional
- [ ] Search works (if implemented)

#### Animation Check
- [ ] LiquidChrome responds to mouse movement
- [ ] Buttons have ripple effect on click
- [ ] Cards lift on hover
- [ ] Icon bounce animations work
- [ ] Fade-in animations trigger on scroll
- [ ] Stagger animations on feature cards
- [ ] All animations are smooth (60fps)

#### Responsive Check
- [ ] Desktop (1920x1080) - looks professional
- [ ] Laptop (1366x768) - everything visible
- [ ] Tablet (768x1024) - layout adapts
- [ ] Mobile (375x667) - mobile-friendly
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome

#### Performance Check
- [ ] Page loads in < 3 seconds
- [ ] LiquidChrome doesn't cause lag
- [ ] Images load properly
- [ ] No layout shift
- [ ] Fonts load quickly

**Do Hard Refresh**: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)

---

## ⚠️ Troubleshooting

### Issue: "Build failed"

**Solution**:
1. Check `package.json` for missing dependencies
2. Try local build first: `bun run build`
3. Check build logs for errors
4. Ensure all environment variables are set

### Issue: "LiquidChrome not visible"

**Solution**:
1. Clear browser cache (Ctrl + F5)
2. Check console for errors (F12)
3. Verify `ogl` package is installed:
   ```bash
   cd frontend
   bun add ogl
   ```
4. Rebuild and redeploy

### Issue: "Fonts not loading"

**Solution**:
1. Check internet connection (fonts from Google)
2. Verify preconnect links in `index.html`
3. Check browser console for 404 errors
4. Wait 30 seconds for font to load

### Issue: "Old version still showing"

**Solution**:
1. Hard refresh: Ctrl + F5
2. Clear all browser cache
3. Try incognito/private mode
4. Wait 2-3 minutes for CDN propagation
5. Check deployment actually completed

### Issue: "Animations not working"

**Solution**:
1. Check if `animations.css` imported in `index.css`
2. Verify classes are applied in components
3. Check browser DevTools for CSS conflicts
4. Test on different browser

---

## 📊 Performance Optimization

### After Deployment, Check Lighthouse

1. Open your site: https://noghresood.shop
2. Open Chrome DevTools (F12)
3. Go to "Lighthouse" tab
4. Click "Analyze page load"

**Target Scores**:
- Performance: > 85
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### If Performance < 85:

```bash
# Optimize images
# Use WebP format
# Enable lazy loading
# Consider code splitting
```

---

## 📝 Post-Deployment Checklist

### Immediate (Within 5 minutes)
- [ ] Site is accessible
- [ ] No 404 or 500 errors
- [ ] LiquidChrome effect working
- [ ] Brand name correct
- [ ] Basic navigation works

### Short-term (Within 1 hour)
- [ ] Test all pages
- [ ] Test all forms
- [ ] Check mobile version
- [ ] Verify product pages
- [ ] Test cart functionality

### Long-term (Within 24 hours)
- [ ] Monitor error logs
- [ ] Check analytics (if setup)
- [ ] Get user feedback
- [ ] Monitor performance
- [ ] Check SEO indexing

---

## 🔄 Rollback (If Needed)

If something goes wrong:

```bash
# Revert to previous commit
git log --oneline  # Find previous commit SHA
git revert <commit-sha>
git push origin main
./deploy-vps.sh
```

**Or restore from backup**:
```bash
git checkout <previous-commit-sha>
git push origin main --force
./deploy-vps.sh
```

---

## 🎆 Success!

Once deployed successfully, your site will have:

✅ **Liquid Chrome Effect** - Interactive silver liquid background  
✅ **Correct Branding** - "نقره سود" everywhere  
✅ **Professional Typography** - Vazirmatn font optimized for Persian  
✅ **Luxury Colors** - Silver palette with gold accents  
✅ **Smooth Animations** - 30+ micro-interactions  
✅ **Glassmorphism Design** - Modern frosted glass cards  
✅ **RTL Perfection** - Full right-to-left support  
✅ **Mobile Responsive** - Works beautifully on all devices  

---

## 📞 Support

**VPS Deployment Guide**: [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md)  
**Documentation**: Check README.md and IMPLEMENTATION_SUMMARY.md in repo

---

**Made with ❤️ for Noghre Sood**  
**Last Updated**: December 2025