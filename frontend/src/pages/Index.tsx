import { Navbar } from "@/components/elite/Navbar";
import { Hero } from "@/components/elite/Hero";
import { QuickStats } from "@/components/elite/QuickStats";
import { Fixtures } from "@/components/elite/Fixtures";
import { Results } from "@/components/elite/Results";
import { Standings } from "@/components/elite/Standings";
import { RoadToLions } from "@/components/elite/RoadToLions";
import { TopPlayers } from "@/components/elite/TopPlayers";
import { YoungTalents } from "@/components/elite/YoungTalents";
import { News } from "@/components/elite/News";
import { Awards } from "@/components/elite/Awards";
import { HallOfFame } from "@/components/elite/HallOfFame";
import { Footer } from "@/components/elite/Footer";

// ─── ClubStories removed per UX brief (carousel fatigue) ─────────────────────
// Max 2 carousels allowed: Awards + TopPlayers

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <h1 className="sr-only">MTN Elite One — Championnat de football professionnel du Cameroun</h1>

        {/* ① Full-bleed hero (3 slides max, tab nav, live match mode) */}
        <Hero />

        {/* ② Live Zone: stats bar + fixtures + results — visually unified */}
        <div className="border-b border-border/60 bg-gradient-to-b from-[hsl(168,45%,10%)] to-background">
          <QuickStats />
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border/40">
            <Fixtures />
            <Results />
          </div>
        </div>

        {/* ③ Standings — full width with position change indicators */}
        <Standings />

        {/* ④ Editorial break: Road to Lions */}
        <RoadToLions />

        {/* ⑤ Players zone — carousel (1 of 2 allowed) + Young Talents grid */}
        <div className="border-y border-border/40">
          <div className="container py-8 lg:py-10 grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
            <TopPlayers />
            <YoungTalents />
          </div>
        </div>

        {/* ⑥ Awards — carousel (2 of 2 allowed) */}
        <Awards />

        {/* ⑦ News — grid layout (no carousel) */}
        <div className="border-t border-border/40">
          <News />
          {/* ClubStories removed — replaced by richer News grid */}
        </div>

        {/* ⑧ Hall of Fame — cinematic closer before footer */}
        <HallOfFame />
      </main>
      <Footer />
    </div>
  );
};

export default Index;