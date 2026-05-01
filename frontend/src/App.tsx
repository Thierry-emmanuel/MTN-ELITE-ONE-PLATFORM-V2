import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index.tsx";
import { AuthPage } from "./pages/AuthPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import FixturesPage from "./pages/FixturesPage.tsx";
import ResultsPage from "./pages/ResultsPage.tsx";
import StandingsPage from "./pages/StandingsPage.tsx";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"           element={<Index />} />
      <Route path="/login"      element={<AuthPage />} />
      <Route path="/register"   element={<AuthPage />} />
      <Route path="/fixtures"   element={<FixturesPage />} />
      <Route path="/results"    element={<ResultsPage />} />
      <Route path="/standings"  element={<StandingsPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;