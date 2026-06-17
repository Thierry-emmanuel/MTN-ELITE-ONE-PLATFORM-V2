// src/database/seed.mongo.data.ts
// MongoDB collections: hero_banners + articles

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

// ── HERO BANNERS ─────────────────────────────────────────────────────────────
export const HERO_BANNERS = [
  {
    title:    { fr: 'MTN Elite One 2025-26', en: 'MTN Elite One 2025-26' },
    subtitle: { fr: 'Le meilleur championnat d\'Afrique Centrale', en: 'The best league in Central Africa' },
    image_url: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1/hero-stadium.jpg',
    link_url:  '/standings',
    priority:  1,
    active:    true,
    type:      'hero',
    created_at: now,
    updated_at: now,
  },
  {
    title:    { fr: 'Gazelle FA en tête — 28 pts', en: 'Gazelle FA leads — 28 pts' },
    subtitle: { fr: '15 journées jouées · Garoua en feu !', en: '15 matchdays played · Garoua on fire!' },
    image_url: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634499/gazelle_logo.png',
    link_url:  '/standings',
    priority:  2,
    active:    true,
    type:      'match',
    created_at: now,
    updated_at: now,
  },
  {
    title:    { fr: 'Ballon d\'Or Cameroun 2025 — Votez !', en: 'Cameroon Ballon d\'Or 2025 — Vote now!' },
    subtitle: { fr: 'Élisez le meilleur joueur de la saison', en: 'Elect the best player of the season' },
    image_url: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1/mtn-elite-logo.jpg',
    link_url:  '/awards/ballon-dor',
    priority:  3,
    active:    true,
    type:      'promo',
    created_at: now,
    updated_at: now,
  },
  {
    title:    { fr: 'Journée 16 — Ce samedi 9 mai', en: 'Matchday 16 — This Saturday May 9' },
    subtitle: { fr: 'Canon vs Gazelle · Dynamo vs Panther · Colombe vs Renard', en: 'Canon vs Gazelle · Dynamo vs Panther · Colombe vs Renard' },
    image_url: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1/hero-stadium.jpg',
    link_url:  '/fixtures',
    priority:  4,
    active:    true,
    type:      'match',
    created_at: now,
    updated_at: now,
  },
  {
    title:    { fr: '408 buts en 104 matchs', en: '408 goals in 104 matches' },
    subtitle: { fr: '3.92 buts/match — la saison la plus spectaculaire depuis 10 ans', en: '3.92 goals/match — most spectacular season in 10 years' },
    image_url: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1/player-1.jpg',
    link_url:  '/stats',
    priority:  5,
    active:    true,
    type:      'promo',
    created_at: now,
    updated_at: now,
  },
  {
    title:    { fr: 'Colombe Champion 2024-25 🏆', en: 'Colombe Champions 2024-25 🏆' },
    subtitle: { fr: 'Premier titre de l\'histoire pour Sangmélima', en: 'First ever title for Sangmélima' },
    image_url: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634499/colombe_logo_qki9re.png',
    link_url:  '/news',
    priority:  6,
    active:    false,
    type:      'hero',
    created_at: now,
    updated_at: now,
  },
];

// ── ARTICLES ──────────────────────────────────────────────────────────────────
export const ARTICLES = [
  // ── MATCH REPORTS ───────────────────────────────────────────────────────────
  {
    slug: 'seed-j15-renard-colombe-7-3',
    title: {
      fr: 'J15 : Stade Renard humilie Colombe 7-3 dans un match de folie',
      en: 'J15: Stade Renard demolishes Colombe 7-3 in goal fest',
    },
    body: {
      fr: `Dans un match historique de la journée 15, le Stade Renard de Melong a écrasé la Colombe Sportive du Dja et Lobo sur le score de 7-3 au Stade Municipal de Melong. Une rencontre spectaculaire qui restera dans les annales de l'Elite One 2025-26.

Les Renards ont dominé dès le coup d'envoi, ouvrant le score dès la 8e minute. Malgré trois réalisations de la Colombe, la solidité offensive de Melong n'a pu être contenue. Ce résultat permet à Stade Renard de se replacer à la 7e position avec 21 points.

Pour la Colombe, série de bons résultats stoppée nette. Prochaine journée cruciale pour les deux équipes dans la course au top 5.`,
      en: `In a historic matchday 15 fixture, Stade Renard de Melong crushed Colombe Sportive 7-3 at Stade Municipal de Melong. A spectacular encounter for the Elite One 2025-26 annals.

The Foxes dominated from kickoff, opening the scoring as early as the 8th minute. Despite three Colombe replies, Melong's attacking power could not be contained. This result takes Stade Renard up to 7th with 21 points.

For Colombe, their good run is halted sharply. The next matchday is crucial for both sides in the race for the top 5.`,
    },
    author: 'Martial Biyong',
    category: 'MATCH_REPORT',
    status: 'PUBLISHED',
    featured: true,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1/news-1.jpg',
    tags: ['J15', 'Renard', 'Colombe', 'match-report', 'elite-one'],
    read_time: 4,
    views: 8420,
    publishedAt: daysAgo(2),
    comments: [
      { authorName: 'Fan Melong', content: 'Incroyable ! 7 buts à domicile 🦊🔥', createdAt: daysAgo(1), likes: 45, replies: [] },
      { authorName: 'Supporter Colombe', content: 'Grosse défaite à digérer.', createdAt: daysAgo(1), likes: 12, replies: [] },
    ],
  },
  {
    slug: 'seed-j14-colombe-canon-6-0',
    title: {
      fr: 'J14 : La Colombe corrige Canon 6-0, humiliation au Stade Ahidjo',
      en: 'J14: Colombe thrash Canon 6-0, humiliation at Stade Ahidjo',
    },
    body: {
      fr: `La Colombe Sportive du Dja et Lobo a signé l'un des résultats les plus surprenants de cette saison en écrasant Canon de Yaoundé 6-0 sur leur propre pelouse. Six buts sans réponse qui font trembler les fondations du club le plus titré du Cameroun.

Canon touche le fond avec ce revers historique. Pour la Colombe, ce résultat confirme leur statut de candidats sérieux. Avec 20 points et une attaque en feu, Sangmélima rêve de reproduire l'exploit du titre de la saison précédente.`,
      en: `Colombe Sportive produced one of the season's most surprising results, crushing Canon de Yaoundé 6-0 on their own pitch. Six unanswered goals shake the foundations of Cameroon's most decorated club.

Canon hit rock bottom with this historic defeat. For Colombe, this result confirms their status as serious top-five contenders. With 20 points and a hot attack, Sangmélima dreams of repeating last season's title triumph.`,
    },
    author: 'Diane Atangana',
    category: 'MATCH_REPORT',
    status: 'PUBLISHED',
    featured: false,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634499/colombe_logo_qki9re.png',
    tags: ['J14', 'Colombe', 'Canon', 'match-report', '6-0'],
    read_time: 3,
    views: 12350,
    publishedAt: daysAgo(9),
    comments: [],
  },
  {
    slug: 'seed-j11-dynamo-renard-7-2',
    title: {
      fr: 'J11 : Dynamo atomise Renard 7-2 — festival offensif à Douala',
      en: 'J11: Dynamo destroy Renard 7-2 — offensive festival in Douala',
    },
    body: {
      fr: `Le Dynamo Club de Douala a livré une leçon de football offensif en écrasant Stade Renard 7-2 lors de la 11e journée. Une démonstration qui confirme Douala comme candidat au titre.

Avec 27 points et +12 en différentiel, Dynamo occupe la 2e place. L'animation offensive est la plus impressionnante du championnat avec une moyenne de 2.4 buts marqués par match.`,
      en: `Dynamo Club de Douala delivered an offensive masterclass destroying Stade Renard 7-2 on matchday 11. A demonstration confirming Douala as title contenders.

With 27 points and +12 goal difference, Dynamo sit second. Their attacking output is the league's most impressive, averaging 2.4 goals scored per match.`,
    },
    author: 'Martial Biyong',
    category: 'MATCH_REPORT',
    status: 'PUBLISHED',
    featured: false,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634499/dynamo_douala_logo.png',
    tags: ['J11', 'Dynamo', 'Renard', 'match-report'],
    read_time: 3,
    views: 5890,
    publishedAt: daysAgo(23),
    comments: [],
  },
  {
    slug: 'seed-j07-colombe-cotonsport-7-2',
    title: {
      fr: 'J07 : Colombe humilie Cotonsport 7-2 — résultat choc de la saison',
      en: 'J07: Colombe humiliate Cotonsport 7-2 — shock result of the season',
    },
    body: {
      fr: `La Colombe Sportive du Dja et Lobo a signé une victoire historique 7-2 face à Cotonsport de Garoua lors de la 7e journée. Ce résultat choc a bouleversé les pronostics et placé Sangmélima parmi les favoris.

Cotonsport, pourtant l'un des clubs les plus structurés du championnat, s'est retrouvé dépassé par la vitesse et l'efficacité des Colombes. Un match à revoir tant la domination fut totale.`,
      en: `Colombe Sportive du Dja et Lobo produced a historic 7-2 win against Cotonsport de Garoua on matchday 7. This shock result upended predictions and placed Sangmélima among the favourites.

Cotonsport, one of the most structured clubs in the league, found themselves overwhelmed by Colombe's speed and efficiency. A match to rewatch given the total domination on display.`,
    },
    author: 'Diane Atangana',
    category: 'MATCH_REPORT',
    status: 'PUBLISHED',
    featured: false,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634499/colombe_logo_qki9re.png',
    tags: ['J07', 'Colombe', 'Cotonsport', 'match-report', '7-2'],
    read_time: 3,
    views: 9200,
    publishedAt: daysAgo(37),
    comments: [],
  },

  // ── ANALYSIS ────────────────────────────────────────────────────────────────
  {
    slug: 'seed-analysis-gazelle-tactical',
    title: {
      fr: 'Analyse tactique : Pourquoi Gazelle FA domine le championnat',
      en: 'Tactical analysis: Why Gazelle FA leads the Elite One',
    },
    body: {
      fr: `Avec 28 points après 15 journées et le meilleur bilan offensif, Gazelle FA s'impose comme le grand favori. Décryptage de leur succès.

**Un 4-3-3 agressif et vertical**
L'entraîneur a opté pour un système avec trois milieux box-to-box, privilégiant les transitions rapides défense-attaque. La marque de fabrique : récupérer vite et frapper avant que l'adversaire ne soit organisé.

**La presse haute**
Gazelle enregistre 6.2 récupérations de balle dans le tiers adverse par match, record de la ligue. Cette intensité génère des occasions dangereuses à répétition.

**Le point de vigilance**
Les 5 défaites rappellent une fragilité contre les équipes qui jouent bas. La journée 9 contre Panthere (2-3) illustre cette limite. La gestion du titre sur la durée sera le vrai test.`,
      en: `With 28 points after 15 matchdays and the league's best attack, Gazelle FA establishes itself as the clear favourite. Breakdown of their success.

**An aggressive, vertical 4-3-3**
The coach opted for a system with three box-to-box midfielders, favouring rapid defence-to-attack transitions. The trademark: win it back quickly and strike before opponents organise.

**The high press**
Gazelle records 6.2 ball recoveries in the opponent's third per match, a league record. This intensity generates dangerous chances repeatedly.

**The concern**
The 5 defeats highlight vulnerability against deep-sitting sides. Matchday 9 against Panthere (lost 2-3) illustrates this limitation. Managing the title challenge over the full season will be the real test.`,
    },
    author: 'Martial Biyong',
    category: 'ANALYSIS',
    status: 'PUBLISHED',
    featured: true,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634499/gazelle_logo.png',
    tags: ['analyse', 'tactique', 'Gazelle', 'Elite-One', 'classement'],
    read_time: 6,
    views: 15670,
    publishedAt: daysAgo(4),
    comments: [
      {
        authorName: 'Analyste Football CM',
        content: 'Excellent article. La presse haute de Gazelle est vraiment impressionnante.',
        createdAt: daysAgo(3),
        likes: 67,
        replies: [
          { authorName: 'Fan Dynamo', content: 'Dynamo les rattrapera 💪', createdAt: daysAgo(2), likes: 23 },
        ],
      },
    ],
  },
  {
    slug: 'seed-analysis-top-scorers-j15',
    title: {
      fr: 'Course au titre de buteur : classement après 15 journées',
      en: 'Golden Boot race: standings after 15 matchdays',
    },
    body: {
      fr: `La course au meilleur buteur de l'Elite One 2025-26 est l'une des plus disputées depuis des années.

Avec 13 buts en 15 matchs, le leader s'affirme comme le joueur le plus décisif. Sa capacité à marquer dans les grands matchs le distingue clairement.

Plusieurs attaquants sont regroupés entre 9 et 10 buts. Avec 11 journées restantes et une moyenne de 3.92 buts/match, la saison pourrait battre le record historique de réalisations.`,
      en: `The Elite One 2025-26 Golden Boot race is one of the most competitive in years.

With 13 goals in 15 matches, the leader asserts himself as the most decisive player. His ability to score in big matches clearly distinguishes him from rivals.

Several strikers are clustered between 9 and 10 goals. With 11 matchdays remaining and a 3.92 goals/match average, the season could break the all-time goals record.`,
    },
    author: 'Diane Atangana',
    category: 'ANALYSIS',
    status: 'PUBLISHED',
    featured: false,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1/player-1.jpg',
    tags: ['buteurs', 'statistiques', 'analyse', 'Elite-One'],
    read_time: 5,
    views: 9820,
    publishedAt: daysAgo(3),
    comments: [],
  },
  {
    slug: 'seed-analysis-moungo-relegation',
    title: {
      fr: 'Aigle Royale du Moungo — Peut-il éviter la relégation ?',
      en: 'Aigle Royale du Moungo — Can they avoid relegation?',
    },
    body: {
      fr: `Avec seulement 10 points après 15 journées et -17 en différentiel, l'Aigle Royale du Moungo est en grand danger de relégation. Bilan d'une saison catastrophique.

Neuf défaites, 4 matchs nuls, seulement 2 victoires. Le club de Nkongsamba n'a remporté que 2 rencontres cette saison. La réception de 7 buts de Dynamo en J07 et 6 de l'Aigle Royal de la Menoua en J15 illustre les failles défensives béantes.

La direction a réagi en convoquant une assemblée générale extraordinaire. Des renforts sont attendus pour la seconde partie de saison.`,
      en: `With only 10 points after 15 matchdays and -17 goal difference, Aigle Royale du Moungo faces serious relegation danger. Review of a catastrophic season.

Nine defeats, 4 draws, only 2 wins. The club from Nkongsamba has won just 2 encounters this season. Conceding 7 goals to Dynamo in J07 and 6 to Aigle Royal de la Menoua in J15 illustrates gaping defensive holes.

The board reacted by calling an extraordinary general assembly. Reinforcements are expected for the second half of the season.`,
    },
    author: 'Diane Atangana',
    category: 'ANALYSIS',
    status: 'PUBLISHED',
    featured: false,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634499/Aigle_Moungo_logo_ahtn7h.png',
    tags: ['Moungo', 'relégation', 'analyse', 'Elite-One'],
    read_time: 4,
    views: 7650,
    publishedAt: daysAgo(6),
    comments: [],
  },

  // ── CLUB NEWS ────────────────────────────────────────────────────────────────
  {
    slug: 'seed-club-canon-crisis-j14',
    title: {
      fr: 'Canon de Yaoundé en crise : 5 défaites en 8 matchs',
      en: 'Canon de Yaoundé in crisis: 5 losses in 8 matches',
    },
    body: {
      fr: `L'institution du football camerounais traverse une période difficile. Après le 6-0 concédé à domicile face à la Colombe en J14, les supporters du Kpakum s'interrogent.

L'entraîneur fait face à une pression croissante. Ses choix tactiques sont critiqués. Malgré tout, Canon compte encore 5 victoires et 19 points. Les journées restantes offrent l'opportunité de remonter au classement.`,
      en: `The institution of Cameroonian football is going through a difficult period. After the 6-0 humiliation at home against Colombe on J14, Kpakum supporters are questioning everything.

The coach faces growing pressure with tactical choices being criticised. Despite it all, Canon still have 5 wins and 19 points. The remaining matchdays offer the chance to climb back up.`,
    },
    author: 'Diane Atangana',
    category: 'CLUB_NEWS',
    status: 'PUBLISHED',
    featured: false,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634499/Canon_logo_pis9yd.png',
    tags: ['Canon', 'Yaoundé', 'crise', 'Elite-One'],
    read_time: 4,
    views: 18420,
    publishedAt: daysAgo(8),
    comments: [
      { authorName: 'Kpakum Forever', content: 'Triste de voir notre club dans cet état. Renforts en janvier !', createdAt: daysAgo(7), likes: 134, replies: [] },
    ],
  },
  {
    slug: 'seed-club-dynamo-title-ambition',
    title: {
      fr: 'Dynamo Club de Douala : le géant orangé veut le titre',
      en: 'Dynamo Club de Douala: the orange giant wants the title',
    },
    body: {
      fr: `Deuxième avec 27 points et +12, le Dynamo Club de Douala affiche de sérieuses ambitions. Après une saison 2024-25 décevante, la direction a procédé à des renforts ciblés avec un résultat immédiat.

Le 7-2 infligé à Renard et le 7-2 face au Moungo démontrent la puissance offensive doubalaise. Le pressing et les transitions rapides de l'entraîneur génèrent des occasions de qualité à répétition.`,
      en: `Second with 27 points and +12, Dynamo Club de Douala displays serious title ambitions. After a disappointing 2024-25 season, management made targeted reinforcements with immediate results.

The 7-2 against Renard and 7-2 against Moungo demonstrate Douala's offensive power. The coach's pressing and rapid transitions generate quality chances repeatedly.`,
    },
    author: 'Martial Biyong',
    category: 'CLUB_NEWS',
    status: 'PUBLISHED',
    featured: false,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634499/dynamo_douala_logo.png',
    tags: ['Dynamo', 'Douala', 'Elite-One', 'titre'],
    read_time: 4,
    views: 7340,
    publishedAt: daysAgo(12),
    comments: [],
  },
  {
    slug: 'seed-club-panthere-revelation',
    title: {
      fr: 'Panthere Sportive du Nde : la révélation de la saison',
      en: 'Panthere Sportive du Nde: the revelation of the season',
    },
    body: {
      fr: `Troisième avec 26 points et +8 en différentiel, la Panthere s'impose comme la grande surprise. Leur 6-0 infligé à la Colombe en J03 a sonné comme une déclaration d'intentions.

Un 4-4-2 compact redoutable en contre-attaque. Leur capacité à exploiter les espaces laissés par les adversaires plus dominants est remarquable. L'Ouest Cameroun joue enfin dans la cour des grands.`,
      en: `Third with 26 points and +8 goal difference, Panthere is the season's big surprise. Their 6-0 against Colombe on J03 was a statement of intent.

A compact 4-4-2 formidable on the counter. Their ability to exploit spaces left by more dominant opponents is remarkable. West Cameroon is finally playing with the big boys.`,
    },
    author: 'Diane Atangana',
    category: 'CLUB_NEWS',
    status: 'PUBLISHED',
    featured: false,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634499/panthere_logo.png',
    tags: ['Panthere', 'Bangangté', 'Elite-One', 'révélation'],
    read_time: 4,
    views: 6210,
    publishedAt: daysAgo(15),
    comments: [],
  },
  {
    slug: 'seed-club-victoria-fourth',
    title: {
      fr: 'Victoria United (4e) : la régularité comme arme principale',
      en: 'Victoria United (4th): consistency as their main weapon',
    },
    body: {
      fr: `Quatrième avec 24 points et seulement 3 défaites en 15 matchs, Victoria United démontre une régularité impressionnante. La clé de leur succès : ne jamais perdre deux fois de suite.

Avec 6 victoires et 6 matchs nuls, les Limbéens ont bâti leur classement sur la solidité défensive et la capacité à grappiller des points même lors de leurs journées moins brillantes.`,
      en: `Fourth with 24 points and only 3 defeats in 15 matches, Victoria United demonstrates impressive consistency. The key to their success: never losing twice in a row.

With 6 wins and 6 draws, the Limbe side have built their table position on defensive solidity and the ability to pick up points even on off days.`,
    },
    author: 'Martial Biyong',
    category: 'CLUB_NEWS',
    status: 'PUBLISHED',
    featured: false,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634499/victoria_logo.png',
    tags: ['Victoria', 'Limbe', 'Elite-One', 'classement'],
    read_time: 3,
    views: 4890,
    publishedAt: daysAgo(18),
    comments: [],
  },

  // ── TRANSFERS ────────────────────────────────────────────────────────────────
  {
    slug: 'seed-transfers-window-jan-2026',
    title: {
      fr: 'Mercato janvier 2026 : les mouvements de l\'Elite One',
      en: 'January 2026 window: Elite One transfer moves',
    },
    body: {
      fr: `La fenêtre de janvier 2026 a animé le marché camerounais. Renforts stratégiques, départs discrets : voici le bilan.

Canon de Yaoundé, en manque de solutions offensives, a activé son réseau pour attirer un attaquant. PWD Bamenda a confirmé l'arrivée d'un milieu défensif expérimenté.

Fauve Azur Elite FC a vu partir son meilleur créateur vers le Golfe, ce qui explique en partie leur glissade au classement. La FECAFOOT a annoncé un plan pour valoriser l'Elite One d'ici 2028.`,
      en: `The January 2026 window animated the Cameroonian market. Strategic reinforcements, discreet departures: here is the overview.

Canon de Yaoundé, lacking attacking solutions, activated their network to attract a striker. PWD Bamenda confirmed the arrival of an experienced defensive midfielder.

Fauve Azur Elite FC saw their best creator leave for the Gulf, partly explaining their slide down the table. FECAFOOT announced a plan to increase Elite One's value by 2028.`,
    },
    author: 'Martial Biyong',
    category: 'TRANSFERS',
    status: 'PUBLISHED',
    featured: false,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1/news-2.jpg',
    tags: ['transferts', 'mercato', 'Elite-One', 'janvier-2026'],
    read_time: 5,
    views: 11230,
    publishedAt: daysAgo(20),
    comments: [],
  },

  // ── NATIONAL TEAM ─────────────────────────────────────────────────────────────
  {
    slug: 'seed-national-team-elite-one-lions',
    title: {
      fr: 'Les Lions surveillent de près l\'Elite One 2025-26',
      en: 'Indomitable Lions closely monitoring the Elite One 2025-26',
    },
    body: {
      fr: `Le sélectionneur national a confirmé sa présence à plusieurs matchs de l'Elite One cette saison. Les performances locales sont désormais un critère important de sélection.

La FECAFOOT a mis en place un système de notation des matchs pour faciliter le travail des observateurs. Les journées 15 à 20 seront particulièrement scrutées avant les prochaines qualifications.`,
      en: `The national coach confirmed attendance at several Elite One matches this season. Local performances are now an important selection criterion.

FECAFOOT has set up a match rating system to help national staff observers. Matchdays 15 to 20 will be particularly scrutinised ahead of the next qualification campaign.`,
    },
    author: 'Diane Atangana',
    category: 'NATIONAL_TEAM',
    status: 'PUBLISHED',
    featured: false,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1/legend-1.jpg',
    tags: ['Lions-Indomptables', 'sélection', 'Elite-One', 'FECAFOOT'],
    read_time: 4,
    views: 22100,
    publishedAt: daysAgo(22),
    comments: [],
  },

  // ── INTERVIEWS ────────────────────────────────────────────────────────────────
  {
    slug: 'seed-interview-gazelle-coach',
    title: {
      fr: '"Nous jouons pour le titre" — L\'entraîneur de Gazelle FA',
      en: '"We are playing for the title" — Gazelle FA coach',
    },
    body: {
      fr: `Rencontre avec l'entraîneur de Gazelle FA, leader du championnat après 15 journées.

**Après 15 journées en tête, comment vivez-vous cette pression ?**
"La pression est normale. Mes joueurs la transforment en motivation. Le classement reflète notre travail depuis le premier jour."

**Qu'est-ce qui différencie Gazelle ?**
"Notre organisation collective et notre cohésion de vestiaire. Ça ne s'achète pas."

**Le mot de la fin ?**
"Aux supporters : restez avec nous jusqu'au bout. Ce titre, on va le chercher ensemble. Garoua mérite un champion."`,
      en: `Meeting with the Gazelle FA coach, league leader after 15 matchdays.

**After 15 matchdays at the top, how do you handle the pressure?**
"Pressure is normal. My players transform it into motivation. The standings reflect our work from day one."

**What differentiates Gazelle?**
"Our collective organisation and dressing room cohesion. That cannot be bought."

**Final word?**
"To the supporters: stay with us to the end. We will go and get this title together. Garoua deserves a champion."`,
    },
    author: 'Martial Biyong',
    category: 'INTERVIEW',
    status: 'PUBLISHED',
    featured: true,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1777634499/gazelle_logo.png',
    tags: ['interview', 'Gazelle', 'entraîneur', 'Elite-One', 'titre'],
    read_time: 5,
    views: 19800,
    publishedAt: daysAgo(5),
    comments: [
      { authorName: 'Gazelle4Life', content: 'Notre coach est le meilleur ! On croit en vous 🦌💚', createdAt: daysAgo(4), likes: 89, replies: [] },
    ],
  },
  {
    slug: 'seed-interview-panthere-striker',
    title: {
      fr: '"Je veux finir meilleur buteur" — L\'attaquant de Panthere',
      en: '"I want to finish as top scorer" — The Panthere striker',
    },
    body: {
      fr: `Entretien exclusif avec l'attaquant de la Panthere Sportive du Nde, en grande forme avec 8 buts en 15 matchs.

**Comment expliquez-vous cette saison exceptionnelle ?**
"Je travaille dur chaque jour. L'entraîneur m'a donné la liberté de me déplacer et mes coéquipiers me font confiance. Quand tout le monde tire dans le même sens, ça marche."

**Vous visez le titre de meilleur buteur ?**
"Bien sûr ! Je suis à 8 buts, le leader en a 13. C'est rattrapable. Il reste 11 matchdays."`,
      en: `Exclusive interview with the Panthere Sportive du Nde striker, in superb form with 8 goals in 15 matches.

**How do you explain this exceptional season?**
"I work hard every day. The coach gave me freedom of movement and my teammates trust me. When everyone pulls in the same direction, it works."

**Are you targeting the top scorer award?**
"Of course! I have 8 goals, the leader has 13. That is catchable. There are 11 matchdays left."`,
    },
    author: 'Diane Atangana',
    category: 'INTERVIEW',
    status: 'PUBLISHED',
    featured: false,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1/player-2.jpg',
    tags: ['interview', 'Panthere', 'buteur', 'Elite-One'],
    read_time: 4,
    views: 8150,
    publishedAt: daysAgo(10),
    comments: [],
  },

  // ── RESULTS ────────────────────────────────────────────────────────────────
  {
    slug: 'seed-results-j15-roundup',
    title: {
      fr: 'Résultats complets — Journée 15 de l\'Elite One 2025-26',
      en: 'Full results — Matchday 15 of Elite One 2025-26',
    },
    body: {
      fr: `Tous les résultats de la 15e journée disputée le 3 mai 2026 :

• As Fortuna Mfou **2-0** Canon de Yaoundé
• Stade Renard de Melong **7-3** Colombe Sportive du Dja et Lobo
• Unisport de Bafang **5-4** Cotonsport de Garoua
• Panthere Sportive du Nde **3-1** Gazelle FA
• Dynamo Club de Douala **2-1** PWD Bamenda
• Fauve Azur Elite FC **1-0** Victoria United
• Aigle Royale du Moungo **1-6** Aigle Royal de la Menoua

**33 buts en 7 matchs — 4.7 buts/match.** Journée spectaculaire.`,
      en: `All matchday 15 results from 3 May 2026:

• As Fortuna Mfou **2-0** Canon de Yaoundé
• Stade Renard de Melong **7-3** Colombe Sportive du Dja et Lobo
• Unisport de Bafang **5-4** Cotonsport de Garoua
• Panthere Sportive du Nde **3-1** Gazelle FA
• Dynamo Club de Douala **2-1** PWD Bamenda
• Fauve Azur Elite FC **1-0** Victoria United
• Aigle Royale du Moungo **1-6** Aigle Royal de la Menoua

**33 goals in 7 matches — 4.7 goals/match.** Spectacular matchday.`,
    },
    author: 'Admin Platform',
    category: 'RESULTS',
    status: 'PUBLISHED',
    featured: false,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1/news-3.jpg',
    tags: ['résultats', 'J15', 'Elite-One'],
    read_time: 2,
    views: 31200,
    publishedAt: daysAgo(2),
    comments: [],
  },
  {
    slug: 'seed-results-j14-roundup',
    title: {
      fr: 'Résultats complets — Journée 14 (retour)',
      en: 'Full results — Matchday 14 (return leg)',
    },
    body: {
      fr: `Résultats de la 14e journée :

• Colombe Sportive du Dja et Lobo **6-0** Canon de Yaoundé
• As Fortuna Mfou **1-1** Cotonsport de Garoua
• Stade Renard de Melong **4-1** Gazelle FA
• Unisport de Bafang **1-1** PWD Bamenda
• Panthere Sportive du Nde **1-1** Victoria United
• Dynamo Club de Douala **1-4** Aigle Royal de la Menoua
• Fauve Azur Elite FC **1-4** Aigle Royale du Moungo

Journée marquée par les performances de la Colombe et de l'Aigle de la Menoua.`,
      en: `Matchday 14 results:

• Colombe Sportive du Dja et Lobo **6-0** Canon de Yaoundé
• As Fortuna Mfou **1-1** Cotonsport de Garoua
• Stade Renard de Melong **4-1** Gazelle FA
• Unisport de Bafang **1-1** PWD Bamenda
• Panthere Sportive du Nde **1-1** Victoria United
• Dynamo Club de Douala **1-4** Aigle Royal de la Menoua
• Fauve Azur Elite FC **1-4** Aigle Royale du Moungo

Matchday marked by Colombe and Aigle de la Menoua performances.`,
    },
    author: 'Admin Platform',
    category: 'RESULTS',
    status: 'PUBLISHED',
    featured: false,
    cover_image: 'https://res.cloudinary.com/dbwumcxvq/image/upload/v1/news-1.jpg',
    tags: ['résultats', 'J14', 'Elite-One'],
    read_time: 2,
    views: 18400,
    publishedAt: daysAgo(9),
    comments: [],
  },

  // ── DRAFT ────────────────────────────────────────────────────────────────────
  {
    slug: 'seed-draft-j16-preview',
    title: {
      fr: 'J16 — Avant-match : Canon peut-il rebondir face à Gazelle ?',
      en: 'J16 — Preview: Can Canon bounce back against Gazelle?',
    },
    body: {
      fr: 'Article en cours de rédaction — avant-match journée 16.',
      en: 'Article in progress — matchday 16 preview.',
    },
    author: 'Diane Atangana',
    category: 'ANALYSIS',
    status: 'DRAFT',
    featured: false,
    cover_image: null,
    tags: ['J16', 'preview', 'Canon', 'Gazelle'],
    read_time: 4,
    views: 0,
    publishedAt: new Date(),
    comments: [],
  },
  {
    slug: 'seed-draft-awards-ballon-dor-nominees',
    title: {
      fr: 'Ballon d\'Or 2025 : les 5 nominés annoncés officiellement',
      en: 'Ballon d\'Or 2025: the 5 official nominees announced',
    },
    body: {
      fr: 'Article en cours de rédaction — annonce des nominés.',
      en: 'Article in progress — nominees announcement.',
    },
    author: 'Martial Biyong',
    category: 'CLUB_NEWS',
    status: 'DRAFT',
    featured: false,
    cover_image: null,
    tags: ['ballon-dor', 'awards', 'nominés'],
    read_time: 3,
    views: 0,
    publishedAt: new Date(),
    comments: [],
  },
];