import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLearning } from '../context/LearningContext'
import { useGuild } from '../context/GuildContext'

// Memory Match Game
export function BeeMemoryMatch() {
  const { user } = useAuth()
  const { recordGameScore } = useLearning()
  const { beeSpecies, addBeeFragment, addTreasuryHoney, getPerkModifiers, getRandomSpeciesWeighted } = useGuild()
  const [cards, setCards] = useState<{ id: number; emoji: string; matched: boolean }[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)

  const EMOJIS = ['🐝', '🌼', '🍯', '🐛', '👑', '💛']

  useEffect(() => {
    initializeGame()
  }, [])

  function initializeGame() {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji, matched: false }))
    setCards(shuffled)
    setFlipped([])
    setScore(0)
    setMoves(0)
  }

  function handleCardClick(id: number) {
    if (flipped.includes(id) || cards[id].matched || flipped.length === 2) return

    const newFlipped = [...flipped, id]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(moves + 1)
      if (cards[newFlipped[0]].emoji === cards[newFlipped[1]].emoji) {
        const updated = cards.map(c =>
          c.id === newFlipped[0] || c.id === newFlipped[1] ? { ...c, matched: true } : c
        )
        setCards(updated)
        setScore(score + 10)
        setFlipped([])
      } else {
        setTimeout(() => setFlipped([]), 1000)
      }
    }
  }

  const isComplete = cards.every(c => c.matched)

  if (isComplete) {
    // reward the player: pick random bee species and award fragments + honey
    if (user) {
      const species = getRandomSpeciesWeighted() || beeSpecies[Math.floor(Math.random() * beeSpecies.length)]
      const mods = getPerkModifiers(user.id)
      const rarityBonusMap: Record<string, number> = { common: 0, uncommon: 5, rare: 10, epic: 20, legendary: 30 }
      const rarityBonus = rarityBonusMap[species.rarity] || 0
      const baseFragment = Math.floor((score / 2) * mods.gameScoreMultiplier)
      const fragment = Math.min(100, Math.max(10, baseFragment + rarityBonus + Math.round(baseFragment * mods.fragmentBonus)))
      const baseHoney = Math.floor((score / 5) * mods.gameScoreMultiplier)
      const honey = Math.max(5, baseHoney + Math.floor(rarityBonus / 2) + Math.round(baseHoney * mods.honeyBonus))
      try {
        addBeeFragment(user.id, species.id, fragment)
        addTreasuryHoney(user.id, honey)
        recordGameScore({ userId: user.id, gameId: 'memory-match', score: Math.round(score * mods.gameScoreMultiplier), completedAt: Date.now() })
      } catch (e) {
        console.warn('Failed to award rewards', e)
      }
    }
    return (
      <div className="game-result">
        <h2>🎉 You Won!</h2>
        <p>Score: {score} | Moves: {moves}</p>
        <button className="btn btn-primary" onClick={initializeGame}>
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="game-memory">
      <div className="game-stats">
        <span>Score: {score}</span>
        <span>Moves: {moves}</span>
      </div>
      <div className="memory-grid">
        {cards.map(card => (
          <button
            key={card.id}
            className={`memory-card ${flipped.includes(card.id) || card.matched ? 'flipped' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            <span className="memory-emoji">{card.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Word Hive - Hexagon spelling game
export function WordHive() {
  const WORDS = ['BEE', 'HONEY', 'HIVE', 'POLLEN', 'BUZZ', 'WAGGLE']
  const [currentWord, setCurrentWord] = useState(WORDS[0])
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const [message, setMessage] = useState('')

  const { user } = useAuth()
  const { recordGameScore } = useLearning()

  function handleSubmit() {
    if (input.toUpperCase() === currentWord) {
      setScore(score + 20)
      setMessage('✓ Correct!')
      if (wordIndex < WORDS.length - 1) {
        setTimeout(() => {
          setCurrentWord(WORDS[wordIndex + 1])
          setInput('')
          setMessage('')
          setWordIndex(wordIndex + 1)
        }, 1000)
      } else {
        setMessage('🎉 All words completed!')
      }
    } else {
      setMessage(`✗ Try again! (Hint: ${currentWord.length} letters)`)
    }
  }

  const { beeSpecies, addBeeFragment, addTreasuryHoney, getPerkModifiers, getRandomSpeciesWeighted } = useGuild()

  if (wordIndex >= WORDS.length && score > 0) {
    // award fragments + honey
    if (user) {
      const species = getRandomSpeciesWeighted() || beeSpecies[Math.floor(Math.random() * beeSpecies.length)]
      const mods = getPerkModifiers(user.id)
      const rarityBonusMap: Record<string, number> = { common: 0, uncommon: 5, rare: 10, epic: 20, legendary: 30 }
      const rarityBonus = rarityBonusMap[species.rarity] || 0
      const baseFragment = Math.floor((score / 2) * mods.gameScoreMultiplier)
      const fragment = Math.min(100, Math.max(5, baseFragment + rarityBonus + Math.round(baseFragment * mods.fragmentBonus)))
      const baseHoney = Math.floor((score / 4) * mods.gameScoreMultiplier)
      const honey = Math.max(3, baseHoney + Math.floor(rarityBonus / 3) + Math.round(baseHoney * mods.honeyBonus))
      try {
        addBeeFragment(user.id, species.id, fragment)
        addTreasuryHoney(user.id, honey)
        recordGameScore({ userId: user.id, gameId: 'word-hive', score: Math.round(score * mods.gameScoreMultiplier), completedAt: Date.now() })
      } catch (e) {
        console.warn('Failed to award rewards', e)
      }
    }

    return (
      <div className="game-result">
        <h2>🎉 All Done!</h2>
        <p>Final Score: {score}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="game-word-hive">
      <div className="game-stats">
        <span>Score: {score}</span>
        <span>Word {wordIndex + 1} / {WORDS.length}</span>
      </div>

      <div className="hexagon-large" style={{ fontSize: '48px', marginBottom: '20px' }}>
        🐝
      </div>

      <p className="word-hint">Spell this word:</p>
      <p className="word-display">{currentWord.split('').map((_, i) => '_').join(' ')}</p>

      <div className="word-input-group">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyPress={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Type the word..."
          autoFocus
        />
        <button className="btn btn-primary" onClick={handleSubmit}>
          Check
        </button>
      </div>

      {message && <p className={`word-message ${message.includes('✓') ? 'correct' : 'error'}`}>{message}</p>}
    </div>
  )
}

// Buzz Quiz Race - timed quiz
export function BuzzQuizRace() {
  const questions = [
    { q: 'What do bees make?', a: 'HONEY' },
    { q: 'How many legs do bees have?', a: '6' },
    { q: 'What is a bee home called?', a: 'HIVE' }
  ]

  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const { beeSpecies, addBeeFragment, addTreasuryHoney, getPerkModifiers, getRandomSpeciesWeighted } = useGuild()
  const { user } = useAuth()
  const { recordGameScore } = useLearning()
  const mods = user ? getPerkModifiers(user.id) : { gameTimeMultiplier: 1, gameScoreMultiplier: 1, fragmentBonus: 0, honeyBonus: 0 }
  const initialTime = Math.max(6, Math.round(30 * mods.gameTimeMultiplier))
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [input, setInput] = useState('')
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) {
      setGameOver(true)
      return
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft])

  function handleAnswer() {
    if (input.toUpperCase() === questions[currentQ].a.toUpperCase()) {
      setScore(score + 10)
      setInput('')
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1)
      } else {
        setGameOver(true)
      }
    }
  }

    if (gameOver) {
    // award based on score and remaining time
    if (user) {
      const species = getRandomSpeciesWeighted() || beeSpecies[Math.floor(Math.random() * beeSpecies.length)]
      const rarityBonusMap: Record<string, number> = { common: 0, uncommon: 5, rare: 10, epic: 20, legendary: 30 }
      const rarityBonus = rarityBonusMap[species.rarity] || 0
      const timeFactor = Math.round((initialTime - timeLeft) / Math.max(1, initialTime) * 10)
      const baseFragment = Math.floor((score / 2) * mods.gameScoreMultiplier)
      const fragment = Math.min(100, Math.max(5, baseFragment + Math.floor(timeLeft / 2) + rarityBonus + Math.round(baseFragment * mods.fragmentBonus)))
      const baseHoney = Math.floor((score / 3) * mods.gameScoreMultiplier)
      const honey = Math.max(5, baseHoney + Math.floor(timeLeft / 4) + Math.floor(rarityBonus / 4) + Math.round(baseHoney * mods.honeyBonus))
      try {
        addBeeFragment(user.id, species.id, fragment)
        addTreasuryHoney(user.id, honey)
        recordGameScore({ userId: user.id, gameId: 'buzz-race', score: Math.round(score * mods.gameScoreMultiplier), completedAt: Date.now(), time: initialTime - timeLeft })
      } catch (e) {
        console.warn('Failed to award rewards', e)
      }
    }
    return (
      <div className="game-result">
        <h2>🏁 Race Over!</h2>
        <p>Final Score: {score}</p>
        <p>Time Remaining: {timeLeft}s</p>
      </div>
    )
  }

  return (
    <div className="game-buzz-race">
      <div className="game-stats">
        <span>Score: {score}</span>
        <span className={`timer ${timeLeft < 10 ? 'warning' : ''}`}>⏱️ {timeLeft}s</span>
      </div>

      <div className="question-card">
        <p className="question-text">{questions[currentQ].q}</p>
        <div className="question-input-group">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAnswer()}
            placeholder="Answer quickly..."
            autoFocus
          />
          <button className="btn btn-primary" onClick={handleAnswer}>
            Answer
          </button>
        </div>
      </div>

      <p className="progress-text">
        Question {currentQ + 1} / {questions.length}
      </p>
    </div>
  )
}
