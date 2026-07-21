# TrackMe mobile

Application Expo/React Native.

## Prérequis
- Node.js 18+ et npm
- L'app [Expo Go](https://expo.dev/go) sur un téléphone (le plus simple pour tester), ou Xcode (iOS) / Android Studio (Android) pour un simulateur/émulateur local

## Installation

```bash
cd mobile
npm install
```

## Lancer le backend

L'app pointe vers `http://127.0.0.1:3001` (voir `lib/config.js`). Il faut donc démarrer le backend en parallèle :

```bash
npm --prefix backend start
```

## Lancer l'app

```bash
npm start          # ouvre Metro + QR code, scanner avec Expo Go
npm run ios        # simulateur iOS (macOS uniquement)
npm run android     # émulateur/appareil Android
npm run web         # version web (react-native-web)
```

## Troubleshooting

- **L'app n'arrive pas à joindre le backend depuis un appareil physique ou un émulateur Android** : `127.0.0.1` désigne l'appareil lui-même, pas la machine qui fait tourner le backend.
  - Émulateur Android : soit remplacer l'URL dans `lib/config.js` par `http://10.0.2.2:3001`, soit lancer `adb reverse tcp:3001 tcp:3001`.
  - Appareil physique (via Expo Go) : remplacer `127.0.0.1` par l'adresse IP locale de la machine hôte (ex. `http://192.168.1.42:3001`), les deux appareils devant être sur le même réseau.
- **Les notifications push ne renvoient pas de token** (`pushError` affiché sur l'écran Aujourd'hui) :
  - Sur simulateur/émulateur, c'est normal — les push nécessitent un appareil physique.
  - Sur appareil physique, `getExpoPushTokenAsync` peut nécessiter un projet EAS configuré (`npx eas init`, puis renseigner `extra.eas.projectId` dans `app.json`).
- **Erreur "Unable to resolve module" ou cache Metro corrompu** : `rm -rf node_modules && npm install`, puis `npx expo start -c` pour vider le cache Metro.
- **`npx expo-doctor`** : à lancer après tout ajout de dépendance pour vérifier la cohérence du projet (versions SDK, config native, etc.).
