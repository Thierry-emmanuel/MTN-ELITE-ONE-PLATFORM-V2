import { memo } from 'react';
import { Medal } from 'lucide-react';
import { SectionHeading, Reveal } from './ClubSectionShell';
import type { Club, ClubRecordEntry } from '@/types/football.types';

interface ClubRecordsProps {
  club: Club;
  records: ClubRecordEntry[];
}

/**
 * Club Records — the all-time marks: most appearances, most goals, most
 * clean sheets, biggest win, longest unbeaten run.
 */
export const ClubRecords = memo(({ club, records }: ClubRecordsProps) => {
  const primary = club.color || '#FCD116';

  return (
    <>
      <SectionHeading
        icon={Medal}
        room="Salle 09"
        title="Records du Club"
        subtitle="Les marques qui tiennent encore, gravées dans l'histoire de l'institution."
        accentColor={primary}
      />

      {records.length === 0 ? (
        <p className="text-sm text-white/40">Records en cours de constitution.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((r, i) => (
            <Reveal key={r.category} delay={i * 0.05}>
              <div className="border border-white/10 bg-white/[0.02] hover:border-white/25 transition-colors p-6 space-y-2">
                <span className="text-[9px] uppercase tracking-[0.24em] font-semibold text-white/40">{r.category}</span>
                <div className="font-display text-3xl font-black" style={{ color: primary }}>{r.value}</div>
                <div className="text-sm font-bold text-white">{r.holder}</div>
                {r.detail && <p className="text-[10px] text-white/40">{r.detail}</p>}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
});
ClubRecords.displayName = 'ClubRecords';
