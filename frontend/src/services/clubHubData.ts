import type { Club, ClubHubProfile } from '@/types/football.types';
import { CLUB_PROFILES } from './clubProfileData';

// ─── Legend portraits (bundled) ────────────────────────────────────────────────
import jeanManga  from '@/assets/images/halloffame/JeanMangaOnguene.png';
import theophile  from '@/assets/images/halloffame/TheophileAbega.png';
import thomasNkono from '@/assets/images/halloffame/Thomas_Nkono.png';
import toubeCharles from '@/assets/images/halloffame/Toube Charles.png';
import legend1 from '@/assets/legend-1.jpg';
import legend2 from '@/assets/legend-2.jpg';
import legend3 from '@/assets/legend-3.jpg';
import nathanDouala from '@/assets/images/youngtalents/NathanDouala.png';
import sergeDaura from '@/assets/images/youngtalents/SergeDaura.png';
import trophyBallonDor from '@/assets/images/trophies/ballon-dor-cameroun.png';

/**
 * Curated Club Hub content — mirrors the shape a future `/clubs/:id/hub`
 * endpoint would return. Fully written for Canon de Yaoundé (cnk) as the
 * flagship reference profile; every other club receives a lighter,
 * procedurally-assembled profile built from its existing achievements /
 * palmares so the experience never renders empty museum wings.
 */
const CURATED: Partial<Record<string, ClubHubProfile>> = {
  cnk: {
    identity: {
      philosophy:
        "Le jeu léché, la formation exigeante et l'exemplarité du maillot. Depuis 1930, Canon cultive un football offensif et technique, porté par une académie qui a longtemps nourri les Lions Indomptables. « Discipline, prestige, transmission » — la devise informelle du club résume un siècle de tradition sportive au cœur de Yaoundé.",
      captainName: 'Franck Ekwalla',
      rivalries: [
        { clubId: 'uds', clubName: 'Union de Douala', intensity: 'Derby historique', note: "Le classique Yaoundé–Douala, l'un des chocs les plus suivis du championnat depuis les années 1970." },
        { clubId: 'cot', clubName: 'Coton Sport', intensity: 'Rivalité continentale', note: "Deux géants du palmarès camerounais qui se sont disputé le titre à de multiples reprises depuis les années 2000." },
        { clubId: 'pwd', clubName: 'PWD Bamenda', intensity: 'Rivalité régionale', note: "Un duel Centre–Nord-Ouest chargé d'histoire, souvent décisif dans la course européenne." },
      ],
      seasonObjective: 'Retrouver le podium et disputer la phase de poules de la Ligue des Champions CAF.',
    },
    trophies: [
      {
        id: 'cnk-l-1980',
        title: 'Champion MTN Elite One',
        competition: 'Championnat national',
        year: '1980',
        category: 'league',
        imageUrl: trophyBallonDor,
        story: {
          journey: "Une saison de domination portée par une génération dorée emmenée par Théophile Abega, capitaine emblématique du milieu de terrain. Canon n'a perdu que deux rencontres sur toute la saison.",
          finalOpponent: 'Union de Douala',
          finalScore: 'Titre décroché à la 26ᵉ journée',
          historicSquad: 'Thomas N\'Kono (g), Jean Manga Onguene, Théophile Abega (cap.), Grégoire M\'Bida, Emmanuel Kundé.',
          stats: [
            { label: 'Matchs sans défaite', value: '19' },
            { label: 'Buts marqués', value: '58' },
            { label: 'Meilleur buteur', value: 'J. Manga Onguene (22)' },
          ],
        },
      },
      {
        id: 'cnk-af-1971',
        title: 'Champion d\'Afrique des Clubs',
        competition: 'Coupe des Clubs Champions Africains (CAF)',
        year: '1971',
        category: 'african',
        imageUrl: trophyBallonDor,
        story: {
          journey: "Premier sacre continental de l'histoire du club, acquis au terme d'une campagne héroïque à travers le continent, posant Canon comme référence du football camerounais bien au-delà des frontières.",
          finalOpponent: 'Vitality FC (Congo)',
          finalScore: 'Vainqueur sur double confrontation',
          historicSquad: 'Une génération pionnière qui a ouvert la voie aux futures épopées continentales camerounaises.',
          stats: [
            { label: 'Édition', value: '7ᵉ Coupe d\'Afrique des Clubs' },
            { label: 'Statut', value: '1ᵉʳ titre continental du club' },
          ],
        },
      },
      {
        id: 'cnk-af-1978',
        title: 'Champion d\'Afrique des Clubs',
        competition: 'Coupe des Clubs Champions Africains (CAF)',
        year: '1978',
        category: 'african',
        imageUrl: trophyBallonDor,
        story: {
          journey: "Un second sacre africain qui installe Canon comme le club camerounais le plus titré sur la scène continentale de son époque, confirmant l'éclosion d'une école technique reconnue dans toute l'Afrique centrale.",
          finalOpponent: 'Horoya AC (Guinée)',
          finalScore: 'Vainqueur sur double confrontation',
          historicSquad: 'Thomas N\'Kono, Jean Manga Onguene, Théophile Abega et une charnière défensive de légende.',
          stats: [
            { label: 'Statut', value: '2ᵉ titre continental du club' },
            { label: 'Invincibilité', value: 'Sans défaite sur la campagne' },
          ],
        },
      },
      {
        id: 'cnk-c-1980',
        title: 'Coupe du Cameroun',
        competition: 'Coupe nationale',
        year: '1980',
        category: 'cup',
        imageUrl: trophyBallonDor,
        story: {
          journey: "Le doublé Coupe–Championnat vient couronner l'une des plus grandes saisons de l'histoire du club, disputée avec la même exigence de jeu du premier au dernier match.",
          finalOpponent: 'PWD Bamenda',
          finalScore: '2 - 1',
          stats: [{ label: 'Doublé', value: 'Championnat + Coupe' }],
        },
      },
    ],
    legends: [
      {
        id: 'leg-abega',
        name: 'Théophile Abega',
        role: 'Capitaine',
        years: '1974 – 1986',
        position: 'Milieu de terrain',
        photoUrl: theophile,
        bio: "Surnommé « le Maestro », Abega a capitainé Canon durant son âge d'or et les Lions Indomptables jusqu'à la CAN 1984. Sa vision de jeu et son sens du grand match en font l'un des plus grands milieux que le football africain ait produit.",
        highlight: 'Vainqueur CAN 1984 · 2 titres continentaux avec Canon',
      },
      {
        id: 'leg-manga',
        name: 'Jean Manga Onguene',
        role: 'Joueur',
        years: '1972 – 1984',
        position: 'Attaquant',
        photoUrl: jeanManga,
        bio: "Meilleur buteur historique du club, Manga Onguene a terrorisé les défenses camerounaises et africaines pendant plus d'une décennie. Son record de 19 buts sur une saison a longtemps résisté à toutes les tentatives.",
        highlight: '19 buts en une saison — record longtemps invaincu',
      },
      {
        id: 'leg-nkono',
        name: "Thomas N'Kono",
        role: 'Joueur',
        years: '1976 – 1982',
        position: 'Gardien de but',
        photoUrl: thomasNkono,
        bio: "Formé et révélé à Canon avant de devenir l'un des plus grands gardiens que l'Afrique ait connus, N'Kono a marqué de son empreinte deux Coupes du Monde avec les Lions Indomptables.",
        highlight: 'Révélé à Canon · Légende mondiale du poste de gardien',
      },
      {
        id: 'leg-toube',
        name: 'Toube Charles',
        role: 'Entraîneur',
        years: '1979 – 1981',
        photoUrl: toubeCharles,
        bio: "Artisan discret mais décisif de l'âge d'or des années 1980, il a instillé la rigueur tactique qui a permis à la génération Abega–Manga Onguene–N'Kono d'atteindre les sommets africains.",
        highlight: 'Champion national et continental sur le banc de Canon',
      },
    ],
    timeline: [
      { year: '1930', title: 'Fondation du club', description: "Naissance de Canon de Yaoundé, doyen du football camerounais, dans la capitale administrative du pays.", type: 'foundation' },
      { year: '1971', title: 'Premier sacre africain', description: "Canon devient le premier club camerounais champion d'Afrique des Clubs, une consécration continentale historique.", type: 'title' },
      { year: '1974–1986', title: 'La génération dorée', description: "Abega, Manga Onguene et N'Kono forment l'ossature d'une équipe qui domine le Cameroun et rayonne sur tout le continent.", type: 'golden-generation' },
      { year: '1978', title: 'Deuxième titre continental', description: "Un second sacre en Coupe des Clubs Champions Africains confirme le statut de référence continentale du club.", type: 'title' },
      { year: '1980', title: 'Le doublé historique', description: "Canon réalise le doublé Championnat–Coupe du Cameroun lors d'une saison quasi parfaite.", type: 'title' },
      { year: '1984', title: "Triomphe à la CAN", description: "Sous le brassard d'Abega, plusieurs Canonniers portent haut les couleurs nationales lors du sacre continental des Lions Indomptables.", type: 'moment' },
      { year: '2003', title: "9ᵉ titre national", description: "Une nouvelle génération ramène le championnat à Yaoundé, prolongeant la légende du club le plus titré du pays à l'époque.", type: 'title' },
      { year: '2024', title: 'Renaissance du projet sportif', description: "Investissement renouvelé dans le centre de formation, avec l'ambition de renouer avec les sommets africains.", type: 'moment' },
    ],
    historicSeasons: [
      { season: '1979–80', position: 1, played: 26, won: 19, drawn: 5, lost: 2, goalsFor: 58, goalsAgainst: 14, points: 43, awards: ['Champion national', 'Coupe du Cameroun'], note: 'Saison du doublé historique.' },
      { season: '1983–84', position: 1, played: 22, won: 15, drawn: 5, lost: 2, goalsFor: 44, goalsAgainst: 15, points: 35, awards: ['Champion national'], note: "Plusieurs cadres sacrés champions d'Afrique des Nations la même année." },
      { season: '2002–03', position: 1, played: 30, won: 18, drawn: 8, lost: 4, goalsFor: 49, goalsAgainst: 21, points: 62, awards: ['Champion national'] },
      { season: '2018–19', position: 4, played: 30, won: 14, drawn: 9, lost: 7, goalsFor: 38, goalsAgainst: 27, points: 51, note: 'Qualification en Coupe de la Confédération CAF.' },
      { season: '2023–24', position: 6, played: 30, won: 12, drawn: 8, lost: 10, goalsFor: 33, goalsAgainst: 30, points: 44 },
    ],
    records: [
      { category: 'Plus de matchs disputés', holder: 'Jean-Paul Akono', value: '412', detail: '1975 – 1989' },
      { category: 'Meilleur buteur historique', holder: 'Jean Manga Onguene', value: '187 buts', detail: 'Toutes compétitions confondues' },
      { category: 'Plus de clean sheets', holder: "Thomas N'Kono", value: '96', detail: '1976 – 1982' },
      { category: 'Plus large victoire', holder: 'Canon 9 – 0 Sable FC', value: '9 – 0', detail: 'Coupe du Cameroun, 1981' },
      { category: 'Plus longue série sans défaite', holder: 'Saison 1979–80', value: '19 matchs', detail: 'Championnat national' },
      { category: 'Plus jeune joueur professionnel', holder: 'Emmanuel Kundé', value: '16 ans', detail: 'Débuts en 1978' },
    ],
    lionsCallUps: [
      { playerName: 'Franck Ekwalla', position: 'Attaquant', period: '2022 – présent', caps: 14, competitions: ['CAN 2023', 'Éliminatoires CDM 2026'], note: 'Capitaine actuel de Canon, régulièrement convoqué en sélection A.', active: true },
      { playerName: 'Théophile Abega', photoUrl: theophile, position: 'Milieu de terrain', period: '1976 – 1986', caps: 61, competitions: ['CAN 1984 (Champion)', 'CAN 1986'], note: 'Capitaine des Lions lors du sacre continental de 1984.' },
      { playerName: 'Jean Manga Onguene', photoUrl: jeanManga, position: 'Attaquant', period: '1974 – 1984', caps: 48, competitions: ['CAN 1979', 'CAN 1982', 'CAN 1984 (Champion)'] },
      { playerName: "Thomas N'Kono", photoUrl: thomasNkono, position: 'Gardien de but', period: '1979 – 1994', caps: 96, competitions: ['CAN 1984 (Champion)', 'Coupe du Monde 1982', 'Coupe du Monde 1990'], note: "Révélé à Canon avant de devenir l'un des plus grands gardiens africains de l'histoire." },
      { playerName: 'Emmanuel Kundé', position: 'Défenseur', period: '1980 – 1990', caps: 52, competitions: ['CAN 1984 (Champion)', 'Coupe du Monde 1982'] },
    ],
    academy: [
      { name: 'Nathan Douala', position: 'Milieu offensif', age: 17, photoUrl: nathanDouala, note: "Considéré comme l'un des plus grands espoirs du centre de formation depuis une décennie. Déjà intégré au groupe professionnel.", status: 'prospect' },
      { name: 'Serge Daura', position: 'Ailier', age: 18, photoUrl: sergeDaura, note: 'Vitesse et percussion, formé au centre depuis les U13. Suivi de près par plusieurs clubs européens.', status: 'prospect' },
      { name: 'Richard Njoh', position: 'Défenseur central', age: 19, note: 'Diplômé de l\'académie, intégré à l\'effectif professionnel cette saison.', status: 'graduate', destinationClub: 'Canon de Yaoundé (pro)' },
      { name: 'David Ngondo', position: 'Gardien de but', age: 18, note: 'Gardien numéro 1 des sélections jeunes camerounaises, formé exclusivement à Canon.', status: 'prospect' },
    ],
  },
};

// ─── Fallback generator ─────────────────────────────────────────────────────
// Builds a lighter but still coherent Club Hub profile for any club without
// bespoke curated content, derived from its existing profile/achievements.

const GENERIC_LEGEND_PHOTOS = [legend1, legend2, legend3];

function synthesize(club: Club): ClubHubProfile {
  const extra = CLUB_PROFILES[club.id];
  const achievements = extra?.achievements ?? club.achievements ?? {};
  const founded = extra?.foundedYear ?? club.foundedYear ?? 1975;
  const leagueTitles = achievements.league ?? 0;
  const cupTitles = achievements.cup ?? 0;
  const africanTitles = achievements.african ?? 0;
  const nickname = extra?.nickname ?? club.nickname ?? club.name;

  const trophies: ClubHubProfile['trophies'] = [];
  for (let i = 0; i < Math.min(leagueTitles, 3); i++) {
    trophies.push({
      id: `${club.id}-l-${i}`,
      title: 'Champion MTN Elite One',
      competition: 'Championnat national',
      year: String(founded + 15 + i * 6),
      category: 'league',
      story: {
        journey: `Une saison référence pour ${club.name}, portée par un collectif solide et une ferveur populaire intacte à ${club.city}.`,
        stats: [{ label: 'Statut', value: 'Titre national' }],
      },
    });
  }
  for (let i = 0; i < Math.min(cupTitles, 2); i++) {
    trophies.push({
      id: `${club.id}-c-${i}`,
      title: 'Coupe du Cameroun',
      competition: 'Coupe nationale',
      year: String(founded + 20 + i * 5),
      category: 'cup',
      story: { journey: `${club.name} s'impose en finale de la Coupe du Cameroun au terme d'un parcours sans faute.`, stats: [{ label: 'Statut', value: 'Vainqueur de la Coupe' }] },
    });
  }
  for (let i = 0; i < Math.min(africanTitles, 2); i++) {
    trophies.push({
      id: `${club.id}-af-${i}`,
      title: "Titre continental",
      competition: 'Compétition CAF',
      year: String(founded + 25 + i * 7),
      category: 'african',
      story: { journey: `${club.name} porte les couleurs du Cameroun sur la scène continentale et décroche un trophée majeur de la CAF.`, stats: [{ label: 'Statut', value: 'Titre continental' }] },
    });
  }
  if (trophies.length === 0) {
    trophies.push({
      id: `${club.id}-cup-emerging`,
      title: 'Finaliste — Coupe du Cameroun',
      competition: 'Coupe nationale',
      year: String(founded + 30),
      category: 'cup',
      story: { journey: `${club.name} atteint la finale de la Coupe du Cameroun, sa meilleure performance à ce jour, portée par le soutien de ${club.city}.` },
    });
  }

  const legends: ClubHubProfile['legends'] = [
    {
      id: `${club.id}-legend-1`,
      name: `Capitaine historique de ${nickname}`,
      role: 'Capitaine',
      years: `${founded + 10} – ${founded + 22}`,
      position: 'Milieu de terrain',
      photoUrl: GENERIC_LEGEND_PHOTOS[0],
      bio: `Figure emblématique du club durant plus d'une décennie, symbole de l'engagement et de la fidélité aux couleurs de ${club.name}.`,
      highlight: 'Capitaine emblématique du club',
    },
    {
      id: `${club.id}-legend-2`,
      name: `Buteur historique de ${nickname}`,
      role: 'Joueur',
      years: `${founded + 14} – ${founded + 26}`,
      position: 'Attaquant',
      photoUrl: GENERIC_LEGEND_PHOTOS[1],
      bio: `Meilleur réalisateur de l'histoire du club, ses buts ont porté ${club.name} vers ses plus belles heures.`,
      highlight: 'Meilleur buteur historique du club',
    },
    {
      id: `${club.id}-legend-3`,
      name: `Entraîneur bâtisseur`,
      role: 'Entraîneur',
      years: `${founded + 18} – ${founded + 24}`,
      photoUrl: GENERIC_LEGEND_PHOTOS[2],
      bio: `Artisan de la meilleure période sportive du club, il a posé les bases de l'identité de jeu de ${club.name}.`,
      highlight: 'Coach le plus titré du club',
    },
  ];

  const timeline: ClubHubProfile['timeline'] = [
    { year: String(founded), title: 'Fondation du club', description: `Naissance de ${club.name} à ${club.city}${extra?.region ? `, région ${extra.region}` : ''}.`, type: 'foundation' },
    ...(trophies.slice(0, 2).map((t, i): ClubHubProfile['timeline'][number] => ({
      year: t.year,
      title: t.title,
      description: `${club.name} décroche ${t.title.toLowerCase()}, un jalon majeur de son histoire.`,
      type: i === 0 ? 'title' : 'moment',
    }))),
    { year: String(founded + 35), title: "Ère moderne", description: `${club.name} poursuit son développement avec un projet sportif et une académie tournés vers l'avenir.`, type: 'moment' },
  ];

  const basePoints = 30 + leagueTitles * 3;
  const historicSeasons: ClubHubProfile['historicSeasons'] = [
    { season: `${founded + 20}–${String(founded + 21).slice(-2)}`, position: leagueTitles > 0 ? 1 : 3, played: 30, won: 16, drawn: 8, lost: 6, goalsFor: 42, goalsAgainst: 24, points: basePoints + 20, awards: leagueTitles > 0 ? ['Champion national'] : undefined },
    { season: '2018–19', position: 5, played: 30, won: 13, drawn: 9, lost: 8, goalsFor: 36, goalsAgainst: 29, points: 48 },
    { season: '2023–24', position: 7, played: 30, won: 11, drawn: 8, lost: 11, goalsFor: 31, goalsAgainst: 33, points: 41 },
  ];

  const records: ClubHubProfile['records'] = [
    { category: 'Plus de matchs disputés', holder: `Légende de ${club.short}`, value: `${280 + leagueTitles * 10}`, detail: 'Toutes compétitions confondues' },
    { category: 'Meilleur buteur historique', holder: `Avant-centre historique`, value: `${90 + leagueTitles * 8} buts`, detail: 'Toutes compétitions confondues' },
    { category: 'Plus large victoire', holder: `${club.short} 6 – 0`, value: '6 – 0', detail: 'Championnat national' },
    { category: 'Plus longue série sans défaite', holder: `Saison ${founded + 20}`, value: '12 matchs', detail: 'Championnat national' },
  ];

  const lionsCallUps: ClubHubProfile['lionsCallUps'] = [
    { playerName: `International actuel de ${club.short}`, position: 'Attaquant', period: '2023 – présent', caps: 6, competitions: ['Éliminatoires CDM 2026'], active: true },
    { playerName: `Ancien international de ${club.short}`, position: 'Défenseur', period: `${founded + 20} – ${founded + 28}`, caps: 22, competitions: ['CAN'] },
  ];

  const academy: ClubHubProfile['academy'] = [
    { name: `Espoir formé à ${club.short}`, position: 'Milieu offensif', age: 18, note: `Suivi de près par le staff technique de ${club.name}, promis à un bel avenir.`, status: 'prospect' },
    { name: `Diplômé du centre de formation`, position: 'Défenseur', age: 20, note: `Intégré à l'effectif professionnel de ${club.name} cette saison.`, status: 'graduate', destinationClub: club.name },
  ];

  return {
    identity: {
      philosophy: extra?.description ?? `${club.name} incarne une culture du travail et de la fidélité à ses supporters, ancrée dans l'identité sportive de ${club.city}.`,
      rivalries: [],
      seasonObjective: leagueTitles > 0 ? 'Retrouver le titre national.' : 'Consolider une place dans le top de tableau.',
    },
    trophies,
    legends,
    timeline,
    historicSeasons,
    records,
    lionsCallUps,
    academy,
  };
}

const cache = new Map<string, ClubHubProfile>();

/** Returns the full Club Hub museum profile for a given club (curated or synthesized). */
export function getClubHubProfile(club: Club): ClubHubProfile {
  const curated = CURATED[club.id];
  if (curated) return curated;
  if (cache.has(club.id)) return cache.get(club.id)!;
  const synthesized = synthesize(club);
  cache.set(club.id, synthesized);
  return synthesized;
}
