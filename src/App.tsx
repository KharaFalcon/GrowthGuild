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
  const { currentUser, loading } = useFirebase()
  const { page } = useRouter()

  React.useEffect(() => {
    console.log('[GrowthGuild] AppContent rendered, page=', page, 'currentUser=', currentUser?.email)
  }, [page, currentUser])

  // Show nothing while Firebase is loading
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading...</p>
    </div>
  }

  if (!currentUser) {
    return page === 'login' ? <Login /> : <Register />
  }

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
