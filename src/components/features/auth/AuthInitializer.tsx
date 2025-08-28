'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setUser, setLoading, checkTokenExpiry } from '@/store/slices/userSlice'

export default function AuthInitializer() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const initializeAuth = async () => {
      dispatch(setLoading(true))
      
      try {
        // Check token expiry first
        dispatch(checkTokenExpiry())
        
        // Check if user data exists in localStorage
        const accessToken = localStorage.getItem('accessToken')
        const tokenExpiry = localStorage.getItem('tokenExpiry')
        
        if (!accessToken || !tokenExpiry) {
          dispatch(setLoading(false))
          return
        }
        
        const expiryTime = parseInt(tokenExpiry)
        
        // Check if token has expired
        if (Date.now() > expiryTime) {
          // Token expired, clear it
          localStorage.removeItem('accessToken')
          localStorage.removeItem('tokenExpiry')
          dispatch(setLoading(false))
          return
        }
        
        try {
          // Fetch user data from the server to validate the token
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          })
          
          if (response.ok) {
            const data = await response.json()
            
            if (data.success) {
              // Set user data in Redux store
              dispatch(setUser({
                user: data.data.user,
                accessToken: accessToken,
                tokenExpiry: expiryTime
              }))
            } else {
              // Token is invalid, remove it
              localStorage.removeItem('accessToken')
              localStorage.removeItem('tokenExpiry')
            }
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('accessToken')
            localStorage.removeItem('tokenExpiry')
          }
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('accessToken')
          localStorage.removeItem('tokenExpiry')
        }
      } catch (error) {
      } finally {
        dispatch(setLoading(false))
      }
    }

    initializeAuth()
  }, [dispatch])

  return null
}
