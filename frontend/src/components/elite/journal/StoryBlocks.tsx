import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Quote, Play, Trophy, Shield, User } from 'lucide-react';
import type { StoryBlock } from '@/types/journal.types';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

function toEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export function StoryBlockRenderer({ block }: { block: StoryBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}
          className={`font-serif text-[19px] leading-[1.85] text-stone-200/90 mb-7 ${block.dropCap ? 'first-letter:font-display first-letter:text-7xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-amber-400 first-letter:leading-[0.8]' : ''}`}
        >
          {block.text}
        </motion.p>
      );

    case 'heading':
      return (
        <motion.h3
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className={`font-display font-bold text-stone-50 mt-14 mb-6 ${block.level === 2 ? 'text-[30px]' : 'text-[22px]'}`}
        >
          {block.text}
        </motion.h3>
      );

    case 'image':
      return (
        <motion.figure
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className={block.layout === 'full-bleed'
            ? 'my-12 -mx-6 md:-mx-16 lg:-mx-28'
            : 'my-10 max-w-2xl mx-auto'}
        >
          <img src={block.url} alt={block.caption ?? ''} className="w-full h-auto rounded-sm object-cover" style={block.layout === 'full-bleed' ? { maxHeight: '78vh', objectFit: 'cover' } : undefined} />
          {(block.caption || block.credit) && (
            <figcaption className="mt-3 px-6 md:px-16 lg:px-28 flex items-baseline justify-between gap-4 text-[13px] text-stone-500 font-sans">
              <span className="italic">{block.caption}</span>
              {block.credit && <span className="shrink-0 uppercase tracking-wider text-[10px]">{block.credit}</span>}
            </figcaption>
          )}
        </motion.figure>
      );

    case 'video': {
      const embed = toEmbedUrl(block.url);
      return (
        <motion.figure variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="my-12">
          <div className="relative aspect-video rounded-sm overflow-hidden bg-black border border-white/10">
            {embed ? (
              <iframe src={embed} className="w-full h-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title={block.caption ?? 'video'} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-900">
                <Play className="h-14 w-14 text-amber-400/80" />
              </div>
            )}
          </div>
          {block.caption && <figcaption className="mt-3 text-[13px] italic text-stone-500 font-sans">{block.caption}</figcaption>}
        </motion.figure>
      );
    }

    case 'quote':
      return (
        <motion.blockquote
          variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="relative my-14 py-2 pl-10 border-l-2 border-amber-500/60"
        >
          <Quote className="absolute -left-1 -top-2 h-8 w-8 text-amber-500/25" />
          <p className="font-serif italic text-[26px] md:text-[30px] leading-[1.4] text-stone-50">{block.text}</p>
          {block.attribution && (
            <footer className="mt-4 font-sans text-[13px] uppercase tracking-[0.14em] text-stone-500">
              — {block.attribution}{block.role && <span className="text-stone-600">, {block.role}</span>}
            </footer>
          )}
        </motion.blockquote>
      );

    case 'timeline':
      return (
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="my-14 rounded-sm border border-white/10 bg-white/[0.02] p-8 md:p-10">
          {block.title && <h4 className="font-display font-bold text-amber-400/90 text-[13px] uppercase tracking-[0.18em] mb-8">{block.title}</h4>}
          <div className="space-y-8">
            {block.events.map((ev, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex flex-col items-center shrink-0">
                  <span className="font-display font-black text-stone-50 text-sm tabular-nums w-16">{ev.date}</span>
                  <div className="w-px flex-1 bg-white/10 mt-2" />
                </div>
                <div className="pb-2">
                  <p className="font-serif text-lg text-stone-100 leading-snug">{ev.label}</p>
                  {ev.detail && <p className="font-sans text-[13px] text-stone-500 mt-1 leading-relaxed">{ev.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      );

    case 'stat_block':
      return (
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="my-14">
          {block.title && <h4 className="font-display font-bold text-amber-400/90 text-[13px] uppercase tracking-[0.18em] mb-6">{block.title}</h4>}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-white/10 rounded-sm overflow-hidden">
            {block.stats.map((s, i) => (
              <div key={i} className="bg-stone-950/80 p-6 text-center">
                <div className="font-display font-black text-3xl md:text-4xl text-stone-50 tabular-nums">{s.value}</div>
                <div className="font-sans text-[11px] uppercase tracking-wider text-stone-500 mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      );

    case 'player_connection':
      return (
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="my-10">
          <Link to={`/players/${block.player.id}`} className="group flex items-center gap-5 rounded-sm border border-white/10 bg-white/[0.03] p-5 hover:border-emerald-500/40 hover:bg-emerald-500/[0.04] transition-all">
            <div className="h-16 w-16 rounded-full overflow-hidden border border-white/10 shrink-0 bg-stone-800 flex items-center justify-center">
              {block.player.photoUrl ? <img src={block.player.photoUrl} alt={block.player.name} className="h-full w-full object-cover" /> : <User className="h-6 w-6 text-stone-500" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.16em] text-emerald-400/80 font-sans font-bold mb-1">Player Profile</div>
              <div className="font-display font-bold text-stone-50 truncate">{block.player.name}</div>
              <div className="font-sans text-[13px] text-stone-500">{block.player.position} · {block.player.club}</div>
              {block.note && <p className="font-sans text-[12px] text-stone-600 mt-1">{block.note}</p>}
            </div>
          </Link>
        </motion.div>
      );

    case 'club_connection':
      return (
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="my-10">
          <Link to={`/clubs/${block.club.id}`} className="group flex items-center gap-5 rounded-sm border border-white/10 bg-white/[0.03] p-5 hover:border-sky-500/40 hover:bg-sky-500/[0.04] transition-all">
            <div className="h-16 w-16 rounded-full overflow-hidden border border-white/10 shrink-0 bg-stone-800 flex items-center justify-center">
              {block.club.crestUrl ? <img src={block.club.crestUrl} alt={block.club.name} className="h-full w-full object-cover" /> : <Shield className="h-6 w-6 text-stone-500" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.16em] text-sky-400/80 font-sans font-bold mb-1">Club Profile</div>
              <div className="font-display font-bold text-stone-50 truncate">{block.club.name}</div>
              {block.note && <p className="font-sans text-[12px] text-stone-600 mt-1">{block.note}</p>}
            </div>
          </Link>
        </motion.div>
      );

    case 'award_connection':
      return (
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="my-10">
          <Link to="/awards" className="group flex items-center gap-5 rounded-sm border border-white/10 bg-white/[0.03] p-5 hover:border-amber-500/40 hover:bg-amber-500/[0.04] transition-all">
            <div className="h-16 w-16 rounded-full border border-white/10 shrink-0 bg-stone-800 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-amber-400/80" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.16em] text-amber-400/80 font-sans font-bold mb-1">Award · {block.award.season}</div>
              <div className="font-display font-bold text-stone-50 truncate">{block.award.title}</div>
              {block.note && <p className="font-sans text-[12px] text-stone-600 mt-1">{block.note}</p>}
            </div>
          </Link>
        </motion.div>
      );

    case 'divider':
      return (
        <div className="my-14 flex items-center justify-center gap-3 text-amber-500/40">
          <span className="h-px w-12 bg-current" /><span className="text-lg">✦</span><span className="h-px w-12 bg-current" />
        </div>
      );

    default:
      return null;
  }
}