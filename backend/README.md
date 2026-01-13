# Backend API - Cloudflare Worker

## ❓ Ինչի համար ենք սա անում

👉 **GitHub Pages-ը միայն frontend է**  
👉 **Frontend JS-ում ամեն ինչ երևում է F12-ով**  
👉 **API key / password պահելը frontend-ում վտանգավոր է**

### Նպատակ
🔐 **Գաղտնի տվյալները պահել backend-ում, ոչ թե browser-ում**  
👀 **Օգտվողը տեսնի միայն արդյունքը, ոչ թե API key-ը**

---

## ✅ Ճիշտ լուծման գաղափարը

**Frontend → կանչում է մեր backend API → backend-ը կանչում է իրական API key-ով**

```
Browser (Frontend)          Cloudflare Worker (Backend)          External API
     |                              |                                |
     |--- fetch('/api/...') ------->|                                |
     |                              |--- fetch(API_URL, {            |
     |                              |      headers: {                |
     |                              |        'Authorization': key   |
     |                              |      }                         |
     |                              |    }) ------------------------>|
     |                              |<-------------------------------|
     |<-- JSON response ------------|                                |
```

---

## 🚀 Deployment (Cloudflare Workers)

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Set Environment Variables (Secrets)

**Option A: Via Cloudflare Dashboard (Recommended)**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → Your Worker → Settings → Variables
3. Add secrets:
   - `SECRET_FIREBASE_API_KEY` = `AIzaSyCTnTWCczvmRZHVrTWDtKRIyBf-d2IOqi4`
   - `FIREBASE_AUTH_DOMAIN` = `architect-quiz-c5273.firebaseapp.com`
   - `FIREBASE_PROJECT_ID` = `architect-quiz-c5273`
   - `FIREBASE_STORAGE_BUCKET` = `architect-quiz-c5273.firebasestorage.app`
   - `FIREBASE_MESSAGING_SENDER_ID` = `566027889328`
   - `FIREBASE_APP_ID` = `1:566027889328:web:efb894feed4b74bd4ca975`
   - `FIREBASE_MEASUREMENT_ID` = `G-57NQ5TB1NP`
   - `SECRET_IPGEOLOCATION_API_KEY` = `free` (or your paid key)

**Option B: Via CLI**

```bash
wrangler secret put SECRET_FIREBASE_API_KEY
# Enter: AIzaSyCTnTWCczvmRZHVrTWDtKRIyBf-d2IOqi4

wrangler secret put FIREBASE_AUTH_DOMAIN
# Enter: architect-quiz-c5273.firebaseapp.com

# ... repeat for all secrets
```

### 4. Deploy

```bash
cd backend
wrangler deploy
```

### 5. Get Your Backend URL

After deployment, you'll get a URL like:
```
https://quiz-backend-api.your-subdomain.workers.dev
```

---

## 📌 Frontend Usage

### Before (❌ Dangerous - API key visible in browser):

```javascript
// ❌ DON'T DO THIS - API key is visible in DevTools
const firebaseConfig = {
  apiKey: "AIzaSyCTnTWCczvmRZHVrTWDtKRIyBf-d2IOqi4", // Visible!
  // ...
};
```

### After (✅ Safe - API key hidden in backend):

```javascript
// ✅ DO THIS - API key is in backend, not in frontend
const BACKEND_URL = 'https://quiz-backend-api.your-subdomain.workers.dev';

// Get Firebase config from backend
fetch(`${BACKEND_URL}/api/firebase-config`)
  .then(res => res.json())
  .then(config => {
    // Use config (API key is not visible in frontend code)
    firebase.initializeApp(config);
  });

// Proxy IP geolocation API calls
fetch(`${BACKEND_URL}/api/ip-geolocation?ip=${userIP}`)
  .then(res => res.json())
  .then(data => {
    console.log(data);
  });
```

---

## 🔒 Security Notes

### ✅ What's Safe:
- ✅ API keys stored in Cloudflare Workers environment variables
- ✅ Environment variables are NOT visible in frontend code
- ✅ Only backend code can access secrets

### ❌ What's NOT Safe:
- ❌ API keys in frontend JavaScript files
- ❌ API keys in HTML files
- ❌ API keys in GitHub repository (public)
- ❌ `.env` files committed to Git

---

## 📋 API Endpoints

### `GET /api/firebase-config`
Returns Firebase configuration (API key is from backend env, not frontend)

### `GET /api/ip-geolocation?ip=<ip>`
Proxies IP geolocation API calls (API key hidden in backend)

### `POST /api/proxy-firestore`
Proxies Firestore write operations (for sensitive operations)

### `GET /health`
Health check endpoint

---

## 🧪 Testing

```bash
# Test health endpoint
curl https://quiz-backend-api.your-subdomain.workers.dev/health

# Test Firebase config (should return config with API key)
curl https://quiz-backend-api.your-subdomain.workers.dev/api/firebase-config
```

---

## 📝 Next Steps

1. ✅ Deploy backend to Cloudflare Workers
2. ✅ Update frontend to use backend endpoints
3. ✅ Remove API keys from frontend files
4. ✅ Test that frontend still works
5. ✅ Verify API keys are not visible in DevTools (F12)

---

## ❓ FAQ

**Q: Firebase API key is public anyway, why hide it?**  
A: While Firebase API keys are often public, hiding them adds an extra layer of security and follows best practices. Also, other API keys (like IP geolocation) should definitely be hidden.

**Q: Can I use this for all Firebase operations?**  
A: Firebase Auth typically works client-side. This backend is useful for:
- Sensitive Firestore write operations
- Admin operations
- Other third-party APIs with secret keys

**Q: Is Cloudflare Workers free?**  
A: Yes, Cloudflare Workers has a generous free tier (100,000 requests/day).

