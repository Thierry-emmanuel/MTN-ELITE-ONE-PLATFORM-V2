import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PageLayout from "@/layout/PageLayout";

// ─── Route-level code splitting ───────────────────────────────────────────────
// Each page is its own chunk — first-load JS drops significantly.

const HomePage         = lazy(() => import("./pages/HomePage"));
const AuthPage        = lazy(() => import("./pages/AuthPage").then(m => ({ default: m.AuthPage })));
const NotFound        = lazy(() => import("./pages/NotFound"));
const FixturesPage    = lazy(() => import("./pages/FixturesPage"));
const ResultsPage     = lazy(() => import("./pages/ResultsPage"));
const StandingsPage   = lazy(() => import("./pages/StandingsPage"));
const StatsPage       = lazy(() => import("./pages/StatsPage"));
const NewsPage        = lazy(() => import("./pages/NewsPage"));
const ArticlePage     = lazy(() => import("./pages/ArticlePage"));
const EditorPage      = lazy(() => import("./pages/EditorPage"));
const AwardsPage      = lazy(() => import("./pages/AwardsPage"));
const BallonDorPage   = lazy(() => import("./pages/BallonDorPage"));
const VotePage        = lazy(() => import("./pages/VotePage"));
const TeamOfWeekPage  = lazy(() => import("./pages/TeamOfWeekPage"));
const ClubsPage       = lazy(() => import("./pages/ClubsPage"));
const ClubDetailPage  = lazy(() => import("./pages/ClubDetailPage"));
const PlayersPage     = lazy(() => import("./pages/PlayersPage"));
const PlayerDetailPage = lazy(() => import("./pages/PlayerDetailPage"));
const HistoryPage     = lazy(() => import("./pages/HistoryPage"));

// ─── Route-level loading skeleton ─────────────────────────────────────────────
const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 rounded-full border-2 border-accent/40 border-t-accent animate-spin" />
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground/40">Chargement</span>
    </div>
  </div>
);

// ─── Pages that include their own Navbar (homepage hero is special) ────────────
// The homepage renders its own Navbar inline so the hero can sit flush against it.
// All other pages use PageLayout for the shared nav + footer shell.

const App = () => (
  <BrowserRouter>
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Homepage — manages its own layout for the hero flush effect */}
        <Route path="/"  element={<HomePage />} />

        {/* Auth pages — no footer */}
        <Route path="/login"    element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* All inner pages — wrapped in shared PageLayout */}
        <Route path="/fixtures"            element={<PageLayout><FixturesPage /></PageLayout>} />
        <Route path="/results"             element={<PageLayout><ResultsPage /></PageLayout>} />
        <Route path="/standings"           element={<PageLayout><StandingsPage /></PageLayout>} />
        <Route path="/stats"               element={<PageLayout><StatsPage /></PageLayout>} />
        <Route path="/news"                element={<PageLayout><NewsPage /></PageLayout>} />
        <Route path="/news/:slug"          element={<PageLayout><ArticlePage /></PageLayout>} />
        <Route path="/editor"              element={<PageLayout><EditorPage /></PageLayout>} />
        <Route path="/awards"              element={<PageLayout><AwardsPage /></PageLayout>} />
        <Route path="/awards/ballon-dor"   element={<PageLayout><BallonDorPage /></PageLayout>} />
        <Route path="/awards/team-of-week" element={<PageLayout><TeamOfWeekPage /></PageLayout>} />
        <Route path="/awards/vote"         element={<PageLayout><VotePage /></PageLayout>} />
        <Route path="/clubs"               element={<PageLayout><ClubsPage /></PageLayout>} />
        <Route path="/clubs/:id"           element={<PageLayout><ClubDetailPage /></PageLayout>} />
        <Route path="/players"             element={<PageLayout><PlayersPage /></PageLayout>} />
        <Route path="/players/:id"         element={<PageLayout><PlayerDetailPage /></PageLayout>} />
        <Route path="/halloffame"          element={<PageLayout><HistoryPage /></PageLayout>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;