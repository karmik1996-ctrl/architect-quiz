@echo off
echo ========================================
echo Push Firebase Modules to GitHub
echo ========================================
echo.
cd /d D:\Programs\CursorTest\netlify-deploy
echo [1/4] Checking Firebase module files...
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
echo ✅ All Firebase module files found
echo.
echo [2/4] Adding Firebase module files...
git add js/firebase.config.js js/firebase.auth.js js/auth.ui.js js/quiz.access.js
if %errorlevel% neq 0 (
    echo ERROR: Git add failed!
    pause
    exit /b 1
)
echo Done!
echo.
echo [3/4] Creating commit...
git commit -m "Add Firebase authentication modules (firebase.config.js, firebase.auth.js, auth.ui.js, quiz.access.js)"
if %errorlevel% neq 0 (
    echo ERROR: Commit failed!
    pause
    exit /b 1
)
echo Done!
echo.
echo [4/4] Pushing to GitHub...
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
echo.
pause



