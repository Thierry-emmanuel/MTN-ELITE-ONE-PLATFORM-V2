import { Shield, MapPin, Users2, Trophy, Calendar } from 'lucide-react';
import type { Club } from '../configs/clubs.config';

export function ClubPreviewCard({ data }: { data: Partial<Club> }) {
  const primary = data.primaryColor || '#0B2B26';
  const secondary = data.secondaryColor || '#E07B39';
  const trophyCount = data.achievements
    ? Object.values(data.achievements).reduce((sum, n) => sum + (Number(n) || 0), 0)
    : 0;

  return (
    <div className="space-y-4">
      {/* Public club profile card */}
      <div className="rounded-2xl overflow-hidden border border-white/8 bg-[#0B0F16] shadow-2xl">
        <div
          className="relative h-28 flex items-end px-5 pb-3"
          style={{ background: `linear-gradient(135deg, ${primary}, ${secondary}22)` }}
        >
          {data.bannerUrl && (
            <img src={data.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          )}
          <div className="relative flex items-end gap-3">
            <div
              className="h-16 w-16 rounded-2xl border-4 border-[#0B0F16] bg-white/5 grid place-items-center overflow-hidden shrink-0"
              style={{ borderColor: '#0B0F16' }}
            >
              {data.logoUrl ? (
                <img src={data.logoUrl} alt={data.name} className="h-full w-full object-cover" />
              ) : (
                <Shield className="h-6 w-6 text-white/25" />
              )}
            </div>
          </div>
        </div>

        <div className="px-5 pt-3 pb-5">
          <p className="text-base font-display font-bold text-white leading-tight">
            {data.name || 'Nouveau club'}
          </p>
          {data.nickname && <p className="text-[11px] font-semibold mt-0.5" style={{ color: secondary }}>« {data.nickname} »</p>}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-[10px] text-white/40">
            {data.city && (
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {data.city}{data.region ? `, ${data.region}` : ''}</span>
            )}
            {data.foundedYear && (
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Fondé en {data.foundedYear}</span>
            )}
          </div>

          {data.stadium && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/8">
              <Users2 className="h-3.5 w-3.5 text-white/25 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-white/70 truncate">{data.stadium}</p>
                {data.stadiumCapacity && (
                  <p className="text-[9px] text-white/30">{Number(data.stadiumCapacity).toLocaleString('fr-FR')} places</p>
                )}
              </div>
            </div>
          )}

          {trophyCount > 0 && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: `${secondary}14`, border: `1px solid ${secondary}33` }}>
              <Trophy className="h-3.5 w-3.5 shrink-0" style={{ color: secondary }} />
              <p className="text-[11px] font-bold" style={{ color: secondary }}>{trophyCount} trophée{trophyCount > 1 ? 's' : ''} au palmarès</p>
            </div>
          )}
        </div>
      </div>

      {data.description && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/25 mb-1.5">Description</p>
          <p className="text-[11px] text-white/55 leading-relaxed line-clamp-4">{data.description}</p>
        </div>
      )}

      {!!data.presidentName && (
        <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-white/8 overflow-hidden grid place-items-center shrink-0">
            {data.presidentPhotoUrl ? (
              <img src={data.presidentPhotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Users2 className="h-3.5 w-3.5 text-white/25" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-wide text-white/25">Président</p>
            <p className="text-[11px] font-semibold text-white/70 truncate">{data.presidentName}</p>
          </div>
        </div>
      )}

      {!data.name && (
        <p className="text-[10px] text-white/25 text-center italic">
          L'aperçu se complète au fil des étapes.
        </p>
      )}
    </div>
  );
}
