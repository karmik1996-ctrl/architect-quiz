@echo off
echo ========================================
echo Fix Firebase Modules - Add Defer
echo ========================================
echo.
cd /d D:\Programs\CursorTest\netlify-deploy
echo [1/3] Adding index.html...
git add index.html
if %errorlevel% neq 0 (
    echo ERROR: Git add failed!
    pause
    exit /b 1
)
echo Done!
echo.
echo [2/3] Creating commit...
git commit -m "Fix Firebase modules timing - add defer attribute to wait for Firebase SDK"
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
echo SUCCESS: Firebase defer fix pushed!
echo ========================================
echo.
echo Wait 1-2 minutes, then hard refresh (Ctrl+Shift+R)
echo.
pause
