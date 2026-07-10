import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Share2, User } from 'lucide-react';
import { MOCK_STORIES } from '@/data/mockJournal';
import { STORY_TYPE_META } from '@/types/journal.types';
import { StoryBlockRenderer } from '@/components/elite/journal/StoryBlocks';
import { StandardStoryCard } from '@/components/elite/journal/JournalCards';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function JournalStoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const story = useMemo(() => MOCK_STORIES.find((s) => s.slug === slug), [slug]);

  const related = useMemo(() => {
    if (!story) return [];
    return MOCK_STORIES
      .filter((s) => s.id !== story.id && s.type === story.type)
      .concat(MOCK_STORIES.filter((s) => s.id !== story.id && s.type !== story.type))
      .slice(0, 3)
      .map(({ id, slug, type, headline, standfirst, heroImage, author, publishedAt, readingTime, tags, seriesLabel, featured }) =>
        ({ id, slug, type, headline, standfirst, heroImage, author, publishedAt, readingTime, tags, seriesLabel, featured }));
  }, [story]);

  if (!story) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center gap-4">
        <p className="font-serif italic text-stone-500 text-xl">This story could not be found.</p>
        <Link to="/journal" className="text-amber-400 font-sans text-sm">Return to The League Journal</Link>
      </div>
    );
  }

  const meta = STORY_TYPE_META[story.type];

  return (
    <div className="min-h-screen bg-stone-950">
      {/* ── Cinematic hero ───────────────────────────────────────────── */}
      <header className="relative h-[86vh] min-h-[560px] flex items-end">
        <img src={story.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        <div className="absolute top-0 left-0 right-0 p-6 md:p-10 flex items-center justify-between">
          <Link to="/journal" className="flex items-center gap-2 font-sans text-[13px] text-stone-300 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> The League Journal
          </Link>
          <button className="flex items-center gap-2 font-sans text-[13px] text-stone-300 hover:text-white transition-colors">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
        <div className="relative max-w-3xl mx-auto px-6 md:px-10 pb-16 md:pb-20 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${meta.accent}`}>{story.seriesLabel ?? meta.label}</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="font-display font-black text-[clamp(30px,5.5vw,60px)] leading-[1.02] tracking-tight text-stone-50"
          >
            {story.headline}
          </motion.h1>
          <p className="font-serif italic text-lg md:text-xl text-stone-300 mt-6 leading-relaxed">{story.standfirst}</p>
        </div>
      </header>

      {/* ── Byline strip ─────────────────────────────────────────────── */}
      <div className="border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 py-6 flex items-center gap-4">
          <div className="h-11 w-11 rounded-full overflow-hidden bg-stone-800 border border-white/10 flex items-center justify-center shrink-0">
            {story.author.avatarUrl ? <img src={story.author.avatarUrl} alt="" className="h-full w-full object-cover" /> : <User className="h-5 w-5 text-stone-500" />}
          </div>
          <div className="min-w-0">
            <div className="font-sans font-semibold text-stone-100 text-sm">{story.author.name}</div>
            <div className="font-sans text-[12px] text-stone-500">{story.author.role}</div>
          </div>
          <div className="ml-auto text-right font-sans text-[12px] text-stone-500">
            <div>{formatDate(story.publishedAt)}</div>
            <div className="flex items-center gap-1 justify-end mt-0.5"><Clock className="h-3 w-3" />{story.readingTime} min read</div>
          </div>
        </div>
      </div>

      {/* ── Story body ───────────────────────────────────────────────── */}
      <article className="max-w-2xl mx-auto px-6 py-14">
        {story.blocks.map((b) => <StoryBlockRenderer key={b.id} block={b} />)}

        {story.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-16 pt-8 border-t border-white/5">
            {story.tags.map((t) => (
              <span key={t} className="font-sans text-[11px] uppercase tracking-wider text-stone-500 border border-white/10 rounded-full px-3 py-1">{t}</span>
            ))}
          </div>
        )}
      </article>

      {/* ── Related stories ──────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 md:px-10 py-16 border-t border-white/5">
          <h2 className="font-display font-black text-2xl text-stone-50 mb-8">Continue Reading</h2>
          <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-none">
            {related.map((s) => <StandardStoryCard key={s.id} story={s} />)}
          </div>
        </section>
      )}
    </div>
  );
}