# GrowthGuild: Firebase & Student Quiz Builder Setup Guide

## What's New

You now have:
1. **Firebase Integration** — Authentication and Firestore database support
2. **Student Quiz Builder** — Students can create quizzes manually or with AI
3. **AI Quiz Generation** — Automatic quiz question generation using OpenAI API

---

## 🔧 Setup Instructions

### 1. Firebase Setup

#### Get Firebase Credentials:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use an existing one
3. Enable these services:
   - **Authentication** → Enable Email/Password
   - **Firestore Database** → Create database (production mode or test mode)
   - **Storage** (optional, for future file uploads)

4. Get your config:
   - Click Project Settings ⚙️
   - Copy the firebaseConfig object

#### Add Environment Variables:
Create a `.env.local` file in your project root:

```bash
# Copy from .env.local.example and fill with your Firebase config
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# OpenAI API Key (for AI quiz generation)
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 2. OpenAI Setup (Optional, for AI Quiz Generation)

1. Get your OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Add to `.env.local`:
   ```
   VITE_OPENAI_API_KEY=sk-...
   ```

⚠️ **Security Note**: Never commit `.env.local` to git. The `.env.local` file is already in `.gitignore`.

### 3. Firestore Database Rules

Set up Firestore security rules to allow students to create quizzes:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Allow users to create and manage their own quizzes
    match /quizzes/{doc=**} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth.uid == resource.data.createdBy;
      allow read: if resource.data.isPublic == true;
    }
  }
}
```

---

## 📝 Using the Quiz Builder

### Access:
1. Go to **Courses** page
2. Click the **✨ Create Quiz** button

### Two Modes:

#### Mode 1: AI-Generated Quizzes
1. Select "AI-Generated" mode
2. Enter a topic (e.g., "Photosynthesis")
3. Choose difficulty level (easy/medium/hard)
4. Choose number of questions
5. Click "Generate Questions"
6. Review and edit if needed
7. Save the quiz

#### Mode 2: Manual Quiz Creation
1. Select "Manual" mode
2. Enter quiz title
3. Add questions one by one:
   - Enter question text
   - Fill in 4 options
   - Select correct answer
   - (Optional) Add explanation
4. Click "Add Question"
5. Repeat for all questions
6. Click "Save Quiz"

---

## 🎮 How Student Quizzes Are Stored

### Firestore Collections:

```
quizzes/
├── {quizId}
│   ├── title: "Biology Quiz"
│   ├── description: "About cells"
│   ├── questions: [...]
│   ├── createdBy: "user_123"
│   ├── userId: "user_123"
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── isPublic: false
```

### Question Structure:
```typescript
{
  question: "What is photosynthesis?",
  options: ["A) ...", "B) ...", "C) ...", "D) ..."],
  correctAnswer: "A) ...",
  explanation: "Photosynthesis is..."
}
```

---

## 🚀 Next Steps

### 1. Migrate Existing Data to Firestore
Currently, the app uses localStorage. To persist data across devices:
- Copy user progress from localStorage to Firestore on first login
- Implement sync functions in `FirebaseContext.tsx`

### 2. Make Quizzes Playable
- Add created quizzes to the Courses page automatically
- Link to `QuizPlayer` component
- Award bee fragments and honey for completing student-created quizzes

### 3. Add Social Features
- Share quizzes with friends (set `isPublic: true`)
- Comment and rate on student quizzes
- Leaderboards for quiz creators

### 4. Production Security
- Move AI quiz generation to a backend Cloud Function to protect API keys
- Implement Firestore security rules to prevent unauthorized edits

---

## 📁 New Files Created

```
src/
├── config/
│   └── firebase.ts                 # Firebase initialization
├── context/
│   └── FirebaseContext.tsx         # Firebase auth & Firestore helpers
├── pages/
│   └── QuizBuilder.tsx             # Quiz creation UI
├── utils/
│   └── aiQuizGenerator.ts          # OpenAI API integration
└── .env.local.example              # Environment variable template
```

---

## 🐛 Troubleshooting

### "VITE_OPENAI_API_KEY environment variable is not set"
- Add `VITE_OPENAI_API_KEY` to `.env.local`
- Restart dev server: `npm run dev`

### "Firebase not initialized"
- Check `.env.local` has all Firebase credentials
- Restart dev server after adding env vars

### "AI quiz generation fails"
- Verify OpenAI API key is valid
- Check OpenAI account has available credits
- Try generating again (sometimes rate-limited)

### Quizzes not saving
- Check browser DevTools Console for errors
- Verify Firebase Firestore is enabled
- Check Firestore security rules

---

## 📞 Support

For issues:
1. Check browser console (F12 → Console tab)
2. Check Firebase Console for database rules and errors
3. Verify all `.env.local` variables are set correctly

---

## Security Best Practices

✅ **Do:**
- Never commit `.env.local` to git
- Use Firestore security rules to validate permissions
- Rate-limit API calls to avoid costs
- Use backend Cloud Functions for sensitive operations

❌ **Don't:**
- Expose API keys in client-side code (currently done for development only)
- Allow anyone to modify quizzes they didn't create
- Generate unlimited quizzes without rate limiting

---

**Happy Quiz Building! 🐝📚**
