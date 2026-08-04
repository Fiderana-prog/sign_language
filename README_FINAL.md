# SignVerse — Projet complet final

Cette version intègre le modèle 3D final à deux mains et ses 20 animations ASL.

## Modèle intégré

`frontend/public/models/signverse-hands-rigged.glb`

Actions attendues :

- WORD_BABY
- WORD_EAT
- WORD_FATHER
- WORD_FINISH
- WORD_GOOD
- WORD_HAPPY
- WORD_HEAR
- WORD_HOUSE
- WORD_IMPORTANT
- WORD_LOVE
- WORD_MALL
- WORD_ME
- WORD_MOSQUE
- WORD_MOTHER
- WORD_NORMAL
- WORD_SAD
- WORD_STOP
- WORD_THANKS
- WORD_THINKING
- WORD_WORRY

## Lancement Linux

```bash
chmod +x run_linux.sh
./run_linux.sh
```

## Lancement Windows

Double-cliquer sur :

```text
run_windows.bat
```

FFmpeg, Python 3.11/3.12 et Node.js 18+ doivent être installés.

## Frontend seul

```bash
cd frontend
npm install
npm run dev
```

Le site sera disponible sur `http://localhost:5173`.

## Backend seul

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Sous Windows, utiliser `.venv\Scripts\activate`.
