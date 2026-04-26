import { Navbar } from "@/components/elite/Navbar";
import { Hero } from "@/components/elite/Hero";
import { QuickStats } from "@/components/elite/QuickStats";
import { Fixtures } from "@/components/elite/Fixtures";
import { Results } from "@/components/elite/Results";
import { Standings } from "@/components/elite/Standings";
import { RoadToLions } from "@/components/elite/RoadToLions";
import { TopPlayers } from "@/components/elite/TopPlayers";
import { YoungTalents, ClubStories } from "@/components/elite/YoungTalents";
import { News } from "@/components/elite/News";
import { Awards } from "@/components/elite/Awards";
import { HallOfFame } from "@/components/elite/HallOfFame";
import { Footer } from "@/components/elite/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <h1 className="sr-only">MTN Elite One — Championnat de football professionnel du Cameroun</h1>
        <Hero />
        <QuickStats />
        <Fixtures />
        <Results />
        <Standings />
        <RoadToLions />
        <TopPlayers />
        <Awards />
        <News />
        <YoungTalents />
        <HallOfFame />
        <ClubStories />
      </main>
      <Footer />
    </div>
  );
};

export default Index;