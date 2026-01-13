@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0"

echo Git Auto Push - Automatic commit and push to GitHub
echo ====================================================
echo.

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Not a git repository!
    pause
    exit /b 1
)

REM Check for changes
git diff --quiet && git diff --cached --quiet
if %errorlevel% equ 0 (
    echo No changes to commit.
    echo Checking if there are untracked files...
    git ls-files --others --exclude-standard | findstr . >nul
    if %errorlevel% neq 0 (
        echo No changes or new files found. Nothing to push.
        pause
        exit /b 0
    )
)

echo Adding all changes...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files!
    pause
    exit /b 1
)

echo Committing changes...
set "COMMIT_MSG=Auto commit: %date% %time%"
git commit -m "%COMMIT_MSG%"
set COMMIT_RESULT=%errorlevel%

if %COMMIT_RESULT% neq 0 (
    REM Check if there's nothing to commit
    git diff --cached --quiet
    if %errorlevel% equ 0 (
        echo No changes to commit (all files already committed)
    ) else (
        echo ERROR: Commit failed!
        pause
        exit /b 1
    )
) else (
    echo Commit successful: %COMMIT_MSG%
)

echo.
echo Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to push to GitHub!
    echo Possible reasons:
    echo   - No internet connection
    echo   - GitHub authentication required
    echo   - Remote repository not found
    echo.
    pause
    exit /b 1
)

echo.
echo ====================================================
echo SUCCESS: All changes pushed to GitHub!
echo ====================================================
pause




