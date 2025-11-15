import React, { useState } from 'react'
import { Flashcard } from '../types'
import { useAuth } from '../context/AuthContext'
import { useLearning } from '../context/LearningContext'

type Props = {
  flashcards: Flashcard[]
}

export default function FlashcardReviewer({ flashcards }: Props) {
  const { user } = useAuth()
  const { getFlashcardProgressForUser, recordFlashcardReview } = useLearning()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [mastered, setMastered] = useState<Set<string>>(new Set())

  if (!user || flashcards.length === 0) return null

  const current = flashcards[currentIndex]
  const progress = getFlashcardProgressForUser(user.id, current.id)
  const isMastered = mastered.has(current.id) || progress?.mastered

  function handleFlip() {
    setIsFlipped(!isFlipped)
  }

  function handleMastered() {
    recordFlashcardReview(user.id, current.id)
    const updated = new Set(mastered)
    updated.add(current.id)
    setMastered(updated)

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    } else {
      // Show completion
      alert('🎉 Great job! You\'ve reviewed all flashcards!')
    }
  }

  function handleNext() {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  return (
    <div className="flashcard-reviewer">
      <div className="flashcard-header">
        <h2>Flashcard Review 📚</h2>
        <div className="flashcard-counter">
          {currentIndex + 1} / {flashcards.length}
        </div>
      </div>

      <div className="flashcard-container">
        <div
          className={`flashcard ${isFlipped ? 'flipped' : ''} ${isMastered ? 'mastered' : ''}`}
          onClick={handleFlip}
        >
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <p>{current.front}</p>
              <small className="flashcard-hint">Click to reveal answer</small>
            </div>
            <div className="flashcard-back">
              <p>{current.back}</p>
              <small className="flashcard-hint">Click to flip back</small>
            </div>
          </div>
        </div>
      </div>

      {isFlipped && (
        <div className="flashcard-actions">
          <button className="btn" onClick={handleNext}>
            Skip
          </button>
          <button className="btn btn-primary" onClick={handleMastered}>
            Mastered! ✓
          </button>
        </div>
      )}

      <div className="flashcard-nav">
        <button className="btn" onClick={handlePrev} disabled={currentIndex === 0}>
          ← Prev
        </button>
        <button className="btn" onClick={handleNext} disabled={currentIndex === flashcards.length - 1}>
          Next →
        </button>
      </div>

      <div className="flashcard-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
        <small>Progress: {Math.round(((currentIndex + 1) / flashcards.length) * 100)}%</small>
      </div>
    </div>
  )
}
