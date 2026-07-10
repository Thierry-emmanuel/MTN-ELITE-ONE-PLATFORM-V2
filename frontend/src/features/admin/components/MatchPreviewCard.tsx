import { Shield, MapPin, Calendar } from 'lucide-react';
import type { Match } from '../configs/matches.config';

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Programmé', LIVE: 'LIVE', HT: 'Mi-temps', FT: 'Terminé',
  POSTPONED: 'Reporté', CANCELLED: 'Annulé',
};

interface ClubLite { id?: string; name?: string; logoUrl?: string; primaryColor?: string }
interface SeasonLite { id?: string; name?: string }

function ClubBadge({ club, fallback }: { club?: ClubLite; fallback: string }) {
  return (
    <div className="flex flex-col items-center gap-2 w-24">
      <div
        className="h-14 w-14 rounded-full border-2 grid place-items-center overflow-hidden shrink-0"
        style={{ borderColor: club?.primaryColor || 'rgba(255,255,255,0.12)' }}
      >
        {club?.logoUrl ? (
          <img src={club.logoUrl} alt={club.name} className="h-full w-full object-cover" />
        ) : (
          <Shield className="h-5 w-5 text-white/20" />
        )}
      </div>
      <p className="text-[10px] font-semibold text-white/70 text-center leading-tight truncate w-full">
        {club?.name || fallback}
      </p>
    </div>
  );
}

export function MatchPreviewCard({
  data, clubs = [], seasons = [],
}: { data: Partial<Match>; clubs?: ClubLite[]; seasons?: SeasonLite[] }) {
  const home = clubs.find((c) => c.id === data.homeClubId);
  const away = clubs.find((c) => c.id === data.awayClubId);
  const season = seasons.find((s) => s.id === data.seasonId);
  const status = data.status || 'SCHEDULED';
  const isLive = status === 'LIVE' || status === 'HT';
  const hasScore = data.homeScore != null || data.awayScore != null;

  return (
    <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-[#111820] to-[#0B0F16] overflow-hidden">
      <div className="px-5 pt-4 flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-accent/70 truncate">
          {season?.name || 'MTN Elite One'} {data.round ? `· J${data.round}` : ''}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
          isLive ? 'bg-red-500/15 text-red-400 border border-red-500/25 animate-pulse' : 'bg-white/[0.06] text-white/40'
        }`}>
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="flex items-center justify-between px-6 py-6 gap-2">
        <ClubBadge club={home} fallback="Domicile" />
        <div className="text-center shrink-0">
          {status === 'SCHEDULED' || !hasScore ? (
            <p className="text-lg font-display font-black text-white/20">VS</p>
          ) : (
            <p className={`text-3xl font-display font-black ${isLive ? 'text-red-400' : 'text-white'}`}>
              {data.homeScore ?? 0}–{data.awayScore ?? 0}
            </p>
          )}
        </div>
        <ClubBadge club={away} fallback="Extérieur" />
      </div>

      <div className="border-t border-white/[0.06] px-5 py-3 flex items-center justify-between text-[10px] text-white/35">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-white/20" />
          {data.scheduledAt
            ? new Date(data.scheduledAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
            : 'Date à définir'}
        </span>
        {data.venue && (
          <span className="flex items-center gap-1.5 truncate max-w-[45%]">
            <MapPin className="h-3 w-3 text-white/20 shrink-0" /> {data.venue}
          </span>
        )}
      </div>
    </div>
  );
}
