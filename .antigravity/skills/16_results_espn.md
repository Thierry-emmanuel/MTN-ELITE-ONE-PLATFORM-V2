# Skill: Heavyweight Match Results (ESPN Style)

## 1. Philosophie : L'Information d'Abord
Inspiré par l'efficacité d'ESPN, ce style est conçu pour le traitement massif et rapide des scores sur la page des résultats globaux. C'est carré, direct, lisible sur un écran de téléphone en plein soleil à Yaoundé et ultra-fiable.

## 2. Architecture Visuelle
*   **La Ligne d'Information "Top News Overlay" :** Au-dessus des scores, affiche une ligne condensée des événements majeurs liés à la journée (ex: "Cotonsport prend la tête du championnat").
*   **Le Bloc Match ESPN :** Une grille rigide à 3 sections : Équipe Domicile (gauche), Score/Statut (centre), Équipe Extérieur (droite).
    *   *Règle du vainqueur :* L'équipe qui a perdu ou fait match nul voit son nom et son logo passer à une opacité réduite (`text-stone-500`), tandis que le vainqueur reste en blanc éclatant (`text-stone-50 font-bold`).
*   **Icônes Lucide Clés :**
    *   `Tv` ou `Play` pour les liens vers les résumés vidéos (Match Highlights).
    *   `FileText` pour le compte-rendu textuel rédigé par le CMS.