// Data Models for Student-Created Quizzes and Firebase Integration

// ============ USER MODEL ============
interface User {
  uid: string              // Firebase Auth UID
  email: string
  username: string
  avatar: string           // Emoji
  createdAt: Timestamp
  
  // Linked to GrowthGuild app
  hiveLevel?: number
  treasury?: number
  collectedBees?: CollectedBee[]
}

// ============ QUIZ MODEL ============
interface StudentQuiz {
  id: string               // Firestore Doc ID
  title: string
  description: string
  
  // Content
  questions: QuizQuestion[]
  
  // Metadata
  createdBy: string        // Username
  userId: string           // Firebase UID
  createdAt: Timestamp
  updatedAt: Timestamp
  
  // Status
  isPublic: boolean        // False = private, True = shareable
  difficulty?: 'easy' | 'medium' | 'hard'
  
  // Stats
  timesPlayed?: number
  averageScore?: number
}

interface QuizQuestion {
  question: string
  options: string[]        // Always 4 options
  correctAnswer: string    // Must be one of the options
  explanation?: string     // Why this answer is correct
}

// ============ QUIZ RESULT MODEL ============
interface QuizResult {
  id: string
  quizId: string
  userId: string           // Who took the quiz
  score: number            // 0-100
  timeSpent?: number       // In seconds
  completedAt: Timestamp
  
  // For rewards
  beeFragmentsEarned?: number
  honeyEarned?: number
}

// ============ FIRESTORE COLLECTIONS ============
/*
Database Structure:

/users/{uid}
  - uid: string
  - email: string
  - username: string
  - avatar: string
  - createdAt: timestamp
  - hiveLevel: number
  - treasury: number
  - collectedBees: [CollectedBee]

/quizzes/{quizId}
  - id: string (doc id)
  - title: string
  - description: string
  - questions: [QuizQuestion]
  - createdBy: string
  - userId: string
  - createdAt: timestamp
  - updatedAt: timestamp
  - isPublic: boolean
  - difficulty: string
  - timesPlayed: number
  - averageScore: number

/quiz-results/{resultId}
  - quizId: string
  - userId: string
  - score: number
  - timeSpent: number
  - completedAt: timestamp
  - beeFragmentsEarned: number
  - honeyEarned: number
*/

// ============ API INTEGRATION ============

// OpenAI: Quiz Generation
/*
POST https://api.openai.com/v1/chat/completions

Input:
{
  topic: "Photosynthesis",
  numberOfQuestions: 5,
  difficulty: "medium"
}

Output: GeneratedQuestion[]
{
  question: "What is the primary product of photosynthesis?",
  options: ["Oxygen", "Glucose", "Water", "Carbon Dioxide"],
  correctAnswer: "Glucose",
  explanation: "Photosynthesis produces glucose (sugar) and oxygen..."
}
*/

// ============ FIREBASE RULES ============
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Students can create quizzes
    // Only the creator can edit/delete
    // Public quizzes can be read by anyone
    match /quizzes/{quizId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth.uid == resource.data.userId;
      allow read: if resource.data.isPublic == true;
    }
    
    // Results must belong to the user
    match /quiz-results/{resultId} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid == resource.data.userId;
    }
  }
}
*/

// ============ USAGE EXAMPLES ============

// 1. Create a quiz with AI
const topic = "Photosynthesis"
const generatedQuestions = await generateQuizQuestions(topic, 5, "medium")
// Returns: QuizQuestion[] ready to save

// 2. Save quiz to Firestore
const quizId = await saveQuiz(userId, {
  title: "Photosynthesis Quiz",
  description: "Test your knowledge about photosynthesis",
  questions: generatedQuestions,
})

// 3. Get user's quizzes
const userQuizzes = await getQuizzes(userId)
// Returns: StudentQuiz[]

// 4. Play a quiz and record result
const score = 85
await recordQuizResult(quizId, userId, score)
// Award bee fragments and honey based on score

// 5. Share quiz publicly
await updateQuiz(quizId, { isPublic: true })
// Now friends can access it

// ============ REWARD SYSTEM ============
/*
When a student completes a quiz (theirs or someone else's):

1. Calculate score (0-100)
2. Determine bee fragments earned:
   - 0-40: 5 fragments
   - 40-70: 10 fragments
   - 70-100: 20 fragments

3. Determine honey earned:
   - Same as fragments but in honey

4. Apply perk modifiers (if user has active bees):
   - quizScoreBonus: +X% to score
   - xpBonus: +X% to fragments earned

5. Save QuizResult and update user treasury

Example:
  Score: 85
  Base fragments: 20
  With wisdom bee (10% bonus): 22 fragments
  Honey: 22
  Bees leveled up by: 22 XP
*/
