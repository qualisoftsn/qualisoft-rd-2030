import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/axios';

interface TenantConfig {
  id: string;
  name: string;
  logo: string;
  primaryColor?: string;
  modules: string[];
}

interface TenantContextData {
  tenant: TenantConfig | null;
  isLoading: boolean;
  isError: boolean;
}

const TenantContext = createContext<TenantContextData>({
  tenant: null,
  isLoading: true,
  isError: false,
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];

        // On ne charge la config que si on est sur un sous-domaine client
        if (subdomain && subdomain !== 'localhost' && subdomain !== 'elite' && subdomain !== 'www') {
          const { data } = await api.get(`/tenants/config/${subdomain}`);
          setTenant(data);
        } else {
          // Configuration par défaut pour l'administration Qualisoft
          setTenant({
            id: 'elite',
            name: 'Qualisoft RD 2030',
            logo: '/assets/logo-elite.png',
            modules: ['ALL'],
          });
        }
      } catch (error) {
        console.error('💥 Erreur chargement configuration Tenant:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, isLoading, isError }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);