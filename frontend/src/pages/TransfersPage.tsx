import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import PageLayout from '@/layout/PageLayout';
import { PageHero } from '@/components/elite/FootballPrimitives';
import { useTransfers } from '@/hooks/useFootball';
import { buildClubActivity } from '@/services/transfersInjuriesUtils';
import type { TransferRecord } from '@/types/transfersInjuries.types';

import { TransfersStatStrip } from '@/components/elite/transfers/TransfersStatStrip';
import { TransfersFilterBar, type TransferStageFilter } from '@/components/elite/transfers/TransfersFilterBar';
import { TransferCard } from '@/components/elite/transfers/TransferCard';
import { TransferTimeline } from '@/components/elite/transfers/TransferTimeline';
import { ClubActivityBoard } from '@/components/elite/transfers/ClubActivityBoard';

export default function TransfersPage() {
  const { data: transfers, isLoading } = useTransfers();
  const [search, setSearch] = useState('');
  const [stage, setStage]   = useState<TransferStageFilter>('ALL');

  const list = (transfers ?? []) as TransferRecord[];

  const counts = useMemo(() => ({
    ALL:       list.length,
    CONFIRMED: list.filter(t => t.stage === 'CONFIRMED').length,
    IN_TALKS:  list.filter(t => t.stage === 'IN_TALKS').length,
    RUMOR:     list.filter(t => t.stage === 'RUMOR').length,
    REJECTED:  list.filter(t => t.stage === 'REJECTED').length,
    LOAN:      list.filter(t => t.kind === 'LOAN').length,
  }), [list]);

  const totalSpend = useMemo(
    () => list.filter(t => t.stage === 'CONFIRMED').reduce((s, t) => s + (t.fee ?? 0), 0),
    [list],
  );

  const clubActivity = useMemo(() => buildClubActivity(list), [list]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list
      .filter(t => {
        if (stage === 'ALL') return true;
        if (stage === 'LOAN') return t.kind === 'LOAN';
        return t.stage === stage;
      })
      .filter(t =>
        !q ||
        t.playerName.toLowerCase().includes(q) ||
        t.toClub.name.toLowerCase().includes(q) ||
        (t.fromClub?.name.toLowerCase().includes(q) ?? false),
      )
      .sort((a, b) => new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime());
  }, [list, stage, search]);

  return (
    <PageLayout>
      <PageHero
        eyebrow="MTN Elite One · Mercato"
        title="Transferts & Rumeurs"
        subtitle="Signatures officielles, négociations en cours et activité des clubs — fenêtre Été 2026"
        accentColor="gold"
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-glow/15 text-primary-glow px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
            <ArrowLeftRight className="h-3 w-3" />
            {counts.CONFIRMED} officiels
          </span>
        }
      />

      <div className="container py-8 lg:py-10 space-y-6">
        <TransfersStatStrip
          confirmed={counts.CONFIRMED}
          inTalks={counts.IN_TALKS}
          rumors={counts.RUMOR}
          totalSpend={totalSpend}
        />

        <TransferTimeline transfers={list} />

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
          {/* ── Main list ── */}
          <div className="space-y-4 min-w-0">
            <TransfersFilterBar
              search={search} onSearch={setSearch}
              stage={stage} onStage={setStage}
              counts={counts}
            />

            <div className="bg-gradient-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
              {isLoading && (
                <div className="p-10 text-center text-sm text-muted-foreground">Chargement du mercato…</div>
              )}
              <AnimatePresence initial={false}>
                {!isLoading && filtered.length === 0 && (
                  <div className="p-10 text-center text-sm text-muted-foreground">
                    Aucun mouvement ne correspond à ces filtres.
                  </div>
                )}
                {!isLoading && filtered.map((t, i) => (
                  <TransferCard key={t.id} transfer={t} index={i} />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Sidebar: club activity ── */}
          <div className="lg:sticky lg:top-24">
            <ClubActivityBoard activity={clubActivity} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
