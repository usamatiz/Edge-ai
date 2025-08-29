// Client-side JWT utilities for frontend token handling

interface JWTPayload {
  userId: string;
  email: string;
  type?: string;
  iat?: number;
  exp?: number;
}

/**
 * Decode JWT token without verification (client-side only)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  
  return new Date(decoded.exp * 1000);
}

/**
 * Get time until token expires (in milliseconds)
 */
export function getTimeUntilExpiration(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return 0;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return (decoded.exp - currentTime) * 1000;
}

/**
 * Check if token will expire soon (within specified time)
 */
export function isTokenExpiringSoon(token: string, withinMinutes: number = 60): boolean {
  const timeUntilExpiration = getTimeUntilExpiration(token);
  const withinMs = withinMinutes * 60 * 1000;
  
  return timeUntilExpiration > 0 && timeUntilExpiration < withinMs;
}

/**
 * Handle token expiration by clearing storage and redirecting
 */
export function handleTokenExpiration(): void {
  // Clear all auth-related data
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  
  // Redirect to login with expiration message
  const currentPath = window.location.pathname;
  if (currentPath !== '/' && !currentPath.includes('/auth/')) {
    window.location.href = `/?message=session_expired&redirect=${encodeURIComponent(currentPath)}`;
  }
}

/**
 * Validate and handle token expiration
 */
export function validateAndHandleToken(token: string | null): boolean {
  if (!token) {
    handleTokenExpiration();
    return false;
  }

  if (isTokenExpired(token)) {
    handleTokenExpiration();
    return false;
  }

  return true;
}
