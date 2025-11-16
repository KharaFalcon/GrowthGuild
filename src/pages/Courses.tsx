import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLearning } from '../context/LearningContext'
import { useRouter } from '../context/RouterContext'
import QuizPlayer from '../components/QuizPlayer'
import FlashcardReviewer from '../components/FlashcardReviewer'
import { BeeMemoryMatch, WordHive, BuzzQuizRace } from '../components/MiniGames'

type ContentType = 'courses' | 'quiz' | 'flashcards' | 'game'

export default function Courses() {
  const { user, logout } = useAuth()
  const { courses, getCourseProgressForUser } = useLearning()
  const { setPage } = useRouter()
  const [selectedCourse, setSelectedCourse] = useState(courses[0])
  const [contentType, setContentType] = useState<ContentType>('courses')
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null)
  const [selectedGame, setSelectedGame] = useState<any>(null)

  if (!user) return null

  function renderGameComponent() {
    if (!selectedGame) return null
    switch (selectedGame.type) {
      case 'memory':
        return <BeeMemoryMatch />
      case 'word-hive':
        return <WordHive />
      case 'buzz-race':
        return <BuzzQuizRace />
      default:
        return <div>Game not found</div>
    }
  }

  return (
    <div className="courses-page">
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="bee-icon">🐝</span>
          <span>HiveLearn</span>
        </div>
        <div className="navbar-menu">
          <button className="nav-link" onClick={() => setPage('dashboard')}>Dashboard</button>
          <button className="nav-link" onClick={() => setPage('friends')}>Friends</button>
          <button className="nav-link" onClick={() => setPage('settings')}>Settings</button>
          <button className="nav-link logout" onClick={() => { logout(); setPage('login') }}>
            Log Out
          </button>
        </div>
      </nav>

      <main className="courses-container">
        {contentType === 'courses' && (
          <section className="courses-hub">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1>📚 Learning Courses</h1>
              <button
                className="btn btn-primary"
                onClick={() => setPage('quiz-builder')}
                style={{ marginTop: 0 }}
              >
                ✨ Create Quiz
              </button>
            </div>
            <div className="courses-grid">
              {courses.map(course => {
                const progress = getCourseProgressForUser(user.id, course.id)
                return (
                  <div key={course.id} className="course-card">
                    <div className="course-icon">{course.icon}</div>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>

                    <div className="course-content-summary">
                      <span>📝 {course.quizzes.length} Quiz{course.quizzes.length !== 1 ? 'zes' : ''}</span>
                      <span>📚 {course.flashcards.length} Flashcards</span>
                      <span>🎮 {course.games.length} Games</span>
                    </div>

                    <div className="course-progress-bar">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${progress.progressPercent}%` }}
                        />
                      </div>
                      <small>{progress.progressPercent}% complete</small>
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedCourse(course)
                        setContentType('quiz')
                      }}
                    >
                      Start Course
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {contentType === 'quiz' && selectedQuiz && (
          <section className="course-content">
            <button className="back-btn" onClick={() => setContentType('courses')}>
              ← Back to Courses
            </button>
            <QuizPlayer
              quiz={selectedQuiz}
              onComplete={() => {
                setTimeout(() => setContentType('flashcards'), 1500)
              }}
            />
          </section>
        )}

        {contentType === 'quiz' && !selectedQuiz && selectedCourse && (
          <section className="course-content">
            <button className="back-btn" onClick={() => setContentType('courses')}>
              ← Back to Courses
            </button>
            <h2>{selectedCourse.title}</h2>
            <div className="content-tabs">
              <h3>📝 Quizzes</h3>
              {selectedCourse.quizzes.length === 0 ? (
                <p>No quizzes available</p>
              ) : (
                <div className="content-list">
                  {selectedCourse.quizzes.map(quiz => (
                    <button
                      key={quiz.id}
                      className="content-item"
                      onClick={() => setSelectedQuiz(quiz)}
                    >
                      <span>📝 {quiz.title}</span>
                      <small>{quiz.description}</small>
                    </button>
                  ))}
                </div>
              )}

              <h3 style={{ marginTop: '24px' }}>📚 Flashcards</h3>
              {selectedCourse.flashcards.length === 0 ? (
                <p>No flashcards available</p>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => setContentType('flashcards')}
                >
                  Review Flashcards
                </button>
              )}

              <h3 style={{ marginTop: '24px' }}>🎮 Mini-Games</h3>
              {selectedCourse.games.length === 0 ? (
                <p>No games available</p>
              ) : (
                <div className="content-list">
                  {selectedCourse.games.map(game => (
                    <button
                      key={game.id}
                      className="content-item"
                      onClick={() => {
                        setSelectedGame(game)
                        setContentType('game')
                      }}
                    >
                      <span>🎮 {game.title}</span>
                      <small>{game.description}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {contentType === 'flashcards' && selectedCourse && (
          <section className="course-content">
            <button className="back-btn" onClick={() => setContentType('quiz')}>
              ← Back
            </button>
            <FlashcardReviewer flashcards={selectedCourse.flashcards} />
          </section>
        )}

        {contentType === 'game' && selectedGame && (
          <section className="course-content">
            <button className="back-btn" onClick={() => setContentType('quiz')}>
              ← Back
            </button>
            <h2>🎮 {selectedGame.title}</h2>
            {renderGameComponent()}
          </section>
        )}
      </main>
    </div>
  )
}
