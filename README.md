# TrackMe

Application mobile de suivi d'habitudes quotidiennes centrée sur :
- les repas planifiés,
- l'activité physique déclarative,
- les alertes et notifications.

Pensée pour un usage mono-utilisateur, mono-appareil : tout fonctionne en local sur le téléphone, sans backend ni compte à créer.

## Architecture

- **mobile/** : l'application complète (Expo/React Native). Toutes les données (plats, repas planifiés, activités, règles d'alerte, historique) sont stockées dans une base SQLite embarquée sur l'appareil.
- Les alertes sont déclenchées par des **notifications programmées côté OS** (`expo-notifications`), à heure fixe ou en récurrence — elles fonctionnent hors-ligne et même app fermée, sans serveur.
- Il n'y a pas de backend : voir `mobile/README.md` pour lancer l'app.

## Périmètre v1

Le périmètre v1 couvre :
- setup projet et infrastructure de base,
- module repas,
- module activité,
- module alertes/notifications (en local, avec récurrence),
- vue quotidienne.

Les fonctionnalités de backlog v2 ne sont pas développées dans cette phase.

## Structure

- mobile/ : application mobile (voir mobile/README.md pour l'installation et le lancement)
- docs/ : documentation et planning
- .github/workflows/ : CI de base
