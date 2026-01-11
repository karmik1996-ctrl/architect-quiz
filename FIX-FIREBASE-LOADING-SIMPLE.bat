@echo off
echo ========================================
echo Fix Firebase Loading (Simple Approach)
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
git commit -m "Fix Firebase modules loading - use static script tags instead of dynamic loading"
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
echo SUCCESS: Firebase loading fix pushed!
echo ========================================
echo.
echo Wait 1-2 minutes, then hard refresh (Ctrl+Shift+R)
echo.
pause


