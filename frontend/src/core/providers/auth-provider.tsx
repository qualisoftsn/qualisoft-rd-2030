/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// core/providers/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authManager } from '@/core/auth/auth-manager';

interface AuthContextType {
  isAuthenticated: boolean;
  isMasterSession: boolean;
  user: any | null;
  tenantSlug: string;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMasterSession, setIsMasterSession] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tenantSlug, setTenantSlug] = useState('matrix');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ DÉTECTION INITIALE DU TENANT VIA SOUS-DOMAINE
    const slug = authManager.getCurrentTenantSlugPublic();
    setTenantSlug(slug);

    // ✅ ÉCOUTE DES CHANGEMENTS DE TOKEN
    const unsubscribe = authManager.onTokenChange((token) => {
      setIsAuthenticated(!!token);
      setIsMasterSession(authManager.getIsMasterSession());
      
      if (token) {
        fetch('/api/auth/session', { credentials: 'include' })
          .then(res => res.json())
          .then(data => {
            if (data.isAuthenticated) {
              setUser(data.user);
            } else {
              authManager.clear();
              setUser(null);
            }
            setIsLoading(false);
          })
          .catch(() => {
            authManager.clear();
            setUser(null);
            setIsLoading(false);
          });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // ✅ VÉRIFICATION INITIALE DE LA SESSION AU MONTAGE
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.isAuthenticated && data.accessToken) {
            authManager.setToken(data.accessToken, data.expiresIn, data.isMaster);
            setUser(data.user);
            setIsMasterSession(data.isMaster);
          } else {
            authManager.clear();
          }
        } else {
          authManager.clear();
        }
      } catch (error) {
        authManager.clear();
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
    return unsubscribe;
  }, []);

  const signOut = async () => {
    await authManager.signOut();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isMasterSession, 
        user, 
        tenantSlug, 
        isLoading, 
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}