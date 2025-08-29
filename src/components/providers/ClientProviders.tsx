'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import { ErrorBoundary } from '@/components/error-boundary'
import AuthInitializer from '@/components/features/auth/AuthInitializer'
import TokenValidator from '@/components/features/auth/TokenValidator'
import { useAuthErrorHandler } from '@/hooks/useAuthErrorHandler'

interface ClientProvidersProps {
  children: React.ReactNode
}

function ClientProvidersContent({ children }: ClientProvidersProps) {
  useAuthErrorHandler()
  
  return (
    <>
      <AuthInitializer />
      <TokenValidator />
      {children}
    </>
  )
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ClientProvidersContent>
          {children}
        </ClientProvidersContent>
      </Provider>
    </ErrorBoundary>
  )
}
