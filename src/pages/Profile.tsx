import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from '../context/RouterContext'

const BEE_ICONS = ['🐝', '🐝', '👑', '🎓', '🌟', '💛']

export default function Profile() {
  const { user, logout, updateProfile } = useAuth()
  const { setPage } = useRouter()
  const [bio, setBio] = useState(user?.bio || '')
  const [selectedIcon, setSelectedIcon] = useState(user?.profileIcon || '🐝')
  const [saved, setSaved] = useState(false)

  if (!user) return null

  function handleSave() {
    updateProfile(selectedIcon, bio)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="profile-page">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="bee-icon">🐝</span>
          <span>HiveLearn</span>
        </div>
        <div className="navbar-menu">
          <button className="nav-link" onClick={() => setPage('dashboard')}>← Back</button>
          <button className="nav-link logout" onClick={() => { logout(); setPage('login') }}>
            Log Out
          </button>
        </div>
      </nav>

      <main className="profile-container">
        <section className="profile-header">
          <h1>Your Profile</h1>
        </section>

        <section className="profile-form">
          <div className="profile-field">
            <label>Username</label>
            <input type="text" value={user.username} disabled />
          </div>

          <div className="profile-field">
            <label>Email</label>
            <input type="email" value={user.email} disabled />
          </div>

          <div className="profile-field">
            <label>Profile Icon</label>
            <div className="icon-selector">
              {BEE_ICONS.map(icon => (
                <button
                  key={icon}
                  className={`icon-btn ${selectedIcon === icon ? 'active' : ''}`}
                  onClick={() => setSelectedIcon(icon)}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="profile-field">
            <label>Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={200}
            />
            <small>{bio.length}/200</small>
          </div>

          {saved && <div className="success-message">✓ Profile saved!</div>}

          <button className="btn btn-primary" onClick={handleSave}>
            Save Profile
          </button>
        </section>
      </main>
    </div>
  )
}
