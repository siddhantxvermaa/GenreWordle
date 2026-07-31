@echo off
echo Uploading changes to GitHub...
git add .
git commit -m "Auto-update game files"
git push origin main
echo Done!
pause
