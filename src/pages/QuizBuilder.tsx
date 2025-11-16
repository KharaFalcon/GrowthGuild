import React, { useState } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'
import { useFirebase } from '../context/FirebaseContext'
import { generateQuizQuestions, generateQuizTitle } from '../utils/aiQuizGenerator'

interface QuestionInput {
  question: string
  options: [string, string, string, string]
  correctAnswer: string
  explanation?: string
}

export default function QuizBuilder() {
  const { setPage } = useRouter()
  const { user } = useAuth()
  const { saveQuiz } = useFirebase()

  const [step, setStep] = useState<'mode' | 'manual' | 'ai'>('mode')
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [questions, setQuestions] = useState<QuestionInput[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<QuestionInput>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [numQuestionsToGenerate, setNumQuestionsToGenerate] = useState(5)

  if (!user) return null

  // Handle AI Generation
  const handleGenerateWithAI = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setAiGenerating(true)
    setError('')
    try {
      // Generate title if not provided
      if (!title) {
        const generatedTitle = await generateQuizTitle(topic)
        setTitle(generatedTitle)
      }

      // Generate questions
      const generatedQuestions = await generateQuizQuestions(topic, numQuestionsToGenerate, difficulty)
      // Convert to QuestionInput format
      const formattedQuestions = generatedQuestions.map(q => ({
        question: q.question,
        options: q.options as [string, string, string, string],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }))
      setQuestions(formattedQuestions)
      setStep('manual') // Allow editing before saving
    } catch (err) {
      setError(`Failed to generate questions: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setAiGenerating(false)
    }
  }

  // Handle adding/editing questions manually
  const handleAddQuestion = () => {
    if (!currentQuestion.question.trim()) {
      setError('Please enter a question')
      return
    }
    if (currentQuestion.options.some(o => !o.trim())) {
      setError('Please fill in all options')
      return
    }
    if (!currentQuestion.correctAnswer) {
      setError('Please select the correct answer')
      return
    }

    setQuestions([...questions, currentQuestion])
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
    })
    setError('')
  }

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  // Save quiz to Firebase
  const handleSaveQuiz = async () => {
    if (!title.trim()) {
      setError('Please enter a quiz title')
      return
    }
    if (questions.length === 0) {
      setError('Please add at least one question')
      return
    }

    setLoading(true)
    setError('')
    try {
      const quizData = {
        title,
        description: `Quiz about ${topic}`,
        questions,
        createdBy: user.username,
        userId: user.id,
      }
      const quizId = await saveQuiz(user.id, quizData)
      console.log('Quiz saved with ID:', quizId)
      // Navigate back to courses or show success
      setPage('courses')
    } catch (err) {
      setError(`Failed to save quiz: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  // Mode Selection Screen
  if (step === 'mode') {
    return (
      <div className="page quiz-builder-page">
        <div className="quiz-builder-container">
          <button className="back-btn" onClick={() => setPage('courses')}>
            ← Back
          </button>
          <h1>📚 Create a New Quiz</h1>

          <div className="mode-selection">
            <div
              className="mode-card"
              onClick={() => {
                setStep('ai')
                setTitle('')
                setTopic('')
                setQuestions([])
              }}
            >
              <div className="mode-icon">✨</div>
              <h2>AI-Generated</h2>
              <p>Enter a topic and let AI create questions for you</p>
              <div className="mode-badge">Fast & Easy</div>
            </div>

            <div
              className="mode-card"
              onClick={() => {
                setStep('manual')
                setQuestions([])
              }}
            >
              <div className="mode-icon">✏️</div>
              <h2>Manual</h2>
              <p>Create questions one by one yourself</p>
              <div className="mode-badge">Full Control</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // AI Generation Screen
  if (step === 'ai') {
    return (
      <div className="page quiz-builder-page">
        <div className="quiz-builder-container">
          <button className="back-btn" onClick={() => setStep('mode')}>
            ← Back
          </button>
          <h1>✨ AI Quiz Generator</h1>

          {questions.length === 0 ? (
            <div className="ai-generator-form">
              <div className="form-group">
                <label htmlFor="topic">Topic or Subject</label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis, World War II, Python Functions"
                  disabled={aiGenerating}
                />
              </div>

              <div className="form-group">
                <label htmlFor="numQuestions">Number of Questions</label>
                <select
                  id="numQuestions"
                  value={numQuestionsToGenerate}
                  onChange={e => setNumQuestionsToGenerate(parseInt(e.target.value))}
                  disabled={aiGenerating}
                >
                  {[3, 5, 10, 15, 20].map(n => (
                    <option key={n} value={n}>
                      {n} questions
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Difficulty Level</label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  disabled={aiGenerating}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button
                className="btn btn-primary"
                onClick={handleGenerateWithAI}
                disabled={aiGenerating}
              >
                {aiGenerating ? '✨ Generating...' : '✨ Generate Questions'}
              </button>
            </div>
          ) : (
            // Show generated questions for review/editing
            <div className="quiz-review">
              <h2>Review & Edit Generated Questions</h2>
              <p className="subtitle">Make any changes before saving</p>

              <div className="form-group">
                <label htmlFor="quizTitle">Quiz Title</label>
                <input
                  id="quizTitle"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter quiz title"
                />
              </div>

              <div className="questions-list">
                {questions.map((q, idx) => (
                  <div key={idx} className="question-review-card">
                    <div className="question-number">Question {idx + 1}</div>
                    <div className="question-text-display">{q.question}</div>
                    <div className="options-display">
                      {q.options.map((opt, i) => (
                        <div
                          key={i}
                          className={`option-display ${opt === q.correctAnswer ? 'correct' : ''}`}
                        >
                          {String.fromCharCode(65 + i)}) {opt}
                          {opt === q.correctAnswer && <span className="checkmark">✓</span>}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <div className="explanation-display">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRemoveQuestion(idx)}
                      style={{ marginTop: '12px' }}
                    >
                      Delete Question
                    </button>
                  </div>
                ))}
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="quiz-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setStep('ai')
                    setQuestions([])
                  }}
                >
                  Generate More
                </button>
                <button className="btn btn-primary" onClick={handleSaveQuiz} disabled={loading}>
                  {loading ? 'Saving...' : '💾 Save Quiz'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Manual Question Entry Screen
  return (
    <div className="page quiz-builder-page">
      <div className="quiz-builder-container">
        <button className="back-btn" onClick={() => setPage('courses')}>
          ← Back
        </button>
        <h1>✏️ Create Quiz Manually</h1>

        {questions.length === 0 && (
          <div className="form-group">
            <label htmlFor="quizTitle">Quiz Title</label>
            <input
              id="quizTitle"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter quiz title"
            />
          </div>
        )}

        {/* Question Input Form */}
        <div className="question-form">
          <h2>Question {questions.length + 1}</h2>

          <div className="form-group">
            <label htmlFor="questionText">Question</label>
            <textarea
              id="questionText"
              value={currentQuestion.question}
              onChange={e =>
                setCurrentQuestion({
                  ...currentQuestion,
                  question: e.target.value,
                })
              }
              placeholder="Enter your question"
            />
          </div>

          <div className="options-input">
            {currentQuestion.options.map((option, idx) => (
              <div key={idx} className="form-group">
                <label htmlFor={`option${idx}`}>Option {String.fromCharCode(65 + idx)}</label>
                <input
                  id={`option${idx}`}
                  type="text"
                  value={option}
                  onChange={e => {
                    const newOptions: [string, string, string, string] = [...currentQuestion.options] as [
                      string,
                      string,
                      string,
                      string,
                    ]
                    newOptions[idx] = e.target.value
                    setCurrentQuestion({
                      ...currentQuestion,
                      options: newOptions,
                    })
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                />
              </div>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="correctAnswer">Correct Answer</label>
            <select
              id="correctAnswer"
              value={currentQuestion.correctAnswer}
              onChange={e =>
                setCurrentQuestion({
                  ...currentQuestion,
                  correctAnswer: e.target.value,
                })
              }
            >
              <option value="">-- Select correct answer --</option>
              {currentQuestion.options.map((opt, idx) => (
                <option key={idx} value={opt}>
                  {String.fromCharCode(65 + idx)}: {opt || '(empty)'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="explanation">Explanation (optional)</label>
            <textarea
              id="explanation"
              value={currentQuestion.explanation || ''}
              onChange={e =>
                setCurrentQuestion({
                  ...currentQuestion,
                  explanation: e.target.value,
                })
              }
              placeholder="Why is this answer correct?"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button className="btn btn-primary" onClick={handleAddQuestion}>
            Add Question
          </button>
        </div>

        {/* Questions List */}
        {questions.length > 0 && (
          <div className="questions-list">
            <h2>Questions ({questions.length})</h2>
            {questions.map((q, idx) => (
              <div key={idx} className="question-review-card">
                <div className="question-number">Question {idx + 1}</div>
                <div className="question-text-display">{q.question}</div>
                <div className="options-display">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`option-display ${opt === q.correctAnswer ? 'correct' : ''}`}
                    >
                      {String.fromCharCode(65 + i)}) {opt}
                      {opt === q.correctAnswer && <span className="checkmark">✓</span>}
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-danger"
                  onClick={() => handleRemoveQuestion(idx)}
                  style={{ marginTop: '12px' }}
                >
                  Delete Question
                </button>
              </div>
            ))}

            <div className="quiz-actions">
              <button className="btn btn-primary" onClick={handleSaveQuiz} disabled={loading}>
                {loading ? 'Saving...' : '💾 Save Quiz'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
