/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🚀 MODULE : DevLoginHelper (Development Auth Bypass)
 * FONCTION : Orchestrateur de test pour switch rapide inter-tenants
 * RÔLE : Bypass de l'authentification manuelle via Injection Matrix
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + Security
 */

import React, { useState, useEffect, useCallback, KeyboardEvent, useRef } from 'react';
import { Rocket, Building2, Users, X, ArrowRight, ShieldAlert, Cpu, LogIn } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export interface DevUser {
  email: string;
  role: string;
  password?: string;
}

export interface DevTenant {
  T_Id: string;
  T_Name: string;
  users: DevUser[];
}

export interface DevLoginHelperProps {
  className?: string;
}

export interface AuthCredentials {
  token: string;
  user: {
    U_Id: string;
    U_Email: string;
    U_FirstName: string;
    U_LastName: string;
    U_Role: string;
    U_TenantId?: string;
    U_TenantName?: string;
  };
}

// ============================================================================
// CONSTANTES
// ============================================================================

// ⚠️ IMPORTANT: Use environment variable for dev password
const DEV_PASSWORD = process.env.NEXT_PUBLIC_DEV_PASSWORD || 'Password123';

const DEV_DATA: DevTenant[] = [
  { 
    T_Id: "ELITE-CORE-001", 
    T_Name: "QUALI-CORP HQ", 
    users: [
      { email: "ab.thiongane@qualisoft.sn", role: "SUPER_ADMIN" },
      { email: "admin@qualisoft.sn", role: "ADMIN" }
    ] 
  },
  { 
    T_Id: "tenant-senelec-id", 
    T_Name: "SENELEC SA", 
    users: [
      { email: "dir.qualite@senelec.sn", role: "RQ" },
      { email: "pilote.hse@senelec.sn", role: "PILOTE" }
    ] 
  },
  { 
    T_Id: "tenant-pad-id", 
    T_Name: "PORT AUTONOME DAKAR", 
    users: [
      { email: "admin@pad.sn", role: "ADMIN" }
    ] 
  }
];

// ============================================================================
// SOUS-COMPOSANT : TENANT CARD
// ============================================================================

interface TenantCardProps {
  tenant: DevTenant;
  onSelect: (tenant: DevTenant) => void;
}

function TenantCard({ tenant, onSelect }: TenantCardProps) {
  const handleClick = () => {
    onSelect(tenant);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button 
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="w-full flex items-center gap-3 md:gap-4 lg:gap-5 p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl border-2 border-slate-100 hover:border-amber-500 hover:bg-amber-50 transition-all text-left group bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
      aria-label={`Sélectionner ${tenant.T_Name}`}
    >
      <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-lg md:rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all shrink-0 shadow-sm">
        <Building2 size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-[10px] md:text-sm uppercase tracking-tighter italic m-0 text-slate-900 truncate">
          {tenant.T_Name}
        </p>
        <p className="text-[7px] md:text-[8px] lg:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 md:mt-1 m-0 opacity-60">
          ID: {tenant.T_Id}
        </p>
      </div>
      <ArrowRight size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-300 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
    </button>
  );
}

// ============================================================================
// SOUS-COMPOSANT : USER CARD
// ============================================================================

interface UserCardProps {
  user: DevUser;
  tenantName: string;
  onLogin: (email: string) => void;
}

function UserCard({ user, tenantName, onLogin }: UserCardProps) {
  const handleClick = () => {
    onLogin(user.email);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button 
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="w-full flex items-center justify-between p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl lg:rounded-3xl bg-slate-950 text-white hover:bg-amber-500 transition-all border-none cursor-pointer group shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
      aria-label={`Se connecter avec ${user.email}`}
    >
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <Users size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-amber-500 group-hover:text-white transition-colors" aria-hidden="true" />
        <span className="text-[9px] md:text-[10px] lg:text-[11px] font-black italic tracking-tight truncate">
          {user.email}
        </span>
      </div>
      <span className="text-[6px] md:text-[7px] lg:text-[8px] bg-white/10 px-2 md:px-3 py-1 rounded-lg md:rounded-xl font-black uppercase tracking-widest">
        {user.role}
      </span>
    </button>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function DevLoginHelper({ className }: DevLoginHelperProps) {
  const { setLogin } = useAuthStore() as { setLogin: (credentials: AuthCredentials) => void };
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<DevTenant | null>(null);
  const [isDev, setIsDev] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);

  /**
   * 🛡️ VÉRIFICATION D'ENVIRONNEMENT
   * Le module ne s'active QUE sur localhost en développement
   */
  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         typeof window !== 'undefined' && window.location.hostname === 'localhost';
    setIsDev(isDevelopment);
  }, []);

  /**
   * ⌨️ GESTION CLAVIER (Escape pour fermer)
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSelectedTenant(null);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape as any);
    }
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [isOpen]);

  /**
   * 🖱️ CLICK OUTSIDE POUR FERMER
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedTenant(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  /**
   * ⚡ PROTOCOLE DE CONNEXION ÉCLAIR
   * Bypass du login form avec injection directe des credentials
   */
  const bypassAuthentication = useCallback(async (email: string) => {
    setIsLoggingIn(true);
    const toastId = toast.loading(`Bypass en cours pour ${email}...`);
    
    try {
      const response = await apiClient.post<AuthCredentials>('/auth/login', {
        U_Email: email,
        U_Password: DEV_PASSWORD
      });

      // Injection dans le store Matrix
      setLogin({ 
        token: response.data.access_token, 
        user: response.data.user 
      });

      toast.success("ACCÈS MATRICIEL AUTORISÉ", { id: toastId });
      setIsOpen(false);
      setSelectedTenant(null);
      
      // Propulsion vers le dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(
        apiError?.response?.data?.message || apiError?.message || "ÉCHEC DU BYPASS : Utilisateur inconnu.", 
        { id: toastId }
      );
    } finally {
      setIsLoggingIn(false);
    }
  }, [setLogin, router]);

  const handleSelectTenant = useCallback((tenant: DevTenant) => {
    setSelectedTenant(tenant);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSelectedTenant(null);
  }, []);

  // 🚫 NE PAS RENDU EN PRODUCTION
  if (!isDev) return null;

  return (
    <div className={cn("fixed bottom-4 md:bottom-6 lg:bottom-8 right-4 md:right-6 lg:right-8 z-50 font-sans italic", className)}>
      
      {/* 🧨 TRIGGER FAB (Floating Action Button) */}
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-amber-500 text-white rounded-xl md:rounded-2xl lg:rounded-3xl shadow-xl hover:bg-amber-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-none cursor-pointer group focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#0B0F1A]"
        aria-label="Ouvrir le menu de développement"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Rocket size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 group-hover:animate-bounce" aria-hidden="true" />
      </button>

      {/* 🛸 MODAL DE CONTEXTE DEV */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-[#0B0F1A]/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={handleClose}
            aria-hidden="true"
          />
          
          <div 
            ref={modalRef}
            className="fixed inset-0 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="bg-white w-full max-w-sm md:max-w-md rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500 max-h-[80vh] flex flex-col">
              
              {/* HEADER */}
              <header className="p-4 md:p-6 lg:p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                <div>
                  <h3 id="modal-title" className="text-lg md:text-xl lg:text-2xl font-black uppercase tracking-tighter m-0 italic flex items-center gap-2 md:gap-3 text-slate-900">
                    <Cpu size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-amber-500" aria-hidden="true" /> 
                    Matrix <span className="text-amber-500">Dev</span> Hub
                  </h3>
                  <p className="text-[6px] md:text-[7px] lg:text-[8px] text-slate-400 font-black uppercase tracking-widest mt-0.5 md:mt-1 lg:mt-1.5 m-0 leading-none">
                    Simulateur d&apos;Ancrage Multi-Tenant
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={handleClose}
                  className="p-2 md:p-3 bg-white border border-slate-100 rounded-lg md:rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label="Fermer"
                >
                  <X size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                </button>
              </header>

              {/* CONTENT */}
              <div className="p-4 md:p-6 lg:p-8 space-y-3 md:space-y-4 overflow-y-auto custom-scrollbar flex-1">
                {!selectedTenant ? (
                  <>
                    <p className="text-[7px] md:text-[8px] lg:text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-6 italic">
                      --- SÉLECTIONNER INSTANCE CIBLE ---
                    </p>
                    <div className="space-y-2 md:space-y-3" role="list">
                      {DEV_DATA.map(tenant => (
                        <TenantCard 
                          key={tenant.T_Id} 
                          tenant={tenant} 
                          onSelect={handleSelectTenant}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div 
                      className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-amber-50 rounded-xl md:rounded-2xl border border-amber-100 mb-4 md:mb-6 lg:mb-8"
                      role="alert"
                    >
                      <ShieldAlert size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-amber-600" aria-hidden="true" />
                      <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-amber-800 uppercase tracking-widest m-0 italic truncate">
                        Basculement vers : {selectedTenant.T_Name}
                      </p>
                    </div>

                    <div className="space-y-2 md:space-y-3" role="list">
                      {selectedTenant.users.map((user, index) => (
                        <UserCard 
                          key={user.email} 
                          user={user} 
                          tenantName={selectedTenant.T_Name}
                          onLogin={bypassAuthentication}
                        />
                      ))}
                    </div>

                    <button 
                      type="button"
                      onClick={() => setSelectedTenant(null)}
                      disabled={isLoggingIn}
                      className="w-full text-center text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase text-slate-400 mt-4 md:mt-6 lg:mt-8 md:mt-10 hover:text-amber-600 transition-all border-none bg-transparent cursor-pointer italic tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400 rounded py-1 disabled:opacity-50"
                    >
                      RETOUR AU REGISTRE DES INSTANCES
                    </button>
                  </>
                )}
              </div>

              {/* FOOTER */}
              <footer className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 shrink-0">
                 <p className="text-[6px] md:text-[7px] lg:text-[8px] font-black text-slate-400 uppercase tracking-widest text-center m-0 italic">
                   Matrix Dev Protocol RD-2026 • Environment: {process.env.NODE_ENV}
                 </p>
              </footer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}