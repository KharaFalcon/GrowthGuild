# 🎓 Student Quiz Creation & AI Integration

## Quick Start

### Enable Students to Create Quizzes

Students can now create their own quizzes in two ways:

#### 1. **Manual Quiz Builder**
   - Click "✨ Create Quiz" on the Courses page
   - Add questions one by one
   - Full control over content

#### 2. **AI Quiz Generator** ✨
   - Click "✨ Create Quiz" on the Courses page
   - Enter a topic
   - Choose difficulty level
   - AI generates multiple choice questions automatically
   - Edit and refine before saving

---

## Firebase Integration

Your app now has:
- ✅ User authentication (Email/Password)
- ✅ Quiz storage in Firestore
- ✅ Persistent data across devices
- ✅ Public/Private quiz sharing

### To Enable:

1. **Create Firebase Project**: [firebase.google.com](https://firebase.google.com)
2. **Copy `.env.local.example` → `.env.local`**
3. **Add your Firebase credentials** to `.env.local`
4. **Restart dev server**: `npm run dev`

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions.

---

## AI Quiz Generation

Powered by **OpenAI API** - automatically generates quiz questions from any topic.

### Setup:
1. Get your API key: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Add to `.env.local`:
   ```
   VITE_OPENAI_API_KEY=sk-...
   ```

### Cost:
- ~0.001-0.01 USD per quiz generated
- Costs vary by topic complexity and question count

---

## Features

| Feature | Manual | AI-Generated |
|---------|--------|--------------|
| Create from scratch | ✅ | ❌ |
| Auto-generate questions | ❌ | ✅ |
| Edit before saving | ✅ | ✅ |
| Save to Firestore | ✅ | ✅ |
| Earn bee rewards | ✅ | ✅ |
| Share with friends | 🔜 | 🔜 |

---

## File Structure

```
src/
├── config/
│   └── firebase.ts                    # Firebase config & init
├── context/
│   └── FirebaseContext.tsx            # Auth & Firestore helpers
├── pages/
│   └── QuizBuilder.tsx                # Quiz creation interface
├── utils/
│   └── aiQuizGenerator.ts             # OpenAI integration
```

---

## Environment Variables

Create `.env.local` with:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# OpenAI (Optional, for AI quiz generation)
VITE_OPENAI_API_KEY=
```

---

## Next Steps

1. ✅ Students can create quizzes
2. 🔜 Make created quizzes playable in Courses
3. 🔜 Award bee fragments for completing student quizzes
4. 🔜 Share quizzes with friends (public/private)
5. 🔜 Quiz analytics & leaderboards

---

## Troubleshooting

**Q: I don't see the "Create Quiz" button**
- Make sure you're on the Courses page
- Check you're logged in
- Hard refresh the page (Cmd+Shift+R)

**Q: AI generation not working**
- Add `VITE_OPENAI_API_KEY` to `.env.local`
- Restart dev server
- Check OpenAI account has available credits

**Q: Quizzes not saving**
- Check `.env.local` has Firebase credentials
- Open DevTools Console (F12) for error messages
- Verify Firestore is enabled in Firebase Console

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for more details.

---

**Ready to build amazing learning content? 🚀**
