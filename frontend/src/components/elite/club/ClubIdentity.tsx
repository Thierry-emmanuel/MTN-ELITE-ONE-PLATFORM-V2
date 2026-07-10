import { memo } from 'react';
import { Fingerprint, MapPinned, CalendarDays, Users2, UserRound, Swords, Quote } from 'lucide-react';
import { SectionHeading, Reveal, VitrinePanel } from './ClubSectionShell';
import { PlayerAvatar } from '@/components/elite/stats/MediaAvatar';
import { STADIUM_FALLBACK_IMAGE } from './clubAssets';
import type { Club, CoachStaff, ClubIdentityExtra } from '@/types/football.types';

interface ClubIdentityProps {
  club: Club;
  identity: ClubIdentityExtra;
  headCoach?: CoachStaff;
}

/**
 * The club's identity plaque — who it is, in one sitting: origins, home
 * ground, the people who lead it on and off the pitch, its declared
 * footballing philosophy, and the rivalries that define its calendar.
 */
export const ClubIdentity = memo(({ club, identity, headCoach }: ClubIdentityProps) => {
  const primary = club.color || '#FCD116';
  const secondary = club.secondaryColor || '#022c22';

  const facts = [
    { label: 'Fondation', value: club.foundedYear ? String(club.foundedYear) : '—', icon: CalendarDays },
    { label: 'Ville', value: club.city + (club.region ? `, ${club.region}` : ''), icon: MapPinned },
    { label: 'Stade', value: club.stadium || '—', icon: Users2 },
    { label: 'Capacité', value: club.stadiumCapacity ? `${club.stadiumCapacity.toLocaleString('fr-FR')} places` : '—', icon: Users2 },
  ];

  const people = [
    { role: 'Président', name: club.presidentName, photoUrl: club.presidentPhotoUrl },
    { role: 'Entraîneur', name: headCoach ? `${headCoach.firstName} ${headCoach.lastName}` : undefined, photoUrl: headCoach?.photoUrl },
    { role: 'Capitaine', name: identity.captainName, photoUrl: identity.captainPhotoUrl },
  ].filter(p => p.name);

  return (
    <>
      <SectionHeading
        icon={Fingerprint}
        room="Salle 01"
        title="Identité du Club"
        subtitle="Ses origines, sa terre d'ancrage, celles et ceux qui la portent — la carte d'identité complète de l'institution."
        accentColor={primary}
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Philosophy + description */}
        <Reveal>
          <VitrinePanel className="lg:col-span-2 h-full p-7 space-y-5" accentColor={primary}>
            <div className="flex items-center gap-2">
              <Quote className="h-4 w-4" style={{ color: primary }} />
              <span className="text-[10px] uppercase tracking-[0.28em] font-semibold text-white/40">Philosophie du club</span>
            </div>
            <p className="font-serif text-lg lg:text-xl text-white/85 leading-relaxed">
              {identity.philosophy}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex-1 min-w-[80px] space-y-1.5">
                <div className="h-12 border border-white/10" style={{ backgroundColor: primary }} />
                <p className="text-[9px] text-center text-white/40 uppercase tracking-wider font-mono">{primary}</p>
              </div>
              <div className="flex-1 min-w-[80px] space-y-1.5">
                <div className="h-12 border border-white/10" style={{ backgroundColor: secondary }} />
                <p className="text-[9px] text-center text-white/40 uppercase tracking-wider font-mono">{secondary}</p>
              </div>
            </div>
          </VitrinePanel>
        </Reveal>

        {/* Quick facts plaque */}
        <Reveal delay={0.08}>
          <VitrinePanel className="h-full p-6">
            <h3 className="font-display text-[11px] font-bold text-white/80 uppercase tracking-wider border-b border-white/10 pb-2.5 mb-4">
              Fiche d'identité
            </h3>
            <dl className="space-y-3.5">
              {facts.map(f => (
                <div key={f.label} className="flex items-center justify-between gap-3 text-xs">
                  <dt className="flex items-center gap-2 text-white/45">
                    <f.icon className="h-3.5 w-3.5" style={{ color: primary }} />
                    {f.label}
                  </dt>
                  <dd className="font-semibold text-white text-right">{f.value}</dd>
                </div>
              ))}
            </dl>
          </VitrinePanel>
        </Reveal>
      </div>

      {/* Leadership row */}
      {people.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4 mt-5">
          {people.map((p, i) => (
            <Reveal key={p.role} delay={0.05 * i}>
              <VitrinePanel className="p-5 flex items-center gap-4">
                <PlayerAvatar photoUrl={p.photoUrl} name={p.name!} size={56} className="ring-2 ring-white/10" />
                <div className="min-w-0">
                  <span className="text-[9px] uppercase tracking-[0.24em] font-semibold" style={{ color: primary }}>
                    <UserRound className="h-3 w-3 inline mr-1 -mt-0.5" />
                    {p.role}
                  </span>
                  <div className="text-sm font-bold text-white truncate mt-0.5">{p.name}</div>
                </div>
              </VitrinePanel>
            </Reveal>
          ))}
        </div>
      )}

      {/* Stadium spotlight */}
      <Reveal delay={0.12}>
        <div className="mt-5 relative overflow-hidden border border-white/10 group">
          <img
            src={club.stadiumPhotoUrl || STADIUM_FALLBACK_IMAGE}
            alt={club.stadium || 'Stade du club'}
            className="h-52 lg:h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06090a] via-[#06090a]/45 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6 flex items-end justify-between flex-wrap gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.24em] font-semibold" style={{ color: primary }}>Antre du club</span>
              <h3 className="font-serif italic text-2xl lg:text-3xl text-white">{club.stadium || 'Stade Municipal'}</h3>
            </div>
            {club.stadiumCapacity && (
              <div className="text-right">
                <div className="font-display text-2xl font-black text-white">{club.stadiumCapacity.toLocaleString('fr-FR')}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Places assises</div>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Rivalries */}
      {identity.rivalries.length > 0 && (
        <Reveal delay={0.16}>
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-4">
              <Swords className="h-3.5 w-3.5" style={{ color: primary }} />
              <span className="text-[10px] uppercase tracking-[0.28em] font-semibold text-white/40">Rivalités historiques</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {identity.rivalries.map(r => (
                <div key={r.clubId} className="border border-white/10 bg-white/[0.02] p-5 hover:border-white/25 transition-colors">
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider inline-block border mb-2.5"
                    style={{ background: `${primary}14`, color: primary, borderColor: `${primary}40` }}
                  >
                    {r.intensity}
                  </span>
                  <h4 className="font-display text-sm font-black text-white mb-1.5">{club.short} vs {r.clubName}</h4>
                  <p className="text-xs text-white/55 leading-relaxed">{r.note}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </>
  );
});
ClubIdentity.displayName = 'ClubIdentity';
