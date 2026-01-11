@echo off
echo ========================================
echo Pull and Push All Firebase Files
echo ========================================
echo.

cd /d D:\Programs\CursorTest\netlify-deploy

echo [1/4] Pulling remote changes...
git pull origin main --no-edit
if %errorlevel% neq 0 (
    echo WARNING: Pull failed, continuing anyway...
)
echo Done!
echo.

echo [2/4] Adding all Firebase files...
git add index.html
git add js/firebase.config.js
git add js/firebase.auth.js
git add js/auth.ui.js
git add js/quiz.access.js
echo Done!
echo.

echo [3/4] Creating commit...
git commit -m "Fix Firebase loading: Use onload events to ensure SDK loads before modules"
if %errorlevel% neq 0 (
    echo ERROR: Commit failed! Check if there are changes to commit.
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
echo SUCCESS: All Firebase fixes pushed!
echo ========================================
echo.
echo Wait 1-2 minutes, then hard refresh (Ctrl+Shift+R)
echo.
pause


