import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  BeePerk,
  BeeRarity,
  BeeSpecies,
  CollectedBee,
  BeeEgg,
  HiveRoom,
  GuildHive
} from '../types'

type GuildContextType = {
  guildHive: GuildHive | null
  beeSpecies: BeeSpecies[]
  initializeGuild: (userId: string, hiveName: string) => void
  addBeeFragment: (userId: string, speciesId: string, fragment: number) => void
  collectBee: (userId: string, speciesId: string) => void
  levelUpBee: (userId: string, beeId: string, experience: number) => void
  renameBee: (userId: string, beeId: string, nickname: string) => void
  assignBeeToRoom: (userId: string, beeId: string, roomId: string) => void
  removeBeeFromRoom: (userId: string, beeId: string) => void
  unlockRoom: (userId: string) => void
  getActivePerks: (userId: string) => BeePerk[]
  getPerkModifiers: (userId: string) => {
    quizScoreBonus: number
    gameTimeMultiplier: number
    xpBonus: number
    honeyBonus: number
    fragmentBonus: number
    gameScoreMultiplier: number
    flashcardRetentionBonus: number
  }
  getRandomSpeciesWeighted: () => BeeSpecies | undefined
  getBeeById: (beeId: string) => CollectedBee | undefined
  addTreasuryHoney: (userId: string, amount: number) => void
}

const GuildContext = createContext<GuildContextType | undefined>(undefined)

const GUILD_STORAGE_KEY = 'hive:guild'
const BEE_SPECIES_STORAGE_KEY = 'hive:bee-species'

// Define all collectible bee species
const DEFAULT_BEE_SPECIES: BeeSpecies[] = [
  {
    id: 'bee-worker',
    name: 'Worker Bee',
    emoji: '🐝',
    rarity: 'common',
    primaryPerk: 'speed',
    secondaryPerk: 'energy',
    description: 'Reliable and steady. Provides a +5% speed boost to all activities.'
  },
  {
    id: 'bee-drone',
    name: 'Drone Bee',
    emoji: '🎯',
    rarity: 'uncommon',
    primaryPerk: 'focus',
    secondaryPerk: 'wisdom',
    description: 'Focused and thoughtful. +10% bonus to quiz scores when active.'
  },
  {
    id: 'bee-queen',
    name: 'Queen Bee',
    emoji: '👑',
    rarity: 'epic',
    primaryPerk: 'wisdom',
    secondaryPerk: 'inspiration',
    description: 'Regal and powerful. +20% experience gain from all learning activities.',
    unlockRequirement: { type: 'quiz-score', value: 80 }
  },
  {
    id: 'bee-scout',
    name: 'Scout Bee',
    emoji: '⚡',
    rarity: 'rare',
    primaryPerk: 'haste',
    secondaryPerk: 'speed',
    description: 'Quick and agile. Reduce game time limits by 20%.',
    unlockRequirement: { type: 'games-played', value: 10 }
  },
  {
    id: 'bee-guardian',
    name: 'Guardian Bee',
    emoji: '🛡️',
    rarity: 'rare',
    primaryPerk: 'focus',
    description: 'Protective and steady. Prevent quiz mistakes (-5% error rate).',
    unlockRequirement: { type: 'course-complete', value: 1 }
  },
  {
    id: 'bee-sage',
    name: 'Sage Bee',
    emoji: '📚',
    rarity: 'legendary',
    primaryPerk: 'wisdom',
    secondaryPerk: 'focus',
    description: 'Ancient knowledge keeper. +30% flashcard retention rate.',
    unlockRequirement: { type: 'friends-count', value: 3 }
  },
  {
    id: 'bee-lucky',
    name: 'Lucky Bee',
    emoji: '🍀',
    rarity: 'rare',
    primaryPerk: 'luck',
    secondaryPerk: 'energy',
    description: 'Fortune smiles upon this bee. +15% honey rewards from games.'
  }
  ,
  {
    id: 'bee-engineer',
    name: 'Engineer Bee',
    emoji: '🔧',
    rarity: 'uncommon',
    primaryPerk: 'wisdom',
    secondaryPerk: 'inspiration',
    description: 'Tinkerer of the hive. +10% XP and small quiz bonus.'
  },
  {
    id: 'bee-nectar',
    name: 'Nectar Bee',
    emoji: '🍯',
    rarity: 'common',
    primaryPerk: 'energy',
    description: 'Collects nectar efficiently. +5% fragment gain from games.'
  },
  {
    id: 'bee-ember',
    name: 'Ember Bee',
    emoji: '🔥',
    rarity: 'rare',
    primaryPerk: 'speed',
    description: 'Fiery and fast. Slightly increases game score multipliers.'
  },
  {
    id: 'bee-muse',
    name: 'Muse Bee',
    emoji: '🎵',
    rarity: 'epic',
    primaryPerk: 'inspiration',
    description: 'Inspires learners. Small quiz and XP bonuses.'
  }
]

// Default starting room configuration
const DEFAULT_ROOMS: HiveRoom[] = [
  {
    id: 'room-entrance',
    name: 'Entrance Hall',
    capacity: 3,
    level: 1,
    inhabitants: [],
    bonus: 'speed'
  },
  {
    id: 'room-nursery',
    name: 'Royal Nursery',
    capacity: 0, // unlock after level 5
    level: 0,
    inhabitants: []
  },
  {
    id: 'room-library',
    name: 'Knowledge Library',
    capacity: 0, // unlock after level 10
    level: 0,
    inhabitants: []
  },
  {
    id: 'room-throne',
    name: 'Throne Chamber',
    capacity: 0, // unlock after level 15
    level: 0,
    inhabitants: []
  }
]

export function GuildProvider({ children }: { children: React.ReactNode }) {
  const [guildHive, setGuildHive] = useState<GuildHive | null>(null)
  const [beeSpecies, setBeeSpecies] = useState<BeeSpecies[]>(DEFAULT_BEE_SPECIES)

  useEffect(() => {
    // Load bee species (mostly static, but could be customized)
    try {
      const stored = localStorage.getItem(BEE_SPECIES_STORAGE_KEY)
      if (stored) {
        setBeeSpecies(JSON.parse(stored))
      }
    } catch (e) {
      console.warn('Failed to load bee species', e)
    }
  }, [])

  function saveGuild(guild: GuildHive) {
    try {
      localStorage.setItem(GUILD_STORAGE_KEY, JSON.stringify(guild))
      setGuildHive(guild)
    } catch (e) {
      console.warn('Failed to save guild', e)
    }
  }

  function initializeGuild(userId: string, hiveName: string) {
    if (guildHive) return // already initialized

    const newGuild: GuildHive = {
      userId,
      hiveName,
      level: 1,
      experience: 0,
      rooms: DEFAULT_ROOMS,
      collectedBees: [],
      beeEggs: [],
      treasury: 0,
      createdAt: Date.now()
    }
    saveGuild(newGuild)
  }

  function addBeeFragment(userId: string, speciesId: string, fragment: number) {
    if (!guildHive || guildHive.userId !== userId) return

    const existing = guildHive.beeEggs.find(e => e.speciesId === speciesId)
    const updated = { ...guildHive }

    if (existing) {
      existing.fragment = Math.min(100, existing.fragment + fragment)
      if (existing.fragment >= 100) {
        // Hatch the egg
        const newBee: CollectedBee = {
          id: `bee-${Date.now()}`,
          userId,
          speciesId,
          level: 1,
          experience: 0,
          evolution: 'larva',
          joinedAt: Date.now(),
          active: false
        }
        updated.collectedBees.push(newBee)
        updated.beeEggs = updated.beeEggs.filter(e => e.speciesId !== speciesId)
      }
    } else {
      updated.beeEggs.push({
        id: `egg-${Date.now()}`,
        userId,
        speciesId,
        fragment,
        acquiredAt: Date.now()
      })
    }

    saveGuild(updated)
  }

  function collectBee(userId: string, speciesId: string) {
    if (!guildHive || guildHive.userId !== userId) return

    const newBee: CollectedBee = {
      id: `bee-${Date.now()}`,
      userId,
      speciesId,
      level: 1,
      experience: 0,
      evolution: 'larva',
      joinedAt: Date.now(),
      active: false
    }

    const updated = { ...guildHive, collectedBees: [...guildHive.collectedBees, newBee] }
    saveGuild(updated)
  }

  function levelUpBee(userId: string, beeId: string, experience: number) {
    if (!guildHive || guildHive.userId !== userId) return

    const updated = { ...guildHive }
    const bee = updated.collectedBees.find(b => b.id === beeId)

    if (bee) {
      bee.experience += experience

      // Level up: 100 exp per level
      while (bee.experience >= 100) {
        bee.level += 1
        bee.experience -= 100

        // Evolution stages: larva → pupa → adult → elder
        if (bee.level === 3 && bee.evolution === 'larva') bee.evolution = 'pupa'
        if (bee.level === 6 && bee.evolution === 'pupa') bee.evolution = 'adult'
        if (bee.level === 9 && bee.evolution === 'adult') bee.evolution = 'elder'
      }

      // Add experience to hive
      updated.experience += experience
      if (updated.experience >= updated.level * 200) {
        updated.level += 1
      }
    }

    saveGuild(updated)
  }

  function renameBee(userId: string, beeId: string, nickname: string) {
    if (!guildHive || guildHive.userId !== userId) return

    const updated = { ...guildHive }
    const bee = updated.collectedBees.find(b => b.id === beeId)
    if (bee) {
      bee.nickname = nickname
    }
    saveGuild(updated)
  }

  function assignBeeToRoom(userId: string, beeId: string, roomId: string) {
    if (!guildHive || guildHive.userId !== userId) return

    const updated = { ...guildHive }
    const bee = updated.collectedBees.find(b => b.id === beeId)
    const room = updated.rooms.find(r => r.id === roomId)

    if (bee && room && room.inhabitants.length < room.capacity) {
      // Remove from other rooms
      updated.rooms.forEach(r => {
        r.inhabitants = r.inhabitants.filter(id => id !== beeId)
      })
      // Add to target room
      room.inhabitants.push(beeId)
      bee.active = true
    }

    saveGuild(updated)
  }

  function removeBeeFromRoom(userId: string, beeId: string) {
    if (!guildHive || guildHive.userId !== userId) return

    const updated = { ...guildHive }
    const bee = updated.collectedBees.find(b => b.id === beeId)

    updated.rooms.forEach(r => {
      r.inhabitants = r.inhabitants.filter(id => id !== beeId)
    })

    if (bee) {
      bee.active = false
    }

    saveGuild(updated)
  }

  function unlockRoom(userId: string) {
    if (!guildHive || guildHive.userId !== userId) return

    const updated = { ...guildHive }
    let unlockedCount = updated.rooms.filter(r => r.level > 0).length

    // Unlock next room based on hive level
    const nextRoom = updated.rooms.find(r => r.level === 0 && unlockedCount < 3)
    if (nextRoom && updated.level >= (unlockedCount + 1) * 5) {
      nextRoom.level = 1
      nextRoom.capacity = 3
      unlockedCount += 1
    }

    saveGuild(updated)
  }

  function getActivePerks(userId: string): BeePerk[] {
    if (!guildHive || guildHive.userId !== userId) return []

    const perks: BeePerk[] = []
    const activeBees = guildHive.collectedBees.filter(b => b.active)

    activeBees.forEach(bee => {
      const species = beeSpecies.find(s => s.id === bee.speciesId)
      if (species) {
        perks.push(species.primaryPerk)
        if (species.secondaryPerk) perks.push(species.secondaryPerk)
      }
    })

    return [...new Set(perks)] // remove duplicates
  }

  function getPerkModifiers(userId: string) {
    const active = getActivePerks(userId)
    // default modifiers
    const modifiers = {
      quizScoreBonus: 0, // additive percent (0.10 = +10%)
      gameTimeMultiplier: 1, // multiplier (0.8 = 20% faster)
      xpBonus: 0,
      honeyBonus: 0,
      fragmentBonus: 0,
      gameScoreMultiplier: 1,
      flashcardRetentionBonus: 0
    }

    active.forEach(p => {
      switch (p) {
        case 'haste':
          modifiers.gameTimeMultiplier *= 0.8
          break
        case 'focus':
          modifiers.quizScoreBonus += 0.10
          break
        case 'wisdom':
          modifiers.xpBonus += 0.20
          modifiers.flashcardRetentionBonus += 0.30
          break
        case 'speed':
          modifiers.gameScoreMultiplier *= 1.05
          break
        case 'luck':
          modifiers.fragmentBonus += 0.10
          modifiers.honeyBonus += 0.15
          break
        case 'energy':
          modifiers.fragmentBonus += 0.05
          break
        case 'inspiration':
          modifiers.xpBonus += 0.10
          modifiers.quizScoreBonus += 0.05
          break
      }
    })

    // room bonuses: if rooms provide a bonus perk, give a small extra
    if (guildHive) {
      guildHive.rooms.forEach(r => {
        if (r.level > 0 && r.bonus) {
          switch (r.bonus) {
            case 'haste':
              modifiers.gameTimeMultiplier *= 0.95
              break
            case 'speed':
              modifiers.gameScoreMultiplier *= 1.02
              break
            case 'focus':
              modifiers.quizScoreBonus += 0.02
              break
          }
        }
      })
    }

    return modifiers
  }

  function getRandomSpeciesWeighted() {
    // weights by rarity
    const weights: Record<BeeRarity, number> = {
      common: 60,
      uncommon: 20,
      rare: 10,
      epic: 7,
      legendary: 3
    }
    const pool: { species: BeeSpecies; w: number }[] = beeSpecies.map(s => ({ species: s, w: weights[s.rarity] || 1 }))
    const total = pool.reduce((sum, p) => sum + p.w, 0)
    let r = Math.random() * total
    for (const p of pool) {
      r -= p.w
      if (r <= 0) return p.species
    }
    return pool.length ? pool[pool.length - 1].species : undefined
  }

  function getBeeById(beeId: string): CollectedBee | undefined {
    if (!guildHive) return undefined
    return guildHive.collectedBees.find(b => b.id === beeId)
  }

  function addTreasuryHoney(userId: string, amount: number) {
    if (!guildHive || guildHive.userId !== userId) return

    const updated = { ...guildHive, treasury: guildHive.treasury + amount }
    saveGuild(updated)
  }

  const value: GuildContextType = {
    guildHive,
    beeSpecies,
    initializeGuild,
    addBeeFragment,
    collectBee,
    levelUpBee,
    renameBee,
    assignBeeToRoom,
    removeBeeFromRoom,
    unlockRoom,
    getActivePerks,
    getPerkModifiers,
    getRandomSpeciesWeighted,
    getBeeById,
    addTreasuryHoney
  }

  return <GuildContext.Provider value={value}>{children}</GuildContext.Provider>
}

export function useGuild() {
  const ctx = useContext(GuildContext)
  if (!ctx) throw new Error('useGuild must be called within GuildProvider')
  return ctx
}
