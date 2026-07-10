import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Feather } from 'lucide-react';
import { MOCK_STORY_SUMMARIES } from '@/data/mockJournal';
import { STORY_TYPE_META } from '@/types/journal.types';
import type { StoryType } from '@/types/journal.types';
import { LeadStoryCard, SecondaryStoryCard, StoryRail, CompactStoryRow } from '@/components/elite/journal/JournalCards';

const SECTION_ORDER: StoryType[] = [
  'PLAYER_STORY', 'CLUB_STORY', 'MATCH_STORY', 'ROAD_TO_LIONS',
  'TACTICAL', 'INTERVIEW', 'HERITAGE', 'OPINION', 'HISTORICAL',
];

export default function JournalHomePage() {
  const [activeFilter, setActiveFilter] = useState<StoryType | 'ALL'>('ALL');

  const stories = MOCK_STORY_SUMMARIES;
  const lead = useMemo(() => stories.find((s) => s.featured) ?? stories[0], [stories]);

  const editorsPicks = useMemo(
    () => stories.filter((s) => s.id !== lead.id).slice(0, 2),
    [stories, lead],
  );

  const mostRead = useMemo(
    () => [...stories].filter((s) => s.id !== lead.id).reverse().slice(0, 5),
    [stories, lead],
  );

  const bySection = useMemo(() => {
    const map: Partial<Record<StoryType, typeof stories>> = {};
    for (const type of SECTION_ORDER) {
      map[type] = stories.filter((s) => s.type === type && s.id !== lead.id);
    }
    return map;
  }, [stories, lead]);

  const filtered = activeFilter === 'ALL' ? stories.filter((s) => s.id !== lead.id) : stories.filter((s) => s.type === activeFilter);

  return (
    <div className="min-h-screen bg-stone-950">
      {/* ── Masthead ─────────────────────────────────────────────────── */}
      <header className="relative border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-14 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <Feather className="h-5 w-5 text-amber-400" />
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.3em] text-stone-500">MTN Elite One presents</span>
          </div>
          <h1 className="font-display font-black text-[clamp(38px,6vw,80px)] leading-[0.95] tracking-tight text-stone-50">
            The League <span className="text-amber-400">Journal</span>
          </h1>
          <p className="font-serif italic text-xl text-stone-400 mt-4 max-w-xl">
            Where the stories that define Cameroonian football are discovered, understood, and remembered.
          </p>
        </div>
      </header>

      {/* ── Editorial spread: lead story + editor's picks ───────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <LeadStoryCard story={lead} />
        </div>
        <div className="flex flex-col gap-8 justify-between">
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600 -mb-2">Editor&rsquo;s Picks</span>
          {editorsPicks.map((s) => <SecondaryStoryCard key={s.id} story={s} />)}
        </div>
      </div>

      {/* ── Story-driven navigation ──────────────────────────────────── */}
      <nav className="sticky top-0 z-20 bg-stone-950/90 backdrop-blur-md border-y border-white/5 mt-12">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex gap-8 overflow-x-auto scrollbar-none py-4">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`shrink-0 font-sans text-[13px] font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors ${activeFilter === 'ALL' ? 'text-amber-400 border-amber-400' : 'text-stone-500 border-transparent hover:text-stone-300'}`}
          >
            All Stories
          </button>
          {SECTION_ORDER.map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`shrink-0 font-sans text-[13px] font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors ${activeFilter === type ? `${STORY_TYPE_META[type].accent} border-current` : 'text-stone-500 border-transparent hover:text-stone-300'}`}
            >
              {STORY_TYPE_META[type].shortLabel}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-6">
        {activeFilter !== 'ALL' ? (
          // ── Filtered single-section reading list ──────────────────────
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10">
            <h2 className="font-display font-black text-3xl text-stone-50 mb-1">{STORY_TYPE_META[activeFilter].label}</h2>
            <p className="font-serif italic text-stone-500 mb-8">{STORY_TYPE_META[activeFilter].description}</p>
            <div>
              {filtered.map((s, i) => <CompactStoryRow key={s.id} story={s} index={i} />)}
              {filtered.length === 0 && <p className="text-stone-600 font-serif italic py-10">No stories published in this section yet.</p>}
            </div>
          </motion.section>
        ) : (
          // ── Curated editorial rails, section by section ───────────────
          <>
            {SECTION_ORDER.map((type, i) => (
              <div key={type}>
                <StoryRail
                  title={STORY_TYPE_META[type].label}
                  description={STORY_TYPE_META[type].description}
                  stories={bySection[type] ?? []}
                  accent={STORY_TYPE_META[type].accent}
                />
                {/* ── Most Read module, dropped mid-page for editorial rhythm ── */}
                {i === 2 && (
                  <section className="py-10 my-6 border-y border-white/5">
                    <h2 className="font-display font-black text-2xl text-stone-50 mb-1">Most Read This Week</h2>
                    <p className="font-serif italic text-stone-500 mb-6">What the newsroom is watching supporters return to.</p>
                    <div className="max-w-3xl">
                      {mostRead.map((s, idx) => <CompactStoryRow key={s.id} story={s} index={idx} />)}
                    </div>
                  </section>
                )}
              </div>
            ))}
          </>
        )}
      </main>

      {/* ── Editorial footer note ───────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-14 text-center">
        <p className="font-serif italic text-stone-600 max-w-md mx-auto leading-relaxed">
          The League Journal is written and preserved by the MTN Elite One editorial desk —
          {' '}<Link to="/journal/studio" className="text-amber-500/80 hover:text-amber-400 underline underline-offset-4">visit the newsroom</Link>.
        </p>
      </footer>
    </div>
  );
}