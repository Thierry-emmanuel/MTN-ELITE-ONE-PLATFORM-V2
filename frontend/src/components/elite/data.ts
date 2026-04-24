// Mock data for MTN Elite One platform — replace with API later
export type Club = { id: string; name: string; short: string; color: string; city: string };

export const clubs: Record<string, Club> = {
  cot: { id: "cot", name: "Coton Sport", short: "COT", color: "#FFD400", city: "Garoua" },
  uds: { id: "uds", name: "Union Douala", short: "UDS", color: "#1E3A8A", city: "Douala" },
  pwd: { id: "pwd", name: "PWD Bamenda", short: "PWD", color: "#1F8A4C", city: "Bamenda" },
  cnk: { id: "cnk", name: "Canon Yaoundé", short: "CNK", color: "#CE1126", city: "Yaoundé" },
  ymb: { id: "ymb", name: "Young Sports", short: "YMB", color: "#0EA5E9", city: "Bamenda" },
  apb: { id: "apb", name: "APEJES Mfou", short: "APB", color: "#7C3AED", city: "Mfou" },
  cof: { id: "cof", name: "Colombe FC", short: "COF", color: "#FB923C", city: "Sangmélima" },
  vict: { id: "vict", name: "Victoria United", short: "VIC", color: "#10B981", city: "Limbe" },
  fov: { id: "fov", name: "Fovu Baham", short: "FOV", color: "#EF4444", city: "Baham" },
  bam: { id: "bam", name: "Bamboutos", short: "BAM", color: "#A78BFA", city: "Mbouda" },
};

export const heroSlides = [
  {
    kicker: "MATCHDAY 18 · J18",
    title: "Le Choc des Lions",
    subtitle: "Coton Sport reçoit Canon Yaoundé dans un duel décisif pour la tête du classement.",
    home: clubs.cot, away: clubs.cnk, time: "Sam · 16:00", venue: "Stade Roumdé Adjia",
  },
  {
    kicker: "EN DIRECT · LIVE",
    title: "PWD vs Union Douala",
    subtitle: "Suivez le derby de l'Ouest minute par minute, statistiques en temps réel.",
    home: clubs.pwd, away: clubs.uds, time: "62’ · 1-1", venue: "Stade de Bamenda", live: true,
  },
  {
    kicker: "ROAD TO LIONS",
    title: "5 Joueurs Convoqués",
    subtitle: "La sélection nationale appelle cinq talents de la MTN Elite One pour les éliminatoires CAN.",
    home: clubs.vict, away: clubs.apb, time: "Dim · 14:30", venue: "Stade Omnisport",
  },
];

export const fixtures = [
  { home: clubs.cot, away: clubs.cnk, date: "Sam 26 Avr", time: "16:00", status: "À venir", countdown: "2j 04h" },
  { home: clubs.pwd, away: clubs.uds, date: "Sam 26 Avr", time: "18:30", status: "Live", countdown: "62’" },
  { home: clubs.vict, away: clubs.apb, date: "Dim 27 Avr", time: "14:30", status: "À venir", countdown: "2j 18h" },
  { home: clubs.cof, away: clubs.fov, date: "Dim 27 Avr", time: "16:00", status: "À venir", countdown: "3j 02h" },
  { home: clubs.bam, away: clubs.ymb, date: "Lun 28 Avr", time: "15:00", status: "À venir", countdown: "4j 01h" },
];

export const results = [
  { home: clubs.cnk, away: clubs.uds, hs: 2, as: 1, date: "21 Avr" },
  { home: clubs.cot, away: clubs.pwd, hs: 3, as: 0, date: "21 Avr" },
  { home: clubs.vict, away: clubs.fov, hs: 1, as: 1, date: "20 Avr" },
  { home: clubs.apb, away: clubs.ymb, hs: 0, as: 2, date: "20 Avr" },
  { home: clubs.cof, away: clubs.bam, hs: 2, as: 2, date: "19 Avr" },
  { home: clubs.cot, away: clubs.cof, hs: 4, as: 1, date: "14 Avr" },
];

export const standings = [
  { pos: 1, club: clubs.cot, p: 17, gd: 22, pts: 38, form: ["W","W","D","W","W"] },
  { pos: 2, club: clubs.cnk, p: 17, gd: 14, pts: 34, form: ["W","D","W","W","L"] },
  { pos: 3, club: clubs.uds, p: 17, gd: 11, pts: 31, form: ["L","W","W","D","W"] },
  { pos: 4, club: clubs.pwd, p: 17, gd: 8,  pts: 29, form: ["D","W","L","W","D"] },
  { pos: 5, club: clubs.vict, p: 17, gd: 5, pts: 27, form: ["W","D","D","L","W"] },
  { pos: 6, club: clubs.apb, p: 17, gd: 2,  pts: 24, form: ["L","W","D","W","L"] },
  { pos: 7, club: clubs.cof, p: 17, gd: -1, pts: 22, form: ["D","D","W","L","D"] },
  { pos: 8, club: clubs.ymb, p: 17, gd: -3, pts: 20, form: ["L","L","W","D","W"] },
];

export const transfers = [
  { player: "Salomon Mbarga", from: clubs.apb, to: clubs.cot, type: "Permanent" },
  { player: "Jean-Pierre Etame", from: clubs.cof, to: clubs.uds, type: "Prêt" },
  { player: "Aboubakar Souaibou", from: clubs.bam, to: clubs.pwd, type: "Permanent" },
  { player: "Idrissou Yaya", from: clubs.fov, to: clubs.vict, type: "Prêt" },
];

export const injuries = [
  { player: "Christian Bassogog", club: clubs.cnk, type: "Ischio-jambier", status: "Forfait", color: "destructive" },
  { player: "Vincent Aboubakar", club: clubs.cot, type: "Cheville", status: "Incertain", color: "draw" },
  { player: "André-Frank Anguissa", club: clubs.uds, type: "Genou", status: "Récupération", color: "primary" },
];

export const news = [
  { tag: "PRÉVIEW", img: "news-1", title: "Coton Sport — Canon : duel de titans à Garoua", desc: "Le leader reçoit le 2e dans un match qui pourrait sceller le titre." },
  { tag: "TACTIQUE", img: "news-2", title: "Comment PWD a réinventé son jeu de possession", desc: "Analyse du 4-3-3 hybride qui bouscule la hiérarchie du championnat." },
  { tag: "LIONS", img: "news-3", title: "Cinq Élite One appelés en sélection nationale", desc: "Le sélectionneur mise sur le championnat local pour les éliminatoires." },
];
