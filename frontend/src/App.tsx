import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index        from "./pages/Index.tsx";
import { AuthPage } from "./pages/AuthPage.tsx";
import NotFound     from "./pages/NotFound.tsx";
import FixturesPage  from "./pages/FixturesPage.tsx";
import ResultsPage   from "./pages/ResultsPage.tsx";
import StandingsPage from "./pages/StandingsPage.tsx";
import StatsPage     from "./pages/StatsPage.tsx";
import NewsPage      from "./pages/NewsPage.tsx";
import ArticlePage   from "./pages/ArticlePage.tsx";
import EditorPage    from "./pages/EditorPage.tsx";
import AwardsPage         from "./pages/AwardsPage.tsx";
import BallonDorPage      from "./pages/BallonDorPage.tsx";
import VotePage           from "./pages/VotePage.tsx";
import TeamOfWeekPage     from "./pages/TeamOfWeekPage.tsx";
import ClubsPage          from "./pages/ClubsPage.tsx";
import ClubDetailPage     from "./pages/ClubDetailPage.tsx";
import PlayersPage        from "./pages/PlayersPage.tsx";
import PlayerDetailPage   from "./pages/PlayerDetailPage.tsx";
import HistoryPage        from "./pages/HistoryPage.tsx";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"                    element={<Index />} />
      <Route path="/login"               element={<AuthPage />} />
      <Route path="/register"            element={<AuthPage />} />
      <Route path="/fixtures"            element={<FixturesPage />} />
      <Route path="/results"             element={<ResultsPage />} />
      <Route path="/standings"           element={<StandingsPage />} />
      <Route path="/stats"               element={<StatsPage />} />
      <Route path="/news"                element={<NewsPage />} />
      <Route path="/news/:slug"          element={<ArticlePage />} />
      <Route path="/editor"              element={<EditorPage />} />
      <Route path="/awards"              element={<AwardsPage />} />
      <Route path="/awards/ballon-dor"   element={<BallonDorPage />} />
      <Route path="/awards/team-of-week" element={<TeamOfWeekPage />} />
      <Route path="/awards/vote"         element={<VotePage />} />
      <Route path="/clubs"               element={<ClubsPage />} />
      <Route path="/clubs/:id"           element={<ClubDetailPage />} />
      <Route path="/players"             element={<PlayersPage />} />
      <Route path="/players/:id"         element={<PlayerDetailPage />} />
      <Route path="/halloffame"          element={<HistoryPage />} />
      <Route path="*"                    element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;