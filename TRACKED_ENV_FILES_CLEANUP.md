# 🔧 Removing Tracked Environment Files from Git

**Status**: Action Required  
**Severity**: 🔴 CRITICAL  
**Last Updated**: December 2, 2025

---

## 🔍 Problem Statement

The following environment files are currently **tracked by git** but should NOT be committed:

| File | Status | Impact |
|------|--------|--------|
| `frontend/.env.production` | ❌ TRACKED | Exposes frontend configuration and API endpoints |
| `backend/.env.production` | ❌ TRACKED | (Check if present) Exposes backend secrets |
| `.env.production` | ❌ TRACKED | Exposes database passwords and API keys |

While `.gitignore` now contains patterns to prevent FUTURE commits, these files remain in the git history and must be explicitly removed.

---

## ✅ Solution: Remove Files from Git Tracking

Use `git rm --cached` to remove files from tracking while preserving them locally.

### Step 1: Clone Fresh Repository (Recommended)

```bash
# Clone the repository with the latest security fix
git clone https://github.com/Ya3er02/noghre-sod-ecommerce.git
cd noghre-sod-ecommerce

# Switch to security branch to see all changes
git checkout security/fix-exposed-env-production
```

### Step 2: Remove Tracked Environment Files

```bash
# Remove frontend/.env.production from git tracking
git rm --cached frontend/.env.production

# Remove any other tracked .env files
git rm --cached backend/.env.production 2>/dev/null || true
git rm --cached .env.production 2>/dev/null || true
git rm --cached .env 2>/dev/null || true

# Verify files are still in working directory (not deleted locally)
ls -la frontend/.env.production  # Should exist
ls -la .env.production            # May not exist
```

### Step 3: Commit the Removal

```bash
git commit -m "security: Remove tracked environment files from git

Remove the following files from git tracking while preserving
them locally for development:

- frontend/.env.production
- Any .env files accidentally tracked

These files are now in .gitignore and will not be committed
in the future. Use .env.example files as templates."
```

### Step 4: Push Changes

```bash
# Push to the security branch (or main if already merged)
git push origin security/fix-exposed-env-production

# Or if merged to main
git push origin main
```

---

## 🗑️ Complete Cleanup Script

You can use this bash script to automate the entire cleanup:

```bash
#!/bin/bash

echo "🔧 Removing tracked environment files..."
echo ""

# List of environment files to remove
ENV_FILES=(
    "frontend/.env.production"
    "backend/.env.production"
    ".env.production"
    ".env"
    ".env.local"
    "backend/.env"
    "frontend/.env"
)

FOUND_FILES=0

# Check and remove each file
for file in "${ENV_FILES[@]}"; do
    if git ls-files --error-unmatch "$file" 2>/dev/null; then
        echo "✅ Removing: $file"
        git rm --cached "$file" 2>/dev/null || true
        FOUND_FILES=$((FOUND_FILES + 1))
    fi
done

if [ $FOUND_FILES -gt 0 ]; then
    echo ""
    echo "📝 Committing removal of $FOUND_FILES environment file(s)..."
    git commit -m "security: Remove tracked environment files from git

Remove $FOUND_FILES environment file(s) from git tracking.
These files will no longer appear in repository history.

Files are preserved locally and .gitignore prevents future commits."
    echo ""
    echo "✅ Removal complete! Ready to push."
    echo ""
    echo "To push to remote:"
    echo "  git push origin <branch-name>"
else
    echo ""
    echo "✅ No tracked environment files found."
fi
```

Save as `cleanup-env-files.sh` and run:

```bash
bash cleanup-env-files.sh
```

---

## 🛡️ Verification Checklist

After removing tracked files:

- [ ] `frontend/.env.production` removed from git tracking
- [ ] File still exists in working directory: `ls frontend/.env.production`
- [ ] File is in .gitignore: `grep -n 'env.production' .gitignore`
- [ ] `frontend/.env.example` exists with template values
- [ ] Commit created: `git log --oneline -1`
- [ ] Changes ready to push: `git status`
- [ ] GitHub Actions security workflow passes
- [ ] No new .env files will be tracked going forward

---

## 🔍 Verification Commands

### Check for tracked environment files

```bash
# List all tracked .env files
git ls-files | grep -E '\.(env|env\..*)

# Count tracked environment files
git ls-files | grep -E '\.(env|env\..*)' | wc -l

# Show git history for a specific file
git log --oneline frontend/.env.production
```

### Verify .gitignore patterns

```bash
# Check if patterns are in gitignore
grep 'env\.production' .gitignore
grep 'env\.production' frontend/.gitignore

# Test if file would be ignored (after removal)
echo 'frontend/.env.production' > test_ignore.txt
git check-ignore -v test_ignore.txt
rm test_ignore.txt
```

---

## 📋 What This Does NOT Do

❌ Remove files from git HISTORY  
❌ Clean past commits containing .env files  
❌ Use git-filter-repo or BFG  

For complete removal from history, see **SECURITY_INCIDENT_FIX.md** for git-filter-repo instructions.

---

## ⚠️ Common Issues

### Issue: "File not found" error

```bash
# Solution: File may not exist in current branch
git ls-files | grep 'env.production'
# Check if it exists first
```

### Issue: File is deleted from working directory

```bash
# Solution: Check it back out
git checkout HEAD -- frontend/.env.production
# Then git rm --cached
git rm --cached frontend/.env.production
```

### Issue: Still appears after commit

```bash
# Verify removal
git ls-files | grep '.env.production'
# Should return nothing
```

---

## 🔗 Related Documentation

- **SECURITY_INCIDENT_FIX.md** - Complete incident response guide
- **.gitignore** - Updated root .gitignore with all patterns
- **frontend/.gitignore** - Frontend-specific environment patterns
- **.github/workflows/security-check.yml** - CI workflow to prevent future incidents

---

## 📞 Questions?

If you're unsure about any step:

1. Check git status: `git status`
2. Review changes: `git diff --cached`
3. Test removal: `git rm --cached --dry-run frontend/.env.production`
4. See git documentation: `git rm --help`

---

**Next Step**: After removing tracked files, use git-filter-repo to completely purge from history (see SECURITY_INCIDENT_FIX.md).
