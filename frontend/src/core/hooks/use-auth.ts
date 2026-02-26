/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// core/hooks/use-auth.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authManager } from '@/core/auth/auth-manager';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(authManager.getIsAuthenticated());
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // ✅ ÉCOUTE DES CHANGEMENTS DE TOKEN
    const unsubscribe = authManager.onTokenChange((token) => {
      setIsAuthenticated(!!token);
      
      if (token) {
        // Récupération sécurisée des infos utilisateur via API (pas de localStorage !)
        fetch('/api/auth/session')
          .then(res => res.json())
          .then(data => setUser(data.user))
          .catch(() => {
            authManager.clear();
            router.push('/login?session=expired');
          });
      } else {
        setUser(null);
      }
    });

    // ✅ VÉRIFICATION INITIALE DE LA SESSION
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.isAuthenticated) {
            authManager.setToken(data.accessToken, data.expiresIn);
            setUser(data.user);
          } else {
            authManager.clear();
          }
        } else {
          authManager.clear();
        }
      } catch (error) {
        authManager.clear();
      }
    };

    checkSession();
    return unsubscribe;
  }, [router]);

  const signOut = async () => {
    await authManager.signOut();
    router.push('/login');
  };

  return { isAuthenticated, user, signOut };
}