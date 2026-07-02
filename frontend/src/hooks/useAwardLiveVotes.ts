import { useEffect } from 'react';
import { getSocket } from '@/services/socket';

interface VoteUpdatedPayload { awardId: number; nominationId: number; voteCount: number }
interface AwardStatusPayload { awardId: number; status: string; winnerId?: number | null }

/**
 * Subscribes to live tally + status events for a single award (BF-06.3).
 * Pass `null` for awardId to stay unsubscribed (e.g. no award selected).
 * Callbacks fire with the raw payload — caller decides how to merge it
 * into local state, since admin (full nomination list) and public
 * (VotingPanel bar chart) shape their state differently.
 */
export function useAwardLiveVotes(
  awardId: number | null | undefined,
  onVoteUpdate: (payload: VoteUpdatedPayload) => void,
  onStatusChange?: (payload: AwardStatusPayload) => void,
) {
  useEffect(() => {
    if (!awardId) return;
    const socket = getSocket();

    socket.emit('join_award', awardId);

    const handleVote = (payload: VoteUpdatedPayload) => {
      if (payload.awardId === awardId) onVoteUpdate(payload);
    };
    const handleStatus = (payload: AwardStatusPayload) => {
      if (payload.awardId === awardId) onStatusChange?.(payload);
    };

    socket.on('vote_updated', handleVote);
    socket.on('award_status_changed', handleStatus);

    return () => {
      socket.emit('leave_award', awardId);
      socket.off('vote_updated', handleVote);
      socket.off('award_status_changed', handleStatus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awardId]);
}