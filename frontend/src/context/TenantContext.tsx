/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : TENANT CONTEXT (L'ANCRE D'ISOLATION)
 * FONCTION : Détection dynamique du sous-domaine pour l'ancrage organisationnel
 * RÔLE : Injecter l'ID du client (Tenant) dans l'arbre de composants
 * VERSION : 3.0 - Typing strict + Security + Performance + Error Handling
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface TenantConfig {
  id: string;
  name: string;
  logo: string;
  primaryColor?: string;
  secondaryColor?: string;
  modules: string[];
  domain?: string;
  subdomain?: string;
  isActive?: boolean;
  trialDaysRemaining?: number;
  subscriptionStatus?: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
}

export interface TenantContextData {
  tenant: TenantConfig | null;
  isLoading: boolean;
  isError: boolean;
  error?: string;
  refetch: () => Promise<void>;
}

export interface TenantProviderProps {
  children: React.ReactNode;
  defaultTenant?: TenantConfig;
}

export interface SubdomainValidation {
  isValid: boolean;
  subdomain: string;
  error?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const SYSTEM_DOMAINS = ['localhost', 'elite', 'www', 'app', 'api', 'admin', 'dev', 'staging', 'production'] as const;
const DEFAULT_TENANT: TenantConfig = {
  id: 'central_matrix',
  name: 'Qualisoft Elite RD 2026',
  logo: '/assets/logo-elite.png',
  modules: ['ALL_ACCESS'],
  subscriptionStatus: 'ACTIVE',
};
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// ============================================================================
// VALIDATEURS
// ============================================================================

/**
 * Valide le format du sous-domaine (alphanumérique + tirets uniquement)
 */
const validateSubdomain = (subdomain: string): SubdomainValidation => {
  if (!subdomain || subdomain.trim() === '') {
    return { isValid: false, subdomain: '', error: 'Sous-domaine vide' };
  }

  const sanitized = subdomain.toLowerCase().trim();

  // Check for valid characters (alphanumeric + hyphens only)
  const validPattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  if (!validPattern.test(sanitized)) {
    return { isValid: false, subdomain: '', error: 'Format de sous-domaine invalide' };
  }

  // Check length (1-63 characters per RFC 1123)
  if (sanitized.length < 1 || sanitized.length > 63) {
    return { isValid: false, subdomain: '', error: 'Longueur de sous-domaine invalide' };
  }

  // Check for consecutive hyphens
  if (sanitized.includes('--')) {
    return { isValid: false, subdomain: '', error: 'Tirets consécutifs non autorisés' };
  }

  return { isValid: true, subdomain: sanitized };
};

/**
 * Vérifie si le domaine est un domaine système
 */
const isSystemDomain = (subdomain: string): boolean => {
  return SYSTEM_DOMAINS.includes(subdomain as typeof SYSTEM_DOMAINS[number]);
};

/**
 * Valide la configuration du tenant reçue de l'API
 */
const validateTenantConfig = (config: unknown): config is TenantConfig => {
  if (!config || typeof config !== 'object') return false;
  
  const tenant = config as Record<string, unknown>;
  
  return (
    typeof tenant.id === 'string' &&
    tenant.id.length > 0 &&
    typeof tenant.name === 'string' &&
    tenant.name.length > 0 &&
    typeof tenant.logo === 'string' &&
    Array.isArray(tenant.modules) &&
    tenant.modules.every(m => typeof m === 'string')
  );
};

/**
 * Sanitize tenant config to prevent XSS
 */
const sanitizeTenantConfig = (config: TenantConfig): TenantConfig => {
  return {
    ...config,
    id: config.id.replace(/[<>]/g, '').substring(0, 100),
    name: config.name.replace(/[<>]/g, '').substring(0, 200),
    logo: config.logo.replace(/[<>]/g, '').substring(0, 500),
    primaryColor: config.primaryColor?.replace(/[^#a-zA-Z0-9]/g, '').substring(0, 20),
    secondaryColor: config.secondaryColor?.replace(/[^#a-zA-Z0-9]/g, '').substring(0, 20),
    modules: config.modules.map(m => m.replace(/[<>]/g, '').substring(0, 50)),
    domain: config.domain?.replace(/[<>]/g, '').substring(0, 200),
    subdomain: config.subdomain?.replace(/[<>]/g, '').substring(0, 63),
  };
};

// ============================================================================
// CRÉATION DU CONTEXT
// ============================================================================

const TenantContext = createContext<TenantContextData | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export const TenantProvider: React.FC<TenantProviderProps> = ({ 
  children, 
  defaultTenant = DEFAULT_TENANT 
}) => {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 🔐 MOTEUR DE DÉTECTION DE PÉRIMÈTRE
   * Analyse l'URL pour identifier si nous sommes sur une instance client scellée.
   */
  const loadConfig = useCallback(async (isRetry = false): Promise<void> => {
    // Skip if already loading
    if (isLoading && !isRetry) return;

    try {
      if (typeof window === 'undefined') {
        // SSR: Set default tenant
        setTenant(defaultTenant);
        setIsLoading(false);
        return;
      }

      if (!isRetry) {
        setIsLoading(true);
        setIsError(false);
        setError(undefined);
      }

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for timeout
      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, API_TIMEOUT);

      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      const subdomain = parts.length > 2 ? parts[0] : '';

      // Validate subdomain
      const validation = validateSubdomain(subdomain);

      if (validation.isValid && !isSystemDomain(validation.subdomain)) {
        // Appel au Kernel pour récupérer la configuration spécifique du client
        const response = await apiClient.get<TenantConfig>(
          `/tenants/config/${validation.subdomain}`,
          {
            signal: abortControllerRef.current.signal,
          }
        );

        // Validate response
        if (validateTenantConfig(response.data)) {
          const sanitizedConfig = sanitizeTenantConfig({
            ...response.data,
            subdomain: validation.subdomain,
            domain: hostname,
          });
          setTenant(sanitizedConfig);
          retryCountRef.current = 0; // Reset retry count on success
        } else {
          throw new Error('Configuration du tenant invalide');
        }
      } else {
        // Configuration par défaut : Registre Central Qualisoft RD 2026
        setTenant({
          ...defaultTenant,
          domain: hostname,
          subdomain: subdomain || undefined,
        });
      }

      clearTimeout(timeoutId);
    } catch (err) {
      const error = err as { message?: string; name?: string };
      
      // Don't treat abort as error
      if (error.name === 'AbortError') {
        console.warn('⚠️ Requête tenant annulée (timeout ou navigation)');
        return;
      }

      console.error('💥 Rupture de liaison avec le Kernel Tenant:', error.message);
      
      // Retry logic
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        console.log(`🔄 Tentative ${retryCountRef.current}/${MAX_RETRIES}...`);
        
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCountRef.current));
        await loadConfig(true);
      } else {
        // Max retries reached - use default tenant
        setIsError(true);
        setError(error.message || 'Échec de chargement de la configuration');
        setTenant(defaultTenant);
        retryCountRef.current = 0;
      }
    } finally {
      setIsLoading(false);
    }
  }, [defaultTenant, isLoading]);

  // Refetch function for manual refresh
  const refetch = useCallback(async (): Promise<void> => {
    retryCountRef.current = 0;
    await loadConfig();
  }, [loadConfig]);

  // Initial load
  useEffect(() => {
    loadConfig();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadConfig]);

  // Memoized context value
  const contextValue = useMemo<TenantContextData>(() => ({
    tenant,
    isLoading,
    isError,
    error,
    refetch,
  }), [tenant, isLoading, isError, error, refetch]);

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useTenant = (): TenantContextData => {
  const context = useContext(TenantContext);
  
  if (context === undefined) {
    throw new Error('useTenant doit être utilisé à l\'intérieur d\'un TenantProvider');
  }
  
  return context;
};

// ============================================================================
// HOC (Optionnel)
// ============================================================================

export function withTenant<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function TenantWrappedComponent(props: P) {
    const tenantContext = useTenant();
    return <WrappedComponent {...props} tenantContext={tenantContext} />;
  };
}