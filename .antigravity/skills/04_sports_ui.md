# Skill: Sports UI Principles & Data Visualization

## 1. Objectif
Ce skill guide la conception d'interfaces spécifiques aux applications de sport à forte densité de données[cite: 1]. L'affichage doit être instantanément compréhensible par un supporter, un journaliste ou un recruteur[cite: 1].

## 2. Modèles d'Affichage Métier

### Form Guide (État de forme des clubs)
*   Représentation par des badges circulaires colorés compacts[cite: 1].
*   **W** (Victoire) : `bg-emerald-600 text-white`[cite: 1].
*   **D** (Nul) : `bg-stone-400 text-white`[cite: 1].
*   **L** (Défaite) : `bg-red-600 text-white`[cite: 1].
*   L'alignement doit toujours présenter les 5 derniers matchs de gauche à droite (du plus ancien au plus récent) ou inversement selon la convention choisie, de manière consistante[cite: 1].

### Match Card & Calendrier (Fixtures/Results)
*   **Avant-match :** Mettre en avant le compte à rebours interactif (J / H / M / S)[cite: 1].
*   **Match en direct :** Badge clignotant "LIVE", affichage distinctif de la minute actuelle et du score rafraîchi par WebSocket[cite: 1, 1].
*   **Après-match :** Affichage immédiat des buteurs (minute, type de but : penalty ou CSC) et cartons sous les noms des équipes respectives[cite: 1].

### Data Visualization (Statistiques d'équipe et de joueurs)
*   Utilise exclusivement la bibliothèque `Recharts`[cite: 1].
*   Pour les comparaisons d'équipes (Possession, Tirs, Corners), utilise des barres horizontales dos à dos (H2H Bar Charts) plutôt que des graphiques en camembert[cite: 1].
*   Pour les profils de joueurs, utilise un graphique en radar (`RadarChart`) pour illustrer les attributs physiques, techniques et tactiques.