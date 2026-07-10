// ═══════════════════════════════════════════════════════════════════════════
// THE LEAGUE JOURNAL — domain model
// A storytelling engine, not a news/blog schema. Stories are composed of an
// ordered list of narrative "blocks" instead of a single content string, so
// editors can weave images, video, quotes, timelines, stats and entity
// connections directly into the flow of the writing.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Story taxonomy ─────────────────────────────────────────────────────────
export type StoryType =
  | 'FEATURE'        // Long-form cinematic feature
  | 'PLAYER_STORY'   // A player's journey, told in depth
  | 'CLUB_STORY'     // Institutional / club-identity narrative
  | 'MATCH_STORY'    // The story behind a fixture, not just a report
  | 'ROAD_TO_LIONS'  // National team / Indomitable Lions narratives
  | 'HERITAGE'       // Archival / commemorative history
  | 'TACTICAL'       // Tactical analysis / breakdown
  | 'INTERVIEW'      // Long-form Q&A / as-told-to
  | 'OPINION'        // Editorial / column
  | 'HISTORICAL';    // Definitive historical record pieces

export interface StoryTypeMeta {
  label: string;
  shortLabel: string;
  description: string;
  accent: string;       // tailwind text color token
  glow: string;         // tailwind bg color for subtle glows
  ring: string;         // tailwind ring color token (hover states)
  hoverRing: string;    // full literal `group-hover:ring-...` utility (Tailwind needs the whole token)
  bar: string;          // tailwind bg color token (underline / accent bars)
}

export const STORY_TYPE_META: Record<StoryType, StoryTypeMeta> = {
  FEATURE:       { label: 'Feature Stories',    shortLabel: 'Feature',      description: 'The definitive long read of the moment', accent: 'text-amber-400',   glow: 'bg-amber-500/10',   ring: 'ring-amber-400/40',   hoverRing: 'group-hover:ring-amber-400/40',   bar: 'bg-amber-400/60' },
  PLAYER_STORY:  { label: 'Player Stories',     shortLabel: 'Player',       description: 'The human being behind the shirt number',  accent: 'text-emerald-400', glow: 'bg-emerald-500/10', ring: 'ring-emerald-400/40', hoverRing: 'group-hover:ring-emerald-400/40', bar: 'bg-emerald-400/60' },
  CLUB_STORY:    { label: 'Club Stories',       shortLabel: 'Club',         description: 'The soul of an institution',               accent: 'text-sky-400',     glow: 'bg-sky-500/10',     ring: 'ring-sky-400/40',     hoverRing: 'group-hover:ring-sky-400/40',     bar: 'bg-sky-400/60' },
  MATCH_STORY:   { label: 'Match Stories',      shortLabel: 'Match',        description: 'What a scoreline can never tell you',      accent: 'text-red-400',     glow: 'bg-red-500/10',     ring: 'ring-red-400/40',     hoverRing: 'group-hover:ring-red-400/40',     bar: 'bg-red-400/60' },
  ROAD_TO_LIONS: { label: 'Road to the Lions',  shortLabel: 'Lions',        description: 'The path to the national jersey',          accent: 'text-yellow-400',  glow: 'bg-yellow-500/10',  ring: 'ring-yellow-400/40',  hoverRing: 'group-hover:ring-yellow-400/40',  bar: 'bg-yellow-400/60' },
  HERITAGE:      { label: 'Heritage Stories',   shortLabel: 'Heritage',     description: 'Preserving the memory of the game',        accent: 'text-orange-400',  glow: 'bg-orange-500/10',  ring: 'ring-orange-400/40',  hoverRing: 'group-hover:ring-orange-400/40',  bar: 'bg-orange-400/60' },
  TACTICAL:      { label: 'Tactical Analysis',  shortLabel: 'Tactics',      description: 'The chessboard beneath the contest',       accent: 'text-cyan-400',    glow: 'bg-cyan-500/10',    ring: 'ring-cyan-400/40',    hoverRing: 'group-hover:ring-cyan-400/40',    bar: 'bg-cyan-400/60' },
  INTERVIEW:     { label: 'Interviews',         shortLabel: 'Interview',    description: 'In their own words',                       accent: 'text-violet-400',  glow: 'bg-violet-500/10',  ring: 'ring-violet-400/40',  hoverRing: 'group-hover:ring-violet-400/40',  bar: 'bg-violet-400/60' },
  OPINION:       { label: 'Opinion',            shortLabel: 'Opinion',      description: 'A voice, not a wire report',               accent: 'text-rose-400',    glow: 'bg-rose-500/10',    ring: 'ring-rose-400/40',    hoverRing: 'group-hover:ring-rose-400/40',    bar: 'bg-rose-400/60' },
  HISTORICAL:    { label: 'Historical Articles',shortLabel: 'History',      description: 'The permanent record',                     accent: 'text-stone-300',   glow: 'bg-stone-500/10',   ring: 'ring-stone-300/40',   hoverRing: 'group-hover:ring-stone-300/40',   bar: 'bg-stone-300/60' },
};

export type StoryStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED';

// ─── Entity connections ─────────────────────────────────────────────────────
// Stories are woven into the fabric of the platform — a player story links to
// the player's live profile, a club story to the club, etc.
export interface PlayerConnection { id: string; name: string; position: string; club: string; photoUrl?: string; }
export interface ClubConnection   { id: string; name: string; shortName: string; crestUrl?: string; }
export interface AwardConnection { id: string; title: string; season: string; iconUrl?: string; }

// ─── Narrative blocks ───────────────────────────────────────────────────────
export type StoryBlock =
  | { id: string; type: 'paragraph'; text: string; dropCap?: boolean }
  | { id: string; type: 'heading'; text: string; level: 2 | 3 }
  | { id: string; type: 'image'; url: string; caption?: string; credit?: string; layout: 'full-bleed' | 'contained' | 'side-by-side' }
  | { id: string; type: 'video'; url: string; caption?: string; poster?: string }
  | { id: string; type: 'quote'; text: string; attribution?: string; role?: string }
  | { id: string; type: 'timeline'; title?: string; events: { date: string; label: string; detail?: string }[] }
  | { id: string; type: 'stat_block'; title?: string; stats: { label: string; value: string }[] }
  | { id: string; type: 'player_connection'; player: PlayerConnection; note?: string }
  | { id: string; type: 'club_connection'; club: ClubConnection; note?: string }
  | { id: string; type: 'award_connection'; award: AwardConnection; note?: string }
  | { id: string; type: 'divider' };

// ─── Story ──────────────────────────────────────────────────────────────────
export interface StoryAuthor {
  id: string;
  name: string;
  role: string;         // e.g. "Senior Writer", "Chief Football Correspondent"
  avatarUrl?: string;
}

export interface Story {
  id: string;
  slug: string;
  type: StoryType;
  status: StoryStatus;
  headline: string;
  standfirst: string;         // the magazine "deck" — one evocative sentence
  heroImage: string;
  heroVideo?: string;
  author: StoryAuthor;
  contributors?: StoryAuthor[];
  publishedAt: string;
  readingTime: number;        // minutes
  tags: string[];
  seriesLabel?: string;       // e.g. "Road to the Lions: Qualifiers"
  featured?: boolean;
  chapterCount?: number;      // for multi-chapter long reads
  blocks: StoryBlock[];
  playerConnections?: PlayerConnection[];
  clubConnections?: ClubConnection[];
  awardConnections?: AwardConnection[];
}

export interface StorySummary
  extends Pick<
    Story,
    'id' | 'slug' | 'type' | 'headline' | 'standfirst' | 'heroImage' |
    'author' | 'publishedAt' | 'readingTime' | 'tags' | 'seriesLabel' | 'featured'
  > {}