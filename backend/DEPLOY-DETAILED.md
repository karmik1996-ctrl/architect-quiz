# 🚀 Cloudflare Workers Deployment - Մանրամասն Քայլեր

## 📋 Նախապայմաններ

### 1. Node.js Install (եթե չունեք)

1. Գնացեք [nodejs.org](https://nodejs.org/)
2. Download **LTS version** (Long Term Support)
3. Install-ը արեք (Next, Next, Install)
4. **Restart** PowerShell/Terminal-ը
5. Ստուգեք:
   ```powershell
   node --version
   npm --version
   ```
   Պետք է ցույց տա version numbers (օրինակ: `v20.10.0`)

---

## ✅ Քայլ 1: Install Wrangler CLI

### PowerShell-ում գրեք:

```powershell
npm install -g wrangler
```

**Ինչ է տեղի ունենում:**
- npm-ը download է անում wrangler package-ը
- Install է անում global-ով (ամբողջ համակարգում)

**Սպասեք** մինչև ավարտվի (կարող է 1-2 րոպե տևել)

### Verify (ստուգում):

```powershell
wrangler --version
```

**Expected output:**
```
wrangler 3.x.x
```

Եթե error է տալիս, ստուգեք, որ Node.js-ը install է:

---

## ✅ Քայլ 2: Cloudflare Account Ստեղծել

### 2.1. Գնացեք Cloudflare-ի website-ը

1. Բացեք browser-ը
2. Գնացեք [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
3. **Sign Up** կոճակը սեղմեք

### 2.2. Sign Up Form

1. **Email** - մուտքագրեք ձեր email-ը
2. **Password** - ստեղծեք password (առնվազն 8 նիշ)
3. **Sign Up** կոճակը սեղմեք

### 2.3. Email Verification

1. Գնացեք ձեր email inbox-ը
2. Գտեք Cloudflare-ի email-ը
3. **Verify email** link-ը սեղմեք

### 2.4. Complete Setup

1. Cloudflare-ը կհարցնի, թե ինչու եք օգտագործում (ընտրեք "Personal project" կամ "Just exploring")
2. **Continue** կոճակը սեղմեք

**✅ Account-ը պատրաստ է!**

---

## ✅ Քայլ 3: Login Wrangler-ով

### PowerShell-ում գրեք:

```powershell
wrangler login
```

**Ինչ է տեղի ունենում:**
1. Wrangler-ը կբացի browser-ը ավտոմատ
2. Browser-ում կերևա Cloudflare login page
3. Մուտքագրեք ձեր email և password
4. **Authorize** կոճակը սեղմեք
5. PowerShell-ում կերևա: `✅ Successfully logged in`

**Եթե browser-ը չի բացվում:**
- Browser-ում manually գնացեք link-ը, որը PowerShell-ում ցույց է տալիս
- Copy-paste արեք browser-ում

### Verify Login:

```powershell
wrangler whoami
```

**Expected output:**
```
👋 You are logged in as: your-email@example.com
```

---

## ✅ Քայլ 4: Navigate to Backend Folder

### PowerShell-ում:

```powershell
cd D:\Programs\CursorTest\netlify-deploy\backend
```

**կամ** (եթե արդեն `netlify-deploy` folder-ում եք):

```powershell
cd backend
```

### Verify (ստուգեք, որ ճիշտ folder-ում եք):

```powershell
dir
```

**Պետք է տեսնեք:**
```
worker.js
wrangler.toml
README.md
DEPLOY-STEPS.md
DEPLOY-DETAILED.md
```

---

## ✅ Քայլ 5: Create Worker in Cloudflare Dashboard

### 5.1. Գնացեք Cloudflare Dashboard

1. Browser-ում բացեք [dash.cloudflare.com](https://dash.cloudflare.com)
2. Login արեք (եթե չեք login արված)

### 5.2. Create Worker

1. **Workers & Pages** menu-ն սեղմեք (ձախ sidebar-ում)
2. **Create application** կոճակը սեղմեք
3. **Create Worker** tab-ը ընտրեք
4. **Name** field-ում գրեք: `quiz-backend-api`
5. **Deploy** կոճակը սեղմեք

**✅ Worker-ը ստեղծված է!**

### 5.3. Get Worker URL

1. Worker-ի name-ը սեղմեք (`quiz-backend-api`)
2. **Settings** tab-ը սեղմեք
3. **Triggers** section-ում կտեսնեք **Routes**:
   ```
   https://quiz-backend-api.your-subdomain.workers.dev
   ```
4. **Copy այս URL-ը** - այն ձեզ պետք կգա

**Օրինակ URL:**
```
https://quiz-backend-api.karmik1996.workers.dev
```

---

## ✅ Քայլ 6: Set Environment Variables (Secrets)

### 6.1. Գնացեք Worker Settings

1. Cloudflare Dashboard-ում
2. **Workers & Pages** → **quiz-backend-api**
3. **Settings** tab
4. **Variables** section (ձախ sidebar-ում)

### 6.2. Add Secrets

**Environment Variables** section-ում **Add variable** կոճակը սեղմեք:

#### Secret 1: Firebase API Key

1. **Variable name:** `SECRET_FIREBASE_API_KEY`
2. **Value:** `AIzaSyCTnTWCczvmRZHVrTWDtKRIyBf-d2IOqi4`
3. **Type:** Secret (✅ checkbox-ը նշեք)
4. **Save**

#### Secret 2: Firebase Auth Domain

1. **Variable name:** `FIREBASE_AUTH_DOMAIN`
2. **Value:** `architect-quiz-c5273.firebaseapp.com`
3. **Type:** Secret (✅ checkbox-ը նշեք)
4. **Save**

#### Secret 3: Firebase Project ID

1. **Variable name:** `FIREBASE_PROJECT_ID`
2. **Value:** `architect-quiz-c5273`
3. **Type:** Secret (✅ checkbox-ը նշեք)
4. **Save**

#### Secret 4: Firebase Storage Bucket

1. **Variable name:** `FIREBASE_STORAGE_BUCKET`
2. **Value:** `architect-quiz-c5273.firebasestorage.app`
3. **Type:** Secret (✅ checkbox-ը նշեք)
4. **Save**

#### Secret 5: Firebase Messaging Sender ID

1. **Variable name:** `FIREBASE_MESSAGING_SENDER_ID`
2. **Value:** `566027889328`
3. **Type:** Secret (✅ checkbox-ը նշեք)
4. **Save**

#### Secret 6: Firebase App ID

1. **Variable name:** `FIREBASE_APP_ID`
2. **Value:** `1:566027889328:web:efb894feed4b74bd4ca975`
3. **Type:** Secret (✅ checkbox-ը նշեք)
4. **Save**

#### Secret 7: Firebase Measurement ID

1. **Variable name:** `FIREBASE_MEASUREMENT_ID`
2. **Value:** `G-57NQ5TB1NP`
3. **Type:** Secret (✅ checkbox-ը նշեք)
4. **Save**

#### Secret 8: IP Geolocation API Key

1. **Variable name:** `SECRET_IPGEOLOCATION_API_KEY`
2. **Value:** `free`
3. **Type:** Secret (✅ checkbox-ը նշեք)
4. **Save**

**✅ Բոլոր secrets-ները ավելացված են!**

---

## ✅ Քայլ 7: Deploy Worker Code

### 7.1. PowerShell-ում (backend folder-ում)

```powershell
wrangler deploy
```

### 7.2. Ինչ է տեղի ունենում

1. Wrangler-ը կկարդա `worker.js` file-ը
2. Կcompile անի code-ը
3. Կupload անի Cloudflare-ին
4. Կdeploy անի worker-ը

**Output-ը կլինի:**
```
✨  Compiled Worker successfully
✨  Successfully published your Worker to the following routes:
   - quiz-backend-api.your-subdomain.workers.dev
```

**✅ Deploy-ը ավարտված է!**

---

## ✅ Քայլ 8: Test Backend

### 8.1. Test Health Endpoint

Browser-ում բացեք:
```
https://quiz-backend-api.your-subdomain.workers.dev/health
```

**Expected response:**
```json
{"status":"ok","message":"Backend API is running"}
```

### 8.2. Test Firebase Config Endpoint

Browser-ում բացեք:
```
https://quiz-backend-api.your-subdomain.workers.dev/api/firebase-config
```

**Expected response:**
```json
{
  "apiKey": "AIzaSyCTnTWCczvmRZHVrTWDtKRIyBf-d2IOqi4",
  "authDomain": "architect-quiz-c5273.firebaseapp.com",
  "projectId": "architect-quiz-c5273",
  "storageBucket": "architect-quiz-c5273.firebasestorage.app",
  "messagingSenderId": "566027889328",
  "appId": "1:566027889328:web:efb894feed4b74bd4ca975",
  "measurementId": "G-57NQ5TB1NP"
}
```

**✅ Backend-ը աշխատում է!**

---

## 📝 Հաջորդ Քայլեր

1. ✅ Backend deployed
2. ⏳ Update frontend to use backend URL
3. ⏳ Remove API keys from frontend files
4. ⏳ Test that everything works

---

## 🔍 Troubleshooting (Խնդիրների Լուծում)

### Error: "npm: command not found"

**Լուծում:**
1. Install Node.js: [nodejs.org](https://nodejs.org/)
2. Restart PowerShell
3. Try again

### Error: "wrangler: command not found"

**Լուծում:**
```powershell
npm install -g wrangler
```

### Error: "No account ID found"

**Լուծում:**
```powershell
wrangler login
```

### Error: "Worker name already exists"

**Լուծում:**
1. Cloudflare Dashboard-ում գնացեք Workers & Pages
2. Delete existing worker-ը
3. Try again

կամ

1. `wrangler.toml` file-ում փոխեք `name` field-ը:
   ```toml
   name = "quiz-backend-api-unique-name"
   ```

### Error: "Secret not found"

**Լուծում:**
1. Cloudflare Dashboard → Workers & Pages → quiz-backend-api
2. Settings → Variables
3. Ստուգեք, որ բոլոր secrets-ները ավելացված են
4. Ստուգեք, որ variable names-ները ճիշտ են (case-sensitive)

### Error: "401 Unauthorized"

**Լուծում:**
```powershell
wrangler login
```

### Backend-ը չի աշխատում

**Լուծում:**
1. Cloudflare Dashboard → Workers & Pages → quiz-backend-api
2. **Logs** tab-ը սեղմեք
3. Ստուգեք errors-ները
4. **Settings** → **Variables** - ստուգեք, որ secrets-ները set են

---

## ✅ Summary (Ամփոփում)

### Պարտադիր Քայլեր:

1. ✅ Install Node.js (եթե չունեք)
2. ✅ `npm install -g wrangler`
3. ✅ Create Cloudflare account
4. ✅ `wrangler login`
5. ✅ `cd backend`
6. ✅ Create Worker in Dashboard
7. ✅ Set 8 secrets in Dashboard
8. ✅ `wrangler deploy`
9. ✅ Test endpoints

### Պահեք:

- **Backend URL:** `https://quiz-backend-api.your-subdomain.workers.dev`
- **Worker Name:** `quiz-backend-api`

**Backend-ը պատրաստ է!** 🎉

---

## 📞 Օգնություն

Եթե խնդիր կա:
1. Ստուգեք **Troubleshooting** section-ը
2. Cloudflare Dashboard → Workers → Logs (errors-ները տեսնելու համար)
3. `wrangler whoami` - ստուգել login status

