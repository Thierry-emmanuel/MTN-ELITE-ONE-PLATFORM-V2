import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Archive } from 'lucide-react';
import { STORY_TYPE_META } from '@/types/journal.types';
import type { StorySummary } from '@/types/journal.types';

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "Aujourd'hui";
  if (d === 1) return 'Hier';
  return `Il y a ${d} j`;
}

const Kicker = ({ story }: { story: StorySummary }) => {
  const meta = STORY_TYPE_META[story.type];
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className={`text-[10px] font-black uppercase tracking-[0.18em] ${meta.accent}`}>
        {story.seriesLabel ?? meta.shortLabel}
      </span>
      <span className="h-1 w-1 rounded-full bg-stone-600" />
      <span className="text-[10px] uppercase tracking-wider text-stone-500 font-sans">{timeAgo(story.publishedAt)}</span>
    </div>
  );
};

// ─── Secondary feature — horizontal, sits beside the lead in the spread ────
export function SecondaryStoryCard({ story }: { story: StorySummary }) {
  const meta = STORY_TYPE_META[story.type];
  return (
    <Link to={`/journal/${story.slug}`} className="group flex gap-5 items-stretch">
      <div className="relative w-[42%] shrink-0 rounded-sm overflow-hidden bg-stone-900">
        <img src={story.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
        <Kicker story={story} />
        <h3 className={`font-display font-bold text-[20px] leading-[1.2] text-stone-50 mb-2 transition-colors`}
            style={{ transitionProperty: 'color' }}
        >
          <span className="group-hover:opacity-80">{story.headline}</span>
        </h3>
        <p className="font-serif text-[14px] text-stone-500 leading-relaxed line-clamp-2 hidden sm:block">{story.standfirst}</p>
        <div className={`mt-3 h-px w-8 ${meta.bar} group-hover:w-14 transition-all duration-300`} />
      </div>
    </Link>
  );
}

// ─── Lead story — the cinematic centerpiece ────────────────────────────────
export function LeadStoryCard({ story }: { story: StorySummary }) {
  const meta = STORY_TYPE_META[story.type];
  return (
    <Link to={`/journal/${story.slug}`} className="group relative block h-[70vh] min-h-[520px] rounded-sm overflow-hidden">
      <img src={story.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ring-1 ring-inset ${meta.ring}`} />
      <div className="relative h-full flex flex-col justify-end p-8 md:p-14 max-w-3xl">
        <Kicker story={story} />
        <h1 className="font-display font-black text-[clamp(28px,4.5vw,54px)] leading-[1.02] text-stone-50 mb-5 tracking-tight">
          {story.headline}
        </h1>
        <p className="font-serif text-lg md:text-xl text-stone-300 leading-relaxed mb-6 max-w-2xl">
          {story.standfirst}
        </p>
        <div className="flex items-center gap-3 font-sans text-[13px] text-stone-400">
          <span className="font-semibold text-stone-200">{story.author.name}</span>
          <span className="h-1 w-1 rounded-full bg-stone-600" />
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{story.readingTime} min</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Standard story — used in horizontal rails ─────────────────────────────
export function StandardStoryCard({ story, size = 'md' }: { story: StorySummary; size?: 'md' | 'lg' }) {
  const meta = STORY_TYPE_META[story.type];
  return (
    <Link
      to={`/journal/${story.slug}`}
      className={`group block shrink-0 ${size === 'lg' ? 'w-[380px]' : 'w-[300px]'}`}
    >
      <div className={`relative aspect-[4/5] rounded-sm overflow-hidden mb-4 bg-stone-900 ring-1 ring-transparent transition-all duration-300 ${meta.hoverRing}`}>
        <img src={story.heroImage} alt="" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>
      <Kicker story={story} />
      <h3 className="font-display font-bold text-[19px] leading-snug text-stone-50 mb-2 group-hover:text-amber-300 transition-colors">
        {story.headline}
      </h3>
      <p className="font-serif text-[14.5px] text-stone-500 leading-relaxed line-clamp-2">{story.standfirst}</p>
    </Link>
  );
}

// ─── Archive callout — a mid-article rhythm break linking to the archives ──
export function ArchiveCallout({ story }: { story: StorySummary }) {
  return (
    <Link
      to={`/journal/${story.slug}`}
      className="group my-14 flex gap-5 items-center rounded-sm border border-orange-500/20 bg-gradient-to-r from-orange-500/[0.06] to-transparent p-6 hover:border-orange-500/40 transition-colors"
    >
      <div className="h-20 w-20 rounded-sm overflow-hidden shrink-0 bg-stone-900">
        <img src={story.heroImage} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-400 mb-1.5">
          <Archive className="h-3 w-3" /> From the Archives
        </div>
        <h4 className="font-display font-bold text-[17px] leading-snug text-stone-100 group-hover:text-orange-300 transition-colors">{story.headline}</h4>
        <p className="font-serif text-[13px] italic text-stone-500 mt-1 line-clamp-1">{story.standfirst}</p>
      </div>
    </Link>
  );
}

// ─── Series chapter strip — sits near the top of a story in an active series ─
export function SeriesChapterStrip({
  seriesLabel, chapters, currentId,
}: { seriesLabel: string; chapters: StorySummary[]; currentId: string }) {
  if (chapters.length === 0) return null;
  return (
    <div className="max-w-2xl mx-auto px-6 mb-10">
      <div className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-400 mb-3">{seriesLabel} &middot; More Chapters</div>
        <div className="flex flex-col gap-2.5">
          {chapters.map((c) => (
            <Link
              key={c.id}
              to={`/journal/${c.slug}`}
              className={`text-[14px] font-sans leading-snug transition-colors ${c.id === currentId ? 'text-stone-100 font-semibold' : 'text-stone-500 hover:text-stone-300'}`}
            >
              {c.id === currentId ? '● ' : '○ '}{c.headline}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
export function CompactStoryRow({ story, index }: { story: StorySummary; index?: number }) {
  return (
    <Link to={`/journal/${story.slug}`} className="group flex items-start gap-5 py-6 border-b border-white/5 last:border-b-0">
      {typeof index === 'number' && (
        <span className="font-display font-black text-[13px] text-stone-700 pt-1 w-6 shrink-0 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
      )}
      <div className="flex-1 min-w-0">
        <Kicker story={story} />
        <h4 className="font-display font-bold text-[17px] leading-snug text-stone-100 group-hover:text-amber-300 transition-colors">{story.headline}</h4>
      </div>
      <div className="h-20 w-28 rounded-sm overflow-hidden shrink-0 hidden sm:block">
        <img src={story.heroImage} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
    </Link>
  );
}

// ─── Story rail — horizontal scroll, story-driven navigation ───────────────
export function StoryRail({
  title, description, stories, accent,
}: { title: string; description?: string; stories: StorySummary[]; accent?: string }) {
  if (!stories.length) return null;
  return (
    <section className="py-4">
      <div className="flex items-end justify-between mb-7 px-1">
        <div>
          <h2 className={`font-display font-black text-2xl md:text-[28px] tracking-tight ${accent ?? 'text-stone-50'}`}>{title}</h2>
          {description && <p className="font-serif italic text-stone-500 mt-1.5">{description}</p>}
        </div>
      </div>
      <motion.div
        className="flex gap-6 overflow-x-auto pb-2 px-1 snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {stories.map((s) => (
          <div key={s.id} className="snap-start">
            <StandardStoryCard story={s} />
          </div>
        ))}
      </motion.div>
    </section>
  );
}