import type { Article, Comment } from '../types/news.types';

// ─── Authors ──────────────────────────────────────────────────────────────────
const EDITORS = {
  paul:    { id: 'a1', name: 'Paul Ateba',     role: 'Rédacteur en chef',  avatarUrl: undefined },
  marie:   { id: 'a2', name: 'Marie Ngono',    role: 'Journaliste sport',  avatarUrl: undefined },
  thierry: { id: 'a3', name: 'Thierry Manga',  role: 'Correspondant Nord', avatarUrl: undefined },
  sylvie:  { id: 'a4', name: 'Sylvie Biyong',  role: 'Analyste tactique',  avatarUrl: undefined },
};

// ─── Mock Articles ────────────────────────────────────────────────────────────
export const MOCK_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Coton Sport remporte le choc du nord face à Canon Yaoundé (3–0)',
    slug: 'coton-sport-canon-yaounde-3-0',
    excerpt: 'Dans un stade Roumdé Adjia comble, le champion en titre a dominé de la tête et des épaules un Canon Yaoundé impuissant pour s\'imposer 3 buts à 0 lors du choc de la 18e journée.',
    content: `<p>La pelouse du stade Roumdé Adjia de Garoua a été le théâtre d'un affrontement de haute volée ce samedi soir. Devant plus de 38 000 spectateurs en liesse, Coton Sport FC a signé une victoire autoritaire face à Canon Yaoundé (3–0), consolidant ainsi sa place de leader de la MTN Elite One.</p>

<h2>Une première mi-temps dominée</h2>
<p>Dès l'entame de la rencontre, les Cotonniers ont imposé leur rythme. Ibrahim Marou, auteur d'un doublé, a ouvert le score à la 23e minute sur un centre précis de Bello Yacouba. La domination de Coton était telle que Canon n'a cadré qu'un seul tir en première période.</p>

<p>À la 41e minute, Adamou Sarki a alourdi la marque d'une frappe enroulée du droit, laissant le gardien adverse sans réaction. Le score de 2–0 à la mi-temps reflétait parfaitement la physionomie de la rencontre.</p>

<h2>Marou scelle la victoire</h2>
<p>Au retour des vestiaires, Canon Yaoundé a tenté de réagir, mais c'est encore Marou qui a mis fin aux espoirs adverses à la 67e minute, en concrétisant une magnifique combinaison avec Sarki. Le troisième but a définitivement scellé le sort du match.</p>

<p>Avec cette victoire, Coton Sport porte son avance en tête du classement à 4 points sur Canon Yaoundé. Le titre de champion semble se dessiner de plus en plus nettement pour les hommes de Garoua.</p>`,
    category: 'MATCH_REPORT',
    status: 'PUBLISHED',
    featured: true,
    imageUrl: '/assets/images/equipe/coton.png',
    author: EDITORS.paul,
    tags: ['Coton Sport', 'Canon Yaoundé', 'Journée 18', 'Elite One'],
    publishedAt: '2025-04-21T18:30:00Z',
    commentsCount: 14,
    readingTime: 4,
    views: 3241,
  },
  {
    id: 'art-2',
    title: 'Transferts : Christian Bassogog vers un club de Ligue 1 cet été ?',
    slug: 'bassogog-ligue-1-transfert',
    excerpt: 'L\'attaquant vedette de Canon Yaoundé serait dans le viseur de plusieurs clubs français. Une indemnité de transfert autour de 800 000 euros serait en discussion.',
    content: `<p>Selon nos informations, l'international camerounais Christian Bassogog (29 ans) est au cœur d'un bras de fer entre Canon Yaoundé et plusieurs clubs de Ligue 1 française. Auteur de 14 buts en 16 matchs cette saison, l'attaquant a retrouvé son meilleur niveau après une période difficile.</p>

<h2>Une indemnité en discussion</h2>
<p>Les discussions entre Canon Yaoundé et un club dont le nom n'a pas encore été révélé seraient à un stade avancé. Une indemnité de transfert avoisinant les 800 000 euros serait sur la table. Pour un joueur dont le contrat expire en juin 2025, cette somme représenterait une belle plus-value pour le club yaoundéen.</p>

<p>Interrogé en conférence de presse, l'entraîneur de Canon a tenu à rester prudent : "Bassogog est notre joueur, nous avons besoin de lui pour finir la saison. Ce qui se passe en dehors du terrain ne me regarde pas pour l'instant."</p>

<h2>L'avis du joueur</h2>
<p>Du côté du joueur, l'entourage de Bassogog n'a pas démenti les rumeurs, se contentant d'indiquer que "toutes les options seront étudiées à la fin de la saison". Une chose est sûre : avec de telles performances, l'attaquant ne manquera pas de prétendants.</p>`,
    category: 'TRANSFERS',
    status: 'PUBLISHED',
    featured: false,
    imageUrl: '/assets/images/players/DavidNgondo.png',
    author: EDITORS.marie,
    tags: ['Transferts', 'Bassogog', 'Canon Yaoundé', 'Ligue 1'],
    publishedAt: '2025-04-20T10:00:00Z',
    commentsCount: 27,
    readingTime: 3,
    views: 5120,
  },
  {
    id: 'art-3',
    title: 'Les Lions Indomptables convoqués pour le stage de préparation de juin',
    slug: 'lions-indomptables-stage-juin',
    excerpt: 'Le sélectionneur national a dévoilé une liste de 25 joueurs pour le prochain rassemblement de l\'équipe nationale, avec plusieurs surprises remarquées.',
    content: `<p>Marc Brys, le sélectionneur des Lions Indomptables, a rendu publique ce lundi la liste des 25 joueurs convoqués pour le stage de préparation du mois de juin. Ce rassemblement s'inscrit dans le cadre de la préparation des qualifications pour la Coupe du Monde 2026.</p>

<h2>Les surprises de la liste</h2>
<p>La grande nouveauté de cette liste est la convocation de Serge Daura, le milieu de terrain d'APEJES Mfou, âgé seulement de 20 ans. Sa saison exceptionnelle en Elite One (6 passes décisives, 3 buts) lui a valu cette première sélection très attendue par les observateurs du football camerounais.</p>

<p>On notera également le retour de l'attaquant Roger Etame (Union Douala), absent des radars nationaux depuis près de deux ans suite à une blessure au genou.</p>

<h2>Programme du rassemblement</h2>
<p>Le stage se déroulera du 2 au 15 juin à Yaoundé, avec deux matchs amicaux prévus contre le Sénégal (7 juin) et le Maroc (12 juin). Ces confrontations de haut niveau constitueront un véritable test pour la nouvelle génération des Lions.</p>`,
    category: 'NATIONAL_TEAM',
    status: 'PUBLISHED',
    featured: false,
    imageUrl: undefined,
    author: EDITORS.thierry,
    tags: ['Lions Indomptables', 'Sélection nationale', 'Coupe du Monde 2026'],
    publishedAt: '2025-04-19T09:00:00Z',
    commentsCount: 42,
    readingTime: 3,
    views: 8903,
  },
  {
    id: 'art-4',
    title: 'Analyse tactique : pourquoi Coton Sport est inarrêtable cette saison',
    slug: 'analyse-tactique-coton-sport',
    excerpt: 'Un pressing intense, une charnière centrale solide et un Ibrahim Marou en état de grâce. Décryptage d\'un système de jeu qui écrase la concurrence depuis 18 journées.',
    content: `<p>Après 18 journées de MTN Elite One, Coton Sport FC s'impose comme la machine à gagner du championnat camerounais. Avec 38 points, 38 buts marqués et seulement 16 encaissés, les Cotonniers affichent des statistiques dignes des meilleures équipes du continent. Analyse d'un système de jeu bien rodé.</p>

<h2>Un 4-3-3 qui étouffe les adversaires</h2>
<p>L'entraîneur Oumarou Halidou a opté cette saison pour un 4-3-3 offensif, basé sur un pressing haut et une récupération rapide du ballon. Les trois milieux — Bello Yacouba, l'incontournable capitaine, et ses deux lieutenants — forment un triangle parfait qui ne laisse aucun espace à la créativité adverse.</p>

<h2>La défense, le vrai secret</h2>
<p>Si l'attaque fait les gros titres, c'est bien la défense qui constitue le vrai socle du succès de Coton Sport. Avec seulement 16 buts encaissés en 18 matchs, la charnière centrale formée par le gardien Richard Njoh et ses défenseurs offre une solidité rarement vue en Elite One.</p>`,
    category: 'ANALYSIS',
    status: 'PUBLISHED',
    featured: false,
    imageUrl: undefined,
    author: EDITORS.sylvie,
    tags: ['Coton Sport', 'Tactique', 'Analyse', 'Elite One'],
    publishedAt: '2025-04-18T14:00:00Z',
    commentsCount: 8,
    readingTime: 5,
    views: 2187,
  },
  {
    id: 'art-5',
    title: 'Interview exclusive : Marou Ibrahim, le serial buteur de Garoua',
    slug: 'interview-marou-ibrahim',
    excerpt: '"Je vis pour marquer des buts. Chaque match est une nouvelle page à écrire." L\'attaquant de Coton Sport se confie sur sa saison exceptionnelle.',
    content: `<p><em>À 24 ans, Ibrahim Marou est devenu le joueur le plus en vue du championnat camerounais. Rencontre avec un attaquant au sommet de son art.</em></p>

<p><strong>Comment expliquez-vous votre forme étincelante cette saison ?</strong></p>
<p>Je travaille dur depuis des années. Cette saison, tout s'aligne : l'équipe joue bien, je me sens en confiance. Quand le collectif fonctionne, les buts viennent naturellement.</p>

<p><strong>Vous avez marqué 12 buts en 18 matchs. Aviez-vous fixé un objectif chiffré ?</strong></p>
<p>J'avais dit à ma famille que je voulais terminer meilleur buteur du championnat. On est bien parti, mais il reste encore beaucoup de matchs. Je reste concentré sur l'équipe avant tout.</p>

<p><strong>Des intérêts de clubs étrangers ?</strong></p>
<p>Mon agent gère ça. Moi, je ne pense qu'à Coton Sport pour l'instant. On a un titre à aller chercher et rien ne doit nous distraire de cet objectif.</p>

<p><strong>Un message pour les jeunes joueurs camerounais ?</strong></p>
<p>Croyez en vous, travaillez, et ne lâchez jamais. Le talent seul ne suffit pas. C'est la persévérance qui fait la différence.</p>`,
    category: 'INTERVIEW',
    status: 'PUBLISHED',
    featured: false,
    imageUrl: '/assets/images/players/RostandMbai.png',
    author: EDITORS.marie,
    tags: ['Interview', 'Marou Ibrahim', 'Coton Sport', 'Buteur'],
    publishedAt: '2025-04-17T11:00:00Z',
    commentsCount: 19,
    readingTime: 4,
    views: 4350,
  },
  {
    id: 'art-6',
    title: 'PWD Bamenda accroche l\'Union Douala dans un match haletant (1–1)',
    slug: 'pwd-bamenda-union-douala-1-1',
    excerpt: 'Dans le derby de la 19e journée, PWD Bamenda et Union Douala se sont neutralisés. Un point du match intense où Souaibou et Etame ont chacun inscrit leur nom au tableau d\'affichage.',
    content: `<p>Au stade de Bamenda, PWD Bamenda et Union Douala ont rendu une copie équitable avec ce match nul 1–1 lors de la 19e journée de MTN Elite One. Un résultat qui convient finalement aux deux équipes dans la course au podium.</p>

<h2>Souaibou ouvre le score</h2>
<p>C'est Souaibou Marou qui a brisé l'équilibre à la 23e minute d'un tir croisé imparable. PWD prenait ainsi logiquement les devants après une première demi-heure de domination locale.</p>

<h2>Etame égalise pour l'Union</h2>
<p>Mais l'Union Douala n'a pas dit son dernier mot. À la 58e minute, Roger Etame, servi en profondeur par Ndoumbe, a ajusté le gardien adverse d'une frappe précise pour égaliser. Les deux équipes se sont ensuite livré un duel intense jusqu'au coup de sifflet final.</p>`,
    category: 'RESULTS',
    status: 'PUBLISHED',
    featured: false,
    imageUrl: undefined,
    author: EDITORS.thierry,
    tags: ['PWD Bamenda', 'Union Douala', 'Journée 19', 'Résultats'],
    publishedAt: '2025-04-16T19:00:00Z',
    commentsCount: 5,
    readingTime: 2,
    views: 1654,
  },
  {
    id: 'art-7',
    title: 'Victoria United renforce son effectif avec deux recrues estivales',
    slug: 'victoria-united-recrues-estivales',
    excerpt: 'Le club de Limbe annonce les arrivées d\'un milieu de terrain ivoirien et d\'un défenseur nigérian pour renforcer l\'effectif en vue de la seconde partie de saison.',
    content: `<p>Victoria United FC officialise ce jour les arrivées de deux joueurs étrangers destinés à renforcer l'effectif pour la fin de saison et la campagne à venir. Le club de Limbe confirme ainsi son ambition de se mêler à la lutte pour les places européennes.</p>

<h2>Les nouvelles recrues</h2>
<p>Kouassi Brou, milieu de terrain ivoirien de 25 ans, arrive en provenance du FC San Pédro. International U23 avec la Côte d'Ivoire, il apportera sa créativité et son volume de jeu au cœur du dispositif. Sa signature est valable jusqu'en juin 2027.</p>

<p>Emeka Okafor, défenseur central nigérian de 27 ans, vient quant à lui compléter une défense parfois prise en défaut cette saison. Son profil athlétique et son expérience en NPFL constituent des atouts indéniables.</p>`,
    category: 'CLUB_NEWS',
    status: 'PUBLISHED',
    featured: false,
    imageUrl: '/assets/images/equipe/victoria.png',
    author: EDITORS.paul,
    tags: ['Victoria United', 'Transferts', 'Recrutement', 'Club News'],
    publishedAt: '2025-04-15T08:00:00Z',
    commentsCount: 11,
    readingTime: 3,
    views: 2890,
  },
  {
    id: 'art-8',
    title: 'Draft : La saison de Fovu Baham en question après une série noire',
    slug: 'fovu-baham-serie-noire',
    excerpt: 'Avec seulement 17 points après 18 journées, Fovu Baham se retrouve dans une position délicate. Tour d\'horizon des raisons d\'une saison décevante.',
    content: `<p>Fovu Baham traverse l'une des saisons les plus difficiles de son histoire récente. Neuvième au classement avec 17 points, le club de Baham doit impérativement se ressaisir pour éviter les affres de la relégation. Retour sur les causes d'un tel déclin.</p>`,
    category: 'CLUB_NEWS',
    status: 'DRAFT',
    featured: false,
    imageUrl: undefined,
    author: EDITORS.sylvie,
    tags: ['Fovu Baham', 'Analyse', 'Relégation'],
    publishedAt: '2025-04-14T16:00:00Z',
    commentsCount: 0,
    readingTime: 4,
    views: 0,
  },
];

// ─── Mock Comments ────────────────────────────────────────────────────────────
export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'c1', articleId: 'art-1', authorName: 'Franck Nkoulou', content: 'Quelle performance magistrale ! Marou est tout simplement inarrêtable cette saison. Canon n\'avait aucune solution pour le contenir.',
    createdAt: '2025-04-21T20:15:00Z', likes: 12,
    replies: [
      { id: 'r1', authorName: 'Berthe Ondoa', content: 'Totalement d\'accord. Et Bello Yacouba dans l\'entrejeu a été exceptionnel aussi.', createdAt: '2025-04-21T21:00:00Z', likes: 4 },
      { id: 'r2', authorName: 'Jean-Claude Mbarga', content: 'Canon doit se réveiller, on ne peut pas accepter une telle défaite face à notre rival !', createdAt: '2025-04-21T21:45:00Z', likes: 2 },
    ],
  },
  {
    id: 'c2', articleId: 'art-1', authorName: 'Aissatou Diallo', content: 'J\'étais au stade, l\'ambiance était folle. Garoua a vibré comme jamais. Allez les Cotonniers !',
    createdAt: '2025-04-21T22:30:00Z', likes: 8,
    replies: [],
  },
  {
    id: 'c3', articleId: 'art-1', authorName: 'Patrick Essomba', content: 'Arbitrage douteux sur le 3e but selon moi. Mais globalement Coton méritait de gagner.',
    createdAt: '2025-04-22T08:00:00Z', likes: 3,
    replies: [
      { id: 'r3', authorName: 'Fabrice Nguema', content: 'Pas d\'accord, le but était parfaitement valable. Regardez les ralentis.', createdAt: '2025-04-22T09:00:00Z', likes: 5 },
    ],
  },
  {
    id: 'c4', articleId: 'art-1', authorName: 'Cécile Atangana', content: 'Bravo à toute l\'équipe ! La saison est magnifique. Allez chercher ce titre !',
    createdAt: '2025-04-22T10:00:00Z', likes: 7, replies: [],
  },
];