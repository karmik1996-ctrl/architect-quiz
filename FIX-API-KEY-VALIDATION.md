# 🔧 Fix Firebase API Key Validation Error

## ❌ Error
```
auth/api-key-not-valid.-please-pass-a-valid-api-key
```

## ✅ Solution - Step by Step

### 1️⃣ Enable Firebase Authentication API

1. **Go to Google Cloud Console:**
   ```
   https://console.cloud.google.com/apis/library/identitytoolkit.googleapis.com?project=architect-quiz-c5273
   ```

2. **Click "ENABLE"** (if not already enabled)

3. **Also enable:**
   - Firebase Authentication API
   - Firebase Realtime Database API  
   - Firebase Cloud Firestore API

---

### 2️⃣ Check API Key Restrictions

1. **Go to Credentials:**
   ```
   https://console.cloud.google.com/apis/credentials?project=architect-quiz-c5273
   ```

2. **Find API Key:** `AIzaSyCTnTWCczvmRZHVrTWDtKRIyBf-d2I0qi4`

3. **Click on the API Key** to edit it

4. **Check "API restrictions":**
   - Should be: **"Restrict key"**
   - Should include:
     - ✅ Firebase Authentication API
     - ✅ Firebase Realtime Database API
     - ✅ Firebase Cloud Firestore API
     - ✅ Identity Toolkit API

5. **Check "Website restrictions":**
   - Should include:
     - ✅ `https://*.github.io/*`
     - ✅ `http://localhost:*`
     - ✅ `https://*.netlify.app/*`

6. **Click "SAVE"**

---

### 3️⃣ Enable Firebase Authentication in Firebase Console

1. **Go to Firebase Console:**
   ```
   https://console.firebase.google.com/project/architect-quiz-c5273/authentication/providers
   ```

2. **Click "Email/Password"**

3. **Enable:**
   - ✅ Email/Password (first toggle)
   - ✅ Email link (passwordless sign-in) - Optional

4. **Click "SAVE"**

---

### 4️⃣ Verify Firestore Rules

1. **Go to Firestore Rules:**
   ```
   https://console.firebase.google.com/project/architect-quiz-c5273/firestore/rules
   ```

2. **Rules should be:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **Click "PUBLISH"**

---

### 5️⃣ Test Registration

1. **Go to GitHub Pages:**
   ```
   https://karmik1996-ctrl.github.io/architect-quiz/
   ```

2. **Try to register** with test credentials

3. **Check browser console** for errors

---

## 🔍 Debugging

If still not working:

1. **Check browser console** for detailed error messages

2. **Check Network tab** in browser DevTools:
   - Look for requests to `identitytoolkit.googleapis.com`
   - Check if they return 403 or 401 errors

3. **Verify API Key** is correct:
   - Go to Firebase Console → Project Settings → General
   - Copy the API Key from there
   - Compare with `firebase.config.js`

---

## ✅ Expected Result

After completing all steps:
- ✅ Firebase SDK loads successfully
- ✅ Firebase Auth initializes
- ✅ Registration works without errors
- ✅ User data saved to Firestore

---

**Last Updated:** 2026-01-12



