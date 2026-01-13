@echo off
echo ========================================
echo Move JS Files to js/ Folder
echo ========================================
echo.

cd /d D:\Programs\CursorTest\netlify-deploy

echo [1/5] Checking js/ folder...
if not exist js\ (
    echo Creating js/ folder...
    mkdir js
)
echo ✅ js/ folder exists
echo.

echo [2/5] Moving JavaScript files to js/ folder...
if exist main.js (
    move /Y main.js js\main.js
    echo ✅ Moved main.js
)
if exist quiz.core.js (
    move /Y quiz.core.js js\quiz.core.js
    echo ✅ Moved quiz.core.js
)
if exist quiz.data.js (
    move /Y quiz.data.js js\quiz.data.js
    echo ✅ Moved quiz.data.js
)
if exist quiz.idle.js (
    move /Y quiz.idle.js js\quiz.idle.js
    echo ✅ Moved quiz.idle.js
)
if exist quiz.payment.js (
    move /Y quiz.payment.js js\quiz.payment.js
    echo ✅ Moved quiz.payment.js
)
if exist quiz.security.js (
    move /Y quiz.security.js js\quiz.security.js
    echo ✅ Moved quiz.security.js
)
if exist quiz.storage.js (
    move /Y quiz.storage.js js\quiz.storage.js
    echo ✅ Moved quiz.storage.js
)
if exist quiz.svg.js (
    move /Y quiz.svg.js js\quiz.svg.js
    echo ✅ Moved quiz.svg.js
)
if exist quiz.tracking.js (
    move /Y quiz.tracking.js js\quiz.tracking.js
    echo ✅ Moved quiz.tracking.js
)
if exist quiz.ui.js (
    move /Y quiz.ui.js js\quiz.ui.js
    echo ✅ Moved quiz.ui.js
)
echo Done!
echo.

echo [3/5] Adding changes...
git add -A
echo Done!
echo.

echo [4/5] Committing changes...
git commit -m "Move JavaScript files to js/ folder"
if %errorlevel% neq 0 (
    echo ERROR: Commit failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [5/5] Pushing to GitHub...
git push -u origin main
if %errorlevel% neq 0 (
    echo ERROR: Push failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo ========================================
echo SUCCESS: Files moved to js/ folder!
echo ========================================
echo.
pause





