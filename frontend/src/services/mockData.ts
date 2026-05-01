import type { MatchDay, ApiStanding, ApiClub } from './api';

// ─── Season ID used in dev ────────────────────────────────────────────────────
export const DEV_SEASON_ID = 'dev-season-2025-26';

// ─── Mock clubs (matches club.entity fields) ──────────────────────────────────
const mkClub = (
  id: string, name: string, city: string, stadium: string,
  logoUrl: string | null, primaryColor: string | null
): ApiClub => ({ id, name, city, stadium, logoUrl, primaryColor, secondaryColor: null });

export const MOCK_CLUBS: Record<string, ApiClub> = {
  cot:  mkClub('cot',  'Coton Sport',    'Garoua',      'Stade Roumdé Adjia',       '/src/assets/images/logo/Cotonsport_logo.png', '#FFD400'),
  cnk:  mkClub('cnk',  'Canon Yaoundé',  'Yaoundé',     'Stade Ahmadou Ahidjo',     '/src/assets/images/logo/Canon_logo.png',       '#CE1126'),
  uds:  mkClub('uds',  'Union Douala',   'Douala',      'Stade de la Réunification','/src/assets/images/logo/dynamo_douala.png',    '#1E3A8A'),
  pwd:  mkClub('pwd',  'PWD Bamenda',    'Bamenda',     'Stade de Bamenda',          '/src/assets/images/logo/Pwd_logo.png',         '#1F8A4C'),
  vict: mkClub('vict', 'Victoria United','Limbe',       'Stade de Limbe',            '/src/assets/images/logo/victoria_logo.png',   '#10B981'),
  apb:  mkClub('apb',  'APEJES Mfou',   'Mfou',        'Stade de Mfou',             '/src/assets/images/logo/Aigle_Moungo_logo.png','#7C3AED'),
  cof:  mkClub('cof',  'Colombe FC',     'Sangmélima',  'Stade Municipal',           '/src/assets/images/logo/colombe_logo.png',     '#FB923C'),
  ymb:  mkClub('ymb',  'Young Sports',   'Bamenda',     'Stade de Bamenda',          '/src/assets/images/logo/fauve_logo.png',       '#0EA5E9'),
  fov:  mkClub('fov',  'Fovu Baham',     'Baham',       'Stade Municipal de Baham',  '/src/assets/images/logo/renard_logo.png',      '#EF4444'),
  bam:  mkClub('bam',  'Bamboutos',      'Mbouda',      'Stade de Mbouda',           '/src/assets/images/logo/panthere_logo.png',    '#A78BFA'),
};

const { cot, cnk, uds, pwd, vict, apb, cof, ymb, fov, bam } = MOCK_CLUBS;

// ─── Mock fixtures grouped by date (MatchDay[]) ───────────────────────────────
export const MOCK_FIXTURES: MatchDay[] = [
  {
    date: '2026-05-03', round: 19,
    matches: [
      { id: 'f1', round: 19, scheduledAt: '2026-05-03T15:00:00Z', status: 'SCHEDULED', homeScore: null, awayScore: null, venue: 'Stade Roumdé Adjia', city: 'Garoua',     homeClub: cot,  awayClub: cnk  },
      { id: 'f2', round: 19, scheduledAt: '2026-05-03T17:30:00Z', status: 'SCHEDULED', homeScore: null, awayScore: null, venue: 'Stade de Bamenda',   city: 'Bamenda',    homeClub: pwd,  awayClub: uds  },
    ],
  },
  {
    date: '2026-05-04', round: 19,
    matches: [
      { id: 'f3', round: 19, scheduledAt: '2026-05-04T13:30:00Z', status: 'SCHEDULED', homeScore: null, awayScore: null, venue: 'Stade de Limbe',     city: 'Limbe',      homeClub: vict, awayClub: apb  },
      { id: 'f4', round: 19, scheduledAt: '2026-05-04T15:00:00Z', status: 'LIVE',      homeScore: 1,   awayScore: 0,   venue: 'Stade Municipal',     city: 'Sangmélima', homeClub: cof,  awayClub: fov  },
      { id: 'f5', round: 19, scheduledAt: '2026-05-04T17:00:00Z', status: 'SCHEDULED', homeScore: null, awayScore: null, venue: 'Stade de Mbouda',    city: 'Mbouda',     homeClub: bam,  awayClub: ymb  },
    ],
  },
  {
    date: '2026-05-10', round: 20,
    matches: [
      { id: 'f6', round: 20, scheduledAt: '2026-05-10T15:00:00Z', status: 'SCHEDULED', homeScore: null, awayScore: null, venue: 'Stade Ahmadou Ahidjo',city: 'Yaoundé',  homeClub: cnk,  awayClub: vict },
      { id: 'f7', round: 20, scheduledAt: '2026-05-10T17:30:00Z', status: 'SCHEDULED', homeScore: null, awayScore: null, venue: 'Stade Roumdé Adjia', city: 'Garoua',    homeClub: cot,  awayClub: pwd  },
    ],
  },
];

// ─── Mock results grouped by date ────────────────────────────────────────────
export const MOCK_RESULTS: MatchDay[] = [
  {
    date: '2026-04-26', round: 18,
    matches: [
      { id: 'r1', round: 18, scheduledAt: '2026-04-26T15:00:00Z', status: 'FINISHED', homeScore: 2, awayScore: 1, venue: 'Stade Ahmadou Ahidjo', city: 'Yaoundé',  homeClub: cnk, awayClub: uds,
        events: [
          { id: 'e1', minute: 23, type: 'GOAL', playerName: 'Bassogog', clubId: 'cnk' },
          { id: 'e2', minute: 67, type: 'GOAL', playerName: 'Mbarga',   clubId: 'cnk' },
          { id: 'e3', minute: 82, type: 'GOAL', playerName: 'Etame',    clubId: 'uds' },
        ]},
      { id: 'r2', round: 18, scheduledAt: '2026-04-26T17:30:00Z', status: 'FINISHED', homeScore: 3, awayScore: 0, venue: 'Stade Roumdé Adjia',    city: 'Garoua',   homeClub: cot, awayClub: pwd  },
    ],
  },
  {
    date: '2026-04-25', round: 18,
    matches: [
      { id: 'r3', round: 18, scheduledAt: '2026-04-25T15:00:00Z', status: 'FINISHED', homeScore: 1, awayScore: 1, venue: 'Stade de Limbe',         city: 'Limbe',    homeClub: vict, awayClub: fov  },
      { id: 'r4', round: 18, scheduledAt: '2026-04-25T17:00:00Z', status: 'FINISHED', homeScore: 0, awayScore: 2, venue: 'Stade de Mfou',          city: 'Mfou',     homeClub: apb,  awayClub: ymb  },
      { id: 'r5', round: 18, scheduledAt: '2026-04-25T19:00:00Z', status: 'FINISHED', homeScore: 2, awayScore: 2, venue: 'Stade Municipal',         city: 'Sangmélima',homeClub: cof, awayClub: bam  },
    ],
  },
  {
    date: '2026-04-19', round: 17,
    matches: [
      { id: 'r6', round: 17, scheduledAt: '2026-04-19T15:00:00Z', status: 'FINISHED', homeScore: 4, awayScore: 1, venue: 'Stade Roumdé Adjia',    city: 'Garoua',   homeClub: cot,  awayClub: cof  },
      { id: 'r7', round: 17, scheduledAt: '2026-04-19T17:30:00Z', status: 'FINISHED', homeScore: 1, awayScore: 0, venue: 'Stade de Bamenda',       city: 'Bamenda',  homeClub: pwd,  awayClub: bam  },
    ],
  },
];

// ─── Mock standings ───────────────────────────────────────────────────────────
export const MOCK_STANDINGS: ApiStanding[] = [
  { id: 's1', position: 1, club: cot,  played: 18, won: 12, drawn: 2, lost: 4, goalsFor: 35, goalsAgainst: 13, goalDifference: 22, points: 38, formGuide: ['W','W','D','W','W'] },
  { id: 's2', position: 2, club: cnk,  played: 18, won: 10, drawn: 4, lost: 4, goalsFor: 29, goalsAgainst: 15, goalDifference: 14, points: 34, formGuide: ['W','D','W','W','L'] },
  { id: 's3', position: 3, club: uds,  played: 18, won: 9,  drawn: 4, lost: 5, goalsFor: 26, goalsAgainst: 15, goalDifference: 11, points: 31, formGuide: ['L','W','W','D','W'] },
  { id: 's4', position: 4, club: pwd,  played: 18, won: 8,  drawn: 5, lost: 5, goalsFor: 23, goalsAgainst: 15, goalDifference:  8, points: 29, formGuide: ['D','W','L','W','D'] },
  { id: 's5', position: 5, club: vict, played: 18, won: 7,  drawn: 6, lost: 5, goalsFor: 20, goalsAgainst: 15, goalDifference:  5, points: 27, formGuide: ['W','D','D','L','W'] },
  { id: 's6', position: 6, club: apb,  played: 18, won: 6,  drawn: 6, lost: 6, goalsFor: 18, goalsAgainst: 16, goalDifference:  2, points: 24, formGuide: ['L','W','D','W','L'] },
  { id: 's7', position: 7, club: cof,  played: 18, won: 5,  drawn: 7, lost: 6, goalsFor: 17, goalsAgainst: 18, goalDifference: -1, points: 22, formGuide: ['D','D','W','L','D'] },
  { id: 's8', position: 8, club: ymb,  played: 18, won: 4,  drawn: 8, lost: 6, goalsFor: 15, goalsAgainst: 18, goalDifference: -3, points: 20, formGuide: ['L','L','W','D','W'] },
  { id: 's9', position: 9, club: fov,  played: 18, won: 3,  drawn: 7, lost: 8, goalsFor: 13, goalsAgainst: 22, goalDifference: -9, points: 16, formGuide: ['L','D','L','W','L'] },
  { id:'s10', position:10, club: bam,  played: 18, won: 2,  drawn: 5, lost:11, goalsFor: 11, goalsAgainst: 30, goalDifference:-19, points: 11, formGuide: ['L','L','D','L','L'] },
];

// Simulated position changes vs previous week
export const POSITION_CHANGES: Record<string, number> = {
  cot: 0, cnk: 1, uds: -1, pwd: 2, vict: 0, apb: -2, cof: 1, ymb: -1, fov: 0, bam: 0,
};