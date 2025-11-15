export type User = {
  id: string
  username: string
  email: string
  password: string // in a real app, this would be hashed on a backend
  profileIcon: string // bee emoji or icon name
  bio?: string
  createdAt: number
}

export type Badge = {
  id: string
  title: string
  description?: string
  earned: boolean
  earnedAt?: number
}

export type HiveData = {
  userId: string
  badges: Badge[]
  totalProgress: number // percent
}

export type Friend = {
  userId: string
  username: string
  profileIcon: string
  addedAt: number
}

export type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  register: (username: string, email: string, password: string) => boolean
  logout: () => void
  updateProfile: (profileIcon: string, bio: string) => void
}
