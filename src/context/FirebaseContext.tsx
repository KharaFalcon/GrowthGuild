import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth'
import { collection, doc, setDoc, getDoc, query, where, getDocs, updateDoc, addDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

export interface FirebaseContextType {
  currentUser: FirebaseUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
  // Firestore helpers
  saveUserData: (userId: string, userData: Record<string, any>) => Promise<void>
  getUserData: (userId: string) => Promise<Record<string, any> | null>
  saveQuiz: (userId: string, quizData: Record<string, any>) => Promise<string>
  getQuizzes: (userId: string) => Promise<any[]>
  getPublicQuizzes: () => Promise<any[]>
  updateQuiz: (quizId: string, updates: Record<string, any>) => Promise<void>
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined)

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Listen for auth state changes
  useEffect(() => {
    console.log('[Firebase] Initializing auth state listener...')
    console.log('[Firebase] Config:', {
      projectId: auth.app.options.projectId,
      authDomain: auth.app.options.authDomain
    })
    let isMounted = true
    let timeoutCleared = false
    
    // Add a timeout to prevent infinite loading - reduced to 2 seconds
    const timeout = setTimeout(() => {
      if (isMounted && loading && !timeoutCleared) {
        console.warn('[Firebase] Auth check timeout (2s) - setting loading to false, proceeding with no user')
        timeoutCleared = true
        setLoading(false)
      }
    }, 2000)

    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log('[Firebase] Auth state changed:', user?.email ? `Logged in as ${user.email}` : 'No user logged in')
        if (isMounted && !timeoutCleared) {
          setCurrentUser(user)
          setLoading(false)
          timeoutCleared = true
          clearTimeout(timeout)
        }
      }, (err: any) => {
        console.error('[Firebase] Auth error:', err?.code || err?.message || err)
        if (isMounted && !timeoutCleared) {
          setError(err?.message || 'Unknown Firebase error')
          setLoading(false)
          timeoutCleared = true
          clearTimeout(timeout)
        }
      })

      return () => {
        isMounted = false
        if (!timeoutCleared) {
          clearTimeout(timeout)
        }
        unsubscribe()
      }
    } catch (err: any) {
      console.error('[Firebase] Setup error:', err?.message || err)
      if (isMounted && !timeoutCleared) {
        setError(err?.message || 'Firebase initialization failed')
        setLoading(false)
        timeoutCleared = true
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const register = async (email: string, password: string, username: string) => {
    try {
      setError(null)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // Save user data to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        username,
        createdAt: Timestamp.now(),
        avatar: '🐝',
      })
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Firestore helpers
  const saveUserData = async (userId: string, userData: Record<string, any>) => {
    try {
      await setDoc(doc(db, 'users', userId), userData, { merge: true })
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const getUserData = async (userId: string) => {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId))
      return docSnap.exists() ? docSnap.data() : null
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const saveQuiz = async (userId: string, quizData: Record<string, any>) => {
    try {
      const docRef = await addDoc(collection(db, 'quizzes'), {
        ...quizData,
        createdBy: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isPublic: false,
      })
      return docRef.id
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const getQuizzes = async (userId: string) => {
    try {
      const q = query(collection(db, 'quizzes'), where('createdBy', '==', userId))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const getPublicQuizzes = async () => {
    try {
      const q = query(collection(db, 'quizzes'), where('isPublic', '==', true))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateQuiz = async (quizId: string, updates: Record<string, any>) => {
    try {
      await updateDoc(doc(db, 'quizzes', quizId), {
        ...updates,
        updatedAt: Timestamp.now(),
      })
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const value: FirebaseContextType = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    saveUserData,
    getUserData,
    saveQuiz,
    getQuizzes,
    getPublicQuizzes,
    updateQuiz,
  }

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
}

export function useFirebase() {
  const ctx = useContext(FirebaseContext)
  if (!ctx) throw new Error('useFirebase must be called within FirebaseProvider')
  return ctx
}
