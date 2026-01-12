@echo off
echo ========================================
echo Add All JS Files to Git
echo ========================================
echo.
cd /d D:\Programs\CursorTest\netlify-deploy
echo [1/4] Adding ALL files in js/ folder...
git add js/
if %errorlevel% neq 0 (
    echo ERROR: Git add failed!
    pause
    exit /b 1
)
echo Done!
echo.
echo [2/4] Checking status...
git status --short js/
echo.
echo [3/4] Creating commit...
git commit -m "Add all JavaScript modules including Firebase authentication"
if %errorlevel% neq 0 (
    echo ERROR: Commit failed!
    echo.
    echo Checking if files are already committed...
    git log --oneline -1
    echo.
    echo If you see this message, files may already be committed.
    echo Trying push anyway...
    echo.
)
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
echo SUCCESS: All JS files pushed!
echo ========================================
echo.
echo Wait 1-2 minutes, then hard refresh (Ctrl+Shift+R)
echo.
pause



