/**
 * ExploreRail — « Continuer l'exploration ». Mounted at the foot of every
 * entity page (club, joueur, match, story) so no page is a dead end: related
 * stories, media, recent matches and heritage, resolved from the REAL
 * backend relations recorded by the builders. Netflix-style forward motion:
 * direct relations first, freshest league content as the fallback row.
 */
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Landmark, Newspaper, Trophy } from 'lucide-react';
import {
  useClubMatches, useLegends, useRelatedMedia, useRelatedStories, storyTitle, type EntityRef,
} from '@/features/public/publicExperience.api';

export function ExploreRail({ entity, title = "Continuer l'exploration" }: { entity: EntityRef; title?: string }) {
  const { data: stories = [] } = useRelatedStories(entity);
  const { data: media = [] } = useRelatedMedia(entity);
  const { data: matches = [] } = useClubMatches(entity.clubId);
  const { data: legends = [] } = useLegends(entity.clubName ? { clubName: entity.clubName } : undefined);

  const hasAnything = stories.length + media.length + matches.length + legends.length > 0;
  if (!hasAnything) return null;

  return (
    <section aria-label={title} className="mx-auto mt-16 max-w-6xl border-t border-stone-200 px-4 pb-16 pt-10 dark:border-zinc-800">
      <h2 className="mb-6 font-sans text-xl font-black tracking-tight text-stone-900 dark:text-zinc-100">{title}</h2>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {stories.length > 0 && (
          <div className="lg:col-span-2">
            <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
              <Newspaper className="size-3.5" /> Stories
            </p>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {stories.map((s) => (
                <li key={s._id}>
                  <Link to={`/news/${s.slug}`}
                    className="group block overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                    {s.cover_image && (
                      <div className="h-32 w-full overflow-hidden bg-stone-100 dark:bg-zinc-900">
                        <img src={s.cover_image} alt="" loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                      </div>
                    )}
                    <div className="p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-500">
                        {s.category ?? 'Story'}{(s as { isDirect?: boolean }).isDirect ? '' : ' · à la une'}
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-sans text-[14px] font-bold leading-snug text-stone-900 dark:text-zinc-100">
                        {storyTitle(s)}
                      </h3>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-8">
          {matches.length > 0 && (
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                <Trophy className="size-3.5" /> Matchs récents
              </p>
              <ul className="space-y-1.5">
                {matches.map((m) => (
                  <li key={m.id}>
                    <Link to={`/matches/${m.id}`}
                      className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2 text-[13px] transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-800 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/30">
                      <span className="truncate text-stone-700 dark:text-zinc-300">
                        {m.homeClub?.name} <b>{m.homeScore ?? '–'}:{m.awayScore ?? '–'}</b> {m.awayClub?.name}
                      </span>
                      <ArrowRight className="size-3.5 shrink-0 text-stone-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {legends.length > 0 && (
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                <Landmark className="size-3.5" /> Héritage
              </p>
              <ul className="space-y-1.5">
                {legends.slice(0, 3).map((l) => (
                  <li key={l._id}>
                    <Link to="/hall-of-fame"
                      className="block rounded-lg border border-stone-200 px-3 py-2 transition-colors hover:border-amber-300 hover:bg-amber-50 dark:border-zinc-800 dark:hover:border-amber-900 dark:hover:bg-amber-950/20">
                      <p className="text-[13px] font-semibold text-stone-800 dark:text-zinc-200">{l.name}</p>
                      <p className="text-[11px] text-stone-500">{l.era ?? ''}{l.inducted_year ? ` · intronisé ${l.inducted_year}` : ''}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {media.length > 0 && (
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
                <Camera className="size-3.5" /> Médias
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {media.slice(0, 8).map((m) => (
                  <Link key={m._id} to="/media" title={m.title}
                    className="block aspect-square overflow-hidden rounded-lg bg-stone-100 dark:bg-zinc-900">
                    <img src={m.thumbnailUrl || m.url} alt={m.title} loading="lazy" className="h-full w-full object-cover transition-transform hover:scale-105" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
