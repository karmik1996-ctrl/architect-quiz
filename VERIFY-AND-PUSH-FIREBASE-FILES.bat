@echo off
echo ========================================
echo Verify and Push Firebase Files
echo ========================================
echo.
cd /d D:\Programs\CursorTest\netlify-deploy
echo [1/5] Checking if files exist locally...
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
echo ✅ All files exist locally
echo.
echo [2/5] Checking Git status...
git status js/firebase.config.js js/firebase.auth.js js/auth.ui.js js/quiz.access.js
echo.
echo [3/5] Adding files...
git add -f js/firebase.config.js js/firebase.auth.js js/auth.ui.js js/quiz.access.js
if %errorlevel% neq 0 (
    echo ERROR: Git add failed!
    pause
    exit /b 1
)
echo Done!
echo.
echo [4/5] Creating commit...
git commit -m "Add Firebase authentication modules (firebase.config.js, firebase.auth.js, auth.ui.js, quiz.access.js)"
if %errorlevel% neq 0 (
    echo ERROR: Commit failed!
    echo Files may already be committed, trying push anyway...
    echo.
)
echo.
echo [5/5] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Push failed!
    pause
    exit /b 1
)
echo Done!
echo.
echo ========================================
echo SUCCESS: Firebase files pushed!
echo ========================================
echo.
echo Wait 1-2 minutes, then hard refresh (Ctrl+Shift+R)
echo Check Network tab - Firebase modules should appear
echo.
pause


