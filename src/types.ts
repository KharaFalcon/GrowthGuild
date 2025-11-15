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

/* ===== Learning Content Types ===== */

export type QuizQuestion = {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

export type Quiz = {
  id: string
  title: string
  description: string
  courseId: string
  questions: QuizQuestion[]
  passingScore: number // e.g., 70
  timeLimit?: number // seconds
}

export type QuizResult = {
  userId: string
  quizId: string
  score: number // percent
  completedAt: number
  timeSpent?: number
}

export type Flashcard = {
  id: string
  front: string
  back: string
  courseId: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export type FlashcardProgress = {
  userId: string
  flashcardId: string
  timesReviewed: number
  lastReviewedAt: number
  mastered: boolean
}

export type MiniGame = {
  id: string
  title: string
  type: 'memory' | 'word-hive' | 'buzz-race' | 'matching'
  courseId: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export type GameScore = {
  userId: string
  gameId: string
  score: number
  completedAt: number
  time?: number
}

export type Course = {
  id: string
  title: string
  description: string
  icon: string // emoji
  quizzes: Quiz[]
  flashcards: Flashcard[]
  games: MiniGame[]
  badgeRewardId?: string // badge earned after completing course
}

export type CourseProgress = {
  userId: string
  courseId: string
  quizzesCompleted: string[] // quiz IDs
  gamesCompleted: string[] // game IDs
  flashcardsReviewed: number
  progressPercent: number
  completedAt?: number
}

/* ===== Bee & Guild System Types ===== */

export type BeePerk = 'haste' | 'focus' | 'wisdom' | 'speed' | 'luck' | 'energy' | 'inspiration'

export type BeeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type BeeSpecies = {
  id: string
  name: string
  emoji: string
  rarity: BeeRarity
  primaryPerk: BeePerk
  secondaryPerk?: BeePerk
  description: string
  unlockRequirement?: {
    type: 'quiz-score' | 'games-played' | 'course-complete' | 'friends-count'
    value: number
  }
}

export type CollectedBee = {
  id: string // unique instance id
  userId: string
  speciesId: string
  level: number // 1-10
  experience: number
  evolution: 'larva' | 'pupa' | 'adult' | 'elder' // evolves at level 3, 6, 9
  joinedAt: number
  nickname?: string
  active: boolean // assigned to hive chamber
}

export type BeeEgg = {
  id: string
  userId: string
  speciesId: string
  fragment: number // 0-100; when 100, hatches into CollectedBee
  acquiredAt: number
}

export type HiveRoom = {
  id: string
  name: string
  capacity: number // how many bees can live here
  level: number // 1-5
  inhabitants: string[] // bee IDs currently in this room
  bonus?: BeePerk // room provides perk bonus
}

export type GuildHive = {
  userId: string
  hiveName: string
  level: number // grows with experience
  experience: number
  rooms: HiveRoom[]
  collectedBees: CollectedBee[]
  beeEggs: BeeEgg[] // fragments from games
  treasury: number // honey/resources earned from learning
  createdAt: number
}

export type HiveRoomBonus = {
  roomId: string
  perk: BeePerk
  bonusPercent: number // e.g., +10% quiz bonus when haste room is active
}
