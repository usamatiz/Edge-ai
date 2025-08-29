import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  keyGenerator?: (request: NextRequest) => string;
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

// In-memory storage for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitData>();

export class ServerRateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is rate limited
   */
  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const data = rateLimitStore.get(identifier);

    if (!data) {
      // First request
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return false;
    }

    // Check if window has reset
    if (now > data.resetTime) {
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return false;
    }

    // Increment count
    data.count++;
    
    return data.count > this.config.maxAttempts;
  }

  /**
   * Get remaining attempts
   */
  getRemainingAttempts(identifier: string): number {
    const data = rateLimitStore.get(identifier);
    if (!data) return this.config.maxAttempts;

    const now = Date.now();
    if (now > data.resetTime) {
      return this.config.maxAttempts;
    }

    return Math.max(0, this.config.maxAttempts - data.count);
  }

  /**
   * Get reset time
   */
  getResetTime(identifier: string): number {
    const data = rateLimitStore.get(identifier);
    return data ? data.resetTime : Date.now() + this.config.windowMs;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Create rate limiter middleware
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const rateLimiter = new ServerRateLimiter(config);

  return function rateLimitMiddleware(request: NextRequest): NextResponse | null {
    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      rateLimiter.cleanup();
    }

    // Generate identifier for rate limiting
    const identifier = config.keyGenerator 
      ? config.keyGenerator(request)
      : getClientIdentifier(request);

    // Check rate limit
    if (rateLimiter.isRateLimited(identifier)) {
      const remaining = rateLimiter.getRemainingAttempts(identifier);
      const resetTime = rateLimiter.getResetTime(identifier);
      
      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests. Please try again later.',
          data: {
            remainingAttempts: remaining,
            resetTime: resetTime
          }
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxAttempts.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': resetTime.toString(),
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    return null; // Continue with request
  };
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Use IP address as primary identifier
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') ||
             request.headers.get('cf-connecting-ip') ||
             request.headers.get('x-forwarded') ||
             request.headers.get('x-cluster-client-ip') ||
             request.headers.get('x-forwarded-for') ||
             request.headers.get('x-forwarded-host') ||
             request.headers.get('x-forwarded-server') ||
             'unknown';
  
  // Use user agent as secondary identifier
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Use path as tertiary identifier
  const path = new URL(request.url).pathname;
  
  return `${ip}:${userAgent}:${path}`;
}

/**
 * Predefined rate limit configurations
 */
export const rateLimitConfigs = {
  // Login attempts: 5 per 15 minutes
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (request: NextRequest) => {
      const ip = getClientIdentifier(request);
      return `login:${ip}`;
    }
  },
  
  // Registration attempts: 3 per hour
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyGenerator: (request: NextRequest) => {
      const ip = getClientIdentifier(request);
      return `register:${ip}`;
    }
  },
  
  // Password reset attempts: 3 per hour
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyGenerator: (request: NextRequest) => {
      const ip = getClientIdentifier(request);
      return `password_reset:${ip}`;
    }
  },
  
  // Email verification attempts: 5 per hour
  emailVerification: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyGenerator: (request: NextRequest) => {
      const ip = getClientIdentifier(request);
      return `email_verification:${ip}`;
    }
  },
  
  // General auth requests: 60 per minute
  general: {
    maxAttempts: 60,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (request: NextRequest) => {
      const ip = getClientIdentifier(request);
      return `auth_general:${ip}`;
    }
  },
  
  // Video creation requests: 5 per minute
  createVideo: {
    maxAttempts: 5,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (request: NextRequest) => {
      const ip = getClientIdentifier(request);
      return `create_video:${ip}`;
    }
  }
};
