import { apiClient } from './api';
import { getSocket } from './socket';
import { useRealtimeStore } from '../store/awards.store';
import type {
  Award, BallonDorEdition, TeamOfWeek, VoteResults,
  RealtimeLeaderboardEntry, AwardCategory,
} from '../types/awards.types';

// --- Awards REST API -- talks to AwardsPublicController (/awards/public/*) ---
// The admin CRUD surface (/awards/*, raw entities) is a separate contract
// used only by AdminPage via services/layoutApi.ts -- don't merge the two.

export const awardsApi = {
  getAll: (season?: string) =>
    apiClient.get<Award[]>('/awards/public', { params: { season } }).then(r => r.data),

  getById: (id: string) =>
    apiClient.get<Award>(`/awards/public/${id}`).then(r => r.data),

  getByCategory: (category: AwardCategory, season?: string) =>
    apiClient.get<Award[]>('/awards/public', { params: { season } })
      .then(r => r.data.filter(a => a.category === category)),

  getBallonDor: (year?: number) =>
    apiClient.get<BallonDorEdition>('/awards/public/ballon-dor', { params: { year } }).then(r => r.data),

  getTeamOfWeek: (_period?: string) =>
    apiClient.get<TeamOfWeek>('/awards/public/team-of-week').then(r => r.data),

  getVoteResults: (awardId: string) =>
    apiClient.get<VoteResults>(`/awards/public/${awardId}/votes`).then(r => r.data),

  // nomineeId is the stringified nomination id handed out in Award.nominees[].id
  castVote: (awardId: string, nomineeId: string) =>
    apiClient.post<{ success: boolean; results: VoteResults }>(
      `/awards/public/${awardId}/vote`,
      { nomineeId },
    ).then(r => r.data),

  getLeaderboard: (awardId: string) =>
    apiClient.get<RealtimeLeaderboardEntry[]>(`/awards/public/${awardId}/leaderboard`).then(r => r.data),

  getHistorical: (category?: AwardCategory) =>
    apiClient.get('/awards/public/historical', { params: { category } }).then(r => r.data),
};

// --- Realtime -- thin wrapper around the shared socket.io client (services/socket.ts) --
// Backend gateway (websocket.gateway.ts) rooms are named `award-${id}` and
// emits `vote_updated` / `award_status_changed`, matching useAwardLiveVotes.ts.

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
  // Keep the shared socket alive if another consumer (e.g. useAwardLiveVotes
  // on an admin/vote page) is still using it -- just stop tracking here.
  if (refCount === 0) useRealtimeStore.getState().setConnected(false);
}

export function subscribeToAward(id: string): void {
  getSocket().emit('join_award', Number(id));
}

export function unsubscribeFromAward(id: string): void {
  getSocket().emit('leave_award', Number(id));
}
