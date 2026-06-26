# Skill: SofaScore Style Results & Live Engine

## 1. Concept Visuel
Ce skill applique l'ergonomie chirurgicale et ultra-dense de SofaScore pour l'affichage des matchs, des résultats et du calendrier (`Results.tsx`, `Fixtures.tsx`, `FixturesPage.tsx`)[cite: 1].

## 2. Directives d'Architecture & Layout
*   **Densité de Données Maximale :** Évite les grands espaces vides. Les cartes de match doivent être compactes, structurées sous forme de grille ou de cellules aux proportions fixes (`grid grid-cols-[1fr_auto_1fr]`).
*   **Cellule de Score Centrale :**
    *   Si le match est terminé ou en direct, le score est centré dans un bloc sombre et net (`bg-zinc-900 rounded px-3 py-1.5 font-mono font-bold text-amber-500`)[cite: 1].
    *   Si le match n'a pas commencé, affiche l'heure précise du coup d'envoi à la place du score, centrée de manière neutre.
*   **Télémesure en Direct (Live Status) :**
    *   Si le statut du match est `'LIVE'`, ajoute un point néon clignotant à côté de la minute de jeu (`animate-pulse text-emerald-500`)[cite: 1, 1].
    *   Génère une micro-grille d'événements immédiats sous la ligne du score : affiche des mini-icônes (ballon pour un but, rectangle jaune/rouge pour les cartons) avec la minute exacte, alignée à gauche pour l'équipe à domicile et à droite pour l'équipe à l'extérieur[cite: 1].