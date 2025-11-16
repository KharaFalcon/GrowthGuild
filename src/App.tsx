import React, { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { HiveProvider } from './context/HiveContext'
import { FriendsProvider } from './context/FriendsContext'
import { LearningProvider } from './context/LearningContext'
import { GuildProvider } from './context/GuildContext'
import { FirebaseProvider, useFirebase } from './context/FirebaseContext'
import { RouterProvider, useRouter } from './context/RouterContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Friends from './pages/Friends'
import Settings from './pages/Settings'
import Courses from './pages/Courses'
import { HiveView } from './pages/HiveView'
import QuizBuilder from './pages/QuizBuilder'

type Page = 'login' | 'register' | 'dashboard' | 'profile' | 'friends' | 'settings' | 'courses' | 'hive' | 'quiz-builder'

function AppContent() {
  const { currentUser, loading, error } = useFirebase()
  const { page } = useRouter()

  React.useEffect(() => {
    console.log('[GrowthGuild] AppContent rendered, page=', page, 'currentUser=', currentUser?.email, 'loading=', loading, 'error=', error)
  }, [page, currentUser, loading, error])

  // Show loading state
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <p>Loading...</p>
      <p style={{ fontSize: '12px', color: '#666' }}>Connecting to Firebase...</p>
    </div>
  }

  // Show error if Firebase connection fails
  if (error) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      flexDirection: 'column', 
      color: '#d32f2f',
      fontFamily: 'sans-serif',
      backgroundColor: '#fff9e6',
      padding: '20px',
      textAlign: 'center'
    }}>
      <p style={{ fontSize: '48px' }}>⚠️</p>
      <p style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '0' }}>Firebase Error</p>
      <p style={{ fontSize: '14px', color: '#666', maxWidth: '400px', margin: '10px 0' }}>{error}</p>
      <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>
        ✓ Check `.env.local` has correct Firebase credentials<br/>
        ✓ Visit: https://console.firebase.google.com<br/>
        ✓ Restart dev server: npm run dev
      </p>
    </div>
  }

  // If not loading and not logged in, show auth pages
  if (!loading && !currentUser) {
    return page === 'login' ? <Login /> : <Register />
  }

  // If loading, show loading state
  if (loading) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      flexDirection: 'column', 
      fontFamily: 'sans-serif',
      backgroundColor: '#fff9e6',
      gap: '20px'
    }}>
      <div style={{ fontSize: '48px' }}>🐝</div>
      <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Loading GrowthGuild...</p>
      <p style={{ fontSize: '12px', color: '#666' }}>Connecting to Firebase</p>
      <div style={{ width: '100px', height: '3px', backgroundColor: '#FFD700', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', backgroundColor: '#FFC107', animation: 'pulse 1.5s infinite' }}></div>
      </div>
    </div>
  }

  // User is logged in, show app pages
  return (
    <>
      {page === 'dashboard' && <Dashboard />}
      {page === 'profile' && <Profile />}
      {page === 'friends' && <Friends />}
      {page === 'settings' && <Settings />}
      {page === 'courses' && <Courses />}
      {page === 'hive' && <HiveView />}
      {page === 'quiz-builder' && <QuizBuilder />}
    </>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('login')

  return (
    <FirebaseProvider>
      <AuthProvider>
        <HiveProvider>
          <FriendsProvider>
            <LearningProvider>
              <GuildProvider>
                <RouterProvider page={page} setPage={setPage}>
                  <AppContent />
                </RouterProvider>
              </GuildProvider>
            </LearningProvider>
          </FriendsProvider>
        </HiveProvider>
      </AuthProvider>
    </FirebaseProvider>
  )
}
