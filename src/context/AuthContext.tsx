import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, AuthContextType } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USERS_STORAGE_KEY = 'hive:users'
const CURRENT_USER_KEY = 'hive:current-user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CURRENT_USER_KEY)
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch (e) {
        console.warn('Failed to load current user', e)
      }
    }
  }, [])

  function getAllUsers(): User[] {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      console.warn('Failed to load users', e)
      return []
    }
  }

  function saveUsers(users: User[]) {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    } catch (e) {
      console.warn('Failed to save users', e)
    }
  }

  function login(username: string, password: string): boolean {
    const users = getAllUsers()
    const found = users.find(u => u.username === username && u.password === password)
    if (found) {
      setUser(found)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found))
      return true
    }
    return false
  }

  function register(username: string, email: string, password: string): boolean {
    const users = getAllUsers()
    if (users.some(u => u.username === username || u.email === email)) {
      return false // user or email already exists
    }
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      username,
      email,
      password,
      profileIcon: '🐝',
      bio: '',
      createdAt: Date.now()
    }
    users.push(newUser)
    saveUsers(users)
    setUser(newUser)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))
    return true
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  function updateProfile(profileIcon: string, bio: string) {
    if (!user) return
    const updated = { ...user, profileIcon, bio }
    setUser(updated)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated))
    
    // Update in users list
    const users = getAllUsers()
    const idx = users.findIndex(u => u.id === user.id)
    if (idx !== -1) {
      users[idx] = updated
      saveUsers(users)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be called within AuthProvider')
  return ctx
}
