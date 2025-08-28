import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Server-side CSRF token storage (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>();

export class ServerCSRFProtection {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate a new CSRF token
   */
  static generateToken(): string {
    const token = crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
    const expires = Date.now() + this.TOKEN_EXPIRY;
    
    // Store token with expiry
    csrfTokens.set(token, { token, expires });
    
    // Clean up expired tokens
    this.cleanupExpiredTokens();
    
    return token;
  }

  /**
   * Validate a CSRF token
   */
  static validateToken(token: string): boolean {
    if (!token) return false;
    
    const tokenData = csrfTokens.get(token);
    if (!tokenData) return false;
    
    // Check if token has expired
    if (Date.now() > tokenData.expires) {
      csrfTokens.delete(token);
      return false;
    }
    
    // Remove token after successful validation (one-time use)
    csrfTokens.delete(token);
    return true;
  }

  /**
   * Clean up expired tokens
   */
  private static cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, data] of csrfTokens.entries()) {
      if (now > data.expires) {
        csrfTokens.delete(token);
      }
    }
  }

  /**
   * Get token expiry time
   */
  static getTokenExpiry(): number {
    return this.TOKEN_EXPIRY;
  }
}

/**
 * CSRF middleware for API routes
 */
export function csrfMiddleware(request: NextRequest): NextResponse | null {
  // Skip CSRF check for GET requests
  if (request.method === 'GET') {
    return null;
  }

  // Skip CSRF check for public endpoints
  const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/google',
    '/api/auth/verify-email',
    '/api/auth/reset-password',
    '/api/auth/validate-token',
    '/api/auth/check-email-verification'
  ];

  const url = new URL(request.url);
  const path = url.pathname;
  
  if (publicEndpoints.includes(path)) {
    return null;
  }

  // Skip CSRF check for authenticated endpoints (those with valid access tokens)
  const authenticatedEndpoints = [
    '/api/auth/profile',
    '/api/auth/me',
    '/api/auth/logout'
  ];

  if (authenticatedEndpoints.includes(path)) {
    // For authenticated endpoints, we rely on the access token for security
    // CSRF protection is less critical since the user is already authenticated
    return null;
  }

  // Get CSRF token from headers
  const csrfToken = request.headers.get('x-csrf-token');
  
  if (!csrfToken) {
    return NextResponse.json(
      { success: false, message: 'CSRF token is required' },
      { status: 403 }
    );
  }

  // Validate CSRF token
  if (!ServerCSRFProtection.validateToken(csrfToken)) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired CSRF token' },
      { status: 403 }
    );
  }

  return null; // Continue with request
}

/**
 * Generate CSRF token endpoint
 */
export async function generateCSRFToken(): Promise<{ token: string; expires: number }> {
  const token = ServerCSRFProtection.generateToken();
  const expires = Date.now() + ServerCSRFProtection.getTokenExpiry();
  
  return { token, expires };
}
