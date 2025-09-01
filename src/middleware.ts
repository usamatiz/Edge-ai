import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth-middleware-simple';

// Rate limiting storage (in production, use Redis or a proper database)
const requestCounts = new Map<string, { count: number; timestamp: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute

/**
 * Generate a simple UUID-like string for Edge Runtime
 */
function generateRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Simple rate limiting middleware for non-auth routes
 * @param req - The incoming request
 * @returns Response if rate limited, otherwise continues
 */
function rateLimit(req: NextRequest) {
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const now = Date.now();
  
  const clientData = requestCounts.get(clientIP);
  
  if (!clientData) {
    requestCounts.set(clientIP, { count: 1, timestamp: now });
    return null;
  }
  
  // Reset count if window has passed
  if (now - clientData.timestamp > RATE_LIMIT_WINDOW) {
    requestCounts.set(clientIP, { count: 1, timestamp: now });
    return null;
  }
  
  // Increment count
  clientData.count++;
  
  // Check if rate limit exceeded
  if (clientData.count > RATE_LIMIT_MAX_REQUESTS) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: RATE_LIMIT_WINDOW - (now - clientData.timestamp)
      }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((RATE_LIMIT_WINDOW - (now - clientData.timestamp)) / 1000))
        }
      }
    );
  }
  
  return null;
}

/**
 * Security headers to add to all responses
 */
function addSecurityHeaders(response: NextResponse) {
  // Additional security headers that might not be in next.config.ts
  response.headers.set('X-Request-ID', generateRequestId());
  response.headers.set('X-Timestamp', new Date().toISOString());
  
  return response;
}

/**
 * Validate request paths and block suspicious requests
 * @param req - The incoming request
 * @returns Response if blocked, otherwise null
 */
function validateRequest(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Block common attack patterns
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script>/i, // XSS attempts in URL
    /union.*select/i, // SQL injection attempts
    /wp-admin/, // WordPress admin access attempts
    /\.env/, // Environment file access attempts
    /\.git/, // Git directory access attempts
    /phpMyAdmin/i, // phpMyAdmin access attempts
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(pathname) || pattern.test(req.url)) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // Block requests with suspicious headers
  const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
  const suspiciousUserAgents = [
    'sqlmap',
    'nikto',
    'masscan',
    'nmap',
    'burp',
    'havij'
  ];
  
  for (const agent of suspiciousUserAgents) {
    if (userAgent.includes(agent)) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  return null;
}

/**
 * Check if the request should be excluded from rate limiting
 * @param req - The incoming request
 * @returns boolean
 */
function shouldExcludeFromRateLimit(req: NextRequest): boolean {
  const { pathname } = req.nextUrl;
  
  // Exclude auth routes from general rate limiting (they have their own)
  if (pathname.startsWith('/api/auth/')) {
    return true;
  }
  
  // Exclude video creation routes from rate limiting
  if (pathname.startsWith('/api/auth/create-video')) {
    return true;
  }
  
  // Exclude other video endpoints from rate limiting
  const excludedPaths = [
    '/api/video/download',
    '/api/video/gallery',
    '/api/video/status',
    '/api/video/delete',
    '/api/webhook/'
  ];
  
  return excludedPaths.some(path => pathname.startsWith(path));
}

/**
 * Main middleware function
 * @param req - The NextRequest
 * @returns NextResponse
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  console.log(`🌐 Main Middleware: Processing ${req.method} ${pathname}`);
  
  // 1. Handle auth routes with specialized middleware (excluding video routes)
  if (pathname.startsWith('/api/auth/') && !pathname.startsWith('/api/auth/create-video')) {
    console.log(`🔐 Main Middleware: Delegating to auth middleware for ${pathname}`);
    const authResponse = await authMiddleware(req);
    if (authResponse) {
      return authResponse;
    }
    // Continue with security headers
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }
  
  // 2. Skip middleware for other API routes to prevent body reading issues
  if (pathname.startsWith('/api/')) {
    console.log(`🌐 Main Middleware: Skipping API route ${pathname}`);
    return NextResponse.next();
  }
  
  // 3. Validate request for suspicious patterns (for non-API routes)
  const validationResult = validateRequest(req);
  if (validationResult) {
    console.log(`🌐 Main Middleware: Request blocked for ${pathname}`);
    return validationResult;
  }
  
  // 4. Apply rate limiting for non-API routes
  if (!shouldExcludeFromRateLimit(req)) {
    const rateLimitResult = rateLimit(req);
    if (rateLimitResult) {
      console.log(`🌐 Main Middleware: Rate limited ${pathname}`);
      return rateLimitResult;
    }
  }
  
  // 5. Continue with the request
  const response = NextResponse.next();
  
  // 6. Add security headers
  return addSecurityHeaders(response);
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
