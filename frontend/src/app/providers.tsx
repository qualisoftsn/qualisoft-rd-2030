/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛠️ MODULE : PROVIDERS (GLOBAL CONTEXTS)
 * RÔLE : Enveloppe globale des contextes (React Query + Auth)
 * VERSION : 3.0 - Typing strict + Error Boundary
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';
import AuthProvider from '@/providers/AuthProvider';
import { Toaster } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export interface ProvidersProps {
  children: ReactNode;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* 🛡️ AUTHENTICATION SOUVERAINE */}
      <AuthProvider>
        {/* 📬 TOAST NOTIFICATIONS */}
        <Toaster 
          position="top-right" 
          richColors 
          theme="dark" 
          closeButton
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0B0F1A',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              fontFamily: 'inherit',
              fontStyle: 'italic',
              fontWeight: '900',
            },
          }}
        />
        
        {/* 👨‍💻 DEVTOOLS (Production disabled) */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        )}
        
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}