import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useHive } from '../context/HiveContext'
import { useGuild } from '../context/GuildContext'
import { useRouter } from '../context/RouterContext'
import Badge from '../components/Badge'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { getBadgesForUser, getProgressForUser, toggleBadge } = useHive()
  const { guildHive, initializeGuild } = useGuild()
  const { setPage } = useRouter()

  useEffect(() => {
    if (user && !guildHive) {
      initializeGuild(user.id, `${user.username}'s Hive`)
    }
  }, [user, guildHive, initializeGuild])

  if (!user) return null

  const badges = getBadgesForUser(user.id)
  const progress = getProgressForUser(user.id)

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="bee-icon">🐝</span>
          <span>GrowthGuild</span>
        </div>
        <div className="navbar-menu">
          <button className="nav-link" onClick={() => setPage('hive')}>🏰 Hive</button>
          <button className="nav-link" onClick={() => setPage('courses')}>Courses</button>
          <button className="nav-link" onClick={() => setPage('profile')}>Profile</button>
          <button className="nav-link" onClick={() => setPage('friends')}>Friends</button>
          <button className="nav-link" onClick={() => setPage('settings')}>Settings</button>
          <button className="nav-link logout" onClick={() => { logout(); setPage('login') }}>
            Log Out
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <section className="dashboard-header">
          <div className="user-greeting">
            <div className="user-avatar">{user.profileIcon}</div>
            <div>
              <h1>Welcome, {user.username}! 🐝</h1>
              <p>Keep learning and earning badges</p>
            </div>
          </div>
        </section>

        <section className="progress-section">
          <h2>Your Progress</h2>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-text">{progress}% Complete</div>
          </div>
        </section>

        <section className="badges-section">
          <h2>Your Badges 🏅</h2>
          <div className="badge-grid">
            {badges.map(badge => (
              <Badge
                key={badge.id}
                badge={badge}
                onToggle={() => toggleBadge(user.id, badge.id)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
