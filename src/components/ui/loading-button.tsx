'use client'

import { cn } from '@/lib/utils'
import { LoadingSpinner } from '../loading-states'

interface LoadingButtonProps {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  loadingText?: string
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

export default function LoadingButton({
  children,
  loading = false,
  disabled = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  type = 'button',
  fullWidth = false
}: LoadingButtonProps) {
  const isDisabled = disabled || loading

  const baseClasses = "inline-flex items-center justify-center font-semibold border-2 transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variantClasses = {
    primary: "bg-[#5046E5] text-white border-[#5046E5] hover:bg-transparent hover:text-[#5046E5] focus:ring-[#5046E5]",
    secondary: "bg-gray-600 text-white border-gray-600 hover:bg-transparent hover:text-gray-600 focus:ring-gray-600",
    danger: "bg-red-600 text-white border-red-600 hover:bg-transparent hover:text-red-600 focus:ring-red-600",
    outline: "bg-transparent text-[#5046E5] border-[#5046E5] hover:bg-[#5046E5] hover:text-white focus:ring-[#5046E5]"
  }
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm rounded-md",
    md: "px-6 py-3 text-base rounded-lg",
    lg: "px-8 py-4 text-lg rounded-lg"
  }
  
  const disabledClasses = isDisabled 
    ? "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed hover:bg-gray-300 hover:text-gray-500" 
    : ""

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabledClasses,
        fullWidth && "w-full",
        className
      )}
      aria-disabled={isDisabled}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {loading ? (loadingText || 'Loading...') : children}
    </button>
  )
}
