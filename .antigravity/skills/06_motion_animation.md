# Skill: Motion & Animation (Framer Motion)

## 1. Principes d'Animation Éditioriale
L'identité visuelle de la plateforme exige des transitions fluides, inspirées des habillages télévisuels sportifs premium (Canal+, Sky Sports). Les animations doivent accompagner le storytelling sans ralentir la navigation ni surcharger l'interface.

## 2. Configuration des Variantes Fondamentales
Pour toute implémentation avec `framer-motion`, utilise exclusivement des transitions basées sur le modèle physique d'amorti (*spring*) plutôt que des durées fixes (*tweens* linéaire), sauf pour les fondus enchaînés.

### Variantes Imposées pour Claude Code :

```typescript
// À utiliser pour les listes de cartes (News, Matchs, Awards)
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

// À utiliser pour l'apparition des cartes individuelles
export const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

// Transition de page globale (Layout)
export const pageTransition = {
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -5 },
  transition: { duration: 0.2, ease: 'easeInOut' }
};