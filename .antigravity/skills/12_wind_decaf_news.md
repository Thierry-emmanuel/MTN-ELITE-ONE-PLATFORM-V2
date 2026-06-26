# Skill: Wind Decaf Style Minimalist Editorial News

## 1. Concept Visuel
Inspiré par le design brutaliste, pur et hautement typographique du studio Wind Decaf. Ce skill élimine tous les composants de cartes d'actualités génériques (dashboards) au profit d'une mise en page de type magazine ou journal de collection numérique[cite: 1].

## 2. Directives de Design & Typographie
*   **Priorité à l'Espace Brut :** Supprime les ombres portées, les dégradés décoratifs inutiles et les bordures épaisses. Utilise de grands espaces vides pour faire respirer le texte[cite: 1].
*   **Hiérarchie Typographique Asymétrique :** Les titres des grands articles (`FeaturedArticle.tsx`, `ArticlePage.tsx`) doivent être massifs (`text-4xl lg:text-6xl font-black font-sans tracking-tighter leading-none`)[cite: 1].
*   **Layout de Liste Épuré :**
    *   Les listes d'articles doivent ressembler à un index d'archives. Chaque ligne est séparée par une bordure ultra-fine (`border-zinc-800` sur fond sombre ou `border-stone-200` sur fond clair)[cite: 1].
    *   Le badge de catégorie ou le timestamp de publication doit être formaté dans un micro-bloc de texte en police monospace, placé systématiquement au-dessus du titre de l'actualité.
    *   **Effet d'Image Suspendu :** Les images d'illustration dans les listes doivent être contenues dans des cadres stricts (`overflow-hidden`) et réagir au survol avec un zoom progressif et lent (`group-hover:scale-105 transition-transform duration-500`).