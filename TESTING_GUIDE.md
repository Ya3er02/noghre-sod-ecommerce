# Testing Guide for Error Fixes

## Prerequisites

```bash
cd backend
bun install
enccore run
```

## API Endpoint Tests

### 1. Product Module Tests

#### List Products with Filters
```bash
# Basic list
curl http://localhost:4000/products

# With filters
curl 'http://localhost:4000/products?categories=gold,silver&minPrice=100&maxPrice=500&page=1&limit=10'

# Expected Response:
{
  "products": [...],
  "totalCount": 25,
  "totalPages": 3,
  "currentPage": 1
}
```

#### Get Single Product
```bash
curl http://localhost:4000/products/{productId}

# Expected Response:
{
  "id": "...",
  "name": "Gold Ring",
  "price": 500,
  ...
}
```

#### Get Featured Products
```bash
curl 'http://localhost:4000/products/featured?limit=8'

# Expected Response:
{
  "products": [...],
  "count": 8
}
```

#### Get Related Products
```bash
curl 'http://localhost:4000/products/{productId}/related?limit=4'

# Expected Response:
{
  "products": [...],
  "count": 4
}
```

#### Search Products
```bash
curl 'http://localhost:4000/products/search?query=gold'

# Expected Response:
{
  "products": [...],
  "count": 5
}
```

#### Get Categories
```bash
curl http://localhost:4000/products/categories/list

# Expected Response:
{
  "categories": [
    { "name": "Gold", "count": 15 },
    { "name": "Silver", "count": 10 }
  ],
  "total": 2
}
```

#### Create Product (Requires Auth)
```bash
curl -X POST http://localhost:4000/products/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gold Ring",
    "description": "Luxury ring",
    "price": 500,
    "weight": 10,
    "purity": "925",
    "serialNumber": "GR-001",
    "category": "Gold",
    "images": ["url1", "url2"],
    "inStock": true,
    "isNew": true,
    "isFeatured": false
  }'

# Expected Response: 201 Created
{
  "id": "new-id",
  "name": "Gold Ring",
  ...
}
```

#### Update Product (Requires Auth)
```bash
curl -X PUT http://localhost:4000/products/{productId}/update \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "{productId}",
    "name": "Updated Gold Ring",
    "price": 550
  }'

# Expected Response: 200 OK
{
  "id": "{productId}",
  "name": "Updated Gold Ring",
  "price": 550,
  ...
}
```

### 2. Buyback Module Tests

#### Create Buyback Request (Requires Auth)
```bash
curl -X POST http://localhost:4000/buyback/requests/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "productId": "product-456",
    "quantity": 1,
    "description": "Selling used gold ring",
    "images": ["photo1.jpg"]
  }'

# Expected Response: 201 Created
{
  "id": "buyback-789",
  "userId": "user-123",
  "status": "pending",
  ...
}
```

#### List Buyback Requests (Admin)
```bash
curl http://localhost:4000/buyback/requests \
  -H "Authorization: Bearer {adminToken}"

# Expected Response:
{
  "requests": [...],
  "total": 10,
  "page": 1,
  "limit": 10
}
```

#### Get User's Buyback Requests
```bash
curl http://localhost:4000/buyback/user-requests/{userId} \
  -H "Authorization: Bearer {token}"

# Expected Response:
{
  "requests": [...],
  "count": 3
}
```

#### Get Specific Buyback Request
```bash
curl http://localhost:4000/buyback/requests/{requestId} \
  -H "Authorization: Bearer {token}"

# Expected Response:
{
  "id": "buyback-789",
  "userId": "user-123",
  "status": "pending",
  ...
}
```

#### Approve Buyback Request
```bash
curl -X PUT http://localhost:4000/buyback/requests/{requestId}/approve \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "{requestId}",
    "estimatedPrice": 450
  }'

# Expected Response:
{
  "id": "buyback-789",
  "status": "approved",
  "estimatedPrice": 450,
  ...
}
```

#### Reject Buyback Request
```bash
curl -X PUT http://localhost:4000/buyback/requests/{requestId}/reject \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "{requestId}"
  }'

# Expected Response:
{
  "id": "buyback-789",
  "status": "rejected",
  ...
}
```

## Error Cases to Test

### Invalid Query Parameters
```bash
# Should clamp to valid range
curl 'http://localhost:4000/products?page=abc&limit=-5'

# Should clamp limit to max (100)
curl 'http://localhost:4000/products?limit=999999'
```

### Missing Required Parameters
```bash
# Should return 400 Bad Request
curl -X POST http://localhost:4000/products/create \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Authentication Errors
```bash
# Should return 401 Unauthorized
curl -X POST http://localhost:4000/products/create \
  -H "Content-Type: application/json" \
  -d '{...}'
  # Missing Authorization header
```

### Resource Not Found
```bash
# Should return 404 Not Found
curl http://localhost:4000/products/invalid-id
```

### Database Errors
```bash
# Should return 400 Bad Request for constraint violation
curl -X POST http://localhost:4000/products/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate Ring",
    "price": 500,
    "serialNumber": "GR-001"  # If this already exists
  }'
```

## Sanitization Tests

### Apostrophe Preservation
```bash
# Test that apostrophes are preserved
curl 'http://localhost:4000/products/create' \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Women's Ring",  # Should preserve apostrophe
    "description": "Don't miss this!",  # Should preserve apostrophe
    "price": 500
  }'
```

### HTML Tag Removal
```bash
# Test that HTML tags are removed
curl 'http://localhost:4000/products/create' \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ring <script>alert(1)</script>",  # Script tags removed
    "description": "<b>Bold</b> text",  # HTML tags removed
    "price": 500
  }'
```

## Automated Testing (BDD)

```bash
# Run test suite
bun run test

# Run with coverage
bun run test --coverage

# Watch mode
bun run test --watch
```

## Performance Testing

```bash
# Load test with Apache Bench
ab -n 1000 -c 10 http://localhost:4000/products

# Or with wrk
wrk -t4 -c100 -d30s http://localhost:4000/products
```

## Database Verification

```bash
# Check product count
psql -U postgres -d noghre_sod -c "SELECT COUNT(*) FROM products;"

# Check buyback requests
psql -U postgres -d noghre_sod -c "SELECT * FROM buyback_requests;"

# Check for data integrity
psql -U postgres -d noghre_sod -c "SELECT name FROM products WHERE name LIKE '%<script>%';"
```

## Checklist

- [ ] All endpoints respond correctly
- [ ] Filtering works as expected
- [ ] Pagination is accurate
- [ ] Authentication is required where specified
- [ ] Error responses are proper HTTP status codes
- [ ] Response schemas match documentation
- [ ] Database transactions complete successfully
- [ ] Sanitization preserves legitimate characters
- [ ] HTML tags are properly removed
- [ ] No console errors or warnings
- [ ] Performance is acceptable (< 200ms per request)
- [ ] Errors include helpful context messages
- [ ] Query parameters are properly validated
- [ ] Large limit values are clamped to safe max
