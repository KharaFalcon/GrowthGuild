# Firebase Authentication Setup Guide

## Overview

Your GrowthGuild app now uses **Firebase Authentication** for user registration and login. This replaces the previous localStorage-based authentication with a cloud-based system that securely stores user credentials.

## Key Changes

### 1. Authentication Context (`FirebaseContext.tsx`)

Firebase authentication provides:
- **Email/Password Authentication**: Users sign up and log in using email + password
- **Firebase Auth State Management**: Automatically tracks logged-in users across app refreshes
- **Cloud User Data Storage**: User profiles stored in Firestore (users collection)
- **Security**: Passwords never stored in code; handled by Firebase

**Available methods:**
- `login(email, password)` - Sign in existing user
- `register(email, password, username)` - Create new account
- `logout()` - Sign out current user
- `currentUser` - Access logged-in Firebase user object

### 2. Updated Login Page

**File:** `src/pages/Login.tsx`

**Changes:**
- Changed from username-based to **email-based login**
- Now uses `useFirebase()` hook instead of `useAuth()`
- Async login with error handling
- Loading state during authentication
- Disabled inputs while request is pending

**What happens:**
1. User enters email + password
2. Firebase validates credentials against cloud database
3. If valid: User logged in, redirected to dashboard
4. If invalid: Error message displayed

### 3. Updated Register Page

**File:** `src/pages/Register.tsx`

**Changes:**
- Now uses Firebase registration
- Uses `useFirebase()` hook
- Async registration with proper error handling
- Requires: username, email, password
- Automatically creates Firestore user document

**What happens:**
1. User enters username, email, password
2. Firebase creates new user account
3. Username + profile stored in Firestore `users` collection
4. User automatically logged in
5. Redirected to dashboard

## How It Works

### Authentication Flow

```
┌─────────────┐
│   Register  │
└──────┬──────┘
       │ 1. Email + Password
       ▼
┌─────────────────────────┐
│  Firebase Auth          │ ← Creates secure account
│  (email/password)       │
└──────┬──────────────────┘
       │ 2. User UID created
       ▼
┌─────────────────────────┐
│  Firestore 'users'      │ ← Stores user profile
│  collection             │   (username, avatar, etc)
└─────────────────────────┘
       │ 3. Auto login
       ▼
┌─────────────┐
│ Dashboard   │
└─────────────┘
```

### Login Flow

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │ 1. Email + Password
       ▼
┌─────────────────────────┐
│  Firebase Auth          │ ← Validates credentials
│  (email/password)       │   against cloud database
└──────┬──────────────────┘
       │ 2. If valid: Auth token
       ▼
┌─────────────┐
│ Dashboard   │
└─────────────┘
```

## Configuration

### Environment Variables

Located in `.env.local` - These are provided and should already be configured:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### Firebase Console Setup (Already Done ✅)

1. ✅ Firebase project created: `growthguild-42439`
2. ✅ Firestore database initialized
3. ✅ Authentication enabled (Email/Password)
4. ✅ Users collection ready

## Testing Authentication

### Test Register

1. Open app at `http://localhost:5173`
2. Click "Register" (or navigate to register page)
3. Enter:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123` (at least 6 chars)
   - Confirm: `password123`
4. Click "Create Account"
5. Should redirect to dashboard

**What happens in background:**
- Firebase creates user with email `test@example.com`
- Firestore stores user doc in `users/{uid}`
- User logged in automatically
- Session persists across page refreshes

### Test Login

1. Logout (or open new incognito window)
2. Go to Login page
3. Enter:
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Log In"
5. Should redirect to dashboard

### Test Session Persistence

1. Log in with valid credentials
2. Refresh the page (Cmd+R)
3. Should stay logged in (dashboard loads immediately)
4. **Why?** Firebase maintains auth state in browser

### Test Error Handling

1. Try registering with existing email → Error: "auth/email-already-in-use"
2. Try logging in with wrong password → Error: "auth/wrong-password"
3. Try logging in with non-existent email → Error: "auth/user-not-found"

## Data Storage

### Firestore Collections

#### `users` Collection
Stores user profile information:
```json
{
  "uid": "user_id_from_firebase",
  "email": "user@example.com",
  "username": "testuser",
  "avatar": "🐝",
  "createdAt": "2025-11-16T10:30:00Z"
}
```

#### `quizzes` Collection
Stores student-created quizzes:
```json
{
  "id": "quiz_id",
  "createdBy": "uid_of_student",
  "title": "Biology 101",
  "topic": "Photosynthesis",
  "questions": [...],
  "isPublic": false,
  "createdAt": "2025-11-16T10:30:00Z"
}
```

## Using Firebase Auth in Components

### Example 1: Check if User is Logged In

```tsx
import { useFirebase } from '../context/FirebaseContext'

export default function MyComponent() {
  const { currentUser } = useFirebase()
  
  if (!currentUser) {
    return <div>Please log in</div>
  }
  
  return <div>Welcome, {currentUser.email}</div>
}
```

### Example 2: Access User ID for Firestore Queries

```tsx
const { currentUser } = useFirebase()

if (currentUser) {
  const userId = currentUser.uid  // Use this for Firestore queries
  // Save quizzes under this user's ID
}
```

### Example 3: Handle Async Auth Operations

```tsx
const { login, logout, error } = useFirebase()

async function handleLogout() {
  try {
    await logout()
    // Navigate to login
  } catch (err) {
    console.error('Logout failed:', err)
  }
}
```

## Important Notes

### Security

- ✅ Passwords encrypted by Firebase (never stored in code)
- ✅ API keys safe in `.env.local` (not committed to git)
- ⚠️ For production: Implement Firestore Security Rules
- ⚠️ For production: Move OpenAI API key to backend

### Firebase Auth State

- Automatically persisted in browser storage
- Survives page refreshes
- Clears when user logs out
- Can access via `currentUser` in any component

### Email Verification (Optional)

Future enhancement: Add email verification on signup:
```tsx
// After registration, send verification email:
await sendEmailVerification(currentUser)
```

### Password Reset (Optional)

Future enhancement: Add password reset functionality:
```tsx
import { sendPasswordResetEmail } from 'firebase/auth'

await sendPasswordResetEmail(auth, email)
```

## Troubleshooting

### "Error: FirebaseContext not initialized"
- Ensure `FirebaseProvider` wraps your app in `App.tsx`
- Check that provider is at top of provider hierarchy

### "auth/invalid-email"
- Email format invalid
- User entered invalid email address

### "auth/weak-password"
- Password less than 6 characters
- Firebase rejects weak passwords

### "auth/email-already-in-use"
- Email already registered
- User should log in instead, or use different email

### "auth/user-not-found"
- Email not registered in Firebase
- User should register first

### Auth state doesn't persist after refresh
- Check browser DevTools → Application → Storage → Cookies
- Ensure 3rd-party cookies not blocked
- Check if using private/incognito window (storage cleared on close)

## Next Steps

1. **Test Authentication**
   - Register new account
   - Log in with that account
   - Verify data in Firebase Console

2. **Migrate User Data** (Next Priority)
   - Move existing user data from localStorage to Firestore
   - Run migration on user's first Firebase login

3. **Link Quizzes to Firestore** (Already Done)
   - Quizzes save to `quizzes` collection
   - Associate with `createdBy` user ID

4. **Make Quizzes Playable** (Future)
   - Load student-created quizzes in QuizPlayer
   - Award rewards for completion

## References

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com)

---

**Status:** ✅ Firebase Authentication fully integrated and ready to use!
