'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.user)
  const router = useRouter()
  const [authCheckComplete, setAuthCheckComplete] = useState(false)

  useEffect(() => {

    if (!isLoading) {
      setAuthCheckComplete(true)
    }
  }, [isLoading, isAuthenticated, authCheckComplete])

  useEffect(() => {
    // Only redirect after auth check is complete and user is not authenticated
    if (authCheckComplete && !isAuthenticated) {
      router.push('/')
    }
  }, [authCheckComplete, isAuthenticated, router])

  // Show loading state while checking authentication
  if (isLoading || !authCheckComplete) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // If authenticated, render children
  return <>{children}</>
}
