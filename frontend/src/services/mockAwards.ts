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
  photoUrl: IMG.rostandardMbai,   // best available match
  description: 'Ailier explosif et meilleur buteur du championnat. Sa vitesse et son efficacité devant le but font de lui le joueur le plus redouté de la Elite One.',
  clubId: 'cnk', clubName: 'Canon Yaoundé', clubShort: 'CNK',
  stats: { goals: 14, assists: 5, appearances: 16, minutesPlayed: 1380, rating: 8.4 },
  highlightStat: { label: 'Buts', value: 14 }, form: ['W','W','D','W','L'],
};
const MAROU = {
  id: 'p2', type: 'PLAYER' as const,
  name: 'Ibrahim Marou', position: 'FWD', nationality: 'CMR', age: 24,
  photoUrl: IMG.davidNgondo,
  description: 'Avant-centre technique et puissant de Coton Sport. 12 buts en 18 matchs, moteur offensif d\'une équipe qui domine le championnat.',
  clubId: 'cot', clubName: 'Coton Sport', clubShort: 'COT',
  stats: { goals: 12, assists: 4, appearances: 18, minutesPlayed: 1530, rating: 8.1 },
  highlightStat: { label: 'Buts', value: 12 }, form: ['W','W','W','D','W'],
};
const ETAME = {
  id: 'p3', type: 'PLAYER' as const,
  name: 'Roger Etame', position: 'MID', nationality: 'CMR', age: 27,
  photoUrl: IMG.sergeDaura2,
  description: 'Milieu de terrain créateur et polyvalent. Meilleur passeur du championnat avec 11 passes décisives, il dicte le jeu de l\'Union Douala.',
  clubId: 'uds', clubName: 'Union Douala', clubShort: 'UDS',
  stats: { goals: 8, assists: 11, appearances: 17, minutesPlayed: 1490, rating: 8.2, keyPasses: 57 },
  highlightStat: { label: 'Passes D.', value: 11 }, form: ['L','W','W','D','W'],
};
const SOUAIBOU = {
  id: 'p4', type: 'PLAYER' as const,
  name: 'Souaibou Marou', position: 'MID', nationality: 'CMR', age: 22,
  photoUrl: IMG.sergeDaura,
  description: 'Jeune milieu box-to-box de PWD Bamenda. Sa vision du jeu et son pressing intense en font l\'une des révélations de la saison.',
  clubId: 'pwd', clubName: 'PWD Bamenda', clubShort: 'PWD',
  stats: { goals: 7, assists: 9, appearances: 18, minutesPlayed: 1620, rating: 7.9 },
  highlightStat: { label: 'Buts+PD', value: 16 }, form: ['D','W','L','W','D'],
};
const NJOH = {
  id: 'p5', type: 'PLAYER' as const,
  name: 'Richard Njoh', position: 'GK', nationality: 'CMR', age: 26,
  photoUrl: IMG.richardNjoh,
  description: 'Gardien de but numéro 1 de Coton Sport. 8 clean sheets en 18 matchs et une présence décisive sur sa ligne qui contribue directement au titre en cours.',
  clubId: 'cot', clubName: 'Coton Sport', clubShort: 'COT',
  stats: { appearances: 18, minutesPlayed: 1620, cleanSheets: 8, saves: 52, rating: 8.0 },
  highlightStat: { label: 'Clean sheets', value: 8 }, form: ['W','W','W','D','W'],
};
const DAURA = {
  id: 'p6', type: 'PLAYER' as const,
  name: 'Serge Daura', position: 'MID', nationality: 'CMR', age: 20,
  photoUrl: IMG.sergeDaura,
  description: 'Milieu offensif prodige d\'APEJES Mfou. À seulement 20 ans, ses combinaisons et sa vision du jeu impressionnent les observateurs. Prochaine star du football camerounais.',
  clubId: 'apb', clubName: 'APEJES Mfou', clubShort: 'APB',
  stats: { goals: 3, assists: 6, appearances: 14, minutesPlayed: 1080, rating: 7.7 },
  highlightStat: { label: 'Buts+PD', value: 9 }, form: ['W','L','W','D','W'],
};
const NGONDO = {
  id: 'p7', type: 'PLAYER' as const,
  name: 'David Ngondo', position: 'FWD', nationality: 'CMR', age: 21,
  photoUrl: IMG.davidNgondo,
  description: 'Attaquant rapide et technique de Victoria United. 10 buts à seulement 21 ans, il s\'impose comme l\'un des meilleurs jeunes talents du pays.',
  clubId: 'vict', clubName: 'Victoria United', clubShort: 'VIC',
  stats: { goals: 10, assists: 3, appearances: 17, minutesPlayed: 1410, rating: 7.8 },
  highlightStat: { label: 'Buts', value: 10 }, form: ['W','D','D','L','W'],
};
const NATHAND = {
  id: 'p11', type: 'PLAYER' as const,
  name: 'Nathan Douala', position: 'FWD', nationality: 'CMR', age: 19,
  photoUrl: IMG.nathanDouala,
  description: 'Attaquant prodige de l\'Union Douala. À 19 ans, il est l\'un des jeunes les plus prometteurs du football camerounais avec une impressionnante aisance technique.',
  clubId: 'uds', clubName: 'Union Douala', clubShort: 'UDS',
  stats: { goals: 5, assists: 2, appearances: 12, minutesPlayed: 820, rating: 7.5 },
  highlightStat: { label: 'Buts', value: 5 }, form: ['W','D','L','W','W'],
};
const EKANGA = {
  id: 'p8', type: 'PLAYER' as const,
  name: 'Marc Ekanga', position: 'DEF', nationality: 'CMR', age: 28,
  photoUrl: IMG.edouardSombang,
  description: 'Défenseur central fiable et charismatique de Canon Yaoundé. Son leadership et sa lecture du jeu font de lui l\'un des meilleurs défenseurs de la Elite One.',
  clubId: 'cnk', clubName: 'Canon Yaoundé', clubShort: 'CNK',
  stats: { goals: 2, assists: 3, appearances: 18, minutesPlayed: 1620, rating: 7.8 },
  highlightStat: { label: 'Duels gagnés', value: 84 }, form: ['W','D','W','W','L'],
};

// ─── Teams ────────────────────────────────────────────────────────────────────
const COTON = { id: 'cot', type: 'TEAM' as const, name: 'Coton Sport', city: 'Garoua', coach: 'Oumarou Halidou', description: 'Le leader incontesté du championnat. 12 victoires en 18 matchs, le meilleur bilan offensif et défensif de la saison.', stats: { wins: 12, draws: 2, losses: 4, goalsFor: 38, goalsAgainst: 16, points: 38 }, form: ['W','W','D','W','W'], highlightStat: { label: 'Points', value: 38 } };
const CANON  = { id: 'cnk', type: 'TEAM' as const, name: 'Canon Yaoundé', city: 'Yaoundé', coach: 'Pascal Nguiamba', description: 'Le club historique de Yaoundé, dauphin du championnat. Porté par Bassogog, Canon offre un football offensif et spectaculaire.', stats: { wins: 10, draws: 4, losses: 4, goalsFor: 30, goalsAgainst: 16, points: 34 }, form: ['W','D','W','W','L'], highlightStat: { label: 'Points', value: 34 } };
const UNION  = { id: 'uds', type: 'TEAM' as const, name: 'Union Douala',  city: 'Douala',  coach: 'Cyrille Ndanga',  description: 'Le club de la capitale économique, troisième au classement. Avec Etame et Ndoumbe, l\'Union Douala propose un beau jeu collectif.', stats: { wins: 9, draws: 4, losses: 5, goalsFor: 27, goalsAgainst: 16, points: 31 }, form: ['L','W','W','D','W'], highlightStat: { label: 'Points', value: 31 } };

// ─── Coaches ──────────────────────────────────────────────────────────────────
const HALIDOU  = { id: 'c1', type: 'COACH' as const, name: 'Oumarou Halidou', clubId: 'cot', clubName: 'Coton Sport', nationality: 'CMR', description: 'L\'architecte du succès de Coton Sport. Son 4-3-3 offensif et son pressing haut ont transformé l\'équipe en machine à gagner.', stats: { wins: 12, winRate: 67, goalsScored: 38 }, highlightStat: { label: 'Victoires', value: 12 } };
const NGUIAMBA = { id: 'c2', type: 'COACH' as const, name: 'Pascal Nguiamba', clubId: 'cnk', clubName: 'Canon Yaoundé', nationality: 'CMR', description: 'Entraîneur expérimenté qui a remis Canon Yaoundé sur le devant de la scène. Sa gestion des talents et sa vision tactique font merveille.', stats: { wins: 10, winRate: 56, goalsScored: 30 }, highlightStat: { label: 'Victoires', value: 10 } };

// ─── Awards ───────────────────────────────────────────────────────────────────
export const MOCK_AWARDS: Award[] = [
  {
    id: 'aw-1', category: 'PLAYER_OF_MONTH', type: 'PLAYER',
    title: 'Joueur du Mois', subtitle: 'Avril 2025',
    description: 'Le meilleur joueur du mois d\'avril basé sur les performances en MTN Elite One.',
    period: 'Avril 2025', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: '2025-05-01T23:59:59Z',
    nominees: [BASSOGOG, MAROU, ETAME],
    fanVotingEnabled: true, fanVoteWeight: 40, juryVoteWeight: 60, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-1', totalVotes: 12847, results: [
      { nomineeId: 'p1', votes: 5800, percentage: 45.1, trending: 'UP',   rank: 1 },
      { nomineeId: 'p2', votes: 4200, percentage: 32.7, trending: 'DOWN', rank: 2 },
      { nomineeId: 'p3', votes: 2847, percentage: 22.2, trending: 'UP',   rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },
  {
    id: 'aw-2', category: 'PLAYER_OF_WEEK', type: 'PLAYER',
    title: 'Joueur de la Semaine', subtitle: 'Semaine du 21 Avril',
    description: 'Performances de la 18e journée de MTN Elite One.',
    period: 'J18 — 21 Avril', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: '2025-04-28T23:59:59Z',
    nominees: [MAROU, BASSOGOG, NGONDO],
    fanVotingEnabled: true, fanVoteWeight: 100, juryVoteWeight: 0, trophyColor: 'SILVER',
    voteResults: { awardId: 'aw-2', totalVotes: 4320, results: [
      { nomineeId: 'p2', votes: 2100, percentage: 48.6, trending: 'UP',     rank: 1 },
      { nomineeId: 'p1', votes: 1400, percentage: 32.4, trending: 'STABLE', rank: 2 },
      { nomineeId: 'p7', votes:  820, percentage: 19.0, trending: 'DOWN',   rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },
  {
    id: 'aw-3', category: 'BEST_GOALKEEPER', type: 'PLAYER',
    title: 'Meilleur Gardien', subtitle: 'Saison 2025–26',
    description: 'Le gardien le plus performant de la saison en termes de clean sheets, arrêts décisifs et leadership.',
    period: 'Saison 2025–26', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: '2025-06-30T23:59:59Z',
    nominees: [NJOH],
    fanVotingEnabled: true, fanVoteWeight: 30, juryVoteWeight: 70, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-3', totalVotes: 3210, results: [{ nomineeId: 'p5', votes: 3210, percentage: 100, trending: 'UP', rank: 1 }], lastUpdated: new Date().toISOString() },
  },
  {
    id: 'aw-4', category: 'BEST_YOUNG_PLAYER', type: 'PLAYER',
    title: 'Meilleur Jeune Joueur', subtitle: 'Saison 2025–26',
    description: 'Meilleur joueur de moins de 23 ans de la saison. Le trophée récompense le talent de demain.',
    period: 'Saison 2025–26', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: '2025-06-30T23:59:59Z',
    nominees: [DAURA, NGONDO, NATHAND],
    fanVotingEnabled: true, fanVoteWeight: 50, juryVoteWeight: 50, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-4', totalVotes: 7640, results: [
      { nomineeId: 'p6', votes: 3200, percentage: 41.9, trending: 'UP',   rank: 1 },
      { nomineeId: 'p7', votes: 2800, percentage: 36.6, trending: 'UP',   rank: 2 },
      { nomineeId: 'p11',votes: 1640, percentage: 21.5, trending: 'DOWN', rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },
  {
    id: 'aw-5', category: 'TEAM_OF_MONTH', type: 'TEAM',
    title: 'Équipe du Mois', subtitle: 'Avril 2025',
    description: 'L\'équipe la plus performante du mois d\'avril en termes de résultats, style de jeu et esprit d\'équipe.',
    period: 'Avril 2025', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: '2025-05-01T23:59:59Z',
    nominees: [COTON, CANON, UNION],
    fanVotingEnabled: true, fanVoteWeight: 40, juryVoteWeight: 60, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-5', totalVotes: 9800, results: [
      { nomineeId: 'cot', votes: 5200, percentage: 53.1, trending: 'UP',   rank: 1 },
      { nomineeId: 'cnk', votes: 2900, percentage: 29.6, trending: 'DOWN', rank: 2 },
      { nomineeId: 'uds', votes: 1700, percentage: 17.3, trending: 'UP',   rank: 3 },
    ], lastUpdated: new Date().toISOString() },
  },
  {
    id: 'aw-6', category: 'COACH_OF_MONTH', type: 'COACH',
    title: 'Coach du Mois', subtitle: 'Avril 2025',
    description: 'Le meilleur entraîneur du mois d\'avril, évalué sur les résultats, les choix tactiques et le développement des joueurs.',
    period: 'Avril 2025', season: 'season-2025-26',
    votingStatus: 'OPEN', votingDeadline: '2025-05-01T23:59:59Z',
    nominees: [HALIDOU, NGUIAMBA],
    fanVotingEnabled: true, fanVoteWeight: 30, juryVoteWeight: 70, trophyColor: 'GOLD',
    voteResults: { awardId: 'aw-6', totalVotes: 5400, results: [
      { nomineeId: 'c1', votes: 3400, percentage: 63.0, trending: 'UP',   rank: 1 },
      { nomineeId: 'c2', votes: 2000, percentage: 37.0, trending: 'DOWN', rank: 2 },
    ], lastUpdated: new Date().toISOString() },
  },
];

// ─── Ballon d'Or ──────────────────────────────────────────────────────────────
export const MOCK_BALLON_DOR: BallonDorEdition = {
  year: 2025,
  winner: BASSOGOG as any,
  votingOpen: true,
  votingDeadline: '2025-06-30T23:59:59Z',
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
];