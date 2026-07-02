// ─── Core Types ───────────────────────────────────────────────────────────────
export type Club = { id: string; name: string; short: string; color: string; city: string };

export const clubs: Record<string, Club> = {
  cot:  { id: "cot",  name: "Coton Sport",    short: "COT", color: "#FFD400", city: "Garoua" },
  uds:  { id: "uds",  name: "Union Douala",    short: "UDS", color: "#1E3A8A", city: "Douala" },
  pwd:  { id: "pwd",  name: "PWD Bamenda",     short: "PWD", color: "#1F8A4C", city: "Bamenda" },
  cnk:  { id: "cnk",  name: "Canon Yaoundé",   short: "CNK", color: "#CE1126", city: "Yaoundé" },
  ymb:  { id: "ymb",  name: "Young Sports",    short: "YMB", color: "#0EA5E9", city: "Bamenda" },
  apb:  { id: "apb",  name: "APEJES Mfou",     short: "APB", color: "#7C3AED", city: "Mfou" },
  cof:  { id: "cof",  name: "Colombe FC",      short: "COF", color: "#FB923C", city: "Sangmélima" },
  vict: { id: "vict", name: "Victoria United", short: "VIC", color: "#10B981", city: "Limbe" },
  fov:  { id: "fov",  name: "Fovu Baham",      short: "FOV", color: "#EF4444", city: "Baham" },
  bam:  { id: "bam",  name: "Bamboutos",       short: "BAM", color: "#A78BFA", city: "Mbouda" },
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
export type HeroSlideType = "match" | "result" | "player" | "coach" | "news" | "halloffame" | "young";

export type HeroSlide = {
  type: HeroSlideType;
  kicker: string;
  title: string;
  subtitle: string;
  accent?: string;
  home?: Club; away?: Club;
  time?: string; venue?: string;
  live?: boolean; score?: string;
  tag?: string;
  imgKey?: string;
};

export const heroSlides: HeroSlide[] = [
  {
    type: "match",
    kicker: "MATCHDAY 18 · J18",
    title: "Le Choc des Lions",
    subtitle: "Coton Sport reçoit Canon Yaoundé dans un duel décisif pour la tête du classement.",
    home: clubs.cot, away: clubs.cnk,
    time: "Sam · 16:00", venue: "Stade Roumdé Adjia",
    accent: "#FFD400",
  },
  {
    type: "match",
    kicker: "EN DIRECT · LIVE",
    title: "PWD vs Union Douala",
    subtitle: "Derby de l'Ouest — statistiques et buts en temps réel.",
    home: clubs.pwd, away: clubs.uds,
    time: "62'", venue: "Stade de Bamenda", live: true, score: "1 - 1",
    accent: "#1F8A4C",
  },
  {
    type: "player",
    kicker: "JOUEUR DE LA SEMAINE",
    title: "Salomon Mbarga",
    subtitle: "14 buts en 17 matchs. Le serial buteur de Coton Sport porte son équipe vers le titre.",
    tag: "Attaquant · Coton Sport",
    accent: "#FCD116", imgKey: "p2",
  },
  {
    type: "coach",
    kicker: "COACH DE LA SEMAINE",
    title: "Martin Ndoumbe",
    subtitle: "3 victoires consécutives, possession dominante à 62%. La méthode Ndoumbe fait école.",
    tag: "Coach · Coton Sport",
    accent: "#008751", imgKey: "coach1",
  },
  {
    type: "news",
    kicker: "BREAKING NEWS",
    title: "5 Élite One aux Lions",
    subtitle: "La sélection nationale appelle cinq talents du championnat pour les éliminatoires CAN 2025.",
    tag: "Sélection nationale",
    accent: "#008751",
  },
  {
    type: "halloffame",
    kicker: "HALL OF FAME · INDUCTEE",
    title: "Thomas N'Kono",
    subtitle: "Le gardien légendaire du Cameroun intègre officiellement le Temple de la Renommée de l'Elite One.",
    tag: "Gardien légendaire",
    accent: "#CE1126", imgKey: "l3",
  },
  {
    type: "young",
    kicker: "YOUNG TALENT WATCH",
    title: "Nathan Douala, 17 ans",
    subtitle: "Le milieu prodige de Victoria United affole les radars européens avec 6 buts et 4 passes cette saison.",
    tag: "Milieu · Victoria United",
    accent: "#FCD116", imgKey: "yt1",
  },
];

// ─── Fixtures & Results ───────────────────────────────────────────────────────
export const fixtures = [
  { home: clubs.cot,  away: clubs.cnk,  date: "Sam 26 Avr", time: "16:00", status: "À venir", countdown: "2j 04h" },
  { home: clubs.pwd,  away: clubs.uds,  date: "Sam 26 Avr", time: "18:30", status: "Live",    countdown: "62'" },
  { home: clubs.vict, away: clubs.apb,  date: "Dim 27 Avr", time: "14:30", status: "À venir", countdown: "2j 18h" },
  { home: clubs.cof,  away: clubs.fov,  date: "Dim 27 Avr", time: "16:00", status: "À venir", countdown: "3j 02h" },
  { home: clubs.bam,  away: clubs.ymb,  date: "Lun 28 Avr", time: "15:00", status: "À venir", countdown: "4j 01h" },
];

export const results = [
  { home: clubs.cnk,  away: clubs.uds,  hs: 2, as: 1, date: "21 Avr" },
  { home: clubs.cot,  away: clubs.pwd,  hs: 3, as: 0, date: "21 Avr" },
  { home: clubs.vict, away: clubs.fov,  hs: 1, as: 1, date: "20 Avr" },
  { home: clubs.apb,  away: clubs.ymb,  hs: 0, as: 2, date: "20 Avr" },
  { home: clubs.cof,  away: clubs.bam,  hs: 2, as: 2, date: "19 Avr" },
  { home: clubs.cot,  away: clubs.cof,  hs: 4, as: 1, date: "14 Avr" },
];

// ─── Standings ────────────────────────────────────────────────────────────────
export const standings = [
  { pos: 1, club: clubs.cot,  p: 17, w: 12, d: 2, l: 3, gd: 22,  pts: 38, form: ["W","W","D","W","W"] as FormResult[] },
  { pos: 2, club: clubs.cnk,  p: 17, w: 10, d: 4, l: 3, gd: 14,  pts: 34, form: ["W","D","W","W","L"] as FormResult[] },
  { pos: 3, club: clubs.uds,  p: 17, w: 9,  d: 4, l: 4, gd: 11,  pts: 31, form: ["L","W","W","D","W"] as FormResult[] },
  { pos: 4, club: clubs.pwd,  p: 17, w: 8,  d: 5, l: 4, gd: 8,   pts: 29, form: ["D","W","L","W","D"] as FormResult[] },
  { pos: 5, club: clubs.vict, p: 17, w: 7,  d: 6, l: 4, gd: 5,   pts: 27, form: ["W","D","D","L","W"] as FormResult[] },
  { pos: 6, club: clubs.apb,  p: 17, w: 6,  d: 6, l: 5, gd: 2,   pts: 24, form: ["L","W","D","W","L"] as FormResult[] },
  { pos: 7, club: clubs.cof,  p: 17, w: 5,  d: 7, l: 5, gd: -1,  pts: 22, form: ["D","D","W","L","D"] as FormResult[] },
  { pos: 8, club: clubs.ymb,  p: 17, w: 4,  d: 8, l: 5, gd: -3,  pts: 20, form: ["L","L","W","D","W"] as FormResult[] },
];
export type FormResult = "W" | "D" | "L";

// ─── News ─────────────────────────────────────────────────────────────────────
export type TagColor = "gold" | "green" | "red" | "blue";

export type NewsItem = {
  id: string; tag: string; tagColor: TagColor;
  img: string; title: string; desc: string;
  readTime: string; date: string; featured?: boolean;
};

export const news: NewsItem[] = [
  { id:"n1", tag:"PRÉVIEW",  tagColor:"gold",  img:"news-1", title:"Coton Sport — Canon : duel de titans à Garoua",          desc:"Le leader reçoit le 2e dans un match au sommet qui pourrait sceller le titre dès cette journée.", readTime:"5 min", date:"22 Avr", featured:true },
  { id:"n2", tag:"TACTIQUE", tagColor:"green", img:"news-2", title:"Comment PWD a réinventé son jeu de possession",           desc:"Analyse du 4-3-3 hybride qui bouscule la hiérarchie du championnat.", readTime:"4 min", date:"21 Avr" },
  { id:"n3", tag:"LIONS",    tagColor:"red",   img:"news-3", title:"Cinq Élite One appelés en sélection nationale",           desc:"Le sélectionneur mise sur le championnat local pour les éliminatoires CAN 2025.", readTime:"3 min", date:"20 Avr" },
];

// ─── Coaches ──────────────────────────────────────────────────────────────────
export type Coach = {
  id: string; name: string; club: Club;
  nationality: string; age: number;
  trophies: number; winRate: number;
  imgKey: string; formation: string;
};

export const coaches: Record<string, Coach> = {
  ndoumbe: { id:"ndoumbe", name:"Martin Ndoumbe",  club: clubs.cot,  nationality:"🇨🇲", age:52, trophies:4, winRate:71, imgKey:"coach1", formation:"4-3-3" },
  manga:   { id:"manga",   name:"Roger Manga",      club: clubs.cnk,  nationality:"🇨🇲", age:47, trophies:2, winRate:64, imgKey:"coach2", formation:"4-2-3-1" },
  bello:   { id:"bello",   name:"Issa Bello",       club: clubs.uds,  nationality:"🇨🇲", age:44, trophies:1, winRate:59, imgKey:"coach1", formation:"3-5-2" },
};

// ─── Awards ───────────────────────────────────────────────────────────────────
export type AwardCategory = "player" | "coach" | "club";
export type AwardType = "potw" | "potm" | "pots" | "topscorer" | "topassist" | "youngtitle" | "improved" | "cotw" | "cotm" | "cots" | "totw" | "tots";

export type AwardEntry = {
  type: AwardType; category: AwardCategory;
  label: string; period: string;
  name: string; club: Club;
  position: string;
  stat: string; statLabel: string;
  rating: number; imgKey: string;
  votes?: number; isVotingOpen?: boolean;
  coachId?: string;
};

export const awards: AwardEntry[] = [
  // ── Player awards ──
  { type:"potw",       category:"player", label:"Joueur de la Semaine",  period:"J18 · 14-21 Avr", name:"Salomon Mbarga",    club:clubs.cot,  position:"Attaquant",        stat:"2",  statLabel:"Buts · J18",       rating:9.2, imgKey:"p2",   votes:12482, isVotingOpen:true },
  { type:"potm",       category:"player", label:"Joueur du Mois",        period:"Avril 2025",       name:"Idrissou Yaya",     club:clubs.vict, position:"Milieu offensif",  stat:"4",  statLabel:"Buts · Avr",       rating:8.7, imgKey:"p3" },
  { type:"pots",       category:"player", label:"Joueur de la Saison",   period:"Saison 24/25",     name:"Jean-Pierre Etame", club:clubs.uds,  position:"Défenseur",        stat:"9",  statLabel:"Clean sheets",     rating:8.9, imgKey:"p1" },
  { type:"topscorer",  category:"player", label:"Top Buteur",            period:"Saison 24/25",     name:"Salomon Mbarga",    club:clubs.cot,  position:"Attaquant",        stat:"14", statLabel:"Buts",             rating:9.0, imgKey:"p2" },
  { type:"topassist",  category:"player", label:"Top Passeur",           period:"Saison 24/25",     name:"A. Souaibou",       club:clubs.pwd,  position:"Milieu",           stat:"9",  statLabel:"Passes D.",        rating:8.4, imgKey:"p1" },
  { type:"youngtitle", category:"player", label:"Jeune Talent",          period:"Saison 24/25",     name:"Nathan Douala",     club:clubs.vict, position:"Milieu · 17 ans",  stat:"6",  statLabel:"Buts",             rating:8.1, imgKey:"yt1" },
  { type:"improved",   category:"player", label:"Meilleur Progrès",      period:"Saison 24/25",     name:"R. Mbai",           club:clubs.fov,  position:"Ailier",           stat:"+2.1",statLabel:"Δ Rating",       rating:7.9, imgKey:"p3" },
  // ── Coach awards ──
  { type:"cotw",       category:"coach",  label:"Coach de la Semaine",   period:"J18",              name:"Martin Ndoumbe",    club:clubs.cot,  position:"Coach · 4-3-3",    stat:"3",  statLabel:"Victoires J",      rating:8.8, imgKey:"coach1", isVotingOpen:true },
  { type:"cotm",       category:"coach",  label:"Coach du Mois",         period:"Avril 2025",       name:"Roger Manga",       club:clubs.cnk,  position:"Coach · 4-2-3-1",  stat:"71%",statLabel:"Win Rate",        rating:8.3, imgKey:"coach2" },
  { type:"cots",       category:"coach",  label:"Coach de la Saison",    period:"Saison 24/25",     name:"Martin Ndoumbe",    club:clubs.cot,  position:"Coach · 4-3-3",    stat:"38", statLabel:"Points",           rating:9.1, imgKey:"coach1" },
];

// ─── Team of the Week ─────────────────────────────────────────────────────────
export type TotWPlayer = {
  posCode: string; posLabel: string;
  name: string; shortName: string;
  club: Club; rating: number; imgKey: string;
  row: number; col: number; // grid position (row 0=ATT … row 4=GK)
};

// 4-3-3 formation — row 0 = attack, row 4 = goalkeeper
export const teamOfTheWeek: TotWPlayer[] = [
  // Attackers (row 0)
  { posCode:"LW", posLabel:"Ailier G",   name:"Edouard Sombang",  shortName:"Sombang",  club:clubs.cof,  rating:8.1, imgKey:"p3", row:0, col:0 },
  { posCode:"ST", posLabel:"Attaquant",  name:"Salomon Mbarga",   shortName:"Mbarga",   club:clubs.cot,  rating:9.2, imgKey:"p2", row:0, col:1 },
  { posCode:"RW", posLabel:"Ailier D",   name:"David Ngondo",     shortName:"Ngondo",   club:clubs.apb,  rating:7.8, imgKey:"p3", row:0, col:2 },
  // Midfielders (row 1)
  { posCode:"LM", posLabel:"Milieu G",   name:"A. Souaibou",      shortName:"Souaibou", club:clubs.pwd,  rating:8.4, imgKey:"p1", row:1, col:0 },
  { posCode:"CM", posLabel:"Milieu C",   name:"Idrissou Yaya",    shortName:"I.Yaya",   club:clubs.vict, rating:8.7, imgKey:"p3", row:1, col:1 },
  { posCode:"RM", posLabel:"Milieu D",   name:"C. Bassogog",      shortName:"Bassogog", club:clubs.cnk,  rating:8.0, imgKey:"p2", row:1, col:2 },
  // Defenders (row 2)
  { posCode:"LB", posLabel:"Défenseur G",name:"P. Mbida",         shortName:"Mbida",    club:clubs.pwd,  rating:7.6, imgKey:"p1", row:2, col:0 },
  { posCode:"CB", posLabel:"Défenseur C",name:"J.P. Etame",       shortName:"Etame",    club:clubs.uds,  rating:8.9, imgKey:"p1", row:2, col:1 },
  { posCode:"CB", posLabel:"Défenseur C",name:"R. Njoh",          shortName:"Njoh",     club:clubs.cot,  rating:7.7, imgKey:"p2", row:2, col:2 },
  { posCode:"RB", posLabel:"Défenseur D",name:"B. Kameni",        shortName:"Kameni",   club:clubs.cot,  rating:7.5, imgKey:"p3", row:2, col:3 },
  // GK (row 3)
  { posCode:"GK", posLabel:"Gardien",    name:"A. Nsangou",       shortName:"Nsangou",  club:clubs.cnk,  rating:8.1, imgKey:"p1", row:3, col:0 },
];

export const coachOfTheWeek = coaches.ndoumbe;

// ─── Top Players ──────────────────────────────────────────────────────────────
export const scorers = [
  { name:"S. Mbarga",   club:clubs.cot,  val:14, imgKey:"p2" },
  { name:"I. Yaya",     club:clubs.vict, val:11, imgKey:"p3" },
  { name:"J.P. Etame",  club:clubs.uds,  val:9,  imgKey:"p1" },
  { name:"A. Souaibou", club:clubs.pwd,  val:8,  imgKey:"p1" },
];

export const assistLeaders = [
  { name:"A. Souaibou", club:clubs.pwd,  val:9, imgKey:"p1" },
  { name:"C. Bassogog", club:clubs.cnk,  val:7, imgKey:"p3" },
  { name:"V. Aboubakar",club:clubs.cot,  val:6, imgKey:"p2" },
  { name:"D. Ngondo",   club:clubs.apb,  val:5, imgKey:"p2" },
];

// ─── Young Talents ────────────────────────────────────────────────────────────
export type YoungTalent = {
  id: string; name: string; age: number;
  club: Club; position: string;
  goals: number; assists: number; rating: number;
  nationality: string; potential: number; // 0-100
  imgKey: string; story: string;
};

export const youngTalents: YoungTalent[] = [
  { id:"yt1", name:"Nathan Douala",  age:17, club:clubs.vict, position:"Milieu offensif", goals:6,  assists:4, rating:7.9, nationality:"🇨🇲", potential:91, imgKey:"yt1",  story:"Découvert en académie à 14 ans, il afole les radars européens." },
  { id:"yt2", name:"Serge Daura",    age:19, club:clubs.cot,  position:"Attaquant",       goals:8,  assists:2, rating:7.7, nationality:"🇨🇲", potential:87, imgKey:"yt2",  story:"Meilleur jeune de la saison passée, confirmé avec 8 buts." },
  { id:"yt3", name:"Rostand Mbai",   age:20, club:clubs.fov,  position:"Ailier droit",    goals:5,  assists:5, rating:7.5, nationality:"🇨🇲", potential:84, imgKey:"p3",   story:"Dribbleur d'exception qui fait parler de lui depuis J5." },
];

// ─── Road to Lions ────────────────────────────────────────────────────────────
export const lions = [
  { name:"Salomon Mbarga",    club:clubs.cot,  caps:12, pos:"Attaquant",  imgKey:"p2", likelihood:92 },
  { name:"Idrissou Yaya",     club:clubs.vict, caps:8,  pos:"Milieu",     imgKey:"p3", likelihood:78 },
  { name:"Jean-Pierre Etame", club:clubs.uds,  caps:4,  pos:"Défenseur",  imgKey:"p1", likelihood:65 },
];

// ─── Club Stories ─────────────────────────────────────────────────────────────
export type ClubStory = {
  id: string; club: Club; headline: string;
  body: string; tag: string; tagColor: TagColor;
};

export const clubStories: ClubStory[] = [
  { id:"cs1", club:clubs.cot,  headline:"L'empire jaune en marche",         body:"10 matchs sans défaite. Coton Sport ressemble de plus en plus au champion qu'il veut redevenir.", tag:"Momentum",    tagColor:"gold"  },
  { id:"cs2", club:clubs.cnk,  headline:"Canon retrouve ses crocs",          body:"Quatre victoires de rang sous Manga. L'ancien géant du football camerounais se réveille.", tag:"Remontada",   tagColor:"red"   },
  { id:"cs3", club:clubs.vict, headline:"Victoria : la surprise de la saison",body:"Promu il y a deux ans, Victoria United défie l'ordre établi avec le meilleur jeune du championnat.", tag:"Sensation",   tagColor:"green" },
];

// ─── Match Insights ───────────────────────────────────────────────────────────
export type MatchInsight = {
  home: Club; away: Club;
  homeStat: number; awayStat: number;
  label: string;
};

export const matchInsights = {
  possession:  { home:clubs.cot, away:clubs.cnk, homeStat:62, awayStat:38, label:"Possession %" },
  shots:       { home:clubs.cot, away:clubs.cnk, homeStat:14, awayStat: 7, label:"Tirs" },
  passes:      { home:clubs.cot, away:clubs.cnk, homeStat:487,awayStat:294,label:"Passes" },
  xg:          { home:clubs.cot, away:clubs.cnk, homeStat:2.4,awayStat:0.8,label:"xG" },
};

// ─── Live Ticker ──────────────────────────────────────────────────────────────
export const extendedTickerItems = [
  "⚽ 62' — PWD Bamenda 1-1 Union Douala · But de Souaibou (pen.)",
  "🔴 58' — Canon Yaoundé vs Colombe FC · Expulsion Fouda (2J)",
  "📋 J19 · Coton Sport vs Canon Yaoundé · Sam 26 Avr · 16:00",
  "🏆 Awards · Vote pour le Joueur de la Semaine ouvert jusqu'à dimanche",
  "🇨🇲 Lions Indomptables · 5 joueurs Elite One convoqués · CAN 2025",
  "📈 Salomon Mbarga atteint les 14 buts — record de la saison",
  "🌟 Nathan Douala · Jeune talent du mois · Victoria United",
  "💊 Blessure — Vincent Aboubakar incertain pour J19 · Coton Sport",
  "🔄 Mercato — Idrissou Yaya (Victoria) sur les tablettes de Coton Sport",
  "📊 Statistique — 2.4 buts par match en moyenne cette saison",
];

export const tickerItems = extendedTickerItems;

// ─── Hall of Fame ─────────────────────────────────────────────────────────────
export type Legend = {
  id: string; name: string; era: string;
  achievement: string; position: string;
  caps: number; goals: number;
  imgKey: string; club?: string; number: number;
  quote: string; quoteBy: string;
};

export const legends: Legend[] = [
  { id:"abega",    name:"Théophile Abega",    era:"1972 — 1988", achievement:"Capitaine · Champion d'Afrique 1984 · Ballon d'Or Africain",
    position:"Milieu",    caps:96,  goals:14, imgKey:"abega",    club:"Canon Yaoundé", number:10,
    quote:"Porter le brassard, c'était porter tout un pays sur les épaules.", quoteBy:"Théophile Abega, dit « Doctor »" },
  { id:"nkono",    name:"Thomas N'Kono",      era:"1976 — 1994", achievement:"Double Champion d'Afrique · Icône mondiale des gardiens",
    position:"Gardien",   caps:112, goals:0,  imgKey:"nkono",    club:"Canon Yaoundé", number:1,
    quote:"Entre les poteaux, la peur n'a jamais eu sa place.", quoteBy:"Thomas N'Kono" },
  { id:"manga",    name:"Jean Manga Onguene", era:"1970 — 1984", achievement:"Ballon d'Or Africain · Légende de Canon Yaoundé",
    position:"Attaquant", caps:74,  goals:41, imgKey:"manga",    club:"Canon Yaoundé", number:9,
    quote:"Chaque but marqué était un cadeau que je faisais à mon peuple.", quoteBy:"Jean Manga Onguene" },
  { id:"idrissou", name:"Mohammed Idrissou",  era:"1998 — 2012", achievement:"Buteur redouté de Bundesliga · International camerounais",
    position:"Attaquant", caps:38,  goals:12, imgKey:"idrissou", club:"SC Fribourg",   number:11,
    quote:"Le maillot des Lions se défend avec le cœur avant les jambes.", quoteBy:"Mohammed Idrissou" },
  { id:"toube",    name:"Toubé Charles",      era:"1980 — 1994", achievement:"Pilier historique de la défense des Lions Indomptables",
    position:"Défenseur", caps:64,  goals:3,  imgKey:"toube",    club:"Canon Yaoundé", number:4,
    quote:"On ne franchissait pas ma ligne sans laisser des traces de sueur.", quoteBy:"Toubé Charles" },
];

// ─── Transfers & Injuries ─────────────────────────────────────────────────────
export const transfers = [
  { player:"Salomon Mbarga",     from:clubs.apb, to:clubs.cot,  type:"Permanent" },
  { player:"Jean-Pierre Etame",  from:clubs.cof, to:clubs.uds,  type:"Prêt" },
  { player:"Aboubakar Souaibou", from:clubs.bam, to:clubs.pwd,  type:"Permanent" },
  { player:"Idrissou Yaya",      from:clubs.fov, to:clubs.vict, type:"Prêt" },
];

export const injuries = [
  { player:"Christian Bassogog",   club:clubs.cnk, type:"Ischio-jambier", status:"Forfait",      color:"destructive" },
  { player:"Vincent Aboubakar",    club:clubs.cot, type:"Cheville",       status:"Incertain",    color:"draw" },
  { player:"André-Frank Anguissa", club:clubs.uds, type:"Genou",          status:"Récupération", color:"primary" },
];
