/**
 * Public Experience — connective data layer (Phase 4 public).
 * Resolves the RELATED universe of any entity so no page is a dead end:
 *   stories   → /articles?status=PUBLISHED (relation fields filtered here —
 *               the schema carries relatedMatchId/ClubIds/PlayerIds)
 *   media     → /media?related*Id (real filters from the media module)
 *   matches   → /matches?clubId (real backend filter)
 *   heritage  → /hall-of-fame (legends whose clubs include this club)
 *   awards    → /awards (winner / season relations)
 * Plus the season's PUBLIC EXPERIENCE flags (Phase 5 configuration).
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import type { SeasonConfig } from '@/features/admin/configs/seasons.config';

const list = <T,>(body: T[] | { data: T[] }): T[] => (Array.isArray(body) ? body : (body as { data: T[] }).data);

export interface PublicStory {
  _id: string; slug: string; category?: string;
  title?: { fr?: string; en?: string }; subtitle?: { fr?: string };
  cover_image?: string; author?: string; publishedAt?: string; createdAt?: string;
  relatedMatchId?: number | string; relatedClubIds?: (number | string)[]; relatedPlayerIds?: (number | string)[];
}
export interface PublicMedia { _id: string; type: string; url: string; thumbnailUrl?: string; title: string; credit?: string }
export interface PublicLegend {
  _id: string; name: string; era?: string; clubs?: string[];
  career_summary?: string; achievements?: string[]; quote?: string; inducted_year?: number; images?: string[];
}

export interface EntityRef { matchId?: number; clubId?: number; playerId?: number; clubName?: string }

export function useRelatedStories(ref: EntityRef, limit = 6) {
  return useQuery({
    queryKey: ['public', 'related-stories', ref],
    queryFn: async () => {
      const { data } = await apiClient.get('/articles', { params: { status: 'PUBLISHED', limit: 60 } });
      const rows = list<PublicStory>(data.items ?? data);
      const match = (s: PublicStory) =>
        (ref.matchId && String(s.relatedMatchId) === String(ref.matchId)) ||
        (ref.clubId && (s.relatedClubIds ?? []).some((c) => String(c) === String(ref.clubId))) ||
        (ref.playerId && (s.relatedPlayerIds ?? []).some((p) => String(p) === String(ref.playerId)));
      const related = rows.filter(match);
      // Never a dead end: pad with the freshest league stories.
      const pad = rows.filter((s) => !related.includes(s));
      return [...related, ...pad].slice(0, limit).map((s) => ({ ...s, isDirect: related.includes(s) }));
    },
    staleTime: 60_000,
  });
}

export function useRelatedMedia(ref: EntityRef, limit = 8) {
  return useQuery({
    queryKey: ['public', 'related-media', ref],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (ref.matchId) params.relatedMatchId = ref.matchId;
      else if (ref.playerId) params.relatedPlayerId = ref.playerId;
      else if (ref.clubId) params.relatedClubId = ref.clubId;
      const { data } = await apiClient.get('/media', { params });
      return list<PublicMedia>(data).slice(0, limit);
    },
    staleTime: 60_000,
  });
}

export function useClubMatches(clubId?: number, limit = 5) {
  return useQuery({
    queryKey: ['public', 'club-matches', clubId],
    queryFn: async () => {
      const { data } = await apiClient.get('/matches', { params: { clubId, limit: 30 } });
      return list<{ id: number; round: number; status: string; scheduledAt: string; homeScore: number | null; awayScore: number | null; homeClub?: { name?: string }; awayClub?: { name?: string } }>(data)
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
        .slice(0, limit);
    },
    enabled: !!clubId,
    staleTime: 30_000,
  });
}

export function useLegends(filter?: { clubName?: string }) {
  return useQuery({
    queryKey: ['public', 'legends', filter],
    queryFn: async () => {
      const rows = list<PublicLegend>((await apiClient.get('/hall-of-fame')).data);
      if (!filter?.clubName) return rows;
      const needle = filter.clubName.toLowerCase();
      return rows.filter((l) => (l.clubs ?? []).some((c) => c.toLowerCase().includes(needle)));
    },
    staleTime: 120_000,
  });
}

/** Season public-experience flags — Phase 5 configuration, defaults open. */
export function usePublicFlags() {
  return useQuery({
    queryKey: ['public', 'flags'],
    queryFn: async () => {
      const seasons = list<{ id: number; status?: string; config?: SeasonConfig }>((await apiClient.get('/seasons')).data);
      const current = seasons.find((s) => s.status === 'ONGOING') ?? seasons[0];
      const pe = current?.config?.publicExperience ?? {};
      return {
        seasonId: current?.id,
        publicVisible: pe.publicVisible !== false,
        liveCenter: pe.liveCenter !== false,
        statsVisible: pe.statsVisible !== false,
        apiAvailable: pe.apiAvailable === true,
      };
    },
    staleTime: 60_000,
  });
}

export const storyTitle = (s: PublicStory) => s.title?.fr || s.title?.en || s.slug;
