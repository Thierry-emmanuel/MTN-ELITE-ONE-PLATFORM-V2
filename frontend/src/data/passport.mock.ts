import { clubs } from '@/components/elite/data';
import type { PlayerProfile } from '@/types/playerProfile.types';
import type {
  PassportStamp, StampCategory, StampTier, CareerChapter, RoadToLionsEvent,
  MemoryObject, CareerDna, PassportData,
} from '@/types/passport.types';

import action1 from '@/assets/images/actions/img1.png';
import action2 from '@/assets/images/actions/img2.png';
import action3 from '@/assets/images/actions/img3.png';
import action4 from '@/assets/images/actions/img4.png';
import action5 from '@/assets/images/actions/img5.png';
import action6 from '@/assets/images/actions/img6.png';
import action7 from '@/assets/images/actions/img7.png';
import action8 from '@/assets/images/actions/img8.png';

const CHAPTER_SHOTS = [action1, action2, action3, action4, action5, action6, action7, action8];

// ─── Deterministic PRNG — same seed as playerProfile.mock so a given player is stable ──
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
function pick<T>(rng: () => number, arr: T[]): T { return arr[Math.floor(rng() * arr.length) % arr.length]; }

const CLUB_LIST = Object.values(clubs);

// ─── Stamps ─────────────────────────────────────────────────────────────────
function buildStamps(p: PlayerProfile, rng: () => number): PassportStamp[] {
  const stamps: PassportStamp[] = [];
  let n = 0;
  const push = (title: string, category: StampCategory, tier: StampTier, date: string | undefined, story: string, unlocked: boolean, competition?: string) => {
    stamps.push({ id: `${p.playerId}-stamp-${n++}`, title, category, tier, date, story, unlocked, competition, club: unlocked ? clubs[p.clubId] : undefined });
  };

  const debutYear = 2026 - (p.age ? Math.max(p.age - 17, 3) : 6);

  push('Diplômé du Centre de Formation', 'formation', 'bronze', `${debutYear - 1}-08-01`,
    `${p.playerName} termine sa formation et signe son premier contrat professionnel, récompense de plusieurs années de travail assidu dans les catégories de jeunes.`, true);

  push('Débuts Professionnels', 'debut', 'silver', `${debutYear}-03-02`,
    `Première apparition officielle en MTN Elite One, sous les couleurs de ${p.formerClubs?.[0] ?? p.clubName}. Un rêve d'enfant devenu réalité devant son public.`, true);

  push(p.goals > 0 ? 'Premier But en Professionnel' : 'Premier Match Complet', 'debut', 'silver', `${debutYear}-09-14`,
    p.goals > 0
      ? `Une frappe qui restera gravée : ${p.playerName} inscrit son tout premier but professionnel, lançant une carrière offensive prometteuse.`
      : `${p.playerName} dispute son premier match complet, confirmant sa capacité à tenir le rythme de l'élite nationale.`, true);

  push('Transfert Marquant', 'club', 'silver', p.sinceClubDate,
    `${p.playerName} rejoint ${p.clubName}, un tournant décisif qui va accélérer sa progression au plus haut niveau.`, true, 'MTN Elite One');

  push('Titularisation Confirmée', 'club', 'silver', '2024-10-05',
    `Devenu un titulaire indiscutable dans le système de son entraîneur, ${p.playerName} enchaîne les performances solides saison après saison.`, true);

  const hundredCaps = p.appearances >= 60;
  push('100 Matchs Officiels', 'record', hundredCaps ? 'gold' : 'gold', hundredCaps ? '2025-11-22' : undefined,
    `Franchir la barre symbolique des 100 matchs officiels est la preuve d'une régularité rare à ce niveau de compétition.`, hundredCaps);

  const fiftyGoals = p.goals >= 15 && (p.position === 'FW' || p.position === 'MF');
  push('50 Buts en Carrière', 'record', 'gold', fiftyGoals ? '2026-01-18' : undefined,
    `Un cap symbolique pour tout attaquant : 50 réalisations en carrière professionnelle, un vrai statut de finisseur.`, fiftyGoals);

  const teamOfWeek = p.achievements.length > 0;
  push('Équipe-Type de la Journée', 'individual', 'silver', teamOfWeek ? '2025-12-14' : undefined,
    `Une prestation majuscule qui vaut à ${p.playerName} une place dans l'équipe-type de la journée, saluée par les observateurs du championnat.`, teamOfWeek);

  const playerOfMonth = p.goals + p.assists >= 12;
  push('Joueur du Mois', 'individual', 'gold', playerOfMonth ? '2026-02-01' : undefined,
    `Récompensé pour la régularité et l'impact de ses performances sur un mois entier, ${p.playerName} confirme son statut de joueur clé.`, playerOfMonth);

  const breakthrough = (p.age ?? 25) <= 23;
  push('Saison Révélation', 'individual', 'gold', breakthrough ? '2025-05-25' : undefined,
    `Une saison qui change une carrière : ${p.playerName} s'impose comme l'une des révélations de la MTN Elite One.`, breakthrough);

  const youngTalent = (p.age ?? 25) <= 21;
  push('Jeune Talent à Suivre', 'individual', 'silver', youngTalent ? `${debutYear + 1}-06-10` : undefined,
    `Identifié par les recruteurs et les observateurs comme l'un des espoirs les plus prometteurs du football camerounais.`, youngTalent);

  const roadToLions = rng() > 0.4 || p.goals + p.assists >= 10;
  push('Route vers les Lions', 'national', 'gold', roadToLions ? '2025-10-02' : undefined,
    `Sa progression constante en club attire l'attention du staff des Lions Indomptables, qui suit désormais son évolution de près.`, roadToLions);

  const callup = roadToLions && rng() > 0.35;
  push('Premier Appel en Sélection Nationale', 'national', 'gold', callup ? '2025-11-16' : undefined,
    `Convoqué pour la première fois avec les Lions Indomptables — la consécration d'années d'efforts et de sacrifices.`, callup);

  const cap = callup && rng() > 0.4;
  push('Première Sélection Internationale', 'national', 'legendary', cap ? '2025-11-19' : undefined,
    `Entré en jeu lors d'un match officiel, ${p.playerName} honore sa première cape internationale sous le maillot des Lions Indomptables.`, cap);

  const intGoal = cap && rng() > 0.55;
  push('Premier But International', 'national', 'legendary', intGoal ? '2026-03-24' : undefined,
    `Un moment inoubliable : ${p.playerName} trouve le chemin des filets pour la toute première fois sous les couleurs nationales.`, intGoal);

  const afcon = cap && rng() > 0.6;
  push('Participation à la CAN', 'continental', 'legendary', afcon ? '2026-01-10' : undefined,
    `Sélectionné pour disputer la Coupe d'Afrique des Nations, ${p.playerName} porte les couleurs du Cameroun sur la plus grande scène continentale.`, afcon);

  const champion = p.achievements.some(a => a.level === 'club' || a.level === 'national');
  push('Champion du Cameroun', 'club', 'legendary', champion ? '2025-05-30' : undefined,
    `Sacré champion du Cameroun avec ${p.clubName}, l'un des sommets d'une carrière collective.`, champion);

  const captain = (p.age ?? 25) >= 26 && rng() > 0.5;
  push('Brassard de Capitaine', 'individual', 'gold', captain ? '2025-08-16' : undefined,
    `Désigné capitaine par son entraîneur, ${p.playerName} devient le leader et la voix de son vestiaire.`, captain);

  push('Légende du Championnat', 'legacy', 'legendary', undefined,
    `Réservé aux plus grands noms de l'histoire de la MTN Elite One — un statut qui se construit sur toute une carrière.`, false);

  return stamps;
}

// ─── Career chapters ──────────────────────────────────────────────────────────
function buildChapters(p: PlayerProfile, rng: () => number): CareerChapter[] {
  const shots = [...CHAPTER_SHOTS].sort(() => rng() - 0.5);
  const debutClub = p.formerClubs?.[0] ?? p.clubName;
  return [
    {
      id: `${p.playerId}-ch-1`, numeral: 'I', title: 'Le Rêve', theme: 'Formation, famille, football de quartier',
      years: `${2026 - ((p.age ?? 24) + 8)} – ${2026 - ((p.age ?? 24) - 2)}`,
      narrative: `Avant les projecteurs de la MTN Elite One, il y a un terrain poussiéreux à ${p.birthPlace}, un ballon usé et une famille qui croit au rêve. ${p.playerName} apprend le jeu dans la rue avant de rejoindre le centre de formation qui va structurer son talent brut.`,
      quote: `Je jouais pieds nus derrière la maison, je ne pensais qu'à une chose : porter un maillot un jour.`,
      quoteAuthor: p.playerName,
      image: shots[0], stats: [{ label: 'Âge au premier contrat', value: `${Math.max(15, (p.age ?? 24) - 8)} ans` }, { label: 'Ville natale', value: p.birthPlace ?? '—' }],
    },
    {
      id: `${p.playerId}-ch-2`, numeral: 'II', title: "L'Ascension", theme: 'Débuts professionnels, premier but, révélation',
      years: `${2026 - ((p.age ?? 24) - 2)} – ${2026 - ((p.age ?? 24) - 5)}`,
      narrative: `Les débuts avec ${debutClub} ne sont pas toujours simples, mais la constance paie. Le premier but professionnel, la première titularisation, les premiers doutes surmontés : chaque match est une brique de plus dans la construction d'un joueur d'élite.`,
      quote: `Ce premier but, je ne l'oublierai jamais. C'est là que j'ai su que j'avais ma place ici.`,
      quoteAuthor: p.playerName,
      image: shots[1], stats: [{ label: 'Premier club pro', value: debutClub }, { label: 'Position', value: p.position }],
    },
    {
      id: `${p.playerId}-ch-3`, numeral: 'III', title: 'La Reconnaissance', theme: 'Distinctions, sélection nationale, statut',
      years: `${2026 - ((p.age ?? 24) - 5)} – 2026`,
      narrative: `Avec ${p.clubName}, ${p.playerName} passe un cap. Les distinctions individuelles s'enchaînent, le regard du sélectionneur national se pose sur lui. Ce qui n'était qu'une promesse devient une certitude : il compte parmi les meilleurs de sa génération.`,
      quote: `Recevoir cette reconnaissance, c'est pour tous ceux qui ont cru en moi avant les autres.`,
      quoteAuthor: p.playerName,
      image: shots[2], stats: [{ label: 'Buts en carrière', value: String(p.goals) }, { label: 'Passes décisives', value: String(p.assists) }],
    },
    {
      id: `${p.playerId}-ch-4`, numeral: 'IV', title: 'La Légende en Construction', theme: 'Records, influence, héritage',
      years: '2026 — aujourd\'hui',
      narrative: `L'histoire de ${p.playerName} continue de s'écrire. Chaque saison ajoute un nouveau chapitre, chaque record repoussé inspire la génération suivante. Le passeport n'est jamais terminé — il grandit avec chaque exploit.`,
      quote: `Je veux qu'un jeune de ${p.birthPlace ?? 'mon quartier'} me regarde et se dise que tout est possible.`,
      quoteAuthor: p.playerName,
      image: shots[3], stats: [{ label: 'Matchs joués', value: String(p.appearances) }, { label: 'Statut', value: (p.age ?? 25) <= 22 ? 'En développement' : 'Référence' }],
    },
  ];
}

// ─── Road to the Lions ─────────────────────────────────────────────────────────
function buildRoadToLions(p: PlayerProfile, rng: () => number): RoadToLionsEvent[] {
  const eligible = rng() > 0.3 || p.goals + p.assists >= 8;
  if (!eligible) {
    return [{
      id: `${p.playerId}-rtl-watch`, date: '2026-02-01', type: 'callup', competition: 'Observation',
      title: 'Sous observation du staff national',
      description: `Le staff des Lions Indomptables suit de près la progression de ${p.playerName} en MTN Elite One en vue des prochaines échéances.`,
    }];
  }
  const events: RoadToLionsEvent[] = [];
  events.push({
    id: `${p.playerId}-rtl-1`, date: '2025-11-16', type: 'callup', competition: 'Qualifications',
    title: 'Premier appel en sélection A', description: `${p.playerName} reçoit sa première convocation avec les Lions Indomptables, récompense d'une saison pleine en club.`,
  });
  events.push({
    id: `${p.playerId}-rtl-2`, date: '2025-11-19', type: 'debut', opponent: pick(rng, CLUB_LIST).name, competition: 'Match amical', caps: 1,
    title: 'Première cape internationale', description: `Entré en jeu en seconde période, ${p.playerName} honore sa première sélection sous le maillot national.`,
  });
  if (rng() > 0.4) {
    events.push({
      id: `${p.playerId}-rtl-3`, date: '2026-03-24', type: 'goal', opponent: 'Sélection régionale', competition: 'Qualifications CAN', caps: 3, goals: 1,
      title: 'Premier but international', description: `${p.playerName} inscrit son premier but sous les couleurs nationales, un moment qui restera gravé dans sa mémoire.`,
    });
  }
  if (rng() > 0.55) {
    events.push({
      id: `${p.playerId}-rtl-4`, date: '2026-01-10', type: 'tournament', competition: 'CAN Total Énergies', caps: 6,
      title: 'Sélectionné pour la CAN', description: `Retenu dans la liste finale, ${p.playerName} dispute la Coupe d'Afrique des Nations avec le Cameroun.`,
    });
  }
  return events;
}

// ─── Memory box ─────────────────────────────────────────────────────────────
function buildMemoryBox(p: PlayerProfile, rng: () => number): MemoryObject[] {
  const debutClub = p.formerClubs?.[0] ?? p.clubName;
  const pool: MemoryObject[] = [
    { id: `${p.playerId}-mem-1`, title: 'Maillot des Débuts', icon: 'shirt', date: p.sinceClubDate,
      story: `Le maillot porté lors du tout premier match professionnel avec ${debutClub}, conservé comme un trésor par la famille de ${p.playerName}.` },
    { id: `${p.playerId}-mem-2`, title: 'Premier Ballon de Match', icon: 'ball', date: '2024-09-14',
      story: `Le ballon récupéré après le premier but en carrière — signé par tous les coéquipiers ce soir-là.` },
    { id: `${p.playerId}-mem-3`, title: 'Crampons Fétiches', icon: 'boot', date: '2025-01-20',
      story: `Une paire de crampons usée jusqu'à la corde, portée pendant toute une saison décisive de la carrière de ${p.playerName}.` },
  ];
  if (p.achievements.length > 0) pool.push({
    id: `${p.playerId}-mem-4`, title: 'Premier Trophée Collectif', icon: 'trophy', date: '2025-05-30',
    story: `Le trophée soulevé avec ${p.clubName}, célébré avec des milliers de supporters dans les rues.`,
  });
  if ((p.age ?? 25) >= 26 && rng() > 0.5) pool.push({
    id: `${p.playerId}-mem-5`, title: 'Brassard de Capitaine', icon: 'armband', date: '2025-08-16',
    story: `Le brassard porté le jour où ${p.playerName} a officiellement pris le leadership de son équipe.`,
  });
  if (rng() > 0.4) pool.push({
    id: `${p.playerId}-mem-6`, title: 'Médaille de Reconnaissance', icon: 'medal', date: '2026-02-01',
    story: `Remise lors d'une cérémonie de fin de saison en reconnaissance d'une performance individuelle marquante.`,
  });
  return pool;
}

// ─── Career DNA ─────────────────────────────────────────────────────────────
function buildDna(p: PlayerProfile): CareerDna {
  const base = p.strengths.reduce((acc, s) => ({ ...acc, [s.label]: s.value }), {} as Record<string, number>);
  const pos = p.position;
  const attributes = pos === 'FW'
    ? [{ label: 'Finition', value: base.Finition ?? 80 }, { label: 'Vision', value: 62 }, { label: 'Composure', value: 74 }, { label: 'Puissance Physique', value: base.Physique ?? 70 }, { label: 'Leadership', value: 58 }]
    : pos === 'MF'
    ? [{ label: 'Vision de Jeu', value: base.Vision ?? 80 }, { label: 'Créativité', value: base.Passe ?? 78 }, { label: 'Endurance', value: base.Endurance ?? 78 }, { label: 'QI Défensif', value: base.Tacle ?? 62 }, { label: 'Leadership', value: 65 }]
    : pos === 'DF'
    ? [{ label: 'QI Défensif', value: base.Tacle ?? 85 }, { label: 'Puissance Physique', value: base.Physique ?? 80 }, { label: 'Relance', value: base.Relance ?? 66 }, { label: 'Anticipation', value: base.Anticipation ?? 78 }, { label: 'Leadership', value: 68 }]
    : [{ label: 'Réflexes', value: base.Réflexes ?? 86 }, { label: 'Jeu au Pied', value: base.JeuAuPied ?? 64 }, { label: 'Communication', value: base.Communication ?? 74 }, { label: 'Placement', value: base.Placement ?? 82 }, { label: 'Leadership', value: 70 }];

  return {
    attributes,
    playingStyle: pos === 'FW' ? 'Finisseur instinctif, dangereux dans la surface' : pos === 'MF' ? 'Métronome créatif, moteur du jeu collectif' : pos === 'DF' ? 'Roc défensif, relance propre' : 'Dernier rempart, réflexes de chat',
    potential: (p.age ?? 25) <= 21 ? 'En développement' : (p.age ?? 25) <= 26 ? 'Confirmé' : p.goals + p.assists >= 15 ? 'Référence' : 'Confirmé',
    development: `Les observateurs s'accordent : ${p.strengthTags.join(', ').toLowerCase()} sont les points forts sur lesquels ${p.playerName} continue de bâtir sa progression, avec une marge de progrès identifiée sur ${p.weaknessTags[0]?.toLowerCase() ?? 'la régularité'}.`,
  };
}

export function buildPassportData(p: PlayerProfile): PassportData {
  const rng = mulberry32(hashSeed(p.playerId) ^ 0x9e3779b9);
  return {
    stamps: buildStamps(p, rng),
    chapters: buildChapters(p, rng),
    roadToLions: buildRoadToLions(p, rng),
    memoryBox: buildMemoryBox(p, rng),
    dna: buildDna(p),
    passportNumber: `CM-MEO-${String(hashSeed(p.playerId) % 900000 + 100000)}`,
    issueDate: p.sinceClubDate,
    motto: 'Chaque match écrit une page. Chaque saison ajoute un chapitre.',
  };
}
