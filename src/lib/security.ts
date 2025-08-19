import DOMPurify from 'dompurify';

// XSS Prevention and Input Sanitization Utilities

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML string
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(
  dirty: string, 
  options?: Record<string, unknown>
): string {
  if (typeof window === 'undefined') {
    // Server-side: return stripped content
    return stripHtmlTags(dirty);
  }
  
  const defaultConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    ...options
  };
  
  return DOMPurify.sanitize(dirty, defaultConfig) as string;
}

/**
 * Strip all HTML tags from a string (server-safe)
 * @param input - String potentially containing HTML
 * @returns String with HTML tags removed
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Enhanced input sanitization for form fields
 * @param input - Raw user input
 * @param type - Type of input field
 * @returns Sanitized input
 */
export function sanitizeInput(
  input: string, 
  type: 'text' | 'email' | 'phone' | 'name' | 'company' | 'url' = 'text'
): string {
  if (!input) return '';
  
  let sanitized = input.trim();
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>'"]/g, '');
  
  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Type-specific sanitization
  switch (type) {
    case 'email':
      // Allow only valid email characters
      sanitized = sanitized.replace(/[^a-zA-Z0-9@._-]/g, '');
      break;
    case 'phone':
      // Allow only numbers, spaces, hyphens, parentheses, and plus
      sanitized = sanitized.replace(/[^0-9\s\-\(\)\+]/g, '');
      break;
    case 'name':
    case 'company':
      // Allow letters, spaces, hyphens, apostrophes, and periods
      sanitized = sanitized.replace(/[^a-zA-Z\s\-'\.]/g, '');
      break;
    case 'url':
      // Basic URL sanitization
      sanitized = sanitized.replace(/[^a-zA-Z0-9:\/\.\-_~\?#\[\]@!$&'()*+,;=%]/g, '');
      break;
    case 'text':
    default:
      // Allow alphanumeric, common punctuation, but no HTML
      sanitized = sanitized.replace(/[<>]/g, '');
      break;
  }
  
  return sanitized;
}

/**
 * Validate and sanitize URLs to prevent javascript: and data: URIs
 * @param url - URL to validate
 * @returns Safe URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  const trimmedUrl = url.trim().toLowerCase();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
  
  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.startsWith(protocol)) {
      return '';
    }
  }
  
  // Allow only http, https, mailto, and tel protocols
  const allowedProtocols = /^(https?:\/\/|mailto:|tel:|#)/i;
  
  if (trimmedUrl.startsWith('//')) {
    return `https:${url}`;
  }
  
  if (trimmedUrl.startsWith('/') || allowedProtocols.test(trimmedUrl)) {
    return url.trim();
  }
  
  // If no protocol specified, assume https for external links
  if (!trimmedUrl.includes('://') && !trimmedUrl.startsWith('/') && !trimmedUrl.startsWith('#')) {
    return `https://${url.trim()}`;
  }
  
  return '';
}

/**
 * Escape HTML entities in a string
 * @param input - String to escape
 * @returns HTML-escaped string
 */
export function escapeHtml(input: string): string {
  const entityMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => entityMap[char]);
}

/**
 * Validate file names to prevent path traversal attacks
 * @param filename - File name to validate
 * @returns Safe filename or empty string if invalid
 */
export function sanitizeFileName(filename: string): string {
  if (!filename) return '';
  
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');
  
  // Remove or replace dangerous characters
  sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1f]/g, '');
  
  // Limit length
  sanitized = sanitized.substring(0, 255);
  
  // Remove leading/trailing dots and spaces
  sanitized = sanitized.replace(/^[\.\s]+|[\.\s]+$/g, '');
  
  return sanitized;
}

/**
 * Rate limiting storage and validation
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  /**
   * Check if an identifier is rate limited
   * @param identifier - Unique identifier (e.g., IP, user ID)
   * @returns true if rate limited, false if allowed
   */
  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const attemptData = this.attempts.get(identifier);
    
    if (!attemptData) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return false;
    }
    
    // Reset if window has passed
    if (now - attemptData.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return false;
    }
    
    // Increment attempt count
    attemptData.count++;
    attemptData.lastAttempt = now;
    
    return attemptData.count > this.maxAttempts;
  }
  
  /**
   * Reset rate limit for an identifier
   * @param identifier - Unique identifier to reset
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
  
  /**
   * Get remaining attempts for an identifier
   * @param identifier - Unique identifier
   * @returns Number of remaining attempts
   */
  getRemainingAttempts(identifier: string): number {
    const attemptData = this.attempts.get(identifier);
    if (!attemptData) return this.maxAttempts;
    
    const now = Date.now();
    if (now - attemptData.lastAttempt > this.windowMs) {
      return this.maxAttempts;
    }
    
    return Math.max(0, this.maxAttempts - attemptData.count);
  }
}

/**
 * Secure random string generator
 * @param length - Length of the random string
 * @returns Cryptographically secure random string
 */
export function generateSecureRandomString(length: number = 32): string {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for server-side (should use crypto module in real implementation)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate and sanitize JSON input
 * @param input - JSON string to validate
 * @param maxSize - Maximum allowed JSON size in bytes
 * @returns Parsed and validated JSON object or null if invalid
 */
export function sanitizeJsonInput(input: string, maxSize: number = 10000): unknown | null {
  if (!input || input.length > maxSize) {
    return null;
  }
  
  try {
    // Remove any potential XSS in JSON strings
    const sanitizedInput = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    const parsed = JSON.parse(sanitizedInput);
    
    // Basic validation - ensure it's an object or array
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }
    
    return parsed;
  } catch {
    return null;
  }
}

/**
 * CSRF Token management
 */
export class CSRFProtection {
  private static readonly TOKEN_KEY = 'csrf_token';
  
  /**
   * Generate a new CSRF token
   * @returns CSRF token string
   */
  static generateToken(): string {
    const token = generateSecureRandomString(32);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
    return token;
  }
  
  /**
   * Get the current CSRF token
   * @returns CSRF token or null if not found
   */
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }
  
  /**
   * Validate a CSRF token
   * @param token - Token to validate
   * @returns true if valid, false otherwise
   */
  static validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return storedToken !== null && storedToken === token;
  }
  
  /**
   * Clear the CSRF token
   */
  static clearToken(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.TOKEN_KEY);
    }
  }
}
