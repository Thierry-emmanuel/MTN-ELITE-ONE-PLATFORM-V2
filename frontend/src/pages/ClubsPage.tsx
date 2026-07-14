import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Shield, ArrowRight, Heart } from 'lucide-react';
import { useClubs } from '@/hooks/useFootball';
import { PageHero, ClubLogo } from '@/components/elite/FootballPrimitives';
import PageLayout from '@/layout/PageLayout';
import type { Club } from '@/types/football.types';
import { useFavoritesStore } from '@/store/favorites.store';

export default function ClubsPage() {
  const { data: clubs, isLoading } = useClubs();
  const [search, setSearch] = useState('');
  const { toggleLikeClub, isClubLiked } = useFavoritesStore();

  const filteredClubs = useMemo(() => {
    if (!clubs) return [];
    return (clubs as Club[]).filter((c: Club) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
    );
  }, [clubs, search]);

  const getStadium = (city: string) => {
    const stadiums: Record<string, string> = {
      Garoua: 'Stade Roumdé Adjia',
      Yaoundé: 'Stade Ahmadou Ahidjo',
      Douala: 'Stade de la Réunification',
      Bafoussam: 'Stade Omnisports de Kouékong',
    };
    return stadiums[city] ?? 'Stade Municipal';
  };

  return (
    <PageLayout>
      <PageHero
        eyebrow="MTN Elite One · Clubs"
        title="Clubs Officiels"
        subtitle="Découvrez les clubs de la première division du Cameroun"
        accentColor="green"
      />

      <div className="container py-10 space-y-8">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un club par nom ou ville…"
            className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        {/* Result count */}
        {!isLoading && clubs && (
          <p className="text-xs text-muted-foreground">
            {filteredClubs.length} club{filteredClubs.length !== 1 ? 's' : ''} affiché{filteredClubs.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Clubs Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-52 rounded-3xl bg-white/[0.02] border border-border/40 animate-pulse"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="text-center py-24">
              <Shield className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Aucun club trouvé pour votre recherche.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredClubs.map((club: Club, idx: number) => {
                const isLiked = isClubLiked(club.id);
                return (
                  <motion.div
                    key={club.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative rounded-3xl overflow-hidden border border-border/50 bg-gradient-to-b from-white/[0.03] to-transparent hover:border-white/20 transition-all duration-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
                  >
                    {/* Club colour accent bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ backgroundColor: club.color || '#FCD116' }}
                    />

                    <div className="p-6 flex flex-col justify-between h-full space-y-6">
                      {/* Top: Name + Logo */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 min-w-0 pr-3">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-bold block">
                            {club.city}
                          </span>
                          <h3 className="font-display text-xl font-bold leading-tight group-hover:text-accent transition-colors truncate">
                            {club.name}
                          </h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{getStadium(club.city)}</span>
                          </p>
                        </div>
                        <div className="shrink-0 h-16 w-16 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center p-2.5 shadow-inner group-hover:scale-105 transition-transform duration-300">
                          <ClubLogo club={club} size={48} />
                        </div>
                      </div>

                      {/* Bottom: Quick stats + CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-border/30">
                        <div className="flex items-center gap-5">
                          <div className="text-center">
                            <div className="text-xs font-mono font-bold text-white/80">18</div>
                            <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Matchs</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-mono font-bold text-accent">
                              {club.id === 'cot' ? '38' : club.id === 'cnk' ? '34' : '31'}
                            </div>
                            <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Points</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleLikeClub(club.id);
                            }}
                            className={`h-8 w-8 rounded-xl border flex items-center justify-center transition-all ${
                              isLiked
                                ? 'bg-red-500/10 border-red-500/30 text-red-500'
                                : 'bg-white/5 border-white/10 text-white/40 hover:text-red-400'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                          </button>
                          <Link
                            to={`/clubs/${club.id}`}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-accent hover:text-black border border-white/10 hover:border-transparent text-xs font-bold transition-all duration-200"
                          >
                            Voir club <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
