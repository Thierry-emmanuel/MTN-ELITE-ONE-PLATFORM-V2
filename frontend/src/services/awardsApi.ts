import { apiClient } from './api';
import { getSocket } from './socket';
import { useRealtimeStore } from '../store/awards.store';
import type {
  Award, BallonDorEdition, TeamOfWeek, VoteResults,
  RealtimeLeaderboardEntry, AwardCategory, HistoricalWinner
} from '../types/awards.types';
import { MOCK_AWARDS, MOCK_BALLON_DOR, MOCK_TEAM_OF_WEEK, MOCK_HISTORICAL } from './mockAwards';

// --- Awards REST API -- talks to AwardsController (/awards/*) ---
// Routes corrected to match the actual backend controller.

export const awardsApi = {
  // Fetches all open (active) awards — used on public-facing pages
  getAll: (season?: string) =>
    apiClient.get<Award[]>('/awards/public', { params: { season } })
      .then(r => r.data)
      .catch(() => MOCK_AWARDS),

  getById: (id: string) =>
    apiClient.get<Award>(`/awards/public/${id}`)
      .then(r => r.data)
      .catch(() => MOCK_AWARDS.find(a => a.id === id) ?? null),

  getByCategory: (category: AwardCategory, season?: string) =>
    apiClient.get<Award[]>('/awards/public', { params: { season } })
      .then(r => r.data.filter((a: Award) => a.category === category))
      .catch(() => MOCK_AWARDS.filter(a => a.category === category)),

  getBallonDor: (year?: number) =>
    apiClient.get<BallonDorEdition>('/awards/public/ballon-dor', { params: { year } })
      .then(r => r.data)
      .catch(() => MOCK_BALLON_DOR),

  getTeamOfWeek: (_period?: string) =>
    apiClient.get<TeamOfWeek>('/awards/public/team-of-week')
      .then(r => r.data)
      .catch(() => MOCK_TEAM_OF_WEEK),

  getVoteResults: (awardId: string) =>
    apiClient.get<VoteResults>(`/awards/public/${awardId}/votes`)
      .then(r => r.data)
      .catch(() => MOCK_AWARDS.find(a => a.id === awardId)?.voteResults ?? null),

  // nomineeId is the nomination id (number as string) from Award.nominations[].id
  castVote: async (awardId: string, nomineeId: string) => {
    try {
      return await apiClient.post<{ success: boolean; results: VoteResults }>(
        `/awards/public/${awardId}/vote`,
        { nomineeId },
      ).then(r => r.data);
    } catch (e) {
      console.warn('Backend vote failed, simulating mock vote locally.', e);
      const award = MOCK_AWARDS.find(a => a.id === awardId);
      const results = award?.voteResults ?? {
        awardId,
        totalVotes: 0,
        results: [],
        lastUpdated: new Date().toISOString()
      };
      
      const updatedResults = results.results.map(r => {
        if (r.nomineeId === nomineeId) {
          return { ...r, votes: r.votes + 1, trending: 'UP' as const };
        }
        return r;
      });
      const newTotal = results.totalVotes + 1;
      const finalResults = updatedResults.map(r => ({
        ...r,
        percentage: (r.votes / newTotal) * 100
      }));

      const sortedResults = [...finalResults].sort((a, b) => b.votes - a.votes);
      const rankedResults = sortedResults.map((r, idx) => ({ ...r, rank: idx + 1 }));

      const simulatedResults: VoteResults = {
        awardId,
        totalVotes: newTotal,
        results: rankedResults,
        lastUpdated: new Date().toISOString()
      };

      if (award) {
        award.voteResults = simulatedResults;
      }

      return { success: true, results: simulatedResults };
    }
  },

  getLeaderboard: (awardId: string) =>
    apiClient.get<RealtimeLeaderboardEntry[]>(`/awards/public/${awardId}/leaderboard`)
      .then(r => r.data)
      .catch(() => {
        const award = MOCK_AWARDS.find(a => a.id === awardId);
        return award?.voteResults?.results.map(r => {
          const nom = award.nominees.find(n => n.id === r.nomineeId);
          return {
            nomineeId: r.nomineeId,
            nomineeName: nom?.name ?? 'Supporter',
            photoUrl: (nom as any)?.photoUrl ?? (nom as any)?.logoUrl,
            votes: r.votes,
            percentage: r.percentage,
            delta: 0
          };
        }) ?? [];
      }),

  getHistorical: (category?: AwardCategory) =>
    apiClient.get<HistoricalWinner[]>('/awards/public/historical', { params: { category } })
      .then(r => r.data)
      .catch(() => category ? MOCK_HISTORICAL.filter(w => w.category === category) : MOCK_HISTORICAL),
};

// --- Realtime -- thin wrapper around the shared socket.io client (services/socket.ts) --

let refCount = 0;
let boundOnce = false;

function bindGlobalListenersOnce() {
  if (boundOnce) return;
  boundOnce = true;
  const socket = getSocket();
  const store = () => useRealtimeStore.getState();

  socket.on('connect', () => store().setConnected(true));
  socket.on('disconnect', () => store().setConnected(false));
  store().setConnected(socket.connected);

  socket.on('vote_updated', (payload: { awardId: number; nominationId: number; voteCount: number }) => {
    store().incrementTotalVotes();
    store().pushLiveEvent({
      awardId: String(payload.awardId),
      nomineeId: String(payload.nominationId),
      nomineeName: 'Un supporter',
      timestamp: new Date().toISOString(),
    });
    store().setLastSync(new Date().toISOString());
  });
}

export function connectAwardsSocket(): void {
  refCount += 1;
  bindGlobalListenersOnce();
  getSocket().connect();
}

export function disconnectAwardsSocket(): void {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0) {
    // Actually disconnect when no consumers remain
    getSocket().disconnect();
    useRealtimeStore.getState().setConnected(false);
  }
}

export function subscribeToAward(id: string): void {
  getSocket().emit('join_award', Number(id));
}

export function unsubscribeFromAward(id: string): void {
  getSocket().emit('leave_award', Number(id));
}
