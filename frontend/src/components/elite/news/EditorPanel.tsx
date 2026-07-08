import {
  useState, useRef, useCallback, useEffect, useMemo, memo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Save, Send, Eye, Edit3, Trash2,
  FileText, CheckCircle, Clock, Archive,
  Tag, AlignLeft, Type, Star,
  X, Bold, Italic, Underline, List, ListOrdered,
  Link2, Quote, Heading2, Heading3, Minus,
  ImagePlus, Film, Loader2, Hash, PenSquare, Layers,
} from 'lucide-react';
import { CategoryBadge } from './ArticleCard';
import { SingleMediaUploader, GalleryUploader } from './MediaUploader';
import { newsApi, slugify } from '@/services/newsApi';
import { CATEGORY_META } from '@/types/news.types';
import type {
  Article, ArticleCategory, ArticleStatus, CreateArticlePayload,
} from '@/types/news.types';

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: ArticleStatus }) => {
  const cfg = {
    PUBLISHED: { icon: CheckCircle, label: 'Publié',    color: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/25' },
    DRAFT:     { icon: Clock,       label: 'Brouillon', color: 'text-[#FCD116] bg-[#FCD116]/10 border-[#FCD116]/25' },
    ARCHIVED:  { icon: Archive,     label: 'Archivé',   color: 'text-muted-foreground bg-white/5 border-border/30' },
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
    {article.imageUrl ? (
      <img src={article.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0 border border-border/30" />
    ) : (
      <div className="h-10 w-10 rounded-lg bg-white/[0.04] border border-border/30 flex items-center justify-center shrink-0">
        <FileText className="h-3.5 w-3.5 text-muted-foreground/30" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
        <StatusBadge status={article.status} />
        {article.featured && (
          <span className="text-[9px] text-accent font-bold flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5" /> Une
          </span>
        )}
        {article.videoUrl && (
          <span className="text-[9px] text-muted-foreground/50 font-bold flex items-center gap-0.5">
            <Film className="h-2.5 w-2.5" />
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

// ─── Form helpers ─────────────────────────────────────────────────────────────
const EMPTY_FORM: CreateArticlePayload = {
  title: '', slug: '', excerpt: '', content: '',
  category: 'CLUB_NEWS', status: 'DRAFT',
  featured: false, imageUrl: '', gallery: [], videoUrl: '', videoThumbnail: '',
  author: '', tags: [],
};

const FormField = ({
  label, icon: Icon, children,
}: {
  label: string;
  icon: React.FC<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <div>
    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
      <Icon className="h-3 w-3" />{label}
    </label>
    {children}
  </div>
);

const inputCls = 'w-full bg-white/[0.04] border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent/50 transition-colors';

// ─── Rich text toolbar button ─────────────────────────────────────────────────
const ToolBtn = ({
  onClick, title, active, disabled, children,
}: {
  onClick: () => void; title: string; active?: boolean; disabled?: boolean; children: React.ReactNode;
}) => (
  <button
    type="button"
    onMouseDown={e => { e.preventDefault(); if (!disabled) onClick(); }}
    title={title}
    disabled={disabled}
    className={`h-7 w-7 flex items-center justify-center rounded transition-colors text-xs disabled:opacity-30 ${
      active
        ? 'bg-accent/20 text-accent'
        : 'text-muted-foreground/60 hover:bg-white/[0.07] hover:text-foreground'
    }`}
  >
    {children}
  </button>
);

const ToolSep = () => (
  <div className="h-4 w-px bg-border/40 mx-0.5" />
);

// ─── Rich Text Editor ─────────────────────────────────────────────────────────
interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

function RichEditor({ value, onChange }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [uploadingMedia, setUploadingMedia] = useState<'image' | 'video' | null>(null);
  const savedRangeRef = useRef<Range | null>(null);

  // Sync value only when content differs (avoid caret reset on every keystroke)
  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== value) {
      el.innerHTML = value;
      setWordCount(el.textContent?.trim().split(/\s+/).filter(Boolean).length ?? 0);
    }
  }, [value]);

  const rememberSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
    editorRef.current?.focus();
  }, []);

  const exec = useCallback((cmd: string, arg?: string) => {
    restoreSelection();
    document.execCommand(cmd, false, arg);
    editorRef.current?.focus();
    const html = editorRef.current?.innerHTML ?? '';
    onChange(html);
  }, [onChange, restoreSelection]);

  const handleInput = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? '';
    onChange(html);
    setWordCount(editorRef.current?.textContent?.trim().split(/\s+/).filter(Boolean).length ?? 0);
  }, [onChange]);

  const insertLink = useCallback(() => {
    const url = window.prompt('URL du lien :', 'https://');
    if (url) exec('createLink', url);
  }, [exec]);

  const insertImage = useCallback(async (file: File) => {
    setUploadingMedia('image');
    try {
      const url = await newsApi.uploadMedia(file, 'gallery');
      exec('insertHTML', `<img src="${url}" alt="" class="rounded-lg my-3" />`);
    } catch {
      window.alert("Échec du téléversement de l'image.");
    } finally {
      setUploadingMedia(null);
    }
  }, [exec]);

  const insertVideo = useCallback(async (file: File) => {
    setUploadingMedia('video');
    try {
      const url = await newsApi.uploadMedia(file, 'video');
      exec('insertHTML', `<video src="${url}" controls class="w-full rounded-lg my-3"></video>`);
    } catch {
      window.alert('Échec du téléversement de la vidéo.');
    } finally {
      setUploadingMedia(null);
    }
  }, [exec]);

  return (
    <div className="flex flex-col border border-border/50 rounded-xl overflow-hidden bg-white/[0.02]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border/40 bg-white/[0.02]">
        <ToolBtn onClick={() => exec('bold')}      title="Gras (Ctrl+B)">   <Bold        className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('italic')}    title="Italique (Ctrl+I)"><Italic      className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('underline')} title="Souligné (Ctrl+U)"><Underline   className="h-3.5 w-3.5" /></ToolBtn>
        <ToolSep />
        <ToolBtn onClick={() => exec('formatBlock', '<h2>')}   title="Titre H2"> <Heading2    className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', '<h3>')}   title="Titre H3"> <Heading3    className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', '<p>')}    title="Paragraphe"><AlignLeft  className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', '<blockquote>')} title="Citation"><Quote className="h-3.5 w-3.5" /></ToolBtn>
        <ToolSep />
        <ToolBtn onClick={() => exec('insertUnorderedList')}   title="Liste à puces">   <List        className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec('insertOrderedList')}     title="Liste numérotée"> <ListOrdered className="h-3.5 w-3.5" /></ToolBtn>
        <ToolSep />
        <ToolBtn onClick={insertLink}                          title="Insérer un lien">  <Link2       className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn
          onClick={() => { rememberSelection(); imageInputRef.current?.click(); }}
          title="Insérer une image"
          disabled={uploadingMedia !== null}
        >
          {uploadingMedia === 'image' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
        </ToolBtn>
        <ToolBtn
          onClick={() => { rememberSelection(); videoInputRef.current?.click(); }}
          title="Insérer une vidéo"
          disabled={uploadingMedia !== null}
        >
          {uploadingMedia === 'video' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Film className="h-3.5 w-3.5" />}
        </ToolBtn>
        <ToolBtn onClick={() => exec('insertHorizontalRule')}  title="Séparateur">       <Minus       className="h-3.5 w-3.5" /></ToolBtn>
        <ToolSep />
        <ToolBtn onClick={() => exec('removeFormat')}          title="Effacer la mise en forme">
          <X className="h-3.5 w-3.5" />
        </ToolBtn>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        id="rich-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onMouseUp={rememberSelection}
        onKeyUp={rememberSelection}
        data-placeholder="Commencez à rédiger votre article ici…"
        className={[
          'min-h-[280px] px-4 py-3 text-sm text-foreground/90 leading-relaxed focus:outline-none overflow-y-auto',
          'prose prose-invert prose-sm max-w-none',
          '[&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2',
          '[&_h3]:text-sm  [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1',
          '[&_blockquote]:border-l-2 [&_blockquote]:border-accent/50 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground/70 [&_blockquote]:italic',
          '[&_ul]:list-disc  [&_ul]:pl-5',
          '[&_ol]:list-decimal [&_ol]:pl-5',
          '[&_a]:text-accent [&_a]:underline',
          '[&_hr]:border-border/30',
          '[&_img]:max-w-full [&_video]:max-w-full',
          'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/25',
        ].join(' ')}
      />

      {/* Footer info */}
      <div className="px-4 py-1.5 border-t border-border/30 bg-white/[0.01] flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground/30">
          Insérez des images et vidéos directement dans le corps du texte
        </span>
        <span className="text-[10px] text-muted-foreground/30 tabular-nums">
          {wordCount} mots · {Math.max(1, Math.ceil(wordCount / 200))} min de lecture
        </span>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) void insertImage(f); e.target.value = ''; }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) void insertVideo(f); e.target.value = ''; }}
      />
    </div>
  );
}

// ─── Inspector section wrapper ─────────────────────────────────────────────────
const InspectorSection = ({
  title, icon: Icon, children,
}: {
  title: string;
  icon: React.FC<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <div className="border-b border-border/30 p-4 space-y-4">
    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
      <Icon className="h-3 w-3" />{title}
    </div>
    {children}
  </div>
);

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
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [form,          setForm]          = useState<CreateArticlePayload>(EMPTY_FORM);
  const [tagInput,      setTagInput]      = useState('');
  const [preview,       setPreview]       = useState(false);
  const [filterStatus,  setFilterStatus]  = useState<ArticleStatus | 'ALL'>('ALL');
  const [slugTouched,   setSlugTouched]   = useState(false);

  const selectedArticle = articles.find(a => a.id === selectedId);

  const handleSelect = useCallback((article: Article) => {
    setSelectedId(article.id);
    setForm({
      title:          article.title,
      slug:           article.slug,
      excerpt:        article.excerpt,
      content:        article.content,
      category:       article.category,
      status:         article.status,
      featured:       article.featured,
      imageUrl:       article.imageUrl ?? '',
      gallery:        article.gallery ?? [],
      videoUrl:       article.videoUrl ?? '',
      videoThumbnail: article.videoThumbnail ?? '',
      author:         article.author?.name ?? '',
      tags:           article.tags,
    });
    setSlugTouched(true);
    setPreview(false);
  }, []);

  const handleNew = useCallback(() => {
    setSelectedId(null);
    setForm(EMPTY_FORM);
    setTagInput('');
    setSlugTouched(false);
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

  const handleTitleChange = useCallback((title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : slugify(title),
    }));
  }, [slugTouched]);

  const filteredArticles = filterStatus === 'ALL'
    ? articles
    : articles.filter(a => a.status === filterStatus);

  const wordCount = useMemo(
    () => form.content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length,
    [form.content],
  );

  return (
    <div className="flex gap-0 h-full min-h-[720px] rounded-xl border border-border/50 overflow-hidden">

      {/* ── LEFT SIDEBAR — article list ────────────────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-border/40 bg-white/[0.02] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground/80">Articles</h3>
            <button
              id="editor-new-btn"
              onClick={handleNew}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent text-black text-[11px] font-bold hover:bg-accent/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Nouveau
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1">
            {(['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map(s => (
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
            { label: 'Publiés',    value: articles.filter(a => a.status === 'PUBLISHED').length, color: 'text-[#10B981]' },
            { label: 'Brouillons', value: articles.filter(a => a.status === 'DRAFT').length,     color: 'text-[#FCD116]' },
            { label: 'Total',      value: articles.length,                                        color: 'text-foreground' },
          ].map(s => (
            <div key={s.label}>
              <p className={`font-display text-lg tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CENTER — editor / preview ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-border/40">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-white/[0.01] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            <span className="text-sm font-semibold text-foreground/70 truncate max-w-xs">
              {selectedId ? (selectedArticle?.title || 'Sans titre') : 'Nouvel article'}
            </span>
            {selectedArticle && <StatusBadge status={selectedArticle.status} />}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="editor-preview-btn"
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
              id="editor-draft-btn"
              onClick={() => handleSave('DRAFT')}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-border/40 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              Brouillon
            </button>
            <button
              id="editor-publish-btn"
              onClick={() => handleSave('PUBLISHED')}
              disabled={saving || !form.title.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent text-black text-[11px] font-bold hover:bg-accent/90 transition-all shadow-[0_0_10px_rgba(252,209,22,0.20)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
              {saving ? 'Publication…' : 'Publier'}
            </button>
          </div>
        </div>

        {/* Editor / Preview body */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {preview ? (
              /* ── Preview ────────────────────────────────────────────────── */
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto px-6 py-8"
              >
                <CategoryBadge category={form.category} />
                <h1 className="font-display text-3xl font-black text-foreground mt-4 leading-tight">
                  {form.title || <span className="text-muted-foreground/30">Titre de l'article…</span>}
                </h1>
                <p className="text-muted-foreground/60 mt-3 text-base leading-relaxed">
                  {form.excerpt || <span className="text-muted-foreground/30">Résumé…</span>}
                </p>
                {form.videoUrl ? (
                  /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/i.test(form.videoUrl) ? (
                    <div className="mt-5 aspect-video rounded-xl overflow-hidden bg-black/40 flex items-center justify-center text-[11px] text-muted-foreground/40">
                      Vidéo intégrée · {form.videoUrl}
                    </div>
                  ) : (
                    <video src={form.videoUrl} controls className="w-full rounded-xl mt-5 aspect-video object-cover" />
                  )
                ) : form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt="Cover"
                    className="w-full rounded-xl mt-5 aspect-[16/9] object-cover"
                  />
                )}
                <div
                  className="mt-6 prose prose-invert prose-sm max-w-none text-foreground/80 leading-relaxed [&_img]:rounded-lg [&_video]:rounded-lg [&_video]:w-full"
                  dangerouslySetInnerHTML={{ __html: form.content || '<p class="text-muted-foreground/30">Contenu de l\'article…</p>' }}
                />
                {form.gallery && form.gallery.length > 0 && (
                  <div className="mt-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3">Galerie</p>
                    <div className="grid grid-cols-3 gap-2">
                      {form.gallery.map(src => (
                        <img key={src} src={src} alt="" className="aspect-square rounded-lg object-cover" />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              /* ── Editor form ─────────────────────────────────────────────── */
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 space-y-5"
              >
                {/* Title */}
                <FormField label="Titre" icon={Type}>
                  <input
                    id="editor-title"
                    value={form.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="Titre accrocheur de l'article…"
                    className={`${inputCls} text-base font-semibold`}
                  />
                </FormField>

                {/* Slug */}
                <FormField label="Slug (URL)" icon={Hash}>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground/30 shrink-0">/news/</span>
                    <input
                      id="editor-slug"
                      value={form.slug ?? ''}
                      onChange={e => { setSlugTouched(true); setForm(p => ({ ...p, slug: slugify(e.target.value) })); }}
                      placeholder="titre-de-larticle"
                      className={`${inputCls} font-mono text-xs`}
                    />
                  </div>
                </FormField>

                {/* Excerpt */}
                <FormField label="Résumé" icon={AlignLeft}>
                  <textarea
                    id="editor-excerpt"
                    value={form.excerpt}
                    onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                    placeholder="Court résumé affiché dans les listings et les aperçus…"
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </FormField>

                {/* Rich Text Content */}
                <FormField label="Contenu" icon={Edit3}>
                  <RichEditor
                    value={form.content}
                    onChange={html => setForm(p => ({ ...p, content: html }))}
                  />
                </FormField>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── RIGHT — inspector panel ────────────────────────────────────────── */}
      <div className="w-80 shrink-0 bg-white/[0.015] flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center gap-1.5 text-sm font-bold text-foreground/80">
            <Layers className="h-3.5 w-3.5 text-muted-foreground/40" />
            Propriétés
          </div>
        </div>

        {/* Publishing */}
        <InspectorSection title="Publication" icon={PenSquare}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-muted-foreground/40 mb-1.5">Statut</label>
              <select
                id="editor-status"
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as ArticleStatus }))}
                className={inputCls}
              >
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-muted-foreground/40 mb-1.5">Catégorie</label>
              <select
                id="editor-category"
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value as ArticleCategory }))}
                className={inputCls}
              >
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 bg-white/[0.04] border border-border/50 rounded-xl px-4 py-2.5 cursor-pointer hover:border-border/70 transition-colors">
            <div
              onClick={() => setForm(p => ({ ...p, featured: !p.featured }))}
              className={`h-4 w-8 rounded-full transition-colors relative shrink-0 ${form.featured ? 'bg-accent' : 'bg-white/10'}`}
            >
              <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${form.featured ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-muted-foreground/70">Mettre à la une</span>
          </label>

          <div>
            <label className="block text-[10px] text-muted-foreground/40 mb-1.5">Auteur</label>
            <input
              id="editor-author"
              value={form.author ?? ''}
              onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
              placeholder="Nom du rédacteur"
              className={inputCls}
            />
          </div>
        </InspectorSection>

        {/* Cover image */}
        <InspectorSection title="Image de couverture" icon={ImagePlus}>
          <SingleMediaUploader
            label="Couverture"
            value={form.imageUrl}
            field="cover"
            accept="image/*"
            kind="image"
            onChange={url => setForm(p => ({ ...p, imageUrl: url ?? '' }))}
            helpText="JPG, PNG ou WebP · utilisée dans les listings et l'en-tête de l'article"
          />
        </InspectorSection>

        {/* Video */}
        <InspectorSection title="Vidéo" icon={Film}>
          <SingleMediaUploader
            label="Vidéo principale"
            value={form.videoUrl}
            field="video"
            accept="video/mp4,video/quicktime,video/webm"
            kind="video"
            onChange={url => setForm(p => ({ ...p, videoUrl: url ?? '' }))}
            helpText="MP4 recommandé, ou collez un lien YouTube / Vimeo"
            allowUrl
          />
        </InspectorSection>

        {/* Gallery */}
        <InspectorSection title="Galerie" icon={ImagePlus}>
          <GalleryUploader
            images={form.gallery ?? []}
            onChange={images => setForm(p => ({ ...p, gallery: images }))}
          />
        </InspectorSection>

        {/* Tags */}
        <InspectorSection title="Tags" icon={Tag}>
          <div className="flex gap-2">
            <input
              id="editor-tag-input"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder="Ajouter un tag…"
              className={`${inputCls} flex-1`}
            />
            <button onClick={addTag} type="button"
              className="px-3 py-2 rounded-xl bg-white/[0.06] border border-border/40 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map(tag => (
                <span key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] border border-border/30 text-[11px] text-foreground/70"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-muted-foreground/40 hover:text-foreground transition-colors">
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </InspectorSection>

        {/* Summary */}
        <div className="p-4 space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground/40">Longueur</span>
            <span className="text-muted-foreground/70 tabular-nums">{wordCount} mots</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground/40">Lecture estimée</span>
            <span className="text-muted-foreground/70 tabular-nums">{Math.max(1, Math.ceil(wordCount / 200))} min</span>
          </div>
        </div>
      </div>
    </div>
  );
});
EditorPanel.displayName = 'EditorPanel';
