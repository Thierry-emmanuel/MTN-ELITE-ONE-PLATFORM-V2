import type { MatchDay, Standing, FormResult, StandingsView } from '../types/football';

// ─── MatchDay filtering ───────────────────────────────────────────────────────

export function filterMatchDays(
  days: MatchDay[],
  opts: { round: number | null; clubId: string | null; search: string },
): MatchDay[] {
  const sq = opts.search.trim().toLowerCase();
  return days
    .map(day => ({
      ...day,
      matches: day.matches.filter(m => {
        if (opts.round  !== null && day.round !== opts.round)     return false;
        if (opts.clubId !== null &&
            m.homeClub.id !== opts.clubId &&
            m.awayClub.id !== opts.clubId)                        return false;
        if (sq &&
            !m.homeClub.name.toLowerCase().includes(sq) &&
            !m.awayClub.name.toLowerCase().includes(sq))          return false;
        return true;
      }),
    }))
    .filter(d => d.matches.length > 0);
}

export function extractRounds(days: MatchDay[], order: 'asc' | 'desc' = 'asc'): number[] {
  const rounds = [...new Set(days.map(d => d.round))];
  return rounds.sort((a, b) => order === 'asc' ? a - b : b - a);
}

export function extractClubs(days: MatchDay[]): { id: string; name: string }[] {
  const seen = new Set<string>();
  const out: { id: string; name: string }[] = [];
  days.forEach(d =>
    d.matches.forEach(m => {
      for (const c of [m.homeClub, m.awayClub]) {
        if (!seen.has(c.id)) { seen.add(c.id); out.push({ id: c.id, name: c.name }); }
      }
    }),
  );
  return out.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

// ─── Standings sort ───────────────────────────────────────────────────────────

export function sortStandings(rows: Standing[], view: StandingsView): Standing[] {
  const copy = [...rows];
  switch (view) {
    case 'home':
      return copy.sort((a, b) => {
        const ap = (a.homeWon ?? 0) * 3 + (a.homeDrawn ?? 0);
        const bp = (b.homeWon ?? 0) * 3 + (b.homeDrawn ?? 0);
        return bp - ap;
      });
    case 'away':
      return copy.sort((a, b) => {
        const ap = (a.awayWon ?? 0) * 3 + (a.awayDrawn ?? 0);
        const bp = (b.awayWon ?? 0) * 3 + (b.awayDrawn ?? 0);
        return bp - ap;
      });
    case 'form': {
      const score = (f: FormResult[]) =>
        f.slice(-5).reduce((s, r) => s + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0);
      return copy.sort((a, b) => score(b.formGuide) - score(a.formGuide));
    }
    default:
      return copy.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
  }
}

// ─── Results summary ──────────────────────────────────────────────────────────

export interface ResultsSummary {
  totalMatches: number;
  totalGoals: number;
  avgGoals: string;
  homeWins: number;
  draws: number;
  awayWins: number;
}

export function calcResultsSummary(days: MatchDay[]): ResultsSummary {
  let totalGoals = 0, totalMatches = 0, homeWins = 0, draws = 0, awayWins = 0;
  days.forEach(d =>
    d.matches.forEach(m => {
      totalMatches++;
      const hs = m.homeScore ?? 0, as_ = m.awayScore ?? 0;
      totalGoals += hs + as_;
      if (hs > as_) homeWins++;
      else if (hs === as_) draws++;
      else awayWins++;
    }),
  );
  return {
    totalMatches, totalGoals,
    avgGoals: totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '—',
    homeWins, draws, awayWins,
  };
}

// ─── Date / time formatting ───────────────────────────────────────────────────

export function formatKickoff(utcIso: string): string {
  try {
    return new Date(utcIso).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Douala',
    });
  } catch { return utcIso; }
}

export function formatKickoffDate(utcIso: string): string {
  try {
    return new Date(utcIso).toLocaleDateString('fr-FR', {
      weekday: 'short', day: 'numeric', month: 'long', timeZone: 'Africa/Douala',
    });
  } catch { return utcIso; }
}

// ─── Status label ─────────────────────────────────────────────────────────────

export function statusLabel(status: string, minute?: number): { text: string; isLive: boolean } {
  switch (status) {
    case 'LIVE':        return { text: minute ? `${minute}'` : 'En direct', isLive: true };
    case 'HT':          return { text: 'Mi-temps',     isLive: true };
    case 'FT':          return { text: 'Terminé',      isLive: false };
    case 'POSTPONED':   return { text: 'Reporté',      isLive: false };
    case 'CANCELLED':   return { text: 'Annulé',       isLive: false };
    case 'ABANDONED':   return { text: 'Interrompu',   isLive: false };
    case 'EXTRA_TIME':  return { text: 'Prolongations',isLive: true };
    case 'PENALTIES':   return { text: 'Tirs au but',  isLive: true };
    default:            return { text: status,         isLive: false };
  }
}