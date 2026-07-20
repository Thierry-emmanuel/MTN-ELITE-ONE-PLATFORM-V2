import type {
  InjuryRecord, ClubMedicalReport,
  TransferRecord, ClubTransferActivity,
} from '../types/transfersInjuries.types';

/**
 * Sprint 2 (de-mock) — pure aggregation helpers extracted from the deleted
 * transfersInjuriesMockData.ts. They only transform records passed to them;
 * no mock content survives here.
 */

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
