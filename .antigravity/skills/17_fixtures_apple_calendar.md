# Skill: Clean Fixtures Schedule (Apple Calendar Style)

## 1. L'Esthétique de la Clarté
Pour planifier le calendrier des matchs de la saison (`Fixtures.tsx`), nous rejetons le chaos visuel. Nous adoptons la pureté, le minimalisme et la gestion du temps au pixel près de l'application Apple Calendar.

## 2. Directives de Mise en Page (Layout & Interaction)
*   **La Timeline Verticale Transparente :** Le calendrier se lit de haut en bas. Les jours de la semaine forment une colonne collante à gauche (`sticky top-0`), tandis que les matchs de cette date s'alignent proprement à droite.
*   **La Ligne de Temps Présente :** Si des matchs ont lieu aujourd'hui, une ligne horizontale rouge ultra-fine (`border-t border-red-500`) traverse le layout à l'heure actuelle exacte pour ancrer l'utilisateur dans le présent.
*   **Icônes Lucide Clés :**
    *   `Calendar` pour le sélecteur de mois/journées.
    *   `Clock` pour les horaires de coup d'envoi.
    *   `Bell` pour l'action discrète permettant d'ajouter le match aux rappels de l'utilisateur.