@echo off
cd /d D:\Programs\CursorTest\netlify-deploy
git config --global user.email "karmik1996-ctrl@example.com"
git config --global user.name "karmik1996-ctrl"
git init
git add js/
git commit -m "Add js folder"
git remote add origin https://github.com/karmik1996-ctrl/architect-quiz.git
git branch -M main
echo.
echo ========================================
echo Git Push Command:
echo ========================================
echo git push -u origin main
echo.
echo Password-ի փոխարեն օգտագործեք Personal Access Token!
echo.





