import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, Reply, Send, MessageCircle, ChevronDown } from 'lucide-react';
import type { Comment, CommentReply } from '@/types/news.types';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins  / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0) return `Il y a ${days}j`;
  if (hours > 0) return `Il y a ${hours}h`;
  if (mins  > 0) return `Il y a ${mins}min`;
  return 'À l\'instant';
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => (
  <div
    className="rounded-full bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center shrink-0 font-bold text-muted-foreground/70"
    style={{ width: size, height: size, fontSize: size * 0.33 }}
  >
    {initials(name)}
  </div>
);

// ─── Reply component ──────────────────────────────────────────────────────────
const ReplyItem = memo(({ reply }: { reply: CommentReply }) => {
  const [likes, setLikes] = useState(reply.likes);
  const [liked, setLiked] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3 ml-12 mt-3 pt-3 border-t border-border/20"
    >
      <Avatar name={reply.authorName} size={28} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[12px] font-bold text-foreground/80">{reply.authorName}</span>
          <span className="text-[10px] text-muted-foreground/40">{timeAgo(reply.createdAt)}</span>
        </div>
        <p className="text-[12px] text-foreground/70 leading-relaxed">{reply.content}</p>
        <button
          onClick={() => { if (!liked) { setLikes(l => l + 1); setLiked(true); } }}
          className={`flex items-center gap-1 mt-1.5 text-[10px] transition-colors ${liked ? 'text-accent' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}
        >
          <ThumbsUp className="h-3 w-3" />{likes}
        </button>
      </div>
    </motion.div>
  );
});
ReplyItem.displayName = 'ReplyItem';

// ─── Reply form ───────────────────────────────────────────────────────────────
const ReplyForm = memo(({ onSubmit, onCancel }: {
  onSubmit: (name: string, content: string) => void;
  onCancel: () => void;
}) => {
  const [name,    setName]    = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    onSubmit(name.trim(), content.trim());
    setName(''); setContent('');
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="ml-12 mt-3 space-y-2"
    >
      <input
        value={name} onChange={e => setName(e.target.value)}
        placeholder="Votre prénom"
        className="w-full bg-white/[0.04] border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent/40 transition-colors"
      />
      <textarea
        value={content} onChange={e => setContent(e.target.value)}
        placeholder="Votre réponse…"
        rows={2}
        className="w-full bg-white/[0.04] border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent/40 transition-colors resize-none"
      />
      <div className="flex gap-2">
        <button type="submit"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-black text-[11px] font-bold uppercase tracking-wide hover:bg-accent/90 transition-colors">
          <Send className="h-3 w-3" /> Répondre
        </button>
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground border border-border/40 transition-colors">
          Annuler
        </button>
      </div>
    </motion.form>
  );
});
ReplyForm.displayName = 'ReplyForm';

// ─── Single comment ───────────────────────────────────────────────────────────
const CommentItem = memo(({ comment, onReply }: {
  comment: Comment;
  onReply: (commentId: string, name: string, content: string) => void;
}) => {
  const [likes,        setLikes]        = useState(comment.likes);
  const [liked,        setLiked]        = useState(false);
  const [showReply,    setShowReply]    = useState(false);
  const [showReplies,  setShowReplies]  = useState(false);
  const replyCount = comment.replies?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-5 border-b border-border/20 last:border-0"
    >
      <div className="flex gap-3">
        <Avatar name={comment.authorName} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-foreground/90">{comment.authorName}</span>
            <span className="text-[10px] text-muted-foreground/40">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-foreground/70 leading-relaxed">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2.5">
            <button
              onClick={() => { if (!liked) { setLikes(l => l + 1); setLiked(true); } }}
              className={`flex items-center gap-1.5 text-[11px] transition-colors ${liked ? 'text-accent font-semibold' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}
            >
              <ThumbsUp className="h-3.5 w-3.5" /> {likes}
            </button>
            <button
              onClick={() => setShowReply(v => !v)}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              <Reply className="h-3.5 w-3.5" /> Répondre
            </button>
            {replyCount > 0 && (
              <button
                onClick={() => setShowReplies(v => !v)}
                className="flex items-center gap-1 text-[11px] text-accent/60 hover:text-accent transition-colors"
              >
                <ChevronDown className={`h-3 w-3 transition-transform ${showReplies ? 'rotate-180' : ''}`} />
                {replyCount} réponse{replyCount > 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* Reply form */}
          <AnimatePresence>
            {showReply && (
              <ReplyForm
                onSubmit={(name, content) => {
                  onReply(comment.id, name, content);
                  setShowReply(false);
                  setShowReplies(true);
                }}
                onCancel={() => setShowReply(false)}
              />
            )}
          </AnimatePresence>

          {/* Replies */}
          <AnimatePresence>
            {showReplies && comment.replies?.map(r => (
              <ReplyItem key={r.id} reply={r} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
});
CommentItem.displayName = 'CommentItem';

// ─── New comment form ─────────────────────────────────────────────────────────
const NewCommentForm = memo(({ onSubmit }: { onSubmit: (name: string, content: string) => void }) => {
  const [name,    setName]    = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    onSubmit(name.trim(), content.trim());
    setContent('');
  }, [name, content, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border/50 bg-white/[0.02] p-5 space-y-3">
      <h4 className="text-sm font-bold text-foreground/80">Laisser un commentaire</h4>
      <input
        value={name} onChange={e => setName(e.target.value)}
        placeholder="Votre nom *"
        required
        className="w-full bg-white/[0.04] border border-border/40 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent/50 transition-colors"
      />
      <textarea
        value={content} onChange={e => setContent(e.target.value)}
        placeholder="Partagez votre avis sur cet article…"
        required
        rows={4}
        className="w-full bg-white/[0.04] border border-border/40 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent/50 transition-colors resize-none"
      />
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground/30">
          Soyez respectueux et constructif dans vos commentaires.
        </p>
        <button type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-black text-sm font-bold uppercase tracking-wide hover:bg-accent/90 transition-colors shadow-[0_0_12px_rgba(252,209,22,0.20)]"
        >
          <Send className="h-4 w-4" /> Publier
        </button>
      </div>
    </form>
  );
});
NewCommentForm.displayName = 'NewCommentForm';

// ─── CommentsSection ──────────────────────────────────────────────────────────
interface CommentsSectionProps {
  articleId: string;
  initialComments?: Comment[];
  loading?: boolean;
}

export const CommentsSection = memo(({ articleId, initialComments = [], loading = false }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);

  const handleNewComment = useCallback((name: string, content: string) => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      articleId,
      authorName: name,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: [],
    };
    setComments(prev => [newComment, ...prev]);
  }, [articleId]);

  const handleReply = useCallback((commentId: string, name: string, content: string) => {
    const reply: CommentReply = {
      id: `r-${Date.now()}`,
      authorName: name,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    setComments(prev => prev.map(c =>
      c.id === commentId
        ? { ...c, replies: [...(c.replies ?? []), reply] }
        : c,
    ));
  }, []);

  return (
    <section className="mt-12" aria-label="Commentaires">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5 text-accent/70" />
        <h3 className="text-lg font-display font-bold text-foreground">
          Commentaires
          {comments.length > 0 && (
            <span className="ml-2 text-base text-muted-foreground/50 font-normal">({comments.length})</span>
          )}
        </h3>
      </div>

      <NewCommentForm onSubmit={handleNewComment} />

      <div className="mt-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="py-5 border-b border-border/20 flex gap-3 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-white/[0.05] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-white/[0.06]" />
                <div className="h-3 rounded bg-white/[0.04]" />
                <div className="h-3 w-3/4 rounded bg-white/[0.04]" />
              </div>
            </div>
          ))
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground/40 text-center py-8">
            Aucun commentaire pour l'instant. Soyez le premier à réagir !
          </p>
        ) : (
          comments.map(c => (
            <CommentItem key={c.id} comment={c} onReply={handleReply} />
          ))
        )}
      </div>
    </section>
  );
});
CommentsSection.displayName = 'CommentsSection';