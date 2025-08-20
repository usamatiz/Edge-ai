'use client'

import { useAuth } from '@/contexts/AuthContext'

// Development component to debug auth state
export function AuthDebug() {
  const { registeredUsers, clearUsers } = useAuth()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <h4 className="font-semibold mb-2">Auth Debug</h4>
      <p className="text-sm mb-2">Registered Users: {registeredUsers.length}</p>
      {registeredUsers.length > 0 && (
        <div className="text-xs mb-2">
          <p className="font-medium">Latest:</p>
          <p>{registeredUsers[registeredUsers.length - 1]?.firstName} {registeredUsers[registeredUsers.length - 1]?.lastName}</p>
          <p>{registeredUsers[registeredUsers.length - 1]?.email}</p>
        </div>
      )}
      <button 
        onClick={clearUsers}
        className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
      >
        Clear All Users
      </button>
    </div>
  )
}
