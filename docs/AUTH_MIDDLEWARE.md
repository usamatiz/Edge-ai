# 🔐 Authentication Middleware Documentation

## Overview

The new authentication middleware system provides comprehensive security for all `/api/auth/*` routes with centralized rate limiting, CSRF protection, input sanitization, and authentication validation.

## 🏗️ Architecture

### Middleware Flow

```
Request → Main Middleware → Auth Middleware → Route Handler
                ↓
        Security Headers ← Response
```

### Components

1. **Main Middleware** (`src/middleware.ts`)
   - Routes auth requests to auth middleware
   - Handles non-auth routes with general security
   - Adds security headers to all responses

2. **Auth Middleware** (`src/lib/auth-middleware.ts`)
   - Specialized middleware for `/api/auth/*` routes
   - Rate limiting per endpoint type
   - CSRF protection
   - Authentication validation
   - Input sanitization

3. **Rate Limiting** (`src/lib/rate-limit-middleware.ts`)
   - Endpoint-specific rate limiting
   - In-memory storage (production: use Redis)
   - Configurable limits per route type

## 🛡️ Security Features

### 1. Rate Limiting

| Endpoint Type | Limit | Window | Key |
|---------------|-------|--------|-----|
| Login | 5 attempts | 15 minutes | `login:{ip}` |
| Register | 3 attempts | 1 hour | `register:{ip}` |
| Password Reset | 3 attempts | 1 hour | `password_reset:{ip}` |
| Email Verification | 5 attempts | 1 hour | `email_verification:{ip}` |
| General Auth | 60 requests | 1 minute | `auth_general:{ip}` |

### 2. CSRF Protection

- **Applies to:** All non-GET requests on protected routes
- **Excludes:** Public auth endpoints (login, register, etc.)
- **Header:** `x-csrf-token`
- **Validation:** One-time use tokens with 24-hour expiry

### 3. Authentication Validation

- **Protected Routes:** `/api/auth/me`, `/api/auth/profile`, `/api/auth/logout`, `/api/auth/create-video/*`
- **Header:** `Authorization: Bearer {token}`
- **Validation:** Token verification via AuthService

### 4. Input Sanitization

- **Applies to:** POST/PUT/PATCH requests
- **Fields sanitized:**
  - Email addresses
  - Names (first/last)
  - Phone numbers
  - Text fields
- **Preserved:** Passwords (not sanitized to avoid breaking special characters)

## 📋 Route Categories

### Public Routes (No Auth Required)
```
/api/auth/login
/api/auth/register
/api/auth/forgot-password
/api/auth/reset-password
/api/auth/verify-email
/api/auth/resend-verification
/api/auth/check-email
/api/auth/check-email-verification
/api/auth/validate-token
/api/auth/google
/api/auth/csrf-token
```

### Protected Routes (Auth Required)
```
/api/auth/me
/api/auth/profile
/api/auth/logout
/api/auth/clear-expired-tokens
```

### Video Routes (Auth Required)
```
/api/auth/create-video
/api/auth/create-video/generate-video
/api/auth/create-video/status
```

## 🔧 Implementation

### 1. Route Updates

Remove individual rate limiting from auth routes:

```typescript
// Before
import { createRateLimitMiddleware, rateLimitConfigs } from '@/lib/rate-limit-middleware';
const rateLimitMiddleware = createRateLimitMiddleware(rateLimitConfigs.login);

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  // ... rest of handler
}

// After
export async function POST(request: NextRequest) {
  // Rate limiting handled by middleware
  // ... rest of handler
}
```

### 2. Client-Side CSRF Token

For protected routes, include CSRF token in headers:

```typescript
// Get CSRF token
const csrfResponse = await fetch('/api/auth/csrf-token');
const { token } = await csrfResponse.json();

// Use in requests
const response = await fetch('/api/auth/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    'x-csrf-token': token
  },
  body: JSON.stringify(profileData)
});
```

### 3. Error Handling

The middleware returns standardized error responses:

```typescript
// Rate limit exceeded
{
  success: false,
  message: 'Rate limit exceeded. Please try again later.',
  data: {
    remainingAttempts: 0,
    resetTime: 1234567890
  }
}

// Authentication required
{
  success: false,
  message: 'Access token is required'
}

// Invalid token
{
  success: false,
  message: 'Invalid or expired access token'
}

// CSRF validation failed
{
  success: false,
  message: 'CSRF token validation failed'
}
```

## 🚀 Production Considerations

### 1. Rate Limiting Storage

Replace in-memory storage with Redis:

```typescript
// In rate-limit-middleware.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Replace Map with Redis operations
async function getRateLimitData(key: string) {
  return await redis.get(key);
}

async function setRateLimitData(key: string, data: any, ttl: number) {
  await redis.setex(key, ttl, JSON.stringify(data));
}
```

### 2. CSRF Token Storage

Use Redis for CSRF token storage:

```typescript
// In csrf-middleware.ts
const redis = new Redis(process.env.REDIS_URL);

static async generateToken(): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + this.TOKEN_EXPIRY;
  
  await redis.setex(`csrf:${token}`, 24 * 60 * 60, JSON.stringify({ expires }));
  return token;
}
```

### 3. Logging and Monitoring

Add comprehensive logging:

```typescript
// In auth-middleware.ts
import { logger } from '@/lib/logger';

console.log(`🔐 Auth Middleware: Processing ${request.method} ${pathname}`);
// Replace with:
logger.info('Auth middleware processing', {
  method: request.method,
  pathname,
  ip: request.headers.get('x-forwarded-for'),
  userAgent: request.headers.get('user-agent')
});
```

## 🧪 Testing

### 1. Rate Limiting Tests

```typescript
describe('Auth Middleware Rate Limiting', () => {
  it('should rate limit login attempts', async () => {
    for (let i = 0; i < 6; i++) {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      });
      
      if (i === 5) {
        expect(response.status).toBe(429);
      }
    }
  });
});
```

### 2. Authentication Tests

```typescript
describe('Auth Middleware Authentication', () => {
  it('should require auth for protected routes', async () => {
    const response = await fetch('/api/auth/me', {
      headers: { 'Content-Type': 'application/json' }
    });
    
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      success: false,
      message: 'Access token is required'
    });
  });
});
```

## 🔍 Monitoring

### Key Metrics to Track

1. **Rate Limit Hits**
   - Per endpoint type
   - Per IP address
   - Time patterns

2. **Authentication Failures**
   - Invalid tokens
   - Expired tokens
   - Missing tokens

3. **CSRF Validation Failures**
   - Missing tokens
   - Invalid tokens
   - Expired tokens

4. **Input Sanitization**
   - Sanitized fields
   - Blocked requests

### Log Examples

```json
{
  "level": "info",
  "message": "Auth middleware processing",
  "method": "POST",
  "pathname": "/api/auth/login",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

```json
{
  "level": "warn",
  "message": "Rate limit exceeded",
  "endpoint": "/api/auth/login",
  "ip": "192.168.1.1",
  "remainingAttempts": 0,
  "resetTime": 1234567890
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Rate Limit Too Strict**
   - Adjust limits in `rateLimitConfigs`
   - Consider different limits for different user types

2. **CSRF Token Issues**
   - Check token generation/validation
   - Verify client-side token inclusion
   - Check token expiry times

3. **Authentication Failures**
   - Verify token format
   - Check AuthService implementation
   - Validate database connections

4. **Input Sanitization Too Aggressive**
   - Adjust sanitization rules in `sanitizeAuthRequest`
   - Add exceptions for specific fields

### Debug Mode

Enable debug logging:

```typescript
// In auth-middleware.ts
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log(`🔐 Auth Middleware: Processing ${request.method} ${pathname}`);
  console.log(`🔐 Auth Middleware: Rate limiting applied`);
  console.log(`🔐 Auth Middleware: CSRF validation passed`);
  console.log(`🔐 Auth Middleware: Authentication successful`);
}
```
