# Skill: Accessibility & Inclusivity (WCAG 2.1 AA)

## 1. Alignement et Objectif
La plateforme s'adresse à tous les fans de football au Cameroun et à l'international, indépendamment de leurs capacités visuelles ou motrices. Tu dois veiller à ce que l'application atteigne un niveau de conformité **WCAG 2.1 AA**.

## 2. Directives Strictes de Génération de Composants UI

### Structure Sémantique & Navigation Clavier
*   Chaque page doit comporter un conteneur principal `<main id="main-content">` et des repères structurels explicites (`<header>`, `<nav>`, `<footer>`).
*   **Skip Links :** Ajoute un lien d'évitement invisible au focus au tout début du composant `Navbar.tsx` pointant vers `#main-content`.
*   Tous les éléments interactifs (boutons, liens, onglets) doivent être entièrement navigables via la touche `Tab` et activables avec `Enter` / `Space`. Les états `:focus-visible` ne doivent jamais être masqués (`outline-none`) sans une alternative visuelle forte (ex: `focus-visible:ring-2 focus-visible:ring-amber-500`).

### Attributs Aria & Rôles Métiers
*   **Badges de Score En Direct (Live) :** Utilise `aria-live="polite"` sur les zones de scores mis à jour par WebSocket pour annoncer instantanément les buts aux lecteurs d'écran sans interrompre l'utilisateur[cite: 1, 1].
*   **Images et Logos des Clubs :** Les balises `<img>` des logos de clubs ou de joueurs doivent impérativement posséder un attribut `alt` explicite (ex: `alt="Logo de Canon de Yaoundé"` et non `alt="logo"` ou `alt=""`)[cite: 1].
*   **Boutons Icônes :** Si un bouton contient uniquement une icône Lucide (ex: fermeture d'une modale, vote), ajoute explicitement un attribut `aria-label="Fermer la fenêtre"` ou `aria-label="Voter pour ce joueur"`[cite: 1].

### Contrastes et Adaptabilité
*   Vérifie que les combinaisons de couleurs respectent un rapport de contraste minimal de **4.5:1** pour le texte normal et **3:1** pour les grands titres. 
*   Attention particulière sur l'utilisation du Jaune/Or (`text-amber-500`) : ne l'affiche jamais directement sur un fond blanc (`bg-stone-50`). Associe-le uniquement à un fond sombre (`bg-emerald-950` ou `bg-zinc-950`)[cite: 1].
