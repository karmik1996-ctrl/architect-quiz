@echo off
echo ========================================
echo Git Repository Setup
echo ========================================
echo.

cd /d D:\Programs\CursorTest\netlify-deploy

echo [1/8] Setting Git config...
git config --global user.email "karmik1996-ctrl@example.com"
git config --global user.name "karmik1996-ctrl"
echo Done!
echo.

echo [2/8] Initializing repository...
git init
echo Done!
echo.

echo [3/8] Adding js/ folder...
git add js/
echo Done!
echo.

echo [4/8] Creating commit...
git commit -m "Add js folder with JavaScript modules"
if %errorlevel% neq 0 (
    echo ERROR: Commit failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [5/8] Setting branch to main...
git branch -M main
echo Done!
echo.

echo [6/8] Setting remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/karmik1996-ctrl/architect-quiz.git
echo Done!
echo.

echo [7/8] Checking status...
git status
echo.

echo [8/8] Ready to push!
echo ========================================
echo SUCCESS: Repository initialized!
echo ========================================
echo.
echo Next step: Push to GitHub
echo.
echo Command: git push -u origin main
echo.
echo IMPORTANT: Use Personal Access Token (NOT password!)
echo.
pause



