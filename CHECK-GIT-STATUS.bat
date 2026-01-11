@echo off
echo ========================================
echo Check Git Status for Firebase Modules
echo ========================================
echo.
cd /d D:\Programs\CursorTest\netlify-deploy
echo [1/3] Checking if files exist locally...
if exist js\firebase.config.js (
    echo ✅ js\firebase.config.js EXISTS locally
) else (
    echo ❌ js\firebase.config.js NOT found locally
)
if exist js\firebase.auth.js (
    echo ✅ js\firebase.auth.js EXISTS locally
) else (
    echo ❌ js\firebase.auth.js NOT found locally
)
if exist js\auth.ui.js (
    echo ✅ js\auth.ui.js EXISTS locally
) else (
    echo ❌ js\auth.ui.js NOT found locally
)
if exist js\quiz.access.js (
    echo ✅ js\quiz.access.js EXISTS locally
) else (
    echo ❌ js\quiz.access.js NOT found locally
)
echo.
echo [2/3] Checking Git status for these files...
git status js/firebase.config.js js/firebase.auth.js js/auth.ui.js js/quiz.access.js
echo.
echo [3/3] Checking if files are tracked by Git...
git ls-files js/firebase.config.js js/firebase.auth.js js/auth.ui.js js/quiz.access.js
echo.
echo ========================================
echo If files are listed above, they ARE tracked
echo If NOT listed, they need to be added
echo ========================================
echo.
pause


