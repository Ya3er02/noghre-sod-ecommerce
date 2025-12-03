#!/bin/bash

# =============================================================================
# Noghre Sod E-commerce - Quick Cleanup Script
# =============================================================================
# This script automates the cleanup and restructuring process
# WARNING: This will make significant changes to your repository!
# Make sure you have a backup before running this script.
#
# Usage: bash QUICK_CLEANUP_SCRIPT.sh
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "===================================="
echo "  Noghre Sod Cleanup Script"
echo "===================================="
echo -e "${NC}"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not a git repository. Please run this script from the project root."
    exit 1
fi

print_warning "This script will make significant changes to your repository!"
print_warning "Make sure you have a backup before proceeding."
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_info "Cleanup cancelled."
    exit 0
fi

# =============================================================================
# Step 1: Create backup
# =============================================================================
print_info "Step 1: Creating backup..."
BACKUP_DIR="../backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR/"
print_success "Backup created at: $BACKUP_DIR"

# =============================================================================
# Step 2: Create new branch
# =============================================================================
print_info "Step 2: Creating new branch..."
BRANCH_NAME="refactor/auto-cleanup-$(date +%Y%m%d)"
git checkout -b "$BRANCH_NAME"
print_success "Created and switched to branch: $BRANCH_NAME"

# =============================================================================
# Step 3: Remove redundant documentation files
# =============================================================================
print_info "Step 3: Removing redundant documentation files..."

REDUNDANT_FILES=(
    "BRANCH_CLEANUP_GUIDE.md"
    "COMPLETE_REBUILD_GUIDE.md"
    "COMPREHENSIVE_IMPLEMENTATION_GUIDE.md"
    "DEPLOYMENT_GUIDE.md"
    "DEPLOYMENT_README.md"
    "IMPLEMENTATION_SUMMARY.md"
    "PARSPACK_DEPLOYMENT.md"
    "PARSPACK_QUICKSTART.md"
    "QUICK_START.md"
    "SECURITY_INCIDENT_FIX.md"
    "TRACKED_ENV_FILES_CLEANUP.md"
    "VPS_DEPLOYMENT.md"
    "FIXES.md"
    "SETUP.md"
)

for file in "${REDUNDANT_FILES[@]}"; do
    if [ -f "$file" ]; then
        git rm "$file" 2>/dev/null || rm "$file"
        print_success "Removed: $file"
    fi
done

git commit -m "chore: remove redundant documentation files" 2>/dev/null || print_warning "No files to commit"

# =============================================================================
# Step 4: Create new directory structure
# =============================================================================
print_info "Step 4: Creating new directory structure..."

mkdir -p docs/{development,deployment,architecture,security}
mkdir -p scripts/{deployment,database,utils}
mkdir -p config

print_success "Directory structure created"

# =============================================================================
# Step 5: Move files to appropriate locations
# =============================================================================
print_info "Step 5: Moving files to appropriate locations..."

# Move documentation files
[ -f "DEVELOPMENT.md" ] && mv "DEVELOPMENT.md" "docs/development/" && print_success "Moved DEVELOPMENT.md"
[ -f "SECURITY.md" ] && mv "SECURITY.md" "docs/security/" && print_success "Moved SECURITY.md"

# Move configuration files
[ -f "nginx.conf" ] && mv "nginx.conf" "config/" && print_success "Moved nginx.conf"
[ -f "lighthouserc.json" ] && mv "lighthouserc.json" "config/" && print_success "Moved lighthouserc.json"
[ -f "sonar-project.properties" ] && mv "sonar-project.properties" "config/" && print_success "Moved sonar-project.properties"

# Move deployment scripts
[ -f "deploy-vps.sh" ] && mv "deploy-vps.sh" "scripts/deployment/" && print_success "Moved deploy-vps.sh"
[ -f "deploy-parspack.sh" ] && mv "deploy-parspack.sh" "scripts/deployment/" && print_success "Moved deploy-parspack.sh"

# Make scripts executable
chmod +x scripts/deployment/*.sh 2>/dev/null || true

git add .
git commit -m "refactor: reorganize project structure with docs/ scripts/ and config/" 2>/dev/null || print_warning "No changes to commit"

# =============================================================================
# Step 6: Update .gitignore
# =============================================================================
print_info "Step 6: Updating .gitignore..."

cat >> .gitignore << 'EOF'

# ===== Security: Environment Files =====
# NEVER commit these files!
.env
.env.local
.env.*.local
.env.production
.env.staging
*.env

# ===== Sensitive Data =====
secrets/
*.key
*.pem
*.cert
*.crt

# ===== OS Files =====
.DS_Store
.DS_Store?
Thumbs.db
ehthumbs.db
Desktop.ini

# ===== IDE =====
.vscode/
.idea/
*.swp
*.swo
*~
*.sublime-*

# ===== Logs =====
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# ===== Build Outputs =====
dist/
build/
.next/
out/
.nuxt/
.cache/
.parcel-cache/
.vite-inspect/

# ===== Dependencies =====
node_modules/
jspm_packages/

# ===== Temporary Files =====
*.tmp
*.temp
.tmp/
.temp/

# ===== Database =====
*.db
*.sqlite
*.sqlite3

# ===== Coverage =====
coverage/
*.lcov
.nyc_output/

# ===== Backups =====
backup*/
*.backup
*.bak
EOF

git add .gitignore
git commit -m "security: enhance .gitignore to prevent sensitive files" 2>/dev/null || print_warning "No changes to commit"

print_success "Updated .gitignore"

# =============================================================================
# Step 7: Create documentation index
# =============================================================================
print_info "Step 7: Creating documentation index..."

cat > docs/README.md << 'EOF'
# 📚 Documentation

Welcome to Noghre Sod E-commerce documentation.

## 📑 Table of Contents

### Development
- [Setup Guide](development/SETUP.md) - Getting started
- [Development Guide](development/DEVELOPMENT.md) - Development workflow
- [Contributing Guide](development/CONTRIBUTING.md) - How to contribute

### Deployment
- [Deployment Overview](deployment/README.md) - Deployment options
- [Docker Deployment](deployment/DOCKER.md) - Using Docker
- [VPS Deployment](deployment/VPS.md) - Deploy to VPS
- [Parspack Deployment](deployment/PARSPACK.md) - Deploy to Parspack

### Architecture
- [System Overview](architecture/OVERVIEW.md) - High-level architecture
- [Backend Architecture](architecture/BACKEND.md) - Backend design
- [Frontend Architecture](architecture/FRONTEND.md) - Frontend design

### Security
- [Security Policy](security/SECURITY.md) - Security guidelines
- [Best Practices](security/BEST_PRACTICES.md) - Security best practices

## 🔗 Quick Links

- [Main README](../README.md)
- [Changelog](../CHANGELOG.md)
- [License](../LICENSE)

## 📝 Notes

This documentation is continuously updated. If you find any issues or have suggestions, please [create an issue](https://github.com/Ya3er02/noghre-sod-ecommerce/issues).
EOF

git add docs/README.md
git commit -m "docs: add documentation index" 2>/dev/null || print_warning "No changes to commit"

print_success "Documentation index created"

# =============================================================================
# Step 8: Summary
# =============================================================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Cleanup Completed Successfully!        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

print_info "Summary of changes:"
echo "  ✓ Backup created at: $BACKUP_DIR"
echo "  ✓ New branch created: $BRANCH_NAME"
echo "  ✓ Redundant files removed: ${#REDUNDANT_FILES[@]}"
echo "  ✓ New structure created: docs/ scripts/ config/"
echo "  ✓ .gitignore updated"
echo "  ✓ Documentation index created"
echo ""

print_warning "Next steps:"
echo "  1. Review changes: git log --oneline -10"
echo "  2. Test the application: cd frontend && npm run dev"
echo "  3. Push to remote: git push origin $BRANCH_NAME"
echo "  4. Create Pull Request on GitHub"
echo ""

print_warning "IMPORTANT: .env.production security issue"
echo "  The .env.production file is still in the repository."
echo "  Please follow the instructions in PROJECT_CLEANUP_PLAN.md"
echo "  to remove it from git history and rotate all secrets!"
echo ""

print_info "For detailed instructions, see: PROJECT_CLEANUP_PLAN.md"
print_success "Script completed successfully!"
