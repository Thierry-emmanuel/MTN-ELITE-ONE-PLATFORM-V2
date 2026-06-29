import { apiClient } from './api';

export interface HomepageLayout {
  section_order: string[];
  section_visibility: Record<string, boolean>;
}

export interface HeroBanner {
  _id?: string;
  title: { fr: string; en: string };
  subtitle: { fr: string; en: string };
  image_url: string;
  link_url?: string;
  priority: number;
  active: boolean;
  type?: string;
}

export interface Award {
  id?: string;
  category: string;
  periodStart: string;
  periodEnd: string;
  status: 'OPEN' | 'CLOSED' | 'ANNOUNCED';
  seasonId: string;
  winnerId?: string | null;
  nominations?: any[];
}

export interface Match {
  id?: string;
  homeClubId: string;
  awayClubId: string;
  homeScore?: number;
  awayScore?: number;
  status: 'SCHEDULED' | 'LIVE' | 'HT' | 'FT' | 'POSTPONED' | 'CANCELLED';
  round: number;
  kickoff: string;
  venue: string;
  seasonId: string;
  homeClub?: any;
  awayClub?: any;
}

export interface Article {
  _id?: string;
  title: string;
  slug?: string;
  summary: string;
  content: string;
  image_url: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED';
  featured?: boolean;
}

export interface HallOfFameLegend {
  _id?: string;
  name: string;
  bio: { fr: string; en: string };
  era: string; // e.g. '80', '90'
  achievements: string[];
  image_url: string;
  club_ids: string[];
}

export interface TalentProfile {
  _id?: string;
  playerId: string;
  highlightVideoUrl?: string;
  status: 'WATCHLIST' | 'PROMOTED' | 'NATIONAL_TEAM';
  scoutingNotes?: string;
  rating?: number;
  player?: any;
}

export const layoutApi = {
  // Layout
  getHomepageLayout: async (): Promise<HomepageLayout> => {
    const res = await apiClient.get<HomepageLayout>('/homepage-layout');
    return res.data;
  },
  updateHomepageLayout: async (layout: HomepageLayout): Promise<HomepageLayout> => {
    const res = await apiClient.post<HomepageLayout>('/homepage-layout', layout);
    return res.data;
  },

  // Hero Banners
  getHeroBanners: async (): Promise<HeroBanner[]> => {
    const res = await apiClient.get<HeroBanner[]>('/hero-banners');
    return res.data;
  },
  createHeroBanner: async (banner: Omit<HeroBanner, '_id'>): Promise<HeroBanner> => {
    const res = await apiClient.post<HeroBanner>('/hero-banners', banner);
    return res.data;
  },
  updateHeroBanner: async (id: string, banner: Partial<HeroBanner>): Promise<HeroBanner> => {
    const res = await apiClient.patch<HeroBanner>(`/hero-banners/${id}`, banner);
    return res.data;
  },
  deleteHeroBanner: async (id: string): Promise<void> => {
    await apiClient.delete(`/hero-banners/${id}`);
  },

  // Awards
  getAwards: async (): Promise<Award[]> => {
    const res = await apiClient.get<Award[]>('/awards');
    return res.data;
  },
  createAward: async (award: Omit<Award, 'id'>): Promise<Award> => {
    const res = await apiClient.post<Award>('/awards', award);
    return res.data;
  },
  updateAward: async (id: string, award: Partial<Award>): Promise<Award> => {
    const res = await apiClient.patch<Award>(`/awards/${id}`, award);
    return res.data;
  },
  deleteAward: async (id: string): Promise<void> => {
    await apiClient.delete(`/awards/${id}`);
  },
  addNomination: async (awardId: string, nomination: { playerId: string }): Promise<any> => {
    const res = await apiClient.post(`/awards/${awardId}/nominations`, nomination);
    return res.data;
  },
  deleteNomination: async (awardId: string, nominationId: string): Promise<void> => {
    await apiClient.delete(`/awards/${awardId}/nominations/${nominationId}`);
  },

  // Matches
  getMatches: async (params?: any): Promise<any> => {
    const res = await apiClient.get('/matches', { params });
    return res.data; // PaginatedMatches
  },
  createMatch: async (match: Omit<Match, 'id'>): Promise<Match> => {
    const res = await apiClient.post<Match>('/matches', match);
    return res.data;
  },
  updateMatch: async (id: string, match: Partial<Match>): Promise<Match> => {
    const res = await apiClient.patch<Match>(`/matches/${id}`, match);
    return res.data;
  },
  deleteMatch: async (id: string): Promise<void> => {
    await apiClient.delete(`/matches/${id}`);
  },

  // Articles / News
  getArticles: async (params?: any): Promise<any> => {
    const res = await apiClient.get('/articles', { params });
    return res.data;
  },
  createArticle: async (article: Omit<Article, '_id'>): Promise<Article> => {
    const res = await apiClient.post<Article>('/articles', article);
    return res.data;
  },
  updateArticle: async (id: string, article: Partial<Article>): Promise<Article> => {
    const res = await apiClient.patch<Article>(`/articles/${id}`, article);
    return res.data;
  },
  deleteArticle: async (id: string): Promise<void> => {
    await apiClient.delete(`/articles/${id}`);
  },

  // Hall of Fame
  getHallOfFame: async (): Promise<HallOfFameLegend[]> => {
    const res = await apiClient.get<HallOfFameLegend[]>('/hall-of-fame');
    return res.data;
  },
  createHallOfFame: async (legend: Omit<HallOfFameLegend, '_id'>): Promise<HallOfFameLegend> => {
    const res = await apiClient.post<HallOfFameLegend>('/hall-of-fame', legend);
    return res.data;
  },
  updateHallOfFame: async (id: string, legend: Partial<HallOfFameLegend>): Promise<HallOfFameLegend> => {
    const res = await apiClient.patch<HallOfFameLegend>(`/hall-of-fame/${id}`, legend);
    return res.data;
  },
  deleteHallOfFame: async (id: string): Promise<void> => {
    await apiClient.delete(`/hall-of-fame/${id}`);
  },

  // Talents / Road to Lions / MOTM / TOTW (Talent Profile module in Mongo)
  getTalents: async (): Promise<TalentProfile[]> => {
    const res = await apiClient.get<TalentProfile[]>('/talents');
    return res.data;
  },
  createTalent: async (talent: Omit<TalentProfile, '_id'>): Promise<TalentProfile> => {
    const res = await apiClient.post<TalentProfile>('/talents', talent);
    return res.data;
  },
  updateTalent: async (id: string, talent: Partial<TalentProfile>): Promise<TalentProfile> => {
    const res = await apiClient.patch<TalentProfile>(`/talents/${id}`, talent);
    return res.data;
  },
  deleteTalent: async (id: string): Promise<void> => {
    await apiClient.delete(`/talents/${id}`);
  },

  // Metadata Helpers
  getSeasons: async (): Promise<any[]> => {
    const res = await apiClient.get<any[]>('/seasons');
    return res.data;
  },
  getClubs: async (): Promise<any> => {
    const res = await apiClient.get('/clubs');
    return res.data; // PaginatedResponse of clubs
  },
  getPlayers: async (params?: any): Promise<any> => {
    const res = await apiClient.get('/players', { params });
    return res.data; // PaginatedResponse of players
  },
};
