/**
 * Static presentation metadata for each award category, mirroring
 * `frontend/src/types/awards.types.ts` (AWARD_META). Kept on the backend so
 * the public Award DTO can ship a ready-to-render title/subtitle/type
 * without the frontend having to guess from a raw `category` string.
 */
export type NomineeKind = 'PLAYER' | 'TEAM' | 'COACH';

export interface AwardCategoryMeta {
  label: string;
  subtitle: string;
  description: string;
  type: NomineeKind;
  trophyColor: 'GOLD' | 'SILVER' | 'BRONZE' | 'PLATINUM';
  fanVoteWeight: number;
  juryVoteWeight: number;
}

export const AWARD_CATEGORY_META: Record<string, AwardCategoryMeta> = {
  PLAYER_OF_MATCH: { label: 'Homme du Match', subtitle: 'Meilleure performance individuelle du match', description: "Décerné au joueur qui a le plus marqué la rencontre par sa performance.", type: 'PLAYER', trophyColor: 'SILVER', fanVoteWeight: 100, juryVoteWeight: 0 },
  PLAYER_OF_WEEK: { label: 'Joueur de la Semaine', subtitle: "Le meilleur joueur de la journée écoulée", description: "Récompense la performance la plus marquante de la semaine en MTN Elite One.", type: 'PLAYER', trophyColor: 'SILVER', fanVoteWeight: 70, juryVoteWeight: 30 },
  PLAYER_OF_MONTH: { label: 'Joueur du Mois', subtitle: 'La régularité récompensée sur un mois', description: "Le joueur le plus constant et le plus décisif du mois.", type: 'PLAYER', trophyColor: 'GOLD', fanVoteWeight: 60, juryVoteWeight: 40 },
  PLAYER_OF_SEASON: { label: 'Joueur de la Saison', subtitle: "L'excellence sur toute une saison", description: "Le joueur ayant marqué la saison de son empreinte.", type: 'PLAYER', trophyColor: 'GOLD', fanVoteWeight: 50, juryVoteWeight: 50 },
  BEST_YOUNG_PLAYER: { label: 'Meilleur Jeune', subtitle: 'La révélation de la saison', description: "Le talent U21 qui a le plus progressé.", type: 'PLAYER', trophyColor: 'PLATINUM', fanVoteWeight: 60, juryVoteWeight: 40 },
  TOP_SCORER: { label: 'Meilleur Buteur', subtitle: 'Le canonnier du championnat', description: "Classement des buteurs de la saison.", type: 'PLAYER', trophyColor: 'GOLD', fanVoteWeight: 0, juryVoteWeight: 0 },
  TOP_ASSIST: { label: 'Meilleur Passeur', subtitle: 'Le meneur de jeu de la saison', description: "Classement des passeurs décisifs de la saison.", type: 'PLAYER', trophyColor: 'GOLD', fanVoteWeight: 0, juryVoteWeight: 0 },
  BEST_GOALKEEPER: { label: 'Meilleur Gardien', subtitle: 'Le dernier rempart de la saison', description: "Le gardien le plus décisif de la saison.", type: 'PLAYER', trophyColor: 'GOLD', fanVoteWeight: 40, juryVoteWeight: 60 },
  BALLON_DOR: { label: "Ballon d'Or Cameroun", subtitle: 'La récompense suprême de la saison', description: "Le trophée individuel le plus prestigieux du championnat.", type: 'PLAYER', trophyColor: 'GOLD', fanVoteWeight: 30, juryVoteWeight: 70 },
  TEAM_OF_WEEK: { label: 'Équipe de la Semaine', subtitle: 'Le onze type de la journée', description: "L'équipe la plus en forme de la semaine.", type: 'TEAM', trophyColor: 'SILVER', fanVoteWeight: 80, juryVoteWeight: 20 },
  TEAM_OF_MONTH: { label: 'Équipe du Mois', subtitle: 'Le collectif le plus solide du mois', description: "L'équipe la plus performante du mois.", type: 'TEAM', trophyColor: 'GOLD', fanVoteWeight: 50, juryVoteWeight: 50 },
  TEAM_OF_SEASON: { label: 'Équipe de la Saison', subtitle: "L'équipe référence de l'année", description: "L'équipe la plus performante de la saison.", type: 'TEAM', trophyColor: 'GOLD', fanVoteWeight: 40, juryVoteWeight: 60 },
  GOAL_OF_WEEK: { label: 'But de la Semaine', subtitle: 'Le plus beau geste technique de la journée', description: "Le but le plus spectaculaire de la semaine.", type: 'PLAYER', trophyColor: 'SILVER', fanVoteWeight: 100, juryVoteWeight: 0 },
  GOAL_OF_MONTH: { label: 'But du Mois', subtitle: 'Le plus beau but du mois', description: "Le but le plus spectaculaire du mois.", type: 'PLAYER', trophyColor: 'GOLD', fanVoteWeight: 100, juryVoteWeight: 0 },
  GOAL_OF_SEASON: { label: 'But de la Saison', subtitle: "Le geste technique de l'année", description: "Le but le plus spectaculaire de la saison.", type: 'PLAYER', trophyColor: 'GOLD', fanVoteWeight: 80, juryVoteWeight: 20 },
  COACH_OF_MONTH: { label: 'Coach du Mois', subtitle: 'Le stratège du mois', description: "L'entraîneur le plus performant du mois.", type: 'COACH', trophyColor: 'SILVER', fanVoteWeight: 40, juryVoteWeight: 60 },
  COACH_OF_SEASON: { label: 'Coach de la Saison', subtitle: "L'architecte de la saison", description: "L'entraîneur ayant le plus marqué la saison.", type: 'COACH', trophyColor: 'GOLD', fanVoteWeight: 30, juryVoteWeight: 70 },
};

export function metaFor(category: string): AwardCategoryMeta {
  return (
    AWARD_CATEGORY_META[category] ?? {
      label: category,
      subtitle: '',
      description: '',
      type: 'PLAYER',
      trophyColor: 'SILVER',
      fanVoteWeight: 100,
      juryVoteWeight: 0,
    }
  );
}
