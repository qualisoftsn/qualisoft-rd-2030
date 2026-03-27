/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : MATRIX GLOBAL CONTROL (ELITE-SDE)
 * RÔLE : Supervision de la Fédération Qualisoft (Master Node)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useState, useEffect, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import { 
  Server, Activity, Plus, ExternalLink, Search, Loader2, 
  Cpu, Database, Globe, ServerCrash, AlertCircle
} from 'lucide-react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { useAuthStore } from '@/store/authStore';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface Tenant {
  T_Id: string;
  T_Name: string;
  T_Domain?: string;
  T_Plan: string;
  T_IsActive?: boolean;
  T_Status?: string;
  T_CreatedAt?: string;
  T_Email?: string;
  T_Phone?: string;
}

export interface TenantCardProps {
  tenant: Tenant;
  onImpersonate: (tenantId: string) => void;
  isImpersonating: boolean;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>, tenantId: string) => void;
}

export interface LoadingMatrixProps {
  label: string;
}

export interface AuthCredentials {
  token: string;
  user: any;
  isMaster?: boolean;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING MATRIX
// ============================================================================

function LoadingMatrix({ label }: LoadingMatrixProps) {
  return (
    <div 
      className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4 md:gap-6"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="animate-spin text-blue-400 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" strokeWidth={1} aria-hidden="true" />
      <p className="text-blue-400 font-black uppercase italic text-[9px] md:text-[10px] tracking-widest animate-pulse m-0">
        {label}
      </p>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : TENANT CARD
// ============================================================================

function TenantCard({ tenant, onImpersonate, isImpersonating, onKeyDown }: TenantCardProps) {
  const handleClick = () => {
    onImpersonate(tenant.T_Id);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown(e, tenant.T_Id);
  };

  return (
    <article 
      className="bg-[#0B0F1A]/80 border border-white/5 p-4 md:p-6 lg:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 lg:gap-8 group hover:border-blue-600/40 transition-all duration-500 shadow-2xl relative overflow-hidden focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="article"
      aria-label={`Nœud: ${tenant.T_Name}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-4 md:gap-6 lg:gap-8 w-full min-w-0">
        <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-blue-600/10 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0 shadow-inner">
          <Server size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />
        </div>
        <div className="text-left min-w-0 space-y-1 md:space-y-1.5 lg:space-y-2 flex-1">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic tracking-tighter m-0 truncate leading-none text-white">
            {tenant.T_Name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:gap-4">
            <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 md:gap-1.5 italic">
              <Activity size={10} className={cn("w-2.5 h-2.5 md:w-3 md:h-3", tenant.T_IsActive ? "text-emerald-400" : "text-red-400")} aria-hidden="true" /> 
              <span className="truncate">{tenant.T_Domain}.qualisoft.sn</span>
            </span>
            <span className="text-[8px] md:text-[9px] font-black text-blue-400 bg-blue-500/10 px-2 md:px-3 py-1 rounded-lg border border-blue-500/20 uppercase tracking-widest">
              {tenant.T_Plan}
            </span>
          </div>
        </div>
      </div>
      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); onImpersonate(tenant.T_Id); }}
        disabled={isImpersonating}
        className={cn(
          "w-full md:w-auto bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[9px] lg:text-[10px] tracking-widest flex items-center justify-center gap-1.5 md:gap-2 lg:gap-3 transition-all border-2 border-blue-600/20 cursor-pointer active:scale-95 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400",
          isImpersonating && "opacity-50 cursor-not-allowed"
        )}
        aria-label={`Se connecter au nœud ${tenant.T_Name}`}
        aria-busy={isImpersonating}
      >
        {isImpersonating ? (
          <Loader2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" aria-hidden="true" />
        ) : (
          <><ExternalLink size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> <span className="hidden lg:inline">Saut Dimensionnel</span></>
        )}
      </button>
      <div className="absolute -bottom-6 md:-bottom-8 lg:-bottom-10 -right-6 md:-right-8 lg:-right-10 w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-blue-600/5 blur-3xl rounded-full group-hover:bg-blue-600/10 transition-all" aria-hidden="true" />
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function MatrixControl() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);
  const { setLogin } = useAuthStore() as { setLogin: (credentials: AuthCredentials) => void };

  const loadMatrix = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<Tenant[]>('/admin/matrix/deploy');
      setTenants(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement matrix:', error);
      toast.error("RUPTURE KERNEL : Liaison Master-Node dégradée.");
      setTenants([]);
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') loadMatrix(); }, [loadMatrix]);

  const onImpersonate = async (tenantId: string) => {
    setImpersonatingId(tenantId);
    const toastId = toast.loading("Séquençage du Tunnel d'Incarnation...");
    try {
      const { data } = await apiClient.post<{ access_token: string; user: any }>(`/admin/matrix/impersonate/${tenantId}`);
      setLogin({ token: data.access_token, user: data.user, isMaster: true });
      toast.success("Tunnel Ouvert. Redirection...", { id: toastId });
      window.location.href = "/dashboard";
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "SAUT REFUSÉ : Le nœud distant ne répond pas.", { id: toastId });
    } finally { 
      setImpersonatingId(null); 
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>, tenantId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onImpersonate(tenantId);
    }
  };

  const filtered = useMemo(() => tenants.filter(t => 
    t.T_Name?.toLowerCase().includes(query.toLowerCase()) ||
    t.T_Domain?.toLowerCase().includes(query.toLowerCase())
  ), [tenants, query]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingMatrix label="Synchronisation du Cluster Global..." />;
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 md:p-12 gap-6 md:gap-8 lg:gap-10 font-sans italic selection:bg-blue-600/30 text-white animate-in slide-in-from-bottom-4 duration-700">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 md:gap-6 lg:gap-8 shrink-0">
        <div className="space-y-2 md:space-y-3 lg:space-y-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 md:gap-3 text-blue-400 font-black uppercase tracking-widest text-[8px] md:text-[9px] lg:text-[10px]">
            <Cpu size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 animate-spin-slow" aria-hidden="true" /> 
            Global Cluster Surveillance
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl xl:text-7xl lg:text-8xl font-black uppercase tracking-tighter italic m-0 leading-none">
            Matrix <span className="text-blue-400">Master</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64 md:w-72 lg:w-80 xl:w-96">
            <label htmlFor="node-search" className="sr-only">Rechercher un nœud</label>
            <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
            <input 
              id="node-search"
              placeholder="RECHERCHER NŒUD..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl py-2.5 md:py-3 lg:py-4 md:py-5 pl-10 md:pl-16 pr-4 md:pr-6 text-[9px] md:text-[10px] font-black uppercase italic outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-700"
              value={query} 
              onChange={handleSearchChange}
              aria-label="Filtrer les nœuds par nom ou domaine"
            />
          </div>
          <Link href="/admin/matrix/deploy" className="no-underline">
            <button 
              type="button"
              className="h-full bg-white text-slate-900 px-4 md:px-6 lg:px-8 lg:px-10 py-2.5 md:py-3 lg:py-4 md:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all hover:bg-blue-600 hover:text-white border-none cursor-pointer flex items-center gap-1.5 md:gap-2 lg:gap-3 active:scale-95 shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Déployer un nouveau nœud"
            >
              <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" strokeWidth={3} aria-hidden="true" /> 
              <span className="hidden sm:inline">Déployer Nœud</span>
            </button>
          </Link>
        </div>
      </header>

      {/* 📜 MAIN CONTENT */}
      <main 
        className="flex-1 bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] overflow-hidden flex flex-col shadow-inner backdrop-blur-md"
        aria-labelledby="nodes-title"
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 md:p-10 lg:p-12">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 lg:gap-8 pb-6 md:pb-8 lg:pb-10" role="list" aria-label="Liste des nœuds">
            {filtered.length > 0 ? filtered.map(tenant => (
              <TenantCard 
                key={tenant.T_Id} 
                tenant={tenant}
                onImpersonate={onImpersonate}
                isImpersonating={impersonatingId === tenant.T_Id}
                onKeyDown={handleCardKeyDown}
              />
            )) : (
              <div 
                className="xl:col-span-2 py-16 md:py-20 lg:py-24 xl:py-32 flex flex-col items-center justify-center gap-4 md:gap-6 opacity-30 border-2 border-dashed border-white/10 rounded-2xl md:rounded-3xl lg:rounded-[4rem]"
                role="status"
              >
                <ServerCrash size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" strokeWidth={1} aria-hidden="true" />
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest m-0 italic text-center px-4">
                  {query ? 'Aucun nœud ne correspond à la recherche' : 'Aucun nœud identifié dans ce périmètre'}
                </p>
                {!query && (
                  <Link 
                    href="/admin/matrix/deploy"
                    className="mt-2 md:mt-3 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
                  >
                    Déployer votre premier nœud
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 md:gap-3 opacity-40 px-4 md:px-6" role="contentinfo">
        <div className="flex flex-wrap items-center gap-4 md:gap-6 lg:gap-8 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic">
          <span className="flex items-center gap-1.5 md:gap-2 text-blue-400">
            <Database size={10} className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4" aria-hidden="true" /> 
            Cluster: SÉCURISÉ
          </span>
          <span className="flex items-center gap-1.5 md:gap-2">
            <Globe size={10} className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4" aria-hidden="true" /> 
            Monitoring: ACTIF
          </span>
        </div>
        <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest italic m-0 opacity-50">Qualisoft Master Matrix RD-2030</p>
      </footer>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}