import React, { createContext, useContext, useState, useEffect } from 'react'
import { Friend, User } from '../types'

type FriendsContextType = {
  friends: Record<string, Friend[]> // userId -> list of friends
  addFriend: (userId: string, friendUser: User) => boolean
  removeFriend: (userId: string, friendId: string) => void
  getFriends: (userId: string) => Friend[]
  isFriend: (userId: string, friendId: string) => boolean
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined)

const FRIENDS_STORAGE_KEY = 'hive:friends'

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const [friends, setFriends] = useState<Record<string, Friend[]>>({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FRIENDS_STORAGE_KEY)
      if (stored) {
        setFriends(JSON.parse(stored))
      }
    } catch (e) {
      console.warn('Failed to load friends', e)
    }
  }, [])

  function saveFriends(data: Record<string, Friend[]>) {
    try {
      localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(data))
      setFriends(data)
    } catch (e) {
      console.warn('Failed to save friends', e)
    }
  }

  function addFriend(userId: string, friendUser: User): boolean {
    const userFriends = friends[userId] || []
    if (userFriends.some(f => f.userId === friendUser.id)) {
      return false // already friends
    }
    const newFriend: Friend = {
      userId: friendUser.id,
      username: friendUser.username,
      profileIcon: friendUser.profileIcon,
      addedAt: Date.now()
    }
    const updated = { ...friends, [userId]: [...userFriends, newFriend] }
    saveFriends(updated)
    return true
  }

  function removeFriend(userId: string, friendId: string) {
    const userFriends = friends[userId] || []
    const updated = { ...friends, [userId]: userFriends.filter(f => f.userId !== friendId) }
    saveFriends(updated)
  }

  function getFriends(userId: string): Friend[] {
    return friends[userId] || []
  }

  function isFriend(userId: string, friendId: string): boolean {
    return (friends[userId] || []).some(f => f.userId === friendId)
  }

  const value: FriendsContextType = {
    friends,
    addFriend,
    removeFriend,
    getFriends,
    isFriend
  }

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>
}

export function useFriends() {
  const ctx = useContext(FriendsContext)
  if (!ctx) throw new Error('useFriends must be called within FriendsProvider')
  return ctx
}
