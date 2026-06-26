# Skill: 207 Ouest Style Hall of Fame Layout

## 1. Concept Visuel
Inspiré par le style graphique du studio "207 Ouest" (style affiches rétro, textures de magazines de sport vintage, grilles artistiques cassées et contrastes violents). Ce skill est dédié à la mise en valeur des légendes du football camerounais dans le composant `HallOfFame.tsx`[cite: 1].

## 2. Règles de Structure Visuelle
*   **Traitement de l'Image (Duotone/Grayscale) :** Force les portraits des légendes à s'afficher par défaut avec un filtre noir et blanc très contrasté (`grayscale contrast-125 hover:grayscale-0 transition-all duration-700`) pour donner un effet intemporel et collector.
*   **Grille Asymétrique :** Interdiction d'utiliser une grille régulière (`grid-cols-3` uniforme). Alterne la structure des lignes (ex: Ligne 1: Grande photo à gauche, texte à droite. Ligne 2: Texte à gauche, deux photos moyennes empilées à droite).
*   **Superposition Typographique :** Le nom de la légende doit chevaucher ou dépasser du conteneur de son portrait en utilisant un positionnement absolu (`absolute -bottom-6 left-4 text-5xl font-black text-transparent stroke-stone-50`) pour émuler la couverture d'un magazine imprimé de collection.