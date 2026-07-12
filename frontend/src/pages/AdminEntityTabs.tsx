/**
 * AdminEntityTabs.tsx
 * Professional admin tabs: Seasons · Clubs · Players · Coaches · Users
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Edit3, Trash2, Play, StopCircle, RefreshCw,
  UserCheck, UserX, Shield, Users, Zap, Globe,
} from 'lucide-react';

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="10 15 15 12 10 9" />
  </svg>
);
import {
  AdminCard, FormField, AdminButton, DataTable,
  StatusBadge, SectionHeader, BulkImportExport, Paginator, SwitchToggle,
  MediaUploader,
} from '@/components/ui/AdminUI';
import { layoutApi } from '@/services/layoutApi';

type ToastFn = (msg: string, type?: 'success' | 'error' | 'info') => void;

/* ─── Social icon SVGs ──────────────────────────────────────────────────────── */
const IgIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);
const FbIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const TwIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
  </svg>
);
const TkIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.02-.07z"/>
  </svg>
);

/* ─── Social action button ──────────────────────────────────────────────────── */
const SocialBtn = ({ href, icon, label, color }: { href?: string; icon: React.ReactNode; label: string; color: string }) => (
  href ? (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all hover:scale-105 active:scale-95 ${color}`}>
      {icon}{label}
    </a>
  ) : (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold opacity-30 ${color}`}>{icon}{label}</div>
  )
);

/* ─── Real-time Live Preview Components (Meta/Instagram-style) ─────────────── */
const ClubCardPreview = ({ club }: { club: any }) => (
  <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/[0.07] bg-[#0e1520] sticky top-24">
    {/* Cover banner */}
    <div className="relative h-24 w-full overflow-hidden">
      {club.bannerUrl
        ? <img src={club.bannerUrl} alt="Cover" className="w-full h-full object-cover" />
        : <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${club.primaryColor || '#fcd116'} 0%, ${club.secondaryColor || '#007a5e'} 100%)` }} />
      }
      <div className="absolute inset-0 bg-gradient-to-t from-[#0e1520]/70 to-transparent" />
    </div>
    {/* Avatar */}
    <div className="flex flex-col items-center -mt-9 px-4 pb-4">
      <div className="h-[72px] w-[72px] rounded-full border-4 border-[#0e1520] bg-[#1a2535] overflow-hidden shadow-xl">
        {club.logoUrl
          ? <img src={club.logoUrl} alt="Logo" className="w-full h-full object-contain p-1.5" />
          : <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-bold">Logo</div>
        }
      </div>
      <h4 className="font-display font-bold text-white text-sm mt-2 leading-tight text-center">{club.name || 'Nom du Club'}</h4>
      {club.nickname && <p className="text-[10px] text-accent font-semibold mt-0.5">"{club.nickname}"</p>}
      <p className="text-[9px] text-white/40 mt-1 text-center">{club.city || 'Ville'}{club.foundedYear ? ` · Est. ${club.foundedYear}` : ''}</p>
      {club.description && <p className="text-[9px] text-white/50 text-center leading-relaxed mt-1.5 line-clamp-2">{club.description}</p>}
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 w-full mt-3 pt-3 border-t border-white/[0.06]">
        {[
          { label: 'Matchs', val: club.achievements?.league ?? '—' },
          { label: 'Titres', val: (Number(club.achievements?.league || 0) + Number(club.achievements?.cup || 0)) || '—' },
          { label: 'Budget', val: club.budget ? `${(Number(club.budget)/1e6).toFixed(0)}M` : '—' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="font-display font-bold text-white text-sm">{s.val}</p>
            <p className="text-[8px] text-white/30 uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      {/* Social links */}
      <div className="flex flex-wrap gap-1.5 justify-center mt-3">
        <SocialBtn href={club.socialMedia?.instagram} icon={<IgIcon />} label="Instagram" color="bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-pink-400 border border-pink-500/20" />
        <SocialBtn href={club.socialMedia?.facebook} icon={<FbIcon />} label="Facebook" color="bg-blue-600/15 text-blue-400 border border-blue-500/20" />
        <SocialBtn href={club.socialMedia?.whatsapp} icon={<WaIcon />} label="WhatsApp" color="bg-green-600/15 text-green-400 border border-green-500/20" />
        <SocialBtn href={club.socialMedia?.twitter} icon={<TwIcon />} label="X" color="bg-white/5 text-white/60 border border-white/10" />
      </div>
      {/* Stade */}
      {club.stadium && (
        <div className="w-full mt-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-left">
          <p className="text-[8px] uppercase tracking-wider text-white/25 font-bold">Stade Domicile</p>
          <p className="text-xs text-white/75 font-semibold mt-0.5 truncate">{club.stadium}</p>
          {club.stadiumCapacity && <p className="text-[8px] text-white/35 mt-0.5">{Number(club.stadiumCapacity).toLocaleString()} places</p>}
        </div>
      )}
    </div>
  </div>
);

const PlayerCardPreview = ({ player, clubs }: { player: any; clubs: any[] }) => {
  const club = clubs.find(c => String(c.id) === String(player.clubId));
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/[0.07] bg-[#0e1520] sticky top-24">
      {/* Cover */}
      <div className="relative h-24 w-full overflow-hidden">
        {player.secondaryPhotoUrl
          ? <img src={player.secondaryPhotoUrl} alt="Cover" className="w-full h-full object-cover object-top" />
          : <div className="w-full h-full bg-gradient-to-br from-accent/30 via-[#1a2535] to-[#0e1520]" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1520]/80 to-transparent" />
        {/* Jersey number watermark */}
        {player.jerseyNumber && (
          <span className="absolute bottom-1 right-2 font-display font-black text-4xl text-white/10 leading-none select-none">#{player.jerseyNumber}</span>
        )}
        {/* Club logo */}
        {club?.logoUrl && (
          <img src={club.logoUrl} alt="Club" className="absolute top-2 right-2 h-7 w-7 object-contain bg-black/30 backdrop-blur-sm p-0.5 rounded-lg" />
        )}
      </div>
      {/* Avatar */}
      <div className="flex flex-col items-center -mt-9 px-4 pb-4">
        <div className="h-[72px] w-[72px] rounded-full border-4 border-[#0e1520] bg-[#1a2535] overflow-hidden shadow-xl">
          {player.photoUrl
            ? <img src={player.photoUrl} alt="Photo" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px] font-bold">Photo</div>
          }
        </div>
        {/* Position badge */}
        <span className="mt-2 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
          {player.position || 'FWD'}
        </span>
        <h4 className="font-display font-bold text-white text-sm mt-1.5 leading-tight text-center">
          {player.firstName || ''} {player.lastName || 'Nom du Joueur'}
        </h4>
        {player.nickname && <p className="text-[9px] text-accent/80 font-semibold mt-0.5">"{player.nickname}"</p>}
        <p className="text-[9px] text-white/40 mt-0.5">{player.nationality || 'Nationalité'}{club ? ` · ${club.name}` : ''}</p>
        {player.biography && <p className="text-[9px] text-white/45 text-center leading-relaxed mt-1.5 line-clamp-2">{player.biography}</p>}
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 w-full mt-3 pt-3 border-t border-white/[0.06]">
          {[
            { label: 'Matchs', val: player.appearances || 0 },
            { label: 'Buts', val: player.goals || 0 },
            { label: 'Passes', val: player.assists || 0 },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-display font-bold text-white text-sm">{s.val}</p>
              <p className="text-[8px] text-white/30 uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        {/* Social links */}
        <div className="flex flex-wrap gap-1.5 justify-center mt-3">
          <SocialBtn href={player.socialMedia?.instagram} icon={<IgIcon />} label="Instagram" color="bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-pink-400 border border-pink-500/20" />
          <SocialBtn href={player.socialMedia?.twitter} icon={<TwIcon />} label="X" color="bg-white/5 text-white/60 border border-white/10" />
          <SocialBtn href={player.socialMedia?.tiktok} icon={<TkIcon />} label="TikTok" color="bg-white/5 text-white/60 border border-white/10" />
        </div>
        {/* Physical */}
        {(player.height || player.weight || player.preferredFoot) && (
          <div className="flex gap-3 mt-3 w-full justify-center text-[8px] text-white/30 uppercase tracking-wider">
            {player.height && <span>{player.height} cm</span>}
            {player.weight && <span>{player.weight} kg</span>}
            {player.preferredFoot && <span>Pied {player.preferredFoot === 'RIGHT' ? 'droit' : player.preferredFoot === 'LEFT' ? 'gauche' : 'ambidextre'}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

const CoachCardPreview = ({ coach, clubs }: { coach: any; clubs: any[] }) => {
  const club = clubs.find(c => String(c.id) === String(coach.clubId));
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/[0.07] bg-[#0e1520] sticky top-24">
      {/* Cover */}
      <div className="relative h-24 w-full overflow-hidden">
        {coach.bannerUrl
          ? <img src={coach.bannerUrl} alt="Cover" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-purple-700/30 via-[#1a2535] to-[#0e1520]" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1520]/80 to-transparent" />
        {club?.logoUrl && (
          <img src={club.logoUrl} alt="Club" className="absolute top-2 right-2 h-7 w-7 object-contain bg-black/30 backdrop-blur-sm p-0.5 rounded-lg" />
        )}
      </div>
      {/* Avatar */}
      <div className="flex flex-col items-center -mt-9 px-4 pb-4">
        <div className="h-[72px] w-[72px] rounded-full border-4 border-[#0e1520] bg-[#1a2535] overflow-hidden shadow-xl">
          {coach.photoUrl
            ? <img src={coach.photoUrl} alt="Photo" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-white/30 text-[10px] font-bold">Photo</div>
          }
        </div>
        {coach.qualification && (
          <span className="mt-2 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/25">
            {coach.qualification}
          </span>
        )}
        <h4 className="font-display font-bold text-white text-sm mt-1.5 leading-tight text-center">
          {coach.firstName || ''} {coach.lastName || "Nom de l'Entraîneur"}
        </h4>
        <p className="text-[9px] text-white/40 mt-0.5">{coach.nationality || 'Nationalité'}{coach.specialization ? ` · ${coach.specialization}` : ''}</p>
        <p className="text-[9px] text-white/50 mt-0.5">{club ? club.name : 'Libre de tout contrat'}</p>
        {coach.biography && <p className="text-[9px] text-white/45 text-center leading-relaxed mt-1.5 line-clamp-2">{coach.biography}</p>}
        {/* Trophies count */}
        <div className="grid grid-cols-2 gap-3 w-full mt-3 pt-3 border-t border-white/[0.06]">
          {[
            { label: 'Trophées', val: coach.trophies?.length || '—' },
            { label: 'Clubs dirigés', val: coach.formerClubs?.length || '—' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-display font-bold text-white text-sm">{s.val}</p>
              <p className="text-[8px] text-white/30 uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        {/* Social links */}
        <div className="flex flex-wrap gap-1.5 justify-center mt-3">
          <SocialBtn href={coach.socialMedia?.instagram} icon={<IgIcon />} label="Instagram" color="bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-pink-400 border border-pink-500/20" />
          <SocialBtn href={coach.socialMedia?.twitter} icon={<TwIcon />} label="X" color="bg-white/5 text-white/60 border border-white/10" />
          <SocialBtn href={coach.socialMedia?.linkedin} icon={<FbIcon />} label="LinkedIn" color="bg-blue-600/15 text-blue-400 border border-blue-500/20" />
        </div>
      </div>
    </div>
  );
};

/* ─── Shared multi-tab form helper ───────────────────────────────────────── */
// NOTE: every button MUST be type="button" — inside a <form> a plain <button> defaults
// to type="submit" which was causing the tab-click to save & exit immediately.
function FormTabs({ tabs, active, onChange, isNew }: { tabs: string[]; active: string; onChange: (t: string) => void; isNew?: boolean }) {
  return (
    <div className="flex gap-1 border-b border-white/[0.06] mb-4 -mx-1 px-1 flex-wrap">
      {tabs.map((t, i) => (
        <button
          key={t}
          type="button"
          disabled={isNew && i > tabs.indexOf(active)}
          onClick={() => onChange(t)}
          className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-t-lg
            ${active === t ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-white/30 hover:text-white/60'}
            ${isNew && i > tabs.indexOf(active) ? 'opacity-30 cursor-not-allowed' : ''}`}>
          {isNew && <span className="mr-1 opacity-40">{i + 1}.</span>}{t}
        </button>
      ))}
    </div>
  );
}

/* ─── Wizard navigation (Next / Prev for create mode) ────────────────────── */
function WizardNav({ tabs, active, onChange, onCancel, loading, isNew }: {
  tabs: string[]; active: string; onChange: (t: string) => void;
  onCancel: () => void; loading?: boolean; isNew: boolean;
}) {
  const idx = tabs.indexOf(active);
  const isLast = idx === tabs.length - 1;
  return (
    <div className="flex justify-between items-center pt-4 border-t border-white/[0.05]">
      <div className="flex gap-2">
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-white/40 hover:text-white/70 transition-colors border border-white/[0.07] hover:border-white/20">
          Annuler
        </button>
        {idx > 0 && (
          <button type="button" onClick={() => onChange(tabs[idx - 1])}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-white/50 hover:text-white/80 transition-colors border border-white/[0.07] hover:border-white/20 flex items-center gap-1">
            ← Précédent
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {/* step dots */}
        <div className="flex gap-1">
          {tabs.map((_, i) => (
            <span key={i} className={`block h-1.5 rounded-full transition-all ${
              i < idx ? 'w-3 bg-accent/60' : i === idx ? 'w-4 bg-accent' : 'w-1.5 bg-white/15'
            }`} />
          ))}
        </div>
        {isLast || !isNew ? (
          <button type="submit" disabled={loading}
            className="px-4 py-1.5 rounded-xl text-[11px] font-bold bg-accent text-black hover:bg-accent/90 transition-all disabled:opacity-50 flex items-center gap-1.5">
            {loading ? '…' : '✓ Sauvegarder'}
          </button>
        ) : (
          <button type="button" onClick={() => onChange(tabs[idx + 1])}
            className="px-4 py-1.5 rounded-xl text-[11px] font-bold bg-accent/15 text-accent hover:bg-accent/25 transition-all border border-accent/30 flex items-center gap-1.5">
            Suivant →
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Tag input ──────────────────────────────────────────────────────────── */
function TagInput({ label, value, onChange, placeholder, hint }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; hint?: string }) {
  const [input, setInput] = useState('');
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInput('');
  };
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{label}</label>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder || 'Ajouter…'}
          className="flex-1 h-8 px-3 rounded-xl bg-white/[0.04] border border-white/8 text-xs text-white placeholder:text-white/20 outline-none focus:border-accent/40 transition-colors" />
        <button type="button" onClick={add} className="px-3 h-8 rounded-xl bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold hover:bg-accent/20 transition-all">+</button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {value.map((v, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-[10px] text-white/60">
              {v}
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-white/30 hover:text-red-400 transition-colors ml-0.5">×</button>
            </span>
          ))}
        </div>
      )}
      {hint && <span className="text-[9px] text-white/25">{hint}</span>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  SEASON WIZARD — multi-step season + all-entity configuration              */
/* ═══════════════════════════════════════════════════════════════════════════ */

const WIZARD_STEPS = [
  { id: 'saison',    label: 'Saison',     icon: '🏆', desc: 'Informations de base' },
  { id: 'clubs',     label: 'Clubs',      icon: '🛡️', desc: 'Équipes participantes' },
  { id: 'coaches',   label: 'Entraîneurs',icon: '🎯', desc: 'Staffs techniques' },
  { id: 'joueurs',   label: 'Joueurs',    icon: '👤', desc: 'Effectifs & transferts' },
  { id: 'stades',    label: 'Stades',     icon: '🏟️', desc: 'Infrastructures' },
  { id: 'matchs',    label: 'Matchs',     icon: '⚽', desc: 'Calendrier compétitif' },
  { id: 'sponsors',  label: 'Sponsors',   icon: '🤝', desc: 'Partenaires & financeurs' },
  { id: 'review',    label: 'Lancement',  icon: '🚀', desc: 'Validation finale' },
];

function SeasonWizardProgress({ currentStep, completedSteps }: { currentStep: string; completedSteps: Set<string> }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex items-start gap-0 min-w-max pb-2">
        {WIZARD_STEPS.map((step, idx) => {
          const isDone = completedSteps.has(step.id);
          const isCurrent = currentStep === step.id;
          const isAccessible = idx === 0 || completedSteps.has(WIZARD_STEPS[idx - 1].id) || isDone || isCurrent;
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex flex-col items-center gap-1 px-1 transition-all`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                  isCurrent ? 'bg-accent text-black shadow-[0_0_16px_rgba(252,209,22,0.4)]'
                  : isDone ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isAccessible ? 'bg-white/5 border border-white/10 text-white/40'
                  : 'bg-white/[0.02] border border-white/[0.05] text-white/15'
                }`}>
                  {isDone ? '✓' : step.icon}
                </div>
                <p className={`text-[9px] font-bold uppercase tracking-wider whitespace-nowrap ${
                  isCurrent ? 'text-accent' : isDone ? 'text-emerald-400' : 'text-white/25'
                }`}>{step.label}</p>
              </div>
              {idx < WIZARD_STEPS.length - 1 && (
                <div className={`w-8 h-[2px] mt-[-12px] mx-1 rounded-full transition-all ${
                  completedSteps.has(step.id) ? 'bg-emerald-500/40' : 'bg-white/[0.06]'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Season Wizard Body ────────────────────────────────────────────────── */
function SeasonWizard({ initialSeason, onClose, onSaved, showToast }: {
  initialSeason?: any; onClose: () => void;
  onSaved: (season: any) => void; showToast: ToastFn;
}) {
  const isEdit = !!initialSeason?.id;
  const [step, setStep] = useState('saison');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(
    isEdit ? new Set(['saison', 'clubs', 'coaches', 'joueurs', 'stades', 'matchs', 'sponsors']) : new Set()
  );
  const [loading, setLoading] = useState(false);
  const [createdSeasonId, setCreatedSeasonId] = useState<string>(initialSeason?.id || '');

  // Season info
  const [seasonData, setSeasonData] = useState<any>(initialSeason || {
    name: '', startDate: '', endDate: '', status: 'UPCOMING',
    description: '', totalRounds: 30, format: 'round-robin',
  });

  // Clubs
  const [allClubs, setAllClubs] = useState<any[]>([]);
  const [selectedClubIds, setSelectedClubIds] = useState<Set<string>>(new Set());

  // Coaches
  const [allCoaches, setAllCoaches] = useState<any[]>([]);
  const [newCoach, setNewCoach] = useState<any>({ firstName: '', lastName: '', nationality: '', clubId: '', qualification: '' });
  const [addingCoach, setAddingCoach] = useState(false);

  // Players
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [newPlayer, setNewPlayer] = useState<any>({ firstName: '', lastName: '', position: 'MID', nationality: '', clubId: '', jerseyNumber: '' });
  const [addingPlayer, setAddingPlayer] = useState(false);

  // Stadiums
  const [allStadiums, setAllStadiums] = useState<any[]>([]);
  const [newStadium, setNewStadium] = useState<any>({ name: '', city: '', capacity: '', country: 'Cameroun' });
  const [addingStadium, setAddingStadium] = useState(false);

  // Matches
  const [seasonMatches, setSeasonMatches] = useState<any[]>([]);
  const [newMatch, setNewMatch] = useState<any>({ homeClubId: '', awayClubId: '', scheduledAt: '', venue: '', round: 1 });
  const [addingMatch, setAddingMatch] = useState(false);

  // Sponsors
  const [allSponsors, setAllSponsors] = useState<any[]>([]);
  const [newSponsor, setNewSponsor] = useState<any>({ name: '', tier: 'SILVER', logoUrl: '', websiteUrl: '' });
  const [addingSponsors, setAddingSponsors] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); }
    catch (e: any) {
      const msg = e?.response?.data?.message;
      showToast(Array.isArray(msg) ? msg.join(', ') : (msg || (e as Error).message), 'error');
    }
    finally { setLoading(false); }
  };

  // Load reference data on mount
  useEffect(() => {
    Promise.all([
      layoutApi.getClubs({ limit: 100 }),
      layoutApi.getCoaches({ limit: 200 }),
      layoutApi.getPlayers({ limit: 500 }),
    ]).then(([clubs, coaches, players]) => {
      setAllClubs(clubs.data ?? clubs);
      setAllCoaches(coaches.data ?? coaches);
      setAllPlayers(players.data ?? players);
    }).catch(console.error);

    // Load stadiums from local storage (entity registry)
    const saved = JSON.parse(localStorage.getItem('mock_entity_stadiums') || '[]');
    setAllStadiums(saved);

    // Load sponsors from local storage
    const savedSponsors = JSON.parse(localStorage.getItem('mock_entity_sponsors') || '[]');
    setAllSponsors(savedSponsors);
  }, []);

  // Load season matches when on matches step and we have a created season
  useEffect(() => {
    if (step === 'matchs' && createdSeasonId) {
      layoutApi.getMatches({ seasonId: createdSeasonId, limit: 200 })
        .then(r => setSeasonMatches(r.data ?? r))
        .catch(console.error);
    }
  }, [step, createdSeasonId]);

  const markDone = (s: string) => setCompletedSteps(prev => new Set([...prev, s]));

  /* ── Step: Save season info ── */
  const handleSaveSeasonInfo = async () => {
    if (!seasonData.name || !seasonData.startDate || !seasonData.endDate) {
      showToast('Nom, date de début et fin sont obligatoires.', 'error'); return;
    }
    await run(async () => {
      const dto = {
        name: seasonData.name, startDate: seasonData.startDate, endDate: seasonData.endDate,
        status: seasonData.status || 'UPCOMING',
      };
      let saved: any;
      if (createdSeasonId) {
        saved = await layoutApi.updateSeason(createdSeasonId, dto);
      } else {
        saved = await layoutApi.createSeason(dto);
        setCreatedSeasonId(saved.id);
        onSaved(saved);
      }
      markDone('saison');
      setStep('clubs');
      showToast(createdSeasonId ? 'Saison mise à jour.' : 'Saison créée ! Configurez les clubs.', 'success');
    });
  };

  /* ── Step: Clubs toggle ── */
  const toggleClub = (id: string) => {
    setSelectedClubIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const handleClubsNext = () => { markDone('clubs'); setStep('coaches'); };

  /* ── Step: Add coach inline ── */
  const handleAddCoach = () => run(async () => {
    const r = await layoutApi.createCoach({ ...newCoach, jerseyNumber: undefined });
    setAllCoaches(prev => [...prev, r]);
    setNewCoach({ firstName: '', lastName: '', nationality: '', clubId: '', qualification: '' });
    setAddingCoach(false);
    showToast('Entraîneur ajouté.', 'success');
  });

  /* ── Step: Add player inline ── */
  const handleAddPlayer = () => run(async () => {
    const r = await layoutApi.createPlayer({ ...newPlayer, jerseyNumber: newPlayer.jerseyNumber ? Number(newPlayer.jerseyNumber) : undefined });
    setAllPlayers(prev => [...prev, r]);
    setNewPlayer({ firstName: '', lastName: '', position: 'MID', nationality: '', clubId: '', jerseyNumber: '' });
    setAddingPlayer(false);
    showToast('Joueur ajouté.', 'success');
  });

  /* ── Step: Add stadium inline ── */
  const handleAddStadium = () => {
    const list = [...allStadiums, { ...newStadium, id: Date.now().toString() }];
    localStorage.setItem('mock_entity_stadiums', JSON.stringify(list));
    setAllStadiums(list);
    setNewStadium({ name: '', city: '', capacity: '', country: 'Cameroun' });
    setAddingStadium(false);
    showToast('Stade enregistré.', 'success');
  };

  /* ── Step: Add match inline ── */
  const handleAddMatch = () => run(async () => {
    if (!createdSeasonId) { showToast("Créez d'abord la saison.", 'error'); return; }
    const r = await layoutApi.createMatch({
      homeClubId: Number(newMatch.homeClubId), awayClubId: Number(newMatch.awayClubId),
      status: 'SCHEDULED', round: Number(newMatch.round || 1),
      scheduledAt: new Date(newMatch.scheduledAt).toISOString(),
      venue: newMatch.venue, seasonId: Number(createdSeasonId),
    } as any);
    setSeasonMatches(prev => [...prev, r]);
    setNewMatch({ homeClubId: '', awayClubId: '', scheduledAt: '', venue: '', round: 1 });
    setAddingMatch(false);
    showToast('Match planifié.', 'success');
  });

  /* ── Step: Add sponsor inline ── */
  const handleAddSponsor = () => {
    const list = [...allSponsors, { ...newSponsor, id: Date.now().toString() }];
    localStorage.setItem('mock_entity_sponsors', JSON.stringify(list));
    setAllSponsors(list);
    setNewSponsor({ name: '', tier: 'SILVER', logoUrl: '', websiteUrl: '' });
    setAddingSponsors(false);
    showToast('Sponsor enregistré.', 'success');
  };

  /* ── Final: Activate season ── */
  const handleActivateSeason = () => run(async () => {
    if (!createdSeasonId) return;
    const r = await layoutApi.activateSeason(createdSeasonId);
    onSaved(r);
    showToast('🏆 Saison activée avec succès !', 'success');
    onClose();
  });


  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-[#0c1117] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-black text-white text-xl">
                {isEdit ? `Modifier — ${initialSeason?.name}` : '🏆 Nouvelle Saison'}
              </h2>
              <p className="text-[11px] text-white/35 mt-0.5">
                {isEdit ? 'Modifiez les configurations de cette saison' : 'Configurez chaque aspect de la saison en quelques étapes'}
              </p>
            </div>
            <button type="button" onClick={onClose}
              className="h-8 w-8 rounded-xl bg-white/5 border border-white/8 text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all text-sm">
              ✕
            </button>
          </div>
          <SeasonWizardProgress currentStep={step} completedSteps={completedSteps} />
        </div>

        {/* Step navigation tabs */}
        <div className="flex gap-0 border-b border-white/[0.05] overflow-x-auto">
          {WIZARD_STEPS.map((ws, idx) => {
            const accessible = idx === 0 || completedSteps.has(WIZARD_STEPS[idx - 1].id) || completedSteps.has(ws.id);
            return (
              <button key={ws.id} type="button"
                onClick={() => accessible && setStep(ws.id)}
                className={`flex-shrink-0 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                  step === ws.id ? 'text-accent border-accent bg-accent/5'
                  : completedSteps.has(ws.id) ? 'text-emerald-400/70 border-emerald-500/20 hover:text-emerald-400'
                  : accessible ? 'text-white/30 border-transparent hover:text-white/50'
                  : 'text-white/15 border-transparent cursor-not-allowed'
                }`}>
                {ws.icon} {ws.label}
              </button>
            );
          })}
        </div>

        {/* Step content */}
        <div className="p-6 space-y-6 min-h-[420px]">

          {/* ── STEP 1: Saison ── */}
          {step === 'saison' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/15 rounded-2xl">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="text-sm font-bold text-white">Informations de la saison</p>
                  <p className="text-[11px] text-white/40">Définissez le nom, les dates et le format du championnat</p>
                </div>
              </div>

              {/* ONGOING warning */}
              <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl flex items-center gap-3">
                <span className="text-amber-400 text-lg">⚠️</span>
                <p className="text-[11px] text-amber-200/70">Une seule saison peut être <strong className="text-amber-300">EN COURS</strong> à la fois. Activer cette saison clôturera automatiquement toute saison en cours.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField label="Nom officiel de la saison *" value={seasonData.name || ''} onChange={v => setSeasonData((p: any) => ({ ...p, name: v }))} required hint="Ex: MTN Elite One — Saison 2025/2026" />
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Date de début *" type="date" value={seasonData.startDate?.slice(0, 10) || ''} onChange={v => setSeasonData((p: any) => ({ ...p, startDate: v }))} required />
                  <FormField label="Date de fin *" type="date" value={seasonData.endDate?.slice(0, 10) || ''} onChange={v => setSeasonData((p: any) => ({ ...p, endDate: v }))} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Nombre de journées" type="number" value={seasonData.totalRounds || 30} onChange={v => setSeasonData((p: any) => ({ ...p, totalRounds: Number(v) }))} hint="Ex: 30 pour 16 équipes aller-retour" />
                  <FormField label="Format" type="select" value={seasonData.format || 'round-robin'} onChange={v => setSeasonData((p: any) => ({ ...p, format: v }))} options={[
                    { value: 'round-robin', label: 'Aller-Retour (championnat)' },
                    { value: 'single-round', label: 'Aller simple' },
                    { value: 'playoffs', label: 'Playoffs' },
                    { value: 'groups+knockout', label: 'Poules + Élimination' },
                  ]} />
                </div>
                {isEdit && (
                  <FormField label="Statut" type="select" value={seasonData.status || 'UPCOMING'} onChange={v => setSeasonData((p: any) => ({ ...p, status: v }))} options={[
                    { value: 'UPCOMING', label: '⏳ À venir' },
                    { value: 'ONGOING', label: '🟢 En cours' },
                    { value: 'COMPLETED', label: '✅ Terminée' },
                  ]} />
                )}
              </div>

              <div className="flex justify-end pt-2">
                <AdminButton onClick={handleSaveSeasonInfo} loading={loading}>
                  {createdSeasonId ? 'Mettre à jour et continuer' : 'Créer la saison →'} 
                </AdminButton>
              </div>
            </div>
          )}

          {/* ── STEP 2: Clubs ── */}
          {step === 'clubs' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-sky-500/8 border border-sky-500/15 rounded-2xl">
                <span className="text-2xl">🛡️</span>
                <div>
                  <p className="text-sm font-bold text-white">Clubs participants</p>
                  <p className="text-[11px] text-white/40">Sélectionnez les clubs qui disputeront cette saison ({selectedClubIds.size} sélectionnés)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {allClubs.map(club => {
                  const selected = selectedClubIds.has(String(club.id));
                  return (
                    <button key={club.id} type="button" onClick={() => toggleClub(String(club.id))}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                        selected
                          ? 'bg-accent/10 border-accent/40 shadow-[0_0_12px_rgba(252,209,22,0.1)]'
                          : 'bg-white/[0.02] border-white/[0.06] hover:border-white/12'
                      }`}>
                      {club.logoUrl
                        ? <img src={club.logoUrl} alt={club.name} className="h-8 w-8 rounded-xl object-contain bg-white/5 p-0.5 shrink-0" />
                        : <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] text-white/30 shrink-0">🛡️</div>
                      }
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-white truncate">{club.name}</p>
                        <p className="text-[9px] text-white/35">{club.city || '—'}</p>
                      </div>
                      {selected && <span className="ml-auto text-accent text-xs shrink-0">✓</span>}
                    </button>
                  );
                })}
                {allClubs.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-white/25 text-sm">
                    Aucun club trouvé — créez des clubs dans l'onglet Clubs d'abord.
                  </div>
                )}
              </div>

              {selectedClubIds.size > 0 && (
                <div className="p-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl">
                  <p className="text-[11px] text-emerald-300"><strong>{selectedClubIds.size} club(s)</strong> sélectionné(s) pour participer à cette saison.</p>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <AdminButton variant="secondary" onClick={() => setStep('saison')}>← Précédent</AdminButton>
                <AdminButton onClick={handleClubsNext}>Clubs confirmés — Configurer Entraîneurs →</AdminButton>
              </div>
            </div>
          )}

          {/* ── STEP 3: Coaches ── */}
          {step === 'coaches' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 p-4 bg-purple-500/8 border border-purple-500/15 rounded-2xl flex-1 mr-4">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="text-sm font-bold text-white">Staffs techniques</p>
                    <p className="text-[11px] text-white/40">{allCoaches.length} entraîneur(s) enregistré(s)</p>
                  </div>
                </div>
                <AdminButton onClick={() => setAddingCoach(v => !v)}>
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </AdminButton>
              </div>

              {addingCoach && (
                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Nouvel Entraîneur</p>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Prénom *" value={newCoach.firstName} onChange={v => setNewCoach((p: any) => ({ ...p, firstName: v }))} />
                    <FormField label="Nom *" value={newCoach.lastName} onChange={v => setNewCoach((p: any) => ({ ...p, lastName: v }))} />
                    <FormField label="Nationalité" value={newCoach.nationality} onChange={v => setNewCoach((p: any) => ({ ...p, nationality: v }))} />
                    <FormField label="Qualification" type="select" value={newCoach.qualification} onChange={v => setNewCoach((p: any) => ({ ...p, qualification: v }))} options={[
                      { value: '', label: 'Sélectionner...' },
                      { value: 'UEFA Pro', label: 'UEFA Pro' }, { value: 'CAF A', label: 'CAF A' },
                      { value: 'CAF B', label: 'CAF B' }, { value: 'FECAFOOT', label: 'FECAFOOT' },
                    ]} />
                    <FormField label="Club assigné" type="select" value={newCoach.clubId} onChange={v => setNewCoach((p: any) => ({ ...p, clubId: v }))} options={[
                      { value: '', label: 'Sélectionner...' }, ...allClubs.map(c => ({ value: c.id, label: c.name }))
                    ]} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <AdminButton variant="secondary" onClick={() => setAddingCoach(false)}>Annuler</AdminButton>
                    <AdminButton onClick={handleAddCoach} loading={loading}>Enregistrer</AdminButton>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {allCoaches.slice(0, 30).map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                    {c.photoUrl
                      ? <img src={c.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover bg-white/5 shrink-0" />
                      : <div className="h-8 w-8 rounded-full bg-purple-500/15 flex items-center justify-center text-xs shrink-0">🎯</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-white">{c.firstName} {c.lastName}</p>
                      <p className="text-[10px] text-white/35">{c.qualification || '—'} · {allClubs.find(cl => String(cl.id) === String(c.clubId))?.name || 'Non assigné'}</p>
                    </div>
                  </div>
                ))}
                {allCoaches.length === 0 && <p className="text-center text-white/25 text-sm py-8">Aucun entraîneur — ajoutez-en ci-dessus.</p>}
              </div>

              <div className="flex justify-between pt-2">
                <AdminButton variant="secondary" onClick={() => setStep('clubs')}>← Précédent</AdminButton>
                <AdminButton onClick={() => { markDone('coaches'); setStep('joueurs'); }}>Entraîneurs OK — Joueurs →</AdminButton>
              </div>
            </div>
          )}

          {/* ── STEP 4: Players ── */}
          {step === 'joueurs' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 p-4 bg-sky-500/8 border border-sky-500/15 rounded-2xl flex-1 mr-4">
                  <span className="text-2xl">👤</span>
                  <div>
                    <p className="text-sm font-bold text-white">Effectifs de la saison</p>
                    <p className="text-[11px] text-white/40">{allPlayers.length} joueur(s) enregistré(s)</p>
                  </div>
                </div>
                <AdminButton onClick={() => setAddingPlayer(v => !v)}>
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </AdminButton>
              </div>

              {addingPlayer && (
                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Nouveau Joueur</p>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Prénom *" value={newPlayer.firstName} onChange={v => setNewPlayer((p: any) => ({ ...p, firstName: v }))} />
                    <FormField label="Nom *" value={newPlayer.lastName} onChange={v => setNewPlayer((p: any) => ({ ...p, lastName: v }))} />
                    <FormField label="Position" type="select" value={newPlayer.position} onChange={v => setNewPlayer((p: any) => ({ ...p, position: v }))} options={[
                      { value: 'GK', label: 'Gardien (GK)' }, { value: 'DEF', label: 'Défenseur (DEF)' },
                      { value: 'MID', label: 'Milieu (MID)' }, { value: 'FWD', label: 'Attaquant (FWD)' },
                    ]} />
                    <FormField label="Nationalité" value={newPlayer.nationality} onChange={v => setNewPlayer((p: any) => ({ ...p, nationality: v }))} />
                    <FormField label="Club" type="select" value={newPlayer.clubId} onChange={v => setNewPlayer((p: any) => ({ ...p, clubId: v }))} options={[
                      { value: '', label: 'Sélectionner...' }, ...allClubs.map(c => ({ value: c.id, label: c.name }))
                    ]} />
                    <FormField label="Numéro de maillot" type="number" value={newPlayer.jerseyNumber} onChange={v => setNewPlayer((p: any) => ({ ...p, jerseyNumber: v }))} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <AdminButton variant="secondary" onClick={() => setAddingPlayer(false)}>Annuler</AdminButton>
                    <AdminButton onClick={handleAddPlayer} loading={loading}>Enregistrer</AdminButton>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                {allPlayers.slice(0, 40).map((p: any) => (
                  <div key={p.id} className="flex items-center gap-2.5 px-3 py-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                    {p.photoUrl
                      ? <img src={p.photoUrl} alt="" className="h-7 w-7 rounded-full object-cover shrink-0" />
                      : <div className="h-7 w-7 rounded-full bg-sky-500/15 flex items-center justify-center text-[8px] font-bold text-sky-400 shrink-0">{p.position}</div>
                    }
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-white truncate">{p.firstName} {p.lastName}</p>
                      <p className="text-[9px] text-white/35">{allClubs.find(c => String(c.id) === String(p.clubId))?.name || '—'}</p>
                    </div>
                    <span className="text-[9px] font-bold text-white/25 shrink-0">#{p.jerseyNumber || '—'}</span>
                  </div>
                ))}
                {allPlayers.length === 0 && <div className="col-span-2 text-center text-white/25 text-sm py-8">Aucun joueur enregistré.</div>}
              </div>

              <div className="flex justify-between pt-2">
                <AdminButton variant="secondary" onClick={() => setStep('coaches')}>← Précédent</AdminButton>
                <AdminButton onClick={() => { markDone('joueurs'); setStep('stades'); }}>Effectifs OK — Stades →</AdminButton>
              </div>
            </div>
          )}

          {/* ── STEP 5: Stadiums ── */}
          {step === 'stades' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 p-4 bg-orange-500/8 border border-orange-500/15 rounded-2xl flex-1 mr-4">
                  <span className="text-2xl">🏟️</span>
                  <div>
                    <p className="text-sm font-bold text-white">Stades & Infrastructures</p>
                    <p className="text-[11px] text-white/40">{allStadiums.length} stade(s) enregistré(s)</p>
                  </div>
                </div>
                <AdminButton onClick={() => setAddingStadium(v => !v)}>
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </AdminButton>
              </div>

              {addingStadium && (
                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Nouveau Stade</p>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Nom du stade *" value={newStadium.name} onChange={v => setNewStadium((p: any) => ({ ...p, name: v }))} />
                    <FormField label="Ville *" value={newStadium.city} onChange={v => setNewStadium((p: any) => ({ ...p, city: v }))} />
                    <FormField label="Capacité" type="number" value={newStadium.capacity} onChange={v => setNewStadium((p: any) => ({ ...p, capacity: v }))} />
                    <FormField label="Pays" value={newStadium.country} onChange={v => setNewStadium((p: any) => ({ ...p, country: v }))} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <AdminButton variant="secondary" onClick={() => setAddingStadium(false)}>Annuler</AdminButton>
                    <AdminButton onClick={handleAddStadium}>Enregistrer</AdminButton>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {allStadiums.map((st: any) => (
                  <div key={st.id || st.name} className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                    <span className="text-2xl mt-0.5">🏟️</span>
                    <div>
                      <p className="text-[12px] font-semibold text-white">{st.name}</p>
                      <p className="text-[10px] text-white/35">{st.city}{st.capacity ? ` · ${Number(st.capacity).toLocaleString()} places` : ''}</p>
                    </div>
                  </div>
                ))}
                {allStadiums.length === 0 && <div className="col-span-2 text-center text-white/25 text-sm py-8">Aucun stade enregistré. Ajoutez-en ci-dessus.</div>}
              </div>

              <div className="flex justify-between pt-2">
                <AdminButton variant="secondary" onClick={() => setStep('joueurs')}>← Précédent</AdminButton>
                <AdminButton onClick={() => { markDone('stades'); setStep('matchs'); }}>Stades OK — Planifier Matchs →</AdminButton>
              </div>
            </div>
          )}

          {/* ── STEP 6: Matches ── */}
          {step === 'matchs' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 p-4 bg-emerald-500/8 border border-emerald-500/15 rounded-2xl flex-1 mr-4">
                  <span className="text-2xl">⚽</span>
                  <div>
                    <p className="text-sm font-bold text-white">Calendrier compétitif</p>
                    <p className="text-[11px] text-white/40">{seasonMatches.length} match(s) planifié(s) pour cette saison</p>
                  </div>
                </div>
                <AdminButton onClick={() => setAddingMatch(v => !v)} disabled={!createdSeasonId}>
                  <Plus className="h-3.5 w-3.5" /> Planifier
                </AdminButton>
              </div>

              {!createdSeasonId && (
                <div className="p-3 bg-red-500/8 border border-red-500/20 rounded-xl text-[11px] text-red-300">
                  ⚠️ Vous devez d'abord créer la saison (Étape 1) avant de planifier des matchs.
                </div>
              )}

              {addingMatch && (
                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Nouveau Match</p>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Club Domicile *" type="select" value={newMatch.homeClubId} onChange={v => setNewMatch((p: any) => ({ ...p, homeClubId: v }))} options={[
                      { value: '', label: 'Sélectionner...' }, ...allClubs.map(c => ({ value: c.id, label: c.name }))
                    ]} />
                    <FormField label="Club Extérieur *" type="select" value={newMatch.awayClubId} onChange={v => setNewMatch((p: any) => ({ ...p, awayClubId: v }))} options={[
                      { value: '', label: 'Sélectionner...' }, ...allClubs.map(c => ({ value: c.id, label: c.name }))
                    ]} />
                    <FormField label="Date & Heure" type="datetime-local" value={newMatch.scheduledAt} onChange={v => setNewMatch((p: any) => ({ ...p, scheduledAt: v }))} />
                    <FormField label="Journée" type="number" value={newMatch.round} onChange={v => setNewMatch((p: any) => ({ ...p, round: v }))} />
                    <FormField label="Stade / Lieu" type="select" value={newMatch.venue} onChange={v => setNewMatch((p: any) => ({ ...p, venue: v }))} options={[
                      { value: '', label: 'Sélectionner...' }, ...allStadiums.map(s => ({ value: s.name, label: `${s.name} (${s.city})` }))
                    ]} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <AdminButton variant="secondary" onClick={() => setAddingMatch(false)}>Annuler</AdminButton>
                    <AdminButton onClick={handleAddMatch} loading={loading}>Planifier</AdminButton>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {seasonMatches.map((m: any, idx: number) => {
                  const home = allClubs.find(c => String(c.id) === String(m.homeClubId || m.homeClub?.id));
                  const away = allClubs.find(c => String(c.id) === String(m.awayClubId || m.awayClub?.id));
                  return (
                    <div key={m.id || idx} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                      <span className="text-[10px] font-bold text-white/25 w-6">J{m.round}</span>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {home?.logoUrl && <img src={home.logoUrl} alt="" className="h-5 w-5 object-contain shrink-0" />}
                        <span className="text-[11px] font-semibold text-white truncate">{home?.name || m.homeClub?.name || 'Domicile'}</span>
                        <span className="text-[10px] text-white/25 shrink-0">vs</span>
                        {away?.logoUrl && <img src={away.logoUrl} alt="" className="h-5 w-5 object-contain shrink-0" />}
                        <span className="text-[11px] font-semibold text-white truncate">{away?.name || m.awayClub?.name || 'Extérieur'}</span>
                      </div>
                      <span className="text-[9px] text-white/30 shrink-0">
                        {m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString('fr-FR') : '—'}
                      </span>
                    </div>
                  );
                })}
                {seasonMatches.length === 0 && <p className="text-center text-white/25 text-sm py-8">Aucun match planifié. Ajoutez des rencontres ci-dessus.</p>}
              </div>

              <div className="flex justify-between pt-2">
                <AdminButton variant="secondary" onClick={() => setStep('stades')}>← Précédent</AdminButton>
                <AdminButton onClick={() => { markDone('matchs'); setStep('sponsors'); }}>Matchs OK — Sponsors →</AdminButton>
              </div>
            </div>
          )}

          {/* ── STEP 7: Sponsors ── */}
          {step === 'sponsors' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 p-4 bg-pink-500/8 border border-pink-500/15 rounded-2xl flex-1 mr-4">
                  <span className="text-2xl">🤝</span>
                  <div>
                    <p className="text-sm font-bold text-white">Partenaires & Sponsors</p>
                    <p className="text-[11px] text-white/40">{allSponsors.length} sponsor(s) enregistré(s)</p>
                  </div>
                </div>
                <AdminButton onClick={() => setAddingSponsors(v => !v)}>
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </AdminButton>
              </div>

              {addingSponsors && (
                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Nouveau Sponsor</p>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Nom du sponsor *" value={newSponsor.name} onChange={v => setNewSponsor((p: any) => ({ ...p, name: v }))} />
                    <FormField label="Niveau" type="select" value={newSponsor.tier} onChange={v => setNewSponsor((p: any) => ({ ...p, tier: v }))} options={[
                      { value: 'TITLE', label: '🥇 Title Sponsor (Naming)' },
                      { value: 'GOLD', label: '🥇 Gold' },
                      { value: 'SILVER', label: '🥈 Silver' },
                      { value: 'BRONZE', label: '🥉 Bronze' },
                      { value: 'MEDIA', label: '📺 Partenaire Médias' },
                    ]} />
                    <FormField label="Logo URL" value={newSponsor.logoUrl} onChange={v => setNewSponsor((p: any) => ({ ...p, logoUrl: v }))} hint="URL publique du logo" />
                    <FormField label="Site web" value={newSponsor.websiteUrl} onChange={v => setNewSponsor((p: any) => ({ ...p, websiteUrl: v }))} hint="https://..." />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <AdminButton variant="secondary" onClick={() => setAddingSponsors(false)}>Annuler</AdminButton>
                    <AdminButton onClick={handleAddSponsor}>Enregistrer</AdminButton>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
                {allSponsors.map((sp: any) => {
                  const tierColors: Record<string, string> = { TITLE: 'text-amber-400 bg-amber-500/10 border-amber-500/20', GOLD: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', SILVER: 'text-slate-300 bg-slate-500/10 border-slate-500/20', BRONZE: 'text-orange-400 bg-orange-500/10 border-orange-500/20', MEDIA: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
                  return (
                    <div key={sp.id || sp.name} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                      {sp.logoUrl
                        ? <img src={sp.logoUrl} alt={sp.name} className="h-8 w-8 rounded-lg object-contain bg-white/5 shrink-0" />
                        : <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-lg shrink-0">🤝</div>
                      }
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-white truncate">{sp.name}</p>
                        <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full border mt-0.5 ${tierColors[sp.tier] || tierColors.SILVER}`}>{sp.tier}</span>
                      </div>
                    </div>
                  );
                })}
                {allSponsors.length === 0 && <div className="col-span-2 text-center text-white/25 text-sm py-8">Aucun sponsor enregistré.</div>}
              </div>

              <div className="flex justify-between pt-2">
                <AdminButton variant="secondary" onClick={() => setStep('matchs')}>← Précédent</AdminButton>
                <AdminButton onClick={() => { markDone('sponsors'); setStep('review'); }}>Sponsors OK — Révision finale →</AdminButton>
              </div>
            </div>
          )}

          {/* ── STEP 8: Review & Launch ── */}
          {step === 'review' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-accent/10 to-emerald-500/10 border border-accent/20 rounded-2xl">
                <span className="text-2xl">🚀</span>
                <div>
                  <p className="text-sm font-bold text-white">Révision finale & Lancement</p>
                  <p className="text-[11px] text-white/40">Vérifiez toutes les informations avant d'activer la saison</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🏆', label: 'Saison', value: seasonData.name || '—', sub: `${seasonData.startDate?.slice(0,10) || '?'} → ${seasonData.endDate?.slice(0,10) || '?'}`, done: completedSteps.has('saison') },
                  { icon: '🛡️', label: 'Clubs', value: `${selectedClubIds.size} club(s)`, sub: 'sélectionnés pour la saison', done: completedSteps.has('clubs') },
                  { icon: '🎯', label: 'Entraîneurs', value: `${allCoaches.length} entraîneur(s)`, sub: 'dans la base de données', done: completedSteps.has('coaches') },
                  { icon: '👤', label: 'Joueurs', value: `${allPlayers.length} joueur(s)`, sub: 'dans les effectifs', done: completedSteps.has('joueurs') },
                  { icon: '🏟️', label: 'Stades', value: `${allStadiums.length} stade(s)`, sub: 'disponibles', done: completedSteps.has('stades') },
                  { icon: '⚽', label: 'Matchs', value: `${seasonMatches.length} match(s)`, sub: 'planifiés', done: completedSteps.has('matchs') },
                  { icon: '🤝', label: 'Sponsors', value: `${allSponsors.length} sponsor(s)`, sub: 'partenaires', done: completedSteps.has('sponsors') },
                ].map(item => (
                  <div key={item.label} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    item.done ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-white/[0.02] border-white/[0.05]'
                  }`}>
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{item.label}</p>
                      <p className="text-[13px] font-bold text-white">{item.value}</p>
                      <p className="text-[9px] text-white/30">{item.sub}</p>
                    </div>
                    <span className={`text-sm shrink-0 ${item.done ? 'text-emerald-400' : 'text-white/15'}`}>{item.done ? '✓' : '○'}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-amber-500/8 border border-amber-500/20 rounded-2xl">
                <p className="text-[11px] text-amber-200/80 font-medium">
                  <strong className="text-amber-300">Rappel :</strong> En activant cette saison, toute saison actuellement EN COURS sera automatiquement clôturée. Cette action est irréversible.
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <AdminButton variant="secondary" onClick={() => setStep('sponsors')}>← Précédent</AdminButton>
                <div className="flex gap-3">
                  <AdminButton variant="secondary" onClick={onClose}>Sauvegarder & fermer</AdminButton>
                  {createdSeasonId && (
                    <AdminButton onClick={handleActivateSeason} loading={loading}>
                      🚀 Activer la Saison
                    </AdminButton>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  SEASONS TAB                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function SeasonsTab({ showToast }: { showToast: ToastFn }) {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try { const res = await layoutApi.getSeasons(); setSeasons(res); }
    catch { /* ignore */ }
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); }
    catch (e: any) {
      const msg = e?.response?.data?.message;
      showToast(Array.isArray(msg) ? msg.join(', ') : (msg || (e as Error).message), 'error');
    }
    finally { setLoading(false); }
  };

  const activate = (id: string) => run(async () => {
    const r = await layoutApi.activateSeason(id);
    setSeasons(p => p.map(s => s.id === id ? r : (s.status === 'ONGOING' ? { ...s, status: 'COMPLETED' } : s)));
    showToast('Saison activée.');
  });
  const close = (id: string) => run(async () => {
    const r = await layoutApi.closeSeason(id);
    setSeasons(p => p.map(s => s.id === id ? r : s));
    showToast('Saison clôturée.');
  });
  const initStandings = (id: string) => run(async () => {
    const r = await layoutApi.initStandings(id);
    showToast(r.message || 'Classements initialisés.', 'info');
  });
  const remove = (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    run(async () => {
      await layoutApi.deleteSeason(id);
      setSeasons(p => p.filter(s => s.id !== id));
      showToast('Saison supprimée.');
    });
  };

  const handleWizardSaved = (season: any) => {
    setSeasons(p => {
      const exists = p.find(s => s.id === season.id);
      return exists ? p.map(s => s.id === season.id ? season : s) : [...p, season];
    });
  };

  const STATUS_COLOR: Record<string, string> = {
    UPCOMING: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    ONGOING: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    COMPLETED: 'text-white/30 bg-white/5 border-white/[0.07]',
  };
  const STATUS_LABEL: Record<string, string> = { UPCOMING: 'À venir', ONGOING: 'En cours', COMPLETED: 'Terminée' };

  const ongoing = seasons.find(s => s.status === 'ONGOING');

  return (
    <>
      {/* Season Wizard Overlay */}
      {wizardOpen && (
        <SeasonWizard
          initialSeason={editingSeason}
          onClose={() => { setWizardOpen(false); setEditingSeason(null); }}
          onSaved={handleWizardSaved}
          showToast={showToast}
        />
      )}

      <div className="space-y-6">
        <SectionHeader
          title="Gestion des Saisons"
          subtitle="Créez et configurez chaque saison avec son écosystème complet"
          actions={
            <AdminButton onClick={() => { setEditingSeason(null); setWizardOpen(true); }}>
              <Plus className="h-3.5 w-3.5" /> Nouvelle Saison
            </AdminButton>
          }
        />

        {/* Ongoing season banner */}
        {ongoing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-500/10 to-sky-500/5 border border-emerald-500/20 rounded-2xl">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-emerald-300">Saison en cours : <span className="text-white">{ongoing.name}</span></p>
              <p className="text-[10px] text-white/35 mt-0.5">
                {new Date(ongoing.startDate).toLocaleDateString('fr-FR')} → {new Date(ongoing.endDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <AdminButton size="sm" variant="secondary" onClick={() => initStandings(ongoing.id)} loading={loading}>
                <RefreshCw className="h-3 w-3" /> Init Classements
              </AdminButton>
              <AdminButton size="sm" variant="danger" onClick={() => close(ongoing.id)} loading={loading}>
                <StopCircle className="h-3 w-3" /> Clôturer
              </AdminButton>
            </div>
          </motion.div>
        )}

        {/* Seasons list */}
        <div className="space-y-3">
          {seasons.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="group flex items-center gap-4 p-5 bg-[#111820] border border-white/[0.06] rounded-2xl hover:border-white/12 transition-all">

              <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                s.status === 'ONGOING' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse'
                : s.status === 'UPCOMING' ? 'bg-sky-500' : 'bg-white/15'
              }`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-display font-bold text-white/90 text-sm">{s.name}</p>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_COLOR[s.status]}`}>
                    {STATUS_LABEL[s.status]}
                  </span>
                </div>
                <p className="text-[10px] text-white/35 mt-0.5">
                  {s.startDate ? new Date(s.startDate).toLocaleDateString('fr-FR') : '—'} → {s.endDate ? new Date(s.endDate).toLocaleDateString('fr-FR') : '—'}
                </p>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap shrink-0">
                {s.status === 'UPCOMING' && (
                  <AdminButton size="sm" variant="success" onClick={() => activate(s.id)} loading={loading}>
                    <Play className="h-3 w-3" /> Activer
                  </AdminButton>
                )}
                {s.status === 'ONGOING' && (
                  <>
                    <AdminButton size="sm" variant="secondary" onClick={() => initStandings(s.id)} loading={loading}>
                      <RefreshCw className="h-3 w-3" /> Init Classements
                    </AdminButton>
                    <AdminButton size="sm" variant="danger" onClick={() => close(s.id)} loading={loading}>
                      <StopCircle className="h-3 w-3" /> Clôturer
                    </AdminButton>
                  </>
                )}
                <AdminButton size="sm" variant="ghost" onClick={() => { setEditingSeason(s); setWizardOpen(true); }}>
                  <Edit3 className="h-3 w-3" /> Configurer
                </AdminButton>
                {s.status !== 'ONGOING' && (
                  <AdminButton size="sm" variant="danger" onClick={() => remove(s.id, s.name)}>
                    <Trash2 className="h-3 w-3" />
                  </AdminButton>
                )}
              </div>
            </motion.div>
          ))}
          {!seasons.length && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center text-4xl">🏆</div>
              <p className="text-white/25 text-sm font-medium">Aucune saison créée</p>
              <AdminButton onClick={() => { setEditingSeason(null); setWizardOpen(true); }}>
                <Plus className="h-3.5 w-3.5" /> Créer la première saison
              </AdminButton>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  CLUBS TAB                                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function ClubsTab({ showToast }: { showToast: ToastFn }) {
  const [clubs, setClubs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState('Identité');
  const LIMIT = 16;

  const load = useCallback(async () => {
    const res = await layoutApi.getClubs({ page, limit: LIMIT });
    setClubs(res.data ?? res); setTotal(res.total ?? (res.data ?? res).length);
  }, [page]);
  useEffect(() => { load(); }, [load]);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); }
    catch (e: any) {
      const msg = e?.response?.data?.message;
      showToast(Array.isArray(msg) ? msg.join(', ') : (msg || e.message), 'error');
    }
    finally { setLoading(false); }
  };

  const emptyClub = () => ({
    name: '', nickname: '', city: '', region: '', foundedYear: new Date().getFullYear(), status: 'ACTIVE',
    websiteUrl: '', logoUrl: '', bannerUrl: '', videoUrl: '',
    primaryColor: '#fcd116', secondaryColor: '#007a5e',
    stadium: '', stadiumCapacity: '', stadiumPhotoUrl: '',
    description: '', history: '',
    palmares: [] as string[],
    presidentName: '', presidentPhotoUrl: '', budget: '',
    achievements: { league: 0, cup: 0, regional: 0, african: 0 },
    socialMedia: { twitter: '', instagram: '', facebook: '', youtube: '', tiktok: '' },
  });

  const save = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    // Strip server-computed fields — NestJS forbidNonWhitelisted will 400 if they are present.
    const {
      id: _id, createdAt: _ca, updatedAt: _ua, players: _pl, standings: _st,
      ...fields
    } = editing as any;
    const dto = {
      ...fields,
      foundedYear: Number(editing.foundedYear),
      stadiumCapacity: editing.stadiumCapacity ? Number(editing.stadiumCapacity) : undefined,
      budget: editing.budget ? Number(editing.budget) : undefined,
    };
    if (editing.id) {
      const r = await layoutApi.updateClub(editing.id, dto);
      setClubs(p => p.map(c => c.id === r.id ? r : c)); showToast('Club mis à jour.');
    } else {
      const r = await layoutApi.createClub(dto);
      setClubs(p => [...p, r]); setTotal(t => t + 1); showToast('Club créé !');
    }
    setEditing(null);
  }); };

  const remove = (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    run(async () => { await layoutApi.deleteClub(id); setClubs(p => p.filter(c => c.id !== id)); setTotal(t => t - 1); showToast('Club supprimé.'); });
  };

  const importClubs = async (rows: any[]) => {
    setImporting(true); let ok = 0;
    for (const row of rows) { try { await layoutApi.createClub({ ...row, foundedYear: Number(row.foundedYear) }); ok++; } catch { /* skip */ } }
    await load(); showToast(`${ok} club(s) importé(s).`); setImporting(false);
  };

  const TABS = ['Identité', 'Stade', 'Palmarès', 'Direction', 'Médias', 'Réseaux'];

  return (
    <div className="space-y-6">
      <SectionHeader title="Gestion des Clubs" subtitle="Profils complets — identité, stade, palmarès, direction, médias"
        actions={
          <div className="flex items-center gap-2">
            <BulkImportExport entityName="Clubs" data={clubs}
              templateFields={['name','nickname','city','region','foundedYear','stadium','logoUrl','primaryColor','secondaryColor','status']}
              onImport={importClubs} importLoading={importing} />
            <AdminButton onClick={() => { setEditing(emptyClub()); setActiveTab('Identité'); }}>
              <Plus className="h-3.5 w-3.5" /> Créer un Club
            </AdminButton>
          </div>
        }
      />

      {editing && (
        <AdminCard title={editing.id ? `Modifier — ${editing.name}` : 'Créer un Nouveau Club'} accent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={save} className="space-y-4 lg:col-span-2">
              <FormTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

              {/* ── Identité ── */}
              {activeTab === 'Identité' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Nom officiel du club *" value={editing.name || ''} onChange={v => setEditing((p: any) => ({ ...p, name: v }))} required />
                    <FormField label="Surnom / Alias" value={editing.nickname || ''} onChange={v => setEditing((p: any) => ({ ...p, nickname: v }))} hint="Ex: Les Diables Noirs" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Ville" value={editing.city || ''} onChange={v => setEditing((p: any) => ({ ...p, city: v }))} required />
                    <FormField label="Région" value={editing.region || ''} onChange={v => setEditing((p: any) => ({ ...p, region: v }))} hint="Ex: Centre, Littoral, Ouest" />
                    <FormField label="Année de fondation" type="number" value={editing.foundedYear || ''} onChange={v => setEditing((p: any) => ({ ...p, foundedYear: v }))} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Site officiel" value={editing.websiteUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, websiteUrl: v }))} hint="https://…" />
                    <FormField label="Statut" type="select" value={editing.status || 'ACTIVE'} onChange={v => setEditing((p: any) => ({ ...p, status: v }))} options={[{ value: 'ACTIVE', label: 'Actif' }, { value: 'INACTIVE', label: 'Inactif' }]} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Couleur principale</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={editing.primaryColor || '#fcd116'} onChange={e => setEditing((p: any) => ({ ...p, primaryColor: e.target.value }))} className="h-10 w-14 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                        <span className="text-xs text-white/40 font-mono">{editing.primaryColor || '#fcd116'}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Couleur secondaire</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={editing.secondaryColor || '#007a5e'} onChange={e => setEditing((p: any) => ({ ...p, secondaryColor: e.target.value }))} className="h-10 w-14 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                        <span className="text-xs text-white/40 font-mono">{editing.secondaryColor || '#007a5e'}</span>
                      </div>
                    </div>
                  </div>
                  <FormField label="Description courte" type="textarea" value={editing.description || ''} onChange={v => setEditing((p: any) => ({ ...p, description: v }))} hint="Résumé affiché sur les cartes club" />
                  <FormField label="Histoire complète du club" type="textarea" value={editing.history || ''} onChange={v => setEditing((p: any) => ({ ...p, history: v }))} hint="Historique détaillé — origines, moments clés, évolution" />
                </div>
              )}

              {/* ── Stade ── */}
              {activeTab === 'Stade' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Nom du stade *" type="select" value={editing.stadium || ''} 
                      onChange={v => {
                        const stList = JSON.parse(localStorage.getItem('mock_entity_stadiums') || '[]');
                        const selected = stList.find((s: any) => s.name === v);
                        setEditing((p: any) => ({
                          ...p,
                          stadium: v,
                          stadiumCapacity: selected ? Number(selected.capacity) : p.stadiumCapacity,
                          stadiumPhotoUrl: selected ? selected.photoUrl : p.stadiumPhotoUrl
                        }));
                      }}
                      options={[
                        { value: '', label: 'Sélectionner un stade...' },
                        ...JSON.parse(localStorage.getItem('mock_entity_stadiums') || '[]').map((s: any) => ({ value: s.name, label: `${s.name} (${s.city})` }))
                      ]}
                      required 
                      hint="Sélectionnez un stade enregistré" 
                    />
                    <FormField label="Capacité (spectateurs)" type="number" value={editing.stadiumCapacity || ''} onChange={v => setEditing((p: any) => ({ ...p, stadiumCapacity: v }))} />
                  </div>
                  <MediaUploader label="Photo du stade" value={editing.stadiumPhotoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, stadiumPhotoUrl: v }))} acceptType="image" hint="Vue aérienne ou panoramique du stade" />
                </div>
              )}

              {/* ── Palmarès ── */}
              {activeTab === 'Palmarès' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Titres Championnat" type="number" value={editing.achievements?.league ?? 0} onChange={v => setEditing((p: any) => ({ ...p, achievements: { ...p.achievements, league: Number(v) } }))} />
                    <FormField label="Coupes nationales" type="number" value={editing.achievements?.cup ?? 0} onChange={v => setEditing((p: any) => ({ ...p, achievements: { ...p.achievements, cup: Number(v) } }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Trophées régionaux" type="number" value={editing.achievements?.regional ?? 0} onChange={v => setEditing((p: any) => ({ ...p, achievements: { ...p.achievements, regional: Number(v) } }))} />
                    <FormField label="Trophées africains" type="number" value={editing.achievements?.african ?? 0} onChange={v => setEditing((p: any) => ({ ...p, achievements: { ...p.achievements, african: Number(v) } }))} />
                  </div>
                  <TagInput label="Liste des titres remportés" value={editing.palmares || []} onChange={v => setEditing((p: any) => ({ ...p, palmares: v }))}
                    placeholder="Ex: MTN Elite One 2010" hint="Appuyez Entrée ou + pour ajouter chaque titre" />
                </div>
              )}

              {/* ── Direction ── */}
              {activeTab === 'Direction' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <FormField label="Nom du président" type="select" value={editing.presidentName || ''} 
                      onChange={v => setEditing((p: any) => ({ ...p, presidentName: v }))} 
                      options={[
                        { value: '', label: 'Sélectionner un président...' },
                        { value: 'Fernand Tanin', label: 'Fernand Tanin' },
                        { value: 'Pascal Owona', label: 'Pascal Owona' },
                        { value: 'Njoya Seidou', label: 'Njoya Seidou' },
                        { value: 'Samuel Eto\'o', label: 'Samuel Eto\'o' },
                        ...JSON.parse(localStorage.getItem('mock_entity_sponsors') || '[]').map((s: any) => ({ value: s.name, label: s.name }))
                      ]}
                    />
                    <FormField label="Budget annuel (FCFA)" type="number" value={editing.budget || ''} onChange={v => setEditing((p: any) => ({ ...p, budget: v }))} hint="Ex: 150000000" />
                  </div>
                  <MediaUploader label="Photo du président" value={editing.presidentPhotoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, presidentPhotoUrl: v }))} acceptType="image" hint="Portrait officiel du président du club" />
                </div>
              )}

              {/* ── Médias ── */}
              {activeTab === 'Médias' && (
                <div className="space-y-4">
                  <MediaUploader label="Logo officiel" value={editing.logoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, logoUrl: v }))} acceptType="image" hint="Logo du club en PNG/WEBP avec transparence" />
                  <MediaUploader label="Image bannière (hero)" value={editing.bannerUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, bannerUrl: v }))} acceptType="image" hint="Image de couverture haute résolution pour la page club" />
                  <MediaUploader label="Vidéo de présentation" value={editing.videoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, videoUrl: v }))} acceptType="video" hint="Vidéo promo / intro du club (MP4, MOV)" />
                </div>
              )}

              {/* ── Réseaux sociaux ── */}
              {activeTab === 'Réseaux' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2"><Twitter className="h-4 w-4 text-sky-400 shrink-0" /><FormField label="Twitter / X" value={editing.socialMedia?.twitter || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, twitter: v } }))} hint="@handle ou URL complète" /></div>
                    <div className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-400 shrink-0" /><FormField label="Instagram" value={editing.socialMedia?.instagram || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, instagram: v } }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-blue-400 shrink-0" /><FormField label="Facebook" value={editing.socialMedia?.facebook || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, facebook: v } }))} /></div>
                    <div className="flex items-center gap-2"><Youtube className="h-4 w-4 text-red-400 shrink-0" /><FormField label="YouTube" value={editing.socialMedia?.youtube || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, youtube: v } }))} /></div>
                  </div>
                  <FormField label="TikTok" value={editing.socialMedia?.tiktok || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, tiktok: v } }))} />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.05] mt-4">
                <AdminButton variant="secondary" onClick={() => setEditing(null)}>Annuler</AdminButton>
                <AdminButton type="submit" loading={loading}>Sauvegarder</AdminButton>
              </div>
            </form>
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">Prévisualisation en direct</p>
              <ClubCardPreview club={editing} />
            </div>
          </div>
        </AdminCard>
      )}

      {/* Club Cards Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {clubs.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
            className="bg-[#111820] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/14 transition-all group">
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${c.primaryColor || '#fcd116'}, ${c.secondaryColor || '#007a5e'})` }} />
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {c.logoUrl ? (<img src={c.logoUrl} alt={c.name} className="h-10 w-10 object-contain rounded-lg bg-white/5 mb-2" />) : (<div className="h-10 w-10 rounded-lg bg-white/5 border border-white/8 grid place-items-center mb-2"><Shield className="h-5 w-5 text-white/20" /></div>)}
                  <p className="text-xs font-bold text-white/85 leading-tight">{c.name}</p>
                  {c.nickname && <p className="text-[9px] text-accent/70 font-medium">{c.nickname}</p>}
                  <p className="text-[10px] text-white/35 mt-0.5">{c.city}{c.region ? ` · ${c.region}` : ''}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              {c.stadium && <p className="text-[9px] text-white/25 font-medium truncate">{c.stadium}{c.stadiumCapacity ? ` · ${c.stadiumCapacity.toLocaleString()} places` : ''}</p>}
              <p className="text-[9px] text-white/25">Fondé en {c.foundedYear}</p>
              {(c.achievements?.league || c.achievements?.cup) ? (
                <div className="flex gap-2 text-[9px]">
                  {c.achievements.league > 0 && <span className="text-amber-400 font-bold">🏆 {c.achievements.league}</span>}
                  {c.achievements.cup > 0 && <span className="text-sky-400 font-bold">🥇 {c.achievements.cup}</span>}
                </div>
              ) : null}
              <div className="flex gap-1.5 pt-1 border-t border-white/[0.05]">
                <AdminButton size="sm" variant="secondary" onClick={() => { setEditing(c); setActiveTab('Identité'); }} className="flex-1"><Edit3 className="h-3 w-3" /> Modifier</AdminButton>
                <AdminButton size="sm" variant="danger" onClick={() => remove(c.id, c.name)}><Trash2 className="h-3 w-3" /></AdminButton>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <Paginator page={page} total={total} limit={LIMIT} onChange={setPage} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  PLAYERS TAB                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function PlayersTab({ clubs, showToast }: { clubs: any[]; showToast: ToastFn }) {
  const [players, setPlayers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterClub, setFilterClub] = useState('');
  const [filterPos, setFilterPos] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const [transferId, setTransferId] = useState<string | null>(null);
  const [transferClub, setTransferClub] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState('Identité');
  const LIMIT = 20;
  const TABS = ['Identité', 'Physique', 'Carrière', 'Stats', 'Contrat', 'Médias', 'Réseaux'];

  const load = useCallback(async () => {
    const params: any = { page, limit: LIMIT };
    if (filterClub) params.clubId = filterClub;
    if (filterPos) params.position = filterPos;
    const res = await layoutApi.getPlayers(params);
    setPlayers(res.data ?? res); setTotal(res.total ?? (res.data ?? res).length);
  }, [page, filterClub, filterPos]);
  useEffect(() => { load(); }, [load]);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); }
    catch (e: any) {
      const msg = e?.response?.data?.message;
      showToast(Array.isArray(msg) ? msg.join(', ') : (msg || e.message), 'error');
    }
    finally { setLoading(false); }
  };

  const emptyPlayer = () => ({
    firstName: '', lastName: '', nickname: '', position: 'FWD',
    nationality: '', secondNationality: '', birthDate: '', birthPlace: '',
    jerseyNumber: '', height: '', weight: '', preferredFoot: '',
    photoUrl: '', secondaryPhotoUrl: '', videoUrl: '',
    biography: '', formerClubs: [] as string[],
    marketValue: '', contractExpiry: '', agentName: '',
    appearances: 0, goals: 0, assists: 0, internationalCaps: 0, internationalGoals: 0,
    status: 'ACTIVE', isActive: true,
    socialMedia: { twitter: '', instagram: '', youtube: '', tiktok: '' },
    clubId: '',
  });

  const save = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    // Strip server-computed fields — NestJS forbidNonWhitelisted will 400 if they are present.
    // The player entity returns: id, createdAt, updatedAt, club (relation), matchEvents, stats
    const {
      id: _id, createdAt: _ca, updatedAt: _ua,
      club: _cl, matchEvents: _me, stats: _st,
      ...fields
    } = editing as any;
    const dto = {
      ...fields,
      jerseyNumber: editing.jerseyNumber ? Number(editing.jerseyNumber) : null,
      height: editing.height ? Number(editing.height) : undefined,
      weight: editing.weight ? Number(editing.weight) : undefined,
      marketValue: editing.marketValue ? Number(editing.marketValue) : null,
      appearances: Number(editing.appearances || 0),
      goals: Number(editing.goals || 0),
      assists: Number(editing.assists || 0),
      internationalCaps: Number(editing.internationalCaps || 0),
      internationalGoals: Number(editing.internationalGoals || 0),
      clubId: editing.clubId ? Number(editing.clubId) : null,
    };
    if (editing.id) {
      const r = await layoutApi.updatePlayer(editing.id, dto);
      setPlayers(p => p.map(pl => pl.id === r.id ? r : pl)); showToast('Joueur mis à jour.');
    } else {
      const r = await layoutApi.createPlayer(dto);
      setPlayers(p => [r, ...p]); setTotal(t => t + 1); showToast('Joueur enregistré !');
    }
    setEditing(null);
  }); };

  const doTransfer = () => run(async () => {
    if (!transferId || !transferClub) return;
    const r = await layoutApi.transferPlayer(transferId, transferClub);
    setPlayers(p => p.map(pl => pl.id === r.id ? r : pl));
    setTransferId(null); setTransferClub(''); showToast('Transfert effectué.');
  });

  const remove = (id: string, name: string) => { if (!confirm(`Supprimer ${name} ?`)) return; run(async () => { await layoutApi.deletePlayer(id); setPlayers(p => p.filter(pl => pl.id !== id)); setTotal(t => t - 1); showToast('Joueur supprimé.'); }); };
  const importPlayers = async (rows: any[]) => { setImporting(true); let ok = 0; for (const row of rows) { try { await layoutApi.createPlayer({ ...row, jerseyNumber: row.jerseyNumber ? Number(row.jerseyNumber) : null, isActive: row.isActive !== 'false' }); ok++; } catch { /* skip */ } } await load(); showToast(`${ok} joueur(s) importé(s).`); setImporting(false); };

  const STATUS_COLORS: Record<string, string> = { ACTIVE: 'text-emerald-400', INJURED: 'text-red-400', SUSPENDED: 'text-amber-400', LOANED: 'text-sky-400', RETIRED: 'text-white/30' };

  return (
    <div className="space-y-6">
      <SectionHeader title="Gestion des Joueurs" subtitle="Profils complets — identité, physique, carrière, statistiques, contrat"
        actions={
          <div className="flex items-center gap-2">
            <BulkImportExport entityName="Players" data={players}
              templateFields={['firstName','lastName','position','nationality','birthDate','jerseyNumber','clubId','marketValue','photoUrl','status']}
              onImport={importPlayers} importLoading={importing} />
            <AdminButton onClick={() => { setEditing(emptyPlayer()); setActiveTab('Identité'); }}>
              <Plus className="h-3.5 w-3.5" /> Nouveau Joueur
            </AdminButton>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={filterPos} onChange={e => { setFilterPos(e.target.value); setPage(1); }}
          className="h-8 px-3 rounded-xl bg-white/[0.04] border border-white/8 text-xs text-white/70 outline-none focus:border-accent/40">
          <option value="">Toutes positions</option>
          <option value="GK">Gardien (GK)</option>
          <option value="DEF">Défenseur (DEF)</option>
          <option value="MID">Milieu (MID)</option>
          <option value="FWD">Attaquant (FWD)</option>
        </select>
        <select value={filterClub} onChange={e => { setFilterClub(e.target.value); setPage(1); }}
          className="h-8 px-3 rounded-xl bg-white/[0.04] border border-white/8 text-xs text-white/70 outline-none focus:border-accent/40">
          <option value="">Tous les clubs</option>
          {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Transfer Modal */}
      {transferId && (
        <AdminCard title="Transfert de Joueur" accent>
          <div className="flex items-end gap-3">
            <div className="flex-1"><FormField label="Nouveau Club" type="select" value={transferClub} onChange={setTransferClub} options={[{ value: '', label: 'Choisir un club...' }, ...clubs.map(c => ({ value: c.id, label: c.name }))]} /></div>
            <AdminButton onClick={doTransfer} loading={loading} disabled={!transferClub}><Zap className="h-3.5 w-3.5" /> Transférer</AdminButton>
            <AdminButton variant="secondary" onClick={() => { setTransferId(null); setTransferClub(''); }}>Annuler</AdminButton>
          </div>
        </AdminCard>
      )}


      {editing && (
        <AdminCard title={editing.id ? `Modifier — ${editing.firstName} ${editing.lastName}` : 'Enregistrer un Joueur'} accent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={save} className="space-y-4 lg:col-span-2">
              <FormTabs tabs={TABS} active={activeTab} onChange={setActiveTab} isNew={!editing.id} />

              {/* ── Identité ── */}
              {activeTab === 'Identité' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Prénom *" value={editing.firstName || ''} onChange={v => setEditing((p: any) => ({ ...p, firstName: v }))} required />
                    <FormField label="Nom *" value={editing.lastName || ''} onChange={v => setEditing((p: any) => ({ ...p, lastName: v }))} required />
                    <FormField label="Surnom" value={editing.nickname || ''} onChange={v => setEditing((p: any) => ({ ...p, nickname: v }))} hint="Ex: Le Bison" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Poste *" type="select" value={editing.position || 'FWD'} onChange={v => setEditing((p: any) => ({ ...p, position: v }))}
                      options={[{ value: 'GK', label: 'Gardien' }, { value: 'DEF', label: 'Défenseur' }, { value: 'MID', label: 'Milieu' }, { value: 'FWD', label: 'Attaquant' }]} />
                    <FormField label="Nationalité *" value={editing.nationality || ''} onChange={v => setEditing((p: any) => ({ ...p, nationality: v }))} required />
                    <FormField label="2e nationalité" value={editing.secondNationality || ''} onChange={v => setEditing((p: any) => ({ ...p, secondNationality: v }))} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Date de naissance" type="date" value={editing.birthDate?.slice(0, 10) || ''} onChange={v => setEditing((p: any) => ({ ...p, birthDate: v }))} />
                    <FormField label="Lieu de naissance" value={editing.birthPlace || ''} onChange={v => setEditing((p: any) => ({ ...p, birthPlace: v }))} />
                    <FormField label="Numéro de maillot" type="number" value={editing.jerseyNumber || ''} onChange={v => setEditing((p: any) => ({ ...p, jerseyNumber: v }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Club actuel" type="select" value={editing.clubId || ''} onChange={v => setEditing((p: any) => ({ ...p, clubId: v || null }))}
                      options={[{ value: '', label: 'Sans club' }, ...clubs.map(c => ({ value: c.id, label: c.name }))]} />
                    <FormField label="Statut" type="select" value={editing.status || 'ACTIVE'} onChange={v => setEditing((p: any) => ({ ...p, status: v }))}
                      options={[{ value: 'ACTIVE', label: 'Actif' }, { value: 'INJURED', label: 'Blessé' }, { value: 'SUSPENDED', label: 'Suspendu' }, { value: 'LOANED', label: 'Prêté' }, { value: 'RETIRED', label: 'Retraité' }]} />
                  </div>
                  <FormField label="Biographie" type="textarea" value={editing.biography || ''} onChange={v => setEditing((p: any) => ({ ...p, biography: v }))} hint="Parcours, style de jeu, points forts" />
                  <TagInput label="Clubs précédents" value={editing.formerClubs || []} onChange={v => setEditing((p: any) => ({ ...p, formerClubs: v }))} placeholder="Ex: Real Madrid, Chelsea…" />
                  <SwitchToggle label="Joueur actif" checked={editing.isActive !== false} onChange={v => setEditing((p: any) => ({ ...p, isActive: v }))} />
                </div>
              )}

              {/* ── Physique ── */}
              {activeTab === 'Physique' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Taille (cm)" type="number" value={editing.height || ''} onChange={v => setEditing((p: any) => ({ ...p, height: v }))} hint="Ex: 182" />
                    <FormField label="Poids (kg)" type="number" value={editing.weight || ''} onChange={v => setEditing((p: any) => ({ ...p, weight: v }))} hint="Ex: 75" />
                    <FormField label="Pied préféré" type="select" value={editing.preferredFoot || ''} onChange={v => setEditing((p: any) => ({ ...p, preferredFoot: v }))}
                      options={[{ value: '', label: 'Non spécifié' }, { value: 'RIGHT', label: 'Droit' }, { value: 'LEFT', label: 'Gauche' }, { value: 'BOTH', label: 'Les deux' }]} />
                  </div>
                </div>
              )}

              {/* ── Carrière ── */}
              {activeTab === 'Carrière' && (
                <div className="space-y-4">
                  <TagInput label="Anciens clubs" value={editing.formerClubs || []} onChange={v => setEditing((p: any) => ({ ...p, formerClubs: v }))} placeholder="Nom du club précédent" hint="Appuyez Entrée pour ajouter chaque club" />
                </div>
              )}

              {/* ── Stats ── */}
              {activeTab === 'Stats' && (
                <div className="space-y-4">
                  <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Statistiques de carrière (cumulatives)</p>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Matchs joués" type="number" value={editing.appearances || 0} onChange={v => setEditing((p: any) => ({ ...p, appearances: Number(v) }))} />
                    <FormField label="Buts marqués" type="number" value={editing.goals || 0} onChange={v => setEditing((p: any) => ({ ...p, goals: Number(v) }))} />
                    <FormField label="Passes décisives" type="number" value={editing.assists || 0} onChange={v => setEditing((p: any) => ({ ...p, assists: Number(v) }))} />
                  </div>
                  <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider pt-2">Sélection nationale</p>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Sélections internationales" type="number" value={editing.internationalCaps || 0} onChange={v => setEditing((p: any) => ({ ...p, internationalCaps: Number(v) }))} />
                    <FormField label="Buts internationaux" type="number" value={editing.internationalGoals || 0} onChange={v => setEditing((p: any) => ({ ...p, internationalGoals: Number(v) }))} />
                  </div>
                </div>
              )}

              {/* ── Contrat ── */}
              {activeTab === 'Contrat' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Valeur marchande (FCFA)" type="number" value={editing.marketValue || ''} onChange={v => setEditing((p: any) => ({ ...p, marketValue: v }))} hint="En millions de FCFA" />
                    <FormField label="Expiration du contrat" type="date" value={editing.contractExpiry?.slice(0, 10) || ''} onChange={v => setEditing((p: any) => ({ ...p, contractExpiry: v }))} />
                  </div>
                  <FormField label="Nom de l'agent" value={editing.agentName || ''} onChange={v => setEditing((p: any) => ({ ...p, agentName: v }))} hint="Agent / représentant du joueur" />
                </div>
              )}

              {/* ── Médias ── */}
              {activeTab === 'Médias' && (
                <div className="space-y-4">
                  <MediaUploader label="Photo officielle (portrait)" value={editing.photoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, photoUrl: v }))} acceptType="image" hint="Photo portrait officielle du joueur" />
                  <MediaUploader label="Photo action" value={editing.secondaryPhotoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, secondaryPhotoUrl: v }))} acceptType="image" hint="Photo en action sur le terrain" />
                  <MediaUploader label="Vidéo highlights" value={editing.videoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, videoUrl: v }))} acceptType="video" hint="Compilation de highlights du joueur (MP4)" />
                </div>
              )}

              {/* ── Réseaux ── */}
              {activeTab === 'Réseaux' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2"><Twitter className="h-4 w-4 text-sky-400 shrink-0" /><FormField label="Twitter / X" value={editing.socialMedia?.twitter || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, twitter: v } }))} /></div>
                    <div className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-400 shrink-0" /><FormField label="Instagram" value={editing.socialMedia?.instagram || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, instagram: v } }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2"><Youtube className="h-4 w-4 text-red-400 shrink-0" /><FormField label="YouTube" value={editing.socialMedia?.youtube || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, youtube: v } }))} /></div>
                    <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-white/40 shrink-0" /><FormField label="TikTok" value={editing.socialMedia?.tiktok || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, tiktok: v } }))} /></div>
                  </div>
                </div>
              )}

              <WizardNav
                tabs={TABS} active={activeTab} onChange={setActiveTab}
                onCancel={() => setEditing(null)} loading={loading} isNew={!editing.id}
              />
            </form>
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">Prévisualisation en direct</p>
              <PlayerCardPreview player={editing} clubs={clubs} />
            </div>
          </div>
        </AdminCard>
      )}

      <AdminCard noPadding>
        <DataTable
          columns={[
            { key: 'photo', label: '', render: r => r.photoUrl ? <img src={r.photoUrl} className="h-8 w-8 rounded-full object-cover bg-white/5" alt={r.firstName} /> : <div className="h-8 w-8 rounded-full bg-white/5 border border-white/8 grid place-items-center"><Users className="h-4 w-4 text-white/20" /></div> },
            { key: 'name', label: 'Joueur', render: r => <div><p className="font-semibold text-white/85">{r.firstName} {r.lastName}</p>{r.nickname && <p className="text-[9px] text-accent/70">{r.nickname}</p>}</div> },
            { key: 'position', label: 'Poste', align: 'center', render: r => <span className={`text-[10px] font-bold uppercase tracking-wider ${r.position === 'GK' ? 'text-amber-400' : r.position === 'DEF' ? 'text-sky-400' : r.position === 'MID' ? 'text-emerald-400' : 'text-red-400'}`}>{r.position}</span> },
            { key: 'club', label: 'Club', render: r => <span className="text-white/50 text-[11px]">{r.club?.name || <span className="text-white/20">—</span>}</span> },
            { key: 'jersey', label: '#', align: 'center', render: r => <span className="font-display font-bold text-white/60">{r.jerseyNumber || '—'}</span> },
            { key: 'status', label: 'Statut', align: 'center', render: r => <span className={`text-[9px] font-bold uppercase ${STATUS_COLORS[r.status] || 'text-white/40'}`}>{r.status || 'ACTIVE'}</span> },
          ]}
          data={players} keyField="id"
          onEdit={r => { setEditing(r); setActiveTab('Identité'); }}
          onDelete={r => remove(r.id, `${r.firstName} ${r.lastName}`)}
        />
        <div className="px-4 pb-3 flex justify-end"><Paginator page={page} total={total} limit={LIMIT} onChange={setPage} /></div>
      </AdminCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  COACHES TAB                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function CoachesTab({ clubs, showToast }: { clubs: any[]; showToast: ToastFn }) {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Identité');
  const LIMIT = 20;
  const TABS = ['Identité', 'Qualifications', 'Staff', 'Carrière', 'Médias', 'Réseaux'];

  const load = useCallback(async () => {
    const res = await layoutApi.getCoaches({ page, limit: LIMIT });
    setCoaches(res.data ?? res); setTotal(res.total ?? (res.data ?? res).length);
  }, [page]);
  useEffect(() => { load(); }, [load]);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); }
    catch (e: any) {
      const msg = e?.response?.data?.message;
      showToast(Array.isArray(msg) ? msg.join(', ') : (msg || e.message), 'error');
    }
    finally { setLoading(false); }
  };

  const emptyCoach = () => ({
    firstName: '', lastName: '', nationality: 'Camerounais',
    birthDate: '', birthPlace: '', photoUrl: '', bannerUrl: '',
    qualification: '', specialization: '', contractExpiry: '',
    biography: '', formerClubs: [] as string[], trophies: [] as string[],
    assistantCoachName: '', fitnessCoachName: '', goalkeeperCoachName: '', analystName: '',
    socialMedia: { twitter: '', instagram: '', linkedin: '' },
    clubId: '', status: 'ACTIVE', notes: '',
  });

  const save = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    const { id: _id, createdAt: _ca, updatedAt: _ua, club: _cl, ...fields } = editing as any;
    const dto = { ...fields, clubId: editing.clubId ? Number(editing.clubId) : null };
    if (editing.id) {
      const r = await layoutApi.updateCoach(editing.id, dto);
      setCoaches(p => p.map(c => c.id === r.id ? r : c)); showToast('Entraîneur mis à jour.');
    } else {
      const r = await layoutApi.createCoach(dto);
      setCoaches(p => [r, ...p]); setTotal(t => t + 1); showToast('Entraîneur enregistré !');
    }
    setEditing(null);
  }); };

  const assignCoach = (coachId: string, clubId: string) => run(async () => { const r = await layoutApi.assignCoach(coachId, clubId); setCoaches(p => p.map(c => c.id === r.id ? r : c)); showToast('Entraîneur assigné au club.'); });
  const unassign = (coachId: string) => run(async () => { const r = await layoutApi.unassignCoach(coachId); setCoaches(p => p.map(c => c.id === r.id ? r : c)); showToast('Entraîneur libéré du club.'); });
  const remove = (id: string, name: string) => { if (!confirm(`Supprimer ${name} ?`)) return; run(async () => { await layoutApi.deleteCoach(id); setCoaches(p => p.filter(c => c.id !== id)); setTotal(t => t - 1); showToast('Entraîneur supprimé.'); }); };

  return (
    <div className="space-y-6">
      <SectionHeader title="Staff Technique & Entraîneurs" subtitle="Profils complets — qualifications, staff, carrière, palmarès"
        actions={<AdminButton onClick={() => { setEditing(emptyCoach()); setActiveTab('Identité'); }}><Plus className="h-3.5 w-3.5" /> Ajouter un Entraîneur</AdminButton>} />

      {editing && (
        <AdminCard title={editing.id ? 'Modifier Entraîneur' : 'Enregistrer un Entraîneur'} accent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={save} className="space-y-4 lg:col-span-2">
              <FormTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

              {activeTab === 'Identité' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Prénom *" value={editing.firstName || ''} onChange={v => setEditing((p: any) => ({ ...p, firstName: v }))} required />
                    <FormField label="Nom *" value={editing.lastName || ''} onChange={v => setEditing((p: any) => ({ ...p, lastName: v }))} required />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Nationalité *" value={editing.nationality || ''} onChange={v => setEditing((p: any) => ({ ...p, nationality: v }))} required />
                    <FormField label="Date de naissance" type="date" value={editing.birthDate?.slice(0, 10) || ''} onChange={v => setEditing((p: any) => ({ ...p, birthDate: v }))} />
                    <FormField label="Lieu de naissance" value={editing.birthPlace || ''} onChange={v => setEditing((p: any) => ({ ...p, birthPlace: v }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Club actuel" type="select" value={editing.clubId || ''} onChange={v => setEditing((p: any) => ({ ...p, clubId: v || null }))}
                      options={[{ value: '', label: 'Sans club' }, ...clubs.map(c => ({ value: c.id, label: c.name }))]} />
                    <FormField label="Statut" type="select" value={editing.status || 'ACTIVE'} onChange={v => setEditing((p: any) => ({ ...p, status: v }))}
                      options={[{ value: 'ACTIVE', label: 'Actif' }, { value: 'INACTIVE', label: 'Inactif' }]} />
                  </div>
                  <FormField label="Biographie" type="textarea" value={editing.biography || ''} onChange={v => setEditing((p: any) => ({ ...p, biography: v }))} hint="Parcours, philosophie de jeu, accomplissements" />
                  <FormField label="Notes internes" type="textarea" value={editing.notes || ''} onChange={v => setEditing((p: any) => ({ ...p, notes: v }))} hint="Notes confidentielles (non publiques)" />
                </div>
              )}

              {activeTab === 'Qualifications' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Licence / Qualification" value={editing.qualification || ''} onChange={v => setEditing((p: any) => ({ ...p, qualification: v }))} hint="Ex: UEFA Pro, CAF A, CAF B" />
                    <FormField label="Spécialisation" value={editing.specialization || ''} onChange={v => setEditing((p: any) => ({ ...p, specialization: v }))} hint="Ex: Offensif, Défensif, Gardiens" />
                  </div>
                  <FormField label="Expiration du contrat" type="date" value={editing.contractExpiry?.slice(0, 10) || ''} onChange={v => setEditing((p: any) => ({ ...p, contractExpiry: v }))} />
                  <TagInput label="Clubs entraînés précédemment" value={editing.formerClubs || []} onChange={v => setEditing((p: any) => ({ ...p, formerClubs: v }))} placeholder="Nom du club précédent" />
                  <TagInput label="Palmarès en tant qu'entraîneur" value={editing.trophies || []} onChange={v => setEditing((p: any) => ({ ...p, trophies: v }))} placeholder="Ex: MTN Elite One 2021" />
                </div>
              )}

              {activeTab === 'Staff' && (
                <div className="space-y-4">
                  <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Staff technique sous sa direction</p>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Entraîneur adjoint" value={editing.assistantCoachName || ''} onChange={v => setEditing((p: any) => ({ ...p, assistantCoachName: v }))} />
                    <FormField label="Préparateur physique" value={editing.fitnessCoachName || ''} onChange={v => setEditing((p: any) => ({ ...p, fitnessCoachName: v }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Entraîneur des gardiens" value={editing.goalkeeperCoachName || ''} onChange={v => setEditing((p: any) => ({ ...p, goalkeeperCoachName: v }))} />
                    <FormField label="Analyste vidéo" value={editing.analystName || ''} onChange={v => setEditing((p: any) => ({ ...p, analystName: v }))} />
                  </div>
                </div>
              )}

              {activeTab === 'Carrière' && (
                <div className="space-y-4">
                  <TagInput label="Clubs entraînés" value={editing.formerClubs || []} onChange={v => setEditing((p: any) => ({ ...p, formerClubs: v }))} placeholder="Nom du club" />
                  <TagInput label="Trophées remportés" value={editing.trophies || []} onChange={v => setEditing((p: any) => ({ ...p, trophies: v }))} placeholder="Ex: Coupe du Cameroun 2019" />
                </div>
              )}

              {activeTab === 'Médias' && (
                <div className="space-y-4">
                  <MediaUploader label="Photo officielle" value={editing.photoUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, photoUrl: v }))} acceptType="image" hint="Portrait officiel de l'entraîneur" />
                  <MediaUploader label="Image bannière" value={editing.bannerUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, bannerUrl: v }))} acceptType="image" hint="Image de couverture pour la page profil" />
                </div>
              )}

              {activeTab === 'Réseaux' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2"><Twitter className="h-4 w-4 text-sky-400 shrink-0" /><FormField label="Twitter / X" value={editing.socialMedia?.twitter || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, twitter: v } }))} /></div>
                  <div className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-400 shrink-0" /><FormField label="Instagram" value={editing.socialMedia?.instagram || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, instagram: v } }))} /></div>
                  <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-blue-400 shrink-0" /><FormField label="LinkedIn" value={editing.socialMedia?.linkedin || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, linkedin: v } }))} /></div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.05]">
                <AdminButton variant="secondary" onClick={() => setEditing(null)}>Annuler</AdminButton>
                <AdminButton type="submit" loading={loading}>Sauvegarder</AdminButton>
              </div>
            </form>
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">Prévisualisation en direct</p>
              <CoachCardPreview coach={editing} clubs={clubs} />
            </div>
          </div>
        </AdminCard>
      )}

      <AdminCard noPadding>
        <DataTable
          columns={[
            { key: 'photo', label: '', render: r => r.photoUrl ? <img src={r.photoUrl} className="h-8 w-8 rounded-full object-cover bg-white/5" alt={r.firstName} /> : <div className="h-8 w-8 rounded-full bg-white/5 border border-white/8 grid place-items-center"><Users className="h-4 w-4 text-white/20" /></div> },
            { key: 'name', label: 'Entraîneur', render: r => <div><p className="font-semibold text-white/85">{r.firstName} {r.lastName}</p>{r.specialization && <p className="text-[9px] text-white/35">{r.specialization}</p>}</div> },
            { key: 'qualification', label: 'Licence', render: r => <span className="text-accent text-[10px] font-bold">{r.qualification || '—'}</span> },
            { key: 'club', label: 'Club', render: r => <span className="text-white/50 text-[11px]">{r.club?.name || <span className="italic text-white/20">Sans club</span>}</span> },
            { key: 'nationality', label: 'Nat.', render: r => <span className="text-white/40 text-[10px]">{r.nationality}</span> },
            { key: 'status', label: 'Statut', render: r => <StatusBadge status={r.status} /> },
            { key: 'assign', label: 'Affecter', render: r => (
              <select value={r.clubId || ''} onChange={e => { if (e.target.value) assignCoach(r.id, e.target.value); else unassign(r.id); }}
                className="h-7 px-2 rounded-lg bg-white/[0.04] border border-white/8 text-[10px] text-white/60 outline-none max-w-[130px]">
                <option value="">Sans club</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )},
          ]}
          data={coaches} keyField="id"
          onEdit={r => { setEditing(r); setActiveTab('Identité'); }}
          onDelete={r => remove(r.id, `${r.firstName} ${r.lastName}`)}
        />
        <div className="px-4 pb-3 flex justify-end"><Paginator page={page} total={total} limit={LIMIT} onChange={setPage} /></div>
      </AdminCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  USERS TAB                                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function UsersTab({ showToast }: { showToast: ToastFn }) {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterRole, setFilterRole] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState<any>({ email: '', password: '', firstName: '', lastName: '', role: 'user', phone: '' });
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Profil');
  const LIMIT = 25;
  const TABS = ['Profil', 'Préférences', 'Réseaux', 'Sécurité'];

  const load = useCallback(async () => {
    const params: any = { page, limit: LIMIT };
    if (filterRole) params.role = filterRole;
    if (search) params.search = search;
    const res = await layoutApi.getUsers(params);
    setUsers(res.data ?? res); setTotal(res.total ?? (res.data ?? res).length);
  }, [page, filterRole, search]);
  useEffect(() => { load(); }, [load]);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); }
    catch (e: any) {
      const msg = e?.response?.data?.message;
      showToast(Array.isArray(msg) ? msg.join(', ') : (msg || e.message), 'error');
    }
    finally { setLoading(false); }
  };

  const createUser = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    const r = await layoutApi.createAdminUser(newUser);
    setUsers(p => [r, ...p]); setTotal(t => t + 1);
    setCreating(false); setNewUser({ email: '', password: '', firstName: '', lastName: '', role: 'user', phone: '' });
    showToast('Compte créé avec succès !');
  }); };

  const update = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    const r = await layoutApi.updateUser(editing.id, {
      firstName: editing.firstName, lastName: editing.lastName,
      phone: editing.phone, role: editing.role,
      avatarUrl: editing.avatarUrl, bio: editing.bio,
      city: editing.city, country: editing.country,
      occupation: editing.occupation, favoriteClubId: editing.favoriteClubId || null,
      language: editing.language, notificationsEnabled: editing.notificationsEnabled,
      socialMedia: editing.socialMedia,
    });
    setUsers(p => p.map(u => u.id === r.id ? r : u));
    setEditing(null); showToast('Profil mis à jour.');
  }); };

  const toggle = (id: string) => run(async () => { const r = await layoutApi.toggleUserActive(id); setUsers(p => p.map(u => u.id === r.id ? r : u)); showToast(r.isActive ? 'Compte réactivé.' : 'Compte désactivé.'); });
  const approve = (id: string) => run(async () => { const r = await layoutApi.approveEditor(id); setUsers(p => p.map(u => u.id === r.id ? r : u)); showToast('Éditeur approuvé !'); });
  const doReset = () => run(async () => { await layoutApi.resetUserPassword(resetId!, newPassword); setResetId(null); setNewPassword(''); showToast('Mot de passe réinitialisé.'); });
  const remove = (id: string, name: string) => { if (!confirm(`Supprimer le compte de ${name} ?`)) return; run(async () => { await layoutApi.deleteUser(id); setUsers(p => p.filter(u => u.id !== id)); setTotal(t => t - 1); showToast('Compte supprimé.'); }); };

  const ROLE_COLOR: Record<string, string> = { admin: 'text-accent font-bold', editor: 'text-purple-400', user: 'text-white/40' };

  return (
    <div className="space-y-6">
      <SectionHeader title="Gestion des Utilisateurs" subtitle="Administrez comptes, rôles, droits d'accès éditeur et profils complets"
        actions={<AdminButton onClick={() => setCreating(true)}><Plus className="h-3.5 w-3.5" /> Créer un Compte</AdminButton>} />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input type="text" placeholder="Rechercher par nom / email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="h-8 px-3 rounded-xl bg-white/[0.04] border border-white/8 text-xs text-white placeholder:text-white/20 outline-none focus:border-accent/40 w-56 transition-all" />
        {['', 'admin', 'editor', 'user'].map(r => (
          <button key={r} onClick={() => { setFilterRole(r); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filterRole === r ? 'bg-accent text-black' : 'bg-white/5 border border-white/8 text-white/40 hover:text-white'}`}>
            {r || 'Tous'}
          </button>
        ))}
      </div>

      {/* Create User */}
      {creating && (
        <AdminCard title="Créer un Nouveau Compte" accent>
          <form onSubmit={createUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Prénom" value={newUser.firstName} onChange={v => setNewUser((p: any) => ({ ...p, firstName: v }))} required />
              <FormField label="Nom" value={newUser.lastName} onChange={v => setNewUser((p: any) => ({ ...p, lastName: v }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Adresse email" type="email" value={newUser.email} onChange={v => setNewUser((p: any) => ({ ...p, email: v }))} required />
              <FormField label="Téléphone" value={newUser.phone || ''} onChange={v => setNewUser((p: any) => ({ ...p, phone: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Mot de passe temporaire" value={newUser.password} onChange={v => setNewUser((p: any) => ({ ...p, password: v }))} required hint="Min. 8 caractères, 1 majuscule, 1 chiffre" />
              <FormField label="Rôle" type="select" value={newUser.role} onChange={v => setNewUser((p: any) => ({ ...p, role: v }))}
                options={[{ value: 'user', label: 'Utilisateur' }, { value: 'editor', label: 'Éditeur' }, { value: 'admin', label: 'Administrateur' }]} />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.05]">
              <AdminButton variant="secondary" onClick={() => setCreating(false)}>Annuler</AdminButton>
              <AdminButton type="submit" loading={loading}>Créer le Compte</AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Edit User */}
      {editing && (
        <AdminCard title={`Modifier — ${editing.firstName} ${editing.lastName}`} accent>
          <form onSubmit={update} className="space-y-4">
            <FormTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

            {activeTab === 'Profil' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Prénom" value={editing.firstName} onChange={v => setEditing((p: any) => ({ ...p, firstName: v }))} required />
                  <FormField label="Nom" value={editing.lastName} onChange={v => setEditing((p: any) => ({ ...p, lastName: v }))} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Téléphone" value={editing.phone || ''} onChange={v => setEditing((p: any) => ({ ...p, phone: v }))} />
                  <FormField label="Rôle" type="select" value={editing.role} onChange={v => setEditing((p: any) => ({ ...p, role: v }))}
                    options={[{ value: 'user', label: 'Utilisateur' }, { value: 'editor', label: 'Éditeur' }, { value: 'admin', label: 'Administrateur' }]} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Ville" value={editing.city || ''} onChange={v => setEditing((p: any) => ({ ...p, city: v }))} />
                  <FormField label="Pays" value={editing.country || 'Cameroun'} onChange={v => setEditing((p: any) => ({ ...p, country: v }))} />
                </div>
                <FormField label="Profession / Occupation" value={editing.occupation || ''} onChange={v => setEditing((p: any) => ({ ...p, occupation: v }))} />
                <FormField label="Biographie / À propos" type="textarea" value={editing.bio || ''} onChange={v => setEditing((p: any) => ({ ...p, bio: v }))} hint="Bio publique de l'utilisateur" />
                <MediaUploader label="Photo de profil (avatar)" value={editing.avatarUrl || ''} onChange={v => setEditing((p: any) => ({ ...p, avatarUrl: v }))} acceptType="image" hint="Photo de profil — sera visible publiquement" />
              </div>
            )}

            {activeTab === 'Préférences' && (
              <div className="space-y-4">
                <FormField label="Langue préférée" type="select" value={editing.language || 'fr'} onChange={v => setEditing((p: any) => ({ ...p, language: v }))}
                  options={[{ value: 'fr', label: '🇫🇷 Français' }, { value: 'en', label: '🇬🇧 English' }]} />
                <FormField label="Club favori" value={editing.favoriteClubId || ''} onChange={v => setEditing((p: any) => ({ ...p, favoriteClubId: v }))} hint="ID UUID du club favori" />
                <SwitchToggle label="Recevoir les notifications" checked={editing.notificationsEnabled !== false} onChange={v => setEditing((p: any) => ({ ...p, notificationsEnabled: v }))} />
              </div>
            )}

            {activeTab === 'Réseaux' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2"><Twitter className="h-4 w-4 text-sky-400 shrink-0" /><FormField label="Twitter / X" value={editing.socialMedia?.twitter || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, twitter: v } }))} /></div>
                <div className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-400 shrink-0" /><FormField label="Instagram" value={editing.socialMedia?.instagram || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, instagram: v } }))} /></div>
                <div className="flex items-center gap-2"><Youtube className="h-4 w-4 text-red-400 shrink-0" /><FormField label="YouTube" value={editing.socialMedia?.youtube || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, youtube: v } }))} /></div>
                <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-white/40 shrink-0" /><FormField label="TikTok" value={editing.socialMedia?.tiktok || ''} onChange={v => setEditing((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, tiktok: v } }))} /></div>
              </div>
            )}

            {activeTab === 'Sécurité' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <p className="text-xs text-amber-400 font-semibold mb-1">⚠️ Zone sécurisée</p>
                  <p className="text-[10px] text-white/40">Pour réinitialiser le mot de passe, utilisez le bouton dédié dans le tableau ci-dessous.</p>
                </div>
                <div className="space-y-2 text-[10px] text-white/30">
                  <p><span className="text-white/50 font-medium">Email :</span> {editing.email}</p>
                  <p><span className="text-white/50 font-medium">Vérifié :</span> {editing.isVerified ? '✅ Oui' : '❌ Non'}</p>
                  <p><span className="text-white/50 font-medium">Compte créé :</span> {editing.createdAt ? new Date(editing.createdAt).toLocaleDateString('fr-FR') : '—'}</p>
                  <p><span className="text-white/50 font-medium">Dernière connexion :</span> {editing.lastLoginAt ? new Date(editing.lastLoginAt).toLocaleString('fr-FR') : '—'}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.05]">
              <AdminButton variant="secondary" onClick={() => setEditing(null)}>Annuler</AdminButton>
              <AdminButton type="submit" loading={loading}>Sauvegarder</AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      {/* Reset Password Modal */}
      {resetId && (
        <AdminCard title="Réinitialiser le Mot de Passe" accent>
          <div className="flex items-end gap-3">
            <div className="flex-1"><FormField label="Nouveau mot de passe" value={newPassword} onChange={setNewPassword} hint="Min. 8 caractères" /></div>
            <AdminButton onClick={doReset} loading={loading} disabled={newPassword.length < 8}><Shield className="h-3.5 w-3.5" /> Appliquer</AdminButton>
            <AdminButton variant="secondary" onClick={() => { setResetId(null); setNewPassword(''); }}>Annuler</AdminButton>
          </div>
        </AdminCard>
      )}

      <AdminCard noPadding>
        <DataTable
          columns={[
            { key: 'avatar', label: '', render: r => (
              r.avatarUrl
                ? <img src={r.avatarUrl} className="h-8 w-8 rounded-full object-cover" alt={r.firstName} />
                : <div className={`h-8 w-8 rounded-full border grid place-items-center text-[10px] font-bold shrink-0 ${r.role === 'admin' ? 'bg-accent/10 border-accent/30 text-accent' : r.role === 'editor' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-white/5 border-white/8 text-white/40'}`}>
                  {(r.firstName?.[0] || '?')}{(r.lastName?.[0] || '')}
                </div>
            )},
            { key: 'name', label: 'Utilisateur', render: r => (<div><p className="text-xs font-semibold text-white/85">{r.firstName} {r.lastName}</p><p className="text-[9px] text-white/30">{r.email}</p>{r.occupation && <p className="text-[9px] text-white/20">{r.occupation}</p>}</div>) },
            { key: 'role', label: 'Rôle', render: r => <span className={`text-[10px] uppercase tracking-widest ${ROLE_COLOR[r.role] || 'text-white/40'}`}>{r.role}</span> },
            { key: 'status', label: 'Statut', render: r => (<div className="flex items-center gap-1.5">{r.isActive ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> : <span className="h-1.5 w-1.5 rounded-full bg-white/15" />}<span className={`text-[10px] font-medium ${r.isActive ? 'text-emerald-400' : 'text-white/30'}`}>{r.isActive ? 'Actif' : 'Inactif'}</span></div>) },
            { key: 'editor', label: 'Éditeur', align: 'center', render: r => r.role === 'editor' ? (r.editorApproved ? <span className="text-[9px] text-emerald-400 font-bold">✓ Approuvé</span> : <button onClick={() => approve(r.id)} className="text-[9px] text-amber-400 font-bold hover:text-amber-300 transition-colors">Approuver →</button>) : <span className="text-white/15">—</span> },
            { key: 'actions', label: '', render: r => (<div className="flex gap-1"><button onClick={() => toggle(r.id)} title={r.isActive ? 'Désactiver' : 'Réactiver'} className={`h-6 w-6 rounded-lg grid place-items-center transition-all border ${r.isActive ? 'bg-red-500/5 border-red-500/10 text-red-400/50 hover:text-red-400' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/50 hover:text-emerald-400'}`}>{r.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}</button><button onClick={() => setResetId(r.id)} title="Réinitialiser le mot de passe" className="h-6 w-6 rounded-lg grid place-items-center bg-white/5 border border-white/8 text-white/30 hover:text-white transition-all"><Shield className="h-3 w-3" /></button></div>) },
          ]}
          data={users} keyField="id"
          onEdit={r => { setEditing(r); setActiveTab('Profil'); }}
          onDelete={r => remove(r.id, `${r.firstName} ${r.lastName}`)}
        />
        <div className="px-4 pb-3 flex justify-end"><Paginator page={page} total={total} limit={LIMIT} onChange={setPage} /></div>
      </AdminCard>
    </div>
  );
}
