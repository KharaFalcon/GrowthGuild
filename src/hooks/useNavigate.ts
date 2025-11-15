import { useState } from 'react'

type Page = 'login' | 'register' | 'dashboard' | 'profile' | 'friends' | 'settings'

export function useNavigate() {
  const [page, setPage] = useState<Page>('login')
  return (newPage: Page) => setPage(newPage)
}

// Simple router state hook
export function useRouter() {
  const [page, setPage] = useState<Page>('login')
  return { page, setPage }
}
