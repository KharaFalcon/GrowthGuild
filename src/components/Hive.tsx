import React, { useEffect, useState } from 'react'
import Badge, { BadgeType } from './Badge'

const STORAGE_KEY = 'hive-badges:v1'

const defaultBadges: BadgeType[] = [
  { id: 'b1', title: 'Welcome', description: 'Complete the intro', earned: true },
  { id: 'b2', title: 'Basics', description: 'Finish basics module', earned: false },
  { id: 'b3', title: 'Applied', description: 'Apply knowledge in exercises', earned: false },
  { id: 'b4', title: 'Collaborator', description: 'Help a peer', earned: false },
  { id: 'b5', title: 'Challenge', description: 'Complete a challenge', earned: false }
]

export default function Hive() {
  const [badges, setBadges] = useState<BadgeType[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return defaultBadges
      return JSON.parse(raw) as BadgeType[]
    } catch (e) {
      console.warn('Failed to parse badges from storage, using defaults', e)
      return defaultBadges
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(badges))
    } catch (e) {
      console.warn('Failed to persist badges to storage', e)
    }
  }, [badges])

  function toggle(id: string) {
    setBadges(prev => prev.map(b => (b.id === id ? { ...b, earned: !b.earned } : b)))
  }

  const total = badges.length
  const earned = badges.filter(b => b.earned).length
  const percent = total === 0 ? 0 : Math.round((earned / total) * 100)

  return (
    <section className="hive">
      <div className="hive-header">
        <div>
          <h2>Hive Progress</h2>
          <p>{earned} / {total} badges earned</p>
        </div>
        <div className="progress">
          <div className="progress-bar" aria-hidden>
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <div className="progress-percent">{percent}%</div>
        </div>
      </div>

      <div className="badge-grid">
        {badges.map(b => (
          <Badge key={b.id} badge={b} onToggle={toggle} />
        ))}
      </div>

      <div className="hive-actions">
        <button onClick={() => setBadges(defaultBadges)}>Reset to defaults</button>
        <button onClick={() => setBadges(prev => prev.map(b => ({ ...b, earned: true })))}>Mark all earned</button>
      </div>
    </section>
  )
}
