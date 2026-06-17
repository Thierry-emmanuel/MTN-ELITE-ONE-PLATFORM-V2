import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Save, Send, Eye, Edit3, Trash2,
  FileText, CheckCircle, Clock, Archive,
  Image, Tag, AlignLeft, Type, Star,
  X,
} from 'lucide-react';
import { CategoryBadge } from './ArticleCard';
import { CATEGORY_META } from '@/types/news.types';
import type {
  Article, ArticleCategory, ArticleStatus, CreateArticlePayload,
} from '@/types/news.types';

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: ArticleStatus }) => {
  const cfg = {
    PUBLISHED: { icon: CheckCircle, label: 'Publié',   color: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/25' },
    DRAFT:     { icon: Clock,       label: 'Brouillon', color: 'text-[#FCD116] bg-[#FCD116]/10 border-[#FCD116]/25' },
    ARCHIVED:  { icon: Archive,     label: 'Archivé',  color: 'text-muted-foreground bg-white/5 border-border/30' },
  }[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
      <Icon className="h-2.5 w-2.5" />{cfg.label}
    </span>
  );
};

// ─── Article list item ────────────────────────────────────────────────────────
const ArticleListItem = memo(({
  article, active, onSelect, onDelete,
}: {
  article: Article; active: boolean;
  onSelect: () => void; onDelete: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -6 }}
    animate={{ opacity: 1, x: 0 }}
    onClick={onSelect}
    className={`group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
      active
        ? 'bg-accent/10 border border-accent/25'
        : 'hover:bg-white/[0.04] border border-transparent'
    }`}
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
        <StatusBadge status={article.status} />
        {article.featured && (
          <span className="text-[9px] text-accent font-bold flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5" /> Une
          </span>
        )}
      </div>
      <p className={`text-[12px] font-semibold line-clamp-2 leading-snug ${active ? 'text-accent' : 'text-foreground/80 group-hover:text-foreground'}`}>
        {article.title}
      </p>
      <p className="text-[10px] text-muted-foreground/40 mt-1">
        {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
        {' · '}
        {CATEGORY_META[article.category].label}
      </p>
    </div>
    <button
      onClick={e => { e.stopPropagation(); onDelete(); }}
      className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-[#CE1126] transition-all shrink-0 mt-1"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  </motion.div>
));
ArticleListItem.displayName = 'ArticleListItem';

// ─── Editor form ──────────────────────────────────────────────────────────────
const EMPTY_FORM: CreateArticlePayload = {
  title: '', excerpt: '', content: '',
  category: 'CLUB_NEWS', status: 'DRAFT',
  featured: false, imageUrl: '', tags: [],
};

const FormField = ({ label, icon: Icon, children }: {
  label: string; icon: React.FC<{ className?: string }>; children: React.ReactNode;
}) => (
  <div>
    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
      <Icon className="h-3 w-3" />{label}
    </label>
    {children}
  </div>
);

const inputCls = 'w-full bg-white/[0.04] border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent/50 transition-colors';

// ─── EditorPanel ─────────────────────────────────────────────────────────────
interface EditorPanelProps {
  articles: Article[];
  onCreate: (payload: CreateArticlePayload) => Promise<void>;
  onUpdate: (id: string, payload: Partial<CreateArticlePayload>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  saving?: boolean;
}

export const EditorPanel = memo(({
  articles, onCreate, onUpdate, onDelete, saving = false,
}: EditorPanelProps) => {
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [form,        setForm]        = useState<CreateArticlePayload>(EMPTY_FORM);
  const [tagInput,    setTagInput]    = useState('');
  const [preview,     setPreview]     = useState(false);
  const [filterStatus, setFilterStatus] = useState<ArticleStatus | 'ALL'>('ALL');

  const selectedArticle = articles.find(a => a.id === selectedId);

  const handleSelect = useCallback((article: Article) => {
    setSelectedId(article.id);
    setForm({
      title:    article.title,
      excerpt:  article.excerpt,
      content:  article.content,
      category: article.category,
      status:   article.status,
      featured: article.featured,
      imageUrl: article.imageUrl ?? '',
      tags:     article.tags,
    });
    setPreview(false);
  }, []);

  const handleNew = useCallback(() => {
    setSelectedId(null);
    setForm(EMPTY_FORM);
    setTagInput('');
    setPreview(false);
  }, []);

  const handleSave = useCallback(async (status: ArticleStatus = form.status) => {
    const payload = { ...form, status };
    if (selectedId) {
      await onUpdate(selectedId, payload);
    } else {
      await onCreate(payload);
    }
  }, [form, selectedId, onCreate, onUpdate]);

  const addTag = useCallback(() => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, t] }));
    }
    setTagInput('');
  }, [tagInput, form.tags]);

  const removeTag = useCallback((tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  }, []);

  const filteredArticles = filterStatus === 'ALL'
    ? articles
    : articles.filter(a => a.status === filterStatus);

  return (
    <div className="flex gap-0 h-full min-h-[600px] rounded-xl border border-border/50 overflow-hidden">

      {/* ── LEFT SIDEBAR — article list ────────────────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-border/40 bg-white/[0.02] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground/80">Articles</h3>
            <button
              onClick={handleNew}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent text-black text-[11px] font-bold hover:bg-accent/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Nouveau
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1">
            {(['ALL','PUBLISHED','DRAFT','ARCHIVED'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`flex-1 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wide transition-all ${
                  filterStatus === s
                    ? 'bg-white/10 text-foreground'
                    : 'text-muted-foreground/40 hover:text-muted-foreground'
                }`}
              >
                {s === 'ALL' ? 'Tous' : s === 'PUBLISHED' ? 'Pub.' : s === 'DRAFT' ? 'Draft' : 'Arc.'}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredArticles.length === 0 ? (
            <p className="text-[11px] text-muted-foreground/30 text-center py-8">Aucun article</p>
          ) : (
            filteredArticles.map(a => (
              <ArticleListItem
                key={a.id}
                article={a}
                active={selectedId === a.id}
                onSelect={() => handleSelect(a)}
                onDelete={() => onDelete(a.id)}
              />
            ))
          )}
        </div>

        {/* Stats footer */}
        <div className="p-3 border-t border-border/30 grid grid-cols-3 gap-1 text-center">
          {[
            { label: 'Publiés', value: articles.filter(a => a.status === 'PUBLISHED').length, color: 'text-[#10B981]' },
            { label: 'Brouillons', value: articles.filter(a => a.status === 'DRAFT').length,  color: 'text-[#FCD116]' },
            { label: 'Total', value: articles.length, color: 'text-foreground' },
          ].map(s => (
            <div key={s.label}>
              <p className={`font-display text-lg tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT — editor / preview ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground/50" />
            <span className="text-sm font-semibold text-foreground/70 truncate max-w-xs">
              {selectedId ? (selectedArticle?.title || 'Sans titre') : 'Nouvel article'}
            </span>
            {selectedArticle && <StatusBadge status={selectedArticle.status} />}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                preview
                  ? 'bg-accent/10 border-accent/30 text-accent'
                  : 'bg-white/[0.04] border-border/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              {preview ? 'Éditer' : 'Prévisualiser'}
            </button>
            <button
              onClick={() => handleSave('DRAFT')}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-border/40 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              Brouillon
            </button>
            <button
              onClick={() => handleSave('PUBLISHED')}
              disabled={saving || !form.title.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent text-black text-[11px] font-bold hover:bg-accent/90 transition-all shadow-[0_0_10px_rgba(252,209,22,0.20)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
              {saving ? 'Publication…' : 'Publier'}
            </button>
          </div>
        </div>

        {/* Editor / Preview */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {preview ? (
              /* ── Preview ────────────────────────────────────────────────── */
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto px-6 py-8">
                <CategoryBadge category={form.category} />
                <h1 className="font-display text-3xl font-black text-foreground mt-4 leading-tight">
                  {form.title || <span className="text-muted-foreground/30">Titre de l'article…</span>}
                </h1>
                <p className="text-muted-foreground/60 mt-3 text-base leading-relaxed">
                  {form.excerpt || <span className="text-muted-foreground/30">Résumé…</span>}
                </p>
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="Cover" className="w-full rounded-xl mt-5 aspect-[16/9] object-cover" />
                )}
                <div
                  className="mt-6 prose prose-invert prose-sm max-w-none text-foreground/80 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: form.content || '<p class="text-muted-foreground/30">Contenu de l\'article…</p>' }}
                />
              </motion.div>
            ) : (
              /* ── Editor form ─────────────────────────────────────────────── */
              <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-5 space-y-5">

                {/* Title */}
                <FormField label="Titre" icon={Type}>
                  <input
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Titre accrocheur de l'article…"
                    className={`${inputCls} text-base font-semibold`}
                  />
                </FormField>

                {/* Excerpt */}
                <FormField label="Résumé" icon={AlignLeft}>
                  <textarea
                    value={form.excerpt}
                    onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                    placeholder="Court résumé affiché dans les listings et les aperçus…"
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </FormField>

                {/* Category + Status + Featured row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Catégorie" icon={Tag}>
                    <select
                      value={form.category}
                      onChange={e => setForm(p => ({ ...p, category: e.target.value as ArticleCategory }))}
                      className={inputCls}
                    >
                      {Object.entries(CATEGORY_META).map(([key, meta]) => (
                        <option key={key} value={key}>{meta.label}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Statut" icon={CheckCircle}>
                    <select
                      value={form.status}
                      onChange={e => setForm(p => ({ ...p, status: e.target.value as ArticleStatus }))}
                      className={inputCls}
                    >
                      <option value="DRAFT">Brouillon</option>
                      <option value="PUBLISHED">Publié</option>
                      <option value="ARCHIVED">Archivé</option>
                    </select>
                  </FormField>

                  <FormField label="Options" icon={Star}>
                    <label className="flex items-center gap-3 h-[42px] bg-white/[0.04] border border-border/50 rounded-xl px-4 cursor-pointer hover:border-border/70 transition-colors">
                      <div
                        onClick={() => setForm(p => ({ ...p, featured: !p.featured }))}
                        className={`h-4 w-8 rounded-full transition-colors relative ${form.featured ? 'bg-accent' : 'bg-white/10'}`}
                      >
                        <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${form.featured ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-sm text-muted-foreground/70">À la une</span>
                    </label>
                  </FormField>
                </div>

                {/* Image URL */}
                <FormField label="Image de couverture (URL)" icon={Image}>
                  <input
                    value={form.imageUrl}
                    onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="https://… ou /assets/images/…"
                    className={inputCls}
                  />
                </FormField>

                {/* Tags */}
                <FormField label="Tags" icon={Tag}>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                        placeholder="Ajouter un tag et appuyer sur Entrée…"
                        className={`${inputCls} flex-1`}
                      />
                      <button onClick={addTag} type="button"
                        className="px-3 py-2 rounded-xl bg-white/[0.06] border border-border/40 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    {form.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {form.tags.map(tag => (
                          <span key={tag}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] border border-border/30 text-[11px] text-foreground/70">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="text-muted-foreground/40 hover:text-foreground transition-colors">
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </FormField>

                {/* Content */}
                <FormField label="Contenu (HTML supporté)" icon={Edit3}>
                  <textarea
                    value={form.content}
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    placeholder={`<p>Commencez à rédiger votre article ici…</p>\n\n<h2>Sous-titre</h2>\n<p>Contenu de la section…</p>`}
                    rows={18}
                    className={`${inputCls} resize-y font-mono text-xs leading-relaxed`}
                  />
                  <p className="text-[10px] text-muted-foreground/30 mt-1">
                    HTML basique supporté : &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;
                  </p>
                </FormField>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});
EditorPanel.displayName = 'EditorPanel';