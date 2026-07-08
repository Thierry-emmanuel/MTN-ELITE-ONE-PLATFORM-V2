// ─── Match Center fallback generators ─────────────────────────────────────────
// WHY: mirrors the deterministic-placeholder pattern already used for xG in
// MatchRow.tsx. Used only when the backend has no stats/lineups/H2H recorded
// yet for a given match — never overrides real API data.

import type {
  Match, MatchStatsResponse, MatchLineups, HeadToHead, LineupPlayer, TeamMatchStats,
} from '../types/football.types';

function seedFromId(id: string | number): number {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function rand(seed: number, salt: number): number {
  const x = Math.sin(seed + salt * 999) * 10000;
  return x - Math.floor(x);
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function buildFallbackStats(match: Match): MatchStatsResponse {
  const seed = seedFromId(match.id);
  const hs = match.homeScore ?? 0;
  const as_ = match.awayScore ?? 0;

  const possession = 42 + Math.round(rand(seed, 1) * 16); // 42-58, home share
  const homeShotBias = hs >= as_ ? 1.15 : 0.9;

  const build = (side: 'home' | 'away', goals: number, bias: number): TeamMatchStats => {
    const salt = side === 'home' ? 2 : 3;
    const shots = Math.max(goals + 2, Math.round((8 + rand(seed, salt) * 9) * bias));
    const onTarget = Math.min(shots, Math.max(goals, Math.round(shots * (0.35 + rand(seed, salt + 10) * 0.2))));
    return {
      shots,
      shotsOnTarget: onTarget,
      corners: Math.round(2 + rand(seed, salt + 1) * 7),
      fouls: Math.round(6 + rand(seed, salt + 2) * 9),
      offsides: Math.round(rand(seed, salt + 3) * 4),
      yellowCards: Math.round(rand(seed, salt + 4) * 4),
      redCards: rand(seed, salt + 5) > 0.93 ? 1 : 0,
      passes: Math.round(280 + rand(seed, salt + 6) * 260),
      passAccuracy: Math.round(72 + rand(seed, salt + 7) * 18),
      saves: Math.round(1 + rand(seed, salt + 8) * 5),
    };
  };

  return {
    home: { possession, ...build('home', hs, homeShotBias) },
    away: { possession: 100 - possession, ...build('away', as_, 2 - homeShotBias) },
  };
}

// ─── Lineups ──────────────────────────────────────────────────────────────────

const FORMATIONS = ['4-2-3-1', '4-3-3', '4-4-2', '3-5-2', '4-1-4-1'];

const FORMATION_SLOTS: Record<string, { x: number; y: number }[]> = {
  '4-2-3-1': [
    { x: 50, y: 5 },
    { x: 15, y: 22 }, { x: 38, y: 20 }, { x: 62, y: 20 }, { x: 85, y: 22 },
    { x: 32, y: 42 }, { x: 68, y: 42 },
    { x: 18, y: 62 }, { x: 50, y: 58 }, { x: 82, y: 62 },
    { x: 50, y: 80 },
  ],
  '4-3-3': [
    { x: 50, y: 5 },
    { x: 15, y: 22 }, { x: 38, y: 20 }, { x: 62, y: 20 }, { x: 85, y: 22 },
    { x: 26, y: 45 }, { x: 50, y: 42 }, { x: 74, y: 45 },
    { x: 18, y: 75 }, { x: 50, y: 80 }, { x: 82, y: 75 },
  ],
  '4-4-2': [
    { x: 50, y: 5 },
    { x: 15, y: 22 }, { x: 38, y: 20 }, { x: 62, y: 20 }, { x: 85, y: 22 },
    { x: 15, y: 50 }, { x: 38, y: 46 }, { x: 62, y: 46 }, { x: 85, y: 50 },
    { x: 38, y: 78 }, { x: 62, y: 78 },
  ],
  '3-5-2': [
    { x: 50, y: 5 },
    { x: 25, y: 22 }, { x: 50, y: 18 }, { x: 75, y: 22 },
    { x: 10, y: 45 }, { x: 32, y: 46 }, { x: 50, y: 42 }, { x: 68, y: 46 }, { x: 90, y: 45 },
    { x: 38, y: 78 }, { x: 62, y: 78 },
  ],
  '4-1-4-1': [
    { x: 50, y: 5 },
    { x: 15, y: 22 }, { x: 38, y: 20 }, { x: 62, y: 20 }, { x: 85, y: 22 },
    { x: 50, y: 38 },
    { x: 15, y: 55 }, { x: 38, y: 52 }, { x: 62, y: 52 }, { x: 85, y: 55 },
    { x: 50, y: 80 },
  ],
};

const posBySlotIndex = (formation: string, i: number): string => {
  if (i === 0) return 'GK';
  const slots = FORMATION_SLOTS[formation]?.length ?? 11;
  if (i <= 4 && slots >= 8) return 'DF';
  if (i >= slots - 2) return 'FW';
  return 'MF';
};

function buildTeamLineup(clubName: string, seed: number, salt: number) {
  const formation = FORMATIONS[Math.floor(rand(seed, salt) * FORMATIONS.length)];
  const slots = FORMATION_SLOTS[formation];
  const initials = clubName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const players: LineupPlayer[] = slots.map((pos, i) => ({
    playerId: `${clubName}-xi-${i}`,
    name: `Joueur ${initials}${i + 1}`,
    shirtNumber: i === 0 ? 1 : Math.round(2 + rand(seed, salt + i) * 27),
    position: posBySlotIndex(formation, i),
    isCaptain: i === 6,
    x: pos.x,
    y: pos.y,
  }));

  const subs: LineupPlayer[] = Array.from({ length: 7 }, (_, i) => ({
    playerId: `${clubName}-sub-${i}`,
    name: `Remplaçant ${initials}${i + 1}`,
    shirtNumber: Math.round(12 + rand(seed, salt + 20 + i) * 20),
    position: ['GK', 'DF', 'MF', 'FW'][Math.floor(rand(seed, salt + 40 + i) * 4)],
  }));

  return { formation, players, subs };
}

export function buildFallbackLineups(match: Match): MatchLineups {
  const seed = seedFromId(match.id);
  const home = buildTeamLineup(match.homeClub.short || match.homeClub.name, seed, 5);
  const away = buildTeamLineup(match.awayClub.short || match.awayClub.name, seed, 55);

  return {
    home: { formation: home.formation, startXI: home.players, substitutes: home.subs },
    away: { formation: away.formation, startXI: away.players, substitutes: away.subs },
    confirmed: false,
  };
}

// ─── Head-to-head ─────────────────────────────────────────────────────────────

export function buildFallbackHeadToHead(match: Match): HeadToHead {
  const seed = seedFromId(match.id);
  const count = 3 + Math.floor(rand(seed, 60) * 3);
  let homeWins = 0, draws = 0, awayWins = 0, homeGoals = 0, awayGoals = 0;

  const meetings = Array.from({ length: count }, (_, i) => {
    const salt = 70 + i;
    const hg = Math.floor(rand(seed, salt) * 4);
    const ag = Math.floor(rand(seed, salt + 1) * 4);
    const swapped = i % 2 === 1;
    const homeClub = swapped ? match.awayClub : match.homeClub;
    const awayClub = swapped ? match.homeClub : match.awayClub;
    const homeScore = swapped ? ag : hg;
    const awayScore = swapped ? hg : ag;

    if (homeScore === awayScore) draws++;
    else if ((homeScore > awayScore) === !swapped) homeWins++;
    else awayWins++;

    if (!swapped) { homeGoals += homeScore; awayGoals += awayScore; }
    else { homeGoals += awayScore; awayGoals += homeScore; }

    const monthsAgo = (i + 1) * 7;
    const date = new Date(match.kickoffUtc);
    date.setMonth(date.getMonth() - monthsAgo);

    return {
      id: `${match.id}-h2h-${i}`,
      kickoffUtc: date.toISOString(),
      homeClub, awayClub, homeScore, awayScore,
    };
  });

  return {
    summary: { played: count, homeWins, draws, awayWins, homeGoals, awayGoals },
    meetings,
  };
}
