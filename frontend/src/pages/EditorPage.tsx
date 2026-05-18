import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Eye, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { newsApi } from '@/services/newsApi';
import { MOCK_ARTICLES } from '@/services/mockNews';
import { EditorPanel } from '@/components/elite/news/EditorPanel';
import type { Article, CreateArticlePayload } from '@/types/news.types';

export default function EditorPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await newsApi.getArticles({ limit: 100 });
      setArticles(res.data?.length > 0 ? res.data : MOCK_ARTICLES);
    } catch {
      setArticles(MOCK_ARTICLES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = useCallback(async (payload: CreateArticlePayload) => {
    setSaving(true);
    try {
      const created = await newsApi.createArticle(payload);
      setArticles(prev => [created, ...prev]);
      showToast('Article créé avec succès !');
    } catch {
      // Optimistic local add with mock data
      const mock: Article = {
        id: `local-${Date.now()}`,
        slug: payload.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        commentsCount: 0,
        readingTime: Math.ceil(payload.content.split(' ').length / 200),
        views: 0,
        author: { id: 'editor', name: 'Éditeur', role: 'Rédacteur' },
        publishedAt: new Date().toISOString(),
        ...payload,
      };
      setArticles(prev => [mock, ...prev]);
      showToast('Article sauvegardé localement.', 'success');
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  const handleUpdate = useCallback(async (id: string, payload: Partial<CreateArticlePayload>) => {
    setSaving(true);
    try {
      const updated = await newsApi.updateArticle(id, payload);
      setArticles(prev => prev.map(a => a.id === id ? updated : a));
      showToast('Article mis à jour !');
    } catch {
      setArticles(prev => prev.map(a => a.id === id ? { ...a, ...payload } as Article : a));
      showToast('Modifications sauvegardées localement.', 'success');
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Supprimer cet article ?')) return;
    try {
      await newsApi.deleteArticle(id);
      setArticles(prev => prev.filter(a => a.id !== id));
      showToast('Article supprimé.');
    } catch {
      setArticles(prev => prev.filter(a => a.id !== id));
      showToast('Article supprimé localement.', 'success');
    }
  }, [showToast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Editor top bar */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
              <Edit3 className="h-3.5 w-3.5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground/90 leading-none">Espace éditeur</p>
              <p className="text-[10px] text-muted-foreground/40 mt-0.5">MTN Elite One · Gestion des actualités</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CE1126]/10 border border-[#CE1126]/20">
              <AlertTriangle className="h-3 w-3 text-[#CE1126]/70" />
              <span className="text-[10px] text-[#CE1126]/70 font-medium">Zone réservée aux éditeurs</span>
            </div>
            <Link to="/news"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-border/40 text-[11px] text-muted-foreground hover:text-foreground transition-all">
              <Eye className="h-3.5 w-3.5" /> Voir le site
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-xl font-display font-bold text-foreground">Gestion des articles</h1>
          <p className="text-sm text-muted-foreground/50 mt-0.5">
            Créez, modifiez et publiez les articles du site d'actualités.
          </p>
        </div>

        {/* Editor panel */}
        {loading ? (
          <div className="h-[600px] rounded-xl border border-border/40 bg-white/[0.02] flex items-center justify-center animate-pulse">
            <p className="text-muted-foreground/30 text-sm">Chargement des articles…</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <EditorPanel
              articles={articles}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              saving={saving}
            />
          </motion.div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]'
              : 'bg-[#CE1126]/15 border-[#CE1126]/30 text-[#CE1126]'
          }`}
        >
          {toast.msg}
        </motion.div>
      )}
    </div>
  );
}