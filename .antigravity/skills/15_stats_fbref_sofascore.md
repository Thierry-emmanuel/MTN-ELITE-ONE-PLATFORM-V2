# Skill: Deep Football Analytics (FBref x SofaScore Model)

## 1. L'Intention Humaine derrière la Donnée
Les chiffres dans le football ne valent rien s'ils ne racontent pas une histoire tactique. Ce skill combine la clarté visuelle des graphiques de SofaScore avec la densité de tableaux analytiques bruts de FBref pour concevoir les modules `PlayerStats.tsx` et `TeamAnalytics.tsx`.

## 2. Directives de Design et Composants UI
*   **Les Tableaux Percentiles (Style FBref) :** Pour comparer les profils des joueurs (ex: Passes progressives, tacles réussis), utilise une disposition en barres horizontales empilées de type "Percentile Bar".
    *   *Code-guide :* Une valeur de 95% doit afficher une jauge verte intense (`bg-emerald-600`), tandis qu'un percentile faible descend vers un gris neutre ou un rouge terreux.
*   **La Carte Thermique / Attaque (Style SofaScore) :** Pour les résumés graphiques, créez des conteneurs fixes représentant le terrain avec un calque SVG ou des div opaques positionnés de manière absolue pour simuler l'élan d'attaque (Attack Momentum).
*   **Icônes Lucide Clés :**
    *   `BarChart3` pour les index généraux.
    *   `TrendingUp` / `TrendingDown` pour l'évolution des performances au fil des matchs.
    *   `Target` pour la précision des tirs et des passes.

## 3. Implémentation TypeScript Imposée
```tsx
// Structure de donnée type suggérée par l'assistant pour le rendu de performance
interface PlayerAnalyticalProfile {
  playerId: string;
  percentiles: {
    statName: string; // ex: "Progressive Carries"
    value: number;    // 0 à 100
    per90: number;    // Valeur normalisée par 90 minutes
  }[];
}