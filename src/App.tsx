import React from 'react'
import Hive from './components/Hive'

export default function App() {
  return (
    <div className="app-root">
      <header>
        <h1>Hive Badges — Learning Progress</h1>
        <p>Earn badges as you complete learning steps. The hive shows overall progress.</p>
      </header>

      <main>
        <Hive />
      </main>

      <footer>
        <small>Persisted to localStorage · Vite + React + TypeScript</small>
      </footer>
    </div>
  )
}
