import { clubs } from '../components/elite/data';
import type {
  InjuryRecord, ClubMedicalReport,
  TransferRecord, ClubTransferActivity,
} from '../types/transfersInjuries.types';

// ─── Injuries ─────────────────────────────────────────────────────────────────

export const MOCK_INJURIES: InjuryRecord[] = [
  {
    id: 'inj-1', playerId: 'p1', playerName: 'Christian Bassogog', position: 'FW',
    club: clubs.cnk, bodyPart: 'Ischio-jambier', diagnosis: 'Élongation grade 2 de l\'ischio-jambier droit',
    severity: 'SEVERE', status: 'ACTIVE',
    injuredAt: '2026-05-18', expectedReturn: '2026-07-15', gamesMissed: 6,
    medicalNotes: 'Rééducation encadrée par le staff médical de Canon. Point de contrôle IRM prévu avant reprise collective.',
    updatedAt: '2026-06-28',
  },
  {
    id: 'inj-2', playerId: 'v-aboubakar', playerName: 'Vincent Aboubakar', position: 'FW',
    club: clubs.cot, bodyPart: 'Cheville', diagnosis: 'Entorse de la cheville gauche',
    severity: 'MODERATE', status: 'RECOVERING',
    injuredAt: '2026-06-02', expectedReturn: '2026-07-06', gamesMissed: 3,
    medicalNotes: 'A repris la course en ligne droite. Test de charge prévu cette semaine avant réintégration au groupe.',
    updatedAt: '2026-06-30',
  },
  {
    id: 'inj-3', playerId: 'a-anguissa', playerName: 'André-Frank Anguissa', position: 'MF',
    club: clubs.uds, bodyPart: 'Genou', diagnosis: 'Gêne au genou droit, suivi préventif',
    severity: 'MINOR', status: 'RECOVERING',
    injuredAt: '2026-06-20', expectedReturn: '2026-07-04', gamesMissed: 1,
    medicalNotes: 'Aucune lésion ligamentaire détectée. Charge d\'entraînement individualisée.',
    updatedAt: '2026-06-29',
  },
  {
    id: 'inj-4', playerId: 'p8', playerName: 'Marc Ekanga', position: 'DF',
    club: clubs.cnk, bodyPart: 'Mollet', diagnosis: 'Contracture du mollet gauche',
    severity: 'MINOR', status: 'CLEARED',
    injuredAt: '2026-06-10', expectedReturn: '2026-06-24', gamesMissed: 2,
    medicalNotes: 'Retour à l\'entraînement collectif validé par le staff médical.',
    updatedAt: '2026-06-25',
  },
  {
    id: 'inj-5', playerId: 'p13', playerName: 'Richard Njoh', position: 'GK',
    club: clubs.cot, bodyPart: 'Épaule', diagnosis: 'Luxation de l\'épaule droite',
    severity: 'SEVERE', status: 'ACTIVE',
    injuredAt: '2026-04-30', expectedReturn: '2026-08-10', gamesMissed: 10,
    medicalNotes: 'Suite opératoire, protocole de renforcement en cours. Retour à la compétition attendu en préparation estivale.',
    updatedAt: '2026-06-27',
  },
  {
    id: 'inj-6', playerId: 'p5', playerName: 'David Ngondo', position: 'FW',
    club: clubs.vict, bodyPart: 'Cuisse', diagnosis: 'Lésion musculaire au quadriceps',
    severity: 'MODERATE', status: 'ACTIVE',
    injuredAt: '2026-06-15', expectedReturn: '2026-07-20', gamesMissed: 4,
    medicalNotes: 'Programme de réathlétisation en piscine cette semaine, course prévue la semaine prochaine.',
    updatedAt: '2026-06-30',
  },
  {
    id: 'inj-7', playerId: 'p10', playerName: 'Serge Daura', position: 'MF',
    club: clubs.apb, bodyPart: 'Pied', diagnosis: 'Fracture de fatigue du 5e métatarsien',
    severity: 'SEVERE', status: 'ACTIVE',
    injuredAt: '2026-05-05', expectedReturn: '2026-09-01', gamesMissed: 12,
    medicalNotes: 'Immobilisation terminée, reprise de la marche en charge progressive.',
    updatedAt: '2026-06-22',
  },
  {
    id: 'inj-8', playerId: 'p14', playerName: 'Rostand Mbai', position: 'FW',
    club: clubs.cof, bodyPart: 'Commotion', diagnosis: 'Commotion cérébrale légère',
    severity: 'MODERATE', status: 'RECOVERING',
    injuredAt: '2026-06-24', expectedReturn: '2026-07-08', gamesMissed: 2,
    medicalNotes: 'Protocole commotion en 6 étapes, actuellement à l\'étape 3 (exercices sans contact).',
    updatedAt: '2026-06-30',
  },
  {
    id: 'inj-9', playerId: 'p9', playerName: 'Bello Yacouba', position: 'MF',
    club: clubs.cot, bodyPart: 'Dos', diagnosis: 'Lombalgie chronique',
    severity: 'MINOR', status: 'ACTIVE',
    injuredAt: '2026-06-27', expectedReturn: '2026-07-11', gamesMissed: 1,
    medicalNotes: 'Traitement anti-inflammatoire et séances de kinésithérapie quotidiennes.',
    updatedAt: '2026-06-29',
  },
  {
    id: 'inj-10', playerId: 'p15', playerName: 'Ibrahim Hamidou', position: 'MF',
    club: clubs.fov, bodyPart: 'Genou', diagnosis: 'Entorse bénigne du genou gauche',
    severity: 'MINOR', status: 'CLEARED',
    injuredAt: '2026-06-05', expectedReturn: '2026-06-19', gamesMissed: 2,
    medicalNotes: 'Repris l\'intégralité des entraînements collectifs.',
    updatedAt: '2026-06-20',
  },
  {
    id: 'inj-11', playerId: 'p6', playerName: 'Parfait Ndoumbe', position: 'MF',
    club: clubs.uds, bodyPart: 'Ischio-jambier', diagnosis: 'Alerte ischio-jambier droit, précaution',
    severity: 'MINOR', status: 'RECOVERING',
    injuredAt: '2026-06-26', expectedReturn: '2026-07-03', gamesMissed: 1,
    medicalNotes: 'Sorti à titre préventif, aucune lésion structurelle constatée à l\'échographie.',
    updatedAt: '2026-06-30',
  },
  {
    id: 'inj-12', playerId: 'p12', playerName: 'Edouard Sombang', position: 'DF',
    club: clubs.cnk, bodyPart: 'Cheville', diagnosis: 'Entorse sévère de la cheville droite',
    severity: 'SEVERE', status: 'ACTIVE',
    injuredAt: '2026-05-22', expectedReturn: '2026-07-25', gamesMissed: 7,
    medicalNotes: 'Botte de marche retirée, rééducation proprioceptive en cours.',
    updatedAt: '2026-06-26',
  },
];

/** Groups injuries by club and derives the medical-report summary used in the sidebar. */
export function buildClubMedicalReports(records: InjuryRecord[]): ClubMedicalReport[] {
  const byClub = new Map<string, InjuryRecord[]>();
  for (const r of records) {
    const list = byClub.get(r.club.id) ?? [];
    list.push(r);
    byClub.set(r.club.id, list);
  }
  const today = Date.now();
  return Array.from(byClub.entries())
    .map(([, injuries]) => {
      const activeCount = injuries.filter(i => i.status === 'ACTIVE').length;
      const recoveringCount = injuries.filter(i => i.status === 'RECOVERING').length;
      const totalDaysLost = injuries.reduce((sum, i) => {
        const start = new Date(i.injuredAt).getTime();
        const end = i.expectedReturn ? new Date(i.expectedReturn).getTime() : today;
        return sum + Math.max(0, Math.round((end - start) / 86_400_000));
      }, 0);
      return { club: injuries[0].club, activeCount, recoveringCount, totalDaysLost, injuries };
    })
    .sort((a, b) => (b.activeCount + b.recoveringCount) - (a.activeCount + a.recoveringCount));
}

// ─── Transfers ────────────────────────────────────────────────────────────────

const WINDOW = 'Été 2026';

export const MOCK_TRANSFERS: TransferRecord[] = [
  {
    id: 'tr-1', playerId: 't1', playerName: 'Salomon Mbarga', position: 'FW', age: 24,
    fromClub: clubs.apb, toClub: clubs.cot, kind: 'PERMANENT', stage: 'CONFIRMED', confidence: 5,
    fee: 45_000_000, windowLabel: WINDOW, transferDate: '2026-06-30', announced: true,
    source: 'Officiel', quote: 'Signature actée après visite médicale à Garoua.',
  },
  {
    id: 'tr-2', playerId: 't2', playerName: 'Jean-Pierre Etame', position: 'MF', age: 27,
    fromClub: clubs.cof, toClub: clubs.uds, kind: 'LOAN', stage: 'CONFIRMED', confidence: 5,
    fee: undefined, windowLabel: WINDOW, transferDate: '2026-06-28', announced: true,
    source: 'Officiel', quote: 'Prêt d\'une saison sans option d\'achat.',
  },
  {
    id: 'tr-3', playerId: 't3', playerName: 'Aboubakar Souaibou', position: 'DF', age: 22,
    fromClub: clubs.bam, toClub: clubs.pwd, kind: 'PERMANENT', stage: 'CONFIRMED', confidence: 5,
    fee: 18_000_000, windowLabel: WINDOW, transferDate: '2026-06-25', announced: true,
    source: 'Officiel',
  },
  {
    id: 'tr-4', playerId: 't4', playerName: 'Idrissou Yaya', position: 'FW', age: 25,
    fromClub: clubs.fov, toClub: clubs.vict, kind: 'LOAN', stage: 'CONFIRMED', confidence: 5,
    windowLabel: WINDOW, transferDate: '2026-06-20', announced: true, source: 'Officiel',
  },
  {
    id: 'tr-5', playerId: 't5', playerName: 'Marius Feugue', position: 'MF', age: 21,
    fromClub: clubs.cnk, toClub: clubs.cot, kind: 'PERMANENT', stage: 'IN_TALKS', confidence: 4,
    fee: 60_000_000, windowLabel: WINDOW, transferDate: '2026-07-01', announced: false,
    source: 'Journaliste local', quote: 'Accord de principe trouvé entre les deux clubs, détails personnels en discussion.',
  },
  {
    id: 'tr-6', playerId: 't6', playerName: 'Christopher Wooh', position: 'DF', age: 23,
    fromClub: null, toClub: clubs.cnk, kind: 'FREE', stage: 'RUMOR', confidence: 2,
    windowLabel: WINDOW, transferDate: '2026-07-02', announced: false,
    source: 'Rumeur presse', quote: 'Piste évoquée par plusieurs médias locaux, aucun contact confirmé à ce stade.',
  },
  {
    id: 'tr-7', playerId: 't7', playerName: 'Landry Nomo', position: 'GK', age: 26,
    fromClub: clubs.ymb, toClub: clubs.bam, kind: 'PERMANENT', stage: 'IN_TALKS', confidence: 3,
    fee: 12_000_000, windowLabel: WINDOW, transferDate: '2026-07-03', announced: false,
    source: 'Insider', quote: 'Négociations avancées, arrivée espérée avant le stage de reprise.',
  },
  {
    id: 'tr-8', playerId: 't8', playerName: 'Franck Zambo', position: 'MF', age: 29,
    fromClub: clubs.uds, toClub: clubs.cnk, kind: 'PERMANENT', stage: 'REJECTED', confidence: 1,
    windowLabel: WINDOW, transferDate: '2026-06-15', announced: false,
    source: 'Officiel', quote: 'Offre refusée par Union Douala, joueur non transférable cet été selon le club.',
  },
  {
    id: 'tr-9', playerId: 't9', playerName: 'Emmanuel Biyik', position: 'FW', age: 20,
    fromClub: clubs.cot, toClub: clubs.vict, kind: 'LOAN', stage: 'CONFIRMED', confidence: 5,
    windowLabel: WINDOW, transferDate: '2026-06-18', announced: true,
    source: 'Officiel', quote: 'Prêt formateur pour engranger du temps de jeu en attaque.',
  },
  {
    id: 'tr-10', playerId: 't10', playerName: 'Rodrigue Mvondo', position: 'DF', age: 28,
    fromClub: clubs.pwd, toClub: clubs.apb, kind: 'FREE', stage: 'CONFIRMED', confidence: 5,
    windowLabel: WINDOW, transferDate: '2026-06-12', announced: true, source: 'Officiel',
  },
  {
    id: 'tr-11', playerId: 't11', playerName: 'Steve Mvibudulu', position: 'MF', age: 24,
    fromClub: clubs.fov, toClub: clubs.cof, kind: 'PERMANENT', stage: 'RUMOR', confidence: 2,
    fee: 8_000_000, windowLabel: WINDOW, transferDate: '2026-07-04', announced: false,
    source: 'Rumeur presse', quote: 'Sondage informel de Colombe FC selon la presse régionale.',
  },
  {
    id: 'tr-12', playerId: 't12', playerName: 'Yannick Djeukam', position: 'FW', age: 22,
    fromClub: null, toClub: clubs.ymb, kind: 'FREE', stage: 'CONFIRMED', confidence: 5,
    windowLabel: WINDOW, transferDate: '2026-06-08', announced: true,
    source: 'Officiel', quote: 'Agent libre, signature d\'un contrat de deux saisons.',
  },
  {
    id: 'tr-13', playerId: 't13', playerName: 'Herve Kage', position: 'DF', age: 30,
    fromClub: clubs.vict, toClub: clubs.bam, kind: 'RETURN_FROM_LOAN', stage: 'CONFIRMED', confidence: 5,
    windowLabel: WINDOW, transferDate: '2026-06-05', announced: true, source: 'Officiel',
  },
  {
    id: 'tr-14', playerId: 't14', playerName: 'Junior Onana', position: 'MF', age: 19,
    fromClub: clubs.cot, toClub: clubs.cnk, kind: 'PERMANENT', stage: 'IN_TALKS', confidence: 3,
    fee: 30_000_000, windowLabel: WINDOW, transferDate: '2026-07-05', announced: false,
    source: 'Insider', quote: 'Jeune talent suivi de près, discussions entamées avec l\'entourage du joueur.',
  },
  {
    id: 'tr-15', playerId: 't15', playerName: 'Patrick Ekeng Jr.', position: 'FW', age: 23,
    fromClub: clubs.apb, toClub: clubs.uds, kind: 'LOAN', stage: 'RUMOR', confidence: 2,
    windowLabel: WINDOW, transferDate: '2026-07-06', announced: false,
    source: 'Rumeur presse', quote: 'Nom évoqué en cas de départ d\'un attaquant à Union Douala.',
  },
];

/** Aggregates transfer volume per club — powers the "Club Activity" leaderboard. */
export function buildClubActivity(records: TransferRecord[]): ClubTransferActivity[] {
  const map = new Map<string, ClubTransferActivity>();
  const ensure = (club: TransferRecord['toClub']) => {
    if (!map.has(club.id)) {
      map.set(club.id, { club, arrivals: 0, departures: 0, totalIn: 0, totalOut: 0, net: 0 });
    }
    return map.get(club.id)!;
  };
  for (const t of records) {
    if (t.stage !== 'CONFIRMED') continue;
    const to = ensure(t.toClub);
    to.arrivals += 1;
    to.totalIn += t.fee ?? 0;
    if (t.fromClub) {
      const from = ensure(t.fromClub);
      from.departures += 1;
      from.totalOut += t.fee ?? 0;
    }
  }
  for (const activity of map.values()) activity.net = activity.totalOut - activity.totalIn;
  return Array.from(map.values()).sort((a, b) => (b.arrivals + b.departures) - (a.arrivals + a.departures));
}
