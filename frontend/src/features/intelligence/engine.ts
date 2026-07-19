/**
 * Football Intelligence engine — PURE derivation functions.
 * Inputs are backend aggregates (standings, stats, matches); outputs are
 * INSIGHTS (races, momentum, projections). Nothing here recomputes a number
 * the backend owns — points, goals and tables arrive already calculated
 * (with the competition's configured points system since Phase 5).
 */
import type { MatchRow, PlayerStatRow, ScorerRow, StandingRow } from './intelligence.api';

export const nameOf = (r: { playerName?: string; firstName?: string; lastName?: string }) =>
  r.playerName ?? [r.firstName, r.lastName].filter(Boolean).join(' ') ?? '—';

export const minutesOf = (r: PlayerStatRow) => Number(r.minutes ?? r.minutesPlayed ?? 0);

// ── Competition ─────────────────────────────────────────────────────────────

/**
 * Title race. A club is mathematically alive while
 *   leaderPoints − clubPoints ≤ remainingMatches × pointsPerWin
 * remaining = totalMatchdays − played (matchdays from SEASON config;
 * pointsPerWin from COMPETITION config — the same value the backend
 * standings engine applies).
 */
export function titleRace(standings: StandingRow[], totalMatchdays: number, pointsPerWin: number) {
  if (standings.length === 0) return { leader: undefined, contenders: [] as (StandingRow & { gap: number; maxPoints: number })[] };
  const leader = standings[0];
  const contenders = standings.map((s) => {
    const remaining = Math.max(0, totalMatchdays - s.played);
    return { ...s, gap: leader.points - s.points, maxPoints: s.points + remaining * pointsPerWin };
  }).filter((s) => s.maxPoints >= leader.points);
  return { leader, contenders };
}

/** Relegation battle: the drop zone plus every club within one win of it. */
export function relegationBattle(standings: StandingRow[], zoneSize: number, pointsPerWin: number) {
  if (standings.length <= zoneSize) return { zone: standings, threatened: [] as StandingRow[] };
  const zone = standings.slice(-zoneSize);
  const safeLine = zone[0]?.points ?? 0;
  const threatened = standings
    .slice(0, standings.length - zoneSize)
    .filter((s) => s.points - safeLine <= pointsPerWin);
  return { zone, threatened, safeLine };
}

/** Golden Boot projection: currentGoals ÷ played × totalMatchdays (pace). */
export function bootProjection(row: ScorerRow, totalMatchdays: number) {
  const played = Number(row.matches ?? row.played ?? 0);
  const goals = Number(row.goals ?? 0);
  return played > 0 ? Math.round((goals / played) * totalMatchdays * 10) / 10 : goals;
}

/** Fair play: composed from per-player card aggregates, grouped by club.
 *  Score = yellows + 3 × reds (lower is better). */
export function fairPlayTable(players: PlayerStatRow[]) {
  const byClub = new Map<string, { club: string; yellows: number; reds: number }>();
  for (const p of players) {
    const club = p.clubName ?? `Club ${p.clubId ?? '?'}`;
    const acc = byClub.get(club) ?? { club, yellows: 0, reds: 0 };
    acc.yellows += Number(p.yellowCards ?? 0);
    acc.reds += Number(p.redCards ?? 0);
    byClub.set(club, acc);
  }
  return [...byClub.values()]
    .map((c) => ({ ...c, score: c.yellows + c.reds * 3 }))
    .sort((a, b) => a.score - b.score);
}

/** Goals per round — the season's scoring pulse. */
export function goalsByRound(matches: MatchRow[]) {
  const rounds = new Map<number, { round: number; goals: number; matches: number }>();
  for (const m of matches.filter((x) => x.status === 'FINISHED')) {
    const acc = rounds.get(m.round) ?? { round: m.round, goals: 0, matches: 0 };
    acc.goals += (m.homeScore ?? 0) + (m.awayScore ?? 0);
    acc.matches += 1;
    rounds.set(m.round, acc);
  }
  return [...rounds.values()].sort((a, b) => a.round - b.round)
    .map((r) => ({ ...r, avg: r.matches ? Math.round((r.goals / r.matches) * 100) / 100 : 0 }));
}

/** Match trends: result split + goal habits across finished matches. */
export function matchTrends(matches: MatchRow[]) {
  const done = matches.filter((m) => m.status === 'FINISHED');
  const n = done.length || 1;
  let home = 0, draw = 0, away = 0, goals = 0, over25 = 0, bothScored = 0;
  for (const m of done) {
    const h = m.homeScore ?? 0, a = m.awayScore ?? 0;
    if (h > a) home++; else if (h < a) away++; else draw++;
    goals += h + a;
    if (h + a >= 3) over25++;
    if (h > 0 && a > 0) bothScored++;
  }
  return {
    finished: done.length,
    homePct: Math.round((home / n) * 100), drawPct: Math.round((draw / n) * 100), awayPct: Math.round((away / n) * 100),
    avgGoals: Math.round((goals / n) * 100) / 100,
    over25Pct: Math.round((over25 / n) * 100), bothScoredPct: Math.round((bothScored / n) * 100),
  };
}

/** Referee insights: workload + goal environment per official (from the
 *  referee recorded on each match — Phase 3 Officials field). */
export function refereeInsights(matches: MatchRow[]) {
  const map = new Map<string, { referee: string; matches: number; goals: number }>();
  for (const m of matches.filter((x) => x.status === 'FINISHED' && x.referee)) {
    const acc = map.get(m.referee!) ?? { referee: m.referee!, matches: 0, goals: 0 };
    acc.matches += 1;
    acc.goals += (m.homeScore ?? 0) + (m.awayScore ?? 0);
    map.set(m.referee!, acc);
  }
  return [...map.values()]
    .map((r) => ({ ...r, avgGoals: Math.round((r.goals / r.matches) * 100) / 100 }))
    .sort((a, b) => b.matches - a.matches);
}

// ── Club ────────────────────────────────────────────────────────────────────

/**
 * Momentum 0–100: recency-weighted form guide (last 5, newest ×2).
 *   score = Σ pts(result) × weight ÷ Σ 3 × weight, weights [1, 1.25, 1.5, 1.75, 2]
 * Uses the backend-computed formGuide — never re-derived from matches.
 */
export function momentum(formGuide: string[] = []) {
  const weights = [1, 1.25, 1.5, 1.75, 2];
  const recent = formGuide.slice(-5);
  let got = 0, max = 0;
  recent.forEach((res, i) => {
    const w = weights[i + (5 - recent.length)] ?? 1;
    got += (res === 'W' ? 3 : res === 'D' ? 1 : 0) * w;
    max += 3 * w;
  });
  return max ? Math.round((got / max) * 100) : 0;
}

/** Current streak from the backend form guide (e.g. « 3 victoires »). */
export function currentStreak(formGuide: string[] = []) {
  if (formGuide.length === 0) return { type: '—', length: 0 };
  const last = formGuide[formGuide.length - 1];
  let len = 0;
  for (let i = formGuide.length - 1; i >= 0 && formGuide[i] === last; i--) len++;
  return { type: last === 'W' ? 'victoires' : last === 'D' ? 'nuls' : 'défaites', length: len };
}

/** Home vs away: win rates straight from the standing's split columns. */
export function homeAwaySplit(s: StandingRow) {
  const pct = (w: number, p: number) => (p ? Math.round((w / p) * 100) : 0);
  return {
    home: { played: s.homePlayed, winPct: pct(s.homeWon, s.homePlayed), won: s.homeWon, drawn: s.homeDrawn, lost: s.homeLost },
    away: { played: s.awayPlayed, winPct: pct(s.awayWon, s.awayPlayed), won: s.awayWon, drawn: s.awayDrawn, lost: s.awayLost },
  };
}

/** Tactical trends: formation usage frequency from recorded match formations. */
export function formationTrends(matches: MatchRow[], clubId: number) {
  const map = new Map<string, number>();
  for (const m of matches.filter((x) => x.status === 'FINISHED')) {
    const f = m.homeClubId === clubId ? m.homeFormation : m.awayClubId === clubId ? m.awayFormation : null;
    if (f) map.set(f, (map.get(f) ?? 0) + 1);
  }
  return [...map.entries()].map(([formation, count]) => ({ formation, count }))
    .sort((a, b) => b.count - a.count);
}

/** Squad stability: arrivals/departures + current unavailability. */
export function squadStability(
  clubId: number,
  transfers: { fromClubId?: number; toClubId?: number }[],
  injuries: { clubId?: number }[],
) {
  const arrivals = transfers.filter((t) => Number(t.toClubId) === clubId).length;
  const departures = transfers.filter((t) => Number(t.fromClubId) === clubId).length;
  const unavailable = injuries.filter((i) => Number(i.clubId) === clubId).length;
  return { arrivals, departures, churn: arrivals + departures, unavailable };
}

// ── Player ──────────────────────────────────────────────────────────────────

export const age = (birthDate?: string) =>
  birthDate ? Math.floor((Date.now() - new Date(birthDate).getTime()) / 3.15576e10) : undefined;

/**
 * Form Index 0–100: goal contributions per 90 minutes, saturating at 1.5/90
 * (a world-class rate). GK variant credits clean sheets (0.6/90 saturation).
 *   outfield: min(100, (G+A) / (min/90) / 1.5 × 100)
 */
export function formIndex(p: PlayerStatRow) {
  const mins = minutesOf(p);
  if (mins < 90) return 0;
  const per90 = ((Number(p.goals ?? 0) + Number(p.assists ?? 0)) / (mins / 90));
  if ((p.position ?? '').startsWith('G')) {
    const cs90 = Number(p.cleanSheets ?? 0) / (mins / 90);
    return Math.min(100, Math.round((cs90 / 0.6) * 100));
  }
  return Math.min(100, Math.round((per90 / 1.5) * 100));
}

/** Share of the club's goals this player scored or created. */
export function goalContribution(p: PlayerStatRow, clubGoalsFor?: number) {
  const contrib = Number(p.goals ?? 0) + Number(p.assists ?? 0);
  return clubGoalsFor ? Math.min(100, Math.round((contrib / clubGoalsFor) * 100)) : 0;
}

/** Young Talent Watch: U21 players ranked by form index (min. 180 minutes). */
export function youngTalentWatch(stats: PlayerStatRow[], players: { id: number; birthDate?: string }[]) {
  const birth = new Map(players.map((p) => [p.id, p.birthDate]));
  return stats
    .map((s) => ({ ...s, age: age(birth.get(s.playerId)), index: formIndex(s) }))
    .filter((s) => s.age !== undefined && s.age <= 21 && minutesOf(s) >= 180)
    .sort((a, b) => b.index - a.index);
}

/**
 * Road to the Lions: national-team pathway shortlist — Cameroonian players
 * U23 (or any age in the top form decile), ranked by form index.
 */
export function roadToTheLions(stats: PlayerStatRow[], players: { id: number; birthDate?: string; nationality?: string }[]) {
  const meta = new Map(players.map((p) => [p.id, p]));
  return stats
    .map((s) => {
      const m = meta.get(s.playerId);
      return { ...s, age: age(m?.birthDate), nationality: s.nationality ?? m?.nationality, index: formIndex(s) };
    })
    .filter((s) => (s.nationality ?? '').toLowerCase().includes('cameroun') || (s.nationality ?? '').toLowerCase().includes('cameroon'))
    .filter((s) => minutesOf(s) >= 270)
    .sort((a, b) => b.index - a.index)
    .slice(0, 15);
}

/** U21 development metric per club: minutes entrusted to U21 players. */
export function developmentMetrics(stats: PlayerStatRow[], players: { id: number; birthDate?: string }[]) {
  const birth = new Map(players.map((p) => [p.id, p.birthDate]));
  const byClub = new Map<string, { club: string; u21Minutes: number; totalMinutes: number }>();
  for (const s of stats) {
    const club = s.clubName ?? `Club ${s.clubId ?? '?'}`;
    const acc = byClub.get(club) ?? { club, u21Minutes: 0, totalMinutes: 0 };
    const a = age(birth.get(s.playerId));
    const mins = minutesOf(s);
    acc.totalMinutes += mins;
    if (a !== undefined && a <= 21) acc.u21Minutes += mins;
    byClub.set(club, acc);
  }
  return [...byClub.values()]
    .map((c) => ({ ...c, sharePct: c.totalMinutes ? Math.round((c.u21Minutes / c.totalMinutes) * 100) : 0 }))
    .sort((a, b) => b.sharePct - a.sharePct);
}
