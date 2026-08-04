# Correction page Traduction et caméra

## Page blanche corrigée

La page blanche était provoquée par cette erreur React :

```text
ReferenceError: animations is not defined
```

Le diagnostic des animations GLB est maintenant placé dans le callback du
chargeur GLTF, où `gltf.animations` est réellement disponible.

## Fonctionnement de la caméra

La caméra n'effectue pas une reconnaissance continue image par image.

Pour les 20 mots ASL :

1. activer la caméra ;
2. enregistrer un geste pendant 4 secondes ;
3. le navigateur crée une vidéo ;
4. cliquer sur `Analyser le signe` ;
5. la vidéo est envoyée au backend FastAPI ;
6. FFmpeg extrait les frames ;
7. le modèle prédit l'une des 20 classes.

Pour l'alphabet ASL, la caméra capture une photo statique.

## Conditions nécessaires

- frontend sur `http://localhost:5173` ;
- backend sur `http://localhost:8000` ;
- FFmpeg installé ;
- autorisation caméra accordée au navigateur ;
- utilisation de `localhost` ou HTTPS.
