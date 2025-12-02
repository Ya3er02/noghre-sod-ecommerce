#!/bin/bash

# ============================================
# Health Check Script for Noghre Sod
# ============================================
# Run this script to verify all services are running correctly

SERVER_IP="193.242.125.25"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================================"
echo "  Noghre Sod - Health Check"
echo "  Server: $SERVER_IP"
echo "================================================"
echo ""

# Check if running from correct directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}✗ Error: docker-compose.yml not found${NC}"
    echo "Please run this script from /opt/noghre-sod-ecommerce directory"
    exit 1
fi

# Function to check a service
check_service() {
    local name=$1
    local command=$2
    local expected=$3
    
    echo -n "Checking $name... "
    if eval $command > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

FAILURES=0

# Check Docker
echo "--- Docker Services ---"
check_service "Docker daemon" "docker info" || ((FAILURES++))
check_service "Docker Compose" "docker-compose --version" || ((FAILURES++))

echo ""
echo "--- Application Containers ---"
check_service "Backend container" "docker-compose ps backend | grep -q Up" || ((FAILURES++))
check_service "PostgreSQL container" "docker-compose ps postgres | grep -q Up" || ((FAILURES++))
check_service "Redis container" "docker-compose ps redis | grep -q Up" || ((FAILURES++))

echo ""
echo "--- Network Connectivity ---"
check_service "Frontend (HTTP)" "curl -sf http://localhost > /dev/null" || ((FAILURES++))
check_service "Backend API" "curl -sf http://localhost/api/health > /dev/null" || ((FAILURES++))
check_service "External access (Frontend)" "curl -sf http://$SERVER_IP > /dev/null" || ((FAILURES++))

echo ""
echo "--- Database Health ---"
check_service "PostgreSQL ready" "docker-compose exec -T postgres pg_isready -U noghre_user" || ((FAILURES++))

echo ""
echo "--- Web Server ---"
check_service "Nginx running" "systemctl is-active nginx" || ((FAILURES++))
check_service "Nginx config valid" "nginx -t" || ((FAILURES++))

echo ""
echo "--- Firewall ---"
check_service "UFW enabled" "ufw status | grep -q active" || ((FAILURES++))

echo ""
echo "--- Disk Space ---"
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
echo -n "Disk usage: "
if [ $DISK_USAGE -lt 80 ]; then
    echo -e "${GREEN}${DISK_USAGE}% ✓ OK${NC}"
else
    echo -e "${YELLOW}${DISK_USAGE}% ⚠ Warning${NC}"
fi

echo ""
echo "--- Memory Usage ---"
MEM_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3*100/$2 }')
echo -n "Memory usage: "
if [ $MEM_USAGE -lt 90 ]; then
    echo -e "${GREEN}${MEM_USAGE}% ✓ OK${NC}"
else
    echo -e "${YELLOW}${MEM_USAGE}% ⚠ Warning${NC}"
fi

echo ""
echo "================================================"
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}All checks passed! ✓${NC}"
    echo "Your application is running correctly."
    exit 0
else
    echo -e "${RED}$FAILURES checks failed! ✗${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check logs: docker-compose logs -f"
    echo "  2. Restart services: docker-compose restart"
    echo "  3. See documentation: PARSPACK_DEPLOYMENT.md"
    exit 1
fi