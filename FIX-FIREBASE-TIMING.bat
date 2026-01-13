@echo off
echo ========================================
echo Fix Firebase Timing Issues
echo ========================================
echo.

cd /d D:\Programs\CursorTest\netlify-deploy

echo [1/4] Adding fixed files...
git add js/firebase.config.js
git add js/firebase.auth.js
git add js/auth.ui.js
echo Done!
echo.

echo [2/4] Creating commit...
git commit -m "Fix Firebase initialization timing issues"
if %errorlevel% neq 0 (
    echo ERROR: Commit failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [3/4] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Push failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo ========================================
echo SUCCESS: Firebase timing fixes pushed!
echo ========================================
echo.
echo Wait 1-2 minutes, then test again
echo.
pause





