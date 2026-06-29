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

export const layoutApi = {
  getHomepageLayout: async (): Promise<HomepageLayout> => {
    const res = await apiClient.get<HomepageLayout>('/homepage-layout');
    return res.data;
  },

  updateHomepageLayout: async (layout: HomepageLayout): Promise<HomepageLayout> => {
    const res = await apiClient.post<HomepageLayout>('/homepage-layout', layout);
    return res.data;
  },

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
};
