'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react'; // 🛡️ Import manquant
import { Toaster } from 'react-hot-toast';         // 🍞 Pour les notifications
import { ReactNode, useState } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  // 1. Initialisation du cache React Query
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  return (
    // 🛡️ Étape CRUCIALE : On entoure tout avec le SessionProvider
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        
        {/* Ajout du Toaster ici pour qu'il soit disponible globalement */}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#0B0F1A',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            }
          }} 
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}