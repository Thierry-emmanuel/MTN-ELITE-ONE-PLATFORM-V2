/**
 * Discover — the exploration experience. One page that answers « et
 * maintenant, où aller ? » : the moment of the league (intelligence engine),
 * fresh stories, a legend to meet, media to browse, and a universal search
 * across clubs and players. Everything real, everything linked.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Landmark, Search, Sparkles, TrendingUp } from 'lucide-react';
import PageLayout from '@/layout/PageLayout';
import {
  usePlayers, useSeasonMatches, useStandings, useTopScorers, useSeasons,
} from '@/features/intelligence/intelligence.api';
import { currentStreak, matchTrends, momentum, nameOf } from '@/features/intelligence/engine';
import { useLegends, useRelatedStories, storyTitle } from '@/features/public/publicExperience.api';

export default function DiscoverPage() {
  const { data: seasons = [] } = useSeasons();
  const seasonId = (seasons.find((s) => s.status === 'ONGOING') ?? seasons[0])?.id;
  const { data: standings = [] } = useStandings(seasonId);
  const { data: matches = [] } = useSeasonMatches(seasonId);
  const { data: scorers = [] } = useTopScorers(seasonId, 3);
  const { data: players = [] } = usePlayers();
  const { data: legends = [] } = useLegends();
  const { data: stories = [] } = useRelatedStories({}, 6);
  const [q, setQ] = useState('');

  const hottest = useMemo(() => [...standings].sort((a, b) => momentum(b.formGuide) - momentum(a.formGuide))[0], [standings]);
  const trends = matchTrends(matches);
  const legend = legends[0];

  const results = useMemo(() => {
    if (q.trim().length < 2) return { clubs: [], players: [] };
    const needle = q.toLowerCase();
    return {
      clubs: standings.filter((s) => (s.club?.name ?? '').toLowerCase().includes(needle)).slice(0, 5),
      players: players.filter((p) => `${p.firstName ?? ''} ${p.lastName ?? ''}`.toLowerCase().includes(needle)).slice(0, 6),
    };
  }, [q, standings, players]);

  const moments = [
    standings[0] && { icon: TrendingUp, label: 'En tête', text: `${standings[0].club?.name} — ${standings[0].points} pts`, to: `/clubs/${standings[0].clubId}` },
    hottest && { icon: Sparkles, label: 'Momentum', text: `${hottest.club?.name} — ${momentum(hottest.formGuide)}/100, ${currentStreak(hottest.formGuide).length} ${currentStreak(hottest.formGuide).type}`, to: `/clubs/${hottest.clubId}` },
    scorers[0] && { icon: Compass, label: 'Soulier d’or', text: `${nameOf(scorers[0])} — ${scorers[0].goals} buts`, to: '/stats' },
  ].filter(Boolean) as { icon: typeof Compass; label: string; text: string; to: string }[];

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-600">Découvrir</p>
          <h1 className="mt-1 font-sans text-3xl font-black tracking-tight text-stone-900 dark:text-white lg:text-4xl">
            Le football camerounais, sans fin de parcours
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-stone-500">
            {trends.finished > 0
              ? `${trends.finished} matchs joués · ${trends.avgGoals} buts/match · ${trends.homePct}% de victoires à domicile — voilà l'histoire du moment.`
              : 'La saison démarre — commencez par les clubs et l\'héritage.'}
          </p>
        </header>

        {/* Universal search */}
        <div className="mb-10">
          <div className="flex h-12 items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <Search className="size-4 text-stone-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Chercher un club, un joueur…"
              className="w-full bg-transparent text-[15px] text-stone-900 outline-none placeholder:text-stone-400 dark:text-white" />
          </div>
          {(results.clubs.length > 0 || results.players.length > 0) && (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {results.clubs.map((c) => (
                <Link key={c.clubId} to={`/clubs/${c.clubId}`}
                  className="rounded-xl border border-stone-200 px-4 py-2.5 text-[14px] text-stone-800 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-emerald-950/30">
                  {c.club?.name} <span className="text-stone-400">· #{c.position} au classement</span>
                </Link>
              ))}
              {results.players.map((p) => (
                <Link key={p.id} to={`/players/${p.id}`}
                  className="rounded-xl border border-stone-200 px-4 py-2.5 text-[14px] text-stone-800 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-emerald-950/30">
                  {[p.firstName, p.lastName].filter(Boolean).join(' ')} <span className="text-stone-400">· {p.position ?? 'Joueur'}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* The moment of the league — intelligence engine, public voice */}
        {moments.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 font-sans text-lg font-black tracking-tight text-stone-900 dark:text-white">Le moment de la ligue</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {moments.map((m) => (
                <Link key={m.label} to={m.to}
                  className="group rounded-2xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                  <m.icon className="size-5 text-emerald-600" />
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">{m.label}</p>
                  <p className="mt-1 text-[15px] font-bold leading-snug text-stone-900 dark:text-white">{m.text}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Stories + a legend */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h2 className="mb-4 font-sans text-lg font-black tracking-tight text-stone-900 dark:text-white">À lire</h2>
            {stories.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-10 text-center text-[13px] text-stone-400 dark:border-zinc-800">
                Les premières stories arrivent du Story Builder.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {stories.map((s) => (
                  <li key={s._id}>
                    <Link to={`/news/${s.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                      {s.cover_image && (
                        <div className="h-36 overflow-hidden bg-stone-100 dark:bg-zinc-900">
                          <img src={s.cover_image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                        </div>
                      )}
                      <div className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-500">{s.category ?? 'Story'}</p>
                        <h3 className="mt-1 line-clamp-2 font-sans text-[15px] font-bold leading-snug text-stone-900 dark:text-white">{storyTitle(s)}</h3>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 font-sans text-lg font-black tracking-tight text-stone-900 dark:text-white">
              <Landmark className="size-4 text-amber-500" /> Une légende à rencontrer
            </h2>
            {legend ? (
              <Link to="/hall-of-fame" className="block rounded-2xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                {legend.images?.[0] && (
                  <img src={legend.images[0]} alt={legend.name} loading="lazy" className="mb-4 h-44 w-full rounded-xl object-cover" />
                )}
                <p className="font-sans text-[17px] font-black text-stone-900 dark:text-white">{legend.name}</p>
                <p className="text-[12px] text-stone-500">{legend.era ?? ''}{legend.clubs?.[0] ? ` · ${legend.clubs[0]}` : ''}</p>
                {legend.quote && <p className="mt-3 border-l-2 border-amber-400 pl-3 text-[13px] italic leading-relaxed text-stone-600 dark:text-zinc-400">« {legend.quote} »</p>}
              </Link>
            ) : (
              <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-10 text-center text-[13px] text-stone-400 dark:border-zinc-800">
                Le Heritage Builder intronisera la première légende.
              </p>
            )}
            <Link to="/hall-of-fame" className="mt-3 block text-center text-[12px] font-semibold text-emerald-700 hover:underline dark:text-emerald-500">
              Entrer dans le Hall of Fame →
            </Link>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
