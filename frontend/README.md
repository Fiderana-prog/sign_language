# SignVerse - Front-end React

Prototype front-end réalisé avec React, Vite et React Router.

## Pages incluses

- Landing page
- Vue d’ensemble
- Traduction texte
- Traduction vocale via l’API Web Speech du navigateur
- Démonstration caméra via `getUserMedia`
- Lexique LSF avec recherche et filtres
- Quiz d’entraînement interactif

## Installation

```bash
npm install
npm run dev
```

Puis ouvrir l’adresse affichée par Vite, généralement `http://localhost:5173`.

## Générer la version de production

```bash
npm run build
npm run preview
```

## Important

Ce projet est uniquement le front-end. Il ne contient ni API, ni base de données, ni moteur IA, ni système d’authentification. Les traductions, la reconnaissance des signes et les animations sont des démonstrations locales destinées à être reliées plus tard à un back-end.

## Animation de la page d'accueil

L'image ADN flotte automatiquement grâce à CSS et suit doucement le curseur grâce à JavaScript dans `src/pages/Landing.jsx`.
Les styles se trouvent dans `src/styles.css` (`hero__dna-wrap`, `dnaFloat` et `ringsPulse`).


## Dernières modifications

- rotation continue de l'image centrale sur la landing page
- amélioration visuelle de l'image ADN avec une version HQ
- rendu plus net grâce à un asset upscalé (`public/assets/dna-hq.png`)

- animation de l'ADN remplacée par un mouvement 3D de type hélice (plus proche d'un gif de rotation ADN que d'une rotation plate)
- effet de profondeur avec calque arrière flou et aura lumineuse


## Version vidéo ADN

- L’image centrale de la page d’accueil a été remplacée par `public/assets/adn-clean.mp4`.
- La vidéo démarre automatiquement, sans son et en boucle.
- Le marquage chinois situé en haut à droite a été retiré par recadrage de la vidéo.
- Un poster de chargement est fourni dans `public/assets/adn-poster.jpg`.


## Intégration vidéo au design

- fond noir de la vidéo rendu transparent dans `adn-transparent.webm`
- vidéo intégrée au fond blanc et lavande de SignVerse
- halo violet et orange, ombre douce et reflets subtils
- fallback MP4 conservé pour les navigateurs incompatibles

## Modifications de navigation et d'affichage

- Le bouton « Explorer » ouvre maintenant un menu complet.
- Accès direct à Vue d’ensemble, Traduire, Lexique LSF et S’entraîner.
- Le texte de la landing page et des écrans principaux a été agrandi.
- Sur un écran d’ordinateur standard, toute la première page (en-tête, présentation et protocole) tient dans le premier écran sans défilement.


## Modifications de cette version

- L'image ADN originale est utilisée comme visuel d'arrière-plan de la page d'accueil.
- Le logo SignVerse redirige vers la route `/` depuis toutes les pages.
- La page d'accueil et les écrans de l'application sont adaptés aux téléphones et tablettes.
- Le menu Explorer devient plein largeur sur mobile et reste accessible au clavier.

## Intégration du modèle ASL

La page `/app/traduire` est maintenant connectée à une API FastAPI/TensorFlow.

Crée un fichier `.env` à la racine du frontend :

```env
VITE_API_URL=http://localhost:8000
```

Routes attendues :

- `GET /api/health`
- `POST /api/predict/video`
- `POST /api/predict/image`

La réponse de prédiction doit suivre ce format :

```json
{
  "mode": "video",
  "valid_frames": 30,
  "predictions": [
    { "word": "thanks", "translation": "merci", "confidence": 0.98 }
  ]
}
```

Le mode reconnaissance accepte :

- import de vidéo ;
- import d’image expérimental ;
- enregistrement caméra de 4 secondes ;
- Top 3 des prédictions ;
- naturalisation simple avec les 20 classes ASL.
