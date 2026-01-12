@echo off
echo ========================================
echo Verify Firebase Files in Git
echo ========================================
echo.
cd /d D:\Programs\CursorTest\netlify-deploy
echo [1/2] Checking if files are tracked by Git...
git ls-tree -r HEAD --name-only | findstr firebase
git ls-tree -r HEAD --name-only | findstr auth.ui
git ls-tree -r HEAD --name-only | findstr quiz.access
echo.
echo [2/2] Checking git log for these files...
git log --oneline --all -- js/firebase.config.js | head -n 1
git log --oneline --all -- js/firebase.auth.js | head -n 1
git log --oneline --all -- js/auth.ui.js | head -n 1
git log --oneline --all -- js/quiz.access.js | head -n 1
echo.
echo ========================================
echo If files are listed above, they ARE in Git
echo ========================================
echo.
pause



