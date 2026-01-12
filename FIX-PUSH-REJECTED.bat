@echo off
echo ========================================
echo Fix Push Rejected Error
echo ========================================
echo.

cd /d D:\Programs\CursorTest\netlify-deploy

echo [1/4] Pulling remote changes...
git pull origin main --allow-unrelated-histories
if %errorlevel% neq 0 (
    echo ERROR: Pull failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [2/4] Adding all changes...
git add .
echo Done!
echo.

echo [3/4] Committing merge...
git commit -m "Merge remote and local changes"
if %errorlevel% neq 0 (
    echo ERROR: Commit failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [4/4] Pushing to GitHub...
git push -u origin main
if %errorlevel% neq 0 (
    echo ERROR: Push failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo ========================================
echo SUCCESS: Push completed!
echo ========================================
echo.
pause




