'use client'

import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { setGlobalLoading, clearGlobalLoading } from '@/store/slices/userSlice'
import { apiService } from '@/lib/api-service'

export default function ApiServiceProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Connect API service to global loading state
    apiService.setGlobalLoadingCallback((loading: boolean, message?: string) => {
      if (loading) {
        dispatch(setGlobalLoading({ loading: true, message }))
      } else {
        dispatch(clearGlobalLoading())
      }
    })
  }, [dispatch])

  return <>{children}</>
}
