@echo off
echo ========================================
echo Check and Push Firebase Modules
echo ========================================
echo.
cd /d D:\Programs\CursorTest\netlify-deploy
echo [1/6] Checking if files exist locally...
if not exist js\firebase.config.js (
    echo ERROR: js\firebase.config.js NOT found!
    pause
    exit /b 1
)
if not exist js\firebase.auth.js (
    echo ERROR: js\firebase.auth.js NOT found!
    pause
    exit /b 1
)
if not exist js\auth.ui.js (
    echo ERROR: js\auth.ui.js NOT found!
    pause
    exit /b 1
)
if not exist js\quiz.access.js (
    echo ERROR: js\quiz.access.js NOT found!
    pause
    exit /b 1
)
echo ✅ All Firebase module files found locally
echo.
echo [2/6] Checking Git status...
git status --short js/firebase.config.js js/firebase.auth.js js/auth.ui.js js/quiz.access.js
echo.
echo [3/6] Adding ALL files (including Firebase modules)...
git add js/firebase.config.js js/firebase.auth.js js/auth.ui.js js/quiz.access.js
if %errorlevel% neq 0 (
    echo ERROR: Git add failed!
    pause
    exit /b 1
)
echo Done!
echo.
echo [4/6] Checking what will be committed...
git status --short js/firebase.config.js js/firebase.auth.js js/auth.ui.js js/quiz.access.js
echo.
echo [5/6] Creating commit...
git commit -m "Add Firebase authentication modules (firebase.config.js, firebase.auth.js, auth.ui.js, quiz.access.js)"
if %errorlevel% neq 0 (
    echo.
    echo Checking if files are already committed...
    git log --oneline --all -- js/firebase.config.js js/firebase.auth.js js/auth.ui.js js/quiz.access.js | head -n 1
    echo.
    echo If commit failed, files may already be committed. Trying push anyway...
    echo.
)
echo.
echo [6/6] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Push failed!
    pause
    exit /b 1
)
echo Done!
echo.
echo ========================================
echo SUCCESS: Firebase modules pushed!
echo ========================================
echo.
echo Wait 1-2 minutes, then hard refresh (Ctrl+Shift+R)
echo Check Sources tab - Firebase modules should appear in js/ folder
echo.
pause




