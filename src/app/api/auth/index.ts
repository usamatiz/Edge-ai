// Auth API Routes Index
// This file serves as a central export for all authentication routes

export const AUTH_ROUTES = {
  // User Registration & Authentication
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  GOOGLE_LOGIN: '/api/auth/google',
  LOGOUT: '/api/auth/logout',
  
  // User Profile
  GET_CURRENT_USER: '/api/auth/me',
  UPDATE_PROFILE: '/api/auth/profile',
  
  // Email Verification
  VERIFY_EMAIL: '/api/auth/verify-email',
  RESEND_VERIFICATION: '/api/auth/resend-verification',
  
  // Password Management
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  
  // Utility Routes
  CHECK_EMAIL: '/api/auth/check-email',
  VALIDATE_TOKEN: '/api/auth/validate-token',
  CLEAR_EXPIRED_TOKENS: '/api/auth/clear-expired-tokens',
} as const;

export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES];

// Helper function to build full URLs
export function buildAuthUrl(route: AuthRoute, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${base}${route}`;
}
