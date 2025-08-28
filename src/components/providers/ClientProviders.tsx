'use client'

import { Provider } from 'react-redux'
import { store } from '@/store'
import { ErrorBoundary } from '@/components/error-boundary'
import AuthInitializer from '@/components/features/auth/AuthInitializer'

interface ClientProvidersProps {
  children: React.ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthInitializer />
        {children}
      </Provider>
    </ErrorBoundary>
  )
}
