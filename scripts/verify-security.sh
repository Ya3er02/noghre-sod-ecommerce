#!/bin/bash

echo "🔍 Security Verification Script"
echo "================================"

# Check for exposed secrets in Git history
echo ""
echo "1️⃣ Checking for exposed secrets in Git history..."
if git log --all --full-history -- .env.production | grep -q "commit"; then
    echo "❌ CRITICAL: .env.production found in Git history!"
    echo "   Run the git filter-branch command to remove it."
else
    echo "✅ No .env.production in Git history"
fi

# Check current working directory
echo ""
echo "2️⃣ Checking for untracked secret files..."
if [ -f ".env.production" ]; then
    if git ls-files --error-unmatch .env.production 2>/dev/null; then
        echo "❌ CRITICAL: .env.production is tracked by Git!"
    else
        echo "⚠️  WARNING: .env.production exists but not tracked (OK if local only)"
    fi
else
    echo "✅ No .env.production in working directory"
fi

# Check for other potential secret files
echo ""
echo "3️⃣ Checking for other secret files..."
SECRET_FILES=(
    ".env"
    ".env.local"
    ".env.staging"
    "backend/.env"
    "frontend/.env"
    "frontend/.env.local"
)

for file in "${SECRET_FILES[@]}"; do
    if [ -f "$file" ] && git ls-files --error-unmatch "$file" 2>/dev/null; then
        echo "❌ WARNING: $file is tracked by Git!"
    fi
done

echo ""
echo "4️⃣ Verifying .gitignore coverage..."
if grep -q "^\.env\.production$" .gitignore; then
    echo "✅ .env.production is in .gitignore"
else
    echo "❌ .env.production is NOT in .gitignore!"
fi

echo ""
echo "================================"
echo "Security check complete!"
