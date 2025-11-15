import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from '../context/RouterContext'

export default function Login() {
  const { login } = useAuth()
  const { setPage } = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!username || !password) {
      setError('Username and password required')
      return
    }
    if (login(username, password)) {
      setPage('dashboard')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="bee-logo">🐝</div>
        <h1>GrowthGuild</h1>
        <p className="tagline">Grow your skills together</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary">
            Log In
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <a onClick={() => setPage('register')}>Register</a>
        </p>
      </div>
    </div>
  )
}
