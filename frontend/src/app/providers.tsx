'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/core/providers/auth-provider'; 
import { ReactNode, useState } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  // On crÃ©e le client pour gÃ©rer le cache des donnÃ©es
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));

  return (
    // ðŸ›¡ï¸ SESSION PROVIDER : L'enveloppe vitale pour l'identitÃ© SDE
    
      <QueryClientProvider client={queryClient}>
        {children}
        {/* Note : Le Toaster est dÃ©jÃ  gÃ©rÃ© dans layout.tsx, inutile de le remettre ici */}
      </QueryClientProvider>
    
  );
}