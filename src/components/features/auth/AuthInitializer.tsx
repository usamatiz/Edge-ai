'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setUser, setLoading } from '@/store/slices/userSlice'
import { isTokenExpired, validateAndHandleToken } from '@/lib/jwt-client'

export default function AuthInitializer() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const initializeAuth = async () => {
      const startTime = Date.now()
      dispatch(setLoading(true))
      
      try {
        // Check if access token exists in localStorage
        const accessToken = localStorage.getItem('accessToken')
        
        if (!accessToken) {
          console.log('🔐 AuthInitializer: No access token found')
          // Ensure minimum loading time to prevent flickering
          const elapsed = Date.now() - startTime
          if (elapsed < 1000) {
            await new Promise(resolve => setTimeout(resolve, 1000 - elapsed))
          }
          dispatch(setLoading(false))
          return
        }
        
        console.log('🔐 AuthInitializer: Found access token, validating...')
        
        // Validate JWT token
        if (!validateAndHandleToken(accessToken)) {
          console.log('🔐 AuthInitializer: Token validation failed')
          // Token is invalid or expired, clear it
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
          // Ensure minimum loading time to prevent flickering
          const elapsed = Date.now() - startTime
          if (elapsed < 1000) {
            await new Promise(resolve => setTimeout(resolve, 1000 - elapsed))
          }
          dispatch(setLoading(false))
          return
        }
        
        console.log('🔐 AuthInitializer: Client-side token validation passed')
        
        try {
          // Validate token using the validate-token endpoint
          const response = await fetch('/api/auth/validate-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: accessToken }),
          })
          
          if (response.ok) {
            const data = await response.json()
            
            if (data.success) {
              console.log('🔐 AuthInitializer: Server validation successful, setting user')
              // Set user data in Redux store
              dispatch(setUser({
                user: data.data.user,
                accessToken: accessToken
              }))
            } else {
              console.log('🔐 AuthInitializer: Server validation failed')
              // Token is invalid, remove it
              localStorage.removeItem('accessToken')
              localStorage.removeItem('user')
            }
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('accessToken')
            localStorage.removeItem('user')
          }
        } catch (error) {
          console.error('Token validation error:', error)
          // Token is invalid, remove it
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        // Ensure minimum loading time to prevent flickering
        const elapsed = Date.now() - startTime
        if (elapsed < 1000) {
          await new Promise(resolve => setTimeout(resolve, 1000 - elapsed))
        }
        dispatch(setLoading(false))
      }
    }

    initializeAuth()
  }, [dispatch])

  return null
}
