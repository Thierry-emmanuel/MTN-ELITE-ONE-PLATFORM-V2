import type { MatchDay, Standing, PlayerStat, ClubStat } from '../types/football.types';

export const DEV_SEASON_ID = 'season-2025-26';

// ─── Clubs ────────────────────────────────────────────────────────────────────

const COT = { id: 'cot', name: 'Coton Sport',    short: 'COT', color: '#FFD400', city: 'Garoua' };
const CNK = { id: 'cnk', name: 'Canon Yaoundé',  short: 'CNK', color: '#CE1126', city: 'Yaoundé' };
const UDS = { id: 'uds', name: 'Union Douala',   short: 'UDS', color: '#1E3A8A', city: 'Douala' };
const PWD = { id: 'pwd', name: 'PWD Bamenda',    short: 'PWD', color: '#1F8A4C', city: 'Bamenda' };
const VIC = { id: 'vict',name: 'Victoria United',short: 'VIC', color: '#10B981', city: 'Limbe' };
const APB = { id: 'apb', name: 'APEJES Mfou',    short: 'APB', color: '#7C3AED', city: 'Mfou' };
const COF = { id: 'cof', name: 'Colombe FC',     short: 'COF', color: '#FB923C', city: 'Sangmélima' };
const FOV = { id: 'fov', name: 'Fovu Baham',     short: 'FOV', color: '#EF4444', city: 'Baham' };
const YMB = { id: 'ymb', name: 'Young Sports',   short: 'YMB', color: '#0EA5E9', city: 'Bamenda' };
const BAM = { id: 'bam', name: 'Bamboutos',      short: 'BAM', color: '#A78BFA', city: 'Mbouda' };

// ─── Mock Fixtures ────────────────────────────────────────────────────────────

export const MOCK_FIXTURES: MatchDay[] = [
  {
    round: 19,
    date: '2025-04-26',
    matches: [
      { id: 'f1', homeClub: COT, awayClub: CNK, homeScore: null, awayScore: null, status: 'SCHEDULED', kickoffUtc: '2025-04-26T13:00:00Z', round: 19, venue: { id: 'v1', name: 'Stade Roumdé Adjia', city: 'Garoua', capacity: 45000 }, referee: { id: 'r1', name: 'J.P. Essomba' } },
      { id: 'f2', homeClub: PWD, awayClub: UDS, homeScore: 1,    awayScore: 1,    status: 'LIVE',      kickoffUtc: '2025-04-26T15:30:00Z', round: 19, liveMinute: 62, venue: { id: 'v2', name: 'Stade de Bamenda', city: 'Bamenda' }, events: [{ minute: 23, type: 'GOAL', playerName: 'Souaibou', clubId: 'pwd' }, { minute: 58, type: 'GOAL', playerName: 'Etame', clubId: 'uds' }] },
    ],
  },
  {
    round: 19,
    date: '2025-04-27',
    matches: [
      { id: 'f3', homeClub: VIC, awayClub: APB, homeScore: null, awayScore: null, status: 'SCHEDULED', kickoffUtc: '2025-04-27T11:30:00Z', round: 19 },
      { id: 'f4', homeClub: COF, awayClub: FOV, homeScore: null, awayScore: null, status: 'SCHEDULED', kickoffUtc: '2025-04-27T13:00:00Z', round: 19 },
    ],
  },
  {
    round: 19,
    date: '2025-04-28',
    matches: [
      { id: 'f5', homeClub: BAM, awayClub: YMB, homeScore: null, awayScore: null, status: 'SCHEDULED', kickoffUtc: '2025-04-28T12:00:00Z', round: 19 },
    ],
  },
];

// ─── Mock Results ─────────────────────────────────────────────────────────────

export const MOCK_RESULTS: MatchDay[] = [
  {
    round: 18,
    date: '2025-04-21',
    matches: [
      { id: 'r1', homeClub: CNK, awayClub: UDS, homeScore: 2, awayScore: 1, status: 'FT', kickoffUtc: '2025-04-21T13:00:00Z', round: 18, venue: { id: 'v3', name: 'Stade Ahmadou Ahidjo', city: 'Yaoundé', capacity: 38000 }, attendance: 24500, events: [{ minute: 18, type: 'GOAL', playerName: 'Bassogog', clubId: 'cnk' }, { minute: 44, type: 'GOAL', playerName: 'Etame', clubId: 'uds' }, { minute: 67, type: 'GOAL', playerName: 'Bassogog', clubId: 'cnk' }] },
      { id: 'r2', homeClub: COT, awayClub: PWD, homeScore: 3, awayScore: 0, status: 'FT', kickoffUtc: '2025-04-21T15:30:00Z', round: 18, venue: { id: 'v1', name: 'Stade Roumdé Adjia', city: 'Garoua', capacity: 45000 }, attendance: 38200 },
    ],
  },
  {
    round: 18,
    date: '2025-04-20',
    matches: [
      { id: 'r3', homeClub: VIC, awayClub: FOV, homeScore: 1, awayScore: 1, status: 'FT', kickoffUtc: '2025-04-20T13:00:00Z', round: 18 },
      { id: 'r4', homeClub: APB, awayClub: YMB, homeScore: 0, awayScore: 2, status: 'FT', kickoffUtc: '2025-04-20T15:30:00Z', round: 18 },
    ],
  },
  {
    round: 17,
    date: '2025-04-14',
    matches: [
      { id: 'r5', homeClub: COT, awayClub: COF, homeScore: 4, awayScore: 1, status: 'FT', kickoffUtc: '2025-04-14T13:00:00Z', round: 17 },
      { id: 'r6', homeClub: COF, awayClub: BAM, homeScore: 2, awayScore: 2, status: 'FT', kickoffUtc: '2025-04-14T15:30:00Z', round: 17 },
    ],
  },
];

// ─── Mock Standings ───────────────────────────────────────────────────────────

export const MOCK_STANDINGS: Standing[] = [
  { id: 's1', position: 1, club: COT, played: 18, won: 12, drawn: 2, lost: 4, goalsFor: 38, goalsAgainst: 16, goalDifference: 22, points: 38, formGuide: ['W','W','D','W','W'] },
  { id: 's2', position: 2, club: CNK, played: 18, won: 10, drawn: 4, lost: 4, goalsFor: 30, goalsAgainst: 16, goalDifference: 14, points: 34, formGuide: ['W','D','W','W','L'] },
  { id: 's3', position: 3, club: UDS, played: 18, won:  9, drawn: 4, lost: 5, goalsFor: 27, goalsAgainst: 16, goalDifference: 11, points: 31, formGuide: ['L','W','W','D','W'] },
  { id: 's4', position: 4, club: PWD, played: 18, won:  8, drawn: 5, lost: 5, goalsFor: 24, goalsAgainst: 16, goalDifference:  8, points: 29, formGuide: ['D','W','L','W','D'] },
  { id: 's5', position: 5, club: VIC, played: 18, won:  7, drawn: 6, lost: 5, goalsFor: 22, goalsAgainst: 17, goalDifference:  5, points: 27, formGuide: ['W','D','D','L','W'] },
  { id: 's6', position: 6, club: APB, played: 18, won:  6, drawn: 6, lost: 6, goalsFor: 19, goalsAgainst: 17, goalDifference:  2, points: 24, formGuide: ['L','W','D','W','L'] },
  { id: 's7', position: 7, club: COF, played: 18, won:  5, drawn: 7, lost: 6, goalsFor: 17, goalsAgainst: 18, goalDifference: -1, points: 22, formGuide: ['D','D','W','L','D'] },
  { id: 's8', position: 8, club: YMB, played: 18, won:  4, drawn: 8, lost: 6, goalsFor: 15, goalsAgainst: 18, goalDifference: -3, points: 20, formGuide: ['L','L','W','D','W'] },
  { id: 's9', position: 9, club: FOV, played: 18, won:  4, drawn: 5, lost: 9, goalsFor: 16, goalsAgainst: 24, goalDifference: -8, points: 17, formGuide: ['L','W','L','D','L'] },
  { id: 's10',position:10, club: BAM, played: 18, won:  3, drawn: 5, lost:10, goalsFor: 12, goalsAgainst: 28, goalDifference:-16, points: 14, formGuide: ['L','L','D','L','W'] },
];

// ─── Mock Player Stats ────────────────────────────────────────────────────────

export const MOCK_PLAYER_STATS: PlayerStat[] = [
  {
    playerId: 'p1', playerName: 'Christian Bassogog', position: 'FW',
    nationality: 'CMR', age: 29,
    clubId: 'cnk', clubName: 'Canon Yaoundé', clubShort: 'CNK',
    appearances: 16, minutesPlayed: 1380,
    goals: 14, assists: 5, keyPasses: 38, shots: 62, shotsOnTarget: 31,
    xG: 13.2, penaltiesScored: 3, penaltiesMissed: 1,
    yellowCards: 3, redCards: 0, passAccuracy: 81,
  },
  {
    playerId: 'p2', playerName: 'Marou Ibrahim', position: 'FW',
    nationality: 'CMR', age: 24,
    clubId: 'cot', clubName: 'Coton Sport', clubShort: 'COT',
    appearances: 18, minutesPlayed: 1530,
    goals: 12, assists: 4, keyPasses: 29, shots: 55, shotsOnTarget: 26,
    xG: 11.8, penaltiesScored: 2, penaltiesMissed: 0,
    yellowCards: 2, redCards: 0, passAccuracy: 78,
  },
  {
    playerId: 'p3', playerName: 'Roger Etame', position: 'MF',
    nationality: 'CMR', age: 27,
    clubId: 'uds', clubName: 'Union Douala', clubShort: 'UDS',
    appearances: 17, minutesPlayed: 1490,
    goals: 8, assists: 11, keyPasses: 57, shots: 38, shotsOnTarget: 16,
    xG: 7.5, penaltiesScored: 1, penaltiesMissed: 0,
    yellowCards: 5, redCards: 1, passAccuracy: 86,
  },
  {
    playerId: 'p4', playerName: 'Souaibou Marou', position: 'MF',
    nationality: 'CMR', age: 22,
    clubId: 'pwd', clubName: 'PWD Bamenda', clubShort: 'PWD',
    appearances: 18, minutesPlayed: 1620,
    goals: 7, assists: 9, keyPasses: 51, shots: 32, shotsOnTarget: 14,
    xG: 6.8, penaltiesScored: 0, penaltiesMissed: 0,
    yellowCards: 7, redCards: 0, passAccuracy: 82,
  },
  {
    playerId: 'p5', playerName: 'David Ngondo', position: 'FW',
    nationality: 'CMR', age: 21,
    clubId: 'vict', clubName: 'Victoria United', clubShort: 'VIC',
    appearances: 17, minutesPlayed: 1410,
    goals: 10, assists: 3, keyPasses: 22, shots: 48, shotsOnTarget: 22,
    xG: 9.6, penaltiesScored: 1, penaltiesMissed: 1,
    yellowCards: 4, redCards: 0, passAccuracy: 73,
  },
  {
    playerId: 'p6', playerName: 'Parfait Ndoumbe', position: 'MF',
    nationality: 'CMR', age: 26,
    clubId: 'uds', clubName: 'Union Douala', clubShort: 'UDS',
    appearances: 15, minutesPlayed: 1260,
    goals: 4, assists: 8, keyPasses: 44, shots: 21, shotsOnTarget: 9,
    xG: 3.9, penaltiesScored: 0, penaltiesMissed: 0,
    yellowCards: 6, redCards: 0, passAccuracy: 84,
  },
  {
    playerId: 'p7', playerName: 'Adamou Sarki', position: 'FW',
    nationality: 'CMR', age: 23,
    clubId: 'cot', clubName: 'Coton Sport', clubShort: 'COT',
    appearances: 18, minutesPlayed: 1440,
    goals: 9, assists: 2, keyPasses: 17, shots: 44, shotsOnTarget: 19,
    xG: 8.4, penaltiesScored: 1, penaltiesMissed: 0,
    yellowCards: 3, redCards: 1, passAccuracy: 71,
  },
  {
    playerId: 'p8', playerName: 'Marc Ekanga', position: 'DF',
    nationality: 'CMR', age: 28,
    clubId: 'cnk', clubName: 'Canon Yaoundé', clubShort: 'CNK',
    appearances: 18, minutesPlayed: 1620,
    goals: 2, assists: 3, keyPasses: 12, shots: 14, shotsOnTarget: 5,
    xG: 1.8, penaltiesScored: 0, penaltiesMissed: 0,
    yellowCards: 8, redCards: 1, passAccuracy: 88,
  },
  {
    playerId: 'p9', playerName: 'Bello Yacouba', position: 'MF',
    nationality: 'CMR', age: 25,
    clubId: 'cot', clubName: 'Coton Sport', clubShort: 'COT',
    appearances: 16, minutesPlayed: 1340,
    goals: 5, assists: 7, keyPasses: 48, shots: 28, shotsOnTarget: 12,
    xG: 4.7, penaltiesScored: 0, penaltiesMissed: 0,
    yellowCards: 4, redCards: 0, passAccuracy: 85,
  },
  {
    playerId: 'p10', playerName: 'Serge Daura', position: 'MF',
    nationality: 'CMR', age: 20,
    clubId: 'apb', clubName: 'APEJES Mfou', clubShort: 'APB',
    appearances: 14, minutesPlayed: 1080,
    goals: 3, assists: 6, keyPasses: 35, shots: 19, shotsOnTarget: 8,
    xG: 2.9, penaltiesScored: 0, penaltiesMissed: 0,
    yellowCards: 2, redCards: 0, passAccuracy: 79,
  },
  {
    playerId: 'p11', playerName: 'Nathan Douala', position: 'FW',
    nationality: 'CMR', age: 19,
    clubId: 'uds', clubName: 'Union Douala', clubShort: 'UDS',
    appearances: 12, minutesPlayed: 820,
    goals: 5, assists: 2, keyPasses: 14, shots: 26, shotsOnTarget: 11,
    xG: 4.6, penaltiesScored: 0, penaltiesMissed: 0,
    yellowCards: 1, redCards: 0, passAccuracy: 75,
  },
  {
    playerId: 'p12', playerName: 'Edouard Sombang', position: 'DF',
    nationality: 'CMR', age: 30,
    clubId: 'cnk', clubName: 'Canon Yaoundé', clubShort: 'CNK',
    appearances: 18, minutesPlayed: 1620,
    goals: 1, assists: 2, keyPasses: 8, shots: 10, shotsOnTarget: 3,
    xG: 0.9, penaltiesScored: 0, penaltiesMissed: 0,
    yellowCards: 9, redCards: 2, passAccuracy: 87,
  },
  {
    playerId: 'p13', playerName: 'Richard Njoh', position: 'GK',
    nationality: 'CMR', age: 26,
    clubId: 'cot', clubName: 'Coton Sport', clubShort: 'COT',
    appearances: 18, minutesPlayed: 1620,
    goals: 0, assists: 0, keyPasses: 2, shots: 0, shotsOnTarget: 0,
    xG: 0, penaltiesScored: 0, penaltiesMissed: 0,
    yellowCards: 1, redCards: 0, passAccuracy: 66,
  },
  {
    playerId: 'p14', playerName: 'Rostand Mbai', position: 'FW',
    nationality: 'CMR', age: 27,
    clubId: 'cof', clubName: 'Colombe FC', clubShort: 'COF',
    appearances: 17, minutesPlayed: 1390,
    goals: 8, assists: 1, keyPasses: 16, shots: 41, shotsOnTarget: 17,
    xG: 7.2, penaltiesScored: 2, penaltiesMissed: 1,
    yellowCards: 5, redCards: 0, passAccuracy: 69,
  },
  {
    playerId: 'p15', playerName: 'Ibrahim Hamidou', position: 'MF',
    nationality: 'CMR', age: 24,
    clubId: 'fov', clubName: 'Fovu Baham', clubShort: 'FOV',
    appearances: 16, minutesPlayed: 1320,
    goals: 4, assists: 5, keyPasses: 31, shots: 22, shotsOnTarget: 9,
    xG: 3.7, penaltiesScored: 1, penaltiesMissed: 0,
    yellowCards: 6, redCards: 1, passAccuracy: 77,
  },
];

// ─── Mock Club Stats ──────────────────────────────────────────────────────────

export const MOCK_CLUB_STATS: ClubStat[] = [
  {
    clubId: 'cot', clubName: 'Coton Sport', clubShort: 'COT',
    matchesPlayed: 18, wins: 12, draws: 2, losses: 4,
    goalsFor: 38, goalsAgainst: 16, goalDifference: 22,
    shots: 241, shotsOnTarget: 118, possession: 54,
    yellowCards: 28, redCards: 2, penaltiesFor: 6, penaltiesAgainst: 3,
    cleanSheets: 8, points: 38,
  },
  {
    clubId: 'cnk', clubName: 'Canon Yaoundé', clubShort: 'CNK',
    matchesPlayed: 18, wins: 10, draws: 4, losses: 4,
    goalsFor: 30, goalsAgainst: 16, goalDifference: 14,
    shots: 198, shotsOnTarget: 94, possession: 52,
    yellowCards: 32, redCards: 4, penaltiesFor: 5, penaltiesAgainst: 4,
    cleanSheets: 6, points: 34,
  },
  {
    clubId: 'uds', clubName: 'Union Douala', clubShort: 'UDS',
    matchesPlayed: 18, wins: 9, draws: 4, losses: 5,
    goalsFor: 27, goalsAgainst: 16, goalDifference: 11,
    shots: 175, shotsOnTarget: 81, possession: 49,
    yellowCards: 35, redCards: 2, penaltiesFor: 3, penaltiesAgainst: 5,
    cleanSheets: 5, points: 31,
  },
  {
    clubId: 'pwd', clubName: 'PWD Bamenda', clubShort: 'PWD',
    matchesPlayed: 18, wins: 8, draws: 5, losses: 5,
    goalsFor: 24, goalsAgainst: 16, goalDifference: 8,
    shots: 162, shotsOnTarget: 74, possession: 47,
    yellowCards: 29, redCards: 1, penaltiesFor: 2, penaltiesAgainst: 3,
    cleanSheets: 6, points: 29,
  },
  {
    clubId: 'vict', clubName: 'Victoria United', clubShort: 'VIC',
    matchesPlayed: 18, wins: 7, draws: 6, losses: 5,
    goalsFor: 22, goalsAgainst: 17, goalDifference: 5,
    shots: 148, shotsOnTarget: 66, possession: 45,
    yellowCards: 24, redCards: 1, penaltiesFor: 3, penaltiesAgainst: 2,
    cleanSheets: 4, points: 27,
  },
  {
    clubId: 'apb', clubName: 'APEJES Mfou', clubShort: 'APB',
    matchesPlayed: 18, wins: 6, draws: 6, losses: 6,
    goalsFor: 19, goalsAgainst: 17, goalDifference: 2,
    shots: 131, shotsOnTarget: 58, possession: 44,
    yellowCards: 26, redCards: 2, penaltiesFor: 2, penaltiesAgainst: 4,
    cleanSheets: 4, points: 24,
  },
  {
    clubId: 'cof', clubName: 'Colombe FC', clubShort: 'COF',
    matchesPlayed: 18, wins: 5, draws: 7, losses: 6,
    goalsFor: 17, goalsAgainst: 18, goalDifference: -1,
    shots: 128, shotsOnTarget: 52, possession: 46,
    yellowCards: 31, redCards: 1, penaltiesFor: 4, penaltiesAgainst: 3,
    cleanSheets: 3, points: 22,
  },
  {
    clubId: 'ymb', clubName: 'Young Sports', clubShort: 'YMB',
    matchesPlayed: 18, wins: 4, draws: 8, losses: 6,
    goalsFor: 15, goalsAgainst: 18, goalDifference: -3,
    shots: 119, shotsOnTarget: 48, possession: 43,
    yellowCards: 38, redCards: 3, penaltiesFor: 1, penaltiesAgainst: 4,
    cleanSheets: 3, points: 20,
  },
  {
    clubId: 'fov', clubName: 'Fovu Baham', clubShort: 'FOV',
    matchesPlayed: 18, wins: 4, draws: 5, losses: 9,
    goalsFor: 16, goalsAgainst: 24, goalDifference: -8,
    shots: 112, shotsOnTarget: 44, possession: 41,
    yellowCards: 42, redCards: 4, penaltiesFor: 3, penaltiesAgainst: 6,
    cleanSheets: 2, points: 17,
  },
  {
    clubId: 'bam', clubName: 'Bamboutos', clubShort: 'BAM',
    matchesPlayed: 18, wins: 3, draws: 5, losses: 10,
    goalsFor: 12, goalsAgainst: 28, goalDifference: -16,
    shots: 98, shotsOnTarget: 36, possession: 38,
    yellowCards: 45, redCards: 5, penaltiesFor: 2, penaltiesAgainst: 7,
    cleanSheets: 1, points: 14,
  },
];