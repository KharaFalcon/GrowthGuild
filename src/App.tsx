import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { HiveProvider } from './context/HiveContext'
import { FriendsProvider } from './context/FriendsContext'
import { RouterProvider, useRouter } from './context/RouterContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Friends from './pages/Friends'
import Settings from './pages/Settings'

type Page = 'login' | 'register' | 'dashboard' | 'profile' | 'friends' | 'settings'

function AppContent() {
  const { isAuthenticated } = useAuth()
  const { page } = useRouter()

  if (!isAuthenticated) {
    return page === 'login' ? <Login /> : <Register />
  }

  return (
    <>
      {page === 'dashboard' && <Dashboard />}
      {page === 'profile' && <Profile />}
      {page === 'friends' && <Friends />}
      {page === 'settings' && <Settings />}
    </>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('login')

  return (
    <AuthProvider>
      <HiveProvider>
        <FriendsProvider>
          <RouterProvider page={page} setPage={setPage}>
            <AppContent />
          </RouterProvider>
        </FriendsProvider>
      </HiveProvider>
    </AuthProvider>
  )
}
