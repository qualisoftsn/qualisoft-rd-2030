"use client";
/**
 * 🛰️ MODULE : TENANT CONTEXT (L'ANCRE D'ISOLATION)
 * -------------------------------------------------------------------------
 * FONCTION : Détection dynamique du sous-domaine pour l'ancrage organisationnel.
 * RÔLE : Injecter l'ID du client (Tenant) dans l'arbre de composants.
 * PHILOSOPHIE : "Sovereign First" - Pas de session sans identification du périmètre.
 */

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
    /**
     * 🔐 MOTEUR DE DÉTECTION DE PÉRIMÈTRE
     * Analyse l'URL pour identifier si nous sommes sur une instance client scellée.
     */
    const loadConfig = async () => {
      try {
        if (typeof window === 'undefined') return;

        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];

        // Exclusion des domaines système pour éviter les collisions de routage
        const isSystemDomain = ['localhost', 'elite', 'www', 'app'].includes(subdomain);

        if (subdomain && !isSystemDomain) {
          // Appel au Kernel pour récupérer la configuration spécifique du client
          const { data } = await api.get(`/tenants/config/${subdomain}`);
          setTenant(data);
        } else {
          // Configuration par défaut : Registre Central Qualisoft RD 2026
          setTenant({
            id: 'central_matrix',
            name: 'Qualisoft Elite RD 2026',
            logo: '/assets/logo-elite.png',
            modules: ['ALL_ACCESS'],
          });
        }
      } catch (error) {
        console.error('💥 Rupture de liaison avec le Kernel Tenant:', error);
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