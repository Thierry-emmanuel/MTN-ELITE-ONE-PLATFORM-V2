import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Radio } from "lucide-react";
import { useFixtures, useResults, useTransfers, useInjuries } from "@/hooks/useFootball";
import { useTeamOfWeek } from "@/hooks/useAwards";
import { ClubLogo } from "@/components/ui/football";
import { youngTalents } from "./data";
import { statusLabel } from "@/utils/football.utils";
import type { Match, MatchDay } from "@/types/football.types";

import yt1 from "@/assets/images/youngtalents/NathanDouala.png";

// ─────────────────────────────────────────────────────────────────────────────
// Today's Football — an editorial strip, not a card grid.
// Six dispatches from across the league, read left to right like a ledger:
// each entry is a line of type, not a box with a shadow.
// ─────────────────────────────────────────────────────────────────────────────

interface Entry {
  index: string;
  eyebrow: string;
  live?: boolean;
  visual: React.ReactNode;
  headline: string;
  meta: string;
  to: string;
}

function flatten(days: MatchDay[] | undefined): Match[] {
  return days ? days.flatMap((d) => d.matches) : [];
}

const money = (fcfa?: number) => {
  if (!fcfa) return "Montant non communiqué";
  if (fcfa >= 1_000_000) return `${(fcfa / 1_000_000).toFixed(1)} M FCFA`;
  return `${Math.round(fcfa / 1000)}k FCFA`;
};

export const TodaysFootball = () => {
  const { data: fixtureDays } = useFixtures();
  const { data: resultDays } = useResults();
  const { data: transfers } = useTransfers();
  const { data: injuries } = useInjuries();
  const { data: teamOfWeek } = useTeamOfWeek();

  const entries: Entry[] = useMemo(() => {
    const list: Entry[] = [];

    // 01 — Live or next match
    const fixtures = flatten(fixtureDays as MatchDay[] | undefined);
    const live = fixtures.find((m) => m.status === "LIVE" || m.status === "HT");
    const next = live ?? fixtures
      .filter((m) => m.status === "SCHEDULED")
      .sort((a, b) => +new Date(a.kickoffUtc) - +new Date(b.kickoffUtc))[0];
    if (next) {
      const { text, isLive } = statusLabel(next.status, next.liveMinute);
      list.push({
        index: "01",
        eyebrow: isLive ? "Match en direct" : "Prochain match",
        live: isLive,
        visual: (
          <div className="flex items-center gap-2">
            <ClubLogo club={next.homeClub} size={28} />
            <span className="font-display italic text-sm text-white/30">vs</span>
            <ClubLogo club={next.awayClub} size={28} />
          </div>
        ),
        headline: `${next.homeClub.name} — ${next.awayClub.name}`,
        meta: isLive ? text : `Journée ${next.round}`,
        to: "/fixtures",
      });
    }

    // 02 — Latest result
    const results = flatten(resultDays as MatchDay[] | undefined)
      .filter((m) => m.status === "FT" || m.status === "FINISHED")
      .sort((a, b) => +new Date(b.kickoffUtc) - +new Date(a.kickoffUtc));
    const result = results[0];
    if (result) {
      list.push({
        index: "02",
        eyebrow: "Dernier résultat",
        visual: (
          <div className="flex items-center gap-2">
            <ClubLogo club={result.homeClub} size={28} />
            <span className="font-display text-sm text-white/60 tabular-nums">
              {result.homeScore}–{result.awayScore}
            </span>
            <ClubLogo club={result.awayClub} size={28} />
          </div>
        ),
        headline: `${result.homeClub.short ?? result.homeClub.name} bat ${result.awayClub.short ?? result.awayClub.name}`,
        meta: `Journée ${result.round}`,
        to: "/results",
      });
    }

    // 03 — Transfer
    const transfer = transfers?.[0];
    if (transfer) {
      list.push({
        index: "03",
        eyebrow: transfer.stage === "CONFIRMED" ? "Transfert officiel" : "Rumeur de transfert",
        visual: <ClubLogo club={transfer.toClub} size={28} />,
        headline: `${transfer.playerName} rejoint ${transfer.toClub.name}`,
        meta: transfer.fee ? money(transfer.fee) : transfer.windowLabel,
        to: "/transfers",
      });
    }

    // 04 — Injury
    const injury = [...(injuries ?? [])].sort(
      (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
    )[0];
    if (injury) {
      list.push({
        index: "04",
        eyebrow: "Rapport médical",
        visual: <ClubLogo club={injury.club} size={28} />,
        headline: `${injury.playerName} — ${injury.bodyPart.toLowerCase()}`,
        meta: injury.status === "ACTIVE" ? "Indisponible" : injury.status === "RECOVERING" ? "En reprise" : "Rétabli",
        to: "/injuries",
      });
    }

    // 05 — Young talent
    const talent = youngTalents[0];
    if (talent) {
      list.push({
        index: "05",
        eyebrow: "Jeune talent à suivre",
        visual: (
          <div className="h-9 w-9 overflow-hidden rounded-full border border-white/15">
            <img src={yt1} alt={talent.name} className="h-full w-full object-cover object-top" />
          </div>
        ),
        headline: `${talent.name}, ${talent.age} ans`,
        meta: `${talent.potential}% de potentiel · ${talent.club.name}`,
        to: "/talents",
      });
    }

    // 06 — Award / distinction
    const totw = teamOfWeek;
    list.push({
      index: "06",
      eyebrow: "Distinction de la semaine",
      visual: <span className="font-display italic text-lg text-accent">★</span>,
      headline: totw?.period
        ? `Équipe type — ${totw.period}`
        : "Équipe type de la semaine dévoilée",
      meta: "Votes ouverts",
      to: "/awards/team-of-week",
    });

    return list;
  }, [fixtureDays, resultDays, transfers, injuries, teamOfWeek]);

  if (entries.length === 0) return null;

  return (
    <section className="border-b border-border/40 bg-[hsl(168,45%,9%)]">
      <div className="container py-14 lg:py-20">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-3 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-10 bg-accent" />
              <span className="text-[11px] font-semibold uppercase tracking-[.3em] text-accent">
                L'essentiel du jour
              </span>
            </div>
            <h2 className="font-display text-4xl leading-[1.05] text-foreground lg:text-5xl">
              Aujourd'hui, dans le
              <br className="hidden sm:block" /> football camerounais.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground/70">
            Six lignes, six histoires — le pouls de la Élite One, mis à jour en continu.
          </p>
        </div>

        {/* Ledger */}
        <div className="border-t border-border/40">
          {entries.map((e, i) => (
            <motion.div
              key={e.index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={e.to}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border/40 py-5 transition-colors hover:bg-white/[0.025] sm:grid-cols-[3rem_auto_1fr_auto] sm:gap-6 sm:py-6"
              >
                <span className="hidden font-display text-lg text-white/15 sm:block">{e.index}</span>

                <span className="shrink-0">{e.visual}</span>

                <span className="min-w-0">
                  <span className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.2em] text-muted-foreground/60">
                    {e.live && <Radio className="h-2.5 w-2.5 animate-pulse text-live" />}
                    {e.eyebrow}
                  </span>
                  <span className="block truncate font-display text-lg text-foreground sm:text-xl">
                    {e.headline}
                  </span>
                </span>

                <span className="hidden shrink-0 items-center gap-4 sm:flex">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground/60">{e.meta}</span>
                  <ArrowUpRight className="h-4 w-4 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
