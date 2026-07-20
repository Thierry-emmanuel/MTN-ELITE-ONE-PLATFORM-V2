import { apiClient } from './api';
import { getSocket } from './socket';
import { useRealtimeStore } from '../store/awards.store';
import type {
  Award, BallonDorEdition, TeamOfWeek, VoteResults,
  RealtimeLeaderboardEntry, AwardCategory, HistoricalWinner
} from '../types/awards.types';

// --- Awards REST API -- talks to AwardsController (/awards/*) ---
// Routes corrected to match the actual backend controller.

export const awardsApi = {
  // Fetches all open (active) awards — used on public-facing pages
  getAll: (season?: string) =>
    apiClient.get<Award[]>('/awards/public', { params: { season } })
      .then(r => r.data),

  getById: (id: string): Promise<Award | null> =>
    apiClient.get<Award>(`/awards/public/${id}`)
      .then(r => r.data)
      .catch(() => null),

  getByCategory: (category: AwardCategory, season?: string) =>
    apiClient.get<Award[]>('/awards/public', { params: { season } })
      .then(r => r.data.filter((a: Award) => a.category === category)),

  getBallonDor: (year?: number): Promise<BallonDorEdition | null> =>
    apiClient.get<BallonDorEdition>('/awards/public/ballon-dor', { params: { year } })
      .then(r => r.data)
      .catch(() => null),

  getTeamOfWeek: (_period?: string): Promise<TeamOfWeek | null> =>
    apiClient.get<TeamOfWeek>('/awards/public/team-of-week')
      .then(r => r.data)
      .catch(() => null),

  getVoteResults: (awardId: string): Promise<VoteResults | null> =>
    apiClient.get<VoteResults>(`/awards/public/${awardId}/votes`)
      .then(r => r.data)
      .catch(() => null),

  // nomineeId is the nomination id (number as string) from Award.nominations[].id
  // Sprint 2 (de-mock): a vote that the backend rejects is a FAILED vote —
  // no local simulation. Callers surface the error to the fan.
  castVote: (awardId: string, nomineeId: string) =>
    apiClient.post<{ success: boolean; results: VoteResults }>(
      `/awards/public/${awardId}/vote`,
      { nomineeId },
    ).then(r => r.data),

  getLeaderboard: (awardId: string) =>
    apiClient.get<RealtimeLeaderboardEntry[]>(`/awards/public/${awardId}/leaderboard`)
      .then(r => r.data)
      .catch(() => [] as RealtimeLeaderboardEntry[]),

  getHistorical: (category?: AwardCategory) =>
    apiClient.get<HistoricalWinner[]>('/awards/public/historical', { params: { category } })
      .then(r => r.data),
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
