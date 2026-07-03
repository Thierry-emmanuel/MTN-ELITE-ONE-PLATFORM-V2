import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Award, Users, Star, Calendar, Bookmark, BarChart3,
  ChevronRight, Compass, Shield, Zap, Search, Activity, Quote,
  ChevronDown, ChevronLeft, ChevronRight as ChevronRightIcon,
  BookOpen, Sparkles, HelpCircle, History
} from 'lucide-react';
import PageLayout from '@/layout/PageLayout';
import { PageHero } from '@/components/elite/FootballPrimitives';
import { ClubBadge } from '@/components/elite/ClubBadge';
import { clubs, Club } from '@/components/elite/data';

import yt1 from "@/assets/images/youngtalents/NathanDouala.png";
import yt2 from "@/assets/images/youngtalents/SergeDaura.png";
import p3 from "@/assets/images/players/EdouardSombang.png";
import p1 from "@/assets/images/youngtalents/SergeDaura.png";
import p2 from "@/assets/images/players/RichardNjoh.png";

const imgMap: Record<string, string> = { yt1, yt2, p3, p1, p2 };

// Helper to resolve club names to Club objects
function getClubByName(name: string): Club {
  const normalized = name.toLowerCase();
  if (normalized.includes('victoria')) return clubs.vict;
  if (normalized.includes('coton')) return clubs.cot;
  if (normalized.includes('canon')) return clubs.cnk;
  if (normalized.includes('union')) return clubs.uds;
  if (normalized.includes('fovu')) return clubs.fov;
  if (normalized.includes('bamboutos')) return clubs.bam;
  if (normalized.includes('colombe')) return clubs.cof;
  if (normalized.includes('apejes')) return clubs.apb;
  if (normalized.includes('young')) return clubs.ymb;
  if (normalized.includes('pwd')) return clubs.pwd;
  
  // Return a generic fallback club
  return { id: 'generic', name, short: name.slice(0, 3).toUpperCase(), color: '#1F8A4C', city: 'Cameroun' };
}

// Player image helper mapping
const PLAYER_IMAGES: Record<string, string> = {
  "Nathan Douala": "yt1",
  "Salomon Mbarga": "p3",
  "Serge Daura": "yt2",
  "Roger Milla": "p1",
  "Alain Nsangou": "p2"
};

// ─── Data Definitions ────────────────────────────────────────────────────────

interface SeasonArchive {
  year: string;
  champion: string;
  runnerUp: string;
  topScorer: string;
  goals: number;
  bestAttack: string;
  bestDefense: string;
  story: string;
  awards: { title: string; winner: string; club: string }[];
  standings: { rank: number; club: string; played: number; points: number; gd: number }[];
  fixtures: { home: string; away: string; score: string; date: string }[];
}

const HISTORIC_SEASONS: SeasonArchive[] = [
  {
    year: "2024/2025",
    champion: "Victoria United",
    runnerUp: "Coton Sport",
    topScorer: "Salomon Mbarga",
    goals: 14,
    bestAttack: "Victoria United (42 buts)",
    bestDefense: "Union Douala (16 buts)",
    story: "Une saison légendaire marquée par le sacre historique de Victoria United. Emmenés par le jeune prodige Nathan Douala, ils ont conquis le titre lors des play-offs d'Elite One dans une ambiance extraordinaire.",
    awards: [
      { title: "Meilleur Joueur (Ballon d'Or)", winner: "Nathan Douala", club: "Victoria United" },
      { title: "Meilleur Gardien", winner: "Alain Nsangou", club: "Canon Yaoundé" },
      { title: "Meilleur Entraîneur", winner: "Dimitar Pantev", club: "Victoria United" }
    ],
    standings: [
      { rank: 1, club: "Victoria United", played: 26, points: 54, gd: 20 },
      { rank: 2, club: "Coton Sport", played: 26, points: 51, gd: 18 },
      { rank: 3, club: "Canon Yaoundé", played: 26, points: 48, gd: 12 },
      { rank: 4, club: "Union Douala", played: 26, points: 45, gd: 10 },
      { rank: 5, club: "Dynamo Douala", played: 26, points: 41, gd: 4 }
    ],
    fixtures: [
      { home: "Victoria United", away: "Coton Sport", score: "3 - 2", date: "Play-offs 2025" },
      { home: "Canon Yaoundé", away: "Union Douala", score: "1 - 1", date: "Mars 2025" },
      { home: "Dynamo Douala", away: "Victoria United", score: "0 - 2", date: "Février 2025" }
    ]
  },
  {
    year: "2023/2024",
    champion: "Coton Sport",
    runnerUp: "Stade Renard",
    topScorer: "Emmanuel Mahop",
    goals: 13,
    bestAttack: "Coton Sport (39 buts)",
    bestDefense: "Stade Renard (15 buts)",
    story: "Coton Sport a conservé sa suprématie nationale en survolant la phase finale. La rigueur tactique et la profondeur de banc de Garoua ont fait la différence face à un Stade Renard très surprenant.",
    awards: [
      { title: "Meilleur Joueur", winner: "Emmanuel Mahop", club: "Coton Sport" },
      { title: "Révélation de l'année", winner: "Nathan Douala", club: "Victoria United" },
      { title: "Meilleur Entraîneur", winner: "Jean-Baptiste Bisseck", club: "Coton Sport" }
    ],
    standings: [
      { rank: 1, club: "Coton Sport", played: 24, points: 50, gd: 19 },
      { rank: 2, club: "Stade Renard", played: 24, points: 46, gd: 12 },
      { rank: 3, club: "Bamboutos", played: 24, points: 42, gd: 8 },
      { rank: 4, club: "Canon Yaoundé", played: 24, points: 39, gd: 3 }
    ],
    fixtures: [
      { home: "Coton Sport", away: "Stade Renard", score: "2 - 0", date: "Play-offs 2024" },
      { home: "Bamboutos", away: "Canon Yaoundé", score: "3 - 1", date: "Avril 2024" }
    ]
  },
  {
    year: "1999/2000",
    champion: "Fovu Baham",
    runnerUp: "Coton Sport",
    topScorer: "Pius N'Diefi",
    goals: 16,
    bestAttack: "Fovu Baham (38 buts)",
    bestDefense: "Coton Sport (14 buts)",
    story: "Une saison mythique marquée par le premier sacre national de Fovu de Baham. Cette année-là a coïncidé avec la mèche olympique des Lions de Sydney, créant une vague de ferveur footballistique sans précédent au pays.",
    awards: [
      { title: "Meilleur Buteur", winner: "Pius N'Diefi", club: "Fovu Baham" },
      { title: "Meilleur Gardien", winner: "Idris Carlos Kameni", club: "Kadji Sports Academy" }
    ],
    standings: [
      { rank: 1, club: "Fovu Baham", played: 30, points: 62, gd: 18 },
      { rank: 2, club: "Coton Sport", played: 30, points: 59, gd: 16 },
      { rank: 3, club: "Union Douala", played: 30, points: 55, gd: 11 },
      { rank: 4, club: "Canon Yaoundé", played: 30, points: 52, gd: 9 }
    ],
    fixtures: [
      { home: "Fovu Baham", away: "Coton Sport", score: "1 - 0", date: "Septembre 2000" },
      { home: "Union Douala", away: "Canon Yaoundé", score: "2 - 2", date: "Mai 2000" }
    ]
  },
  {
    year: "1989/1990",
    champion: "Canon Yaoundé",
    runnerUp: "Tonnerre Yaoundé",
    topScorer: "Roger Milla",
    goals: 15,
    bestAttack: "Canon Yaoundé (45 buts)",
    bestDefense: "Tonnerre Yaoundé (18 buts)",
    story: "L'âge d'or du football camerounais. Le 'Classico' de Yaoundé entre le Canon et le Tonnerre a atteint son paroxysme. Quelques mois plus tard, la quasi-totalité de l'effectif s'envolait pour l'Italie pour écrire la page la plus célèbre de la Coupe du Monde.",
    awards: [
      { title: "Meilleur Joueur", winner: "Roger Milla", club: "Tonnerre Yaoundé" },
      { title: "Meilleur Gardien", winner: "Thomas N'Kono", club: "Canon Yaoundé" }
    ],
    standings: [
      { rank: 1, club: "Canon Yaoundé", played: 28, points: 58, gd: 22 },
      { rank: 2, club: "Tonnerre Yaoundé", played: 28, points: 56, gd: 20 },
      { rank: 3, club: "Union Douala", played: 28, points: 49, gd: 11 },
      { rank: 4, club: "Prévoyance Yaoundé", played: 28, points: 44, gd: 5 }
    ],
    fixtures: [
      { home: "Canon Yaoundé", away: "Tonnerre Yaoundé", score: "2 - 1", date: "Avril 1990" },
      { home: "Tonnerre Yaoundé", away: "Union Douala", score: "3 - 0", date: "Février 1990" }
    ]
  }
];

const CLUB_HONOURS = [
  { club: "Coton Sport de Garoua", gold: 18, silver: 7, lastTitle: "2024", color: "#10B981" },
  { club: "Canon Yaoundé", gold: 10, silver: 6, lastTitle: "2002", color: "#CE1126" },
  { club: "Tonnerre Yaoundé", gold: 5, silver: 4, lastTitle: "1988", color: "#FCD116" },
  { club: "Union Douala", gold: 5, silver: 3, lastTitle: "2012", color: "#3B82F6" },
  { club: "Oryx Douala", gold: 5, silver: 1, lastTitle: "1967", color: "#EC4899" },
  { club: "Fovu Baham", gold: 1, silver: 2, lastTitle: "2000", color: "#8B5CF6" },
  { club: "Victoria United", gold: 1, silver: 0, lastTitle: "2025", color: "#F59E0B" }
];

const TIMELINE_EVENTS = [
  { year: "1950", title: "Fondation", desc: "Organisation des premières ligues régionales structurées sous l'égide de la fédération pionnière." },
  { year: "1960", title: "Indépendance & Premier Titre", desc: "Premier championnat unifié national célébré après l'indépendance." },
  { year: "1965", title: "Sacre de l'Oryx Douala", desc: "L'Oryx Douala remporte la toute première Coupe des clubs champions africains." },
  { year: "1972", title: "La CAN de Yaoundé", desc: "Inauguration des stades Omnisports et ferveur continentale à domicile." },
  { year: "1982", title: "L'Épopée Espagnole", desc: "Les Lions brillent sans perdre un match lors de la Coupe du Monde 1982." },
  { year: "1990", title: "Quart de finale en Italie", desc: "La génération de Roger Milla stupéfie la planète et atteint les quarts de finale mondiaux." },
  { year: "2000", title: "Or Olympique de Sydney", desc: "Le Cameroun de Samuel Eto'o bat l'Espagne pour le graal olympique." },
  { year: "2025", title: "Ère Professionnelle Digitale", desc: "Entrée en vigueur de la couverture digitale complète et data des clubs." }
];

const RECORD_ITEMS = [
  { title: "Plus grand nombre de titres de Champion", value: "18", holder: "Coton Sport de Garoua", detail: "Dominant le football camerounais depuis les années 1990." },
  { title: "Buts marqués en une seule saison", value: "22", holder: "Albert Meyong Ze", detail: "Établi avec le Canon Yaoundé en 1998/1999." },
  { title: "Plus grand nombre de sélections nationales", value: "137", holder: "Rigobert Song", detail: "Légendaire capitaine ayant débuté au Tonnerre Yaoundé." },
  { title: "Plus large victoire en finale de Coupe", value: "5 - 0", holder: "Union Douala vs Lion Blessé", detail: "Finale de la Coupe du Cameroun 1961." },
  { title: "Série d'invincibilité en championnat", value: "32 matchs", holder: "Coton Sport de Garoua", detail: "Série étalée sur les saisons 2007 et 2008." }
];

const DERBIES = [
  {
    name: "Le Classico Classique de Yaoundé",
    clubs: "Canon vs Tonnerre",
    story: "La rivalité historique de la capitale politique. Une confrontation qui divisait autrefois chaque quartier de Yaoundé entre les 'Mekok Megonda' du Canon et les supporters du Tonnerre Kalara Club.",
    status: "Historique / Rivalité majeure"
  },
  {
    name: "Le Derby de Douala",
    clubs: "Union Douala vs Dynamo Douala",
    story: "Une bataille intense pour la suprématie de la capitale économique. Ce derby mobilise les passions populaires le long du littoral et représente un choc d'identités culturelles fortes.",
    status: "Rivalité active"
  }
];

const LEGENDARY_COACHES = [
  { name: "Hugo Broos", achievements: "Vainqueur de la CAN 2017 avec une sélection locale solide." },
  { name: "Jean-Paul Akono", achievements: "Architecte de la médaille d'or olympique en 2000." },
  { name: "Peter Schnittger", achievements: "Pionnier de la structuration moderne de la sélection dans les années 70." }
];

type TabId = 'champions' | 'archives' | 'records' | 'evolution';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<TabId>('champions');
  const [selectedSeasonYear, setSelectedSeasonYear] = useState<string>("2024/2025");

  const activeSeason = useMemo(() => {
    return HISTORIC_SEASONS.find(s => s.year === selectedSeasonYear) || HISTORIC_SEASONS[0];
  }, [selectedSeasonYear]);

  const TABS = [
    { id: 'champions', label: 'Palmarès & Clubs', icon: Trophy },
    { id: 'archives',  label: 'Archives de Saison', icon: Calendar },
    { id: 'records',   label: 'Records & Derbies', icon: Bookmark },
    { id: 'evolution', label: 'Évolution Historique', icon: History }
  ];

  return (
    <PageLayout>
      <PageHero
        eyebrow="MTN Elite One · Musée &amp; Archives"
        title="Musée du Football"
        subtitle="Explorez l'histoire glorieuse, les archives mythiques et le patrimoine unique du football camerounais."
        accentColor="gold"
      />

      {/* Flag Gradient Border */}
      <div className="h-[4px] bg-gradient-to-r from-[#008751] via-[#FCD116] to-[#CE1126]" />

      {/* Tabs navigation */}
      <div className="sticky top-[62px] z-30 bg-[#0A1A12]/95 backdrop-blur-md border-b border-white/10">
        <div className="container py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as TabId)}
                  className={`px-4.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#1F8A4C] text-white border-[#1F8A4C] shadow-[0_0_15px_rgba(31,138,76,0.35)]'
                      : 'bg-white/[0.02] text-gray-400 border-white/5 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container py-12">
        <AnimatePresence mode="wait">

          {/* ────── Tab 1: PALMARÈS & CLUBS ────── */}
          {activeTab === 'champions' && (
            <motion.div
              key="champions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 text-[#FCD116]">
                    <Trophy className="h-4 w-4 animate-bounce" />
                    <span className="text-[11px] uppercase font-black tracking-widest">Le Panthéon des Clubs</span>
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight leading-none">
                    Palmarès de la MTN Elite One
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed font-light">
                    Depuis sa création, la ligue d'élite camerounaise a vu s'affronter les plus grands clubs d'Afrique. De la dynastie historique de Coton Sport de Garoua aux pionniers de l'Oryx Douala, découvrez le classement historique des champions.
                  </p>
                  <blockquote className="border-l-2 border-[#FCD116] pl-4 italic text-xs text-gray-400">
                    &ldquo;Devenir champion du Cameroun, c'est graver son nom au coeur d'une ferveur de 30 millions de sélectionneurs.&rdquo;
                  </blockquote>
                </div>

                {/* Stat quick summary card */}
                <div className="lg:col-span-6 bg-gradient-to-br from-[#0c2215] to-[#041009] p-6 rounded-3xl border border-white/10 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Titres Record</div>
                    <div className="text-2xl font-display font-black text-[#FCD116] mt-1">18</div>
                    <div className="text-[9px] text-gray-400 truncate">Coton Sport</div>
                  </div>
                  <div className="border-x border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">1er Champion</div>
                    <div className="text-2xl font-display font-black text-white mt-1">1961</div>
                    <div className="text-[9px] text-gray-400 truncate">Oryx Douala</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Total Champions</div>
                    <div className="text-2xl font-display font-black text-[#10B981] mt-1">15</div>
                    <div className="text-[9px] text-gray-400 truncate">différents clubs</div>
                  </div>
                </div>
              </div>

              {/* Clubs Honours Grid */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-bold uppercase text-white tracking-wide border-b border-white/5 pb-2">
                  Tableau d'Honneur des Clubs
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {CLUB_HONOURS.map((c, i) => (
                    <motion.div
                      key={c.club}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-black/20 p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-[#1F8A4C]/30 hover:bg-black/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <ClubBadge club={getClubByName(c.club)} size={36} />
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white group-hover:text-[#FCD116] transition-colors">{c.club}</h4>
                          <div className="text-[10px] text-gray-400 font-light">
                            Dernier sacre : <span className="font-bold text-gray-300">{c.lastTitle}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Trophy className="h-3.5 w-3.5 text-[#FCD116]" />
                          <span className="text-base font-display font-black text-white">{c.gold}</span>
                        </div>
                        <div className="text-[8px] text-gray-500 uppercase font-bold">Titres</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ────── Tab 2: SEASON ARCHIVES ────── */}
          {activeTab === 'archives' && (
            <motion.div
              key="archives"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Season Selector Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d2218] p-4.5 rounded-2xl border border-white/10">
                <div className="space-y-1">
                  <div className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Sélectionner une Saison Historique</div>
                  <p className="text-[11px] text-gray-500">Explorez les classements, résultats et statistiques de l'époque.</p>
                </div>
                <div className="relative shrink-0">
                  <select
                    value={selectedSeasonYear}
                    onChange={(e) => setSelectedSeasonYear(e.target.value)}
                    className="w-full sm:w-48 pl-4 pr-8 py-2 bg-[#07140e] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#FCD116]/60 text-white transition-colors appearance-none cursor-pointer"
                  >
                    {HISTORIC_SEASONS.map(s => (
                      <option key={s.year} value={s.year}>{s.year}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Season Editorial Showcase */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left block: Story and quick stats */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded bg-[#FCD116]/10 border border-[#FCD116]/20 text-[10px] font-bold text-[#FCD116] uppercase tracking-wider">
                      Saison {activeSeason.year}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      Champion : 
                      <ClubBadge club={getClubByName(activeSeason.champion)} size={16} />
                      <span className="font-bold text-white">{activeSeason.champion}</span>
                    </span>
                  </div>

                  <h3 className="font-display text-3xl font-bold uppercase text-white tracking-tight leading-tight">
                    Récit de la Saison
                  </h3>

                  <p className="text-gray-300 text-sm leading-relaxed font-light">
                    {activeSeason.story}
                  </p>

                  {/* Season achievements / awards */}
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <h4 className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Distinctions Individuelles</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeSeason.awards.map((a, idx) => {
                        const imgKey = PLAYER_IMAGES[a.winner];
                        const playerImg = imgKey ? imgMap[imgKey] : null;
                        return (
                          <div key={idx} className="bg-black/30 p-3.5 rounded-xl border border-white/5 flex gap-3 items-center">
                            {playerImg ? (
                              <img src={playerImg} alt={a.winner} className="w-10 h-10 rounded-full object-cover object-top shrink-0 border border-white/10" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-gray-500 font-bold text-xs">{(a.winner[0] || 'P')}</div>
                            )}
                            <div className="min-w-0">
                              <div className="text-[9px] text-gray-500 uppercase">{a.title}</div>
                              <div className="text-sm font-bold text-white truncate">{a.winner}</div>
                              <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <ClubBadge club={getClubByName(a.club)} size={12} />
                                <span className="truncate">{a.club}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right block: Stats cards */}
                <div className="lg:col-span-5 bg-black/25 border border-white/5 p-6 rounded-2xl space-y-4">
                  <h4 className="text-xs uppercase font-black tracking-widest text-[#FCD116]">Chiffres Clés</h4>
                  <div className="space-y-3.5">
                    <div className="flex justify-between border-b border-white/5 pb-2 items-center">
                      <span className="text-xs text-gray-400">Meilleur Buteur</span>
                      <div className="flex items-center gap-2">
                        {PLAYER_IMAGES[activeSeason.topScorer] && (
                          <img src={imgMap[PLAYER_IMAGES[activeSeason.topScorer]]} alt="" className="w-6 h-6 rounded-full object-cover object-top" />
                        )}
                        <span className="text-xs font-bold text-white">{activeSeason.topScorer} ({activeSeason.goals} buts)</span>
                      </div>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2 items-center">
                      <span className="text-xs text-gray-400">Meilleure Attaque</span>
                      <div className="flex items-center gap-1.5">
                        <ClubBadge club={getClubByName(activeSeason.bestAttack.split(' (')[0])} size={14} />
                        <span className="text-xs font-bold text-white">{activeSeason.bestAttack}</span>
                      </div>
                    </div>
                    <div className="flex justify-between pb-2 items-center">
                      <span className="text-xs text-gray-400">Meilleure Défense</span>
                      <div className="flex items-center gap-1.5">
                        <ClubBadge club={getClubByName(activeSeason.bestDefense.split(' (')[0])} size={14} />
                        <span className="text-xs font-bold text-white">{activeSeason.bestDefense}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Standings and Fixtures Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
                {/* Standings */}
                <div className="lg:col-span-7 bg-black/20 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/5">
                    <h4 className="text-xs uppercase font-black text-white tracking-widest">Classement Final</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02] text-[9px] uppercase text-gray-400 font-bold">
                          <th className="p-3 text-center">Pos</th>
                          <th className="p-3">Club</th>
                          <th className="p-3 text-center">MJ</th>
                          <th className="p-3 text-center">Pts</th>
                          <th className="p-3 text-center">Diff</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {activeSeason.standings.map(s => (
                          <tr key={s.club} className="hover:bg-white/[0.01]">
                            <td className="p-3 text-center font-bold text-gray-300">{s.rank}</td>
                            <td className="p-3 font-bold text-white">
                              <div className="flex items-center gap-2">
                                <ClubBadge club={getClubByName(s.club)} size={16} />
                                <span>{s.club}</span>
                              </div>
                            </td>
                            <td className="p-3 text-center text-gray-400">{s.played}</td>
                            <td className="p-3 text-center font-bold text-[#FCD116]">{s.points}</td>
                            <td className="p-3 text-center text-gray-400">{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Fixtures */}
                <div className="lg:col-span-5 bg-black/20 border border-white/5 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs uppercase font-black text-white tracking-widest border-b border-white/5 pb-2">Affiches Marquantes</h4>
                  <div className="space-y-3">
                    {activeSeason.fixtures.map((f, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                          <ClubBadge club={getClubByName(f.home)} size={16} />
                          <div className="text-xs font-bold text-white truncate">{f.home}</div>
                        </div>
                        <div className="px-3 shrink-0 text-center font-display font-black text-[#FCD116] text-xs">
                          {f.score}
                        </div>
                        <div className="min-w-0 flex-1 flex items-center justify-end gap-2">
                          <div className="text-xs font-bold text-white truncate text-right">{f.away}</div>
                          <ClubBadge club={getClubByName(f.away)} size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ────── Tab 3: RECORDS & DERBIES ────── */}
          {activeTab === 'records' && (
            <motion.div
              key="records"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              {/* Records Grid */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase text-white tracking-tight">Le Centre des Records</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Les plus grands records et chiffres de l'histoire du football camerounais.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {RECORD_ITEMS.map((rec, i) => (
                    <motion.div
                      key={rec.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-black/25 border border-white/5 p-5 rounded-2xl space-y-3"
                    >
                      <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{rec.title}</div>
                      <div className="text-2xl font-display font-black text-[#FCD116]">{rec.value}</div>
                      <div className="flex items-center gap-2">
                        {PLAYER_IMAGES[rec.holder] ? (
                          <img src={imgMap[PLAYER_IMAGES[rec.holder]]} alt="" className="w-8 h-8 rounded-full object-cover object-top border border-white/10" />
                        ) : (
                          <ClubBadge club={getClubByName(rec.holder)} size={20} />
                        )}
                        <div>
                          <div className="text-xs font-bold text-white">{rec.holder}</div>
                          <p className="text-[10px] text-gray-400 font-light leading-relaxed mt-0.5">{rec.detail}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Derby Rivalry History */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase text-white tracking-tight">Histoires de Derbys</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Ces matchs fratricides qui font vibrer le pays tout entier.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {DERBIES.map((d, i) => (
                    <div key={i} className="bg-gradient-to-br from-[#0c2215] to-[#041009] p-6 rounded-3xl border border-white/5 space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#FCD116]/5 rounded-full blur-2xl" />
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-0.5 rounded bg-[#FCD116]/10 border border-[#FCD116]/20 text-[9px] font-bold text-[#FCD116] uppercase tracking-wider">
                          {d.status}
                        </span>
                      </div>
                      <h4 className="font-display text-lg font-bold text-white">{d.name}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed font-light">{d.story}</p>
                      <div className="text-[10px] font-bold text-accent uppercase tracking-wider pt-2 border-t border-white/5 flex justify-between items-center">
                        <span>Affiche historique</span>
                        <div className="flex items-center gap-1.5">
                          <ClubBadge club={getClubByName(d.clubs.split(' vs ')[0])} size={16} />
                          <span className="text-white">{d.clubs}</span>
                          <ClubBadge club={getClubByName(d.clubs.split(' vs ')[1])} size={16} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legendary Coaches */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase text-white tracking-tight">Grands Tacticiens</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Les entraîneurs emblématiques qui ont écrit les plus belles pages de l'histoire.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {LEGENDARY_COACHES.map((coach, i) => (
                    <div key={i} className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-2">
                      <h4 className="text-sm font-bold text-white">{coach.name}</h4>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">{coach.achievements}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ────── Tab 4: LEAGUE EVOLUTION ────── */}
          {activeTab === 'evolution' && (
            <motion.div
              key="evolution"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div>
                <h3 className="font-display text-2xl font-bold uppercase text-white tracking-tight">Évolution du Championnat</h3>
                <p className="text-xs text-gray-400 mt-0.5">Parcourez le fil rouge de l'histoire et découvrez comment la ligue s'est modernisée depuis 1950.</p>
              </div>

              <div className="relative border-l-2 border-white/10 pl-6 ml-3 space-y-8 py-2">
                {TIMELINE_EVENTS.map((event, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="relative"
                  >
                    {/* Circle dot node */}
                    <span className="absolute -left-[35px] top-1.5 h-4 w-4 rounded-full border-2 border-[#1F8A4C] bg-[#0A1A12] flex items-center justify-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#FCD116]" />
                    </span>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#FCD116] bg-[#FCD116]/10 px-2 py-0.5 rounded border border-[#FCD116]/20 font-mono">
                          {event.year}
                        </span>
                        <h4 className="text-sm font-bold text-white">{event.title}</h4>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed font-light">
                        {event.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Museum Closing Plaque */}
      <section className="container pb-20 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto border border-[#FCD116]/20 p-10 text-center space-y-4 relative"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(252,209,22,0.05),transparent_70%)] pointer-events-none" />
          <Quote className="h-8 w-8 text-[#FCD116] mx-auto opacity-50" />
          <p className="font-display text-lg italic text-white/90 leading-relaxed">
            &ldquo;Le football est notre patrimoine commun, un ciment social indissoluble qui lie le passé, le présent et le futur du Cameroun.&rdquo;
          </p>
          <div className="flex justify-center gap-1">
            {['#008751', '#FCD116', '#CE1126'].map(c => (
              <div key={c} className="h-1 w-6 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            Conservateur Général du Musée
          </div>
        </motion.div>
      </section>
    </PageLayout>
  );
}
