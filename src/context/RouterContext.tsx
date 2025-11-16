import React, { createContext, useContext } from 'react'

type Page = 'login' | 'register' | 'dashboard' | 'profile' | 'friends' | 'settings' | 'courses' | 'hive' | 'quiz-builder'

type RouterContextType = {
  page: Page
  setPage: (newPage: Page) => void
}

const RouterContext = createContext<RouterContextType | undefined>(undefined)

export function RouterProvider({ children, page, setPage }: { children: React.ReactNode; page: Page; setPage: (p: Page) => void }) {
  return (
    <RouterContext.Provider value={{ page, setPage }}>
      {children}
    </RouterContext.Provider>
  )
}

export function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useRouter must be called within RouterProvider')
  return ctx
}
