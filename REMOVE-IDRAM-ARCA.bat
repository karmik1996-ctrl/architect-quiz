@echo off
echo ========================================
echo Remove IDram and ArCa Account Details
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

echo [2/3] Adding updated file...
git add index.html
echo Done!
echo.

echo [3/3] Creating commit and pushing...
git commit -m "Remove IDram and ArCa account details (payment method changed)"
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Push failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo ========================================
echo SUCCESS: IDram and ArCa removed!
echo ========================================
echo.
echo Wait 1-2 minutes, then hard refresh (Ctrl+Shift+R)
echo.
pause



