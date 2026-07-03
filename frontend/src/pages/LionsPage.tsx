import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Trophy, Zap, Shield, ChevronRight, ChevronLeft, Calendar,
  Compass, BarChart3, Star, TrendingUp, Users, Activity
} from 'lucide-react';
import { clubs, Club } from '@/components/elite/data';
import yt1 from "@/assets/images/youngtalents/NathanDouala.png";
import yt2 from "@/assets/images/youngtalents/SergeDaura.png";
import p3 from "@/assets/images/players/EdouardSombang.png";
import p1 from "@/assets/images/youngtalents/SergeDaura.png";
import p2 from "@/assets/images/players/RichardNjoh.png";

const imgMap: Record<string, string> = { yt1, yt2, p3, p1, p2 };

// ─── Types ────────────────────────────────────────────────────────────────────
interface NationalPlayer {
  id: string;
  name: string;
  number: number;
  age: number;
  club: Club;
  position: string;
  posCode: string;
  caps: number;
  goals: number;
  assists: number;
  debutDate: string;
  status: 'CURRENT' | 'FUTURE';
  likelihood?: number;
  imgKey: string;
  story: string;
  milestones: { title: string; date: string; description: string }[];
  stats: { minutesPlayed: number; passAccuracy: number; tacklesWon: number; shotsOnTarget: number };
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const NATIONAL_PLAYERS: NationalPlayer[] = [
  {
    id: "np1", name: "Nathan Douala", number: 10, age: 17,
    club: clubs.vict, position: "Milieu Offensif", posCode: "MOC",
    caps: 3, goals: 0, assists: 1, debutDate: "Janvier 2024", status: 'CURRENT',
    imgKey: "yt1",
    story: "Convoqué à la surprise générale pour la CAN 2024, Nathan Douala incarne la renaissance du joueur local au plus haut niveau.",
    milestones: [
      { title: "Académie Victoria United", date: "2021", description: "Rejoint le centre de formation de Victoria United à Limbe à 14 ans." },
      { title: "Révélation Elite One", date: "Oct. 2023", description: "Premier match et passes décisives d'anthologie face aux Astres de Douala." },
      { title: "Appel chez les A", date: "Déc. 2023", description: "Sélectionné dans la liste officielle des Lions Indomptables pour la CAN 2024." },
      { title: "Première sélection A", date: "Jan. 2024", description: "Entre en jeu lors de la préparation des Lions. Le plus jeune Lion de l'ère moderne." },
    ],
    stats: { minutesPlayed: 180, passAccuracy: 88, tacklesWon: 6, shotsOnTarget: 2 }
  },
  {
    id: "np2", name: "Salomon Mbarga", number: 9, age: 22,
    club: clubs.cot, position: "Avant-centre", posCode: "ATT",
    caps: 5, goals: 2, assists: 0, debutDate: "Octobre 2025", status: 'CURRENT',
    imgKey: "p3",
    story: "Buteur prolifique de Coton Sport, il s'impose en sélection après une saison record de 14 buts en Elite One.",
    milestones: [
      { title: "Premier contrat pro", date: "2022", description: "Signe à Coton Sport de Garoua après avoir survolé les championnats régionaux du Nord." },
      { title: "Meilleur buteur Elite One", date: "Juin 2025", description: "Termine meilleur réalisateur avec 14 réalisations — record depuis 5 saisons." },
      { title: "Première titularisation", date: "Nov. 2025", description: "But face au Cap-Vert en éliminatoires Coupe du Monde. Titulaire indiscutable." },
    ],
    stats: { minutesPlayed: 320, passAccuracy: 75, tacklesWon: 3, shotsOnTarget: 9 }
  },
  {
    id: "np3", name: "Jean-Pierre Etame", number: 4, age: 21,
    club: clubs.uds, position: "Défenseur Central", posCode: "DC",
    caps: 2, goals: 0, assists: 0, debutDate: "Mars 2026", status: 'CURRENT',
    imgKey: "p2",
    story: "Capitaine de l'Union Douala, il a fêté sa première sélection A avec une performance défensive majuscule.",
    milestones: [
      { title: "Titulaire à 19 ans", date: "2023", description: "S'impose en défense centrale de l'Union Douala dès sa première saison complète." },
      { title: "Capitaine Lions U23", date: "Août 2024", description: "Prend le brassard avec les Lions Olympiques en route pour Paris 2024." },
      { title: "Première A", date: "Mars 2026", description: "90 minutes solides lors de la victoire 2-0 face au Rwanda en amical." },
    ],
    stats: { minutesPlayed: 120, passAccuracy: 84, tacklesWon: 14, shotsOnTarget: 0 }
  },
  {
    id: "np4", name: "Serge Daura", number: 11, age: 19,
    club: clubs.cot, position: "Ailier Droit", posCode: "ALG",
    caps: 0, goals: 0, assists: 0, debutDate: "En attente", status: 'FUTURE',
    likelihood: 90, imgKey: "yt2",
    story: "Meilleur espoir d'Elite One, Daura frappe avec insistance à la porte des Lions Indomptables après un tournoi UNIFFAC exceptionnel.",
    milestones: [
      { title: "Révélation U17", date: "2023", description: "Élu meilleur joueur du championnat national de jeunes par le jury de la FECAFOOT." },
      { title: "Intégration première", date: "2024", description: "Titulaire régulier à Coton Sport à 18 ans. 10 buts toutes compétitions." },
      { title: "UNIFFAC U20", date: "2025", description: "4 buts en 4 matchs, porte le Cameroun en finale du tournoi régional." },
    ],
    stats: { minutesPlayed: 0, passAccuracy: 0, tacklesWon: 0, shotsOnTarget: 0 }
  },
  {
    id: "np5", name: "Alain Nsangou", number: 1, age: 18,
    club: clubs.cnk, position: "Gardien de but", posCode: "GB",
    caps: 0, goals: 0, assists: 0, debutDate: "En attente", status: 'FUTURE',
    likelihood: 80, imgKey: "p1",
    story: "Prodige de Canon Yaoundé, ses réflexes supersoniques et sa maturité rappellent les plus grands remparts de l'histoire camerounaise.",
    milestones: [
      { title: "Académie Canon", date: "2022", description: "Rejoint le prestigieux centre de formation du Canon Yaoundé, club à 10 titres de champion." },
      { title: "Numéro 1 à 17 ans", date: "2025", description: "Prend la place de titulaire. Série de 6 clean-sheets consécutifs en Elite One." },
    ],
    stats: { minutesPlayed: 0, passAccuracy: 0, tacklesWon: 0, shotsOnTarget: 0 }
  },
];

const LEGENDS = [
  { name: 'Roger Milla', club: 'Tonnerre Yaoundé', years: '1977 — 1994', caps: 102, goals: 43, emoji: '🕺', color: '#FCD116' },
  { name: 'Rigobert Song', club: 'Tonnerre Yaoundé', years: '1993 — 2010', caps: 137, goals: 3, emoji: '🦁', color: '#CE1126' },
  { name: 'Joseph-Antoine Bell', club: 'Union Douala', years: '1976 — 1994', caps: 48, goals: 0, emoji: '🧤', color: '#1F8A4C' },
  { name: 'Emmanuel Maboang', club: 'Canon Yaoundé', years: '1984 — 2000', caps: 72, goals: 17, emoji: '⚡', color: '#FCD116' },
  { name: 'Thomas N\'Kono', club: 'Canon Yaoundé', years: '1976 — 1990', caps: 112, goals: 0, emoji: '🏆', color: '#CE1126' },
];

type ActiveTab = 'overview' | 'current' | 'future' | 'timeline' | 'stats';

// ─── Reusable Horizontal Carousel ─────────────────────────────────────────────
function HorizCarousel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  };

  return (
    <div className={`relative group/carousel ${className}`}>
      {/* Left arrow */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-black/80 border border-white/10 grid place-items-center text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black cursor-pointer -translate-x-3 shadow-xl"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Scroll track */}
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {children}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-black/80 border border-white/10 grid place-items-center text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black cursor-pointer translate-x-3 shadow-xl"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#05140B] to-transparent z-[5]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#05140B] to-transparent z-[5]" />
    </div>
  );
}

// ─── FIFA-style Lion Card ──────────────────────────────────────────────────────
function LionCard({ player, index }: { player: NationalPlayer; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const isActive = player.status === 'CURRENT';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{ scrollSnapAlign: 'start' }}
      className="group relative flex-shrink-0 w-52 sm:w-60 bg-gradient-to-b from-[#0c2215] via-[#061510] to-[#030d07] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-[#1F8A4C]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(31,138,76,0.2)] cursor-pointer"
    >
      {/* Status badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isActive ? 'bg-[#1F8A4C] text-white' : 'bg-[#FCD116]/20 text-[#FCD116] border border-[#FCD116]/30'}`}>
          {isActive ? '🦁 Actif' : '⚡ Prospect'}
        </span>
      </div>

      {/* Club color stripe */}
      <div className="absolute top-0 inset-x-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${player.club.color}, transparent)` }} />

      {/* Jersey number (background) */}
      <div className="absolute top-2 right-3 font-display text-[80px] font-black leading-none text-white/[0.04] select-none pointer-events-none">
        {player.number}
      </div>

      {/* Player photo */}
      <div className="relative h-44 overflow-hidden flex items-end justify-center bg-black/20">
        <img
          src={imgMap[player.imgKey] ?? imgMap.yt1}
          alt={player.name}
          className="h-48 w-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c2215] via-[#0c2215]/20 to-transparent" />
      </div>

      {/* Info */}
      <div className="px-4 pb-4 pt-2 space-y-2.5">
        <div>
          <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1">
            <span style={{ color: player.club.color }}>●</span> {player.club.short} · {player.posCode}
          </div>
          <h3 className="font-display text-base font-bold text-white leading-tight group-hover:text-[#FCD116] transition-colors">
            {player.name}
          </h3>
        </div>

        {/* Mini stats row */}
        <div className="grid grid-cols-3 gap-1 border-t border-white/5 pt-2.5">
          <div className="text-center">
            <div className="text-[9px] text-gray-500 uppercase">Sél.</div>
            <div className="text-sm font-bold text-[#FCD116]">{player.caps}</div>
          </div>
          <div className="text-center border-x border-white/5">
            <div className="text-[9px] text-gray-500 uppercase">Buts</div>
            <div className="text-sm font-bold text-white">{player.goals}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-gray-500 uppercase">Âge</div>
            <div className="text-sm font-bold text-white">{player.age}</div>
          </div>
        </div>

        {/* Likelihood bar for futures */}
        {player.status === 'FUTURE' && player.likelihood != null && (
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] uppercase font-bold tracking-wide">
              <span className="text-gray-500">Convocation</span>
              <span className="text-[#FCD116]">{player.likelihood}%</span>
            </div>
            <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1F8A4C] to-[#FCD116] rounded-full"
                style={{ width: `${player.likelihood}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Legend List Row ───────────────────────────────────────────────────────────
function LegendRow({ legend, index }: { legend: typeof LEGENDS[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="flex items-center gap-4 p-4 bg-black/25 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-black/40 transition-all group cursor-pointer"
    >
      <div className="text-2xl shrink-0">{legend.emoji}</div>

      <div className="flex-1 min-w-0">
        <div className="font-display text-base font-bold text-white truncate group-hover:text-[#FCD116] transition-colors">
          {legend.name}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
          <span style={{ color: legend.color }} className="font-bold">{legend.club}</span>
          <span>·</span>
          <span>{legend.years}</span>
        </div>
      </div>

      <div className="flex gap-4 shrink-0 text-right">
        <div>
          <div className="text-[9px] text-gray-500 uppercase">Caps</div>
          <div className="text-sm font-bold text-white">{legend.caps}</div>
        </div>
        <div>
          <div className="text-[9px] text-gray-500 uppercase">Buts</div>
          <div className="text-sm font-bold text-[#FCD116]">{legend.goals}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────
export default function LionsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedTimelinePlayer, setSelectedTimelinePlayer] = useState<string>('np1');

  const timelinePlayer = useMemo(
    () => NATIONAL_PLAYERS.find(p => p.id === selectedTimelinePlayer) || NATIONAL_PLAYERS[0],
    [selectedTimelinePlayer]
  );

  const currentLions = useMemo(() => NATIONAL_PLAYERS.filter(p => p.status === 'CURRENT'), []);
  const futureLions = useMemo(() => NATIONAL_PLAYERS.filter(p => p.status === 'FUTURE'), []);

  const TABS = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Compass },
    { id: 'current',  label: 'Lions Actuels',   icon: Shield  },
    { id: 'future',   label: 'Futurs Lions',     icon: Zap     },
    { id: 'timeline', label: 'Chronologie',      icon: Calendar },
    { id: 'stats',    label: 'Stats Intl.',      icon: BarChart3 },
  ];

  return (
    <div className="bg-[#05140B] text-[#F3F4F6] min-h-screen pb-24 font-sans selection:bg-[#FCD116] selection:text-[#05140B]">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#020a06] via-[#05140B] to-[#05140B] py-16 md:py-24">
        <div className="absolute inset-0 field-pattern opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(31,138,76,0.15),transparent_70%)]" />
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#1F8A4C] via-[#CE1126] to-[#FCD116]" />

        <div className="container relative z-10 px-4 mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CE1126]/10 text-[#CE1126] border border-[#CE1126]/20 text-[11px] font-black uppercase tracking-widest">
            🇨🇲 Centre National de Sélection
          </div>

          <h1 className="font-display text-5xl sm:text-7xl font-black uppercase tracking-tight text-white leading-none">
            Road to the <span className="text-[#FCD116]">Lions</span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
            De la poussière des terrains locaux jusqu'au mythique maillot vert, rouge et jaune. Le parcours des talents de la MTN Elite One vers les Lions Indomptables.
          </p>

          {/* Quick Metrics — horizontal scroll on mobile */}
          <div className="flex gap-4 justify-center overflow-x-auto scrollbar-hide pt-2 pb-1">
            {[
              { label: 'Actifs en A', value: '3', unit: 'joueurs', color: '#1F8A4C', icon: Shield },
              { label: 'Prospects suivis', value: '12', unit: 'profils', color: '#FCD116', icon: TrendingUp },
              { label: 'Caps Elite One 25/26', value: '10', unit: 'sélections', color: '#CE1126', icon: Star },
              { label: 'Buts intl.', value: '2', unit: 'cette saison', color: '#10B981', icon: Trophy },
            ].map(({ label, value, unit, color, icon: Icon }) => (
              <div key={label} className="shrink-0 bg-black/50 border border-white/5 rounded-2xl p-4 min-w-[130px] text-center">
                <Icon className="h-4 w-4 mx-auto mb-1.5" style={{ color }} />
                <div className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">{label}</div>
                <div className="font-display text-2xl font-extrabold text-white mt-0.5">{value}</div>
                <div className="text-[9px] text-gray-500">{unit}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TABS NAV ── */}
      <div className="sticky top-0 z-40 bg-[#05140B]/95 backdrop-blur-md border-b border-white/5">
        <div className="container px-4 mx-auto">
          <div className="flex overflow-x-auto gap-1.5 py-3 scrollbar-hide">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as ActiveTab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#1F8A4C] text-white border-[#1F8A4C] shadow-[0_0_14px_rgba(31,138,76,0.4)]'
                      : 'bg-white/[0.02] text-gray-400 border-white/5 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mt-10 px-4 mx-auto pb-10">
        <AnimatePresence mode="wait">

          {/* ───────── OVERVIEW ───────── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-14">

              {/* Editorial intro */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center gap-2 text-[#FCD116]">
                    <Trophy className="h-4 w-4" />
                    <span className="text-[11px] uppercase font-black tracking-widest">L'ADN des Lions</span>
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight leading-none">
                    La Ligue Locale :<br />Berceau des Indomptables
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed font-light">
                    Historiquement, les plus belles pages des Lions Indomptables ont été écrites par des enfants nourris au football camerounais. Des légendes comme Roger Milla, Rigobert Song, et Thomas N'Kono ont tous fait leurs premières armes sur les pelouses qui accueillent aujourd'hui la MTN Elite One.
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed font-light">
                    Ce Centre National de Sélection crée un pont visible entre la ligue professionnelle et la sélection nationale. Chaque performance locale peut mener au maillot le plus précieux du football camerounais.
                  </p>
                </div>

                {/* Quote card */}
                <div className="lg:col-span-5 relative bg-gradient-to-br from-[#0c2215] to-[#041009] p-6 rounded-3xl border border-white/5 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCD116]/5 rounded-full blur-3xl" />
                  <div className="absolute top-3 right-3 text-[10px] text-gray-500">Sélectionné en 1984</div>
                  <div className="font-display text-5xl text-[#FCD116]/15 select-none mb-2">&ldquo;</div>
                  <blockquote className="text-sm text-white font-medium italic leading-relaxed">
                    C'est dans la sueur et la passion des stades du pays que j'ai appris le vrai combat des Lions Indomptables.
                  </blockquote>
                  <div className="flex items-center gap-3 mt-5 border-t border-white/5 pt-4">
                    <div className="h-10 w-10 rounded-full bg-black/50 border border-[#FCD116]/20 grid place-items-center font-display font-black text-[#FCD116] text-sm">
                      RM
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Roger Milla</div>
                      <div className="text-[10px] text-gray-400">Tonnerre Yaoundé · 102 sélections · 43 buts</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Legends List ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase text-white tracking-wide">
                      La Lignée Locale des Mythiques
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">Joueurs issus des clubs locaux qui ont marqué l'histoire nationale.</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>{LEGENDS.length} légendes</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {LEGENDS.map((leg, i) => (
                    <LegendRow key={leg.name} legend={leg} index={i} />
                  ))}
                </div>
              </div>

              {/* ── Full squad carousel preview ── */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold uppercase text-white tracking-wide">
                  Aperçu du Groupe Actuel
                </h3>
                <HorizCarousel>
                  {NATIONAL_PLAYERS.map((p, i) => (
                    <LionCard key={p.id} player={p} index={i} />
                  ))}
                </HorizCarousel>
              </div>
            </motion.div>
          )}

          {/* ───────── CURRENT LIONS ───────── */}
          {activeTab === 'current' && (
            <motion.div key="current" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold uppercase text-white tracking-tight">Lions Actuels</h2>
                <p className="text-xs text-gray-400 mt-1">Joueurs de la MTN Elite One actuellement convoqués en équipe nationale A.</p>
              </div>

              {/* Carousel */}
              <HorizCarousel>
                {currentLions.map((p, i) => (
                  <LionCard key={p.id} player={p} index={i} />
                ))}
              </HorizCarousel>

              {/* Detailed list below carousel */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h3 className="text-[11px] uppercase font-black tracking-widest text-gray-400">Profils Détaillés</h3>
                {currentLions.map((player, i) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex flex-col sm:flex-row gap-4 p-5 bg-black/25 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-black/40 transition-all group"
                  >
                    {/* Avatar + name */}
                    <div className="flex items-center gap-4 sm:w-56 shrink-0">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                        <img src={imgMap[player.imgKey] ?? imgMap.yt1} alt={player.name} className="w-full h-full object-cover object-top" />
                        <div className="absolute bottom-0 inset-x-0 h-0.5" style={{ background: player.club.color }} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-display text-base font-bold text-white group-hover:text-[#FCD116] transition-colors truncate">{player.name}</div>
                        <div className="text-[10px] text-gray-400">{player.position}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: player.club.color }} />
                          <span className="text-[10px] text-gray-500">{player.club.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Story */}
                    <p className="text-xs text-gray-400 leading-relaxed font-light flex-1 self-center">
                      {player.story}
                    </p>

                    {/* Stats badges */}
                    <div className="flex sm:flex-col gap-3 sm:items-end justify-between sm:justify-start shrink-0">
                      <div className="text-center">
                        <div className="text-[9px] text-gray-500 uppercase">Sélections</div>
                        <div className="text-xl font-display font-bold text-[#FCD116]">{player.caps}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] text-gray-500 uppercase">Buts</div>
                        <div className="text-xl font-display font-bold text-white">{player.goals}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] text-gray-500 uppercase">1ère sél.</div>
                        <div className="text-[10px] font-semibold text-gray-300">{player.debutDate}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ───────── FUTURE LIONS ───────── */}
          {activeTab === 'future' && (
            <motion.div key="future" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold uppercase text-white tracking-tight">Futurs Lions</h2>
                <p className="text-xs text-gray-400 mt-1">Les prospects de l'Elite One les plus susceptibles de rejoindre la sélection nationale.</p>
              </div>

              {/* Carousel */}
              <HorizCarousel>
                {futureLions.map((p, i) => (
                  <LionCard key={p.id} player={p} index={i} />
                ))}
              </HorizCarousel>

              {/* List view with call-up indicators */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h3 className="text-[11px] uppercase font-black tracking-widest text-gray-400">Suivi des Prospects</h3>
                {futureLions.map((player, i) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="p-5 bg-black/25 rounded-2xl border border-white/5 hover:border-[#FCD116]/20 transition-all group space-y-4"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                        <img src={imgMap[player.imgKey] ?? imgMap.yt1} alt={player.name} className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-display text-base font-bold text-white group-hover:text-[#FCD116] transition-colors truncate">{player.name}</div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FCD116]/10 text-[#FCD116] border border-[#FCD116]/20 font-bold uppercase shrink-0">{player.posCode}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: player.club.color }} />
                          <span className="text-[10px] text-gray-400">{player.club.name}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed font-light">{player.story}</p>

                    {player.likelihood != null && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span className="text-gray-400">Probabilité de convocation</span>
                          <span className="text-[#FCD116]">{player.likelihood}%</span>
                        </div>
                        <div className="h-2.5 bg-black/40 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#1F8A4C] to-[#FCD116] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${player.likelihood}%` }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ───────── TIMELINE ───────── */}
          {activeTab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold uppercase text-white">Parcours & Chronologie</h2>
                <p className="text-xs text-gray-400 mt-1">Le chemin parcouru de l'académie à la sélection nationale.</p>
              </div>

              {/* Player selector carousel */}
              <HorizCarousel>
                {NATIONAL_PLAYERS.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedTimelinePlayer(player.id)}
                    style={{ scrollSnapAlign: 'start' }}
                    className={`flex-shrink-0 w-48 p-3.5 rounded-xl border text-left transition-all cursor-pointer flex gap-3 items-center ${
                      selectedTimelinePlayer === player.id
                        ? 'bg-[#0c2215] border-[#1F8A4C] shadow-[0_0_12px_rgba(31,138,76,0.2)]'
                        : 'bg-black/20 border-white/5 hover:bg-black/40 hover:border-white/10'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-black/40 shrink-0 border border-white/10">
                      <img src={imgMap[player.imgKey] ?? imgMap.yt1} alt={player.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate">{player.name}</div>
                      <div className="text-[9px] text-gray-400 truncate">{player.club.short}</div>
                    </div>
                  </button>
                ))}
              </HorizCarousel>

              {/* Timeline detail */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={timelinePlayer.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-black/25 p-6 rounded-2xl border border-white/5 space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                      <img src={imgMap[timelinePlayer.imgKey] ?? imgMap.yt1} alt={timelinePlayer.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-white">{timelinePlayer.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: timelinePlayer.club.color }} />
                        {timelinePlayer.club.name} · {timelinePlayer.position}
                      </div>
                    </div>
                  </div>

                  <div className="relative border-l-2 border-white/10 pl-6 ml-3 space-y-7 py-2">
                    {timelinePlayer.milestones.map((ms, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative"
                      >
                        {/* Dot */}
                        <span className="absolute -left-[35px] top-1 h-4 w-4 rounded-full border-2 border-[#1F8A4C] bg-[#05140B] flex items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FCD116]" />
                        </span>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-[#FCD116] bg-[#FCD116]/10 px-2 py-0.5 rounded border border-[#FCD116]/20">
                              {ms.date}
                            </span>
                            <h4 className="text-sm font-bold text-white">{ms.title}</h4>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed font-light">{ms.description}</p>
                        </div>
                      </motion.div>
                    ))}

                    {/* Terminal node — national team */}
                    <div className="relative">
                      <span className="absolute -left-[35px] top-1 h-4 w-4 rounded-full bg-[#1F8A4C] flex items-center justify-center">
                        <span className="text-[8px]">🇨🇲</span>
                      </span>
                      <div className="text-xs font-bold text-[#1F8A4C] uppercase tracking-wider">
                        Destination : Lions Indomptables
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* ───────── STATS ───────── */}
          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold uppercase text-white">Statistiques Internationales</h2>
                <p className="text-xs text-gray-400 mt-1">Performances comparées des joueurs Elite One en équipe nationale.</p>
              </div>

              {/* Stat cards carousel */}
              <HorizCarousel>
                {NATIONAL_PLAYERS.filter(p => p.caps > 0).map((player, i) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{ scrollSnapAlign: 'start' }}
                    className="flex-shrink-0 w-56 bg-black/30 rounded-2xl border border-white/5 overflow-hidden"
                  >
                    <div className="p-4 flex gap-3 items-center border-b border-white/5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40">
                        <img src={imgMap[player.imgKey] ?? imgMap.yt1} alt={player.name} className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{player.name}</div>
                        <div className="text-[9px] text-gray-400">{player.posCode} · {player.club.short}</div>
                      </div>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-2 text-center">
                      {[
                        { label: 'Sél.', value: player.caps },
                        { label: 'Buts', value: player.goals },
                        { label: 'Min.', value: player.stats.minutesPlayed },
                        { label: 'Pass %', value: player.stats.passAccuracy ? `${player.stats.passAccuracy}%` : '—' },
                      ].map(s => (
                        <div key={s.label} className="bg-black/30 rounded-lg p-2">
                          <div className="text-[8px] text-gray-500 uppercase">{s.label}</div>
                          <div className="text-sm font-bold text-white">{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </HorizCarousel>

              {/* Full comparison table */}
              <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#FCD116]" />
                  <h3 className="font-display text-base font-bold uppercase text-white tracking-wide">Tableau Comparatif Complet</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.025] text-[9px] uppercase text-gray-400 font-black tracking-wider">
                        <th className="px-5 py-3">Joueur</th>
                        <th className="px-5 py-3">Club</th>
                        <th className="px-5 py-3 text-center">Sél.</th>
                        <th className="px-5 py-3 text-center">Min.</th>
                        <th className="px-5 py-3 text-center">B / A</th>
                        <th className="px-5 py-3 text-center">Pass %</th>
                        <th className="px-5 py-3 text-center">Duels / Tirs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {NATIONAL_PLAYERS.map((player, i) => (
                        <motion.tr
                          key={player.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/40 shrink-0">
                                <img src={imgMap[player.imgKey] ?? imgMap.yt1} alt={player.name} className="w-full h-full object-cover object-top" />
                              </div>
                              <div>
                                <div className="font-bold text-white text-xs">{player.name}</div>
                                <div className="text-[9px] text-gray-500">{player.position}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: player.club.color }} />
                              <span className="text-gray-300">{player.club.short}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-center font-bold text-[#FCD116]">{player.caps}</td>
                          <td className="px-5 py-3 text-center text-gray-300">{player.stats.minutesPlayed || '—'}</td>
                          <td className="px-5 py-3 text-center text-gray-300">{player.goals} / {player.assists}</td>
                          <td className="px-5 py-3 text-center text-gray-300">{player.stats.passAccuracy ? `${player.stats.passAccuracy}%` : '—'}</td>
                          <td className="px-5 py-3 text-center text-gray-300">
                            {player.posCode === 'DC'
                              ? `${player.stats.tacklesWon} tac.`
                              : player.stats.shotsOnTarget > 0 ? `${player.stats.shotsOnTarget} tirs` : '—'}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
