@echo off
echo ========================================
echo Fix Firebase Loading (OnLoad Event)
echo ========================================
echo.

cd /d D:\Programs\CursorTest\netlify-deploy

echo [1/2] Adding fixed file...
git add index.html
echo Done!
echo.

echo [2/2] Creating commit and pushing...
git commit -m "Fix Firebase loading: Use onload events to ensure SDK loads before modules"
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Push failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo ========================================
echo SUCCESS: Firebase onload fix pushed!
echo ========================================
echo.
echo Wait 1-2 minutes, then hard refresh (Ctrl+Shift+R)
echo.
pause


