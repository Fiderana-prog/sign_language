# SignVerse — 3D initial et caméra avec détection de mouvement

## Modèle 3D

Le modèle initial a été restauré :

```text
frontend/public/models/signverse-hands-rigged.glb
```

Il contient les animations de démonstration initiales :

- TEST_FINGER_FLEX
- TEST_FINGER_FLEX.001
- TEST_FULL_BODY

Les mots traduits ne déclenchent plus automatiquement les actions WORD_*.

## Page Traduction

La page s'ouvre désormais directement sur le mode Caméra.

La caméra est également la première source proposée.

## Détection du mouvement

Pendant que la caméra est active, le frontend :

1. réduit les images à 64 × 48 pixels ;
2. transforme les images en niveaux de gris ;
3. compare les images successives ;
4. calcule le nombre de pixels ayant changé ;
5. affiche un score de mouvement ;
6. mémorise le mouvement pendant les 4 secondes d'enregistrement ;
7. refuse une vidéo presque immobile ;
8. envoie automatiquement une vidéo valide au backend.

Le backend conserve le fonctionnement du modèle séquentiel :

- FFmpeg extrait les images ;
- 30 frames sont sélectionnées ;
- un masque distingue les frames valides ;
- le modèle prédit l'une des 20 classes ASL.

## Conditions nécessaires

- caméra autorisée dans le navigateur ;
- site ouvert sur localhost ou HTTPS ;
- backend FastAPI lancé sur le port 8000 ;
- FFmpeg installé ;
- lumière suffisante ;
- mains entièrement visibles dans le cadre.
