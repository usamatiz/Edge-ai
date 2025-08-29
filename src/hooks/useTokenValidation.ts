import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { clearUser } from '@/store/slices/userSlice';
import { isTokenExpired, isTokenExpiringSoon, handleTokenExpiration } from '@/lib/jwt-client';
import { useNotificationStore } from '@/components/ui/global-notification';

export const useTokenValidation = () => {
  const dispatch = useDispatch();
  const { showNotification } = useNotificationStore();

  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      return;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('Token expired, logging out user');
      dispatch(clearUser());
      handleTokenExpiration();
      showNotification('Token expired. Please login again.', 'error');
      return;
    }

    // Check if token is expiring soon (within 1 hour)
    if (isTokenExpiringSoon(token, 60)) {
      console.log('Token expiring soon, showing warning to user');
      // You can show a notification to the user here
      // For now, we'll just log it
    }
  }, [dispatch]);

  const validateTokenWithServer = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!data.success) {
        console.log('Server validation failed, logging out user');
        dispatch(clearUser());
        handleTokenExpiration();
        showNotification('Token expired. Please login again.', 'error');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }, [dispatch]);

  // Check token expiration on mount and every 5 minutes
  useEffect(() => {
    checkTokenExpiration();

    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [checkTokenExpiration]);

  // Validate token with server on mount (only if token exists)
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      validateTokenWithServer();
    }
  }, [validateTokenWithServer]);

  return {
    checkTokenExpiration,
    validateTokenWithServer,
  };
};
