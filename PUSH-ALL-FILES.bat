@echo off
echo ========================================
echo Push All New Features to GitHub
echo ========================================
echo.

cd /d D:\Programs\CursorTest\netlify-deploy

echo [1/4] Adding all files...
git add index.html
git add js/firebase.config.js
git add js/firebase.auth.js
git add js/auth.ui.js
git add js/quiz.access.js
git add js/quiz.core.js
echo Done!
echo.

echo [2/4] Checking status...
git status
echo.

echo [3/4] Creating commit...
git commit -m "Add Firebase Auth, Registration/Login UI, and Demo/Trial feature (10 free questions)"
if %errorlevel% neq 0 (
    echo ERROR: Commit failed!
    pause
    exit /b 1
)
echo Done!
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
echo SUCCESS: All files pushed to GitHub!
echo ========================================
echo.
echo Wait 1-2 minutes for GitHub Pages to update
echo Then test: https://karmik1996-ctrl.github.io/architect-quiz/
echo.
pause


