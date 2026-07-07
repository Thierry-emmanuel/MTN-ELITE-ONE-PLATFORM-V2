import type { Club, CoachStaff, ClubVideo } from '@/types/football.types';

// ─── Extended club-hub profile enrichment ──────────────────────────────────────
// Mirrors the backend `Club` entity (nickname, foundedYear, stadium, palmares,
// achievements, socialMedia…) so the premium Club Hub always has rich content
// to render — in dev, in demos, or as a graceful fallback when the API only
// returns the bare minimum (id/name/city/color).

type ClubProfileExtra = Omit<Club, 'id' | 'name' | 'short' | 'color' | 'city'>;

export const CLUB_PROFILES: Record<string, ClubProfileExtra> = {
  cot: {
    nickname: 'Les Cotonculteurs',
    region: 'Nord',
    foundedYear: 1986,
    secondaryColor: '#0B2545',
    stadium: 'Stade Roumdé Adjia',
    stadiumCapacity: 25000,
    description: "Le club le plus titré du football camerounais, bâti sur une culture de la gagne héritée de deux décennies de domination continentale.",
    history: "Fondé en 1986 dans le sillage de la société cotonnière du Nord-Cameroun, Coton Sport de Garoua s'est imposé comme la référence absolue du championnat, remportant le titre national à seize reprises. Le club a également marqué l'histoire continentale en atteignant la finale de la Ligue des Champions de la CAF, portant haut les couleurs du football camerounais au-delà des frontières. Sa philosophie de formation exigeante continue d'alimenter les sélections nationales.",
    palmares: [
      'Champion MTN Elite One — 16 fois (dernier: 2019)',
      'Coupe du Cameroun — 3 fois',
      'Finaliste Ligue des Champions CAF — 2008',
      'Supercoupe du Cameroun — 5 fois',
    ],
    presidentName: 'Ibrahim Zeukeng',
    achievements: { league: 16, cup: 3, regional: 2, african: 0 },
    socialMedia: { twitter: 'https://x.com', facebook: 'https://facebook.com', instagram: 'https://instagram.com', youtube: 'https://youtube.com' },
  },
  cnk: {
    nickname: 'Les Gunners de Nlongkak',
    region: 'Centre',
    foundedYear: 1930,
    secondaryColor: '#111111',
    stadium: 'Stade Ahmadou Ahidjo',
    stadiumCapacity: 42500,
    description: "Le club historique de la capitale, doyen du football camerounais, dont le blason rouge et blanc a vu naître certaines des plus grandes légendes du pays.",
    history: "Canon de Yaoundé est le club le plus ancien du Cameroun, fondé en 1930. Institution incontournable de la capitale, il a longtemps rivalisé au sommet du football national et continental, remportant à deux reprises la Coupe des Clubs Champions Africains. Son centre de formation a révélé des générations de footballeurs devenus internationaux, faisant de Canon un pilier identitaire du football camerounais.",
    palmares: [
      'Champion MTN Elite One — 9 fois',
      'Coupe du Cameroun — 6 fois',
      'Champion d\'Afrique des Clubs (C1 CAF) — 2 fois (1971, 1978)',
    ],
    presidentName: 'Ludovic Ngatchou',
    achievements: { league: 9, cup: 6, regional: 1, african: 2 },
    socialMedia: { twitter: 'https://x.com', facebook: 'https://facebook.com', instagram: 'https://instagram.com' },
  },
  uds: {
    nickname: 'Les Dauphins Noirs',
    region: 'Littoral',
    foundedYear: 1963,
    secondaryColor: '#F5A623',
    stadium: 'Stade de la Réunification',
    stadiumCapacity: 50000,
    description: "Une institution du littoral camerounais, connue pour la solidité de sa défense et l'intensité de ses derbies doualais.",
    history: "Union de Douala s'est forgé une réputation de club rigoureux et discipliné depuis sa fondation en 1963. Fer de lance du football à Douala, le club a souvent constitué l'ossature défensive des sélections nationales, avec une académie reconnue pour la formation de latéraux et de défenseurs centraux de haut niveau.",
    palmares: [
      'Champion MTN Elite One — 3 fois',
      'Coupe du Cameroun — 2 fois',
    ],
    presidentName: 'Samuel Ebolo',
    achievements: { league: 3, cup: 2, regional: 1, african: 0 },
    socialMedia: { facebook: 'https://facebook.com', instagram: 'https://instagram.com' },
  },
  pwd: {
    nickname: 'Les Vétérans',
    region: 'Nord-Ouest',
    foundedYear: 1961,
    secondaryColor: '#F2C94C',
    stadium: 'Stade Omnisport de Bamenda',
    stadiumCapacity: 18000,
    description: "Le fer de lance du football anglophone, connu pour un style de jeu spectaculaire et une ferveur populaire inégalée à Bamenda.",
    history: "Prisons Warders Douala devenu PWD Bamenda incarne la passion du football dans le Nord-Ouest. Champion du Cameroun à plusieurs reprises, le club a longtemps été une pépinière de talents pour les Lions Indomptables, porté par un public parmi les plus fervents du championnat.",
    palmares: [
      'Champion MTN Elite One — 5 fois',
      'Coupe du Cameroun — 4 fois',
    ],
    presidentName: 'Fon Doh Ganyonga',
    achievements: { league: 5, cup: 4, regional: 0, african: 0 },
    socialMedia: { facebook: 'https://facebook.com' },
  },
  vict: {
    nickname: 'Le Great Vic',
    region: 'Sud-Ouest',
    foundedYear: 1978,
    secondaryColor: '#0EA5E9',
    stadium: 'Omnisport Stadium Limbe',
    stadiumCapacity: 15000,
    description: "Le club balnéaire du Sud-Ouest, symbole de la renaissance du football anglophone et vivier de jeunes talents prometteurs.",
    history: "Victoria United de Limbe s'est imposé ces dernières saisons comme l'une des belles histoires du championnat, misant sur une politique de jeunes joueurs et un style de jeu offensif. Promu au sommet de l'élite, le club continue de bousculer la hiérarchie établie.",
    palmares: [
      'Coupe du Cameroun — 1 fois',
      'Champion Elite Two — 2022',
    ],
    presidentName: 'Peter Mbeng Fominyen',
    achievements: { league: 0, cup: 1, regional: 1, african: 0 },
    socialMedia: { instagram: 'https://instagram.com', tiktok: 'https://tiktok.com' },
  },
  apb: {
    nickname: 'Les Aigles de Mfou',
    region: 'Centre',
    foundedYear: 1995,
    secondaryColor: '#7C3AED',
    stadium: 'Stade Municipal de Mfou',
    stadiumCapacity: 8000,
    description: "Un club académique porté par un projet de formation exigeant, révélateur régulier de jeunes joueurs prometteurs.",
    history: "APEJES de Mfou tire ses racines d'un projet éducatif et sportif ambitieux, conjuguant scolarité et football de haut niveau. Le club s'est fait un nom en Elite One grâce à la qualité de sa formation et à l'éclosion régulière de jeunes talents.",
    palmares: ['Champion Elite Two — 2021'],
    presidentName: 'Dr. Marcel Ze',
    achievements: { league: 0, cup: 0, regional: 1, african: 0 },
    socialMedia: { facebook: 'https://facebook.com' },
  },
  cof: {
    nickname: 'La Colombe',
    region: 'Sud',
    foundedYear: 1990,
    secondaryColor: '#EA580C',
    stadium: 'Stade Municipal de Sangmélima',
    stadiumCapacity: 10000,
    description: "L'ambassadeur du football au Sud-Cameroun, reconnu pour son jeu séduisant et son ambiance familiale.",
    history: "Colombe FC de Sangmélima s'est fait une place respectée dans l'élite grâce à un football séduisant et une gestion communautaire du club. Une valeur sûre du milieu de tableau, régulièrement citée pour la qualité de son entraîneur et de son collectif.",
    palmares: ['Coupe du Cameroun — Finaliste 2016'],
    presidentName: 'Jean-Baptiste Ondoua',
    achievements: { league: 0, cup: 0, regional: 0, african: 0 },
    socialMedia: { facebook: 'https://facebook.com', instagram: 'https://instagram.com' },
  },
  fov: {
    nickname: 'Les Fauves de Baham',
    region: 'Ouest',
    foundedYear: 1988,
    secondaryColor: '#EF4444',
    stadium: 'Stade Municipal de Baham',
    stadiumCapacity: 6000,
    description: "Un promu ambitieux de l'Ouest, réputé pour son intensité physique et son collectif solidaire.",
    history: "Fovu Baham s'est hissé dans l'élite grâce à un parcours de promotion remarqué, porté par un esprit collectif et un engagement physique constant. Le club représente fièrement le département du Haut-Plateau.",
    palmares: ['Champion Elite Two — 2020'],
    presidentName: 'Paul Kamga',
    achievements: { league: 0, cup: 0, regional: 1, african: 0 },
    socialMedia: { facebook: 'https://facebook.com' },
  },
  bam: {
    nickname: 'Les Panthères de Mbouda',
    region: 'Ouest',
    foundedYear: 1975,
    secondaryColor: '#A78BFA',
    stadium: 'Stade Municipal de Mbouda',
    stadiumCapacity: 9000,
    description: "Une institution de l'Ouest camerounais, connue pour sa discipline tactique et la fidélité de son bassin de supporters.",
    history: "Union Sportive de Bamboutos, plus connue sous le nom de Bamboutos de Mbouda, cultive depuis les années 1970 une réputation de club rigoureux et bien organisé, régulièrement présent dans l'élite du football camerounais.",
    palmares: ['Coupe du Cameroun — 1 fois'],
    presidentName: 'Emmanuel Fotso',
    achievements: { league: 0, cup: 1, regional: 0, african: 0 },
    socialMedia: { facebook: 'https://facebook.com' },
  },
  ymb: {
    nickname: 'Young Sports',
    region: 'Nord-Ouest',
    foundedYear: 1998,
    secondaryColor: '#0EA5E9',
    stadium: 'Stade Omnisport de Bafang',
    stadiumCapacity: 7000,
    description: "Un club en pleine ascension, porté par une jeunesse talentueuse et un football offensif prometteur.",
    history: "Young Sports Bamenda s'est construit une identité autour de la valorisation des jeunes joueurs locaux, avec l'ambition affichée de s'installer durablement dans le haut du tableau de l'Elite One.",
    palmares: ['Champion Elite Two — 2023'],
    presidentName: 'Christian Awasum',
    achievements: { league: 0, cup: 0, regional: 1, african: 0 },
    socialMedia: { instagram: 'https://instagram.com' },
  },
};

/** Merge a base club (id/name/city/color) with its rich mock profile, if present. */
export function withClubProfile(club: Club): Club {
  const extra = CLUB_PROFILES[club.id];
  if (!extra) return club;
  return {
    ...extra,
    ...club,
    // Prefer richer values even if the base object has a "falsy" placeholder
    nickname:        club.nickname        ?? extra.nickname,
    stadium:         club.stadium         ?? extra.stadium,
    stadiumCapacity: club.stadiumCapacity ?? extra.stadiumCapacity,
    description:     club.description     ?? extra.description,
    history:         club.history         ?? extra.history,
    palmares:        club.palmares?.length ? club.palmares : extra.palmares,
    achievements:    club.achievements    ?? extra.achievements,
    socialMedia:     club.socialMedia     ?? extra.socialMedia,
    foundedYear:     club.foundedYear     ?? extra.foundedYear,
    presidentName:   club.presidentName   ?? extra.presidentName,
    secondaryColor:  club.secondaryColor  ?? extra.secondaryColor,
    region:          club.region          ?? extra.region,
  };
}

// ─── Coaching staff (mock — backend Coach entity has no seed data yet) ─────────

export const CLUB_COACHING_STAFF: Record<string, CoachStaff> = {
  cot: {
    id: 'coach-cot', firstName: 'Martin', lastName: 'Ndoumbe', nationality: '🇨🇲 Cameroun',
    qualification: 'CAF Pro', specialization: 'Jeu de possession',
    biography: "Artisan du renouveau de Coton Sport, Martin Ndoumbe impose un 4-3-3 dominant fondé sur la possession et le pressing haut.",
    formerClubs: ['Canon Yaoundé (adjoint)', 'Sélection U20 Cameroun'],
    trophies: ['MTN Elite One 2019', 'Coupe du Cameroun 2021'],
    assistantCoachName: 'Bertrand Owona', fitnessCoachName: 'Cedric Mballa',
    goalkeeperCoachName: 'Joseph Antoine Bell Jr.', analystName: 'Aline Fouda',
    clubId: 'cot',
  },
  cnk: {
    id: 'coach-cnk', firstName: 'Roger', lastName: 'Manga', nationality: '🇨🇲 Cameroun',
    qualification: 'UEFA A', specialization: 'Transition offensive',
    biography: "Roger Manga a redonné des couleurs à Canon avec un 4-2-3-1 vertical et un pressing coordonné.",
    formerClubs: ['Union Douala', 'APEJES Mfou'],
    trophies: ['Coupe du Cameroun 2022'],
    assistantCoachName: 'Serge Abena', fitnessCoachName: 'Paul Ekwalla',
    goalkeeperCoachName: 'Alioum Saidou', analystName: 'Marceline Ngo Bidjocka',
    clubId: 'cnk',
  },
  uds: {
    id: 'coach-uds', firstName: 'Issa', lastName: 'Bello', nationality: '🇨🇲 Cameroun',
    qualification: 'CAF A', specialization: 'Organisation défensive',
    biography: "Issa Bello a fait de la solidité défensive la marque de fabrique d'Union Douala, avec un 3-5-2 discipliné.",
    formerClubs: ['PWD Bamenda (adjoint)'],
    trophies: [],
    assistantCoachName: 'Rodrigue Ateba', fitnessCoachName: 'Hervé Same',
    clubId: 'uds',
  },
};

export function getClubCoach(clubId: string): CoachStaff | null {
  return CLUB_COACHING_STAFF[clubId] ?? null;
}

// ─── Videos (mock metadata — no CMS-managed video module yet) ─────────────────

export function buildClubVideos(club: Club): ClubVideo[] {
  const short = club.short;
  return [
    { id: `${club.id}-v1`, title: `${club.name} — Résumé du dernier match`, thumbnailUrl: '', duration: '4:32', date: 'Il y a 3 jours', category: 'Résumé' },
    { id: `${club.id}-v2`, title: `Dans les coulisses de ${short}`, thumbnailUrl: '', duration: '7:10', date: 'Il y a 1 semaine', category: 'Coulisses' },
    { id: `${club.id}-v3`, title: `Top 5 buts de la saison — ${short}`, thumbnailUrl: '', duration: '3:48', date: 'Il y a 2 semaines', category: 'Highlights' },
    { id: `${club.id}-v4`, title: `Interview d'avant-match`, thumbnailUrl: '', duration: '5:55', date: 'Il y a 3 semaines', category: 'Interview' },
  ];
}
