# Skill: Five Pathways History System

## 1. Concept Narratif
Ce skill applique la méthodologie narrative des "Five Pathways" (Cinq Axes) pour structurer l'évolution historique du football camerounais au sein du composant `HistoryPage.tsx` / `History.tsx`[cite: 1]. L'histoire n'est pas une simple liste, c'est un parcours découpé en 5 époques majeures[cite: 1].

## 2. Directives d'Architecture React
*   **Les 5 Piliers :** Divise la navigation principale de la page historique en exactement 5 blocs interactifs représentant les axes (ex: 1. Les Pionniers, 2. L'Âge d'Or, 3. Les Lions Globaux, etc.).
*   **Gestion de l'État Actif :** Utilise un état local (`const [activePathway, setActivePathway] = useState(1)`) pour piloter l'affichage. Le clic sur un axe doit déclencher une transition fluide du layout (utilisation de `framer-motion` pour animer l'ouverture du panneau narratif).
*   **Éléments Éditoriaux Obligatoires par Axe :** Chaque parcours activé doit générer automatiquement :
    1. Un titre d'époque marqué (ex: "1970 - 1982 : L'Éveil des Lions")
    2. Un grand bloc de texte éditorial pour le récit historique[cite: 1]
    3. Un carrousel horizontal minimaliste affichant des images d'archives (`assets/images/halloffame/`) ou des fiches de matchs historiques liés à cette ère spécifique[cite: 1].