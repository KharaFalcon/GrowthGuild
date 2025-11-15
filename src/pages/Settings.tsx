import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from '../context/RouterContext'

export default function Settings() {
  const { user, logout } = useAuth()
  const { setPage } = useRouter()

  if (!user) return null

  return (
    <div className="settings-page">
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

      <main className="settings-container">
        <h1 style={{ marginBottom: '24px' }}>Account Settings ⚙️</h1>

        <section className="settings-section">
          <h2>Account Information</h2>
          <div className="setting-item">
            <span className="setting-label">Username</span>
            <span className="setting-value">{user.username}</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Email</span>
            <span className="setting-value">{user.email}</span>
          </div>
          <div className="setting-item">
            <span className="setting-label">Member Since</span>
            <span className="setting-value">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </section>

        <section className="settings-section">
          <h2>Privacy</h2>
          <div className="setting-item">
            <span className="setting-label">Show Profile to Friends</span>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <span className="setting-label">Show Progress in Hive</span>
            <input type="checkbox" defaultChecked />
          </div>
        </section>

        <section className="settings-section">
          <h2>Notifications</h2>
          <div className="setting-item">
            <span className="setting-label">Badge Earned Notifications</span>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <span className="setting-label">Friend Requests</span>
            <input type="checkbox" defaultChecked />
          </div>
        </section>

        <section className="settings-section">
          <h2>Danger Zone</h2>
          <button className="btn btn-danger">
            Delete Account
          </button>
        </section>
      </main>
    </div>
  )
}
