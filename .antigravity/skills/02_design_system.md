# Skill: Design System & Tailwind Configuration

## 1. Principes Fondamentaux
Ce skill encadre l'application des styles CSS via Tailwind CSS pour garantir une cohérence visuelle absolue sur l'ensemble de la plateforme[cite: 1]. L'identité visuelle repose sur des jetons de conception (Design Tokens) stricts[cite: 1].

## 2. Configuration et Classes Utilitaires Imposées
Lors de la création de composants React, applique rigoureusement la palette et les règles structurelles suivantes :

### Palette de Couleurs Émanant du Cahier des Charges
*   **Primary (Vert Lion) :** `bg-emerald-950` (fonds sombres premium), `text-emerald-500` (accents), `border-emerald-800`[cite: 1].
*   **Secondary (Or Cameroun) :** `text-amber-500` ou `bg-amber-500` (trophées, sélections, faits marquants)[cite: 1].
*   **Accent (Rouge Intensité) :** `bg-red-600`, `text-red-500` (alertes, relégation, cartons)[cite: 1].
*   **Neutres Éditioriaux :** Fonds clairs en `bg-stone-50` avec texte en `text-stone-900` pour un effet papier/magazine haut de gamme[cite: 1]. Fonds sombres en `bg-zinc-950`.

### Typographie et Layout
*   **Titres Éditioriaux :** Utilise la police `font-sans` (Poppins) avec des graisses marquées (`font-bold`, `font-black`) et un tracking serré (`tracking-tight`)[cite: 1].
*   **Bords et Arrondis :** Évite le `rounded-md` industriel sur les cartes premium. Utilise soit des angles vifs (`rounded-none`) pour un effet éditorial strict, soit des arrondis généreux contrôlés (`rounded-2xl`) pour les boutons interactifs tactiles[cite: 1].
*   **Bordures subtiles :** Privilégie des bordures ultra-fines `border-stone-200` sur fond clair ou `border-zinc-800` sur fond sombre. Évite les ombres portées lourdes.

## 3. Contraintes de Génération
Refuse l'utilisation de styles inline ou de classes magiques hors configuration standard. Chaque composant doit être nativement responsive en utilisant les préfixes `sm:`, `md:`, `lg:` pour couvrir les formats du cahier des charges (de 320px à 1920px)[cite: 1].