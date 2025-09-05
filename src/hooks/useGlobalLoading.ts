'use client'

import { useAppDispatch } from '@/store/hooks'
import { setGlobalLoading, clearGlobalLoading } from '@/store/slices/userSlice'

export function useGlobalLoading() {
  const dispatch = useAppDispatch()

  const startLoading = (message?: string) => {
    dispatch(setGlobalLoading({ loading: true, message }))
  }

  const stopLoading = () => {
    dispatch(clearGlobalLoading())
  }

  const withLoading = async <T>(
    asyncFn: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    try {
      startLoading(message)
      const result = await asyncFn()
      return result
    } finally {
      stopLoading()
    }
  }

  return {
    startLoading,
    stopLoading,
    withLoading
  }
}
