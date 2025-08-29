'use client'

import { useTokenValidation } from '@/hooks/useTokenValidation'

export default function TokenValidator() {
  // This component uses the useTokenValidation hook to handle token expiration
  // The hook will automatically check token expiration and handle logout
  useTokenValidation()

  // This component doesn't render anything, it just handles token validation
  return null
}
