import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type {
  Award, AwardCategory, AwardType,
  VoteResults, BallonDorEdition, TeamOfWeek,
  LiveVoteEvent, RealtimeLeaderboardEntry,
} from '../types/awards.types';

// ─── Awards Store ─────────────────────────────────────────────────────────────

interface AwardsState {
  awards:          Award[];
  ballonDor:       BallonDorEdition | null;
  teamOfWeek:      TeamOfWeek | null;
  selectedAward:   Award | null;
  activeCategory:  AwardCategory | 'ALL';
  activeType:      AwardType | 'ALL';
  activeSeason:    string;
  loading:         boolean;
  error:           string | null;

  setAwards:         (awards: Award[]) => void;
  setBallonDor:      (b: BallonDorEdition) => void;
  setTeamOfWeek:     (t: TeamOfWeek) => void;
  selectAward:       (award: Award | null) => void;
  setActiveCategory: (cat: AwardCategory | 'ALL') => void;
  setActiveType:     (type: AwardType | 'ALL') => void;
  setActiveSeason:   (season: string) => void;
  setLoading:        (v: boolean) => void;
  setError:          (e: string | null) => void;
  updateAwardVotes:  (awardId: string, results: VoteResults) => void;
}

export const useAwardsStore = create<AwardsState>()(
  subscribeWithSelector((set) => ({
    awards:         [],
    ballonDor:      null,
    teamOfWeek:     null,
    selectedAward:  null,
    activeCategory: 'ALL',
    activeType:     'ALL',
    activeSeason:   'season-2025-26',
    loading:        false,
    error:          null,

    setAwards:         (awards)  => set({ awards }),
    setBallonDor:      (b)       => set({ ballonDor: b }),
    setTeamOfWeek:     (t)       => set({ teamOfWeek: t }),
    selectAward:       (award)   => set({ selectedAward: award }),
    setActiveCategory: (cat)     => set({ activeCategory: cat }),
    setActiveType:     (type)    => set({ activeType: type }),
    setActiveSeason:   (season)  => set({ activeSeason: season }),
    setLoading:        (v)       => set({ loading: v }),
    setError:          (e)       => set({ error: e }),

    updateAwardVotes: (awardId, results) =>
      set(state => ({
        awards: state.awards.map(a =>
          a.id === awardId ? { ...a, voteResults: results } : a,
        ),
        selectedAward: state.selectedAward?.id === awardId
          ? { ...state.selectedAward, voteResults: results }
          : state.selectedAward,
      })),
  })),
);

// ─── Voting Store (persisted — tracks what user has already voted for) ────────

interface VoteRecord {
  awardId:    string;
  nomineeId:  string;
  votedAt:    string;
}

interface VotingState {
  // Which awards the user has already voted for (persisted)
  votedAwards:    Record<string, VoteRecord>; // awardId → VoteRecord
  // Optimistic vote counts (before server confirms)
  optimisticVotes:Record<string, number>;     // nomineeId → count delta
  pendingVote:    string | null;              // nomineeId currently being submitted
  successAwardId: string | null;             // show success animation

  castVote:       (awardId: string, nomineeId: string) => void;
  clearPending:   () => void;
  setSuccess:     (awardId: string | null) => void;
  hasVoted:       (awardId: string) => boolean;
  getVotedNominee:(awardId: string) => string | null;
}

export const useVotingStore = create<VotingState>()(
  persist(
    (set, get) => ({
      votedAwards:     {},
      optimisticVotes: {},
      pendingVote:     null,
      successAwardId:  null,

      castVote: (awardId, nomineeId) => {
        set(state => ({
          votedAwards: {
            ...state.votedAwards,
            [awardId]: { awardId, nomineeId, votedAt: new Date().toISOString() },
          },
          optimisticVotes: {
            ...state.optimisticVotes,
            [nomineeId]: (state.optimisticVotes[nomineeId] ?? 0) + 1,
          },
          pendingVote: nomineeId,
        }));
      },

      clearPending: () => set({ pendingVote: null }),

      setSuccess: (awardId) => set({ successAwardId: awardId }),

      hasVoted: (awardId) => !!get().votedAwards[awardId],

      getVotedNominee: (awardId) => get().votedAwards[awardId]?.nomineeId ?? null,
    }),
    {
      name: 'mtn-elite-votes',
      partialize: (state) => ({ votedAwards: state.votedAwards }),
    },
  ),
);

// ─── Realtime Store ───────────────────────────────────────────────────────────

interface RealtimeState {
  connected:           boolean;
  liveLeaderboard:     Record<string, RealtimeLeaderboardEntry[]>; // awardId → entries
  liveFeed:            LiveVoteEvent[];          // last 20 vote events
  trendingNominees:    RealtimeLeaderboardEntry[];
  totalLiveVotes:      number;
  lastSyncAt:          string | null;

  setConnected:        (v: boolean) => void;
  updateLeaderboard:   (awardId: string, entries: RealtimeLeaderboardEntry[]) => void;
  pushLiveEvent:       (event: LiveVoteEvent) => void;
  setTrending:         (nominees: RealtimeLeaderboardEntry[]) => void;
  incrementTotalVotes: () => void;
  setLastSync:         (ts: string) => void;
  clearFeed:           () => void;
}

export const useRealtimeStore = create<RealtimeState>()(
  subscribeWithSelector((set) => ({
    connected:        false,
    liveLeaderboard:  {},
    liveFeed:         [],
    trendingNominees: [],
    totalLiveVotes:   0,
    lastSyncAt:       null,

    setConnected: (v) => set({ connected: v }),

    updateLeaderboard: (awardId, entries) =>
      set(state => ({
        liveLeaderboard: { ...state.liveLeaderboard, [awardId]: entries },
      })),

    pushLiveEvent: (event) =>
      set(state => ({
        liveFeed: [event, ...state.liveFeed].slice(0, 20),
      })),

    setTrending:         (nominees)   => set({ trendingNominees: nominees }),
    incrementTotalVotes: ()           => set(s => ({ totalLiveVotes: s.totalLiveVotes + 1 })),
    setLastSync:         (ts)         => set({ lastSyncAt: ts }),
    clearFeed:           ()           => set({ liveFeed: [] }),
  })),
);