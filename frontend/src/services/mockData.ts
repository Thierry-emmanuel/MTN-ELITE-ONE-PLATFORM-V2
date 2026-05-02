import type { MatchDay, ApiStanding, ApiClub } from './api';

// ─── Real Season ID from backend ─────────────────────────────────────────────
export const DEV_SEASON_ID = 'af186791-3804-488d-8070-8008966cae19';

// ─── Mock clubs matching the real 14 MTN Elite One clubs ─────────────────────
const mkClub = (
  id: string, name: string, city: string, stadium: string,
  logoUrl: string | null, primaryColor: string | null,
  secondaryColor: string | null = null
): ApiClub => ({ id, name, city, stadium, logoUrl, primaryColor, secondaryColor });

export const MOCK_CLUBS: Record<string, ApiClub> = {
  canon:    mkClub('canon',    'Canon de Yaoundé',              'Yaoundé',      'Stade Omnisports Ahmadou Ahidjo', 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634499/Canon_logo_pis9yd.png',           '#006B3F', '#FFFFFF'),
  coton:    mkClub('coton',    'Cotonsport de Garoua',          'Garoua',       'Stade Roumdé Adjia',              'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634501/Cotonsport_logo_lw3qcr.png',      '#0032A0', '#FFFFFF'),
  gazelle:  mkClub('gazelle',  'Gazelle FA',                    'Garoua',       'Stade Roumdé Adjia',              'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634501/gazelle_nrjv3m.png',              '#FF6600', '#000000'),
  pwd:      mkClub('pwd',      'PWD Bamenda',                   'Bamenda',      'Stade Municipal de Bamenda',      'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634506/Pwd_logo_msti8z.png',              '#CC0000', '#000000'),
  victoria: mkClub('victoria', 'Victoria United',               'Limbe',        'Stade Omnisports de Limbe',       'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634506/victoria_logo_u2r0zi.png',         '#003087', '#FFD700'),
  menoua:   mkClub('menoua',   'Aigle Royal de la Menoua',      'Dschang',      'Stade Municipal de Dschang',      'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634506/Menoua_logo_ahmld5.png',           '#8B0000', '#FFD700'),
  moungo:   mkClub('moungo',   'Aigle Royale du Moungo',        'Nkongsamba',   'Stade Municipal de Nkongsamba',   'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634499/Aigle_Moungo_logo_ahtn7h.png',     '#1A1A6E', '#FFD700'),
  fauve:    mkClub('fauve',    'Fauve Azur',                    'Douala',       'Stade de la Réunification',       'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634502/fauve_logo_ysdm6n.png',            '#007FFF', '#FFFFFF'),
  dynamo:   mkClub('dynamo',   'Dynamo de Douala',              'Douala',       'Stade de la Réunification',       'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634502/dynamo_douala_paefrn.png',         '#FF0000', '#FFFFFF'),
  panthere: mkClub('panthere', 'Panthère Sportive du Ndé',      'Bangangté',    'Stade Municipal de Bangangté',    'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634504/panthere_logo_bsynqk.png',         '#006400', '#FFD700'),
  unisport: mkClub('unisport', 'Unisport de Bafang',            'Bafang',       'Stade Municipal de Bafang',       'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634506/Uniisport_bafang_logo_u44xjx.png', '#FF4500', '#000000'),
  renard:   mkClub('renard',   'Stade Renard de Melong',        'Melong',       'Stade Municipal de Melong',       'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634505/renard_logo_ndxjqe.png',           '#8B4513', '#FFFFFF'),
  fortuna:  mkClub('fortuna',  'AS Fortuna',                    'Bafang',       'Stade Municipal de Bafang',       'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634501/fortuna_logo_x8gcu9.png',          '#800080', '#FFD700'),
  colombe:  mkClub('colombe',  'Colombe Sportive du Dja et Lobo','Sangmélima',  'Stade Municipal de Sangmélima',   'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634499/colombe_logo_qki9re.png',          '#FFFFFF', '#006B3F'),
};

const { canon, coton, gazelle, pwd, victoria, menoua, moungo, fauve, dynamo, panthere, unisport, renard, fortuna, colombe } = MOCK_CLUBS;

// ─── Mock fixtures ────────────────────────────────────────────────────────────
export const MOCK_FIXTURES: MatchDay[] = [
  {
    date: '2026-05-03', round: 19,
    matches: [
      { id: 'f1', round: 19, scheduledAt: '2026-05-03T15:00:00Z', status: 'SCHEDULED', homeScore: null, awayScore: null, venue: 'Stade Omnisports Ahmadou Ahidjo', city: 'Yaoundé',    homeClub: canon,    awayClub: coton    },
      { id: 'f2', round: 19, scheduledAt: '2026-05-03T17:30:00Z', status: 'SCHEDULED', homeScore: null, awayScore: null, venue: 'Stade Municipal de Bamenda',      city: 'Bamenda',    homeClub: pwd,      awayClub: gazelle  },
      { id: 'f3', round: 19, scheduledAt: '2026-05-03T15:00:00Z', status: 'LIVE',      homeScore: 1,   awayScore: 0,   venue: 'Stade de la Réunification',       city: 'Douala',     homeClub: fauve,    awayClub: dynamo   },
    ],
  },
  {
    date: '2026-05-04', round: 19,
    matches: [
      { id: 'f4', round: 19, scheduledAt: '2026-05-04T15:00:00Z', status: 'SCHEDULED', homeScore: null, awayScore: null, venue: 'Stade Omnisports de Limbe',       city: 'Limbe',      homeClub: victoria, awayClub: menoua   },
      { id: 'f5', round: 19, scheduledAt: '2026-05-04T17:00:00Z', status: 'SCHEDULED', homeScore: null, awayScore: null, venue: 'Stade Municipal de Sangmélima',   city: 'Sangmélima', homeClub: colombe,  awayClub: fortuna  },
      { id: 'f6', round: 19, scheduledAt: '2026-05-04T15:00:00Z', status: 'SCHEDULED', homeScore: null, awayScore: null, venue: 'Stade Municipal de Bafang',       city: 'Bafang',     homeClub: unisport, awayClub: panthere },
      { id: 'f7', round: 19, scheduledAt: '2026-05-04T17:30:00Z', status: 'SCHEDULED', homeScore: null, awayScore: null, venue: 'Stade Municipal de Nkongsamba',   city: 'Nkongsamba', homeClub: moungo,   awayClub: renard   },
    ],
  },
  {
    date: '2026-05-10', round: 20,
    matches: [
      { id: 'f8', round: 20, scheduledAt: '2026-05-10T15:00:00Z', status: 'SCHEDULED', homeScore: null, awayScore: null, venue: 'Stade Roumdé Adjia',              city: 'Garoua',     homeClub: coton,    awayClub: canon    },
      { id: 'f9', round: 20, scheduledAt: '2026-05-10T17:30:00Z', status: 'SCHEDULED', homeScore: null, awayScore: null, venue: 'Stade Omnisports de Limbe',       city: 'Limbe',      homeClub: victoria, awayClub: pwd      },
    ],
  },
];

// ─── Mock results ─────────────────────────────────────────────────────────────
export const MOCK_RESULTS: MatchDay[] = [
  {
    date: '2026-04-26', round: 18,
    matches: [
      { id: 'r1', round: 18, scheduledAt: '2026-04-26T15:00:00Z', status: 'FINISHED', homeScore: 2, awayScore: 1,
        venue: 'Stade Omnisports Ahmadou Ahidjo', city: 'Yaoundé', homeClub: canon, awayClub: coton,
        events: [
          { id: 'e1', minute: 23, type: 'GOAL', playerName: 'Bassogog C.', clubId: 'canon' },
          { id: 'e2', minute: 67, type: 'GOAL', playerName: 'Mbarga S.',   clubId: 'canon' },
          { id: 'e3', minute: 82, type: 'GOAL', playerName: 'Yaya I.',     clubId: 'coton' },
        ]},
      { id: 'r2', round: 18, scheduledAt: '2026-04-26T17:30:00Z', status: 'FINISHED', homeScore: 3, awayScore: 0, venue: 'Stade Roumdé Adjia', city: 'Garoua', homeClub: coton, awayClub: pwd,
        events: [
          { id: 'e4', minute: 12, type: 'GOAL', playerName: 'Souaibou A.', clubId: 'coton' },
          { id: 'e5', minute: 44, type: 'GOAL', playerName: 'Souaibou A.', clubId: 'coton' },
          { id: 'e6', minute: 78, type: 'GOAL', playerName: 'Aboubakar V.',clubId: 'coton' },
        ]},
    ],
  },
  {
    date: '2026-04-25', round: 18,
    matches: [
      { id: 'r3', round: 18, scheduledAt: '2026-04-25T15:00:00Z', status: 'FINISHED', homeScore: 1, awayScore: 1, venue: 'Stade Omnisports de Limbe', city: 'Limbe', homeClub: victoria, awayClub: gazelle },
      { id: 'r4', round: 18, scheduledAt: '2026-04-25T17:00:00Z', status: 'FINISHED', homeScore: 2, awayScore: 0, venue: 'Stade Municipal de Dschang', city: 'Dschang', homeClub: menoua, awayClub: moungo },
      { id: 'r5', round: 18, scheduledAt: '2026-04-25T19:00:00Z', status: 'FINISHED', homeScore: 0, awayScore: 2, venue: 'Stade Municipal de Bafang',  city: 'Bafang',  homeClub: unisport, awayClub: fauve },
    ],
  },
  {
    date: '2026-04-19', round: 17,
    matches: [
      { id: 'r6', round: 17, scheduledAt: '2026-04-19T15:00:00Z', status: 'FINISHED', homeScore: 1, awayScore: 0, venue: 'Stade Municipal de Sangmélima', city: 'Sangmélima', homeClub: colombe,  awayClub: fortuna },
      { id: 'r7', round: 17, scheduledAt: '2026-04-19T17:30:00Z', status: 'FINISHED', homeScore: 2, awayScore: 2, venue: 'Stade de la Réunification',    city: 'Douala',     homeClub: dynamo,   awayClub: panthere },
      { id: 'r8', round: 17, scheduledAt: '2026-04-19T15:00:00Z', status: 'FINISHED', homeScore: 0, awayScore: 1, venue: 'Stade Municipal de Melong',    city: 'Melong',     homeClub: renard,   awayClub: canon },
    ],
  },
];

// ─── Mock standings (14 clubs) ────────────────────────────────────────────────
export const MOCK_STANDINGS: ApiStanding[] = [
  { id: 's1',  position: 1,  club: coton,    played: 18, won: 13, drawn: 2, lost: 3,  goalsFor: 38, goalsAgainst: 12, goalDifference:  26, points: 41, formGuide: ['W','W','W','D','W'], homePlayed: 9, homeWon: 7, homeDrawn: 1, homeLost: 1, awayPlayed: 9, awayWon: 6, awayDrawn: 1, awayLost: 2 },
  { id: 's2',  position: 2,  club: canon,    played: 18, won: 11, drawn: 3, lost: 4,  goalsFor: 32, goalsAgainst: 16, goalDifference:  16, points: 36, formGuide: ['W','D','W','W','L'], homePlayed: 9, homeWon: 7, homeDrawn: 1, homeLost: 1, awayPlayed: 9, awayWon: 4, awayDrawn: 2, awayLost: 3 },
  { id: 's3',  position: 3,  club: victoria, played: 18, won: 9,  drawn: 4, lost: 5,  goalsFor: 26, goalsAgainst: 18, goalDifference:   8, points: 31, formGuide: ['L','W','W','D','W'], homePlayed: 9, homeWon: 6, homeDrawn: 2, homeLost: 1, awayPlayed: 9, awayWon: 3, awayDrawn: 2, awayLost: 4 },
  { id: 's4',  position: 4,  club: gazelle,  played: 18, won: 8,  drawn: 5, lost: 5,  goalsFor: 24, goalsAgainst: 18, goalDifference:   6, points: 29, formGuide: ['D','W','L','W','D'], homePlayed: 9, homeWon: 5, homeDrawn: 3, homeLost: 1, awayPlayed: 9, awayWon: 3, awayDrawn: 2, awayLost: 4 },
  { id: 's5',  position: 5,  club: pwd,      played: 18, won: 8,  drawn: 4, lost: 6,  goalsFor: 22, goalsAgainst: 20, goalDifference:   2, points: 28, formGuide: ['W','D','D','L','W'], homePlayed: 9, homeWon: 5, homeDrawn: 2, homeLost: 2, awayPlayed: 9, awayWon: 3, awayDrawn: 2, awayLost: 4 },
  { id: 's6',  position: 6,  club: menoua,   played: 18, won: 7,  drawn: 5, lost: 6,  goalsFor: 21, goalsAgainst: 20, goalDifference:   1, points: 26, formGuide: ['W','W','D','L','W'], homePlayed: 9, homeWon: 5, homeDrawn: 2, homeLost: 2, awayPlayed: 9, awayWon: 2, awayDrawn: 3, awayLost: 4 },
  { id: 's7',  position: 7,  club: fauve,    played: 18, won: 6,  drawn: 5, lost: 7,  goalsFor: 20, goalsAgainst: 22, goalDifference:  -2, points: 23, formGuide: ['L','W','D','W','L'], homePlayed: 9, homeWon: 4, homeDrawn: 3, homeLost: 2, awayPlayed: 9, awayWon: 2, awayDrawn: 2, awayLost: 5 },
  { id: 's8',  position: 8,  club: dynamo,   played: 18, won: 5,  drawn: 6, lost: 7,  goalsFor: 18, goalsAgainst: 22, goalDifference:  -4, points: 21, formGuide: ['D','L','W','D','D'], homePlayed: 9, homeWon: 3, homeDrawn: 4, homeLost: 2, awayPlayed: 9, awayWon: 2, awayDrawn: 2, awayLost: 5 },
  { id: 's9',  position: 9,  club: moungo,   played: 18, won: 5,  drawn: 5, lost: 8,  goalsFor: 17, goalsAgainst: 24, goalDifference:  -7, points: 20, formGuide: ['L','D','W','L','D'], homePlayed: 9, homeWon: 3, homeDrawn: 3, homeLost: 3, awayPlayed: 9, awayWon: 2, awayDrawn: 2, awayLost: 5 },
  { id: 's10', position: 10, club: unisport, played: 18, won: 4,  drawn: 6, lost: 8,  goalsFor: 16, goalsAgainst: 24, goalDifference:  -8, points: 18, formGuide: ['W','L','D','L','L'], homePlayed: 9, homeWon: 3, homeDrawn: 3, homeLost: 3, awayPlayed: 9, awayWon: 1, awayDrawn: 3, awayLost: 5 },
  { id: 's11', position: 11, club: colombe,  played: 18, won: 4,  drawn: 5, lost: 9,  goalsFor: 15, goalsAgainst: 26, goalDifference: -11, points: 17, formGuide: ['L','W','L','D','W'], homePlayed: 9, homeWon: 3, homeDrawn: 2, homeLost: 4, awayPlayed: 9, awayWon: 1, awayDrawn: 3, awayLost: 5 },
  { id: 's12', position: 12, club: panthere, played: 18, won: 3,  drawn: 6, lost: 9,  goalsFor: 14, goalsAgainst: 27, goalDifference: -13, points: 15, formGuide: ['D','L','D','L','D'], homePlayed: 9, homeWon: 2, homeDrawn: 4, homeLost: 3, awayPlayed: 9, awayWon: 1, awayDrawn: 2, awayLost: 6 },
  { id: 's13', position: 13, club: fortuna,  played: 18, won: 3,  drawn: 4, lost: 11, goalsFor: 13, goalsAgainst: 29, goalDifference: -16, points: 13, formGuide: ['L','L','D','L','L'], homePlayed: 9, homeWon: 2, homeDrawn: 2, homeLost: 5, awayPlayed: 9, awayWon: 1, awayDrawn: 2, awayLost: 6 },
  { id: 's14', position: 14, club: renard,   played: 18, won: 2,  drawn: 4, lost: 12, goalsFor: 10, goalsAgainst: 32, goalDifference: -22, points: 10, formGuide: ['L','L','L','D','L'], homePlayed: 9, homeWon: 1, homeDrawn: 3, homeLost: 5, awayPlayed: 9, awayWon: 1, awayDrawn: 1, awayLost: 7 },
];

// ─── Position changes vs previous week ───────────────────────────────────────
export const POSITION_CHANGES: Record<string, number> = {
  coton: 0, canon: 1, victoria: -1, gazelle: 2, pwd: 0,
  menoua: 1, fauve: -1, dynamo: 0, moungo: 1, unisport: -1,
  colombe: 0, panthere: 1, fortuna: -1, renard: 0,
};