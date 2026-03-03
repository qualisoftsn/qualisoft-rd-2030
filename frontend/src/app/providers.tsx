/**
 * 🛠️ MODULE : providers.tsx
 * -------------------------------------------------------------------------
 * RÔLE : Enveloppe globale des contextes (React Query + Sovereign Auth).
 * CORRECTIF : Pointage vers le nouveau dossier /src/providers/.
 * RÉVISION : 03 Mars 2026 | 08:30 GMT
 */

"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
// ✅ IMPORT CORRIGÉ : On pointe vers la nouvelle Sentinelle
import AuthProvider from '@/providers/AuthProvider'; 

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {/* 🛡️ AUTHENTICATION SOUVERAINE RD-2026 */}
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}