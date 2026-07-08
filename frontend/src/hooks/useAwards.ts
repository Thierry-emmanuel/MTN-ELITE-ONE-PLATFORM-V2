import { useEffect, useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { awardsApi, connectAwardsSocket, disconnectAwardsSocket, subscribeToAward, unsubscribeFromAward } from '../services/awardsApi';
import { useAwardsStore, useVotingStore, useRealtimeStore } from '../store/awards.store';
import { MOCK_AWARDS, MOCK_BALLON_DOR, MOCK_TEAM_OF_WEEK } from '../services/mockAwards';
// (no additional type imports needed)

const SEASON_ID = (import.meta.env.VITE_SEASON_ID as string | undefined) ?? 'season-2025-26';

export const AWARD_QK = {
  all:        (season: string) => ['awards', season]   as const,
  one:        (id: string)     => ['award', id]        as const,
  ballonDor:  (year?: number)  => ['ballon-dor', year] as const,
  teamOfWeek: ()               => ['team-of-week']     as const,
  votes:      (id: string)     => ['award-votes', id]  as const,
};

// ─── useAwards ────────────────────────────────────────────────────────────────
export function useAwards() {
  const { setAwards, setLoading, setError, activeType, activeCategory } = useAwardsStore();

  const query = useQuery({
    queryKey: AWARD_QK.all(SEASON_ID),
    queryFn:  async () => { try { return await awardsApi.getAll(SEASON_ID); } catch { return MOCK_AWARDS; } },
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (query.data)    setAwards(query.data);
    if (query.isError) setError('Impossible de charger les récompenses.');
    setLoading(query.isLoading);
  }, [query.data, query.isError, query.isLoading]);

  const filtered = useMemo(() => {
    let list = query.data ?? MOCK_AWARDS;
    if (activeType     !== 'ALL') list = list.filter(a => a.type     === activeType);
    if (activeCategory !== 'ALL') list = list.filter(a => a.category === activeCategory);
    return list;
  }, [query.data, activeType, activeCategory]);

  return { ...query, filtered, data: query.data ?? MOCK_AWARDS };
}

// ─── useAwardDetails ──────────────────────────────────────────────────────────
export function useAwardDetails(awardId: string | null) {
  useEffect(() => {
    if (!awardId) return;
    subscribeToAward(awardId);
  }, [awardId]);

  return useQuery({
    queryKey: AWARD_QK.one(awardId ?? ''),
    queryFn:  async () => { try { return await awardsApi.getById(awardId!); } catch { return MOCK_AWARDS.find(a => a.id === awardId) ?? null; } },
    enabled: !!awardId,
    staleTime: 30_000,
  });
}

// ─── useVoting ────────────────────────────────────────────────────────────────
export function useVoting(awardId: string) {
  const qc = useQueryClient();
  const { castVote, clearPending, setSuccess, hasVoted, getVotedNominee } = useVotingStore();
  const { updateAwardVotes } = useAwardsStore();

  const mutation = useMutation({
    mutationFn: ({ nomineeId }: { nomineeId: string }) => awardsApi.castVote(awardId, nomineeId),
    onMutate: async ({ nomineeId }) => {
      castVote(awardId, nomineeId);
      await qc.cancelQueries({ queryKey: AWARD_QK.votes(awardId) });
      return { snapshot: qc.getQueryData(AWARD_QK.votes(awardId)) };
    },
    onSuccess: (data) => {
      updateAwardVotes(awardId, data.results);
      setSuccess(awardId);
      qc.setQueryData<any[]>(AWARD_QK.all(SEASON_ID), (prev) =>
        prev?.map(a => a.id === awardId ? { ...a, voteResults: data.results } : a) ?? prev,
      );
      qc.invalidateQueries({ queryKey: AWARD_QK.votes(awardId) });
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (_e, _v, ctx) => { if (ctx?.snapshot) qc.setQueryData(AWARD_QK.votes(awardId), ctx.snapshot); },
    onSettled: clearPending,
  });

  return {
    vote:           (nomineeId: string) => mutation.mutate({ nomineeId }),
    isVoting:       mutation.isPending,
    hasVoted:       hasVoted(awardId),
    votedNomineeId: getVotedNominee(awardId),
  };
}

// ─── useRealtimeVotes ─────────────────────────────────────────────────────────
export function useRealtimeVotes() {
  const { connected, liveFeed, totalLiveVotes } = useRealtimeStore();
  const { data: awards } = useAwards();

  useEffect(() => { connectAwardsSocket(); return () => disconnectAwardsSocket(); }, []);

  useEffect(() => {
    const openIds = awards.filter(a => a.votingStatus === 'OPEN').map(a => a.id);
    openIds.forEach(subscribeToAward);
    return () => openIds.forEach(unsubscribeFromAward);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awards]);

  return { connected, liveFeed, totalLiveVotes };
}

// ─── useBallonDor ─────────────────────────────────────────────────────────────
export function useBallonDor(year?: number) {
  const { setBallonDor } = useAwardsStore();
  const query = useQuery({
    queryKey: AWARD_QK.ballonDor(year),
    queryFn:  async () => { try { return await awardsApi.getBallonDor(year); } catch { return MOCK_BALLON_DOR; } },
    staleTime: 120_000,
  });
  useEffect(() => { if (query.data) setBallonDor(query.data); }, [query.data]);
  return { ...query, data: query.data ?? MOCK_BALLON_DOR };
}

// ─── useTeamOfWeek ────────────────────────────────────────────────────────────
export function useTeamOfWeek() {
  const { setTeamOfWeek } = useAwardsStore();
  const query = useQuery({
    queryKey: AWARD_QK.teamOfWeek(),
    queryFn:  async () => { try { return await awardsApi.getTeamOfWeek(); } catch { return MOCK_TEAM_OF_WEEK; } },
    staleTime: 300_000,
  });
  useEffect(() => { if (query.data) setTeamOfWeek(query.data); }, [query.data]);
  return { ...query, data: query.data ?? MOCK_TEAM_OF_WEEK };
}

// ─── useAwardCountdown ────────────────────────────────────────────────────────
export function useAwardCountdown(deadline: string | undefined) {
  const calc = useCallback(() => {
    if (!deadline) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false, urgent: false };
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, urgent: false };
    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000)  / 60000);
    const seconds = Math.floor((diff % 60000)    / 1000);
    return { days, hours, minutes, seconds, expired: false, urgent: diff < 3600000 };
  }, [deadline]);

  const [timeLeft, setTimeLeft] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return timeLeft;
}