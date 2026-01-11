@echo off
echo ========================================
echo Fix Firebase Loading (Final Fix)
echo ========================================
echo.

cd /d D:\Programs\CursorTest\netlify-deploy

echo [1/3] Adding fixed files...
git add js/firebase.config.js
git add js/firebase.auth.js
echo Done!
echo.

echo [2/3] Creating commit...
git commit -m "Fix Firebase loading: Add retry mechanism and proper checks"
if %errorlevel% neq 0 (
    echo ERROR: Commit failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [3/3] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Push failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo ========================================
echo SUCCESS: Firebase fix pushed!
echo ========================================
echo.
echo Wait 1-2 minutes, then hard refresh (Ctrl+Shift+R)
echo.
pause


