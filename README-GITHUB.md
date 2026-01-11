# GitHub Pages Deployment Guide

## 📋 Quick Setup Steps

### 1. Create GitHub Repository
1. Go to https://github.com
2. Click **"New repository"** (կամ **"+"** → **"New repository"**)
3. Repository name: `architect-quiz` (կամ ինչ անուն կուզես)
4. Make it **Public** (GitHub Pages free tier requires public repo)
5. Check **"Add a README file"** (optional)
6. Click **"Create repository"**

### 2. Upload Files to GitHub

#### Option A: Using GitHub Web Interface
1. Go to your new repository
2. Click **"uploading an existing file"**
3. Drag and drop these files:
   - `index.html`
   - `script.v2.js`
   - `style.css`
   - `admin-panel.html` (if needed)
4. Click **"Commit changes"**

#### Option B: Using Git Command Line
```bash
cd netlify-deploy
git init
git add index.html script.v2.js style.css
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 3. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **"Settings"** (top menu)
3. Scroll down to **"Pages"** (left sidebar)
4. Under **"Source"**, select **"Deploy from a branch"**
5. Branch: **`main`** (or `master`)
6. Folder: **`/ (root)`**
7. Click **"Save"**

### 4. Get Your Live URL
- After a few seconds, GitHub will show your site URL:
  - `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
- Example: `https://johndoe.github.io/architect-quiz/`

## ✅ What Works on GitHub Pages

- ✅ Static HTML/CSS/JS (perfect fit!)
- ✅ `script.v2.js` with all functionality
- ✅ Quiz questions and answers
- ✅ Dark mode toggle
- ✅ Payment form (uses Google Apps Script fallback)
- ✅ All buttons and interactions

## 🔧 Configuration Notes

### Form Submission
The payment form will automatically use Google Apps Script fallback (already implemented in `script.v2.js`):
- Line 2755: Falls back to Google Apps Script if Netlify fails
- Works perfectly on GitHub Pages!

### File Structure
```
your-repo/
├── index.html          (main page)
├── script.v2.js        (all JavaScript)
├── style.css           (styles)
└── admin-panel.html    (optional)
```

## 🚀 Updates

To update your site:
1. Edit files locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update description"
   git push
   ```
3. GitHub Pages automatically redeploys (usually takes 1-2 minutes)

## 🔒 Security

- GitHub Pages is HTTPS by default ✅
- All static files are served securely
- No server-side code (pure client-side JavaScript)

## 📞 Support

- GitHub Pages Docs: https://docs.github.com/en/pages
- GitHub Community: https://github.community

## 🎯 Next Steps

1. ✅ Remove Netlify attributes (already done)
2. ✅ Upload to GitHub
3. ✅ Enable GitHub Pages
4. ✅ Test your live site
5. ✅ Share the URL!

---

**Note**: The script already has Google Apps Script fallback for form submission, so everything should work perfectly on GitHub Pages!


