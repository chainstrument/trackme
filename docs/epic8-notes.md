# EPIC 8 — Base locale (SQLite) + notifications programmées localement

## Résultat livré
- base SQLite embarquée sur l'appareil (`mobile/lib/db.js`), remplaçant le stockage en mémoire du backend
- modules Repas et Activité entièrement migrés en local (repositories dédiés)
- modèle de règle d'alerte étendu pour supporter la récurrence ("toutes les X minutes") en plus de l'horaire fixe, stocké en local
- notifications programmées directement côté OS (`expo-notifications`), fonctionnant hors-ligne et app fermée, resynchronisées à chaque démarrage
- backend Node retiré entièrement (devenu inutile) — l'app ne fait plus aucun appel réseau
- documentation (README racine + mobile/README.md) mise à jour pour l'architecture 100% locale

## Vérification
- Bundle mobile : npx expo export --platform ios (dans mobile/)
- npx expo-doctor (20/20)
