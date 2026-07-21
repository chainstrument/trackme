# EPIC 7 — Vraie application mobile (React Native/Expo) + notifications push

## Résultat livré
- vrai projet Expo/React Native (SDK 57) à la place du scaffold placeholder, avec navigation (react-navigation)
- écran quotidien migré en composants React Native natifs (View/Text/TextInput/Pressable), sans API web (plus de `window.prompt`/`<select>`)
- environnement de notifications push configuré (permission, token Expo Push, gestion simulateur/permission refusée) — résout aussi l'issue 1.4
- endpoint backend `/api/devices` pour enregistrer le token push d'un device (dédup par token)
- envoi effectif des notifications push depuis le scheduler d'alertes (manuel et automatique) vers tous les devices enregistrés — résout aussi l'issue 4.4
- documentation build & run (`mobile/README.md`)

## Vérification
- Tests backend : npm --prefix backend test (13/13)
- Bundle mobile : npx expo export --platform ios (dans mobile/)
- npx expo-doctor (20/20)
