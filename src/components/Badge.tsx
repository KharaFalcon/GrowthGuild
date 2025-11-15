import React from 'react'

export type BadgeType = {
  id: string
  title: string
  description?: string
  earned: boolean
}

type Props = {
  badge: BadgeType
  onToggle: (id: string) => void
}

export default function Badge({ badge, onToggle }: Props) {
  return (
    <button
      className={`badge-card ${badge.earned ? 'earned' : ''}`}
      onClick={() => onToggle(badge.id)}
      title={badge.description}
      aria-pressed={badge.earned}
    >
      <div className="badge-inner">
        <div className="badge-icon">{badge.earned ? '🏅' : '🔒'}</div>
        <div className="badge-meta">
          <strong>{badge.title}</strong>
          {badge.description && <small>{badge.description}</small>}
        </div>
      </div>
    </button>
  )
}
