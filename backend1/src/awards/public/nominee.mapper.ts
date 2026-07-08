import { Player } from '../../players/player.entity';
import { Club } from '../../clubs/club.entity';
import { Coach } from '../../coaches/coach.entity';
import { PlayerStats } from '../../players/player-stats.entity';
import { Standing } from '../../standings/standing.entity';

const fullName = (p: Player) => p.nickname || `${p.firstName} ${p.lastName}`;
const age = (birthDate?: Date | null) =>
  birthDate ? Math.floor((Date.now() - new Date(birthDate).getTime()) / 3.15576e10) : undefined;

/** Picks the most relevant stat to headline a player card for a given award category. */
function highlightFor(category: string, stats: PlayerStats | undefined) {
  if (!stats) return { label: 'Note', value: '—' };
  if (category === 'TOP_SCORER' || category.startsWith('GOAL_OF')) return { label: 'Buts', value: stats.goals };
  if (category === 'TOP_ASSIST') return { label: 'Passes D.', value: stats.assists };
  if (category === 'BEST_GOALKEEPER') return { label: 'Clean sheets', value: stats.cleanSheets };
  return { label: 'Note moy.', value: stats.avgRating ? Number(stats.avgRating).toFixed(1) : '—' };
}

export function buildPlayerNominee(player: Player, category: string, stats?: PlayerStats) {
  return {
    id: '',
    type: 'PLAYER' as const,
    name: fullName(player),
    photoUrl: player.photoUrl || undefined,
    clubId: String(player.clubId ?? ''),
    clubName: player.club?.name ?? '',
    clubLogoUrl: player.club?.logoUrl || undefined,
    position: player.position,
    nationality: player.nationality,
    age: age(player.birthDate),
    stats: {
      goals: stats?.goals ?? 0,
      assists: stats?.assists ?? 0,
      minutesPlayed: stats?.minutesPlayed ?? 0,
      appearances: stats?.appearances ?? 0,
      cleanSheets: stats?.cleanSheets ?? 0,
      rating: stats?.avgRating ? Number(stats.avgRating) : undefined,
      keyPasses: stats?.keyPasses ?? 0,
    },
    highlightStat: highlightFor(category, stats),
  };
}

export function buildTeamNominee(club: Club, standing?: Standing) {
  return {
    id: '',
    type: 'TEAM' as const,
    name: club.name,
    logoUrl: club.logoUrl || undefined,
    city: club.city,
    coach: '',
    stats: {
      wins: standing?.won ?? 0,
      draws: standing?.drawn ?? 0,
      losses: standing?.lost ?? 0,
      goalsFor: standing?.goalsFor ?? 0,
      goalsAgainst: standing?.goalsAgainst ?? 0,
      points: standing?.points ?? 0,
    },
    highlightStat: { label: 'Points', value: standing?.points ?? 0 },
  };
}

export function buildCoachNominee(coach: Coach, standing?: Standing) {
  const played = (standing?.won ?? 0) + (standing?.drawn ?? 0) + (standing?.lost ?? 0);
  const winRate = played > 0 ? Math.round(((standing?.won ?? 0) / played) * 100) : 0;
  return {
    id: '',
    type: 'COACH' as const,
    name: `${coach.firstName} ${coach.lastName}`,
    photoUrl: coach.photoUrl || undefined,
    clubId: String(coach.clubId ?? ''),
    clubName: coach.club?.name ?? '',
    clubLogoUrl: coach.club?.logoUrl || undefined,
    nationality: coach.nationality,
    stats: { wins: standing?.won ?? 0, winRate, goalsScored: standing?.goalsFor ?? 0 },
    highlightStat: { label: 'Victoires', value: standing?.won ?? 0 },
  };
}

export interface VoteTally { id: number; voteCount: number }

/** Shared vote tally → VoteResults transform used by awards, the leaderboard
 *  endpoint and the Ballon d'Or ranking. Ties keep insertion order (lowest
 *  nomination id first), matching AwardsService.closeAward's tie-break. */
export function tallyToVoteResults(rows: VoteTally[]) {
  const totalVotes = rows.reduce((n, r) => n + r.voteCount, 0);
  const sorted = [...rows].sort((a, b) => b.voteCount - a.voteCount || a.id - b.id);
  const results = sorted.map((r, i) => ({
    nomineeId: String(r.id),
    votes: r.voteCount,
    percentage: totalVotes > 0 ? Number(((r.voteCount / totalVotes) * 100).toFixed(1)) : 0,
    trending: 'STABLE' as const,
    rank: i + 1,
  }));
  return { totalVotes, results };
}
