'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react'; 
import { ReactNode, useState } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  // On crée le client pour gérer le cache des données
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));

  return (
    // 🛡️ SESSION PROVIDER : L'enveloppe vitale pour l'identité SDE
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* Note : Le Toaster est déjà géré dans layout.tsx, inutile de le remettre ici */}
      </QueryClientProvider>
    </SessionProvider>
  );
}