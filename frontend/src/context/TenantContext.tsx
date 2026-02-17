/**
 * DIRECTIVE : "use client"
 * RÔLE : Marque ce fichier comme composant client pour autoriser l'usage des Hooks 
 * et l'accès à l'objet global 'window' (indispensable pour la détection du sous-domaine).
 */
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/axios';

// --- INTERFACES CONSERVÉES ---
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

// Initialisation du contexte avec les valeurs par défaut de Qualisoft
const TenantContext = createContext<TenantContextData>({
  tenant: null,
  isLoading: true,
  isError: false,
});

/**
 * PROVIDER : TenantProvider
 * FONCTION : Détermine l'identité du client Qualisoft via le sous-domaine
 * et injecte la configuration visuelle et modulaire correspondante.
 */
export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        // 🛡️ SÉCURITÉ : Vérification de l'existence de window pour le build Next.js
        if (typeof window === 'undefined') return;

        const hostname = window.location.hostname;
        const subdomain = hostname.split('.')[0];

        /**
         * LOGIQUE MÉTIER : 
         * On ne charge la config que si on est sur un sous-domaine client.
         * Exclut localhost, elite (admin) et www.
         */
        if (subdomain && subdomain !== 'localhost' && subdomain !== 'elite' && subdomain !== 'www') {
          const { data } = await api.get(`/tenants/config/${subdomain}`);
          setTenant(data);
        } else {
          // Configuration par défaut : Registre Central Qualisoft RD 2030
          setTenant({
            id: 'elite',
            name: 'Qualisoft RD 2030',
            logo: '/assets/logo-elite.png',
            modules: ['ALL'],
          });
        }
      } catch (error) {
        console.error('💥 Erreur chargement configuration Tenant Qualisoft:', error);
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

/**
 * HOOK : useTenant
 * USAGE : Accès rapide à la configuration de l'organisation courante.
 */
export const useTenant = () => useContext(TenantContext);