import React, { createContext, useContext, useState, useEffect } from 'react'
import { Course, Quiz, Flashcard, MiniGame, QuizResult, GameScore, FlashcardProgress, CourseProgress } from '../types'

type LearningContextType = {
  courses: Course[]
  getCourseById: (id: string) => Course | undefined
  addCourse: (course: Course) => void
  // Quiz tracking
  getQuizResultsForUser: (userId: string) => QuizResult[]
  recordQuizResult: (result: QuizResult) => void
  // Game tracking
  getGameScoresForUser: (userId: string) => GameScore[]
  recordGameScore: (score: GameScore) => void
  // Flashcard progress
  getFlashcardProgressForUser: (userId: string, flashcardId: string) => FlashcardProgress | undefined
  recordFlashcardReview: (userId: string, flashcardId: string) => void
  // Course progress
  getCourseProgressForUser: (userId: string, courseId: string) => CourseProgress
  updateCourseProgress: (progress: CourseProgress) => void
}

const LearningContext = createContext<LearningContextType | undefined>(undefined)

const QUIZ_RESULTS_KEY = 'hive:quiz-results'
const GAME_SCORES_KEY = 'hive:game-scores'
const FLASHCARD_PROGRESS_KEY = 'hive:flashcard-progress'
const COURSE_PROGRESS_KEY = 'hive:course-progress'

// Default sample courses
const DEFAULT_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Bee Biology 101',
    description: 'Learn the fascinating world of honeybees',
    icon: '🐝',
    quizzes: [
      {
        id: 'quiz-1',
        title: 'Bee Anatomy',
        description: 'Test your knowledge of bee body parts',
        courseId: 'course-1',
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            question: 'What do honeybees use to carry pollen?',
            options: ['Legs', 'Mouths', 'Wings', 'Antennae'],
            correctIndex: 0,
            explanation: 'Bees have specialized hairs on their back legs called pollen baskets!'
          },
          {
            id: 'q2',
            question: 'How many eyes do bees have?',
            options: ['2', '3', '5', '6'],
            correctIndex: 2,
            explanation: 'Bees have 5 eyes: 2 large compound eyes and 3 small ocelli on top.'
          }
        ]
      }
    ],
    flashcards: [
      {
        id: 'fc-1',
        front: 'What is the role of the queen bee?',
        back: 'To lay eggs and produce pheromones that organize the hive',
        courseId: 'course-1',
        difficulty: 'easy'
      },
      {
        id: 'fc-2',
        front: 'What is the waggle dance?',
        back: 'A dance honeybees use to communicate the location of food sources',
        courseId: 'course-1',
        difficulty: 'medium'
      }
    ],
    games: [
      {
        id: 'game-1',
        title: 'Bee Memory Match',
        type: 'memory',
        courseId: 'course-1',
        description: 'Match bee facts and images',
        difficulty: 'easy'
      },
      {
        id: 'game-2',
        title: 'Word Hive',
        type: 'word-hive',
        courseId: 'course-1',
        description: 'Complete spelling words in a hexagon pattern',
        difficulty: 'medium'
      }
    ],
    badgeRewardId: 'b2'
  },
  {
    id: 'course-2',
    title: 'Hive Coding 101',
    description: 'Learn programming basics with bee-themed challenges',
    icon: '💻',
    quizzes: [],
    flashcards: [],
    games: [
      {
        id: 'game-3',
        title: 'Buzz Quiz Race',
        type: 'buzz-race',
        courseId: 'course-2',
        description: 'Race through coding questions before the timer runs out',
        difficulty: 'hard'
      }
    ],
    badgeRewardId: 'b3'
  }
]

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(DEFAULT_COURSES)
  const [quizResults, setQuizResults] = useState<QuizResult[]>([])
  const [gameScores, setGameScores] = useState<GameScore[]>([])
  const [flashcardProgress, setFlashcardProgress] = useState<FlashcardProgress[]>([])
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const qr = localStorage.getItem(QUIZ_RESULTS_KEY)
      if (qr) setQuizResults(JSON.parse(qr))
      const gs = localStorage.getItem(GAME_SCORES_KEY)
      if (gs) setGameScores(JSON.parse(gs))
      const fp = localStorage.getItem(FLASHCARD_PROGRESS_KEY)
      if (fp) setFlashcardProgress(JSON.parse(fp))
      const cp = localStorage.getItem(COURSE_PROGRESS_KEY)
      if (cp) setCourseProgress(JSON.parse(cp))
    } catch (e) {
      console.warn('Failed to load learning data', e)
    }
  }, [])

  function getCourseById(id: string) {
    return courses.find(c => c.id === id)
  }

  function addCourse(course: Course) {
    const updated = [...courses, course]
    setCourses(updated)
  }

  function getQuizResultsForUser(userId: string) {
    return quizResults.filter(r => r.userId === userId)
  }

  function recordQuizResult(result: QuizResult) {
    const updated = [...quizResults, result]
    setQuizResults(updated)
    try {
      localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn('Failed to save quiz result', e)
    }
  }

  function getGameScoresForUser(userId: string) {
    return gameScores.filter(s => s.userId === userId)
  }

  function recordGameScore(score: GameScore) {
    const updated = [...gameScores, score]
    setGameScores(updated)
    try {
      localStorage.setItem(GAME_SCORES_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn('Failed to save game score', e)
    }
  }

  function getFlashcardProgressForUser(userId: string, flashcardId: string) {
    return flashcardProgress.find(p => p.userId === userId && p.flashcardId === flashcardId)
  }

  function recordFlashcardReview(userId: string, flashcardId: string) {
    const existing = flashcardProgress.find(p => p.userId === userId && p.flashcardId === flashcardId)
    let updated: FlashcardProgress[]
    if (existing) {
      updated = flashcardProgress.map(p =>
        p.userId === userId && p.flashcardId === flashcardId
          ? { ...p, timesReviewed: p.timesReviewed + 1, lastReviewedAt: Date.now() }
          : p
      )
    } else {
      updated = [...flashcardProgress, { userId, flashcardId, timesReviewed: 1, lastReviewedAt: Date.now(), mastered: false }]
    }
    setFlashcardProgress(updated)
    try {
      localStorage.setItem(FLASHCARD_PROGRESS_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn('Failed to save flashcard progress', e)
    }
  }

  function getCourseProgressForUser(userId: string, courseId: string): CourseProgress {
    const existing = courseProgress.find(p => p.userId === userId && p.courseId === courseId)
    if (existing) return existing
    return {
      userId,
      courseId,
      quizzesCompleted: [],
      gamesCompleted: [],
      flashcardsReviewed: 0,
      progressPercent: 0
    }
  }

  function updateCourseProgress(progress: CourseProgress) {
    const updated = courseProgress.filter(p => !(p.userId === progress.userId && p.courseId === progress.courseId))
    updated.push(progress)
    setCourseProgress(updated)
    try {
      localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(updated))
    } catch (e) {
      console.warn('Failed to save course progress', e)
    }
  }

  const value: LearningContextType = {
    courses,
    getCourseById,
    addCourse,
    getQuizResultsForUser,
    recordQuizResult,
    getGameScoresForUser,
    recordGameScore,
    getFlashcardProgressForUser,
    recordFlashcardReview,
    getCourseProgressForUser,
    updateCourseProgress
  }

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>
}

export function useLearning() {
  const ctx = useContext(LearningContext)
  if (!ctx) throw new Error('useLearning must be called within LearningProvider')
  return ctx
}
