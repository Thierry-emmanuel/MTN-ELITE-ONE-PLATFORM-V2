import type { Award, BallonDorEdition, TeamOfWeek, HistoricalWinner } from '../types/awards.types';

// Image paths (Vite resolves these at build time via @/ alias)
const IMG = {
  davidNgondo:    new URL('../assets/images/players/DavidNgondo.png',    import.meta.url).href,
  edouardSombang: new URL('../assets/images/players/EdouardSombang.png', import.meta.url).href,
  richardNjoh:    new URL('../assets/images/players/RichardNjoh.png',    import.meta.url).href,
  rostandardMbai: new URL('../assets/images/players/RostandMbai.png',   import.meta.url).href,
  sergeDaura2:    new URL('../assets/images/players/Sergedaura2.png',    import.meta.url).href,
  nathanDouala:   new URL('../assets/images/youngtalents/NathanDouala.png',  import.meta.url).href,
  sergeDaura:     new URL('../assets/images/youngtalents/SergeDaura.png',    import.meta.url).href,
  jeanManga:      new URL('../assets/images/halloffame/JeanMangaOnguene.png',import.meta.url).href,
  mohammedI:      new URL('../assets/images/halloffame/MohammedIdrissou.png',import.meta.url).href,
  theophile:      new URL('../assets/images/halloffame/TheophileAbega.png',  import.meta.url).href,
  thomasNkono:    new URL('../assets/images/halloffame/Thomas_Nkono.png',    import.meta.url).href,
};

// ─── Players ──────────────────────────────────────────────────────────────────
const BASSOGOG = {
  id: 'p1', type: 'PLAYER' as const,
  name: 'Christian Bassogog', position: 'FWD', nationality: 'CMR', age: 29,
  photoUrl: IMG.rostandardMbai,
  description: 'Ailier explosif et meilleur buteur du championnat. Sa vitesse et son efficacité devant le but font de lui le joueur le plus redouté de la Elite One. 14 buts en 16 matchs cette saison, avec une moyenne de 8.4 sur Sofascore.',
  clubId: 'cnk', clubName: 'Canon Yaoundé', clubShort: 'CNK',
  stats: { goals: 14, assists: 5, appearances: 16, minutesPlayed: 1380, rating: 8.4 },
  highlightStat: { label: 'Buts', value: 14 }, form: ['W','W','D','W','L'],
};
const MAROU = {
  id: 'p2', type: 'PLAYER' as const,
  name: 'Ibrahim Marou', position: 'FWD', nationality: 'CMR', age: 24,
  photoUrl: IMG.davidNgondo,
  description: 'Avant-centre technique et puissant de Coton Sport. 12 buts en 18 matchs, moteur offensif d\'une équipe qui domine le championnat. Sa capacité à jouer dos au but et à éliminer les défenseurs fait de lui une terreur en Elite One.',
  clubId: 'cot', clubName: 'Coton Sport', clubShort: 'COT',
  stats: { goals: 12, assists: 4, appearances: 18, minutesPlayed: 1530, rating: 8.1 },
  highlightStat: { label: 'Buts', value: 12 }, form: ['W','W','W','D','W'],
};
const ETAME = {
  id: 'p3', type: 'PLAYER' as const,
  name: 'Roger Etame', position: 'MID', nationality: 'CMR', age: 27,
  photoUrl: IMG.sergeDaura2,
  description: 'Milieu de terrain créateur et polyvalent. Meilleur passeur du championnat avec 11 passes décisives, il dicte le jeu de l\'Union Douala. Sa vision du jeu et sa précision dans les transmissions en font un titulaire incontestable.',
  clubId: 'uds', clubName: 'Union Douala', clubShort: 'UDS',
  stats: { goals: 8, assists: 11, appearances: 17, minutesPlayed: 1490, rating: 8.2, keyPasses: 57 },
  highlightStat: { label: 'Passes D.', value: 11 }, form: ['L','W','W','D','W'],
};

const NJOH = {
  id: 'p5', type: 'PLAYER' as const,
  name: 'Richard Njoh', position: 'GK', nationality: 'CMR', age: 26,
  photoUrl: IMG.richardNjoh,
  description: 'Gardien de but numéro 1 de Coton Sport. 8 clean sheets en 18 matchs et une présence décisive sur sa ligne. Son leadership et sa communication avec sa défense contribuent directement au titre en cours de Coton Sport.',
  clubId: 'cot', clubName: 'Coton Sport', clubShort: 'COT',
  stats: { appearances: 18, minutesPlayed: 1620, cleanSheets: 8, saves: 52, rating: 8.0 },
  highlightStat: { label: 'Clean sheets', value: 8 }, form: ['W','W','W','D','W'],
};
const DAURA = {
  id: 'p6', type: 'PLAYER' as const,
  name: 'Serge Daura', position: 'MID', nationality: 'CMR', age: 20,
  photoUrl: IMG.sergeDaura,
  description: 'Milieu offensif prodige d\'APEJES Mfou. À seulement 20 ans, ses combinaisons et sa vision du jeu impressionnent les observateurs. Capable de jouer en 8 ou en 10, il est la prochaine star du football camerounais.',
  clubId: 'apb', clubName: 'APEJES Mfou', clubShort: 'APB',
  stats: { goals: 3, assists: 6, appearances: 14, minutesPlayed: 1080, rating: 7.7 },
  highlightStat: { label: 'Buts+PD', value: 9 }, form: ['W','L','W','D','W'],
};
const NGONDO = {
  id: 'p7', type: 'PLAYER' as const,
  name: 'David Ngondo', position: 'FWD', nationality: 'CMR', age: 21,
  photoUrl: IMG.davidNgondo,
  description: 'Attaquant rapide et technique de Victoria United. 10 buts à seulement 21 ans, il s\'impose comme l\'un des meilleurs jeunes talents du pays. Sa vitesse sur les flancs et son sens du but font de lui une menace constante.',
  clubId: 'vict', clubName: 'Victoria United', clubShort: 'VIC',
  stats: { goals: 10, assists: 3, appearances: 17, minutesPlayed: 1410, rating: 7.8 },
  highlightStat: { label: 'Buts', value: 10 }, form: ['W','D','D','L','W'],
};
const NATHAND = {
  id: 'p11', type: 'PLAYER' as const,
  name: 'Nathan Douala', position: 'FWD', nationality: 'CMR', age: 19,
  photoUrl: IMG.nathanDouala,
  description: 'Attaquant prodige de l\'Union Douala. À 19 ans, il est l\'un des jeunes les plus prometteurs du football camerounais avec une impressionnante aisance technique et une maturité rare pour son âge.',
  clubId: 'uds', clubName: 'Union Douala', clubShort: 'UDS',
  stats: { goals: 5, assists: 2, appearances: 12, minutesPlayed: 820, rating: 7.5 },
  highlightStat: { label: 'Buts', value: 5 }, form: ['W','D','L','W','W'],
};

// Additional players for fuller coverage
const SOMBANG = {
  id: 'p8', type: 'PLAYER' as const,
  name: 'Édouard Sombang', position: 'MID', nationality: 'CMR', age: 25,
  photoUrl: IMG.edouardSombang,
  description: 'Milieu défensif solide de Fovu Baham. Ses interceptions et sa capacité à lire le jeu en font le métronome défensif de son équipe. Leader silencieux, il fait le sale boulot sans lequel aucune victoire n\'est possible.',
  clubId: 'fov', clubName: 'Fovu Baham', clubShort: 'FOV',
  stats: { goals: 2, assists: 4, appearances: 16, minutesPlayed: 1380, rating: 7.6, keyPasses: 28 },
  highlightStat: { label: 'Matchs', value: 16 }, form: ['D','W','W','L','D'],
};
export const MBAI = {
  id: 'p9', type: 'PLAYER' as const,
  name: 'Rostand Mbaï', position: 'DEF', nationality: 'CMR', age: 28,
  photoUrl: IMG.rostandardMbai,
  description: 'Défenseur central expérimenté de PWD Bamenda. Sa solidité aérienne et son autorité dans les duels en font l\'un des meilleurs défenseurs centraux du championnat. Capitaine emblématique de son équipe.',
  clubId: 'pwd', clubName: 'PWD Bamenda', clubShort: 'PWD',
  stats: { goals: 1, assists: 1, appearances: 17, minutesPlayed: 1530, rating: 7.4 },
  highlightStat: { label: 'Duels gagnés', value: '74%' }, form: ['L','D','W','W','D'],
};

// ─── Teams ────────────────────────────────────────────────────────────────────
const COTON = { id: 'cot', type: 'TEAM' as const, name: 'Coton Sport', city: 'Garoua', coach: 'Oumarou Halidou', description: 'Le leader incontesté du championnat. 12 victoires en 18 matchs, le meilleur bilan offensif et défensif de la saison. Leur 4-3-3 offensif et leur pressing haut ont écrasé toute concurrence.', stats: { wins: 12, draws: 2, losses: 4, goalsFor: 38, goalsAgainst: 16, points: 38 }, form: ['W','W','D','W','W'], highlightStat: { label: 'Points', value: 38 } };
const CANON  = { id: 'cnk', type: 'TEAM' as const, name: 'Canon Yaoundé', city: 'Yaoundé', coach: 'Pascal Nguiamba', description: 'Le club historique de Yaoundé, dauphin du championnat. Porté par Bassogog, Canon offre un football offensif et spectaculaire. 8 victoires consécutives à domicile.', stats: { wins: 10, draws: 4, losses: 4, goalsFor: 30, goalsAgainst: 16, points: 34 }, form: ['W','D','W','W','L'], highlightStat: { label: 'Points', value: 34 } };
const UNION  = { id: 'uds', type: 'TEAM' as const, name: 'Union Douala',  city: 'Douala',  coach: 'Cyrille Ndanga',  description: 'Le club de la capitale économique, troisième au classement. Avec Etame et Ndoumbe, l\'Union Douala propose un beau jeu collectif et une efficacité remarquable en déplacement.', stats: { wins: 9, draws: 4, losses: 5, goalsFor: 27, goalsAgainst: 16, points: 31 }, form: ['L','W','W','D','W'], highlightStat: { label: 'Points', value: 31 } };
const FOVU   = { id: 'fov', type: 'TEAM' as const, name: 'Fovu Baham', city: 'Baham', coach: 'Martin Ekeke', description: 'La surprise de la saison. Fovu Baham s\'est hissé dans le top 5 grâce à une organisation défensive exemplaire et une efficacité redoutable sur les phases arrêtées.', stats: { wins: 8, draws: 5, losses: 5, goalsFor: 24, goalsAgainst: 19, points: 29 }, form: ['W','D','D','W','L'], highlightStat: { label: 'Points', value: 29 } };

// ─── Coaches ──────────────────────────────────────────────────────────────────
const HALIDOU  = { id: 'c1', type: 'COACH' as const, name: 'Oumarou Halidou', clubId: 'cot', clubName: 'Coton Sport', nationality: 'CMR', description: 'L\'architecte du succès de Coton Sport. Son 4-3-3 offensif et son pressing haut ont transformé l\'équipe en machine à gagner. Reconnu pour sa gestion des talents et son adaptabilité tactique lors des grands matchs.', stats: { wins: 12, winRate: 67, goalsScored: 38 }, highlightStat: { label: 'Victoires', value: 12 } };
const NGUIAMBA = { id: 'c2', type: 'COACH' as const, name: 'Pascal Nguiamba', clubId: 'cnk', clubName: 'Canon Yaoundé', nationality: 'CMR', description: 'Entraîneur expérimenté qui a remis Canon Yaoundé sur le devant de la scène. Sa gestion des talents et sa vision tactique font merveille. 10 victoires en 18 journées avec le système le plus flamboyant du championnat.', stats: { wins: 10, winRate: 56, goalsScored: 30 }, highlightStat: { label: 'Victoires', value: 10 } };
const NDANGA   = { id: 'c3', type: 'COACH' as const, name: 'Cyrille Ndanga', clubId: 'uds', clubName: 'Union Douala', nationality: 'CMR', description: 'Tacticien intelligent et passionné qui a transformé l\'Union Douala en une équipe difficile à battre. Spécialiste du bloc défensif et des transitions rapides, il extrait le maximum de chaque joueur.', stats: { wins: 9, winRate: 50, goalsScored: 27 }, highlightStat: { label: 'Victoires', value: 9 } };

// ─── Awards ───────────────────────────────────────────────────────────────────
export const MOCK_AWARDS: Award[] = [
  // ── Joueur du mois (OPEN) ──
  {
    id: 'aw-1', category: 'PLAYER_OF_MONTH', type: 'PLAYER',
    title: 'Joueur du Mois', subtitle: 'Avril 2025',
    description: 'Le meilleur joueur du mois d\'avril basé sur les performances en MTN Elite One. Critères : buts, passes décisives, note moyenne et impact collectif.',
    period: 'Avril 2025', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    nominees: [BASSOGOG, MAROU, ETAME],
    fanVotingEnabled: true, fanVoteWeight: 40, juryVoteWeight: 60, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-1', totalVotes: 12847, results: [
      { nomineeId: 'p1', votes: 5800, percentage: 45.1, trending: 'UP',   rank: 1 },
      { nomineeId: 'p2', votes: 4200, percentage: 32.7, trending: 'DOWN', rank: 2 },
      { nomineeId: 'p3', votes: 2847, percentage: 22.2, trending: 'UP',   rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },

  // ── Joueur de la semaine (OPEN) ──
  {
    id: 'aw-2', category: 'PLAYER_OF_WEEK', type: 'PLAYER',
    title: 'Joueur de la Semaine', subtitle: 'Semaine du 21 Avril',
    description: 'Performances de la 18e journée de MTN Elite One. Le joueur qui a le plus brillé lors de cette journée de championnat.',
    period: 'J18 — 21 Avril', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    nominees: [MAROU, BASSOGOG, NGONDO],
    fanVotingEnabled: true, fanVoteWeight: 100, juryVoteWeight: 0, trophyColor: 'SILVER',
    voteResults: { awardId: 'aw-2', totalVotes: 4320, results: [
      { nomineeId: 'p2', votes: 2100, percentage: 48.6, trending: 'UP',     rank: 1 },
      { nomineeId: 'p1', votes: 1400, percentage: 32.4, trending: 'STABLE', rank: 2 },
      { nomineeId: 'p7', votes:  820, percentage: 19.0, trending: 'DOWN',   rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },

  // ── Homme du Match (OPEN) ──
  {
    id: 'aw-10', category: 'PLAYER_OF_MATCH', type: 'PLAYER',
    title: 'Homme du Match', subtitle: 'Canon vs Coton · J18',
    description: 'Le joueur le plus décisif du choc de la 18e journée entre Canon Yaoundé et Coton Sport. Un vote 100% fans.',
    period: 'J18 — Canon vs Coton', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    nominees: [BASSOGOG, NJOH, ETAME],
    fanVotingEnabled: true, fanVoteWeight: 100, juryVoteWeight: 0, trophyColor: 'SILVER',
    voteResults: { awardId: 'aw-10', totalVotes: 3860, results: [
      { nomineeId: 'p1', votes: 2200, percentage: 57.0, trending: 'UP',   rank: 1 },
      { nomineeId: 'p5', votes:  980, percentage: 25.4, trending: 'UP',   rank: 2 },
      { nomineeId: 'p3', votes:  680, percentage: 17.6, trending: 'DOWN', rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },

  // ── Meilleur Gardien (OPEN) ──
  {
    id: 'aw-3', category: 'BEST_GOALKEEPER', type: 'PLAYER',
    title: 'Meilleur Gardien', subtitle: 'Saison 2025–26',
    description: 'Le gardien le plus performant de la saison en termes de clean sheets, arrêts décisifs et leadership. Sélection technique par le jury de la FECAFOOT.',
    period: 'Saison 2025–26', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    nominees: [NJOH, { ...ETAME, id: 'gk2', position: 'GK', name: 'Franck Ondoa', clubName: 'Eding Sport', description: 'Gardien expérimenté d\'Eding Sport. 6 clean sheets cette saison et une présence aérienne qui impressionne.', stats: { appearances: 16, minutesPlayed: 1440, cleanSheets: 6, saves: 44, rating: 7.7 }, highlightStat: { label: 'Clean sheets', value: 6 } }],
    fanVotingEnabled: true, fanVoteWeight: 30, juryVoteWeight: 70, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-3', totalVotes: 3210, results: [
      { nomineeId: 'p5',  votes: 2480, percentage: 77.3, trending: 'UP',   rank: 1 },
      { nomineeId: 'gk2', votes:  730, percentage: 22.7, trending: 'DOWN', rank: 2 },
    ], lastUpdated: new Date().toISOString() },
  },

  // ── Meilleur Jeune (OPEN) ──
  {
    id: 'aw-4', category: 'BEST_YOUNG_PLAYER', type: 'PLAYER',
    title: 'Meilleur Jeune Joueur', subtitle: 'Saison 2025–26',
    description: 'Meilleur joueur de moins de 23 ans de la saison. Le trophée récompense le talent de demain. Critères : progression, régularité, impact sur les résultats.',
    period: 'Saison 2025–26', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    nominees: [DAURA, NGONDO, NATHAND],
    fanVotingEnabled: true, fanVoteWeight: 50, juryVoteWeight: 50, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-4', totalVotes: 7640, results: [
      { nomineeId: 'p6', votes: 3200, percentage: 41.9, trending: 'UP',   rank: 1 },
      { nomineeId: 'p7', votes: 2800, percentage: 36.6, trending: 'UP',   rank: 2 },
      { nomineeId: 'p11',votes: 1640, percentage: 21.5, trending: 'DOWN', rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },

  // ── Joueur de la Saison (OPEN) ──
  {
    id: 'aw-11', category: 'PLAYER_OF_SEASON', type: 'PLAYER',
    title: 'Joueur de la Saison', subtitle: 'Saison 2025–26',
    description: 'La distinction individuelle la plus importante après le Ballon d\'Or. Récompense le joueur le plus constant et le plus influent sur toute la saison. Vote du jury technique de la FECAFOOT.',
    period: 'Saison 2025–26', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    nominees: [BASSOGOG, MAROU, ETAME, NJOH],
    fanVotingEnabled: true, fanVoteWeight: 35, juryVoteWeight: 65, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-11', totalVotes: 18430, results: [
      { nomineeId: 'p1', votes: 8200, percentage: 44.5, trending: 'UP',     rank: 1 },
      { nomineeId: 'p2', votes: 5600, percentage: 30.4, trending: 'STABLE', rank: 2 },
      { nomineeId: 'p3', votes: 2900, percentage: 15.7, trending: 'DOWN',   rank: 3 },
      { nomineeId: 'p5', votes: 1730, percentage: 9.4,  trending: 'UP',     rank: 4 },
    ], lastUpdated: new Date().toISOString() },
  },

  // ── Meilleur Buteur (ANNOUNCED — winner revealed) ──
  {
    id: 'aw-12', category: 'TOP_SCORER', type: 'PLAYER',
    title: 'Meilleur Buteur', subtitle: 'Mi-Saison 2025–26',
    description: 'Classement officiel des meilleurs buteurs de la Elite One à mi-parcours. Statistique pure : nombre de buts inscrits en championnat.',
    period: 'Mi-saison J18', season: 'season-2025-26',
    votingStatus: 'ANNOUNCED',
    nominees: [BASSOGOG, MAROU, NGONDO],
    winner: BASSOGOG,
    fanVotingEnabled: false, fanVoteWeight: 0, juryVoteWeight: 100, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-12', totalVotes: 0, results: [
      { nomineeId: 'p1', votes: 14, percentage: 100, trending: 'UP', rank: 1 },
      { nomineeId: 'p2', votes: 12, percentage: 86,  trending: 'UP', rank: 2 },
      { nomineeId: 'p7', votes: 10, percentage: 71,  trending: 'UP', rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },

  // ── Meilleur Passeur (ANNOUNCED) ──
  {
    id: 'aw-13', category: 'TOP_ASSIST', type: 'PLAYER',
    title: 'Meilleur Passeur', subtitle: 'Mi-Saison 2025–26',
    description: 'Classement officiel des meilleurs passeurs de la Elite One à mi-parcours. Passes décisives directes en championnat.',
    period: 'Mi-saison J18', season: 'season-2025-26',
    votingStatus: 'ANNOUNCED',
    nominees: [ETAME, MAROU, SOMBANG],
    winner: ETAME,
    fanVotingEnabled: false, fanVoteWeight: 0, juryVoteWeight: 100, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-13', totalVotes: 0, results: [
      { nomineeId: 'p3', votes: 11, percentage: 100, trending: 'UP',   rank: 1 },
      { nomineeId: 'p2', votes:  4, percentage: 36,  trending: 'UP',   rank: 2 },
      { nomineeId: 'p8', votes:  4, percentage: 36,  trending: 'STABLE', rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },

  // ── Équipe du Mois (OPEN) ──
  {
    id: 'aw-5', category: 'TEAM_OF_MONTH', type: 'TEAM',
    title: 'Équipe du Mois', subtitle: 'Avril 2025',
    description: 'L\'équipe la plus performante du mois d\'avril en termes de résultats, style de jeu et esprit d\'équipe. Évaluation combinée jury/fans.',
    period: 'Avril 2025', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    nominees: [COTON, CANON, UNION],
    fanVotingEnabled: true, fanVoteWeight: 40, juryVoteWeight: 60, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-5', totalVotes: 9800, results: [
      { nomineeId: 'cot', votes: 5200, percentage: 53.1, trending: 'UP',   rank: 1 },
      { nomineeId: 'cnk', votes: 2900, percentage: 29.6, trending: 'DOWN', rank: 2 },
      { nomineeId: 'uds', votes: 1700, percentage: 17.3, trending: 'UP',   rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },

  // ── Équipe de la Saison (OPEN) ──
  {
    id: 'aw-14', category: 'TEAM_OF_SEASON', type: 'TEAM',
    title: 'Équipe de la Saison', subtitle: 'Saison 2025–26',
    description: 'L\'équipe la plus dominante de la saison. Évaluation basée sur les performances tout au long du championnat : résultats, jeu collectif, cohérence et bilan face aux équipes du top 5.',
    period: 'Saison 2025–26', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    nominees: [COTON, CANON, UNION, FOVU],
    fanVotingEnabled: true, fanVoteWeight: 30, juryVoteWeight: 70, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-14', totalVotes: 14200, results: [
      { nomineeId: 'cot', votes: 8100, percentage: 57.0, trending: 'UP',     rank: 1 },
      { nomineeId: 'cnk', votes: 3600, percentage: 25.4, trending: 'DOWN',   rank: 2 },
      { nomineeId: 'uds', votes: 1700, percentage: 11.9, trending: 'STABLE', rank: 3 },
      { nomineeId: 'fov', votes:  800, percentage: 5.7,  trending: 'UP',     rank: 4 },
    ], lastUpdated: new Date().toISOString() },
  },

  // ── Coach du Mois (OPEN) ──
  {
    id: 'aw-6', category: 'COACH_OF_MONTH', type: 'COACH',
    title: 'Coach du Mois', subtitle: 'Avril 2025',
    description: 'Le meilleur entraîneur du mois d\'avril, évalué sur les résultats, les choix tactiques et le développement des joueurs.',
    period: 'Avril 2025', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    nominees: [HALIDOU, NGUIAMBA, NDANGA],
    fanVotingEnabled: true, fanVoteWeight: 30, juryVoteWeight: 70, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-6', totalVotes: 5400, results: [
      { nomineeId: 'c1', votes: 3400, percentage: 63.0, trending: 'UP',   rank: 1 },
      { nomineeId: 'c2', votes: 1280, percentage: 23.7, trending: 'DOWN', rank: 2 },
      { nomineeId: 'c3', votes:  720, percentage: 13.3, trending: 'UP',   rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },

  // ── Coach de la Saison (OPEN) ──
  {
    id: 'aw-15', category: 'COACH_OF_SEASON', type: 'COACH',
    title: 'Coach de la Saison', subtitle: 'Saison 2025–26',
    description: 'La distinction suprême pour un entraîneur. Récompense le coach qui a le mieux su tirer parti de son effectif, gérer les moments clés et porter son équipe vers le haut sur toute la durée du championnat.',
    period: 'Saison 2025–26', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    nominees: [HALIDOU, NGUIAMBA, NDANGA],
    fanVotingEnabled: true, fanVoteWeight: 25, juryVoteWeight: 75, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-15', totalVotes: 9800, results: [
      { nomineeId: 'c1', votes: 6200, percentage: 63.3, trending: 'UP',   rank: 1 },
      { nomineeId: 'c2', votes: 2100, percentage: 21.4, trending: 'DOWN', rank: 2 },
      { nomineeId: 'c3', votes: 1500, percentage: 15.3, trending: 'UP',   rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },

  // ── But de la Semaine (OPEN) ──
  {
    id: 'aw-7', category: 'GOAL_OF_WEEK', type: 'PLAYER',
    title: 'But de la Semaine', subtitle: 'Semaine du 21 Avril',
    description: 'Le geste technique le plus spectaculaire de la 18e journée de MTN Elite One. Vote 100% fans.',
    period: 'J18 — 21 Avril', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    nominees: [
      { ...MAROU,    id: 'g1', highlightStat: { label: 'Minute', value: 87 }, goalContext: { opponent: 'Canon Yaoundé', minute: 87, description: 'Frappe enroulée du gauche à 25 mètres, en pleine lucarne. Marou se retourne en pleine surface, ajuste et loge le cuir dans l\'angle impossible.', videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ' } },
      { ...BASSOGOG, id: 'g2', highlightStat: { label: 'Minute', value: 63 }, goalContext: { opponent: 'Union Douala',  minute: 63, description: 'Slalom sur 40 mètres, élimine quatre défenseurs et conclut du droit dans la surface. Pur talent à l\'état brut.', videoUrl: 'https://www.youtube.com/embed/ZZ5LpwO-An4' } },
      { ...NGONDO,   id: 'g3', highlightStat: { label: 'Minute', value: 12 }, goalContext: { opponent: 'PWD Bamenda',   minute: 12, description: 'Retourné acrobatique sur corner, hors de portée du gardien. Candidat naturel au but de la semaine.', videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ' } },
    ],
    fanVotingEnabled: true, fanVoteWeight: 100, juryVoteWeight: 0, trophyColor: 'SILVER',
    voteResults: { awardId: 'aw-7', totalVotes: 6180, results: [
      { nomineeId: 'g3', votes: 2980, percentage: 48.2, trending: 'UP',   rank: 1 },
      { nomineeId: 'g1', votes: 1940, percentage: 31.4, trending: 'DOWN', rank: 2 },
      { nomineeId: 'g2', votes: 1260, percentage: 20.4, trending: 'UP',   rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },

  // ── But du Mois (OPEN) ──
  {
    id: 'aw-8', category: 'GOAL_OF_MONTH', type: 'PLAYER',
    title: 'But du Mois', subtitle: 'Avril 2025',
    description: 'Le but le plus marquant du mois d\'avril, sélectionné parmi tous les buteurs de la Elite One. Vote combiné jury/fans.',
    period: 'Avril 2025', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    nominees: [
      { ...ETAME,  id: 'g4', highlightStat: { label: 'Minute', value: 90 }, goalContext: { opponent: 'Coton Sport', minute: 90, description: 'Coup franc direct sous la barre à la dernière minute pour arracher le point du match nul. Le Stade de la Réunification en délire.', videoUrl: 'https://www.youtube.com/embed/ZZ5LpwO-An4' } },
      { ...DAURA,  id: 'g5', highlightStat: { label: 'Minute', value: 34 }, goalContext: { opponent: 'Victoria United', minute: 34, description: 'Une-deux rapide suivi d\'un piqué délicat au-dessus du gardien. Geste d\'une maturité rare pour un joueur de 20 ans.', videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ' } },
      { ...NGONDO, id: 'g6', highlightStat: { label: 'Minute', value: 12 }, goalContext: { opponent: 'PWD Bamenda', minute: 12, description: 'Retourné acrobatique sur corner, but du mois désigné par le jury FECAFOOT pour son esthétique incomparable.', videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ' } },
    ],
    fanVotingEnabled: true, fanVoteWeight: 50, juryVoteWeight: 50, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-8', totalVotes: 15420, results: [
      { nomineeId: 'g6', votes: 7100, percentage: 46.0, trending: 'UP',   rank: 1 },
      { nomineeId: 'g4', votes: 5220, percentage: 33.9, trending: 'UP',   rank: 2 },
      { nomineeId: 'g5', votes: 3100, percentage: 20.1, trending: 'DOWN', rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },

  // ── But de la Saison (OPEN) ──
  {
    id: 'aw-9', category: 'GOAL_OF_SEASON', type: 'PLAYER',
    title: 'But de la Saison', subtitle: 'Saison 2025–26',
    description: 'Le plus beau but inscrit en MTN Elite One cette saison, toutes journées confondues. La grande récompense technique de l\'année.',
    period: 'Saison 2025–26', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    nominees: [
      { ...NGONDO,   id: 'g7', highlightStat: { label: 'Vues', value: '48K' }, goalContext: { opponent: 'PWD Bamenda',   minute: 12, description: 'Retourné acrobatique sur corner — candidat naturel au trophée annuel. Ce geste a fait le tour des réseaux sociaux africains.', videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ' } },
      { ...BASSOGOG, id: 'g8', highlightStat: { label: 'Vues', value: '31K' }, goalContext: { opponent: 'Union Douala',  minute: 63, description: 'Slalom sur 40 mètres, l\'un des buts les plus spectaculaires de la saison. La vitesse et la technique au service du spectacle.', videoUrl: 'https://www.youtube.com/embed/ZZ5LpwO-An4' } },
      { ...MAROU,    id: 'g9', highlightStat: { label: 'Vues', value: '22K' }, goalContext: { opponent: 'Canon Yaoundé', minute: 87, description: 'Frappe enroulée en pleine lucarne à 25 mètres. Sang-froid et technique dans le money time.', videoUrl: 'https://www.youtube.com/embed/LXb3EKWsInQ' } },
    ],
    fanVotingEnabled: true, fanVoteWeight: 60, juryVoteWeight: 40, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-9', totalVotes: 22300, results: [
      { nomineeId: 'g7', votes: 11400, percentage: 51.1, trending: 'UP',     rank: 1 },
      { nomineeId: 'g8', votes: 6700,  percentage: 30.0, trending: 'STABLE', rank: 2 },
      { nomineeId: 'g9', votes: 4200,  percentage: 18.9, trending: 'DOWN',   rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },
];

// ─── Ballon d'Or ──────────────────────────────────────────────────────────────
export const MOCK_BALLON_DOR: BallonDorEdition = {
  year: 2025,
  winner: BASSOGOG as any,
  votingOpen: true,
  votingDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  totalVotes: 48230,
  ceremonyDate: '2025-07-15T19:00:00Z',
  ranking: [
    { rank: 1, nominee: BASSOGOG as any, juryPoints: 420, fanPoints: 186, totalPoints: 606, rankChange: 0,  countryVotes: [{ country: 'CMR', votes: 8200 }] },
    { rank: 2, nominee: MAROU    as any, juryPoints: 380, fanPoints: 164, totalPoints: 544, rankChange: 1,  countryVotes: [{ country: 'CMR', votes: 6800 }] },
    { rank: 3, nominee: ETAME    as any, juryPoints: 310, fanPoints: 138, totalPoints: 448, rankChange: -1, countryVotes: [{ country: 'CMR', votes: 5200 }] },
    { rank: 4, nominee: NGONDO   as any, juryPoints: 280, fanPoints: 120, totalPoints: 400, rankChange: 2,  countryVotes: [{ country: 'CMR', votes: 4100 }] },
    { rank: 5, nominee: NJOH     as any, juryPoints: 240, fanPoints: 98,  totalPoints: 338, rankChange: 0,  countryVotes: [{ country: 'CMR', votes: 3800 }] },
  ],
};

// ─── Team of the week ─────────────────────────────────────────────────────────
export const MOCK_TEAM_OF_WEEK: TeamOfWeek = {
  id: 'tow-1', period: 'Journée 18', formation: '4-3-3',
  votingStatus: 'ANNOUNCED', totalVotes: 18420,
  players: [
    { id: 'fp1', nomineeId: 'p5',  name: 'Richard Njoh',      photoUrl: IMG.richardNjoh,    clubName: 'Coton Sport',   clubLogoUrl: undefined, position: 'GK',  positionLabel: 'Gardien',           x: 50, y: 90, rating: 8.5, highlightStat: { label: 'Clean Sheet', value: 1 } },
    { id: 'fp2', nomineeId: 'p8',  name: 'Marc Ekanga',        photoUrl: IMG.edouardSombang, clubName: 'Canon Yaoundé', clubLogoUrl: undefined, position: 'DEF', positionLabel: 'Défenseur droit',   x: 20, y: 72, rating: 7.8, highlightStat: { label: 'Duels', value: 7 } },
    { id: 'fp3', nomineeId: 'p9',  name: 'Bello Yacouba',      photoUrl: undefined,          clubName: 'Coton Sport',   clubLogoUrl: undefined, position: 'MID', positionLabel: 'Milieu central',    x: 35, y: 50, rating: 8.1, highlightStat: { label: 'Passes clés', value: 6 } },
    { id: 'fp4', nomineeId: 'p1',  name: 'Christian Bassogog', photoUrl: IMG.rostandardMbai, clubName: 'Canon Yaoundé', clubLogoUrl: undefined, position: 'FWD', positionLabel: 'Ailier droit',      x: 75, y: 22, rating: 9.1, highlightStat: { label: 'Buts', value: 2 } },
    { id: 'fp5', nomineeId: 'p2',  name: 'Ibrahim Marou',      photoUrl: IMG.davidNgondo,    clubName: 'Coton Sport',   clubLogoUrl: undefined, position: 'FWD', positionLabel: 'Avant-centre',      x: 50, y: 15, rating: 8.9, highlightStat: { label: 'Buts', value: 3 } },
    { id: 'fp6', nomineeId: 'p7',  name: 'David Ngondo',       photoUrl: IMG.davidNgondo,    clubName: 'Victoria Utd', clubLogoUrl: undefined, position: 'FWD', positionLabel: 'Ailier gauche',     x: 25, y: 22, rating: 7.9, highlightStat: { label: 'Buts', value: 1 } },
    { id: 'fp7', nomineeId: 'p3',  name: 'Roger Etame',        photoUrl: IMG.sergeDaura2,    clubName: 'Union Douala',  clubLogoUrl: undefined, position: 'MID', positionLabel: 'Milieu offensif',   x: 65, y: 40, rating: 8.3, highlightStat: { label: 'Passes D.', value: 2 } },
    { id: 'fp8', nomineeId: 'p4',  name: 'Souaibou Marou',     photoUrl: IMG.sergeDaura,     clubName: 'PWD Bamenda',   clubLogoUrl: undefined, position: 'MID', positionLabel: 'Milieu défensif',   x: 50, y: 50, rating: 7.7, highlightStat: { label: 'Récup.', value: 9 } },
    { id: 'fp9', nomineeId: 'p10', name: 'Adamou Sarki',        photoUrl: undefined,          clubName: 'Coton Sport',   clubLogoUrl: undefined, position: 'DEF', positionLabel: 'Défenseur central', x: 65, y: 72, rating: 7.6, highlightStat: { label: 'Dégag.', value: 5 } },
    { id: 'fp10',nomineeId: 'p11', name: 'Parfait Ndoumbe',     photoUrl: undefined,          clubName: 'Union Douala',  clubLogoUrl: undefined, position: 'DEF', positionLabel: 'Défenseur central', x: 35, y: 72, rating: 7.5, highlightStat: { label: 'Duels', value: 6 } },
    { id: 'fp11',nomineeId: 'p12', name: 'Ibrahim Hamidou',     photoUrl: undefined,          clubName: 'Fovu Baham',    clubLogoUrl: undefined, position: 'DEF', positionLabel: 'Défenseur gauche',  x: 80, y: 72, rating: 7.4, highlightStat: { label: 'Passes', value: 42 } },
  ],
  bench: [],
};

// ─── Historical winners ───────────────────────────────────────────────────────
export const MOCK_HISTORICAL: HistoricalWinner[] = [
  { year: 2024, period: 'Saison 2024–25', season: 'season-2024-25', category: 'BALLON_DOR',
    winner: { ...BASSOGOG, description: 'Meilleur buteur et joueur de la saison 2024-25. 18 buts en championnat.' } as any },
  { year: 2023, period: 'Saison 2023–24', season: 'season-2023-24', category: 'BALLON_DOR',
    winner: { ...ETAME, description: 'Milieu créateur, 14 passes décisives. Saison historique pour l\'Union Douala.' } as any },
  { year: 2022, period: 'Saison 2022–23', season: 'season-2022-23', category: 'BALLON_DOR',
    winner: { ...MAROU, photoUrl: IMG.rostandardMbai, description: 'Meilleur buteur avec 16 réalisations. Premier Ballon d\'Or pour Coton Sport.' } as any },
  { year: 2021, period: 'Saison 2021–22', season: 'season-2021-22', category: 'BALLON_DOR',
    winner: { id: 'hof1', type: 'PLAYER' as const, name: 'Jean Manga Onguene', photoUrl: IMG.jeanManga, clubName: 'Canon Yaoundé', clubShort: 'CNK', position: 'FWD', nationality: 'CMR', age: 32, stats: { goals: 19, assists: 6 }, highlightStat: { label: 'Buts', value: 19 }, description: 'Légende de Canon Yaoundé. 19 buts en une saison, un record qui tient encore.' } as any },
  { year: 2020, period: 'Saison 2020–21', season: 'season-2020-21', category: 'BALLON_DOR',
    winner: { id: 'hof2', type: 'PLAYER' as const, name: 'Mohammed Idrissou', photoUrl: IMG.mohammedI, clubName: 'Coton Sport', clubShort: 'COT', position: 'FWD', nationality: 'CMR', age: 35, stats: { goals: 16 }, highlightStat: { label: 'Buts', value: 16 }, description: 'International camerounais vétéran. Sa dernière grande saison avant la retraite.' } as any },
  { year: 2019, period: 'Saison 2019–20', season: 'season-2019-20', category: 'BALLON_DOR',
    winner: { id: 'hof3', type: 'PLAYER' as const, name: 'Théophile Abega', photoUrl: IMG.theophile, clubName: 'Canon Yaoundé', clubShort: 'CNK', position: 'MID', nationality: 'CMR', age: 38, stats: { goals: 8, assists: 12 }, highlightStat: { label: 'Passes D.', value: 12 }, description: 'Maestro du milieu de terrain camerounais. Sa créativité a illuminé le championnat.' } as any },

  { year: 2024, period: 'Saison 2024–25', season: 'season-2024-25', category: 'PLAYER_OF_SEASON',
    winner: { ...NJOH, description: 'Élu meilleur joueur de la saison par le panel technique : 8 clean sheets et une constance qui a porté Coton Sport vers le titre.' } as any },
  { year: 2023, period: 'Saison 2023–24', season: 'season-2023-24', category: 'PLAYER_OF_SEASON',
    winner: { ...MAROU, description: 'Distingué par le panel technique pour une saison à 15 buts qui a relancé Coton Sport dans la course au titre.' } as any },
  { year: 2022, period: 'Saison 2022–23', season: 'season-2022-23', category: 'PLAYER_OF_SEASON',
    winner: { ...NGONDO, description: 'Révélation de la saison : à 21 ans, il devient le plus jeune lauréat de la distinction, salué pour son impact offensif à Victoria United.' } as any },
  { year: 2021, period: 'Saison 2021–22', season: 'season-2021-22', category: 'PLAYER_OF_SEASON',
    winner: { id: 'hof4', type: 'PLAYER' as const, name: 'Thomas Nkono', photoUrl: IMG.thomasNkono, clubName: 'Canon Yaoundé', clubShort: 'CNK', position: 'GK', nationality: 'CMR', age: 34, stats: { cleanSheets: 11, saves: 61 }, highlightStat: { label: 'Clean sheets', value: 11 }, description: 'Le portier le plus décisif du championnat cette saison-là, désigné meilleur joueur pour sa maîtrise totale de sa surface.' } as any },
];

// ─── Fan Team Builder — full player pool (all active championship players) ────
export const MOCK_PLAYER_POOL = [
  // GK
  { id: 'pool-gk1', name: 'Richard Njoh',      position: 'GK' as const, clubName: 'Coton Sport',    clubId: 'cot', nationality: 'CMR', age: 26, photoUrl: IMG.richardNjoh,    rating: 8.0, highlightStat: { label: 'Clean sheets', value: 8 },  stats: { cleanSheets: 8,  saves: 52 } },
  { id: 'pool-gk2', name: 'Joël Matip',         position: 'GK' as const, clubName: 'Canon Yaoundé', clubId: 'cnk', nationality: 'CMR', age: 30, photoUrl: undefined,           rating: 7.5, highlightStat: { label: 'Arrêts', value: 46 },       stats: { cleanSheets: 5,  saves: 46 } },
  { id: 'pool-gk3', name: 'Pierre Tchouameni',  position: 'GK' as const, clubName: 'Union Douala',  clubId: 'uds', nationality: 'CMR', age: 28, photoUrl: undefined,           rating: 7.2, highlightStat: { label: 'Arrêts', value: 41 },       stats: { cleanSheets: 4,  saves: 41 } },
  { id: 'pool-gk4', name: 'Arnaud Ondoa',       position: 'GK' as const, clubName: 'Fovu Baham',    clubId: 'fov', nationality: 'CMR', age: 31, photoUrl: undefined,           rating: 7.6, highlightStat: { label: 'Clean sheets', value: 6 },  stats: { cleanSheets: 6,  saves: 38 } },
  // DEF
  { id: 'pool-def1', name: 'Rostand Mbaï',      position: 'DEF' as const, clubName: 'PWD Bamenda',   clubId: 'pwd', nationality: 'CMR', age: 28, photoUrl: IMG.rostandardMbai, rating: 7.4, highlightStat: { label: 'Duels gagnés', value: '74%' }, stats: { goals: 1, assists: 1, appearances: 17 } },
  { id: 'pool-def2', name: 'Marc Ekanga',        position: 'DEF' as const, clubName: 'Canon Yaoundé', clubId: 'cnk', nationality: 'CMR', age: 25, photoUrl: IMG.edouardSombang, rating: 7.8, highlightStat: { label: 'Duels', value: 7 },          stats: { goals: 0, assists: 2, appearances: 16 } },
  { id: 'pool-def3', name: 'Adamou Sarki',       position: 'DEF' as const, clubName: 'Coton Sport',   clubId: 'cot', nationality: 'CMR', age: 24, photoUrl: undefined,           rating: 7.6, highlightStat: { label: 'Dégag.', value: 5 },         stats: { goals: 0, assists: 1, appearances: 18 } },
  { id: 'pool-def4', name: 'Parfait Ndoumbe',    position: 'DEF' as const, clubName: 'Union Douala',  clubId: 'uds', nationality: 'CMR', age: 26, photoUrl: undefined,           rating: 7.5, highlightStat: { label: 'Duels', value: 6 },          stats: { goals: 1, assists: 0, appearances: 15 } },
  { id: 'pool-def5', name: 'Ibrahim Hamidou',    position: 'DEF' as const, clubName: 'Fovu Baham',    clubId: 'fov', nationality: 'CMR', age: 27, photoUrl: undefined,           rating: 7.4, highlightStat: { label: 'Passes', value: 42 },         stats: { goals: 0, assists: 1, appearances: 16 } },
  { id: 'pool-def6', name: 'Samuel Eto\'o Jr',   position: 'DEF' as const, clubName: 'Coton Sport',   clubId: 'cot', nationality: 'CMR', age: 23, photoUrl: undefined,           rating: 7.3, highlightStat: { label: 'Duels', value: 5 },          stats: { goals: 0, assists: 0, appearances: 14 } },
  { id: 'pool-def7', name: 'André Bikey',         position: 'DEF' as const, clubName: 'Victoria United',clubId: 'vict',nationality: 'CMR', age: 29, photoUrl: undefined,           rating: 7.2, highlightStat: { label: 'Interceptions', value: 28 },  stats: { goals: 1, assists: 0, appearances: 15 } },
  { id: 'pool-def8', name: 'Cédric Kenfack',     position: 'DEF' as const, clubName: 'APEJES Mfou',   clubId: 'apb', nationality: 'CMR', age: 24, photoUrl: undefined,           rating: 7.1, highlightStat: { label: 'Duels', value: 4 },          stats: { goals: 0, assists: 0, appearances: 13 } },
  // MID
  { id: 'pool-mid1', name: 'Roger Etame',        position: 'MID' as const, clubName: 'Union Douala',  clubId: 'uds', nationality: 'CMR', age: 27, photoUrl: IMG.sergeDaura2,    rating: 8.2, highlightStat: { label: 'Passes D.', value: 11 },    stats: { goals: 8, assists: 11, appearances: 17 } },
  { id: 'pool-mid2', name: 'Édouard Sombang',    position: 'MID' as const, clubName: 'Fovu Baham',    clubId: 'fov', nationality: 'CMR', age: 25, photoUrl: IMG.edouardSombang, rating: 7.6, highlightStat: { label: 'Récupérations', value: 48 }, stats: { goals: 2, assists: 4, appearances: 16 } },
  { id: 'pool-mid3', name: 'Serge Daura',        position: 'MID' as const, clubName: 'APEJES Mfou',   clubId: 'apb', nationality: 'CMR', age: 20, photoUrl: IMG.sergeDaura,     rating: 7.7, highlightStat: { label: 'Buts+PD', value: 9 },       stats: { goals: 3, assists: 6, appearances: 14 } },
  { id: 'pool-mid4', name: 'Bello Yacouba',      position: 'MID' as const, clubName: 'Coton Sport',   clubId: 'cot', nationality: 'CMR', age: 28, photoUrl: undefined,           rating: 8.1, highlightStat: { label: 'Passes clés', value: 6 },   stats: { goals: 4, assists: 7, appearances: 17 } },
  { id: 'pool-mid5', name: 'Souaibou Marou',     position: 'MID' as const, clubName: 'PWD Bamenda',   clubId: 'pwd', nationality: 'CMR', age: 26, photoUrl: IMG.sergeDaura,     rating: 7.7, highlightStat: { label: 'Récup.', value: 9 },        stats: { goals: 1, assists: 3, appearances: 16 } },
  { id: 'pool-mid6', name: 'Gaël Ondoa',         position: 'MID' as const, clubName: 'Canon Yaoundé', clubId: 'cnk', nationality: 'CMR', age: 24, photoUrl: undefined,           rating: 7.5, highlightStat: { label: 'Passes D.', value: 5 },     stats: { goals: 2, assists: 5, appearances: 15 } },
  { id: 'pool-mid7', name: 'Léandre Tawamba',    position: 'MID' as const, clubName: 'Coton Sport',   clubId: 'cot', nationality: 'CMR', age: 31, photoUrl: undefined,           rating: 7.3, highlightStat: { label: 'Matchs', value: 18 },        stats: { goals: 3, assists: 4, appearances: 18 } },
  { id: 'pool-mid8', name: 'François Kamano',    position: 'MID' as const, clubName: 'Union Douala',  clubId: 'uds', nationality: 'CMR', age: 28, photoUrl: undefined,           rating: 7.4, highlightStat: { label: 'Passes clés', value: 4 },   stats: { goals: 3, assists: 4, appearances: 14 } },
  // FWD
  { id: 'pool-fwd1', name: 'Christian Bassogog', position: 'FWD' as const, clubName: 'Canon Yaoundé', clubId: 'cnk', nationality: 'CMR', age: 29, photoUrl: IMG.rostandardMbai, rating: 8.4, highlightStat: { label: 'Buts', value: 14 },        stats: { goals: 14, assists: 5, appearances: 16 } },
  { id: 'pool-fwd2', name: 'Ibrahim Marou',       position: 'FWD' as const, clubName: 'Coton Sport',   clubId: 'cot', nationality: 'CMR', age: 24, photoUrl: IMG.davidNgondo,    rating: 8.1, highlightStat: { label: 'Buts', value: 12 },        stats: { goals: 12, assists: 4, appearances: 18 } },
  { id: 'pool-fwd3', name: 'David Ngondo',        position: 'FWD' as const, clubName: 'Victoria United',clubId: 'vict',nationality: 'CMR', age: 21, photoUrl: IMG.davidNgondo,    rating: 7.8, highlightStat: { label: 'Buts', value: 10 },        stats: { goals: 10, assists: 3, appearances: 17 } },
  { id: 'pool-fwd4', name: 'Nathan Douala',       position: 'FWD' as const, clubName: 'Union Douala',  clubId: 'uds', nationality: 'CMR', age: 19, photoUrl: IMG.nathanDouala,   rating: 7.5, highlightStat: { label: 'Buts', value: 5 },         stats: { goals: 5, assists: 2, appearances: 12 } },
  { id: 'pool-fwd5', name: 'Guy Fai',             position: 'FWD' as const, clubName: 'Fovu Baham',    clubId: 'fov', nationality: 'CMR', age: 25, photoUrl: undefined,           rating: 7.3, highlightStat: { label: 'Buts', value: 7 },         stats: { goals: 7, assists: 2, appearances: 16 } },
  { id: 'pool-fwd6', name: 'Eric Zebaze',         position: 'FWD' as const, clubName: 'PWD Bamenda',   clubId: 'pwd', nationality: 'CMR', age: 27, photoUrl: undefined,           rating: 7.1, highlightStat: { label: 'Buts', value: 6 },         stats: { goals: 6, assists: 1, appearances: 15 } },
  { id: 'pool-fwd7', name: 'Aristide Zogning',    position: 'FWD' as const, clubName: 'Canon Yaoundé', clubId: 'cnk', nationality: 'CMR', age: 22, photoUrl: undefined,           rating: 7.2, highlightStat: { label: 'Buts', value: 5 },         stats: { goals: 5, assists: 3, appearances: 14 } },
  { id: 'pool-fwd8', name: 'Blaise Matuidi Jr',   position: 'FWD' as const, clubName: 'APEJES Mfou',   clubId: 'apb', nationality: 'CMR', age: 20, photoUrl: undefined,           rating: 7.0, highlightStat: { label: 'Buts', value: 4 },         stats: { goals: 4, assists: 2, appearances: 13 } },
];