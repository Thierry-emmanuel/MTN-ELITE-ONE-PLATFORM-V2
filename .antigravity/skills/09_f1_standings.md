# Skill: F1 Style Standings UI

## 1. Concept Visuel
Ce skill régit la génération visuelle du tableau des classements (`StandingsPage.tsx` ou `Standings.tsx`)[cite: 1]. L'interface doit s'inspirer des grilles de résultats de la Formule 1 : typographie ultra-marquée, asymétrie, et codification couleur par écurie (club)[cite: 1].

## 2. Directives de Code Frontend (Tailwind & React)
*   **Typographie Télémétrie :** Pour les positions (1, 2, 3) et les abréviations des clubs (ex: PWD, COT, CAN), utilise des classes italiques et lourdes : `font-black italic tracking-tighter uppercase`.
*   **Bordures d'Écuries :** Chaque ligne du tableau (`<tr>` ou div de ligne) doit comporter une bordure verticale gauche solide de 4px (`border-l-4`). La couleur de cette bordure doit correspondre dynamiquement à la couleur principale du club (ex: vert pour Cotonsport, rouge pour Canon Yaoundé)[cite: 1].
*   **Colonne Écart (GAP) :** Ajoute une colonne appelée "GAP" qui calcule mathématiquement et affiche l'écart de points avec le leader du championnat (ex: le leader affiche `-`, le 2ème affiche `+2 pts`, le 3ème `+5 pts`).
*   **Zonage du Championnat :**
    *   **Places Africaines (Top 2) :** Fond de ligne enrichi d'un dégradé émeraude subtil (`bg-gradient-to-r from-emerald-950/40 to-transparent`)[cite: 1].
    *   **Zone de Relégation (Bas de tableau) :** Fond de ligne avec une opacité rouge ou un indicateur de hachure discret pour symboliser le danger de la relégation[cite: 1].