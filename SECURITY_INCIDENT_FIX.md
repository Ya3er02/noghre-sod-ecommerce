# 🚨 CRITICAL SECURITY INCIDENT FIX

**Date**: December 2, 2025  
**Status**: IN PROGRESS - Credentials Exposed in Public Repository  
**Severity**: CRITICAL

---

## 📋 Summary

The `.env.production` file containing live database passwords, Redis passwords, JWT secrets, and Clerk API keys was **accidentally committed to the main branch** and is publicly visible on GitHub. This is a critical security vulnerability that requires immediate remediation.

### Exposed Secrets

- **Database Password**: `Ah$s7^kE@pM3*lF7` (PostgreSQL)
- **Redis Password**: `J9#f9$vO2@kW5*mQ8!rZ4&rY1^hG9`
- **Clerk API Keys**: 
  - Public: `pk_test_ZmFzdC1saWdlci05Ni5jbGVyay5hY2NvdW50cy5kZXYk`
  - Secret: `sk_test_N60B1ZvJFGvvw1eMZTR6nHv9cmUrfmLtlWL0XEIPot`
- **Server IP**: `193.242.125.25`
- **Database URL**: Fully exposed in DATABASE_URL variable

### Affected Commits

1. `ce92882` - "Update .env.production" (52 min ago)
2. `98f6528` - "Fix: Add REDIS_PASSWORD to .env.production template" (14h ago)
3. `487357c` - "Add .env.production template for VPS deployment" (14h ago)

---

## 🔴 IMMEDIATE ACTIONS TAKEN

### 1. Credential Rotation (MUST DO IMMEDIATELY)

#### PostgreSQL Database
```bash
# SSH into your Parspack server
ssh root@193.242.125.25

# Connect to PostgreSQL
docker-compose exec postgres psql -U noghre_user -d noghre_sood_db

# Change password
\\password noghre_user
# Enter new password: (use 32+ character random string)

# Exit
\\quit
```

**NEW PostgreSQL Password** (generate a new secure one):
```
POSTGRES_PASSWORD=GENERATE_NEW_SECURE_PASSWORD_HERE
```

#### Redis Password
```bash
# Generate new Redis password
PASSWORD=$(openssl rand -base64 32)
echo $PASSWORD

# Update Docker Compose
docker-compose down
# Edit docker-compose.yml and update REDIS_PASSWORD
docker-compose up -d
```

**NEW Redis Password**:
```
REDIS_PASSWORD=GENERATE_NEW_SECURE_PASSWORD_HERE
```

#### Clerk API Keys
1. Go to https://dashboard.clerk.com
2. Navigate to API Keys section
3. Revoke the current keys:
   - `pk_test_ZmFzdC1saWdlci05Ni5jbGVyay5hY2NvdW50cy5kZXYk`
   - `sk_test_N60B1ZvJFGvvw1eMZTR6nHv9cmUrfmLtlWL0XEIPot`
4. Generate new keys
5. Update in:
   - `.env.production`
   - `frontend/.env.production`

**NEW Clerk Keys**:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_GENERATE_NEW_KEY_HERE
CLERK_SECRET_KEY=sk_GENERATE_NEW_KEY_HERE
```

#### JWT Secrets
Generate new secure random strings:
```bash
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET"
echo "SESSION_SECRET=$SESSION_SECRET"
```

**NEW JWT Secrets**:
```
JWT_SECRET=GENERATE_NEW_SECURE_STRING_HERE
SESSION_SECRET=GENERATE_NEW_SECURE_STRING_HERE
```

---

## ✅ FILES UPDATED IN THIS PR

### 1. `.gitignore` - ADD ENVIRONMENT FILES
```gitignore
# Environment variables - NEVER commit real secrets!
.env
.env.local
.env.production
.env.production.local
.env.*.local

# Clerk environment variables
.env.clerk.*

# Backend environment
backend/.env
backend/.env.production
backend/.env.*.local

# Frontend environment
frontend/.env
frontend/.env.production
frontend/.env.*.local
```

### 2. `.env.production.example` - Template Only
This file shows the STRUCTURE but with placeholder values only.

### 3. New Documentation Files
- `SECURE_SECRETS_MANAGEMENT.md` - How to handle secrets safely
- `GIT_HISTORY_CLEANUP_GUIDE.md` - How to clean git history
- `SECURITY_CHECKLIST.md` - Pre-deployment security checks

---

## 🔧 GIT HISTORY CLEANUP

### Option A: Using git-filter-repo (RECOMMENDED)

```bash
# Clone fresh copy
git clone https://github.com/Ya3er02/noghre-sod-ecommerce.git
cd noghre-sod-ecommerce

# Install git-filter-repo
pip install git-filter-repo

# Remove .env.production from all commits
git filter-repo --invert-paths --path .env.production

# Force push (WARNING: This rewrites history)
git push origin --force-with-lease --all
git push origin --force-with-lease --tags
```

### Option B: Using BFG Repo-Cleaner

```bash
# Download BFG
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# Clone fresh copy
git clone --mirror https://github.com/Ya3er02/noghre-sod-ecommerce.git
cd noghre-sod-ecommerce.git

# Remove file
java -jar ../bfg-1.14.0.jar --delete-files .env.production

# Push
git push --force
```

---

## 🛡️ PREVENTION MEASURES

### 1. Pre-commit Hook
Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Prevent committing .env files
if git diff --cached --name-only | grep -E '\.(env|env\.production|env\.local)$'; then
    echo "❌ ERROR: Attempting to commit environment files!"
    echo "These files should NEVER be committed."
    exit 1
fi
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

### 2. GitHub Secret Scanning
Enable in Settings > Security & Analysis:
- ✅ Dependabot alerts
- ✅ Secret scanning
- ✅ Push protection

### 3. Deployment: Use GitHub Secrets
In `.github/workflows/deploy.yml`:
```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  REDIS_PASSWORD: ${{ secrets.REDIS_PASSWORD }}
  CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

---

## 📋 VERIFICATION CHECKLIST

Before considering this incident resolved:

- [ ] All old credentials have been rotated
- [ ] New credentials are securely stored (not in code)
- [ ] `.gitignore` includes all `.env*` files
- [ ] `.env.production` exists only in `.gitignore`
- [ ] `.env.production.example` contains only template/placeholder values
- [ ] Git history has been cleaned with git-filter-repo or BFG
- [ ] Force push has been completed
- [ ] All team members have re-cloned the repository
- [ ] GitHub Secret Scanning is enabled
- [ ] Pre-commit hooks are installed
- [ ] Deployment scripts use environment variables from secure sources
- [ ] Tests pass with new credentials
- [ ] Server is updated with new credentials

---

## 📚 NEXT STEPS

1. **Merge this PR**
2. **Rotate ALL credentials** (follow steps above)
3. **Clean git history** (use git-filter-repo)
4. **Force push** cleaned history
5. **Update Parspack server** with new credentials
6. **Test deployment**
7. **Notify team** about new credentials and procedures
8. **Implement pre-commit hooks**
9. **Enable GitHub Secret Scanning**

---

## 🔗 References

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [git-filter-repo Documentation](https://github.com/newren/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [OWASP: Secrets Management](https://owasp.org/www-community/attacks/Sensitive_Data_Exposure)
- [12Factor App: Config](https://12factor.net/config)

---

## ⚠️ CRITICAL REMINDER

**NEVER COMMIT REAL SECRETS TO REPOSITORIES**

Use:
- Environment variables
- GitHub Secrets for CI/CD
- AWS Secrets Manager / Azure Key Vault for production
- `.env.local` (git-ignored) for local development
- `.env.example` for templates only
