import { clubs } from '@/components/elite/data';
import type { PlayerStat, Club } from '@/types/football.types';
import type {
  PlayerProfile, PlayerProfileExtra, CareerTimelineEntry, CareerSeasonRow,
  AchievementEntry, MarketValuePoint, PerformanceTrendPoint, GalleryImage,
} from '@/types/playerProfile.types';
import type { TransferRecord, InjuryRecord, TransferKind, InjurySeverity, InjuryStatus, InjuryBodyPart } from '@/types/transfersInjuries.types';

import action1 from '@/assets/images/actions/img1.png';
import action2 from '@/assets/images/actions/img2.png';
import action3 from '@/assets/images/actions/img3.png';
import action4 from '@/assets/images/actions/img4.png';
import action5 from '@/assets/images/actions/img5.png';
import action6 from '@/assets/images/actions/img6.png';
import action7 from '@/assets/images/actions/img7.png';
import action8 from '@/assets/images/actions/img8.png';
import playerWide1 from '@/assets/player-1.jpg';
import playerWide2 from '@/assets/player-2.jpg';
import playerWide3 from '@/assets/player-3.jpg';

const ACTION_SHOTS = [action1, action2, action3, action4, action5, action6, action7, action8];
const WIDE_SHOTS = [playerWide1, playerWide2, playerWide3];

// ─── Deterministic PRNG — same playerId always yields the same "random" profile ──
function hashSeed(str: string | undefined | null): number {
  if (!str) return 0;
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CLUB_LIST: Club[] = Object.values(clubs);
const BIRTHPLACES = ['Douala', 'Yaoundé', 'Garoua', 'Bafoussam', 'Bamenda', 'Limbe', 'Maroua', 'Ebolowa', 'Kribi', 'Ngaoundéré'];
const AGENTS = ['Franck Belibi Management', 'Elite Sports Agency', 'Pan-African Football Partners', 'Lions Sport Group', 'Continental Talents'];
const COMPETITIONS_HONOUR = ['MTN Elite One', 'Coupe du Cameroun', 'CAN Total Énergies', 'Ligue des Champions CAF', 'Coupe de la Confédération CAF'];

function pick<T>(rng: () => number, arr: T[]): T { return arr[Math.floor(rng() * arr.length) % arr.length]; }
const ICON_POOL: AchievementEntry['icon'][] = ['trophy', 'medal', 'star', 'award', 'shield', 'crown'];
function pickIcon(rng: () => number): AchievementEntry['icon'] {
  return pick(rng, ICON_POOL);
}

// ─── Hand-authored profiles for marquee players (richer editorial voice) ────────
const CURATED: Record<string, Partial<PlayerProfileExtra>> = {
  p1: {
    nickname: 'Le Chat',
    bio: "Formé dans les gravats du quartier Nkoldongo à Yaoundé, Christian Bassogog s'est imposé comme l'un des ailiers les plus imprévisibles du championnat. Sa capacité à casser les lignes en un contre un et sa vista sur les transitions rapides en ont fait un cauchemar pour les arrière-latéraux de l'Elite One. Passé par des sélections nationales de jeunes, il porte aujourd'hui l'étiquette de leader technique sur son flanc.",
    heightCm: 168, weightKg: 63, preferredFoot: 'Droit', jerseyNumber: 11,
  },
  p2: {
    nickname: 'Le Métronome',
    bio: "Milieu relayeur devenu numéro neuf de complément, Marou Ibrahim a bâti sa réputation sur l'efficacité pure : peu de touches de balle inutiles, beaucoup de buts décisifs. Son sens du timing dans la surface et sa lecture des courses en profondeur en font une valeur sûre pour les entraîneurs en quête de garanties devant le but.",
    heightCm: 179, weightKg: 74, preferredFoot: 'Gauche', jerseyNumber: 9,
  },
};

function buildBio(p: PlayerStat, rng: () => number): string {
  const posLabel = p.position === 'GK' ? 'gardien de but' : p.position === 'DF' ? 'défenseur' : p.position === 'MF' ? 'milieu de terrain' : 'attaquant';
  const trait = pick(rng, [
    'un sens du placement rare pour son âge',
    'une lecture du jeu qui impressionne les recruteurs',
    'une régularité impressionnante match après match',
    'un volume de course qui tire toute son équipe vers le haut',
    'une palette technique complète, rare à ce niveau',
  ]);
  const origin = pick(rng, BIRTHPLACES);
  return `Natif de ${origin}, ${p.playerName} s'est révélé au grand public sous les couleurs de ${p.clubName}. ${posLabel.charAt(0).toUpperCase() + posLabel.slice(1)} au profil moderne, il se distingue par ${trait}. Sa progression constante depuis ses débuts en MTN Elite One en fait aujourd'hui l'un des noms les plus suivis de la ligue, aussi bien par les observateurs locaux que par les recruteurs à l'affût de la prochaine pépite camerounaise.`;
}

function buildMarketValueHistory(base: number, rng: () => number): MarketValuePoint[] {
  const months = ['Jan 25', 'Mar 25', 'Mai 25', 'Jul 25', 'Sep 25', 'Nov 25', 'Jan 26', 'Mar 26', 'Jun 26'];
  let value = base * 0.6;
  return months.map((label, i) => {
    const growth = 1 + (rng() * 0.14 - 0.02) + (i / months.length) * 0.05;
    value = Math.max(5_000_000, value * growth);
    return { date: `2025-${String((i % 12) + 1).padStart(2, '0')}-01`, label, valueFcfa: Math.round(value / 500_000) * 500_000 };
  }).map((pt, i, arr) => i === arr.length - 1 ? { ...pt, valueFcfa: base } : pt);
}

function buildPerformanceTrend(p: PlayerStat, rng: () => number): PerformanceTrendPoint[] {
  const opponents = CLUB_LIST.filter(c => c.id !== p.clubId);
  const n = 8;
  const out: PerformanceTrendPoint[] = [];
  for (let i = n; i >= 1; i--) {
    const opp = pick(rng, opponents);
    const goals = rng() < (p.position === 'FW' ? 0.42 : p.position === 'MF' ? 0.2 : 0.05) ? 1 + (rng() < 0.15 ? 1 : 0) : 0;
    const assists = rng() < (p.position === 'MF' ? 0.28 : 0.14) ? 1 : 0;
    const rating = Math.min(9.6, Math.max(5.2, 6.4 + goals * 1.1 + assists * 0.7 + (rng() * 1.6 - 0.8)));
    out.push({
      matchLabel: `J${38 - i}`,
      opponent: opp.short,
      date: `2026-${String(((i * 3) % 12) + 1).padStart(2, '0')}-${String(10 + (i % 15)).padStart(2, '0')}`,
      rating: Math.round(rating * 10) / 10,
      goals, assists,
      minutes: rng() < 0.12 ? Math.round(45 + rng() * 30) : 90,
    });
  }
  return out;
}

function buildCareerTimeline(p: PlayerStat, rng: () => number): CareerTimelineEntry[] {
  const entries: CareerTimelineEntry[] = [];
  const debutYear = 2026 - (p.age ? Math.max(p.age - 17, 3) : 6);
  const formerClub = pick(rng, CLUB_LIST.filter(c => c.id !== p.clubId));

  entries.push({
    id: `${p.playerId}-tl-1`, date: `${debutYear}-08-14`, season: `${debutYear}-${String(debutYear + 1).slice(-2)}`,
    type: 'academy', club: formerClub,
    title: `Formation au centre de ${formerClub.name}`,
    description: `${p.playerName} intègre le centre de formation de ${formerClub.name} et gravit rapidement les échelons des sélections jeunes.`,
  });

  entries.push({
    id: `${p.playerId}-tl-2`, date: `${debutYear + 1}-03-02`, season: `${debutYear + 1}-${String(debutYear + 2).slice(-2)}`,
    type: 'debut', club: formerClub,
    title: 'Premiers pas en professionnel',
    description: `Titularisé pour la première fois en MTN Elite One, il confirme immédiatement le potentiel entrevu en équipes de jeunes.`,
    statLabel: 'Débuts', statValue: `vs ${pick(rng, CLUB_LIST).short}`,
  });

  if (formerClub.id !== p.clubId) {
    const destClub = CLUB_LIST.find(c => c.id === p.clubId);
    entries.push({
      id: `${p.playerId}-tl-3`, date: `${debutYear + 3}-07-01`, season: `${debutYear + 3}-${String(debutYear + 4).slice(-2)}`,
      type: 'transfer', club: destClub,
      title: `Transfert vers ${p.clubName}`,
      description: `Après s'être révélé à ${formerClub.name}, ${p.playerName} rejoint ${p.clubName} pour poursuivre sa progression au plus haut niveau national.`,
      statLabel: 'Nouveau club', statValue: p.clubShort ?? p.clubName,
    });
  }

  if (p.goals >= 8) {
    entries.push({
      id: `${p.playerId}-tl-4`, date: '2026-02-18', season: '2025-26',
      type: 'milestone',
      title: 'Cap symbolique franchi',
      description: `${p.playerName} inscrit son ${p.goals}e but de la saison, confirmant son statut de référence offensive du championnat.`,
      statLabel: 'Buts saison', statValue: String(p.goals),
    });
  }

  entries.push({
    id: `${p.playerId}-tl-5`, date: '2026-05-30', season: '2025-26',
    type: 'honour',
    title: 'Distinction individuelle',
    description: `Sélectionné dans l'équipe-type de la journée à plusieurs reprises cette saison pour la régularité de ses performances.`,
  });

  if (rng() > 0.55) {
    entries.push({
      id: `${p.playerId}-tl-6`, date: '2025-11-16', season: '2025-26',
      type: 'international',
      title: 'Appel en sélection nationale',
      description: `Convoqué avec les Lions Indomptables pour préparer les prochaines échéances internationales, une reconnaissance de son excellente saison en club.`,
    });
  }

  return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function buildCareerSeasons(p: PlayerStat, rng: () => number): CareerSeasonRow[] {
  const seasons = ['2022-23', '2023-24', '2024-25', '2025-26'];
  const formerClub = pick(rng, CLUB_LIST.filter(c => c.id !== p.clubId));
  return seasons.map((season, i) => {
    const isCurrent = i === seasons.length - 1;
    const club = isCurrent ? (CLUB_LIST.find(c => c.id === p.clubId) ?? formerClub) : (i < 1 ? formerClub : (CLUB_LIST.find(c => c.id === p.clubId) ?? formerClub));
    const scale = isCurrent ? 1 : 0.55 + i * 0.18;
    return {
      season, club, competition: 'MTN Elite One',
      appearances: isCurrent ? p.appearances : Math.max(3, Math.round(p.appearances * scale * (0.7 + rng() * 0.5))),
      goals: isCurrent ? p.goals : Math.round(p.goals * scale * (0.5 + rng() * 0.7)),
      assists: isCurrent ? p.assists : Math.round(p.assists * scale * (0.5 + rng() * 0.7)),
      minutes: isCurrent ? p.minutesPlayed : Math.round(p.minutesPlayed * scale * (0.7 + rng() * 0.4)),
      yellowCards: Math.round(1 + rng() * 5),
      redCards: rng() > 0.85 ? 1 : 0,
    };
  });
}

function buildAchievements(p: PlayerStat, rng: () => number): AchievementEntry[] {
  const out: AchievementEntry[] = [];
  const count = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < count; i++) {
    const competition = pick(rng, COMPETITIONS_HONOUR);
    const level: AchievementEntry['level'] = competition.includes('CAN') ? 'international'
      : competition.includes('CAF') ? 'continental'
      : competition.includes('Coupe du Cameroun') ? 'national' : 'club';
    out.push({
      id: `${p.playerId}-ach-${i}`,
      title: i === 0 && p.goals >= 10 ? 'Meilleur buteur de la saison' : i === 1 ? "Membre de l'équipe-type de la saison" : pick(rng, ['Vainqueur', 'Finaliste', "Joueur du mois"]) + ` — ${competition}`,
      competition,
      season: pick(rng, ['2023-24', '2024-25', '2025-26']),
      level,
      icon: pickIcon(rng),
    });
  }
  return out;
}

function buildGallery(p: PlayerStat, rng: () => number): GalleryImage[] {
  const shots = [...ACTION_SHOTS].sort(() => rng() - 0.5).slice(0, 5);
  const captions = [
    `${p.playerName} lors d'une action décisive face à ${pick(rng, CLUB_LIST).name}`,
    `Célébration après un but important en MTN Elite One`,
    `Séance d'entraînement avec ${p.clubName}`,
    `Duel aérien en zone défensive`,
    `${p.playerName} félicité par ses coéquipiers`,
    `Portrait avant le coup d'envoi`,
  ];
  const images: GalleryImage[] = shots.map((url, i) => ({ id: `${p.playerId}-g${i}`, url, caption: captions[i % captions.length] }));
  images.unshift({ id: `${p.playerId}-g-wide`, url: pick(rng, WIDE_SHOTS), caption: `${p.playerName} — portrait officiel ${p.clubName}` });
  return images;
}

const STRENGTH_TAGS_POOL: Record<string, string[]> = {
  FW: ['Finition', 'Course dans le dos', 'Sang-froid', 'Percussion balle au pied', 'Jeu dos au but'],
  MF: ['Vision de jeu', 'Récupération', 'Passe verticale', 'Endurance', 'Pressing'],
  DF: ['Duels aériens', 'Anticipation', 'Relance', 'Placement', 'Tacles décisifs'],
  GK: ['Réflexes', 'Jeu au pied', 'Sorties aériennes', 'Communication', 'Face-à-face'],
};
const WEAKNESS_TAGS_POOL: Record<string, string[]> = {
  FW: ['Jeu de tête', 'Repli défensif'],
  MF: ['Impact physique', 'Finition'],
  DF: ['Vitesse pure', 'Un contre un'],
  GK: ['Jeu long', 'Sorties excentrées'],
};

function buildStrengths(p: PlayerStat, rng: () => number) {
  const base = p.position === 'FW'
    ? { Finition: 88, Vitesse: 82, Dribble: 80, Physique: 68, Passe: 62, Défense: 30 }
    : p.position === 'MF'
    ? { Passe: 85, Vision: 80, Endurance: 78, Tacle: 62, Tir: 58, Dribble: 70 }
    : p.position === 'DF'
    ? { Tacle: 87, Duels: 84, Anticipation: 78, Relance: 66, Physique: 80, Vitesse: 60 }
    : { Réflexes: 86, Sorties: 78, JeuAuPied: 64, Placement: 82, Communication: 74, Plongeon: 80 };

  const strengths = Object.entries(base).map(([label, val]) => ({
    label, value: Math.min(99, Math.max(35, Math.round(val + (rng() * 14 - 7)))),
  }));
  const tags = [...STRENGTH_TAGS_POOL[p.position] ?? STRENGTH_TAGS_POOL.MF].sort(() => rng() - 0.5).slice(0, 3);
  const weak = [...(WEAKNESS_TAGS_POOL[p.position] ?? WEAKNESS_TAGS_POOL.MF)];
  return { strengths, strengthTags: tags, weaknessTags: weak };
}

const BODY_PARTS: InjuryBodyPart[] = ['Cheville', 'Genou', 'Ischio-jambier', 'Mollet', 'Cuisse', 'Épaule', 'Dos', 'Pied'];
const DIAGNOSES: Record<InjuryBodyPart, string> = {
  'Cheville': 'Entorse de la cheville', 'Genou': 'Lésion ligamentaire au genou',
  'Ischio-jambier': "Élongation de l'ischio-jambier", 'Mollet': 'Déchirure au mollet',
  'Cuisse': 'Contracture à la cuisse', 'Épaule': "Gêne à l'épaule", 'Dos': 'Lombalgie',
  'Pied': 'Fracture de fatigue au pied', 'Commotion': 'Commotion cérébrale', 'Autre': 'Blessure diverse',
};

function buildInjuryHistory(p: PlayerStat, rng: () => number): InjuryRecord[] {
  const club = CLUB_LIST.find(c => c.id === p.clubId) ?? CLUB_LIST[0];
  const count = 1 + Math.floor(rng() * 3);
  const out: InjuryRecord[] = [];
  for (let i = 0; i < count; i++) {
    const bodyPart = pick(rng, BODY_PARTS);
    const severity: InjurySeverity = pick(rng, ['MINOR', 'MINOR', 'MODERATE', 'SEVERE'] as InjurySeverity[]);
    const isLatest = i === 0;
    const status: InjuryStatus = isLatest ? pick(rng, ['CLEARED', 'CLEARED', 'RECOVERING'] as InjuryStatus[]) : 'CLEARED';
    const monthsAgo = 3 + i * 5 + Math.floor(rng() * 4);
    const injuredAt = new Date(2026, 5 - monthsAgo, 1 + Math.floor(rng() * 26)).toISOString().slice(0, 10);
    const gamesMissed = severity === 'SEVERE' ? 8 + Math.floor(rng() * 10) : severity === 'MODERATE' ? 3 + Math.floor(rng() * 5) : 1 + Math.floor(rng() * 2);
    out.push({
      id: `${p.playerId}-inj-${i}`, playerId: p.playerId, playerName: p.playerName, playerPhotoUrl: p.photoUrl,
      position: p.position === 'ALL' ? 'MF' : p.position, club, bodyPart, diagnosis: DIAGNOSES[bodyPart],
      severity, status, injuredAt,
      expectedReturn: status !== 'CLEARED' ? new Date(2026, 6, 15).toISOString().slice(0, 10) : undefined,
      gamesMissed, medicalNotes: 'Suivi effectué par le staff médical du club, reprise encadrée à l\'entraînement.',
      updatedAt: injuredAt,
    });
  }
  return out;
}

function buildTransferHistory(p: PlayerStat, rng: () => number, timeline: CareerTimelineEntry[]): TransferRecord[] {
  const club = CLUB_LIST.find(c => c.id === p.clubId) ?? CLUB_LIST[0];
  const transferEvent = timeline.find(t => t.type === 'transfer');
  const fromClub = pick(rng, CLUB_LIST.filter(c => c.id !== p.clubId));
  const kind: TransferKind = pick(rng, ['PERMANENT', 'PERMANENT', 'LOAN', 'FREE'] as TransferKind[]);
  const fee = kind === 'FREE' ? undefined : Math.round((8_000_000 + rng() * 40_000_000) / 1_000_000) * 1_000_000;
  return [{
    id: `${p.playerId}-trf-1`, playerId: p.playerId, playerName: p.playerName, playerPhotoUrl: p.photoUrl,
    position: p.position === 'ALL' ? 'MF' : p.position, age: (p.age ?? 22) - 3,
    fromClub, toClub: club, kind, stage: 'CONFIRMED', confidence: 5, fee,
    windowLabel: 'Été ' + (transferEvent?.season ?? '2023-24'),
    transferDate: transferEvent?.date ?? '2023-07-01',
    announced: true, source: 'Officiel',
    quote: `${p.playerName} rejoint ${club.name} avec l'ambition de franchir un nouveau cap dans sa carrière.`,
  }];
}


/** Cheap accessor for listing pages — avoids building the full profile (timeline, gallery, etc.) per card. */
export function getQuickMeta(p: PlayerStat): { jerseyNumber: number; nickname?: string } {
  const pid = p.playerId ?? String((p as any).id ?? '');
  const rng = mulberry32(hashSeed(pid));
  const curated = CURATED[pid];
  return {
    jerseyNumber: curated?.jerseyNumber ?? (1 + Math.floor(rng() * 29)),
    nickname: curated?.nickname,
  };
}

export function getPlayerProfile(p: PlayerStat): PlayerProfile {
  const rng = mulberry32(hashSeed(p.playerId));
  const curated = CURATED[p.playerId];

  const marketBase = Math.round(
    (10_000_000 + p.goals * 3_500_000 + p.assists * 1_800_000 + (p.appearances * 400_000)) * (0.85 + rng() * 0.5),
  );

  const { strengths, strengthTags, weaknessTags } = buildStrengths(p, rng);
  const careerTimeline = buildCareerTimeline(p, rng);

  const extra: PlayerProfileExtra = {
    nickname: curated?.nickname,
    bio: curated?.bio ?? buildBio(p, rng),
    birthDate: p.age ? `${2026 - p.age}-${String(1 + Math.floor(rng() * 12)).padStart(2, '0')}-${String(1 + Math.floor(rng() * 27)).padStart(2, '0')}` : undefined,
    birthPlace: pick(rng, BIRTHPLACES),
    heightCm: curated?.heightCm ?? Math.round(168 + rng() * 22),
    weightKg: curated?.weightKg ?? Math.round(62 + rng() * 20),
    preferredFoot: curated?.preferredFoot ?? pick(rng, ['Droit', 'Droit', 'Gauche', 'Ambidextre'] as PlayerProfileExtra['preferredFoot'][]),
    jerseyNumber: curated?.jerseyNumber ?? (1 + Math.floor(rng() * 29)),
    contractExpiry: `${2027 + Math.floor(rng() * 3)}-06-30`,
    agentName: rng() > 0.3 ? pick(rng, AGENTS) : undefined,
    formerClubs: [pick(rng, CLUB_LIST.filter(c => c.id !== p.clubId)).name],
    secondNationality: rng() > 0.85 ? 'France' : undefined,
    marketValueFcfa: marketBase,
    marketValueHistory: buildMarketValueHistory(marketBase, rng),
    careerTimeline,
    careerSeasons: buildCareerSeasons(p, rng),
    achievements: buildAchievements(p, rng),
    strengths, strengthTags, weaknessTags,
    performanceTrend: buildPerformanceTrend(p, rng),
    gallery: buildGallery(p, rng),
    sinceClubDate: `${2026 - (1 + Math.floor(rng() * 4))}-07-01`,
    transferHistory: buildTransferHistory(p, rng, careerTimeline),
    injuryHistory: buildInjuryHistory(p, rng),
  };

  return { ...p, ...extra };
}

export function formatFcfa(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)} M FCFA`;
  return `${Math.round(value / 1000)} K FCFA`;
}

export const POSITION_LABEL: Record<string, string> = {
  GK: 'Gardien de but', DF: 'Défenseur', MF: 'Milieu de terrain', FW: 'Attaquant', ALL: 'Joueur',
};
