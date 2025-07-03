# 🔐 Configuration sécurisée des variables d'environnement

## Pourquoi cette approche ?

❌ **Problème** : Mettre les clés API directement dans le code est **dangereux** :

- Risque de commit sur GitHub public
- Clés exposées à tous les développeurs
- Pas de séparation dev/prod

✅ **Solution** : Variables d'environnement avec fichier `.env`

## 📋 Configuration rapide

### 1. Créer le fichier `.env` à la racine

```bash
# .env (ignoré par git)
EXPO_PUBLIC_TICKETMASTER_API_KEY=votre_clé_ici
EXPO_PUBLIC_TICKETMASTER_BASE_URL=https://app.ticketmaster.com/discovery/v2
```

### 2. Redémarrer le serveur de développement

```bash
# Arrêter avec Ctrl+C puis relancer
npm start
```

## 🔍 Comment ça fonctionne

### Variables Expo

Expo utilise le préfixe `EXPO_PUBLIC_` pour les variables côté client :

```javascript
// ✅ Accessible côté client
EXPO_PUBLIC_TICKETMASTER_API_KEY = abc123;

// ❌ Non accessible côté client (serveur uniquement)
TICKETMASTER_API_KEY = abc123;
```

### Double fallback

Le code vérifie 2 sources :

```javascript
const API_KEY =
  process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY || // Méthode 1
  Constants.expoConfig?.extra?.TICKETMASTER_API_KEY; // Méthode 2 (fallback)
```

## 🛡️ Sécurité

### Fichier .env protégé

Le `.gitignore` contient :

```bash
.env
.env*.local
```

### Clé masquée dans les logs

```bash
✅ API Ticketmaster configurée: qokDfAhY...UumP
```

## 🐛 Débogage

Si vous voyez "Clé API manquante", vérifiez :

1. **Fichier .env créé** à la racine du projet
2. **Préfixe correct** : `EXPO_PUBLIC_`
3. **Serveur redémarré** après modification .env
4. **Logs de debug** dans la console Expo

## 🚀 Obtenir une clé API Ticketmaster

1. Allez sur https://developer.ticketmaster.com/
2. Créez un compte développeur (gratuit)
3. Générez une "Consumer Key"
4. Copiez-la dans votre `.env`

## 🏗️ Alternatives avancées

### Avec app.config.js (optionnel)

```javascript
// app.config.js
export default {
  expo: {
    // ... config normale
    extra: {
      TICKETMASTER_API_KEY: process.env.TICKETMASTER_API_KEY,
    },
  },
};
```

### Avec react-native-dotenv (autre option)

```bash
npm install react-native-dotenv
```

---

✅ **Résultat** : Clés API sécurisées, code propre, pas de risque de commit de secrets !
