'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMasterSession, setIsMasterSession] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tenantSlug, setTenantSlug] = useState('matrix');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Détection du tenant via hostname
    const slug = authManager.getCurrentTenantSlugPublic();
    setTenantSlug(slug);

    // 2. Écoute des changements de session
    const unsubscribe = authManager.onTokenChange((token) => {
      setIsAuthenticated(!!token);
      setIsMasterSession(authManager.getIsMasterSession());
    });

    // 3. Vérification de session au démarrage
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.isAuthenticated) {
            authManager.setToken(data.accessToken, data.expiresIn, data.isMaster);
            setUser(data.user);
            setIsMasterSession(data.isMaster);
          }
        }
      } catch (error) {
        console.error("Erreur de synchronisation Matrix:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
    return unsubscribe;
  }, []);

  const signOut = async () => {
    await authManager.signOut();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isMasterSession, user, tenantSlug, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}