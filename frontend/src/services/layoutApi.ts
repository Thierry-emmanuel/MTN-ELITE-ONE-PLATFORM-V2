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
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
  round: number;
  /** Backend field is scheduledAt; "kickoff" is a legacy alias on the wire */
  scheduledAt: string;
  kickoff?: string; // kept for backward-compat with AdminPage state shape
  venue: string;
  seasonId: string;
  homeClub?: any;
  awayClub?: any;
}

export interface Article {
  _id?: string;
  // Core
  articleType?: 'STANDARD' | 'BREAKING' | 'OPINION' | 'VIDEO' | 'PHOTO_GALLERY' | 'LIVE_BLOG';
  category: string;
  // Localised content (new schema)
  title: any;           // LocalizedString | string (legacy)
  subtitle?: any;       // LocalizedString
  body?: any;           // LocalizedString
  // Legacy flat fields (kept for backward compat)
  slug?: string;
  author?: string;
  summary?: string;
  content?: string;
  // Media
  image_url?: string;
  cover_image?: string;
  gallery?: string[];
  videoUrl?: string;
  videoThumbnail?: string;
  // Publishing
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean;
  isPremium?: boolean;
  isBreaking?: boolean;
  publishedAt?: string;
  read_time?: number;
  // Related
  relatedMatchId?: string;
  relatedClubIds?: string[];
  relatedPlayerIds?: string[];
  // SEO
  metaDescription?: any; // LocalizedString
  tags?: string[];
  location?: string;
  sourceCredit?: string;
  // Engagement
  views?: number;
  likes?: number;
  shares?: number;
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
  finishMatch: async (id: string): Promise<Match> => {
    const res = await apiClient.patch<Match>(`/matches/${id}/finish`);
    return res.data;
  },
  updateMatchScore: async (id: string, homeScore: number, awayScore: number): Promise<Match> => {
    const res = await apiClient.patch<Match>(`/matches/${id}/score`, { homeScore, awayScore });
    return res.data;
  },
  getMatchLineups: async (id: string): Promise<any> => {
    const res = await apiClient.get(`/matches/${id}/lineups`);
    return res.data;
  },
  setMatchLineups: async (id: string, dto: any): Promise<any> => {
    const res = await apiClient.patch(`/matches/${id}/lineups`, dto);
    return res.data;
  },
  getMatchStats: async (id: string): Promise<any> => {
    const res = await apiClient.get(`/matches/${id}/stats`);
    return res.data;
  },
  getMatchHeadToHead: async (id: string, limit?: number): Promise<any> => {
    const res = await apiClient.get(`/matches/${id}/head-to-head`, { params: { limit: limit ?? 6 } });
    return res.data;
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

  // ── Seasons CRUD ────────────────────────────────────────────────────────────
  getSeasons: async (): Promise<any[]> => {
    const res = await apiClient.get<any[]>('/seasons');
    return res.data;
  },
  createSeason: async (dto: any): Promise<any> => {
    const res = await apiClient.post('/seasons', dto);
    return res.data;
  },
  updateSeason: async (id: string, dto: any): Promise<any> => {
    const res = await apiClient.patch(`/seasons/${id}`, dto);
    return res.data;
  },
  activateSeason: async (id: string): Promise<any> => {
    const res = await apiClient.patch(`/seasons/${id}/activate`);
    return res.data;
  },
  closeSeason: async (id: string): Promise<any> => {
    const res = await apiClient.patch(`/seasons/${id}/close`);
    return res.data;
  },
  initStandings: async (id: string): Promise<any> => {
    const res = await apiClient.post(`/seasons/${id}/initialize-standings`);
    return res.data;
  },
  deleteSeason: async (id: string): Promise<any> => {
    const res = await apiClient.delete(`/seasons/${id}`);
    return res.data;
  },

  // ── Clubs CRUD ──────────────────────────────────────────────────────────────
  getClubs: async (params?: any): Promise<any> => {
    const res = await apiClient.get('/clubs', { params });
    return res.data;
  },
  createClub: async (dto: any): Promise<any> => {
    const res = await apiClient.post('/clubs', dto);
    return res.data;
  },
  updateClub: async (id: string, dto: any): Promise<any> => {
    const res = await apiClient.patch(`/clubs/${id}`, dto);
    return res.data;
  },
  deleteClub: async (id: string): Promise<any> => {
    const res = await apiClient.delete(`/clubs/${id}`);
    return res.data;
  },

  // ── Players CRUD ─────────────────────────────────────────────────────────────
  getPlayers: async (params?: any): Promise<any> => {
    const res = await apiClient.get('/players', { params });
    return res.data;
  },
  createPlayer: async (dto: any): Promise<any> => {
    const res = await apiClient.post('/players', dto);
    return res.data;
  },
  updatePlayer: async (id: string, dto: any): Promise<any> => {
    const res = await apiClient.patch(`/players/${id}`, dto);
    return res.data;
  },
  transferPlayer: async (playerId: string, clubId: string): Promise<any> => {
    const res = await apiClient.patch(`/players/${playerId}/transfer/${clubId}`);
    return res.data;
  },
  deletePlayer: async (id: string): Promise<any> => {
    const res = await apiClient.delete(`/players/${id}`);
    return res.data;
  },

  // ── Coaches CRUD ─────────────────────────────────────────────────────────────
  getCoaches: async (params?: any): Promise<any> => {
    const res = await apiClient.get('/coaches', { params });
    return res.data;
  },
  createCoach: async (dto: any): Promise<any> => {
    const res = await apiClient.post('/coaches', dto);
    return res.data;
  },
  updateCoach: async (id: string, dto: any): Promise<any> => {
    const res = await apiClient.patch(`/coaches/${id}`, dto);
    return res.data;
  },
  assignCoach: async (coachId: string, clubId: string): Promise<any> => {
    const res = await apiClient.patch(`/coaches/${coachId}/assign/${clubId}`);
    return res.data;
  },
  unassignCoach: async (coachId: string): Promise<any> => {
    const res = await apiClient.patch(`/coaches/${coachId}/unassign`);
    return res.data;
  },
  deleteCoach: async (id: string): Promise<any> => {
    const res = await apiClient.delete(`/coaches/${id}`);
    return res.data;
  },

  // ── Referees CRUD ────────────────────────────────────────────────────────────
  getReferees: async (params?: any): Promise<any> => {
    const res = await apiClient.get('/referees', { params });
    return res.data;
  },
  createReferee: async (dto: any): Promise<any> => {
    const res = await apiClient.post('/referees', dto);
    return res.data;
  },
  updateReferee: async (id: string, dto: any): Promise<any> => {
    const res = await apiClient.patch(`/referees/${id}`, dto);
    return res.data;
  },
  deleteReferee: async (id: string): Promise<any> => {
    const res = await apiClient.delete(`/referees/${id}`);
    return res.data;
  },

  // ── Staff CRUD ───────────────────────────────────────────────────────────────
  getStaff: async (params?: any): Promise<any> => {
    const res = await apiClient.get('/staff', { params });
    return res.data;
  },
  createStaff: async (dto: any): Promise<any> => {
    const res = await apiClient.post('/staff', dto);
    return res.data;
  },
  updateStaff: async (id: string, dto: any): Promise<any> => {
    const res = await apiClient.patch(`/staff/${id}`, dto);
    return res.data;
  },
  deleteStaff: async (id: string): Promise<any> => {
    const res = await apiClient.delete(`/staff/${id}`);
    return res.data;
  },

  // ── Stadiums CRUD ────────────────────────────────────────────────────────────
  getStadiums: async (params?: any): Promise<any> => {
    const res = await apiClient.get('/stadiums', { params });
    return res.data;
  },
  createStadium: async (dto: any): Promise<any> => {
    const res = await apiClient.post('/stadiums', dto);
    return res.data;
  },
  updateStadium: async (id: string, dto: any): Promise<any> => {
    const res = await apiClient.patch(`/stadiums/${id}`, dto);
    return res.data;
  },
  deleteStadium: async (id: string): Promise<any> => {
    const res = await apiClient.delete(`/stadiums/${id}`);
    return res.data;
  },

  // ── Users CRUD (Admin) ───────────────────────────────────────────────────────
  getUsers: async (params?: any): Promise<any> => {
    const res = await apiClient.get('/users', { params });
    return res.data;
  },
  createAdminUser: async (dto: any): Promise<any> => {
    const res = await apiClient.post('/users/admin-create', dto);
    return res.data;
  },
  updateUser: async (id: string, dto: any): Promise<any> => {
    const res = await apiClient.patch(`/users/${id}`, dto);
    return res.data;
  },
  toggleUserActive: async (id: string): Promise<any> => {
    const res = await apiClient.patch(`/users/${id}/toggle-active`);
    return res.data;
  },
  approveEditor: async (id: string): Promise<any> => {
    const res = await apiClient.patch(`/users/${id}/approve-editor`);
    return res.data;
  },
  resetUserPassword: async (id: string, newPassword: string): Promise<any> => {
    const res = await apiClient.patch(`/users/${id}/reset-password`, { newPassword });
    return res.data;
  },
  deleteUser: async (id: string): Promise<any> => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },

  // ── System Settings ─────────────────────────────────────────────────────────
  getSystemSettings: async (): Promise<{ logo_url: string; contact_email: string; contact_phone: string }> => {
    const res = await apiClient.get('/system-settings');
    return res.data;
  },
  updateSystemSettings: async (dto: { logo_url?: string; contact_email?: string; contact_phone?: string }): Promise<any> => {
    const res = await apiClient.patch('/system-settings', dto);
    return res.data;
  },

  // ── Contacts ─────────────────────────────────────────────────────────────────
  submitContact: async (dto: { name: string; email: string; subject: string; message: string }): Promise<any> => {
    const res = await apiClient.post('/contacts', dto);
    return res.data;
  },
  getContacts: async (): Promise<any[]> => {
    const res = await apiClient.get('/contacts');
    return res.data;
  },
  updateContactStatus: async (id: string, status: string): Promise<any> => {
    const res = await apiClient.patch(`/contacts/${id}/status`, { status });
    return res.data;
  },
  deleteContact: async (id: string): Promise<any> => {
    const res = await apiClient.delete(`/contacts/${id}`);
    return res.data;
  },
};
