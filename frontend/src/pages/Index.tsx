import { useState, useEffect } from "react";
import { Navbar }           from "@/components/elite/Navbar";
import { Hero }             from "@/components/elite/Hero";
import { QuickStats }       from "@/components/elite/QuickStats";
import { Fixtures }         from "@/components/elite/Fixtures";
import { Results }          from "@/components/elite/Results";
import { Standings }        from "@/components/elite/Standings";
import { News }             from "@/components/elite/News";
import { TopPlayers }       from "@/components/elite/TopPlayers";
import { YoungTalents }     from "@/components/elite/YoungTalents";
import { Awards }           from "@/components/elite/Awards";
import { RoadToLions }      from "@/components/elite/RoadToLions";
import { HallOfFame }       from "@/components/elite/HallOfFame";
import { TransfersInjuries }from "@/components/elite/TransfersInjuries";
import { Footer }           from "@/components/elite/Footer";
import { CommandPalette }   from "@/components/elite/CommandPalette";

// ─── Section wrapper with consistent vertical rhythm ──────────────────────────
// All sections use this for uniform spacing instead of scattered py-* values.
const Section = ({
  children,
  className = "",
  flush = false,
}: {
  children: React.ReactNode;
  className?: string;
  flush?: boolean;
}) => (
  <section
    className={`${flush ? "" : "py-12 lg:py-16"} ${className}`}
  >
    {children}
  </section>
);

// ─── Divider ─────────────────────────────────────────────────────────────────
const Divider = ({ faint = false }: { faint?: boolean }) => (
  <div className={`w-full h-px ${faint ? "bg-border/30" : "bg-border/60"}`} />
);

const Index = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Command palette */}
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Sticky navbar */}
      <Navbar onSearchOpen={() => setSearchOpen(true)} />

      <main className="flex flex-col">
        <h1 className="sr-only">
          MTN Elite One — Championnat de football professionnel du Cameroun
        </h1>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            1 ·  HERO  — full-bleed, no container, no top padding
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <Hero />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            2 · LIVE ZONE — stats + fixtures + results
                Visually unified with subtle top-gradient
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="bg-gradient-to-b from-[hsl(168,45%,9%)] to-background border-b border-border/50">
          <div className="container">
            {/* Quick stats strip */}
            <Section flush>
              <div className="pt-10 pb-6">
                <QuickStats />
              </div>
            </Section>

            {/* Fixtures + Results side by side */}
            <Divider faint />
            <div className="grid lg:grid-cols-[1.15fr_0.85fr] divide-y lg:divide-y-0 lg:divide-x divide-border/35">
              <div className="py-10 lg:pr-8">
                <Fixtures />
              </div>
              <div className="py-10 lg:pl-8">
                <Results />
              </div>
            </div>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            3 · STANDINGS — full-width table
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="container">
          <Section>
            <Standings />
          </Section>
        </div>

        <Divider />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            4 · NEWS — moved up (directly below standings)
                Max engagement: fresh content early in scroll
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="bg-gradient-to-b from-background to-[hsl(168,40%,10%)]">
          <div className="container">
            <Section>
              <News />
            </Section>
          </div>
        </div>

        <Divider faint />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            5 · PLAYERS ZONE — Top Players + Young Talents
                Side by side on desktop
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="container">
          <Section>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              <TopPlayers />
              <YoungTalents />
            </div>
          </Section>
        </div>

        <Divider />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            6 · AWARDS — voting + team of the week
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="bg-gradient-to-b from-[hsl(168,40%,9%)] to-background">
          <div className="container">
            <Section>
              <Awards />
            </Section>
          </div>
        </div>

        <Divider faint />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            7 · ROAD TO LIONS — full bleed editorial section
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <RoadToLions />

        <Divider faint />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            8 · TRANSFERS & INJURIES
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="container">
          <Section>
            <TransfersInjuries />
          </Section>
        </div>

        <Divider faint />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            9 · HALL OF FAME — cinematic closer
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="container">
          <Section>
            <HallOfFame />
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;