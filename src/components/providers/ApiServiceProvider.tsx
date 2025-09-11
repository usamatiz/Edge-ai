'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setGlobalLoading, clearGlobalLoading } from '@/store/slices/userSlice'
import { apiService } from '@/lib/api-service'
import { useNotificationStore } from '@/components/ui/global-notification'

export default function ApiServiceProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const { showNotification } = useNotificationStore()

  useEffect(() => {
    // Connect API service to global loading state
    apiService.setGlobalLoadingCallback((loading: boolean, message?: string) => {
      if (loading) {
        dispatch(setGlobalLoading({ loading: true, message }))
      } else {
        dispatch(clearGlobalLoading())
      }
    })

    // Connect API service to notification system
    apiService.setNotificationCallback((message: string, type?: 'success' | 'error' | 'warning' | 'info') => {
      showNotification(message, type)
    })
  }, [dispatch, showNotification])

  return <>{children}</>
}
