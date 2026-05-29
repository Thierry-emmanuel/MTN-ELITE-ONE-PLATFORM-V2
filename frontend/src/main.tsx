import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';

// ─── React Query client ───────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:        60_000,   // 1 min — don't refetch if data is fresh
      retry:            1,        // 1 retry on failure before showing error
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Mount ────────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);