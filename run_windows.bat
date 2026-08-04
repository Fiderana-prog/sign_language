@echo off
set ROOT_DIR=%~dp0

where ffmpeg >nul 2>&1

if errorlevel 1 (
    echo FFmpeg n'est pas installe ou absent du PATH.
    pause
    exit /b 1
)

cd /d "%ROOT_DIR%backend"

if not exist .venv (
    python -m venv .venv
)

call .venv\Scripts\activate

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

start "SignVerse API" cmd /k ^
".venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000"

cd /d "%ROOT_DIR%frontend"

call npm install
call npm run dev -- --host 0.0.0.0
