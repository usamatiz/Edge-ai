'use client'

import { useEffect, useRef } from 'react'

// Global counter to track how many modals are open
let modalCount = 0
let originalBodyStyle = ''

/**
 * Custom hook to handle body scroll locking for modals
 * This ensures that when multiple modals are open, scroll is only restored
 * when ALL modals are closed
 */
export function useModalScrollLock(isOpen: boolean) {
  const isLockedRef = useRef(false)

  useEffect(() => {
    if (isOpen && !isLockedRef.current) {
      // Store original body style only once
      if (modalCount === 0) {
        originalBodyStyle = document.body.style.overflow || ''
      }
      
      // Increment modal count and lock scroll
      modalCount++
      document.body.style.overflow = 'hidden'
      isLockedRef.current = true
    } else if (!isOpen && isLockedRef.current) {
      // Decrement modal count
      modalCount--
      isLockedRef.current = false
      
      // Only restore scroll when all modals are closed
      if (modalCount <= 0) {
        modalCount = 0 // Ensure it doesn't go negative
        document.body.style.overflow = originalBodyStyle
        originalBodyStyle = '' // Reset for next time
      }
    }

    // Cleanup function to ensure proper restoration
    return () => {
      if (isLockedRef.current) {
        modalCount--
        isLockedRef.current = false
        
        if (modalCount <= 0) {
          modalCount = 0
          document.body.style.overflow = originalBodyStyle
          originalBodyStyle = ''
        }
      }
    }
  }, [isOpen])
}

/**
 * Utility function to force restore scroll (for emergency cases)
 */
export function forceRestoreScroll() {
  modalCount = 0
  document.body.style.overflow = originalBodyStyle
  originalBodyStyle = ''
}
