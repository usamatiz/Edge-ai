'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/store/hooks'
import { clearUser } from '@/store/slices/userSlice'
import { useNotificationStore } from '@/components/ui/global-notification'

export function useAuthErrorHandler() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { showNotification } = useNotificationStore()

  useEffect(() => {
    // Create a global fetch interceptor
    const originalFetch = window.fetch

    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        
        // Check if response is 401 (Unauthorized)
        if (response.status === 401) {
          const responseData = await response.clone().json().catch(() => ({}))
          
          // Check if it's a token-related error
          if (responseData.message?.includes('token') || 
              responseData.message?.includes('unauthorized') ||
              responseData.message?.includes('expired')) {
            
            console.log('🔐 Auth Error Handler: Token expired or invalid, logging out user')
            
            // Clear user data from Redux
            dispatch(clearUser())
            
            // Show notification
            showNotification('Token expired. Please login again.', 'error')
            
            // Redirect to home page
            router.push('/')
            
            // Return a modified response to prevent further processing
            return new Response(JSON.stringify({ 
              success: false, 
              message: 'Token expired. Please login again.' 
            }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            })
          }
        }
        
        return response
      } catch (error) {
        console.error('Fetch interceptor error:', error)
        return originalFetch(...args)
      }
    }

    // Cleanup function
    return () => {
      window.fetch = originalFetch
    }
  }, [dispatch, router, showNotification])
}
