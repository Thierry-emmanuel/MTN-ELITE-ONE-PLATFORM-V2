import { Award, AwardStatus } from '../entities/award.entity';
import { AwardNomination, NomineeType } from '../entities/award-nomination.entity';
import { PlayerStats } from '../../players/player-stats.entity';
import { Standing } from '../../standings/standing.entity';
import { metaFor } from '../award-meta';
import { buildPlayerNominee, buildTeamNominee, buildCoachNominee, tallyToVoteResults } from './nominee.mapper';

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function formatPeriod(category: string, start: Date, end: Date) {
  if (category.endsWith('SEASON') || category === 'BALLON_DOR') return 'Saison entière';
  if (category.endsWith('MONTH')) return `${MONTHS[new Date(start).getMonth()]} ${new Date(start).getFullYear()}`;
  return `${new Date(start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${new Date(end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
}

function votingStatusOf(award: Award): 'OPEN' | 'CLOSED' | 'ANNOUNCED' | 'UPCOMING' {
  if (award.status === AwardStatus.ANNOUNCED) return 'ANNOUNCED';
  if (award.status === AwardStatus.OPEN) return 'OPEN';
  return new Date() < new Date(award.periodStart) ? 'UPCOMING' : 'CLOSED';
}

/** Resolves one nomination row (whichever FK is set) into a Nominee DTO. */
function nomineeOf(
  n: AwardNomination,
  category: string,
  statsByPlayer: Map<number, PlayerStats>,
  standingByClub: Map<number, Standing>,
) {
  let nominee: any = null;
  if (n.nomineeType === NomineeType.PLAYER && n.player) {
    nominee = buildPlayerNominee(n.player, category, statsByPlayer.get(n.player.id));
  } else if (n.nomineeType === NomineeType.TEAM && n.team) {
    nominee = buildTeamNominee(n.team, standingByClub.get(n.team.id));
  } else if (n.nomineeType === NomineeType.COACH && n.coach) {
    nominee = buildCoachNominee(n.coach, n.coach.clubId ? standingByClub.get(n.coach.clubId) : undefined);
  }
  if (nominee) nominee.id = String(n.id);
  return nominee;
}

/** The underlying entity id (player/team/coach) that Award.winnerId points
 *  at, matching AwardsService.closeAward's generic write. */
function underlyingId(n: AwardNomination): number | null {
  return n.playerId ?? n.teamId ?? n.coachId ?? null;
}

export function buildPublicAward(
  award: Award,
  statsByPlayer: Map<number, PlayerStats>,
  standingByClub: Map<number, Standing>,
) {
  const meta = metaFor(award.category);
  const nominees = award.nominations
    .map((n) => nomineeOf(n, award.category, statsByPlayer, standingByClub))
    .filter(Boolean);

  const { totalVotes, results } = tallyToVoteResults(award.nominations.map((n) => ({ id: n.id, voteCount: n.voteCount })));
  const winningNomination = award.winnerId != null ? award.nominations.find((n) => underlyingId(n) === award.winnerId) : undefined;
  const winner = winningNomination ? nomineeOf(winningNomination, award.category, statsByPlayer, standingByClub) : undefined;

  return {
    id: String(award.id),
    category: award.category,
    type: meta.type,
    title: meta.label,
    subtitle: meta.subtitle,
    description: meta.description,
    period: formatPeriod(award.category, award.periodStart, award.periodEnd),
    season: award.season?.name ?? '',
    votingStatus: votingStatusOf(award),
    votingDeadline: award.periodEnd?.toISOString?.() ?? award.periodEnd,
    nominees,
    winner,
    voteResults: { awardId: String(award.id), totalVotes, results, lastUpdated: new Date().toISOString() },
    fanVotingEnabled: meta.fanVoteWeight > 0,
    fanVoteWeight: meta.fanVoteWeight,
    juryVoteWeight: meta.juryVoteWeight,
    trophyColor: meta.trophyColor,
  };
}
