@echo off
echo ========================================
echo Fix Firebase Loading (Final Retry Fix)
echo ========================================
echo.

cd /d D:\Programs\CursorTest\netlify-deploy

echo [1/3] Pulling remote changes...
git pull origin main --no-edit
if %errorlevel% neq 0 (
    echo WARNING: Pull might have conflicts, continuing...
)
echo Done!
echo.

echo [2/3] Adding fixed files...
git add js/firebase.config.js
git add js/firebase.auth.js
echo Done!
echo.

echo [3/3] Creating commit and pushing...
git commit -m "Fix Firebase loading: Increase retry attempts and improve initialization"
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Push failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo ========================================
echo SUCCESS: Firebase retry fix pushed!
echo ========================================
echo.
echo Wait 1-2 minutes, then hard refresh (Ctrl+Shift+R)
echo Then try registration again.
echo.
pause



