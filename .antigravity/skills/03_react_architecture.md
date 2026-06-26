# Skill: React 18 & Feature-Based Architecture

## 1. Structure du Projet (Feature-Based)
Tu dois organiser et générer le code selon l'architecture modulaire découpée par domaine métier définie dans le projet[cite: 1] :
src/
├── components/     # Atomes et Molécules UI globaux (Button, Badge, Skeleton)
├── features/       # Modules métiers autonomes (cohérents avec les modules M01-M12)
│   ├── fixtures/
│   ├── standings/
│   └── lions/
│       ├── components/  # Composants spécifiques à la feature
│       ├── hooks/       # Custom hooks dédiés (React Query)
│       └── services/    # Appels API Axios dédiés
├── pages/          # Pages de routage composées de features (React Router v6)
├── store/          # Global State Management (Zustand)
└── types/          # Interfaces TypeScript strictes unifiées
## 2. Règles de Code Strictes
*   **TypeScript Strict :** Interdiction totale d'utiliser le type `any`[cite: 1]. Toutes les interfaces de données (Club, Player, Match) doivent être exhaustivement typées[cite: 1].
*   **Data Fetching clean :** Aucun `useEffect` direct pour charger des données de l'API[cite: 1]. Utilise exclusivement les hooks de `TanStack Query` (`@tanstack/react-query`) pour encapsuler les états `isLoading`, `isError` et la mise en cache (`staleTime`)[cite: 1].
*   **Composants Fonctionnels & Immabilité :** Préfère les déclarations de fonctions explicites (`export function MatchCard()`) et assure-toi que les props sont typées avec des valeurs par défaut si nécessaire[cite: 1].

## 3. Optimisation des Performances Frontend
*   **Lazy Loading obligatoire :** Applique le fractionnement de code (`React.lazy()`) pour toutes les routes principales afin de maintenir le bundle initial sous les 500 KB[cite: 1].
*   **Évitement des Re-rendus :** Utilise `React.memo` sur les lignes de tableaux complexes (comme la `LeagueTable`) ou les cartes de scores temps réel subissant des mises à jour WebSocket[cite: 1, 1].