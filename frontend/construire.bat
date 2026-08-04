@echo off
title Build SignVerse React
call npm install
if errorlevel 1 exit /b 1
call npm run build
if errorlevel 1 exit /b 1
echo.
echo Version de production creee dans le dossier dist.
pause
