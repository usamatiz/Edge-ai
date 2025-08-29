import { NextRequest, NextResponse } from 'next/server';
import JWTService from './jwt';
import { createRateLimitMiddleware, rateLimitConfigs } from './rate-limit-middleware';
import { ServerCSRFProtection } from './csrf-middleware';
import { sanitizeInput } from './security';

// Initialize services
const jwtService = new JWTService();

// Rate limiters for different auth endpoints
const loginRateLimiter = createRateLimitMiddleware(rateLimitConfigs.login);
const registerRateLimiter = createRateLimitMiddleware(rateLimitConfigs.register);
const passwordResetRateLimiter = createRateLimitMiddleware(rateLimitConfigs.passwordReset);
const generalAuthRateLimiter = createRateLimitMiddleware(rateLimitConfigs.general);

// Route configurations
const AUTH_ROUTES = {
  // Public routes (no auth required, but rate limited)
  PUBLIC: [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify-email',
    '/api/auth/resend-verification',
    '/api/auth/check-email',
    '/api/auth/check-email-verification',
    '/api/auth/validate-token',
    '/api/auth/google',
    '/api/auth/csrf-token'
  ],
  
  // Protected routes (auth required)
  PROTECTED: [
    '/api/auth/me',
    '/api/auth/profile',
    '/api/auth/logout',
    '/api/auth/clear-expired-tokens'
  ],
  
  // Video routes (auth required)
  VIDEO: [
    '/api/auth/create-video',
    '/api/auth/create-video/generate-video',
    '/api/auth/create-video/status'
  ]
};

/**
 * Check if route requires authentication
 */
function requiresAuth(pathname: string): boolean {
  return AUTH_ROUTES.PROTECTED.some(route => pathname.startsWith(route)) ||
         AUTH_ROUTES.VIDEO.some(route => pathname.startsWith(route));
}

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return AUTH_ROUTES.PUBLIC.some(route => pathname.startsWith(route));
}

/**
 * Get appropriate rate limiter for the route
 */
function getRateLimiter(pathname: string) {
  if (pathname.startsWith('/api/auth/login')) {
    return loginRateLimiter;
  }
  if (pathname.startsWith('/api/auth/register')) {
    return registerRateLimiter;
  }
  if (pathname.startsWith('/api/auth/forgot-password') || 
      pathname.startsWith('/api/auth/reset-password')) {
    return passwordResetRateLimiter;
  }
  return generalAuthRateLimiter;
}

/**
 * Validate access token
 */
async function validateAccessToken(token: string): Promise<boolean> {
  try {
    const payload = jwtService.verifyToken(token);
    return !!payload;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * Sanitize request body for auth endpoints
 */
function sanitizeAuthRequest(body: any, endpoint: string): any {
  const sanitized = { ...body };
  
  switch (endpoint) {
    case '/api/auth/login':
      sanitized.email = sanitizeInput(body.email, 'email');
      // Don't sanitize password as it might contain special chars
      break;
      
    case '/api/auth/register':
      sanitized.firstName = sanitizeInput(body.firstName, 'name');
      sanitized.lastName = sanitizeInput(body.lastName, 'name');
      sanitized.email = sanitizeInput(body.email, 'email');
      sanitized.phone = sanitizeInput(body.phone, 'phone');
      // Don't sanitize password
      break;
      
    case '/api/auth/forgot-password':
    case '/api/auth/resend-verification':
      sanitized.email = sanitizeInput(body.email, 'email');
      break;
      
    case '/api/auth/reset-password':
      sanitized.token = sanitizeInput(body.token, 'text');
      // Don't sanitize password
      break;
      
    case '/api/auth/verify-email':
      sanitized.token = sanitizeInput(body.token, 'text');
      break;
      
    case '/api/auth/profile':
      sanitized.firstName = sanitizeInput(body.firstName, 'name');
      sanitized.lastName = sanitizeInput(body.lastName, 'name');
      sanitized.phone = sanitizeInput(body.phone, 'phone');
      break;
  }
  
  return sanitized;
}

/**
 * Main auth middleware function
 */
export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  
  // Only process auth routes
  if (!pathname.startsWith('/api/auth/')) {
    return null;
  }
  
  console.log(`🔐 Auth Middleware: Processing ${request.method} ${pathname}`);
  
  // 1. Apply rate limiting
  const rateLimiter = getRateLimiter(pathname);
  const rateLimitResponse = rateLimiter(request);
  if (rateLimitResponse) {
    console.log(`🔐 Auth Middleware: Rate limited ${pathname}`);
    return rateLimitResponse;
  }
  
  // 2. CSRF protection for non-GET requests
  if (request.method !== 'GET' && !isPublicRoute(pathname)) {
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !ServerCSRFProtection.validateToken(csrfToken)) {
      console.log(`🔐 Auth Middleware: CSRF validation failed for ${pathname}`);
      return NextResponse.json(
        { success: false, message: 'CSRF token validation failed' },
        { status: 403 }
      );
    }
  }
  
  // 3. Authentication check for protected routes
  if (requiresAuth(pathname)) {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      console.log(`🔐 Auth Middleware: No access token for ${pathname}`);
      return NextResponse.json(
        { success: false, message: 'Access token is required' },
        { status: 401 }
      );
    }
    
    const isValidToken = await validateAccessToken(accessToken);
    if (!isValidToken) {
      console.log(`🔐 Auth Middleware: Invalid access token for ${pathname}`);
      return NextResponse.json(
        { success: false, message: 'Invalid or expired access token' },
        { status: 401 }
      );
    }
    
    console.log(`🔐 Auth Middleware: Authentication successful for ${pathname}`);
  }
  
  // 4. Input sanitization for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const body = await request.json();
      const sanitizedBody = sanitizeAuthRequest(body, pathname);
      
      // Create new request with sanitized body
      const newRequest = new NextRequest(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(sanitizedBody)
      });
      
      // Replace the original request
      Object.assign(request, newRequest);
    } catch (error) {
      console.error('Error sanitizing request body:', error);
      // Continue without sanitization if JSON parsing fails
    }
  }
  
  console.log(`🔐 Auth Middleware: All checks passed for ${pathname}`);
  return null; // Continue with the request
}

/**
 * Middleware wrapper for easy integration
 */
export function createAuthMiddleware() {
  return authMiddleware;
}

/**
 * Helper function to check if user is authenticated
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!accessToken) return false;
  
  return await validateAccessToken(accessToken);
}

/**
 * Helper function to get current user from request
 */
export async function getCurrentUser(request: NextRequest) {
  const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!accessToken) return null;
  
  try {
    // For middleware, we only need to verify the token, not get full user data
    const payload = jwtService.verifyToken(accessToken);
    return payload ? { _id: payload.userId, email: payload.email } : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
