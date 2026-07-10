import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  Plus, Trash2, GripVertical, Type, Heading, Image as ImageIcon, Video, Quote,
  ListOrdered, BarChart3, User, Shield, Trophy, Minus, Eye, Send, Save, ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { STORY_TYPE_META } from '@/types/journal.types';
import type { Story, StoryBlock, StoryType, StoryStatus } from '@/types/journal.types';
import { StoryBlockRenderer } from '@/components/elite/journal/StoryBlocks';

const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Block palette ──────────────────────────────────────────────────────────
const BLOCK_PALETTE: { type: StoryBlock['type']; label: string; icon: React.FC<{ className?: string }> }[] = [
  { type: 'paragraph',         label: 'Paragraph',          icon: Type },
  { type: 'heading',           label: 'Heading',            icon: Heading },
  { type: 'image',             label: 'Image',              icon: ImageIcon },
  { type: 'video',             label: 'Video',              icon: Video },
  { type: 'quote',             label: 'Pull Quote',         icon: Quote },
  { type: 'timeline',          label: 'Timeline',           icon: ListOrdered },
  { type: 'stat_block',        label: 'Stat Block',         icon: BarChart3 },
  { type: 'player_connection', label: 'Player Connection',  icon: User },
  { type: 'club_connection',   label: 'Club Connection',    icon: Shield },
  { type: 'award_connection',  label: 'Award Connection',   icon: Trophy },
  { type: 'divider',           label: 'Divider',            icon: Minus },
];

function newBlock(type: StoryBlock['type']): StoryBlock {
  const id = uid();
  switch (type) {
    case 'paragraph': return { id, type, text: 'Write the next beat of the story…', dropCap: false };
    case 'heading': return { id, type, text: 'A new turning point', level: 2 };
    case 'image': return { id, type, url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600', caption: '', layout: 'contained' };
    case 'video': return { id, type, url: '', caption: '' };
    case 'quote': return { id, type, text: 'An unforgettable line, in their own words.', attribution: '', role: '' };
    case 'timeline': return { id, type, title: 'Key moments', events: [{ date: '', label: '' }] };
    case 'stat_block': return { id, type, title: 'By the numbers', stats: [{ label: '', value: '' }] };
    case 'player_connection': return { id, type, player: { id: '', name: '', position: '', club: '' } };
    case 'club_connection': return { id, type, club: { id: '', name: '', shortName: '' } };
    case 'award_connection': return { id, type, award: { id: '', title: '', season: '' } };
    case 'divider': return { id, type };
  }
}

// ─── Field editor per block type ────────────────────────────────────────────
function BlockEditor({ block, onChange }: { block: StoryBlock; onChange: (b: StoryBlock) => void }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <div className="space-y-2">
          <Textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} rows={4} placeholder="Narrative text…" />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={!!block.dropCap} onChange={(e) => onChange({ ...block, dropCap: e.target.checked })} />
            Drop cap (opening paragraph)
          </label>
        </div>
      );
    case 'heading':
      return (
        <div className="flex gap-2">
          <Input value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Heading text" className="flex-1" />
          <select value={block.level} onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 2 | 3 })} className="bg-background border border-border rounded-md px-2 text-sm">
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
        </div>
      );
    case 'image':
      return (
        <div className="space-y-2">
          <Input value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="Image URL" />
          <Input value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} placeholder="Caption" />
          <Input value={block.credit ?? ''} onChange={(e) => onChange({ ...block, credit: e.target.value })} placeholder="Credit (optional)" />
          <select value={block.layout} onChange={(e) => onChange({ ...block, layout: e.target.value as typeof block.layout })} className="bg-background border border-border rounded-md px-2 py-1.5 text-sm w-full">
            <option value="contained">Contained</option>
            <option value="full-bleed">Full-bleed (cinematic)</option>
            <option value="side-by-side">Side-by-side</option>
          </select>
        </div>
      );
    case 'video':
      return (
        <div className="space-y-2">
          <Input value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="YouTube / Vimeo URL" />
          <Input value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} placeholder="Caption" />
        </div>
      );
    case 'quote':
      return (
        <div className="space-y-2">
          <Textarea value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} rows={2} placeholder="The quote" />
          <div className="flex gap-2">
            <Input value={block.attribution ?? ''} onChange={(e) => onChange({ ...block, attribution: e.target.value })} placeholder="Attributed to" />
            <Input value={block.role ?? ''} onChange={(e) => onChange({ ...block, role: e.target.value })} placeholder="Role" />
          </div>
        </div>
      );
    case 'timeline':
      return (
        <div className="space-y-2">
          <Input value={block.title ?? ''} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Timeline title" />
          {block.events.map((ev, i) => (
            <div key={i} className="flex gap-2">
              <Input value={ev.date} onChange={(e) => {
                const events = [...block.events]; events[i] = { ...ev, date: e.target.value }; onChange({ ...block, events });
              }} placeholder="Date" className="w-24" />
              <Input value={ev.label} onChange={(e) => {
                const events = [...block.events]; events[i] = { ...ev, label: e.target.value }; onChange({ ...block, events });
              }} placeholder="Event" className="flex-1" />
              <Button variant="ghost" size="icon" onClick={() => onChange({ ...block, events: block.events.filter((_, j) => j !== i) })}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => onChange({ ...block, events: [...block.events, { date: '', label: '' }] })}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add event
          </Button>
        </div>
      );
    case 'stat_block':
      return (
        <div className="space-y-2">
          <Input value={block.title ?? ''} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Stat block title" />
          {block.stats.map((s, i) => (
            <div key={i} className="flex gap-2">
              <Input value={s.label} onChange={(e) => {
                const stats = [...block.stats]; stats[i] = { ...s, label: e.target.value }; onChange({ ...block, stats });
              }} placeholder="Label" className="flex-1" />
              <Input value={s.value} onChange={(e) => {
                const stats = [...block.stats]; stats[i] = { ...s, value: e.target.value }; onChange({ ...block, stats });
              }} placeholder="Value" className="w-28" />
              <Button variant="ghost" size="icon" onClick={() => onChange({ ...block, stats: block.stats.filter((_, j) => j !== i) })}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => onChange({ ...block, stats: [...block.stats, { label: '', value: '' }] })}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add stat
          </Button>
        </div>
      );
    case 'player_connection':
      return (
        <div className="grid grid-cols-2 gap-2">
          <Input value={block.player.name} onChange={(e) => onChange({ ...block, player: { ...block.player, name: e.target.value } })} placeholder="Player name" />
          <Input value={block.player.position} onChange={(e) => onChange({ ...block, player: { ...block.player, position: e.target.value } })} placeholder="Position" />
          <Input value={block.player.club} onChange={(e) => onChange({ ...block, player: { ...block.player, club: e.target.value } })} placeholder="Club" />
          <Input value={block.note ?? ''} onChange={(e) => onChange({ ...block, note: e.target.value })} placeholder="Editorial note" />
        </div>
      );
    case 'club_connection':
      return (
        <div className="grid grid-cols-2 gap-2">
          <Input value={block.club.name} onChange={(e) => onChange({ ...block, club: { ...block.club, name: e.target.value } })} placeholder="Club name" />
          <Input value={block.club.shortName} onChange={(e) => onChange({ ...block, club: { ...block.club, shortName: e.target.value } })} placeholder="Short name" />
          <Input value={block.note ?? ''} onChange={(e) => onChange({ ...block, note: e.target.value })} placeholder="Editorial note" className="col-span-2" />
        </div>
      );
    case 'award_connection':
      return (
        <div className="grid grid-cols-2 gap-2">
          <Input value={block.award.title} onChange={(e) => onChange({ ...block, award: { ...block.award, title: e.target.value } })} placeholder="Award title" />
          <Input value={block.award.season} onChange={(e) => onChange({ ...block, award: { ...block.award, season: e.target.value } })} placeholder="Season" />
          <Input value={block.note ?? ''} onChange={(e) => onChange({ ...block, note: e.target.value })} placeholder="Editorial note" className="col-span-2" />
        </div>
      );
    case 'divider':
      return <p className="text-xs text-muted-foreground italic">Visual section break — no content needed.</p>;
    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
export default function StoryBuilderPage() {
  const [headline, setHeadline] = useState('The Last Derby of a Generation');
  const [standfirst, setStandfirst] = useState('One evocative sentence that pulls the reader into the narrative.');
  const [type, setType] = useState<StoryType>('FEATURE');
  const [status, setStatus] = useState<StoryStatus>('DRAFT');
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600');
  const [authorName, setAuthorName] = useState('');
  const [seriesLabel, setSeriesLabel] = useState('');
  const [blocks, setBlocks] = useState<StoryBlock[]>([newBlock('paragraph')]);
  const [showPreview, setShowPreview] = useState(true);

  const addBlock = (t: StoryBlock['type']) => setBlocks((b) => [...b, newBlock(t)]);
  const updateBlock = (id: string, next: StoryBlock) => setBlocks((b) => b.map((blk) => (blk.id === id ? next : blk)));
  const removeBlock = (id: string) => setBlocks((b) => b.filter((blk) => blk.id !== id));

  const previewStory: Story = {
    id: 'draft', slug: 'draft', type, status, headline, standfirst, heroImage,
    author: { id: 'draft-author', name: authorName || 'Unassigned writer', role: 'Editorial desk' },
    publishedAt: new Date().toISOString(),
    readingTime: Math.max(2, Math.round(blocks.filter((b) => b.type === 'paragraph').length * 1.4)),
    tags: [], seriesLabel: seriesLabel || undefined, blocks,
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      {/* ── Studio header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-stone-950/95 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-6 py-3.5 flex items-center gap-4">
          <Link to="/journal" className="flex items-center gap-1.5 text-stone-400 hover:text-stone-100 text-sm shrink-0">
            <ArrowLeft className="h-4 w-4" /> Newsroom
          </Link>
          <div className="h-5 w-px bg-white/10" />
          <span className="font-display font-bold text-sm text-stone-100">Story Builder</span>
          <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-400 bg-amber-500/10">{status.replace('_', ' ')}</span>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowPreview((v) => !v)}>
              <Eye className="h-4 w-4 mr-1.5" /> {showPreview ? 'Hide' : 'Show'} preview
            </Button>
            <Button variant="outline" size="sm" onClick={() => setStatus('DRAFT')}>
              <Save className="h-4 w-4 mr-1.5" /> Save draft
            </Button>
            <Button variant="outline" size="sm" onClick={() => setStatus('IN_REVIEW')}>Send for review</Button>
            <Button size="sm" onClick={() => setStatus('PUBLISHED')} className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold">
              <Send className="h-4 w-4 mr-1.5" /> Publish
            </Button>
          </div>
        </div>
      </header>

      <div className={`max-w-[1600px] mx-auto grid ${showPreview ? 'lg:grid-cols-[440px_1fr]' : 'lg:grid-cols-1'}`}>
        {/* ── Composer ─────────────────────────────────────────────── */}
        <div className="border-r border-white/10 p-6 space-y-8 max-h-[calc(100vh-58px)] overflow-y-auto">
          {/* Story metadata */}
          <section className="space-y-3">
            <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">Story Setup</h3>
            <select value={type} onChange={(e) => setType(e.target.value as StoryType)} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm">
              {Object.entries(STORY_TYPE_META).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}
            </select>
            <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Headline" className="font-display font-bold" />
            <Textarea value={standfirst} onChange={(e) => setStandfirst(e.target.value)} placeholder="Standfirst — one evocative sentence" rows={2} />
            <Input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="Hero image URL" />
            <div className="flex gap-2">
              <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Writer" />
              <Input value={seriesLabel} onChange={(e) => setSeriesLabel(e.target.value)} placeholder="Series label (optional)" />
            </div>
          </section>

          {/* Block palette */}
          <section className="space-y-3">
            <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">Add a Narrative Block</h3>
            <div className="grid grid-cols-3 gap-2">
              {BLOCK_PALETTE.map(({ type: t, label, icon: Icon }) => (
                <button
                  key={t}
                  onClick={() => addBlock(t)}
                  className="flex flex-col items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] py-3 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all"
                >
                  <Icon className="h-4 w-4 text-amber-400/80" />
                  <span className="text-[10px] text-stone-400 text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Ordered blocks */}
          <section className="space-y-3">
            <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">
              Narrative Flow <span className="text-stone-700">({blocks.length} blocks)</span>
            </h3>
            <Reorder.Group axis="y" values={blocks} onReorder={setBlocks} className="space-y-3">
              {blocks.map((block) => {
                const paletteItem = BLOCK_PALETTE.find((p) => p.type === block.type)!;
                const Icon = paletteItem.icon;
                return (
                  <Reorder.Item key={block.id} value={block}>
                    <motion.div layout className="rounded-md border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <GripVertical className="h-4 w-4 text-stone-600 cursor-grab" />
                        <Icon className="h-3.5 w-3.5 text-amber-400/80" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">{paletteItem.label}</span>
                        <button onClick={() => removeBlock(block.id)} className="ml-auto text-stone-600 hover:text-red-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <BlockEditor block={block} onChange={(next) => updateBlock(block.id, next)} />
                    </motion.div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </section>
        </div>

        {/* ── Live editorial preview ──────────────────────────────────── */}
        {showPreview && (
          <div className="bg-stone-950 max-h-[calc(100vh-58px)] overflow-y-auto">
            <div className="relative h-[50vh] min-h-[360px] flex items-end">
              <img src={previewStory.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-black/50 to-black/10" />
              <div className="relative max-w-2xl mx-auto px-8 pb-12 text-center">
                <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${STORY_TYPE_META[type].accent}`}>{seriesLabel || STORY_TYPE_META[type].label}</span>
                <h1 className="font-display font-black text-[clamp(24px,3.6vw,42px)] leading-tight text-stone-50 mt-3">{headline || 'Untitled story'}</h1>
                <p className="font-serif italic text-stone-300 mt-4">{standfirst}</p>
              </div>
            </div>
            <article className="max-w-2xl mx-auto px-8 py-12">
              {blocks.map((b) => <StoryBlockRenderer key={b.id} block={b} />)}
            </article>
          </div>
        )}
      </div>
    </div>
  );
}