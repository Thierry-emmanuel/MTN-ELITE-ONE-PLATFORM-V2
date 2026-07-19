/**
 * Story Builder canvas — the generic per-step field grid PLUS one bespoke
 * capability: auto-population from the linked match. The Match Builder being
 * the single source of truth, a match report starts from ITS data — score,
 * clubs, buteurs, cartons — fetched live, never re-derived.
 */
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/services/api';
import type { CanvasProps } from '../../registry/types';
import { ConfigFieldsGrid } from '../configBuilder';
import { articlesConfig, type Article } from '@/features/admin/configs/articles.config';
import { playerName, type MatchDetail } from '@/features/matches/matchBuilder.api';

type Draft = Partial<Article>;

const STEP_FIELDS: Record<string, (keyof Article)[]> = {
  type: ['category', 'articleType', 'author'],
  content: ['title', 'subtitle', 'body'],
  relations: ['relatedMatchId', 'tags'],
  media: ['cover_image', 'videoUrl'],
  distribution: ['slug', 'status', 'featured', 'isBreaking'],
};

/** Compose a match report skeleton from the authoritative match. */
function reportFromMatch(m: MatchDetail): Pick<Article, 'title' | 'subtitle' | 'body' | 'tags'> {
  const home = m.homeClub?.name ?? 'Domicile';
  const away = m.awayClub?.name ?? 'Extérieur';
  const score = `${m.homeScore ?? 0}-${m.awayScore ?? 0}`;
  const scorers = (m.events ?? [])
    .filter((e) => ['GOAL', 'PENALTY_GOAL', 'OWN_GOAL'].includes(e.type))
    .sort((a, b) => a.minute - b.minute)
    .map((e) => `${e.minute}' ${playerName(e.player)}${e.type === 'OWN_GOAL' ? ' (csc)' : e.type === 'PENALTY_GOAL' ? ' (pen.)' : ''}`);
  const cards = (m.events ?? []).filter((e) => ['RED_CARD', 'SECOND_YELLOW'].includes(e.type))
    .map((e) => `${e.minute}' ${playerName(e.player)} exclu`);

  const bodyFr = [
    `${home} ${score} ${away} — Journée ${m.round}${m.venue ? `, ${m.venue}` : ''}.`,
    scorers.length ? `Buteurs : ${scorers.join(' · ')}.` : 'Aucun but inscrit.',
    cards.length ? `Discipline : ${cards.join(' · ')}.` : '',
    '',
    '[Développez le récit du match ici — le squelette ci-dessus vient du backend.]',
  ].filter(Boolean).join('\n');

  return {
    title: { fr: `${home} ${score} ${away}`, en: `${home} ${score} ${away}` },
    subtitle: { fr: `Journée ${m.round} — MTN Elite One`, en: `Matchday ${m.round} — MTN Elite One` },
    body: { fr: bodyFr, en: bodyFr },
    tags: ['rapport-de-match', `journee-${m.round}`, home, away].map((t) => String(t)),
  };
}

export function StoryCanvas({ draft, onChange, onSelect, activeSection }: CanvasProps<Draft>) {
  const [populating, setPopulating] = useState(false);
  const canPopulate = draft.category === 'MATCH_REPORT' && !!draft.relatedMatchId;

  const populate = async () => {
    setPopulating(true);
    try {
      const { data } = await apiClient.get<MatchDetail>(`/matches/${draft.relatedMatchId}`);
      onChange({ ...draft, ...reportFromMatch(data) });
      toast.success('Story pré-remplie depuis le match', {
        description: `Score, buteurs et discipline importés de GET /matches/${draft.relatedMatchId}`,
      });
    } catch {
      toast.error('Match introuvable côté backend.');
    } finally {
      setPopulating(false);
    }
  };

  if (activeSection === 'review') {
    return (
      <div className="mx-auto max-w-[720px] p-6">
        <div className="rounded-2xl bg-stone-50 p-6 text-stone-900">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
            {draft.category ?? 'STORY'} · {draft.author || 'Sans signature'}
          </p>
          <h2 className="mt-2 font-sans text-2xl font-black tracking-tight">{draft.title?.fr || 'Sans titre'}</h2>
          {draft.subtitle?.fr && <p className="mt-1 text-[15px] text-stone-500">{draft.subtitle.fr}</p>}
          <p className="mt-4 whitespace-pre-line text-[14px] leading-relaxed text-stone-700">
            {draft.body?.fr || 'Contenu vide.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[760px] p-6">
      {(activeSection === 'content' || activeSection === 'relations') && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-900/60 bg-emerald-950/30 px-4 py-3">
          <p className="text-[12px] leading-relaxed text-emerald-300/80">
            {canPopulate
              ? 'Match lié détecté — importez score, buteurs et discipline depuis le backend.'
              : 'Choisissez « Rapport de match » et liez un match (onglet Relations) pour activer l’auto-remplissage.'}
          </p>
          <Button size="sm" onClick={populate} disabled={!canPopulate || populating}
            className="h-8 shrink-0 gap-1.5 bg-emerald-600 text-[12px] text-white hover:bg-emerald-500">
            <Sparkles className="size-3.5" /> {populating ? 'Import…' : 'Pré-remplir'}
          </Button>
        </div>
      )}
      <ConfigFieldsGrid
        config={articlesConfig}
        fieldKeys={STEP_FIELDS[activeSection] ?? undefined}
        draft={draft}
        onChange={onChange}
        onSelect={onSelect}
      />
    </div>
  );
}
