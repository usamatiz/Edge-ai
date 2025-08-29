# JWT Authentication Implementation

## Overview

This project has been migrated from a custom token-based authentication system to JWT (JSON Web Tokens) for better performance and scalability.

## Key Features

### 🔐 JWT Token Management
- **Token Generation**: Uses `jsonwebtoken` library with your `JWT_SECRET` environment variable
- **Expiration**: 7-day token lifetime (configurable in `src/lib/jwt.ts`)
- **Stateless**: No database storage of tokens, reducing database load

### 🛡️ Security Features
- **Server-side validation**: All tokens are verified using the JWT secret
- **Client-side validation**: Frontend checks token expiration before making requests
- **Automatic cleanup**: Expired tokens are automatically handled
- **CSRF protection**: Maintained from the previous system

### 📱 Frontend Integration
- **Modal-based handling**: All JWT operations are handled within the authentication modals
- **Automatic validation**: Token validation happens on app initialization and periodically
- **Graceful expiration**: Users are automatically logged out when tokens expire

## Implementation Details

### Backend Changes

#### 1. JWT Service (`src/lib/jwt.ts`)
```typescript
class JWTService {
  generateToken(userId: string, email: string): string
  verifyToken(token: string): JWTPayload | null
  isTokenExpired(token: string): boolean
  getTokenExpiration(token: string): Date | null
}
```

#### 2. Updated AuthService (`src/server/services/Auth.service.ts`)
- Removed custom token generation methods
- Updated all authentication methods to use JWT
- Simplified token validation (no database queries needed)

#### 3. Updated User Model (`src/server/models/User.model.ts`)
- Removed `accessToken` and `accessTokenExpires` fields
- Removed `generateAccessToken()` method
- Cleaner schema without token storage

#### 4. Updated Middleware (`src/lib/auth-middleware.ts`)
- Uses JWT verification instead of database lookups
- Faster authentication checks
- Maintains all security features

### Frontend Changes

#### 1. JWT Client Utilities (`src/lib/jwt-client.ts`)
```typescript
// Client-side token validation
isTokenExpired(token: string): boolean
validateAndHandleToken(token: string | null): boolean
handleTokenExpiration(): void
```

#### 2. Token Validation Hook (`src/hooks/useTokenValidation.ts`)
- Automatic token expiration checking
- Server-side token validation
- Automatic logout on expiration

#### 3. Updated Modals
- **Signin Modal**: Validates JWT tokens before storing
- **Signup Modal**: Validates JWT tokens after registration
- **Google Callback**: Validates JWT tokens after OAuth

#### 4. Auth Initializer
- Updated to use JWT validation
- Removed custom token expiry handling
- Cleaner initialization process

## API Endpoints

### New Endpoint: `/api/auth/validate-token`
```typescript
POST /api/auth/validate-token
{
  "token": "jwt_token_here"
}

Response:
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "isEmailVerified": true
    }
  }
}
```

## Token Flow

### 1. Login Process
```
User submits credentials → AuthService validates → JWT token generated → 
Token stored in localStorage → User authenticated
```

### 2. Token Validation
```
Request made → JWT middleware verifies token → User data extracted → 
Request proceeds or rejected
```

### 3. Token Expiration
```
Token expires → Frontend detects expiration → User automatically logged out → 
Redirected to login page
```

## Environment Variables

Make sure you have the following environment variable set:

```env
JWT_SECRET=your_secure_jwt_secret_here
```

## Benefits of JWT Migration

### ✅ Performance Improvements
- **Faster authentication**: No database queries for token validation
- **Reduced database load**: Tokens not stored in database
- **Better scalability**: Stateless authentication

### ✅ Security Enhancements
- **Industry standard**: JWT is widely adopted and secure
- **Self-contained**: Tokens contain all necessary information
- **Tamper-proof**: Cryptographically signed tokens

### ✅ Developer Experience
- **Simpler codebase**: Removed complex token management
- **Better debugging**: JWT tokens can be decoded for debugging
- **Standard libraries**: Using well-tested JWT libraries

## Migration Notes

### What Changed
1. **Token Storage**: Tokens no longer stored in database
2. **Validation**: Server-side validation using JWT secret
3. **Expiration**: Automatic expiration handling
4. **Performance**: Faster authentication checks

### What Remained the Same
1. **CSRF Protection**: Still active for all non-GET requests
2. **Rate Limiting**: Unchanged
3. **User Experience**: Same login/logout flow
4. **Security**: Enhanced with JWT standards

## Troubleshooting

### Common Issues

1. **JWT_SECRET not set**
   - Error: "JWT_SECRET environment variable is required"
   - Solution: Add JWT_SECRET to your .env file

2. **Token validation fails**
   - Check if token is properly formatted
   - Verify JWT_SECRET is correct
   - Check token expiration

3. **Frontend token issues**
   - Clear localStorage and re-login
   - Check browser console for errors
   - Verify token format in localStorage

### Debugging

To debug JWT tokens, you can use the client-side decode function:

```typescript
import { decodeToken } from '@/lib/jwt-client'

const token = localStorage.getItem('accessToken')
const payload = decodeToken(token)
console.log('Token payload:', payload)
```

## Future Enhancements

1. **Refresh Tokens**: Implement refresh token system for longer sessions
2. **Token Blacklisting**: Add ability to blacklist specific tokens
3. **Multi-device Support**: Allow multiple active sessions per user
4. **Token Analytics**: Track token usage and patterns
