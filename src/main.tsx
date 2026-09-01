import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { I18nProvider } from '@/components/i18n/I18nProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import App from './App';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="bytic-ui-theme">
        <I18nProvider>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
