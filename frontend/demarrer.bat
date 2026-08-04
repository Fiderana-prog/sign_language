@echo off
title SignVerse React
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js n'est pas installe.
  echo Installe Node.js puis relance ce fichier.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installation des dependances...
  call npm install
  if errorlevel 1 (
    echo Echec de l'installation des dependances.
    pause
    exit /b 1
  )
)
echo Demarrage de SignVerse...
call npm run dev
pause
