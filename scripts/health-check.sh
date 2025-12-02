#!/bin/bash

# Health Check Script for Noghre Sod E-Commerce Services
# This script verifies that all critical services are running properly

set -e

# Configuration
MAX_RETRIES=5
RETRY_DELAY=2
TIMEOUT=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function: check_service
# Arguments:
#   $1: service name (for logging)
#   $2: command to run for health check
check_service() {
    local name="$1"
    local command="$2"
    local retries=0
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if eval "$command" &>/dev/null; then
            echo -e "${GREEN}✓${NC} $name is healthy"
            return 0
        fi
        
        retries=$((retries + 1))
        if [ $retries -lt $MAX_RETRIES ]; then
            echo -e "${YELLOW}⚠${NC} $name check failed (attempt $retries/$MAX_RETRIES), retrying..."
            sleep $RETRY_DELAY
        fi
    done
    
    echo -e "${RED}✗${NC} $name failed health check"
    return 1
}

# Run health checks
echo "Running health checks for Noghre Sod E-Commerce..."
echo ""

ALL_HEALTHY=true

# Check database
echo "Checking Database..."
if ! check_service "PostgreSQL Database" "docker exec noghre-sod-postgres pg_isready -h localhost -U noghre_user"; then
    ALL_HEALTHY=false
fi

# Check Redis
echo ""
echo "Checking Cache..."
if ! check_service "Redis Cache" "docker exec noghre-sod-redis redis-cli ping | grep -q PONG"; then
    ALL_HEALTHY=false
fi

# Check Backend API
echo ""
echo "Checking Backend API..."
if ! check_service "Backend API" "curl -s http://localhost:4000/health | grep -q 'ok'"; then
    ALL_HEALTHY=false
fi

# Check Frontend
echo ""
echo "Checking Frontend..."
if ! check_service "Frontend" "curl -s http://localhost | head -1 | grep -q '<!DOCTYPE\|<html'"; then
    ALL_HEALTHY=false
fi

echo ""
echo "========================================"

if [ "$ALL_HEALTHY" = true ]; then
    echo -e "${GREEN}All services are healthy!${NC}"
    exit 0
else
    echo -e "${RED}Some services failed health checks!${NC}"
    exit 1
fi
