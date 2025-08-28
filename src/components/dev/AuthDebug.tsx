'use client'

  
export function AuthDebug() {

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <h4 className="font-semibold mb-2">Auth Debug</h4>

    </div>
  )
}
