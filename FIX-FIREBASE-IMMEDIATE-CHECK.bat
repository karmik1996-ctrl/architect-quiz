@echo off
echo ========================================
echo Fix Firebase Immediate Check
echo ========================================
echo.
cd /d D:\Programs\CursorTest\netlify-deploy
echo [1/3] Adding firebase.config.js...
git add js/firebase.config.js
if %errorlevel% neq 0 (
    echo ERROR: Git add failed!
    pause
    exit /b 1
)
echo Done!
echo.
echo [2/3] Creating commit...
git commit -m "Fix Firebase initialization - remove DOMContentLoaded, start checking immediately"
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
echo SUCCESS: Firebase immediate check fix pushed!
echo ========================================
echo.
echo Wait 1-2 minutes, then hard refresh (Ctrl+Shift+R)
echo.
pause




