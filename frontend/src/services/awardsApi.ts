import { apiClient } from './api';
import type {
  Award, BallonDorEdition, TeamOfWeek, VoteResults,
  RealtimeLeaderboardEntry, AwardCategory,
} from '../types/awards.types';

// ─── Awards REST API ──────────────────────────────────────────────────────────

export const awardsApi = {
  getAll: (season?: string) =>
    apiClient.get<Award[]>('/awards', { params: { season } }).then(r => r.data),

  getById: (id: string) =>
    apiClient.get<Award>(`/awards/${id}`).then(r => r.data),

  getByCategory: (category: AwardCategory, season?: string) =>
    apiClient.get<Award>('/awards/category', { params: { category, season } }).then(r => r.data),

  getBallonDor: (year?: number) =>
    apiClient.get<BallonDorEdition>('/awards/ballon-dor', { params: { year } }).then(r => r.data),

  getTeamOfWeek: (period?: string) =>
    apiClient.get<TeamOfWeek>('/awards/team-of-week', { params: { period } }).then(r => r.data),

  getVoteResults: (awardId: string) =>
    apiClient.get<VoteResults>(`/awards/${awardId}/votes`).then(r => r.data),

  castVote: (awardId: string, nomineeId: string) =>
    apiClient.post<{ success: boolean; results: VoteResults }>(
      `/awards/${awardId}/vote`,
      { nomineeId },
    ).then(r => r.data),

  getLeaderboard: (awardId: string) =>
    apiClient.get<RealtimeLeaderboardEntry[]>(`/awards/${awardId}/leaderboard`).then(r => r.data),

  getHistorical: (category?: AwardCategory) =>
    apiClient.get('/awards/historical', { params: { category } }).then(r => r.data),
};

// ─── Socket event names ───────────────────────────────────────────────────────

export const AWARD_EVENTS = {
  VOTE_UPDATE:        'award:vote_update',
  LEADERBOARD_UPDATE: 'award:leaderboard_update',
  VOTE_CAST:          'award:vote_cast',
  WINNER_ANNOUNCED:   'award:winner_announced',
  TRENDING_UPDATE:    'award:trending_update',
  COUNTDOWN_SYNC:     'award:countdown_sync',
  SUBSCRIBE_AWARD:    'award:subscribe',
  UNSUBSCRIBE_AWARD:  'award:unsubscribe',
  CAST_VOTE:          'award:cast',
} as const;

// ─── Socket stubs ─────────────────────────────────────────────────────────────
// Real-time is disabled until socket.io-client is installed.
// To enable: npm install socket.io-client --legacy-peer-deps
// Then replace these stubs with the full socket implementation.

export function connectAwardsSocket():             void {}
export function disconnectAwardsSocket():          void {}
export function subscribeToAward(_id: string):     void {}
export function unsubscribeFromAward(_id: string): void {}