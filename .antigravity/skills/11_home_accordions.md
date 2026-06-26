# Skill: Premium Home Page Accordions

## 1. Concept Visuel
Ce skill encadre la conception des structures extensibles (accordéons) sur la page d'accueil (`Index.tsx`)[cite: 1]. L'objectif est de structurer les contenus denses (détails des règlements, sous-sections de journées, FAQ) sans encombrer visuellement l'espace public[cite: 1].

## 2. Règles d'Intégration
*   **Épuration Graphique :** Ne génère pas d'accordéons sous forme de boîtes grises ou de blocs fermés industriels. Utilise des lignes séparatrices minimalistes et fines (`border-b border-zinc-800`).
*   **Transitions d'États CSS :**
    *   Au survol ou à l'ouverture du déclencheur (`AccordionTrigger`), applique une transition de couleur fluide sur le texte, passant de `text-stone-400` à l'or national `text-amber-500`[cite: 1].
    *   L'icône chevron de droite doit pivoter à 180 degrés de manière fluide en utilisant les transitions natives de Tailwind (`transition-transform duration-300 ease-out rotate-180`).
*   **Contenus Imbriqués :** Le panneau de contenu de l'accordéon (`AccordionContent`) doit être conçu pour encapsuler et restituer proprement d'autres sous-composants (comme une liste de cartes de matchs au format SofaScore).