import { apiClient } from './api';
import { getSocket } from './socket';
import { useRealtimeStore } from '../store/awards.store';
import type {
  Award, BallonDorEdition, TeamOfWeek, VoteResults,
  RealtimeLeaderboardEntry, AwardCategory,
} from '../types/awards.types';

// --- Awards REST API -- talks to AwardsController (/awards/*) ---
// Routes corrected to match the actual backend controller.

export const awardsApi = {
  // Fetches all open (active) awards — used on public-facing pages
  getAll: (_season?: string) =>
    apiClient.get<Award[]>('/awards/active').then(r => r.data),

  getById: (id: string) =>
    apiClient.get<Award>(`/awards/${id}`).then(r => r.data),

  getByCategory: (category: AwardCategory, _season?: string) =>
    apiClient.get<Award[]>('/awards/active')
      .then(r => r.data.filter((a: Award) => a.category === category)),

  // Note: BallonDor and TeamOfWeek are derived by filtering active awards
  // by category — there are no dedicated backend routes for these yet.
  getBallonDor: (_year?: number) =>
    apiClient.get<Award[]>('/awards/active')
      .then(r => r.data.find((a: Award) => a.category === 'BALLON_DOR') ?? null),

  getTeamOfWeek: (_period?: string) =>
    apiClient.get<Award[]>('/awards/active')
      .then(r => r.data.find((a: Award) => a.category === 'TEAM_OF_WEEK') ?? null),

  getVoteResults: (awardId: string) =>
    apiClient.get<VoteResults>(`/awards/${awardId}`).then(r => r.data),

  // nomineeId is the nomination id (number as string) from Award.nominations[].id
  castVote: (awardId: string, nominationId: string) =>
    apiClient.post<{ message: string }>(
      `/awards/${awardId}/vote`,
      { nominationId: Number(nominationId) },
    ).then(r => r.data),

  getLeaderboard: (awardId: string) =>
    apiClient.get<RealtimeLeaderboardEntry[]>(`/awards/${awardId}`).then(r => r.data),

  getHistorical: (_category?: AwardCategory) =>
    apiClient.get<Award[]>('/awards').then(r => r.data),
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
