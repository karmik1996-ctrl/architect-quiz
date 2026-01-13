@echo off
chcp 65001 >nul
echo ============================================
echo Pushing changes to GitHub...
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] Checking git status...
git status --short
echo.

echo [2/4] Adding all changes...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files!
    pause
    exit /b 1
)
echo ✓ Files added successfully
echo.

echo [3/4] Committing changes...
git commit -m "Update: Auto commit from script"
if %errorlevel% neq 0 (
    echo WARNING: Commit failed (may be no changes to commit)
    echo Continuing to push...
) else (
    echo ✓ Commit successful
)
echo.

echo [4/4] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ERROR: Failed to push!
    echo Make sure you have internet connection and GitHub access.
    pause
    exit /b 1
)
echo.

echo ============================================
echo ✓ Successfully pushed to GitHub!
echo ============================================
pause




