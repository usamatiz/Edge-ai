'use client'

import { useAppSelector } from '@/store/hooks'
import { LoadingSpinner } from '../loading-states'

export default function GlobalLoadingOverlay() {
  const { globalLoading, globalLoadingMessage } = useAppSelector((state) => state.user)

  if (!globalLoading) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Loading Spinner */}
          <div className="mb-6">
            <LoadingSpinner size="lg" className="mx-auto" />
          </div>
          
          {/* Loading Message */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {globalLoadingMessage || 'Processing...'}
          </h3>
          
          {/* Subtitle */}
          <p className="text-sm text-gray-600">
            Please wait while we process your request
          </p>
        </div>
      </div>
    </div>
  )
}
