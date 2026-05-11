import type { MatchDay, Standing } from '../types/football.types';

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