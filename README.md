# LocalEvents - Application React Native

> Application mobile pour découvrir et sauvegarder les événements locaux, disponible hors-ligne

## Aperçu

LocalEvents est une application React Native TypeScript qui permet aux utilisateurs de découvrir des événements dans leur ville via l'API Ticketmaster, de les filtrer selon leurs préférences et de les sauvegarder pour consultation hors-ligne.

### Fonctionnalités principales

- ** Découverte d'événements** : Récupération via l'API Ticketmaster Discovery
- ** Recherche avancée** : Filtrage par ville, mots-clés et intervalles de dates
- ** Favoris persistants** : Sauvegarde locale avec AsyncStorage
- ** Mode hors-ligne** : Consultation des événements sans connexion
- ** Module caméra** : Capture de photos avec gestion des permissions
- ** UI moderne** : Interface fluide avec skeleton loaders et pull-to-refresh

## Installation et lancement

### Prérequis

- Node.js ≥ 18
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Clé API Ticketmaster (gratuite sur [developer.ticketmaster.com](https://developer.ticketmaster.com))

### Configuration

1. **Cloner le dépôt**

```bash
git clone <https://github.com/YooCodeur/LocalEvents.git>
cd LocalEvents
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configuration de l'API**
   Créer un fichier `.env` à la racine :

```env
EXPO_PUBLIC_TICKETMASTER_API_KEY=votre_cle_api_ici
EXPO_PUBLIC_TICKETMASTER_BASE_URL=https://app.ticketmaster.com/discovery/v2
```

4. **Lancer l'application**

```bash
# Démarrer le serveur de développement
npm start

# Ou directement sur un émulateur/appareil
npm run ios     # iOS
npm run android # Android
```

### Scripts disponibles

```bash
npm test        # Tests basiques + vérification TypeScript
npm run lint    # Analyse statique du code
npm run lint:fix # Correction automatique du formatage
npm run type-check # Vérification TypeScript
```

## Choix architecturaux et compromis

### Stack technique

| Domaine         | Technologie                      | Justification                                            |
| --------------- | -------------------------------- | -------------------------------------------------------- |
| **Framework**   | React Native 0.79 + Expo 53      | Développement cross-platform rapide, écosystème riche    |
| **Langage**     | TypeScript                       | Typage strict, meilleure DX, moins d'erreurs runtime     |
| **Navigation**  | React Navigation v7              | Navigation typée, stack + tabs, animations fluides       |
| **État global** | Redux Toolkit                    | Gestion d'état prévisible, DevTools, RTK simplifie Redux |
| **API**         | Axios                            | Gestion d'erreurs, retry automatique, intercepteurs      |
| **Stockage**    | AsyncStorage                     | Persistance simple, compatible iOS/Android               |
| **UI**          | React Native + Expo Vector Icons | Components natifs, icônes cohérentes                     |

### Choix d'architecture

#### **Architecture modulaire avec séparation des responsabilités**

```
src/
├── components/     # Composants réutilisables
├── screens/        # Écrans de l'application
├── services/       # API et logique métier
├── store/          # Gestion d'état Redux
├── hooks/          # Hooks personnalisés
├── types/          # Types TypeScript
├── utils/          # Fonctions utilitaires
└── constants/      # Constantes et configuration
```

**Avantages :**

- Code maintenable et testable
- Réutilisabilité des composants
- Séparation claire des préoccupations

**Compromis :**

- Structure plus complexe pour une petite app
- Courbe d'apprentissage pour les nouveaux développeurs

#### **Redux Toolkit pour l'état global**

**Pourquoi Redux :**

- État partagé entre écrans (événements, favoris)
- Actions asynchrones (API, cache)
- DevTools pour le debugging
- Persistance cohérente

**Alternative considérée :** Context API + useReducer

- Plus simple mais moins évolutif
- Pas de DevTools natifs
- Performance moindre pour état complexe

#### **Système de cache intelligent**

**Implémentation :**

- Cache automatique avec TTL configurable
- Stratégie cache-first pour performance
- Nettoyage périodique des données expirées
- Cache d'images séparé pour optimiser l'espace

**Compromis :**

- Complexité ajoutée vs stockage simple
- Gestion de la cohérence cache/API
- Espace de stockage limité sur mobile

#### **Gestion d'erreurs et retry**

**Stratégie :**

- Retry automatique (3 tentatives) avec backoff exponentiel
- Fallback vers le cache en cas d'échec réseau
- Messages d'erreur contextuels pour l'utilisateur
- Logs détaillés pour le debugging

#### **Hooks personnalisés pour la logique métier**

Exemples : `useEvents`, `useFavorites`, `useNetworkStatus`

**Avantages :**

- Logique réutilisable entre composants
- Tests unitaires plus faciles
- Séparation UI/logique métier

### Choix techniques spécifiques

#### **Interface utilisateur**

- **Skeleton loaders** au lieu de spinners : UX plus fluide
- **Pull-to-refresh** natif : Interaction familière
- **LinearGradient** pour les sections hero : Aspect moderne
- **Composants modulaires** : `CachedImage`, `EventCard`, etc.

#### **Module caméra**

- **expo-camera** : API simple, permissions automatiques
- **Stockage local** des photos : Pas de cloud pour cette démo
- **Interface native** : Contrôles familiers iOS/Android

#### **Optimisations**

- **Lazy loading** des images avec cache
- **Memoization** avec `useCallback`/`useMemo`
- **Pagination** pour les grandes listes
- **Debouncing** pour la recherche (TODO)

## Idées d'améliorations si plus de temps

### Fonctionnalités core

#### **1. Géolocalisation intelligente**

```typescript
// Détection automatique de la ville
const useGeolocation = () => {
  // Géolocation + reverse geocoding
  // Suggestions basées sur la position
  // Fallback sur IP geolocation
};
```

**Impact :** UX améliorée, suggestions pertinentes

#### **2. Notifications push**

```typescript
// Rappels d'événements favoris
// Nouveaux événements dans la ville
// Alertes de prix ou disponibilité
```

**Stack :** Expo Notifications + service worker

#### **3. Partage social**

```typescript
// Partage d'événements via liens
// Intégration réseaux sociaux
// Invitations d'amis
```

#### **4. Mode sombre / Thèmes**

```typescript
// Context API pour les thèmes
// Persistance des préférences
// Adaptation automatique système
```

### 🔧 Optimisations techniques

#### **1. Performance**

**Bundle splitting :**

```typescript
// Lazy loading des écrans
const EventsScreen = lazy(() => import("./screens/EventsScreen"));

// Code splitting par fonctionnalité
const CameraModule = lazy(() => import("./modules/Camera"));
```

**Memoization avancée :**

```typescript
// React.memo avec comparaison custom
// useMemo pour calculs coûteux
// Virtualisation pour grandes listes
```

**Images optimisées :**

```typescript
// Formats WebP/AVIF
// Redimensionnement automatique
// Progressive loading
```

#### **2. Cache avancé**

**Cache stratifié :**

```typescript
interface CacheStrategy {
  L1: "memory"; // Cache mémoire (session)
  L2: "storage"; // AsyncStorage (persistant)
  L3: "network"; // API avec retry
}
```

**Invalidation intelligente :**

```typescript
// Cache tags pour invalidation granulaire
// Background sync quand réseau revient
// Conflict resolution pour données modifiées
```

#### **3. État offline robuste**

**Queue d'actions :**

```typescript
// Actions mises en queue hors-ligne
// Sync automatique au retour réseau
// Résolution de conflits
```

**PWA capabilities :**

```typescript
// Service worker pour web
// App shell caching
// Background sync
```

### Qualité et tests

#### **1. Tests complets**

```typescript
// Tests unitaires (Jest + Testing Library)
// Tests d'intégration (API + Redux)
// Tests E2E (Detox)
// Tests visuels (Storybook)
```

#### **2. Monitoring**

```typescript
// Analytics d'usage (Expo Analytics)
// Crash reporting (Sentry)
// Performance monitoring (Flipper)
```

#### **3. CI/CD avancé**

```yaml
# GitHub Actions amélioré :
# - Tests automatiques
# - Build iOS/Android
# - Distribution TestFlight/Play Console
# - Review apps automatiques
```

### UX/UI avancées

#### **1. Animations fluides**

```typescript
// React Native Reanimated v3
// Transitions partagées entre écrans
// Micro-interactions (like, swipe)
// Physics-based animations
```

#### **2. Accessibilité**

```typescript
// Support complet screen readers
// Navigation clavier
// Contrastes WCAG
// Tests accessibilité automatisés
```

#### **3. Personnalisation**

```typescript
// Widgets configurables
// Filtres sauvegardés
// Préférences utilisateur avancées
// Suggestions basées sur l'historique
```

### Sécurité et conformité

#### **1. Sécurité renforcée**

```typescript
// Chiffrement des données sensibles
// Certificate pinning pour l'API
// Biométrie pour l'accès
// Audit de sécurité automatisé
```

#### **2. RGPD/Privacy**

```typescript
// Gestion des consentements
// Droit à l'oubli
// Export des données utilisateur
// Anonymisation des analytics
```

### Évolutivité

#### **1. Micro-frontends**

```typescript
// Modules indépendants
// Déploiement séparé par fonctionnalité
// Teams autonomes
```

#### **2. Architecture backend**

```typescript
// API GraphQL pour optimiser les requêtes
// WebSockets pour real-time
// CDN pour les images
// Microservices pour scalabilité
```

## Contraintes respectées

✅ **React Native ≥ 0.74** : Version 0.79 utilisée  
✅ **TypeScript** : Typage strict partout  
✅ **React Navigation v7** : Navigation typée  
✅ **Redux Toolkit** : Gestion d'état moderne  
✅ **Axios** : Avec retry et gestion d'erreurs  
✅ **AsyncStorage** : Pour favoris + cache optionnel  
✅ **GitHub Actions** : CI avec tests et lint  
✅ **Module caméra** : expo-camera avec permissions  
✅ **Pull-to-refresh** : Implémenté sur tous les écrans  
✅ **Skeleton loaders** : UX fluide pendant chargement
