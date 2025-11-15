import React from 'react'

export type BadgeType = {
  id: string
  title: string
  description?: string
  earned: boolean
}

type Props = {
  badge: BadgeType
  onToggle?: (id: string) => void
}

export default function Badge({ badge, onToggle }: Props) {
  return (
    <button
      className={`badge-card ${badge.earned ? 'earned' : ''} hexagon`}
      onClick={() => onToggle?.(badge.id)}
      title={badge.description}
      aria-pressed={badge.earned}
    >
      <div className="hexagon-content">
        <div className="badge-icon">{badge.earned ? '🐝' : '🔒'}</div>
        <div className="badge-title">{badge.title}</div>
      </div>
    </button>
  )
}
