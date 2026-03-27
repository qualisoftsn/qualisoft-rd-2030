/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : COCKPIT NŒUD SOUVERAIN (ELITE SDE)
 * RÔLE : Gestion granulaire d'une instance territoriale (Tenant)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useCallback, useEffect, useState, KeyboardEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Edit3, Loader2, RefreshCw, Save, 
  ShieldCheck, Users, X, Zap, Globe, Fingerprint, Key, Activity, AlertCircle, MoreVertical
} from "lucide-react";
import { matrixApi } from "@/services/matrix.service";
import { Role } from "@/types/elite-sde";
import { toast, Toaster } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface User {
  U_Id: string;
  U_Email: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: Role;
  U_IsActive: boolean;
  U_CreatedAt?: string;
  U_Phone?: string;
}

export interface TenantStats {
  T_Users?: number;
  T_ActiveUsers?: number;
  T_Processes?: number;
  T_Documents?: number;
}

export interface Tenant {
  T_Id: string;
  T_Name: string;
  T_Domain: string;
  T_CeoName?: string;
  T_Plan: string;
  T_Status?: string;
  T_IsActive?: boolean;
  T_CreatedAt?: string;
  T_Email?: string;
  T_Phone?: string;
  T_Users?: User[];
  _count?: TenantStats;
}

export interface AuthCredentials {
  token: string;
  user: any;
  isMaster?: boolean;
}

export interface LoadingStateProps {
  label: string;
}

export interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTableRowElement>, userId: string) => void;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING STATE
// ============================================================================

function LoadingState({ label }: LoadingStateProps) {
  return (
    <div 
      className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4 md:gap-6"
      role="status"
      aria-live="polite"
    >
      <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" aria-hidden="true" />
      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse text-center px-4">{label}</p>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : USER ROW
// ============================================================================

function UserRow({ user, onEdit, onKeyDown }: UserRowProps) {
  const isAdmin = user.U_Role === Role.ADMIN;

  const handleKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    onKeyDown(e, user.U_Id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(user);
  };

  return (
    <tr 
      className="hover:bg-blue-600/5 group transition-colors italic focus-within:bg-blue-600/5 focus:outline-none"
      role="row"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Utilisateur: ${user.U_Email}`}
    >
      <td className="p-4 md:p-6 lg:p-8" role="gridcell">
        <p className="text-lg md:text-xl font-black text-white m-0 tracking-tighter group-hover:text-blue-400 transition-colors lowercase italic truncate">
          {user.U_Email}
        </p>
        <p className="text-[9px] md:text-[10px] text-slate-600 font-bold tracking-widest mt-0.5 md:mt-1 m-0 uppercase italic truncate">
          {user.U_FirstName} {user.U_LastName}
        </p>
      </td>
      <td className="p-4 md:p-6 lg:p-8 text-center" role="gridcell">
        <span 
          className={cn(
            "px-3 md:px-4 py-1 md:py-1.5 lg:py-2 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black tracking-widest border uppercase italic inline-block",
            isAdmin 
              ? "border-amber-500/30 text-amber-400 bg-amber-500/10" 
              : "border-slate-700 text-slate-500 bg-white/5"
          )}
          aria-label={`Rôle: ${user.U_Role}`}
        >
          {user.U_Role}
        </span>
      </td>
      <td className="p-4 md:p-6 lg:p-8 text-right" role="gridcell">
        <button 
          type="button"
          onClick={handleEditClick}
          className="p-2 md:p-3 lg:p-4 bg-white/5 border border-white/10 rounded-lg md:rounded-xl lg:rounded-2xl text-slate-500 hover:text-white hover:bg-blue-600 transition-all border-none cursor-pointer active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={`Modifier ${user.U_Email}`}
          title="Modifier"
        >
          <Edit3 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function TenantCockpit() {
  const router = useRouter();
  const { id: tenantId } = useParams() as { id: string };
  const { setLogin } = useAuthStore() as { setLogin: (credentials: AuthCredentials) => void };

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [impersonating, setImpersonating] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const data = await matrixApi.getDetails(tenantId);
      setTenant(data);
    } catch (error) {
      console.error('❌ Erreur chargement tenant:', error);
      toast.error("Rupture de liaison Kernel.");
    } finally { 
      setLoading(false); 
    }
  }, [tenantId]);

  useEffect(() => { if (typeof window !== 'undefined') fetchDetails(); }, [fetchDetails]);

  const handleImpersonate = async () => {
    setImpersonating(true);
    const toastId = toast.loading("Calcul du Tunnel d'Incarnation...");
    try {
      const data = await matrixApi.impersonate(tenantId);
      setLogin({ token: data.access_token, user: data.user, isMaster: true });
      toast.success("Tunnel Ouvert.", { id: toastId });
      window.location.href = "/dashboard";
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "Séquence d'incarnation rejetée.", { id: toastId });
    } finally { 
      setImpersonating(false); 
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    toast.info(`Modification: ${user.U_Email}`);
    // router.push(`/admin/matrix/${tenantId}/users/${user.U_Id}`);
  };

  const handleUserKeyDown = (e: KeyboardEvent<HTMLTableRowElement>, userId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const user = tenant?.T_Users?.find(u => u.U_Id === userId);
      if (user) {
        handleEditUser(user);
      }
    }
  };

  const handleRefresh = () => {
    fetchDetails();
    toast.info("Actualisation des données...");
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingState label="Analyse du Nœud territorial..." />;
  }

  if (!tenant) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status">
        <AlertCircle className="text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nœud introuvable</p>
        <button 
          type="button"
          onClick={() => router.push("/admin/matrix")}
          className="mt-4 text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
        >
          Retour au registre
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 md:p-12 bg-[#0B0F1A] italic font-sans overflow-hidden text-white w-full">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* 🔝 HEADER */}
      <header className="shrink-0 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 md:gap-6 mb-6 md:mb-8 lg:mb-10 border-b border-white/5 pb-6 md:pb-8 lg:pb-10">
        <div className="space-y-2 md:space-y-3 lg:space-y-4 w-full xl:w-auto">
          <button 
            type="button"
            onClick={() => router.push("/admin/matrix")} 
            className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black text-slate-500 hover:text-white transition-all bg-transparent border-none cursor-pointer uppercase tracking-widest p-0 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
            aria-label="Retour au registre master"
          >
            <ArrowLeft size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
            <span className="hidden sm:inline">Retour Registre Master</span>
          </button>
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl xl:text-7xl font-black uppercase tracking-tighter leading-none m-0 italic">
            Nœud <span className="text-blue-400">Souverain</span>
          </h1>
          <p className="text-slate-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest m-0 truncate">
            ID NOEUD : {tenantId.slice(0, 12)}...
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-start xl:justify-end">
          <button 
            type="button"
            onClick={handleRefresh} 
            disabled={loading}
            className="p-2 md:p-3 lg:p-5 bg-white/5 border border-white/10 rounded-lg md:rounded-xl lg:rounded-2xl text-slate-500 hover:text-blue-400 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            aria-label="Actualiser les données"
            aria-busy={loading}
          >
            <RefreshCw size={16} className={cn("w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5", loading ? "animate-spin" : "")} aria-hidden="true" />
          </button>
          <button 
            type="button"
            onClick={handleImpersonate} 
            disabled={impersonating}
            className={cn(
              "bg-blue-600 text-white px-4 md:px-6 lg:px-8 lg:px-10 py-2.5 md:py-3 lg:py-4 md:py-5 rounded-lg md:rounded-xl lg:rounded-2xl font-black text-[9px] md:text-[10px] tracking-widest border-none cursor-pointer hover:bg-white hover:text-blue-700 transition-all shadow-xl flex items-center gap-2 md:gap-3 focus:outline-none focus:ring-2 focus:ring-blue-400",
              impersonating && "opacity-50 cursor-not-allowed"
            )}
            aria-label="S'incarner dans le nœud"
            aria-busy={impersonating}
          >
            {impersonating ? (
              <><Loader2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">INCARNATION...</span></>
            ) : (
              <><Key size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" strokeWidth={3} aria-hidden="true" /> <span className="hidden sm:inline">INCARNER LE NŒUD</span></>
            )}
          </button>
        </div>
      </header>

      {/* 📜 MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar space-y-6 md:space-y-8 lg:space-y-10 pr-1 md:pr-2" role="region" aria-label="Tableau de bord du nœud">
        
        {/* ROW 1: CORE STATS */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 lg:gap-8" aria-label="Statistiques principales">
          <article className="xl:col-span-8 bg-white/5 border border-white/5 p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 lg:p-14 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] relative overflow-hidden group shadow-inner flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 lg:gap-8 lg:gap-10 focus-within:ring-2 focus-within:ring-blue-400">
            <div className="absolute -top-10 -right-10 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-blue-600/5 blur-3xl rounded-full group-hover:bg-blue-600/10 transition-all" aria-hidden="true" />
            <div className="relative z-10 space-y-4 md:space-y-6 lg:space-y-8 flex-1 min-w-0">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-blue-600 rounded-xl md:rounded-2xl lg:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-900/40 shrink-0">
                  <Zap size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" aria-hidden="true" />
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl lg:text-6xl font-black text-white tracking-tighter italic m-0 truncate">{tenant?.T_Name}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 lg:gap-10 pt-4 md:pt-6 lg:pt-8 lg:pt-10 border-t border-white/5">
                <div>
                   <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2 italic">Domaine Matrix</p>
                   <p className="text-xl md:text-2xl font-black text-blue-400 m-0 truncate">{tenant?.T_Domain}.qualisoft.sn</p>
                </div>
                <div>
                   <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2 italic">Responsable Légal</p>
                   <p className="text-xl md:text-2xl font-black text-amber-400 m-0 truncate">{tenant?.T_CeoName || "N/A"}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-4 md:p-6 lg:p-8 lg:p-10 shadow-2xl flex flex-col items-center justify-center gap-1 md:gap-2 border-4 md:border-4 lg:border-6 border-[#0B0F1A] shrink-0 min-w-[160px] md:min-w-[180px] lg:min-w-[200px] group-hover:scale-105 transition-all" role="status" aria-label={`${tenant?._count?.T_Users || 0} citoyens`}>
              <Users className="text-blue-600 mb-1 md:mb-2 w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14" strokeWidth={3} aria-hidden="true" />
              <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest m-0">Citoyens</p>
              <p className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter text-slate-900 m-0 leading-none">{tenant?._count?.T_Users || 0}</p>
            </div>
          </article>

          <article className="xl:col-span-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-4 md:p-6 lg:p-8 lg:p-10 flex flex-col justify-center gap-4 md:gap-6 relative overflow-hidden shadow-inner focus-within:ring-2 focus-within:ring-emerald-400" aria-labelledby="integrity-status">
             <Fingerprint className="absolute -left-4 md:-left-6 lg:-left-10 -bottom-4 md:-bottom-6 lg:-bottom-10 opacity-5 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48" aria-hidden="true" />
             <div className="relative z-10 space-y-3 md:space-y-4">
                <h3 id="integrity-status" className="text-lg md:text-xl font-black italic text-emerald-400 m-0 flex items-center gap-2 md:gap-3 uppercase">
                  <ShieldCheck size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> 
                  Intégrité OK
                </h3>
                <p className="text-[10px] md:text-[11px] font-black text-slate-500 leading-relaxed uppercase tracking-widest m-0">
                  Isolation cryptographique activée. Nœud synchronisé avec le Cluster Global RD-2030.
                </p>
                <div className="bg-white/5 rounded-lg md:rounded-xl lg:rounded-2xl p-3 md:p-4 border border-white/5 w-fit">
                   <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase m-0 italic tracking-widest">Plan : {tenant?.T_Plan}</p>
                </div>
             </div>
          </article>
        </section>

        {/* ROW 2: USER REGISTRY */}
        <article 
          className="bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] overflow-hidden flex flex-col shadow-2xl"
          aria-labelledby="users-title"
        >
          <header className="p-4 md:p-6 lg:p-8 border-b border-white/5 bg-[#0B0F1A]/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
            <h3 id="users-title" className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 md:gap-4 m-0 italic">
              <Activity size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-blue-400" aria-hidden="true" /> 
              Registre d&apos;Identité Global
            </h3>
            <button 
              type="button"
              onClick={() => setEditingUser({ 
                U_Id: '',
                U_Email: "", 
                U_FirstName: "", 
                U_LastName: "", 
                U_Role: Role.USER, 
                U_IsActive: true 
              })}
              className="bg-white text-slate-900 px-4 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 rounded-lg md:rounded-xl lg:rounded-2xl font-black text-[8px] md:text-[9px] tracking-widest hover:bg-blue-600 hover:text-white transition-all border-none cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Enrôler un nouveau citoyen"
            >
              ENRÔLER CITOYEN
            </button>
          </header>
          
          <div className="overflow-x-auto" role="region" aria-label="Tableau des utilisateurs">
            <table className="w-full text-left border-collapse min-w-full md:min-w-[200px]" role="table">
              <thead className="bg-[#0B0F1A] text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-500 tracking-widest uppercase italic" role="rowgroup">
                <tr role="row">
                  <th className="p-4 md:p-6 lg:p-8" scope="col">Identité Numérique</th>
                  <th className="p-4 md:p-6 lg:p-8 text-center" scope="col">Autorité</th>
                  <th className="p-4 md:p-6 lg:p-8 text-right" scope="col">Contrôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5" role="rowgroup">
                {tenant?.T_Users && tenant.T_Users.length > 0 ? tenant.T_Users.map((user: User) => (
                  <UserRow 
                    key={user.U_Id} 
                    user={user} 
                    onEdit={handleEditUser}
                    onKeyDown={handleUserKeyDown}
                  />
                )) : (
                  <tr role="row">
                    <td colSpan={3} className="p-8 md:p-12 lg:p-16 text-center text-slate-500" role="status">
                      <Users size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mx-auto mb-3 md:mb-4 opacity-20" aria-hidden="true" />
                      <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">Aucun utilisateur enregistré</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}