import React, { useState } from 'react'
import { Quiz, QuizQuestion } from '../types'
import { useAuth } from '../context/AuthContext'
import { useLearning } from '../context/LearningContext'
import { useHive } from '../context/HiveContext'
import { useGuild } from '../context/GuildContext'

type Props = {
  quiz: Quiz
  onComplete?: (score: number) => void
}

export default function QuizPlayer({ quiz, onComplete }: Props) {
  const { user } = useAuth()
  const { recordQuizResult } = useLearning()
  const { toggleBadge } = useHive()
  const { getPerkModifiers } = useGuild()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(new Array(quiz.questions.length).fill(null))
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  if (!user) return null

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isAnswered = selectedAnswers[currentQuestionIndex] !== null

  function handleSelectAnswer(index: number) {
    const updated = [...selectedAnswers]
    updated[currentQuestionIndex] = index
    setSelectedAnswers(updated)
  }

  function handleNext() {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  function handlePrev() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  function handleSubmit() {
    if (!user) return
    // Calculate score
    let correct = 0
    quiz.questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctIndex) {
        correct++
      }
    })
    const rawScore = Math.round((correct / quiz.questions.length) * 100)
    // apply guild/bee quiz modifiers
    const { getPerkModifiers } = useGuild()
    const mods = getPerkModifiers(user.id)
    const finalScore = Math.min(100, Math.round(rawScore * (1 + (mods.quizScoreBonus || 0))))
    setScore(finalScore)
    setShowResults(true)

    // Record result
    recordQuizResult({
      userId: user.id,
      quizId: quiz.id,
      score: finalScore,
      completedAt: Date.now()
    })

    // Award badge if passing
    if (finalScore >= quiz.passingScore) {
      // In real app, check course and award badge
    }

    onComplete?.(finalScore)
  }

  if (showResults) {
    const passed = score >= quiz.passingScore
    return (
      <div className="quiz-results">
        <div className={`results-card ${passed ? 'passed' : 'failed'}`}>
          <div className="results-icon">{passed ? '🎉' : '🤔'}</div>
          <h2>{passed ? 'Great Job!' : 'Keep Learning!'}</h2>
          <div className="results-score">
            <span className="score-value">{score}%</span>
            <span className="score-label">Score</span>
          </div>
          <p className="results-message">
            {passed
              ? `Excellent! You passed with ${score}%`
              : `You scored ${score}%. Need ${quiz.passingScore}% to pass.`}
          </p>

          <div className="results-breakdown">
            <h3>Answer Review</h3>
            {quiz.questions.map((q, i) => {
              const isCorrect = selectedAnswers[i] === q.correctIndex
              return (
                <div key={q.id} className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="review-icon">{isCorrect ? '✓' : '✗'}</div>
                  <div className="review-content">
                    <p className="review-question">{q.question}</p>
                    <p className="review-answer">
                      Your answer: <strong>{q.options[selectedAnswers[i]!]}</strong>
                    </p>
                    {!isCorrect && (
                      <p className="review-correct">
                        Correct: <strong>{q.options[q.correctIndex]}</strong>
                      </p>
                    )}
                    {q.explanation && <p className="review-explanation">💡 {q.explanation}</p>}
                  </div>
                </div>
              )
            })}
          </div>

          <button className="btn btn-primary" onClick={() => window.history.back()}>
            Back to Course
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-player">
      <div className="quiz-header">
        <h1>{quiz.title}</h1>
        <div className="quiz-progress">
          <span>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="quiz-content">
        <div className="question-card">
          <h2 className="question-text">🐝 {currentQuestion.question}</h2>

          <div className="options">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${selectedAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}
                onClick={() => handleSelectAnswer(index)}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="quiz-actions">
        <button className="btn" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
          ← Previous
        </button>

        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <button className="btn btn-primary" onClick={handleNext} disabled={!isAnswered}>
            Next →
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!isAnswered}>
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  )
}
