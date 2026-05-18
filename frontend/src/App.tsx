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

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"            element={<Index />} />
      <Route path="/login"       element={<AuthPage />} />
      <Route path="/register"    element={<AuthPage />} />
      <Route path="/fixtures"    element={<FixturesPage />} />
      <Route path="/results"     element={<ResultsPage />} />
      <Route path="/standings"   element={<StandingsPage />} />
      <Route path="/stats"       element={<StatsPage />} />
      <Route path="/news"        element={<NewsPage />} />
      <Route path="/news/:slug"  element={<ArticlePage />} />
      <Route path="/editor"      element={<EditorPage />} />
      <Route path="*"            element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;