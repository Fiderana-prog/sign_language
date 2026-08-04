#Lien du deployement: https://sign-language-5grl.onrender.com
#lien du powerPoint: https://canva.link/udfvdvsyvb2eu3h

# SignVerse complet corrigé

Cette version regroupe :

- le frontend React/Vite SignVerse ;
- le backend FastAPI ;
- le modèle de reconnaissance de 20 mots ASL ;
- le modèle Alphabet ASL de 36 classes ;
- la traduction et naturalisation simple ;
- le modèle 3D riggé à 34 os ;
- les vraies animations du fichier GLB lues avec Three.js.

## Correction principale du modèle 3D

L’ancienne version faisait seulement tourner le modèle entier.

Cette version utilise :

```text
THREE.AnimationMixer
THREE.AnimationAction
THREE.AnimationClip
```

Le fichier chargé est :

```text
frontend/public/models/signverse-hands-rigged.glb
```

Les animations exportées depuis Blender sont détectées automatiquement.
Le menu du visualiseur permet de choisir une animation, puis de :

- lire ;
- mettre en pause ;
- continuer ;
- rejouer ;
- régler la vitesse ;
- régler le zoom ;
- déplacer la progression.

## Limite actuelle

Le squelette et les articulations fonctionnent, mais le GLB contient
principalement des animations de test :

```text
TEST_FINGER_FLEX
TEST_FINGER_FLEX.001
TEST_FULL_BODY
```

Ces clips ne correspondent pas encore aux poses exactes de A à Z ni aux
20 mots. Pour une traduction fidèle, il faudra créer dans Blender des
clips comme :

```text
LETTER_A
LETTER_B
LETTER_C
...
WORD_THANKS
WORD_LOVE
```

## Structure

```text
SignVerse-complet-corrige/
├── frontend/
│   ├── public/models/signverse-hands-rigged.glb
│   └── src/
│       ├── components/HandModel3D.jsx
│       ├── components/AvatarStage.jsx
│       └── pages/Translate.jsx
├── backend/
│   ├── app/main.py
│   └── model/
│       ├── asl20_words_full.keras
│       └── asl_alphabet_ensemble.keras
├── source-assets/SignVerseRig/
│   ├── signverse_hands_rigged.blend
│   └── signverse_hands_rigged.glb
├── run_linux.sh
└── run_windows.bat
```

## Installation sous Windows

Installe :

- Python 3.10 ou 3.11 ;
- Node.js 18 ou supérieur ;
- FFmpeg ajouté au PATH.

Ensuite, double-clique sur :

```text
run_windows.bat
```

## Installation sous Ubuntu/Debian

```bash
sudo apt update
sudo apt install python3-venv ffmpeg nodejs npm

chmod +x run_linux.sh
./run_linux.sh
```

## Adresses

```text
Frontend : http://localhost:5173
Backend : http://localhost:8000
Documentation API : http://localhost:8000/docs
```
