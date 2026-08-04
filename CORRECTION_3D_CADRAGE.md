# Correction complète du visualiseur 3D

Le modèle est désormais recadré dynamiquement pendant chaque animation.

## Corrections appliquées

- utilisation du GLB contenant les 20 animations dynamiques correctement renommées ;
- calcul des limites visibles des meshes animés ;
- prise en compte des `SkinnedMesh` après mise à jour du squelette ;
- recentrage automatique toutes les 66 ms ;
- adaptation automatique de l’échelle à la largeur et à la hauteur disponibles ;
- recadrage immédiat lors d’un changement d’action ;
- conservation du zoom manuel de l’utilisateur.

Cette correction empêche les deux mains de sortir du cadre pendant les actions
comme `WORD_BABY` et `WORD_LOVE`.
