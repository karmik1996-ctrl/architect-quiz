@echo off
echo ========================================
echo Fix Git Commit Error
echo ========================================
echo.

cd /d D:\Programs\CursorTest\netlify-deploy

echo [1/5] Checking js/ folder...
if not exist js\ (
    echo ERROR: js/ folder does NOT exist!
    pause
    exit /b 1
)
echo ✅ js/ folder exists
echo.

echo [2/5] Adding ALL files (including js/)...
git add .
echo Done!
echo.

echo [3/5] Checking status...
git status
echo.

echo [4/5] Creating commit...
git commit -m "Add js folder and all project files"
if %errorlevel% neq 0 (
    echo ERROR: Commit failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [5/5] Setting branch to main...
git branch -M main
echo Done!
echo.

echo ========================================
echo SUCCESS: All files committed!
echo ========================================
echo.
echo Next step: Push to GitHub
echo.
echo Command: git push -u origin main
echo.
echo IMPORTANT: Use Personal Access Token (NOT password!)
echo.
pause





