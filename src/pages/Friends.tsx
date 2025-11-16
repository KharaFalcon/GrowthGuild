import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFriends } from '../context/FriendsContext'
import { useHive } from '../context/HiveContext'
import { useRouter } from '../context/RouterContext'

export default function Friends() {
  const { user, logout } = useAuth()
  const { getFriends, addFriend, removeFriend } = useFriends()
  const { getProgressForUser } = useHive()
  const { setPage } = useRouter()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  if (!user) return null

  const userId = user.id
  const friends = getFriends(userId)

  function handleAddFriend() {
    setError('')
    if (!username) {
      setError('Enter a username')
      return
    }

    try {
      const usersRaw = localStorage.getItem('hive:users')
      const users = usersRaw ? JSON.parse(usersRaw) : []
      const found = users.find((u: any) => u.username === username && u.id !== userId)
      if (!found) {
        setError('User not found')
        return
      }
      if (addFriend(userId, found)) {
        setUsername('')
      } else {
        setError('Already friends with this user')
      }
    } catch (e) {
      setError('Error adding friend')
    }
  }

  return (
    <div className="friends-page">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="bee-icon">🐝</span>
          <span>GrowthGuild</span>
        </div>
        <div className="navbar-menu">
          <button className="nav-link" onClick={() => setPage('dashboard')}>← Back</button>
          <button className="nav-link logout" onClick={() => { logout(); setPage('login') }}>
            Log Out
          </button>
        </div>
      </nav>

      <main className="friends-container">
        <section className="friends-header">
          <h1>Your Friends 👥</h1>
        </section>

        <section className="add-friend">
          <h2>Add a Friend</h2>
          <div className="add-friend-form">
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
            />
            <button className="btn btn-primary" onClick={handleAddFriend}>
              Add Friend
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </section>

        <section className="friends-list">
          <h2>Friends ({friends.length})</h2>
          {friends.length === 0 ? (
            <p className="empty-state">No friends yet. Add your first friend! 🐝</p>
          ) : (
            <div className="friend-cards">
              {friends.map(friend => {
                const progress = getProgressForUser(friend.userId)
                return (
                  <div key={friend.userId} className="friend-card">
                    <div className="friend-header">
                      <div className="friend-avatar">{friend.profileIcon}</div>
                      <div className="friend-info">
                        <h3>{friend.username}</h3>
                        <p>Progress: {progress}%</p>
                      </div>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => removeFriend(userId, friend.userId)}
                    >
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
