'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface UserData {
  firstName: string
  lastName: string
  email: string
  phone: string
  createdAt: string
}

interface AuthContextType {
  registeredUsers: UserData[]
  currentUser: UserData | null
  isLoggedIn: boolean
  addUser: (user: UserData) => void
  addUserAndLogin: (user: UserData) => void
  login: (email: string) => boolean
  logout: () => void
  isUserRegistered: (email: string) => boolean
  getUserByEmail: (email: string) => UserData | undefined
  clearUsers: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [registeredUsers, setRegisteredUsers] = useState<UserData[]>([])
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const addUser = (user: UserData) => {
    setRegisteredUsers(prev => {
      // Check if user already exists to prevent duplicates
      const exists = prev.some(existingUser => 
        existingUser.email.toLowerCase() === user.email.toLowerCase()
      )
      
      if (exists) {
        return prev
      }
      
      return [...prev, user]
    })
  }

  const addUserAndLogin = (user: UserData) => {
    // Check if user already exists to prevent duplicates
    const exists = registeredUsers.some(existingUser => 
      existingUser.email.toLowerCase() === user.email.toLowerCase()
    )
    
    if (exists) {
      return
    }
    
    // Add user and login atomically
    setRegisteredUsers(prev => [...prev, user])
    setCurrentUser(user)
    setIsLoggedIn(true)
  }

  const login = (email: string): boolean => {
    const user = getUserByEmail(email)
    if (user) {
      setCurrentUser(user)
      setIsLoggedIn(true)
      return true
    }
    return false
  }

  const logout = () => {
    setCurrentUser(null)
    setIsLoggedIn(false)
    // Clear remembered form data
    localStorage.removeItem('signinEmail')
    localStorage.removeItem('signupFormData')
  }

  const isUserRegistered = (email: string): boolean => {
    return registeredUsers.some(user => 
      user.email.toLowerCase() === email.toLowerCase()
    )
  }

  const getUserByEmail = (email: string): UserData | undefined => {
    return registeredUsers.find(user => 
      user.email.toLowerCase() === email.toLowerCase()
    )
  }

  const clearUsers = () => {
    setRegisteredUsers([])
    setCurrentUser(null)
    setIsLoggedIn(false)
  }

  const value: AuthContextType = {
    registeredUsers,
    currentUser,
    isLoggedIn,
    addUser,
    addUserAndLogin,
    login,
    logout,
    isUserRegistered,
    getUserByEmail,
    clearUsers
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
