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
import { useLegends, useRelatedStories, storyTitle, PublicStory, PublicLegend } from '@/features/public/publicExperience.api';

const fallbackStories: PublicStory[] = [
  {
    _id: 'f-1',
    slug: 'renaissance-coton-sport',
    category: 'Analyses',
    title: {
      fr: 'La Renaissance de Coton Sport de Garoua',
      en: 'The Renaissance of Coton Sport of Garoua'
    },
    subtitle: { fr: 'Comment le club du Nord domine le championnat' },
    cover_image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60',
    author: 'Equipe de Rédaction',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    _id: 'f-2',
    slug: 'jeunes-talents-elite-one',
    category: 'Reportages',
    title: {
      fr: 'Les 5 jeunes talents à suivre cette saison en Elite One',
      en: '5 young talents to watch this season in Elite One'
    },
    subtitle: { fr: 'Focus sur les futures pépites du football camerounais' },
    cover_image: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=800&auto=format&fit=crop&q=60',
    author: 'Analyste Foot',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

const fallbackLegend: PublicLegend = {
  _id: 'f-l1',
  name: 'Roger Milla',
  era: '1977 — 1994',
  clubs: ['Tonnerre Yaoundé', 'Lions Indomptables'],
  career_summary: 'L\'un des plus grands joueurs africains de tous les temps, célèbre pour ses buts légendaires et sa danse emblématique du poteau de corner à la Coupe du Monde 1990.',
  achievements: ['Meilleur joueur africain de l\'année', 'Quart de finale de Coupe du Monde 1990'],
  quote: 'Le football n\'est pas un jeu de force, c\'est un art qui vient du cœur.',
  inducted_year: 2024,
  images: ['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=60']
};

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
  
  const legend = legends.length > 0 ? legends[0] : fallbackLegend;
  const displayStories = stories.length > 0 ? stories : fallbackStories;

  const results = useMemo(() => {
    if (q.trim().length < 2) return { clubs: [], players: [] };
    const needle = q.toLowerCase();
    return {
      clubs: standings.filter((s) => (s.club?.name ?? '').toLowerCase().includes(needle)).slice(0, 5),
      players: players.filter((p) => `${p.firstName ?? ''} ${p.lastName ?? ''}`.toLowerCase().includes(needle)).slice(0, 6),
    };
  }, [q, standings, players]);

  const dbMoments = [
    standings[0] && { icon: TrendingUp, label: 'En tête', text: `${standings[0].club?.name} — ${standings[0].points} pts`, to: `/clubs/${standings[0].clubId}` },
    hottest && { icon: Sparkles, label: 'Momentum', text: `${hottest.club?.name} — ${momentum(hottest.formGuide)}/100, ${currentStreak(hottest.formGuide).length} ${currentStreak(hottest.formGuide).type}`, to: `/clubs/${hottest.clubId}` },
    scorers[0] && { icon: Compass, label: 'Soulier d’or', text: `${nameOf(scorers[0])} — ${scorers[0].goals} buts`, to: '/stats' },
  ].filter(Boolean) as { icon: typeof Compass; label: string; text: string; to: string }[];

  const fallbackMoments = [
    { icon: TrendingUp, label: 'En tête (Exemple)', text: 'Coton Sport — 42 pts', to: '/clubs' },
    { icon: Sparkles, label: 'Momentum (Exemple)', text: 'Canon Yaoundé — 85/100, 5 Victoires en cours', to: '/clubs' },
    { icon: Compass, label: 'Soulier d’or (Exemple)', text: 'Vincent Aboubakar — 18 buts', to: '/stats' },
  ];

  const moments = dbMoments.length > 0 ? dbMoments : fallbackMoments;

  return (
    <PageLayout>
      <div className="relative mx-auto max-w-6xl px-4 py-10">
        {/* Decorative subtle background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[350px] w-[600px] -translate-x-1/2 rounded-full bg-primary-glow/10 blur-[120px]" />

        <header className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Découvrir</p>
          <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-foreground uppercase lg:text-4xl">
            Le football camerounais, sans fin de parcours
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
            {trends.finished > 0
              ? `${trends.finished} matchs joués · ${trends.avgGoals} buts/match · ${trends.homePct}% de victoires à domicile — voilà l'histoire du moment.`
              : 'La saison démarre — commencez par les clubs et l\'héritage.'}
          </p>
        </header>

        {/* Universal search styled for platform */}
        <div className="mb-10">
          <div className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-card/50 px-4 shadow-elegant backdrop-blur-md transition-all focus-within:border-primary/50 focus-within:bg-card focus-within:ring-1 focus-within:ring-primary/20">
            <Search className="size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Chercher un club, un joueur…"
              className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground" />
          </div>
          {(results.clubs.length > 0 || results.players.length > 0) && (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {results.clubs.map((c) => (
                <Link key={c.clubId} to={`/clubs/${c.clubId}`}
                  className="rounded-xl border border-border bg-card/40 px-4 py-2.5 text-[14px] text-foreground transition-all hover:border-primary/50 hover:bg-primary/10">
                  {c.club?.name} <span className="text-muted-foreground">· #{c.position} au classement</span>
                </Link>
              ))}
              {results.players.map((p) => (
                <Link key={p.id} to={`/players/${p.id}`}
                  className="rounded-xl border border-border bg-card/40 px-4 py-2.5 text-[14px] text-foreground transition-all hover:border-primary/50 hover:bg-primary/10">
                  {[p.firstName, p.lastName].filter(Boolean).join(' ')} <span className="text-muted-foreground">· {p.position ?? 'Joueur'}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* The moment of the league — intelligence engine, public voice */}
        {moments.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 font-display text-lg font-black tracking-tight text-foreground uppercase">Le moment de la ligue</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {moments.map((m) => (
                <Link key={m.label} to={m.to}
                  className="group rounded-2xl border border-border bg-card/40 p-5 shadow-card transition-all hover:scale-[1.02] hover:border-primary/30 hover:bg-card">
                  <m.icon className="size-5 text-primary" />
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{m.label}</p>
                  <p className="mt-1 text-[15px] font-bold leading-snug text-foreground group-hover:text-primary transition-colors">{m.text}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Stories + a legend */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h2 className="mb-4 font-display text-lg font-black tracking-tight text-foreground uppercase">À lire</h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {displayStories.map((s) => (
                <li key={s._id}>
                  <Link to={`/news/${s.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-border bg-card/40 shadow-card transition-all hover:scale-[1.01] hover:border-primary/30 hover:bg-card">
                    {s.cover_image && (
                      <div className="h-36 overflow-hidden bg-muted">
                        <img src={s.cover_image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{s.category ?? 'Story'}</p>
                      <h3 className="mt-1 line-clamp-2 font-sans text-[15px] font-bold leading-snug text-foreground group-hover:text-primary transition-colors">{storyTitle(s)}</h3>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-black tracking-tight text-foreground uppercase">
              <Landmark className="size-4 text-accent" /> Une légende à rencontrer
            </h2>
            <Link to="/hall-of-fame" className="group block rounded-2xl border border-border bg-card/40 p-5 shadow-card transition-all hover:scale-[1.01] hover:border-primary/30 hover:bg-card">
              {legend.images?.[0] && (
                <div className="mb-4 overflow-hidden rounded-xl bg-muted">
                  <img src={legend.images[0]} alt={legend.name} loading="lazy" className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                </div>
              )}
              <p className="font-sans text-[17px] font-black text-foreground group-hover:text-accent transition-colors">{legend.name}</p>
              <p className="text-[12px] text-muted-foreground">{legend.era ?? ''}{legend.clubs?.[0] ? ` · ${legend.clubs[0]}` : ''}</p>
              {legend.quote && <p className="mt-3 border-l-2 border-accent pl-3 text-[13px] italic leading-relaxed text-muted-foreground bg-muted/20 py-1.5 pr-2 rounded-r-md">« {legend.quote} »</p>}
            </Link>
            <Link to="/hall-of-fame" className="mt-4 block text-center text-[12px] font-semibold text-primary hover:underline">
              Entrer dans le Hall of Fame →
            </Link>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
