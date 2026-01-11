@echo off
cd /d D:\Programs\CursorTest\netlify-deploy
echo ========================================
echo Pull and Push to GitHub
echo ========================================
echo.
echo Step 1: Pulling remote changes...
git pull origin main --allow-unrelated-histories
echo.
echo Step 2: Pushing to GitHub...
git push -u origin main
echo.
echo ========================================
pause

