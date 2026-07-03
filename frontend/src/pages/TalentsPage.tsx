import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Zap, Search, ChevronDown, ChevronLeft, ChevronRight,
  ArrowLeftRight, Award, Trophy, X, BarChart3, TrendingUp,
  BookOpen, CheckCircle2, AlertCircle, Info, Flame
} from 'lucide-react';
import { clubs, Club } from '@/components/elite/data';
import yt1 from "@/assets/images/youngtalents/NathanDouala.png";
import yt2 from "@/assets/images/youngtalents/SergeDaura.png";
import p3 from "@/assets/images/players/EdouardSombang.png";

// Resolve image path helpers
const imgMap: Record<string, string> = { yt1, yt2, p3 };

// Rich dataset of Cameroonian Young Talents
interface TalentDetail {
  id: string;
  name: string;
  age: number;
  club: Club;
  position: 'Milieu' | 'Attaquant' | 'Défenseur' | 'Gardien';
  positionDetail: string;
  nationality: string;
  rating: number; // Current rating out of 10
  potential: number; // Potential rating out of 100
  marketValue: string;
  preferredFoot: 'Gaucher' | 'Droitier' | 'Ambidextre';
  height: string;
  weight: string;
  story: string;
  playingStyle: string;
  strengths: string[];
  weaknesses: string[];
  achievements: string[];
  attributes: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
  stats: {
    appearances: number;
    goals: number;
    assists: number;
    xg: number;
    xa: number;
    keyPasses: number;
    dribbleSuccess: number; // %
    interceptions: number;
    minutesPlayed: number;
  };
  highlightVideo: string;
  imgKey: string;
  scoutReport: string;
  progression: { year: string; rating: number }[];
}

const TALENTS_DATA: TalentDetail[] = [
  {
    id: "yt1",
    name: "Nathan Douala",
    age: 17,
    club: clubs.vict,
    position: "Milieu",
    positionDetail: "Milieu Offensif (MOC / MC)",
    nationality: "Cameroun 🇨🇲",
    rating: 8.2,
    potential: 93,
    marketValue: "€1.2M",
    preferredFoot: "Droitier",
    height: "1.74 m",
    weight: "68 kg",
    story: "Découvert dans les académies de Douala à 14 ans, Nathan Douala s'est imposé comme le cerveau de Victoria United. Sa technique soyeuse et sa vision du jeu hors normes lui ont valu une convocation historique avec les Lions Indomptables pour la CAN.",
    playingStyle: "Meneur de jeu moderne de type '8.5' ou '10'. Il excelle dans les demi-espaces, oriente le jeu sous pression avec une aisance remarquable et dispose d'une qualité de passe de transition d'élite.",
    strengths: ["Vision de jeu", "Qualité de passe", "Dribble court", "Agilité", "Résistance au pressing"],
    weaknesses: ["Impact physique", "Jeu de tête", "Repli défensif"],
    achievements: [
      "Plus jeune joueur convoqué à la CAN 2024",
      "Élu Meilleur Jeune de la MTN Elite One 2025",
      "Vainqueur du Championnat avec Victoria United (2025)"
    ],
    attributes: { pace: 82, shooting: 76, passing: 89, dribbling: 87, defending: 45, physical: 60 },
    stats: {
      appearances: 22,
      goals: 6,
      assists: 9,
      xg: 4.8,
      xa: 8.2,
      keyPasses: 64,
      dribbleSuccess: 74,
      interceptions: 12,
      minutesPlayed: 1820
    },
    highlightVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    imgKey: "yt1",
    scoutReport: "Nathan possède un profil de meneur créateur exceptionnel. Sa maturité tactique dépasse de loin son âge. Il fluidifie le jeu de transition et crée constamment des décalages. S'il renforce son volume athlétique et son efficacité à la récupération, son plafond est de niveau Ligue des Champions européenne.",
    progression: [
      { year: "24/25", rating: 68 },
      { year: "25/26", rating: 76 },
      { year: "Actuel", rating: 82 }
    ]
  },
  {
    id: "yt2",
    name: "Serge Daura",
    age: 19,
    club: clubs.cot,
    position: "Attaquant",
    positionDetail: "Avant-centre / Ailier Droit",
    nationality: "Cameroun 🇨🇲",
    rating: 7.9,
    potential: 89,
    marketValue: "€850k",
    preferredFoot: "Droitier",
    height: "1.85 m",
    weight: "79 kg",
    story: "Pur produit de la formation de Coton Sport de Garoua, Daura est la terreur des défenses de l'Elite One. Puissant, véloce et clinique devant le but, il a franchi toutes les étapes des sélections de jeunes U17 et U20 avec brio.",
    playingStyle: "Attaquant intérieur ou pivot mobile. Utilise sa vitesse dévastatrice en transition et son physique impressionnant pour fixer et éliminer ses vis-à-vis. Très performant dans les appels en profondeur.",
    strengths: ["Vitesse de pointe", "Finition", "Jeu dos au but", "Puissance athlétique"],
    weaknesses: ["Créativité", "Discipline tactique", "Volume de pressing"],
    achievements: [
      "Meilleur buteur U20 du tournoi de l'UNIFFAC 2024",
      "Auteur de 12 buts toutes compétitions confondues en 2025/26",
      "Élu Lionceau d'Or du mois de Février 2026"
    ],
    attributes: { pace: 90, shooting: 84, passing: 70, dribbling: 78, defending: 35, physical: 81 },
    stats: {
      appearances: 24,
      goals: 12,
      assists: 3,
      xg: 11.5,
      xa: 2.1,
      keyPasses: 18,
      dribbleSuccess: 56,
      interceptions: 8,
      minutesPlayed: 1950
    },
    highlightVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    imgKey: "yt2",
    scoutReport: "Daura est un profil moderne de buteur athlétique. Sa vitesse de pointe combinée à sa force physique le rend difficilement arrêtable en 1v1 lancé. Des progrès sont attendus dans sa participation au jeu combiné et dans sa constance défensive. Potentiel de titulaire régulier dans un club du Top 5 européen.",
    progression: [
      { year: "24/25", rating: 64 },
      { year: "25/26", rating: 72 },
      { year: "Actuel", rating: 79 }
    ]
  },
  {
    id: "yt3",
    name: "Rostand Mbai",
    age: 20,
    club: clubs.fov,
    position: "Attaquant",
    positionDetail: "Ailier Droit / Ailier Gauche",
    nationality: "Cameroun 🇨🇲",
    rating: 7.7,
    potential: 87,
    marketValue: "€600k",
    preferredFoot: "Gaucher",
    height: "1.71 m",
    weight: "64 kg",
    story: "Originaire de l'Ouest du Cameroun, Rostand Mbai enchante le public de Fovu Baham avec ses dribbles déroutants et ses accélérations explosives. Véritable poison pour les latéraux adverses, il est l'un des dynamiteurs de lignes les plus spectaculaires de la ligue.",
    playingStyle: "Ailier provocateur aimant repiquer sur son pied gauche. Excellent centreur en course et très fort dans le déséquilibre individuel.",
    strengths: ["Dribble 1v1", "Accélération", "Centres précis", "Coups de pied arrêtés"],
    weaknesses: ["Finition devant le but", "Prise de décision", "Contribution défensive"],
    achievements: [
      "Leader des dribbles réussis de MTN Elite One 2025/26",
      "Sélectionné avec l'équipe nationale A' pour le CHAN"
    ],
    attributes: { pace: 92, shooting: 71, passing: 78, dribbling: 88, defending: 30, physical: 55 },
    stats: {
      appearances: 20,
      goals: 5,
      assists: 7,
      xg: 4.2,
      xa: 6.9,
      keyPasses: 45,
      dribbleSuccess: 68,
      interceptions: 5,
      minutesPlayed: 1420
    },
    highlightVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    imgKey: "p3",
    scoutReport: "Mbai is an exceptional dribbler on the right flank. He easily creates separation and delivers accurate crosses. With more consistency in front of goal, he is ready for international level play.",
    progression: [
      { year: "24/25", rating: 62 },
      { year: "25/26", rating: 70 },
      { year: "Actuel", rating: 77 }
    ]
  },
  {
    id: "yt4",
    name: "Jean-Pierre Etame",
    age: 21,
    club: clubs.uds,
    position: "Défenseur",
    positionDetail: "Défenseur Central (DC)",
    nationality: "Cameroun 🇨🇲",
    rating: 8.0,
    potential: 88,
    marketValue: "€950k",
    preferredFoot: "Droitier",
    height: "1.89 m",
    weight: "84 kg",
    story: "Révélation défensive de l'Union Douala, Etame impressionne par son autorité naturelle, sa science du placement et sa qualité de relance. Capitaine des sélections nationales de jeunes U20 et U23, il possède le calme des grands défenseurs.",
    playingStyle: "Défenseur central moderne de couverture. Tranchant dans l'interception et doué pour casser les lignes par la passe au sol ou la transversale.",
    strengths: ["Jeu aérien", "Interceptions", "Qualité de relance", "Placement", "Force dans les duels"],
    weaknesses: ["Vitesse sur longue distance", "Changement d'appui face aux dribbleurs"],
    achievements: [
      "Capitaine des Lions U23",
      "Équipe type de la MTN Elite One 2025/26 (Phase Aller)",
      "Co-meilleure défense de la ligue avec Union Douala"
    ],
    attributes: { pace: 74, shooting: 40, passing: 79, dribbling: 68, defending: 85, physical: 84 },
    stats: {
      appearances: 21,
      goals: 2,
      assists: 1,
      xg: 1.8,
      xa: 0.8,
      keyPasses: 12,
      dribbleSuccess: 70,
      interceptions: 48,
      minutesPlayed: 1890
    },
    highlightVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    imgKey: "yt1",
    scoutReport: "Etame possesses all attributes of a modern defender. Athletic, disciplined and extremely composed on the ball. An absolute leader at the back.",
    progression: [
      { year: "24/25", rating: 69 },
      { year: "25/26", rating: 74 },
      { year: "Actuel", rating: 80 }
    ]
  },
  {
    id: "yt5",
    name: "Alain Nsangou",
    age: 18,
    club: clubs.cnk,
    position: "Gardien",
    positionDetail: "Gardien de but (GB)",
    nationality: "Cameroun 🇨🇲",
    rating: 7.8,
    potential: 90,
    marketValue: "€750k",
    preferredFoot: "Droitier",
    height: "1.92 m",
    weight: "82 kg",
    story: "Arrivé à Canon Yaoundé l'été dernier, Alain Nsangou s'est imposé comme le numéro un du club mythique de la capitale à seulement 18 ans. Ses réflexes supersoniques et son assurance dans les airs rappellent les légendes nationales de ce poste.",
    playingStyle: "Gardien moderne, très réactif sur sa ligne et actif dans le contrôle de sa surface de réparation. Présente une bonne technique de relance rapide à la main.",
    strengths: ["Réflexes", "Sorties aériennes", "1v1 avec l'attaquant", "Calme mental"],
    weaknesses: ["Jeu au pied long", "Communication/Directives de défense"],
    achievements: [
      "Plus grand nombre de clean sheets en U17 d'Afrique (2024)",
      "Titulaire indiscutable à Canon Yaoundé à 18 ans",
      "Élu gardien du mois d'Elite One à deux reprises"
    ],
    attributes: { pace: 62, shooting: 20, passing: 68, dribbling: 55, defending: 82, physical: 78 },
    stats: {
      appearances: 18,
      goals: 0,
      assists: 0,
      xg: 0,
      xa: 0,
      keyPasses: 2,
      dribbleSuccess: 100,
      interceptions: 32,
      minutesPlayed: 1620
    },
    highlightVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    imgKey: "yt2",
    scoutReport: "Nsangou represents the next elite generation of Cameroonian goalkeepers. Incredible shot stopper with stellar reflexes and presence.",
    progression: [
      { year: "24/25", rating: 65 },
      { year: "25/26", rating: 71 },
      { year: "Actuel", rating: 78 }
    ]
  }
];

// ─── Reusable Horizontal Carousel ────────────────────────────────────────────
function HorizCarousel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' });
  };
  return (
    <div className={`relative group/carousel ${className}`}>
      <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-black/80 border border-white/10 grid place-items-center text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black cursor-pointer -translate-x-3 shadow-xl">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div ref={ref} className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2" style={{ scrollSnapType: 'x mandatory' }}>
        {children}
      </div>
      <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-black/80 border border-white/10 grid place-items-center text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black cursor-pointer translate-x-3 shadow-xl">
        <ChevronRight className="h-4 w-4" />
      </button>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#0A1A12] to-transparent z-[5]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#0A1A12] to-transparent z-[5]" />
    </div>
  );
}

export default function TalentsPage() {
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<'ALL' | 'Milieu' | 'Attaquant' | 'Défenseur' | 'Gardien'>('ALL');
  const [clubFilter, setClubFilter] = useState<'ALL' | string>('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<TalentDetail | null>(null);

  // Comparison State
  const [comparePlayerAId, setComparePlayerAId] = useState<string>('yt1');
  const [comparePlayerBId, setComparePlayerBId] = useState<string>('yt2');
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Headline Star
  const headlineStar = useMemo(() => TALENTS_DATA[0], []);

  // Filtered Talents
  const filteredTalents = useMemo(() => {
    return TALENTS_DATA.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.story.toLowerCase().includes(search.toLowerCase());
      const matchPos = positionFilter === 'ALL' || t.position === positionFilter;
      const matchClub = clubFilter === 'ALL' || t.club.id === clubFilter;
      return matchSearch && matchPos && matchClub;
    });
  }, [search, positionFilter, clubFilter]);

  // Comparison Players
  const playerA = useMemo(() => TALENTS_DATA.find(p => p.id === comparePlayerAId) || TALENTS_DATA[0], [comparePlayerAId]);
  const playerB = useMemo(() => TALENTS_DATA.find(p => p.id === comparePlayerBId) || TALENTS_DATA[1], [comparePlayerBId]);

  return (
    <div className="bg-[#0A1A12] text-[#F3F4F6] min-h-screen pb-20 font-sans selection:bg-[#FCD116] selection:text-[#0A1A12]">
      {/* ── HEADER COVER STORY (The Athletic / FIFA style) ── */}
      <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-[#06120D] to-[#0A1A12] py-16 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.12),transparent_50%)] animate-pulse-live" />
        <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-4 mx-auto">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FCD116]/10 text-[#FCD116] border border-[#FCD116]/20 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Une de la Rédaction
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-white leading-tight">
              Nathan <span className="text-[#FCD116]">Douala</span> : Le Cerveau qui Affole l'Europe
            </h1>
            
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
              À seulement 17 ans, le joyau de Victoria United redéfinit l'art de la transition et de la créativité au Cameroun. Retour sur le prodige qui a ébloui la MTN Elite One et forcé les portes des Lions Indomptables.
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: clubs.vict.color }} />
                <span className="font-medium text-white">{clubs.vict.name}</span>
              </div>
              <div className="h-4 w-px bg-border/40" />
              <div>Position: <span className="font-semibold text-white">Milieu Créateur</span></div>
              <div className="h-4 w-px bg-border/40" />
              <div className="flex items-center gap-1.5">
                <span className="text-[#FCD116] font-bold">93</span> Potential Rating
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button 
                onClick={() => setSelectedPlayer(headlineStar)}
                className="px-6 py-3 bg-[#FCD116] hover:bg-[#ebd043] text-black font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(252,209,22,0.25)] flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="h-4 w-4" /> Rapport de Scouting
              </button>
              <button 
                onClick={() => {
                  setComparePlayerAId(headlineStar.id);
                  setIsCompareOpen(true);
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold uppercase tracking-wider text-xs rounded-xl border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeftRight className="h-4 w-4" /> Comparer le Joueur
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            {/* FIFA Rising Stars Style Card Frame */}
            <div className="relative w-72 sm:w-80 h-[430px] rounded-3xl bg-gradient-to-b from-[#183325] via-[#0E2319] to-[#06120D] border-2 border-[#FCD116]/40 p-5 shadow-2xl flex flex-col justify-between group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/10 rounded-full blur-2xl" />
              
              {/* Card Header Info */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="font-display text-4xl font-extrabold text-[#FCD116] leading-none">82</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">GEN</span>
                  
                  <span className="font-display text-2xl font-bold text-white leading-none mt-3">93</span>
                  <span className="text-[9px] text-[#FCD116] font-bold uppercase tracking-wider">POT</span>
                </div>
                
                <div className="flex flex-col items-end gap-1.5">
                  <div className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-[#FCD116]">
                    MOC
                  </div>
                  <span className="text-xl">🇨🇲</span>
                </div>
              </div>

              {/* Player Portrait Image */}
              <div className="relative flex-1 flex items-end justify-center overflow-hidden h-48 -mb-4">
                <img 
                  src={imgMap.yt1} 
                  alt="Nathan Douala" 
                  className="h-52 object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] z-10 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E2319] via-transparent to-transparent z-20" />
              </div>

              {/* Card Footer / Stats */}
              <div className="bg-black/45 rounded-2xl p-3 border border-white/5 relative z-30">
                <h3 className="font-display text-center text-lg font-bold text-white uppercase tracking-wide truncate">
                  Nathan Douala
                </h3>
                <p className="text-[9px] text-center text-[#10B981] uppercase font-bold tracking-widest mb-2.5">
                  Victoria United
                </p>

                {/* Grid Attributes */}
                <div className="grid grid-cols-6 gap-1 text-center border-t border-white/10 pt-2.5">
                  <div>
                    <div className="text-[10px] font-extrabold text-white">82</div>
                    <div className="text-[8px] text-gray-400 font-medium">VIT</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-white">76</div>
                    <div className="text-[8px] text-gray-400 font-medium">TIR</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-white">89</div>
                    <div className="text-[8px] text-gray-400 font-medium">PAS</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-white">87</div>
                    <div className="text-[8px] text-gray-400 font-medium">DRI</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-white">45</div>
                    <div className="text-[8px] text-gray-400 font-medium">DEF</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-white">60</div>
                    <div className="text-[8px] text-gray-400 font-medium">PHY</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <div className="container mt-12 space-y-12 px-4 mx-auto">
        {/* ── FILTER & DASHBOARD HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[#FCD116]">
              <Zap className="h-4 w-4 animate-pulse" />
              <span className="text-xs uppercase font-bold tracking-widest">Base de Données Pro</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold uppercase text-white tracking-tight">
              Scouting Database & Prospects
            </h2>
            <p className="text-gray-400 text-sm max-w-xl">
              Analysez, filtrez et comparez les joueurs de moins de 23 ans les plus cotés du championnat national.
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setIsCompareOpen(true)}
              className="px-4.5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs rounded-xl border border-white/10 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <ArrowLeftRight className="h-4 w-4 text-[#FCD116]" /> Outil de Comparaison
            </button>
          </div>
        </div>

        {/* ── FILTERS PANEL ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-[#0d2218] p-4.5 rounded-2xl border border-white/10">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un prospect..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#07140e] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#FCD116]/60 text-white transition-colors"
            />
          </div>

          {/* Position Filter */}
          <div className="relative">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value as any)}
              className="w-full pl-4 pr-8 py-2.5 bg-[#07140e] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#FCD116]/60 text-white transition-colors appearance-none"
            >
              <option value="ALL">Toutes les Positions</option>
              <option value="Milieu">Milieu de terrain</option>
              <option value="Attaquant">Attaquants</option>
              <option value="Défenseur">Défenseurs</option>
              <option value="Gardien">Gardiens de but</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Club Filter */}
          <div className="relative">
            <select
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
              className="w-full pl-4 pr-8 py-2.5 bg-[#07140e] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#FCD116]/60 text-white transition-colors appearance-none"
            >
              <option value="ALL">Tous les Clubs</option>
              {Object.values(clubs).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setSearch('');
              setPositionFilter('ALL');
              setClubFilter('ALL');
            }}
            disabled={search === '' && positionFilter === 'ALL' && clubFilter === 'ALL'}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase tracking-wider text-xs rounded-xl border border-white/10 transition-all cursor-pointer"
          >
            Réinitialiser les Filtres
          </button>
        </div>

        {/* ── TRENDING PROSPECTS CAROUSEL ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#CE1126]" />
              <h3 className="font-display text-lg font-bold uppercase text-white tracking-wide">Tendances &amp; Révélations</h3>
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{TALENTS_DATA.length} profils suivis</span>
          </div>
          <HorizCarousel>
            {TALENTS_DATA.map((talent) => (
              <button
                key={talent.id}
                onClick={() => setSelectedPlayer(talent)}
                style={{ scrollSnapAlign: 'start' }}
                className="group flex-shrink-0 w-48 bg-gradient-to-b from-[#0E2319] to-[#06120D] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-[#FCD116]/40 transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(252,209,22,0.12)] cursor-pointer text-left"
              >
                <div className="relative h-36 overflow-hidden bg-black/20">
                  <img src={imgMap[talent.imgKey] ?? imgMap.yt1} alt={talent.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E2319] via-[#0E2319]/20 to-transparent" />
                  <div className="absolute top-2 right-2">
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-[8px] font-black text-[#FCD116] border border-[#FCD116]/20">{talent.potential} POT</span>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: talent.club.color }} />
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <div className="text-[8px] text-gray-500 uppercase font-bold" style={{ color: talent.club.color }}>{talent.club.short}</div>
                  <div className="font-display text-sm font-bold text-white truncate group-hover:text-[#FCD116] transition-colors">{talent.name}</div>
                  <div className="flex gap-2 text-[9px] text-gray-400">
                    <span>{talent.age} ans</span>
                    <span>·</span>
                    <span>{talent.position}</span>
                  </div>
                  <div className="flex items-center gap-1 pt-1 border-t border-white/5">
                    <TrendingUp className="h-2.5 w-2.5 text-[#10B981]" />
                    <span className="text-[8px] text-[#10B981] font-bold">{talent.marketValue}</span>
                  </div>
                </div>
              </button>
            ))}
          </HorizCarousel>
        </div>

        {/* ── TALENT GRID ── */}
        {filteredTalents.length === 0 ? (
          <div className="text-center py-16 bg-[#0E2319]/30 rounded-2xl border border-dashed border-white/10">
            <Info className="h-10 w-10 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Aucun prospect ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTalents.map((talent, index) => (
              <motion.div
                key={talent.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="group relative bg-gradient-to-b from-[#0E2319] to-[#06120D] rounded-2xl border border-white/10 overflow-hidden transition-all hover:border-[#10B981]/40"
              >
                {/* Header Badge Row */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-black/40 border border-white/5 text-[9px] font-bold text-[#FCD116] uppercase">
                      {talent.positionDetail.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-gray-400">{talent.age} ans</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white">{talent.potential}</span>
                    <span className="text-[9px] text-[#FCD116] font-bold uppercase tracking-wide">POT</span>
                  </div>
                </div>

                {/* Player Main Info Box */}
                <div className="px-4 flex gap-4 items-center">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/30 border border-white/5 shrink-0">
                    <img 
                      src={imgMap[talent.imgKey] ?? imgMap.yt1} 
                      alt={talent.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-[#FCD116] transition-colors truncate">
                      {talent.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
                      <span 
                        className="inline-block w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: talent.club.color }}
                      />
                      <span className="truncate">{talent.club.name}</span>
                    </div>
                  </div>
                </div>

                {/* Stats quick view */}
                <div className="p-4 grid grid-cols-3 gap-2 text-center border-t border-b border-white/10 my-4 bg-black/20">
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest">Matchs</div>
                    <div className="text-sm font-bold text-white">{talent.stats.appearances}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest">{talent.position === 'Défenseur' ? 'Intercept' : 'Buts'}</div>
                    <div className="text-sm font-bold text-[#FCD116]">{talent.position === 'Défenseur' ? talent.stats.interceptions : talent.stats.goals}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest">Valeur</div>
                    <div className="text-sm font-bold text-white">{talent.marketValue}</div>
                  </div>
                </div>

                {/* Playing Style Summary */}
                <div className="px-4 pb-4">
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {talent.story}
                  </p>
                  
                  {/* Strengths tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {talent.strengths.slice(0, 3).map((st, i) => (
                      <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/10">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="p-3 border-t border-white/10 flex gap-2">
                  <button 
                    onClick={() => setSelectedPlayer(talent)}
                    className="flex-1 py-2 bg-white/5 hover:bg-[#FCD116] hover:text-black transition-all text-xs font-bold uppercase tracking-wider rounded-lg text-white cursor-pointer"
                  >
                    Scouting Report
                  </button>
                  <button 
                    onClick={() => {
                      if (comparePlayerAId === talent.id) return;
                      setComparePlayerBId(talent.id);
                      setIsCompareOpen(true);
                    }}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-colors cursor-pointer"
                    title="Comparer ce joueur"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                  </button>
                </div>

              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* ── COMPARISON PANEL DRAWER (Framer Motion) ── */}
      <AnimatePresence>
        {isCompareOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto"
          >
            <div className="container min-h-screen py-10 flex flex-col justify-center px-4 mx-auto">
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-[#0c2217] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-5xl w-full mx-auto relative shadow-2xl space-y-6"
              >
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#FCD116]/10 text-[#FCD116]">
                      <ArrowLeftRight className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-bold uppercase text-white">
                        Comparateur de Prospects
                      </h3>
                      <p className="text-gray-400 text-xs">
                        Comparez deux joueurs de la MTN Elite One côte à côte pour analyser leurs forces et faiblesses.
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsCompareOpen(false)}
                    className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Dropdowns Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Prospect A</label>
                    <div className="relative">
                      <select 
                        value={comparePlayerAId}
                        onChange={(e) => setComparePlayerAId(e.target.value)}
                        className="w-full pl-4 pr-8 py-2.5 bg-[#07140e] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#FCD116]/60 text-white transition-colors appearance-none"
                      >
                        {TALENTS_DATA.map(t => (
                          <option key={t.id} value={t.id} disabled={t.id === comparePlayerBId}>{t.name} ({t.club.short})</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Prospect B</label>
                    <div className="relative">
                      <select 
                        value={comparePlayerBId}
                        onChange={(e) => setComparePlayerBId(e.target.value)}
                        className="w-full pl-4 pr-8 py-2.5 bg-[#07140e] border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#FCD116]/60 text-white transition-colors appearance-none"
                      >
                        {TALENTS_DATA.map(t => (
                          <option key={t.id} value={t.id} disabled={t.id === comparePlayerAId}>{t.name} ({t.club.short})</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Comparison UI */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-start pt-4">
                  
                  {/* Prospect A */}
                  <div className="md:col-span-3 bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4 text-center">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden mx-auto bg-black/40 border border-white/15">
                      <img src={imgMap[playerA.imgKey] ?? imgMap.yt1} alt={playerA.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div>
                      <h4 className="font-display text-xl font-bold text-white">{playerA.name}</h4>
                      <p className="text-xs text-[#10B981] font-medium">{playerA.positionDetail}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-left border-t border-white/5 pt-4">
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase">Âge</div>
                        <div className="text-sm font-semibold text-white">{playerA.age} ans</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase">Club</div>
                        <div className="text-sm font-semibold text-white">{playerA.club.name}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase">Pied Préféré</div>
                        <div className="text-sm font-semibold text-white">{playerA.preferredFoot}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase">Market Value</div>
                        <div className="text-sm font-semibold text-[#FCD116]">{playerA.marketValue}</div>
                      </div>
                    </div>
                  </div>

                  {/* Attributes & Stats Comparison Bar chart */}
                  <div className="md:col-span-4 space-y-4 bg-black/10 p-5 rounded-2xl border border-white/5">
                    <h5 className="text-xs uppercase font-bold text-white tracking-widest border-b border-white/5 pb-2">
                      Attributs FIFA / Scouting
                    </h5>
                    
                    {/* Performance bars */}
                    {[
                      { key: 'pace', label: 'Vitesse / Pace' },
                      { key: 'shooting', label: 'Tir / Shooting' },
                      { key: 'passing', label: 'Passe / Passing' },
                      { key: 'dribbling', label: 'Dribble / Dribbling' },
                      { key: 'defending', label: 'Défense / Defending' },
                      { key: 'physical', label: 'Physique / Physicality' }
                    ].map((attr) => {
                      const valA = (playerA.attributes as any)[attr.key];
                      const valB = (playerB.attributes as any)[attr.key];
                      return (
                        <div key={attr.key} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold text-gray-300">
                            <span>{attr.label}</span>
                            <div className="flex gap-4">
                              <span className={valA >= valB ? 'text-[#FCD116] font-bold' : 'text-gray-400'}>{valA}</span>
                              <span className={valB >= valA ? 'text-[#10B981] font-bold' : 'text-gray-400'}>{valB}</span>
                            </div>
                          </div>
                          
                          {/* Progress double bar */}
                          <div className="h-2 bg-[#07140e] rounded-full overflow-hidden flex">
                            <div 
                              className="h-full bg-[#FCD116]" 
                              style={{ width: `${(valA / (valA + valB)) * 100}%` }}
                            />
                            <div 
                              className="h-full bg-[#10B981]" 
                              style={{ width: `${(valB / (valA + valB)) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    <h5 className="text-xs uppercase font-bold text-white tracking-widest border-b border-white/5 pb-2 pt-3">
                      Statistiques clés cette Saison
                    </h5>

                    <div className="grid grid-cols-2 gap-4 pt-2 text-sm text-gray-300">
                      <div className="space-y-1">
                        <div className="text-[10px] text-gray-400 uppercase">Buts / Matchs</div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#FCD116]">{playerA.stats.goals}</span> / <span className="font-bold text-[#10B981]">{playerB.stats.goals}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-gray-400 uppercase">Passes Décisives</div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#FCD116]">{playerA.stats.assists}</span> / <span className="font-bold text-[#10B981]">{playerB.stats.assists}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SCOUTING DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 15 }}
              className="bg-[#0b2015] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl space-y-6"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedPlayer(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start border-b border-white/10 pb-6">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                  <img src={imgMap[selectedPlayer.imgKey] ?? imgMap.yt1} alt={selectedPlayer.name} className="w-full h-full object-cover object-top" />
                </div>

                <div className="text-center sm:text-left space-y-2 min-w-0">
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2.5">
                    <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                      {selectedPlayer.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded bg-[#FCD116]/10 text-[#FCD116] border border-[#FCD116]/20 text-xs font-bold uppercase">
                      {selectedPlayer.positionDetail}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 max-w-xl font-light">
                    {selectedPlayer.story}
                  </p>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-gray-400">
                    <div>Club : <span className="text-white font-medium">{selectedPlayer.club.name}</span></div>
                    <div>Valeur de marché : <span className="text-[#FCD116] font-bold">{selectedPlayer.marketValue}</span></div>
                    <div>Taille : <span className="text-white font-medium">{selectedPlayer.height}</span></div>
                    <div>Poids : <span className="text-white font-medium">{selectedPlayer.weight}</span></div>
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                
                {/* Attributes and Progression */}
                <div className="md:col-span-7 space-y-6">
                  {/* Playing style */}
                  <div className="space-y-2 bg-black/20 p-4.5 rounded-2xl border border-white/5">
                    <h4 className="text-xs uppercase font-extrabold text-white tracking-widest flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[#FCD116]" /> Description Tactique
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-light">
                      {selectedPlayer.playingStyle}
                    </p>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#10B981]/5 p-4 rounded-xl border border-[#10B981]/10 space-y-2">
                      <div className="text-[10px] text-[#10B981] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Points Forts
                      </div>
                      <ul className="text-xs space-y-1 text-gray-300">
                        {selectedPlayer.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <span className="text-[#10B981]">•</span> {str}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-destructive/5 p-4 rounded-xl border border-destructive/10 space-y-2">
                      <div className="text-[10px] text-destructive font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" /> Axes d'amélioration
                      </div>
                      <ul className="text-xs space-y-1 text-gray-300">
                        {selectedPlayer.weaknesses.map((weak, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <span className="text-destructive">•</span> {weak}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Scout Report */}
                  <div className="space-y-2 bg-[#0d2218]/40 p-4.5 rounded-2xl border border-white/10">
                    <h4 className="text-xs uppercase font-extrabold text-[#FCD116] tracking-widest flex items-center gap-2">
                      <Award className="h-4 w-4" /> Rapport d'Observation Officiel
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-light italic">
                      &ldquo;{selectedPlayer.scoutReport}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Stat details / Progression */}
                <div className="md:col-span-5 space-y-6">
                  {/* Detailed Performance Statistics */}
                  <div className="bg-black/35 p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-xs uppercase font-extrabold text-white tracking-widest flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-[#FCD116]" /> Statistiques de la Saison
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="bg-white/5 p-2.5 rounded-lg">
                        <span className="text-gray-400 block">Matchs joués</span>
                        <span className="text-lg font-bold text-white">{selectedPlayer.stats.appearances}</span>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-lg">
                        <span className="text-gray-400 block">Minutes</span>
                        <span className="text-lg font-bold text-white">{selectedPlayer.stats.minutesPlayed}</span>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-lg">
                        <span className="text-gray-400 block">Buts (xG)</span>
                        <span className="text-lg font-bold text-white">{selectedPlayer.stats.goals} <span className="text-[10px] text-gray-400 font-normal">({selectedPlayer.stats.xg})</span></span>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-lg">
                        <span className="text-gray-400 block">Passes d. (xA)</span>
                        <span className="text-lg font-bold text-white">{selectedPlayer.stats.assists} <span className="text-[10px] text-gray-400 font-normal">({selectedPlayer.stats.xa})</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase font-extrabold text-white tracking-widest">
                      Palmarès & Distinctions
                    </h4>
                    <ul className="text-xs space-y-2 text-gray-300">
                      {selectedPlayer.achievements.map((ach, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                          <Trophy className="h-3.5 w-3.5 text-[#FCD116] shrink-0 mt-0.5" />
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Progression History */}
                  <div className="bg-black/20 p-4.5 rounded-xl border border-white/5 space-y-2">
                    <h4 className="text-xs uppercase font-extrabold text-white tracking-widest">
                      Progression de la note
                    </h4>
                    <div className="flex justify-between items-center pt-2">
                      {selectedPlayer.progression.map((prog, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-[10px] text-gray-400">{prog.year}</div>
                          <div className="text-sm font-bold text-white">{prog.rating}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
