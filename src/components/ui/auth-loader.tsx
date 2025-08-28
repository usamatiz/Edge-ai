'use client'

import { useAppSelector } from '@/store/hooks'

interface AuthLoaderProps {
  children: React.ReactNode
}

export default function AuthLoader({ children }: AuthLoaderProps) {
  const { isLoading } = useAppSelector((state) => state.user)

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            {/* EdgeAi Logo */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#5046E5]">
                EdgeAi
              </h1>
              <p className="text-sm text-[#667085] mt-1">
                AI-Powered Video Creation Platform
              </p>
            </div>
            
            {/* Loading Spinner */}
            <div className="w-16 h-16 mx-auto mb-4">
              
                <div className="w-full h-full border-4 border-transparent border-t-[#5046E5] rounded-full animate-spin"></div>
            </div>
            
            {/* Loading Text */}
            <p className="text-[#667085] text-sm font-medium">
              Checking authentication...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
