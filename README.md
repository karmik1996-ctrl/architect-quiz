# ճարտարապետների արտոնագրման և որակավորման հարցաթերթիկներ

Արխիտեկտների լիցենզավորման և որակավորման հարցաթերթիկների հավաքածու:

## 🚀 GitHub Pages Deployment

Այս նախագիծը ավտոմատ կերպով deploy է արվում GitHub Pages-ում:

### 📋 Deployment Հրահանգներ

1. **Repository ստեղծում:**
   - Ստեղծեք նոր repository GitHub-ում
   - Repository name: `architect-quiz` (կամ ձեր ընտրած անունը)

2. **Կոդի upload:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/architect-quiz.git
   git push -u origin main
   ```

3. **GitHub Pages կարգավորում:**
   - Գնացեք repository-ի **Settings** → **Pages**
   - **Source** ընտրեք: **GitHub Actions**
   - Workflow ավտոմատ կաշխատի

4. **Կայքը հասանելի կլինի:**
   - URL: `https://YOUR_USERNAME.github.io/architect-quiz/`

## 📁 Ֆայլերի Կառուցվածք

```
.
├── index.html          # Գլխավոր HTML ֆայլ
├── style.css           # CSS styles
├── js/                 # JavaScript modules
│   ├── main.js
│   ├── quiz.core.js
│   ├── quiz.ui.js
│   ├── quiz.security.js
│   ├── quiz.storage.js
│   ├── quiz.payment.js
│   ├── quiz.tracking.js
│   ├── quiz.svg.js
│   ├── quiz.idle.js
│   └── quiz.data.js
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions workflow
```

## 🔧 Տեղական Զարգացում

1. **HTTP Server աշխատեցնել:**
   ```bash
   python -m http.server 8000
   ```

2. **Բրաուզերում բացել:**
   ```
   http://localhost:8000
   ```

## ✨ Հատկություններ

- ✅ 175 հարցաթերթիկներ
- ✅ Payment system integration
- ✅ Progress tracking
- ✅ Dark mode
- ✅ Responsive design
- ✅ Modular JavaScript architecture

## 📝 License

Private project




