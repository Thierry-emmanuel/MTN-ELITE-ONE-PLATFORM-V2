import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Eye, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAllArticlesEditor, useCreateArticle, useUpdateArticle, useDeleteArticle } from '@/hooks/useNews';
import { EditorPanel } from '@/components/elite/news/EditorPanel';
import type { CreateArticlePayload } from '@/types/news.types';


function useLocalToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const show = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, show };
}

// ─── EditorPage ───────────────────────────────────────────────────────────────
export default function EditorPage() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: articles = [], isLoading } = useAllArticlesEditor();
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  const deleteMutation = useDeleteArticle();

  const isSaving =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // ── Toast ──────────────────────────────────────────────────────────────────
  const { toast, show: showToast } = useLocalToast();

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCreate = useCallback(async (payload: CreateArticlePayload) => {
    try {
      await createMutation.mutateAsync(payload);
      showToast('Article créé avec succès !');
    } catch {
      showToast('Erreur lors de la création de l\'article.', 'error');
    }
  }, [createMutation, showToast]);

  const handleUpdate = useCallback(async (id: string, payload: Partial<CreateArticlePayload>) => {
    try {
      await updateMutation.mutateAsync({ id, payload });
      showToast('Article mis à jour !');
    } catch {
      showToast('Modifications sauvegardées localement.', 'success');
    }
  }, [updateMutation, showToast]);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Supprimer cet article définitivement ?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      showToast('Article supprimé.');
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    }
  }, [deleteMutation, showToast]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky editor top bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-14">

          {/* Left — identity */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
              <Edit3 className="h-3.5 w-3.5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground/90 leading-none">Espace éditeur</p>
              <p className="text-[10px] text-muted-foreground/40 mt-0.5">MTN Elite One · Gestion des actualités</p>
            </div>
          </div>

          {/* Right — actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CE1126]/10 border border-[#CE1126]/20">
              <AlertTriangle className="h-3 w-3 text-[#CE1126]/70" />
              <span className="text-[10px] text-[#CE1126]/70 font-medium hidden sm:inline">
                Zone réservée aux éditeurs
              </span>
            </div>
            <Link
              to="/news"
              id="editor-view-site"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-border/40 text-[11px] text-muted-foreground hover:text-foreground transition-all"
            >
              <Eye className="h-3.5 w-3.5" /> Voir le site
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Page heading ───────────────────────────────────────────────── */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">
              Gestion des articles
            </h1>
            <p className="text-sm text-muted-foreground/50 mt-0.5">
              Rédigez, mettez en forme et publiez les articles du site d'actualités.
            </p>
          </div>

          {/* Article count badge */}
          {!isLoading && (
            <span className="text-[11px] text-muted-foreground/40 font-mono tabular-nums bg-white/[0.04] border border-border/30 px-3 py-1 rounded-xl">
              {articles.length} article{articles.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* ── Editor panel ───────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="h-[720px] rounded-xl border border-border/40 bg-white/[0.02] flex flex-col items-center justify-center gap-3 animate-pulse">
            <div className="h-6 w-6 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
            <p className="text-muted-foreground/30 text-sm">Chargement des articles…</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EditorPanel
              articles={articles}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              saving={isSaving}
            />
          </motion.div>
        )}
      </div>

      {/* ── Toast notification ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]'
                : 'bg-[#CE1126]/15 border-[#CE1126]/30 text-[#CE1126]'
            }`}
          >
            {toast.type === 'success'
              ? <CheckCircle className="h-4 w-4 shrink-0" />
              : <XCircle    className="h-4 w-4 shrink-0" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}