import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse } from 'lucide-react';
import PageLayout from '@/layout/PageLayout';
import { PageHero } from '@/components/elite/FootballPrimitives';
import { useInjuries } from '@/hooks/useFootball';
import { buildClubMedicalReports } from '@/services/transfersInjuriesUtils';
import type { InjuryRecord } from '@/types/transfersInjuries.types';

import { InjuriesStatStrip } from '@/components/elite/injuries/InjuriesStatStrip';
import { InjuriesFilterBar, type InjuryStatusFilter } from '@/components/elite/injuries/InjuriesFilterBar';
import { InjuryRow } from '@/components/elite/injuries/InjuryRow';
import { ClubMedicalReportList } from '@/components/elite/injuries/ClubMedicalReportList';

export default function InjuriesPage() {
  const { data: injuries, isLoading } = useInjuries();
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState<InjuryStatusFilter>('ALL');
  const [clubId, setClubId]       = useState<string | null>(null);

  const list = (injuries ?? []) as InjuryRecord[];

  const counts = useMemo(() => ({
    ALL:        list.length,
    ACTIVE:     list.filter(i => i.status === 'ACTIVE').length,
    RECOVERING: list.filter(i => i.status === 'RECOVERING').length,
    CLEARED:    list.filter(i => i.status === 'CLEARED').length,
  }), [list]);

  const clubReports = useMemo(() => buildClubMedicalReports(list), [list]);

  const filtered = useMemo(() => {
    return list
      .filter(i => status === 'ALL' || i.status === status)
      .filter(i => !clubId || i.club.id === clubId)
      .filter(i => i.playerName.toLowerCase().includes(search.trim().toLowerCase()))
      .sort((a, b) => {
        const order: Record<string, number> = { ACTIVE: 0, RECOVERING: 1, CLEARED: 2 };
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [list, status, clubId, search]);

  return (
    <PageLayout>
      <PageHero
        eyebrow="MTN Elite One · Infirmerie"
        title="Blessures & Disponibilités"
        subtitle="Statuts médicaux, délais de retour estimés et rapports club en temps réel"
        accentColor="red"
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 text-destructive px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
            <HeartPulse className="h-3 w-3" />
            {counts.ACTIVE} forfaits actifs
          </span>
        }
      />

      <div className="container py-8 lg:py-10 space-y-6">
        <InjuriesStatStrip
          total={counts.ALL}
          active={counts.ACTIVE}
          recovering={counts.RECOVERING}
          cleared={counts.CLEARED}
        />

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
          {/* ── Main list ── */}
          <div className="space-y-4 min-w-0">
            <InjuriesFilterBar
              search={search} onSearch={setSearch}
              status={status} onStatus={setStatus}
              counts={counts}
            />

            <div className="bg-gradient-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
              {isLoading && (
                <div className="p-10 text-center text-sm text-muted-foreground">Chargement de l'infirmerie…</div>
              )}

              <AnimatePresence initial={false}>
                {!isLoading && filtered.length === 0 && (
                  <div className="p-10 text-center text-sm text-muted-foreground">
                    Aucun joueur ne correspond à ces filtres.
                  </div>
                )}
                {!isLoading && filtered.map((injury, i) => (
                  <InjuryRow key={injury.id} injury={injury} index={i} />
                ))}
              </AnimatePresence>
            </div>

            {clubId && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setClubId(null)}
                className="text-xs text-accent hover:underline"
              >
                ← Voir tous les clubs
              </motion.button>
            )}
          </div>

          {/* ── Sidebar: club medical reports ── */}
          <div className="lg:sticky lg:top-24">
            <ClubMedicalReportList reports={clubReports} activeClubId={clubId} onSelect={setClubId} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
