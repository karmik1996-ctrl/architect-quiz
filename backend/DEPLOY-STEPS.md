# 🚀 Cloudflare Workers Deployment - Step by Step

## 📍 Որտեղ է backend-ը GitHub-ում

Backend code-ը գտնվում է **`backend/`** folder-ում:

```
https://github.com/karmik1996-ctrl/architect-quiz/tree/main/backend
```

**Files:**
- `worker.js` - Backend code
- `wrangler.toml` - Cloudflare configuration
- `README.md` - Documentation
- `DEPLOY-STEPS.md` - This guide

---

## ✅ Քայլ 1: Install Wrangler CLI

### Windows PowerShell:

```powershell
npm install -g wrangler
```

**Verify:**
```powershell
wrangler --version
```

---

## ✅ Քայլ 2: Login to Cloudflare

```powershell
wrangler login
```

Սա կբացի browser-ը և կպահանջի Cloudflare account-ի մուտք:

**Եթե չունեք Cloudflare account:**
1. Գնացեք [cloudflare.com](https://dash.cloudflare.com/sign-up)
2. Ստեղծեք **FREE** account
3. Ապա `wrangler login` արեք

---

## ✅ Քայլ 3: Navigate to Backend Folder

```powershell
cd netlify-deploy\backend
```

կամ

```powershell
cd backend
```

---

## ✅ Քայլ 4: Set Environment Variables (Secrets)

### Option A: Via Cloudflare Dashboard (Ամենահեշտ) ✅

1. Գնացեք [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Workers & Pages** → **Create application** → **Create Worker**
3. **Name:** `quiz-backend-api`
4. **Deploy** (empty worker-ը)
5. **Settings** → **Variables** → **Add variable**
6. Ավելացրեք հետևյալ secrets-ները:

| Variable Name | Value |
|--------------|-------|
| `SECRET_FIREBASE_API_KEY` | `AIzaSyCTnTWCczvmRZHVrTWDtKRIyBf-d2IOqi4` |
| `FIREBASE_AUTH_DOMAIN` | `architect-quiz-c5273.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `architect-quiz-c5273` |
| `FIREBASE_STORAGE_BUCKET` | `architect-quiz-c5273.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | `566027889328` |
| `FIREBASE_APP_ID` | `1:566027889328:web:efb894feed4b74bd4ca975` |
| `FIREBASE_MEASUREMENT_ID` | `G-57NQ5TB1NP` |
| `SECRET_IPGEOLOCATION_API_KEY` | `free` |

**Important:** Secrets-ները **ՉԵՆ** երևում code-ում, միայն Cloudflare Dashboard-ում:

### Option B: Via CLI

```powershell
wrangler secret put SECRET_FIREBASE_API_KEY
# Enter: AIzaSyCTnTWCczvmRZHVrTWDtKRIyBf-d2IOqi4

wrangler secret put FIREBASE_AUTH_DOMAIN
# Enter: architect-quiz-c5273.firebaseapp.com

wrangler secret put FIREBASE_PROJECT_ID
# Enter: architect-quiz-c5273

wrangler secret put FIREBASE_STORAGE_BUCKET
# Enter: architect-quiz-c5273.firebasestorage.app

wrangler secret put FIREBASE_MESSAGING_SENDER_ID
# Enter: 566027889328

wrangler secret put FIREBASE_APP_ID
# Enter: 1:566027889328:web:efb894feed4b74bd4ca975

wrangler secret put FIREBASE_MEASUREMENT_ID
# Enter: G-57NQ5TB1NP

wrangler secret put SECRET_IPGEOLOCATION_API_KEY
# Enter: free
```

---

## ✅ Քայլ 5: Deploy Worker

```powershell
wrangler deploy
```

**Output-ը կլինի մոտավորապես:**
```
✨  Compiled Worker successfully
✨  Successfully published your Worker to the following routes:
   - quiz-backend-api.your-subdomain.workers.dev
```

---

## ✅ Քայլ 6: Get Your Backend URL

Deploy-ից հետո կստանաք URL-ը:

```
https://quiz-backend-api.your-subdomain.workers.dev
```

**Պահեք այս URL-ը** — այն կօգտագործեք frontend-ում:

**Օրինակ:**
```
https://quiz-backend-api.karmik1996.workers.dev
```

---

## ✅ Քայլ 7: Test Backend

### Test health endpoint:

Browser-ում բացեք:
```
https://quiz-backend-api.your-subdomain.workers.dev/health
```

**Expected response:**
```json
{"status":"ok","message":"Backend API is running"}
```

### Test Firebase config endpoint:

```
https://quiz-backend-api.your-subdomain.workers.dev/api/firebase-config
```

**Expected response:**
```json
{
  "apiKey": "AIzaSyCTnTWCczvmRZHVrTWDtKRIyBf-d2IOqi4",
  "authDomain": "architect-quiz-c5273.firebaseapp.com",
  "projectId": "architect-quiz-c5273",
  ...
}
```

---

## 📝 Հաջորդ Քայլեր

1. ✅ Backend deployed
2. ⏳ Update frontend to use backend URL
3. ⏳ Remove API keys from frontend files
4. ⏳ Test that everything works

---

## 🔍 Troubleshooting

### Error: "No account ID found"

```powershell
wrangler whoami
```

Եթե չի ցույց տալիս account, ապա:
```powershell
wrangler login
```

### Error: "Secret not found"

Ստուգեք, որ secrets-ները set են:
- Cloudflare Dashboard → Workers → Your Worker → Settings → Variables

### Error: "Worker name already exists"

Փոխեք `wrangler.toml`-ում `name` field-ը:

```toml
name = "quiz-backend-api-unique-name"
```

### Error: "npm: command not found"

Install Node.js:
- [nodejs.org](https://nodejs.org/)

---

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Environment Variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)

---

## ✅ Summary

1. ✅ `npm install -g wrangler`
2. ✅ `wrangler login`
3. ✅ `cd backend`
4. ✅ Set secrets (Dashboard կամ CLI)
5. ✅ `wrangler deploy`
6. ✅ Copy backend URL
7. ✅ Test endpoints

**Backend-ը պատրաստ է!** 🎉

