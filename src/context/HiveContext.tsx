import React, { createContext, useContext, useState, useEffect } from 'react'
import { HiveData, Badge } from '../types'

type HiveContextType = {
  hiveData: Record<string, HiveData> // userId -> HiveData
  addBadge: (userId: string, badge: Badge) => void
  toggleBadge: (userId: string, badgeId: string) => void
  getBadgesForUser: (userId: string) => Badge[]
  getProgressForUser: (userId: string) => number
}

const HiveContext = createContext<HiveContextType | undefined>(undefined)

const HIVE_STORAGE_KEY = 'hive:badges'

const DEFAULT_BADGES: Badge[] = [
  { id: 'b1', title: 'Welcome', description: 'Complete the intro', earned: true },
  { id: 'b2', title: 'Basics', description: 'Finish basics module', earned: false },
  { id: 'b3', title: 'Applied', description: 'Apply knowledge', earned: false },
  { id: 'b4', title: 'Collaborator', description: 'Help a peer', earned: false },
  { id: 'b5', title: 'Challenge', description: 'Complete a challenge', earned: false }
]

export function HiveProvider({ children }: { children: React.ReactNode }) {
  const [hiveData, setHiveData] = useState<Record<string, HiveData>>({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HIVE_STORAGE_KEY)
      if (stored) {
        setHiveData(JSON.parse(stored))
      }
    } catch (e) {
      console.warn('Failed to load hive data', e)
    }
  }, [])

  function saveHiveData(data: Record<string, HiveData>) {
    try {
      localStorage.setItem(HIVE_STORAGE_KEY, JSON.stringify(data))
      setHiveData(data)
    } catch (e) {
      console.warn('Failed to save hive data', e)
    }
  }

  function ensureUserHive(userId: string): HiveData {
    if (!hiveData[userId]) {
      const newHive: HiveData = {
        userId,
        badges: DEFAULT_BADGES,
        totalProgress: calculateProgress(DEFAULT_BADGES)
      }
      const updated = { ...hiveData, [userId]: newHive }
      saveHiveData(updated)
      return newHive
    }
    return hiveData[userId]
  }

  function calculateProgress(badges: Badge[]): number {
    if (badges.length === 0) return 0
    const earned = badges.filter(b => b.earned).length
    return Math.round((earned / badges.length) * 100)
  }

  function toggleBadge(userId: string, badgeId: string) {
    const hive = ensureUserHive(userId)
    const updated = hive.badges.map(b =>
      b.id === badgeId ? { ...b, earned: !b.earned, earnedAt: !b.earned ? Date.now() : undefined } : b
    )
    const newHive = { ...hive, badges: updated, totalProgress: calculateProgress(updated) }
    const newData = { ...hiveData, [userId]: newHive }
    saveHiveData(newData)
  }

  function addBadge(userId: string, badge: Badge) {
    const hive = ensureUserHive(userId)
    const exists = hive.badges.some(b => b.id === badge.id)
    if (!exists) {
      const updated = [...hive.badges, badge]
      const newHive = { ...hive, badges: updated, totalProgress: calculateProgress(updated) }
      const newData = { ...hiveData, [userId]: newHive }
      saveHiveData(newData)
    }
  }

  function getBadgesForUser(userId: string): Badge[] {
    const hive = ensureUserHive(userId)
    return hive.badges
  }

  function getProgressForUser(userId: string): number {
    const hive = ensureUserHive(userId)
    return hive.totalProgress
  }

  const value: HiveContextType = {
    hiveData,
    addBadge,
    toggleBadge,
    getBadgesForUser,
    getProgressForUser
  }

  return <HiveContext.Provider value={value}>{children}</HiveContext.Provider>
}

export function useHive() {
  const ctx = useContext(HiveContext)
  if (!ctx) throw new Error('useHive must be called within HiveProvider')
  return ctx
}
