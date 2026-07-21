# TrackMe mobile

Application Expo/React Native. Tout tourne en local sur l'appareil (base SQLite embarquée, notifications programmées par l'OS) — il n'y a plus de backend à lancer.

## Architecture

- **Données** : base SQLite locale (`lib/db.js`), un repository par domaine (`lib/mealsRepository.js`, `lib/activitiesRepository.js`, `lib/alertRulesRepository.js`). Rien n'est envoyé sur le réseau.
- **Alertes** : chaque règle active a une notification programmée côté OS (`lib/localNotifications.js`) — horaire fixe (déclencheur quotidien) ou récurrence toutes les N minutes. Elles sont resynchronisées à chaque démarrage de l'app.

## Prérequis
- Node.js 18+ et npm
- L'app [Expo Go](https://expo.dev/go) sur un téléphone (le plus simple pour tester), ou Xcode (iOS) / Android Studio (Android) pour un simulateur/émulateur local

## Installation

```bash
cd mobile
npm install
```

## Lancer l'app

```bash
npm start          # ouvre Metro + QR code, scanner avec Expo Go
npm run ios        # simulateur iOS (macOS uniquement)
npm run android     # émulateur/appareil Android
npm run web         # version web (react-native-web)
```

## Troubleshooting

- **Les notifications ne se déclenchent pas** : vérifier que la permission a été accordée (affiché en bas de l'écran Aujourd'hui). Si refusée, l'activer manuellement dans les réglages système de l'app.
- **Erreur "Unable to resolve module" ou cache Metro corrompu** : `rm -rf node_modules && npm install`, puis `npx expo start -c` pour vider le cache Metro.
- **`npx expo-doctor`** : à lancer après tout ajout de dépendance pour vérifier la cohérence du projet (versions SDK, config native, etc.).
