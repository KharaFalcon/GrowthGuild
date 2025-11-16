# Blank Screen Troubleshooting & Diagnostics Guide

## What You're Seeing

If you see a blank/cream-colored screen when visiting http://localhost:5173, it means one of these states:

1. **"🐝 Loading GrowthGuild..." screen** → Normal, app is initializing Firebase (should take 1-2 seconds)
2. **"⚠️ Firebase Error" message** → Firebase credentials are wrong or Firebase isn't configured
3. **Completely blank screen** → JavaScript error or browser caching issue
4. **Login page appears** → ✅ App is working! Not logged in, so showing login screen

## Improved Error Messages

I've updated the app to show better error/loading screens:

### Loading Screen (Shows for 1-2 seconds max)
```
🐝
Loading GrowthGuild...
Connecting to Firebase
[animated progress bar]
```

**What it means:** App is checking if you're logged in. This is normal.

### Firebase Error Screen
```
⚠️
Firebase Error
[Error message here]

✓ Check `.env.local` has correct Firebase credentials
✓ Visit: https://console.firebase.google.com
✓ Restart dev server: npm run dev
```

**What to do:**
1. Copy your Firebase credentials from https://console.firebase.google.com/project/growthguild-42439/settings/general
2. Paste into `.env.local` (in workspace root)
3. Restart dev server: `npm run dev`

## How to Debug

### Step 1: Open Browser Developer Tools
1. Press **F12** or **Cmd+Option+I** (Mac)
2. Go to **Console** tab
3. Look for logs starting with `[Firebase]` or `[GrowthGuild]`

### Step 2: Check Console Logs

**Good logs (means it's working):**
```
[Firebase] Initializing auth state listener...
[Firebase] Config: {projectId: "growthguild-42439", authDomain: "growthguild-42439.firebaseapp.com"}
[Firebase] Auth state changed: Logged in as user@example.com
```

**Bad logs (means there's an error):**
```
[Firebase] Auth error: Error: Failed to get document because the client is offline
[Firebase] Auth check timeout (2s) - setting loading to false, proceeding with no user
```

### Step 3: Check Network Tab

1. Go to **Network** tab in DevTools
2. Reload page (Cmd+R)
3. Look for requests to:
   - `identitytoolkit.googleapis.com` (Firebase auth)
   - Any requests with `FAILED` status (red)

### Step 4: Check .env.local File

Make sure you have:
```bash
VITE_FIREBASE_API_KEY=AIzaSyDnBMYG9xhELgZY_Hbd-KFyJiUnnpKrgbo
VITE_FIREBASE_AUTH_DOMAIN=growthguild-42439.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=growthguild-42439
VITE_FIREBASE_STORAGE_BUCKET=growthguild-42439.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=408142048764
VITE_FIREBASE_APP_ID=1:408142048764:web:d69228f5e0cef2b5515679
```

If missing or wrong:
1. Visit https://console.firebase.google.com
2. Select "growthguild-42439" project
3. Click ⚙️ Settings → Project Settings
4. Copy the Firebase Config
5. Update `.env.local`
6. Restart dev server

## What Each Part Does

### Firebase Context Updates
- **2-second timeout:** If Firebase takes too long, proceed to login screen (don't freeze)
- **Detailed logging:** Shows Firebase config, auth state, and any errors
- **Error handling:** Catches and displays Firebase connection issues

### App.tsx Updates  
- **Better loading screen:** Shows 🐝 emoji, progress bar, and helpful text
- **Better error screen:** Shows 🐝 emoji, error message, and instructions to fix
- **Proper logic flow:** 
  1. Check for errors first
  2. Show login if not logged in
  3. Show loading if still initializing
  4. Show app if logged in

## Common Issues & Solutions

### Issue: Blank cream screen, nothing else
**Possible causes:**
- JavaScript error not being caught
- Browser cache issue
- Simple Browser not rendering

**Solutions:**
1. Press **F12** and check Console for red errors
2. Hard refresh: **Cmd+Shift+R** (or Ctrl+Shift+R)
3. Open in Chrome/Firefox instead of VS Code Simple Browser
4. Clear browser cache: Settings → Privacy → Clear Cache

### Issue: "Loading..." stays forever
**Possible causes:**
- Firebase project not initialized
- Internet connection issue
- Firebase service is down

**Solutions:**
1. Check DevTools Console for `[Firebase]` logs
2. Check https://status.firebase.google.com
3. Try http://localhost:5173 in a real browser
4. Verify internet connection

### Issue: Firebase Error message shown
**Possible causes:**
- `.env.local` missing or has wrong credentials
- Firebase project deleted/disabled
- CORS issue

**Solutions:**
1. Verify `.env.local` exists and has correct values
2. Check https://console.firebase.google.com - is project active?
3. Check Network tab in DevTools for CORS errors
4. Try different browser

### Issue: Correct login page shows, but can't login
**This is actually ✅ working!**
- App successfully loaded
- Firebase is connected
- You just need to register/login

## Testing Checklist

- [ ] Open http://localhost:5173
- [ ] Should see loading screen for 1-2 seconds
- [ ] Should then see login page (if not logged in)
- [ ] OR should see dashboard (if already logged in)
- [ ] Open DevTools (F12) and check Console
- [ ] Should see `[Firebase]` logs saying auth initialized
- [ ] No red errors in console

## Build Status
✅ **0 errors, 70 modules, built in 1.24 seconds**

## Next: If Everything Works

Once you see the login page or dashboard:

1. **Register new account** (if not logged in)
   - Email: any email address
   - Password: at least 6 characters
   
2. **Check Browser Console** for logging:
   ```
   [Firebase] Auth state changed: Logged in as email@example.com
   ```

3. **Navigate around app**
   - Dashboard: Shows hive and badges
   - Hive: Shows bee collection
   - Courses: Shows courses (to be implemented)

## Still Having Issues?

**Share the following information:**

1. Screenshot of the screen
2. Copy of what's in DevTools Console (F12 → Console tab)
3. Contents of `.env.local` (redact API key)
4. Result of `npm run build 2>&1 | tail -20`
5. Browser type (Chrome/Firefox/Safari)

---

**Status:** ✅ **App improved with better error/loading screens**
