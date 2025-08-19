import { NextRequest, NextResponse } from 'next/server';

// Rate limiting storage (in production, use Redis or a proper database)
const requestCounts = new Map<string, { count: number; timestamp: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute

/**
 * Simple rate limiting middleware
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
  response.headers.set('X-Request-ID', crypto.randomUUID());
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
 * Main middleware function
 * @param req - The incoming request
 * @returns NextResponse
 */
export function middleware(req: NextRequest) {
  // Validate request for suspicious patterns
  const validationResult = validateRequest(req);
  if (validationResult) {
    return validationResult;
  }
  
  // Apply rate limiting
  const rateLimitResult = rateLimit(req);
  if (rateLimitResult) {
    return rateLimitResult;
  }
  
  // Continue with the request
  const response = NextResponse.next();
  
  // Add security headers
  return addSecurityHeaders(response);
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Include API routes for rate limiting
    '/api/:path*'
  ],
};
