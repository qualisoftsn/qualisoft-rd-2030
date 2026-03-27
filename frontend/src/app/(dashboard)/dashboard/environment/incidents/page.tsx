/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : REGISTRE DES INCIDENTS SSE §8.2 (ISO 14001)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + CRUD
 * API : apiClient Axios avec interceptors (Bearer + X-Tenant-Id)
 */

import React, { useEffect, useState, useMemo, useCallback, ChangeEvent } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { 
  ShieldAlert, Plus, Activity, Flame, DollarSign, 
  ShieldCheck, Trash2, MapPin, Microscope, RefreshCcw 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import IncidentForm from './IncidentForm';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface SSEEvent {
  SSE_Id: string;
  SSE_Type: 'INCIDENT' | 'ACCIDENT' | 'POLLUTION' | 'DOMMAGE' | 'SITUATION_DANGEREUSE';
  SSE_DateEvent: string;
  SSE_Lieu: string;
  SSE_Description: string;
  SSE_AvecArret: boolean;
  SSE_NbJoursArret: number;
  SSE_SiteId: string;
  SSE_Site?: { S_Name: string };
  SSE_ReporterId: string;
  SSE_Reporter?: { U_FirstName: string; U_LastName: string };
  SSE_CreatedAt?: string;
}

export interface Site {
  S_Id: string;
  S_Name: string;
  S_Actif?: boolean;
}

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_IsActive?: boolean;
}

interface IncidentStats {
  total: number;
  critical: number;
  cnq: number;
  severity: number;
}

// ============================================================================
// UTILITAIRES
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(amount);
};

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCcw className="animate-spin text-rose-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 animate-pulse italic text-center px-6 md:px-10">
        {label}
      </span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : KPI TILE
// ============================================================================

interface KPITileProps {
  label: string;
  val: string | number;
  icon: React.ElementType;
  color: 'rose' | 'amber' | 'emerald' | 'blue';
}

function KPITile({ label, val, icon: Icon, color }: KPITileProps) {
  const themes: Record<KPITileProps['color'], string> = { 
    rose: "text-rose-400 border-rose-500/20", 
    amber: "text-amber-400 border-amber-500/20", 
    emerald: "text-emerald-400 border-emerald-500/20", 
    blue: "text-blue-400 border-blue-500/20" 
  };
  
  return (
    <article 
      className={cn(
        "p-6 bg-white/5 border rounded-2xl md:rounded-3xl flex items-center justify-between shadow-xl focus-within:ring-2 focus-within:ring-rose-400", 
        themes[color]
      )}
      role="region"
      aria-label={`${label}: ${val}`}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-black/40 rounded-xl md:rounded-2xl">
          <Icon size={18} className="w-4.5 h-4.5 md:w-5 md:h-5" aria-hidden="true" />
        </div>
        <span className="text-[9px] font-black tracking-widest text-slate-500">{label}</span>
      </div>
      <span className="text-2xl md:text-3xl font-black italic m-0 tracking-tighter text-white">{val}</span>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function EnvironmentIncidentsPage() {
  const [incidents, setIncidents] = useState<SSEEvent[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // --- FETCH DATA (CRUD: READ) ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [iRes, sRes, uRes] = await Promise.all([
        apiClient.get<SSEEvent[]>('/sse-events'), 
        apiClient.get<Site[]>('/sites'),
        apiClient.get<User[]>('/users')
      ]);
      setIncidents(Array.isArray(iRes.data) ? iRes.data : []);
      setSites(Array.isArray(sRes.data) ? sRes.data.filter(s => s.S_Actif !== false) : []);
      setUsers(Array.isArray(uRes.data) ? uRes.data.filter(u => u.U_IsActive !== false) : []);
    } catch (error) {
      console.error('❌ Erreur chargement incidents:', error);
      toast.error("RUPTURE SYNCHRO REGISTRE SSE");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  // --- STATS CALCULATION (Memoized) ---
  const stats = useMemo((): IncidentStats => {
    const total = incidents.length;
    const critical = incidents.filter(i => i.SSE_AvecArret).length;
    const totalDays = incidents.reduce((acc, i) => acc + (Number(i.SSE_NbJoursArret) || 0), 0);
    const cnq = totalDays * 85000; // Coût Non-Qualité estimé
    return { 
      total, 
      critical, 
      cnq, 
      severity: total > 0 ? Math.round((critical/total)*100) : 0 
    };
  }, [incidents]);

  // --- ACTIONS (CRUD: DELETE) ---
  const handleDelete = useCallback(async (incidentId: string) => {
    if(!confirm('SCELLAGE : CONFIRMER SUPPRESSION ?')) return;
    
    const toastId = toast.loading("Suppression de l'incident...");
    try {
      await apiClient.delete(`/sse-events/${incidentId}`);
      toast.success("Incident supprimé", { id: toastId });
      fetchData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || "Erreur de suppression", { id: toastId });
    }
  }, [fetchData]);

  // --- LOADING STATE ---
  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Syncing SSE Matrix §8.2..." />;
  }

  // --- RENDU PRINCIPAL ---
  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full selection:bg-rose-500/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="text-left space-y-2 w-full md:w-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter m-0 leading-none">
            Registre <span className="text-rose-400">Incidents</span>
          </h1>
          <p className="text-slate-500 text-[9px] md:text-[10px] tracking-widest m-0 italic">
            Protocole de Crise §8.2 • ISO 14001
          </p>
        </div>
        <button 
          type="button"
          onClick={() => setIsFormOpen(true)} 
          className="bg-rose-600 px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-2xl md:rounded-3xl text-[9px] md:text-[10px] lg:text-[11px] shadow-2xl flex items-center gap-2 md:gap-3 lg:gap-4 hover:bg-white hover:text-rose-600 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 w-full md:w-auto justify-center"
          aria-label="Déclarer un nouvel incident"
        >
          <Plus size={18} className="w-4.5 h-4.5 md:w-5 md:h-5 lg:w-6 lg:h-6" strokeWidth={3} aria-hidden="true" /> 
          <span className="hidden sm:inline">Déclarer Écart</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-5 md:py-6 space-y-6 md:space-y-8 lg:space-y-10">
        {/* KPI Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6" aria-label="Indicateurs de sécurité">
          <KPITile label="Incidents" val={stats.total} icon={Activity} color="rose" />
          <KPITile label="Sévérité" val={`${stats.severity}%`} icon={Flame} color="amber" />
          <KPITile label="CNQ Estimé" val={formatCurrency(stats.cnq)} icon={DollarSign} color="emerald" />
          <KPITile label="SMI Status" val="VIGILANCE" icon={ShieldCheck} color="blue" />
        </section>

        {/* Table Register */}
        <section className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col" aria-label="Registre des incidents SSE">
          <div className="overflow-x-auto" role="region" aria-label="Tableau des incidents">
            <table className="w-full text-left border-collapse min-w-full" role="table">
              <thead>
                <tr className="bg-black/40 text-[8px] md:text-[9px] text-slate-500 tracking-widest border-b border-white/5 font-black italic">
                  <th scope="col" className="px-6 md:px-8 py-4 md:py-5 text-left whitespace-nowrap">Méta-Données</th>
                  <th scope="col" className="px-6 md:px-8 py-4 md:py-5 text-center whitespace-nowrap">Typologie</th>
                  <th scope="col" className="px-6 md:px-8 py-4 md:py-5 text-left whitespace-nowrap">Exposé des Faits</th>
                  <th scope="col" className="px-6 md:px-8 py-4 md:py-5 text-right whitespace-nowrap">Pilotage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 md:px-8 py-12 md:py-16 text-center text-slate-500" role="status">
                      <ShieldAlert size={40} className="w-10 h-10 mx-auto mb-3 opacity-20" aria-hidden="true" />
                      <p className="text-[9px] md:text-[10px] font-black uppercase italic tracking-widest">
                        Aucun incident enregistré
                      </p>
                    </td>
                  </tr>
                ) : (
                  incidents.map(i => {
                    const isCritical = i.SSE_AvecArret;
                    return (
                      <tr key={i.SSE_Id} className="hover:bg-rose-600/5 transition-all group focus-within:bg-rose-600/10" role="row">
                        <td className="px-6 md:px-8 py-4 md:py-6" role="cell">
                          <p className="text-sm md:text-base font-black m-0 leading-none">
                            {new Date(i.SSE_DateEvent).toLocaleDateString('fr-SN')}
                          </p>
                          <span className="flex items-center gap-2 text-[8px] md:text-[9px] text-rose-400 mt-1 md:mt-2 italic uppercase font-black">
                            <MapPin size={10} className="w-2.5 h-2.5" aria-hidden="true"/> 
                            {i.SSE_Lieu}
                          </span>
                        </td>
                        <td className="px-6 md:px-8 py-4 md:py-6 text-center" role="cell">
                          <span className={cn(
                            "px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black border whitespace-nowrap",
                            isCritical 
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          )}>
                            {i.SSE_Type}
                          </span>
                        </td>
                        <td className="px-6 md:px-8 py-4 md:py-6 max-w-xs md:max-w-md" role="cell">
                          <p className="text-[10px] md:text-[11px] text-slate-400 italic leading-relaxed m-0 font-medium uppercase line-clamp-2">
                            {i.SSE_Description}
                          </p>
                        </td>
                        <td className="px-6 md:px-8 py-4 md:py-6 text-right" role="cell">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button 
                                type="button"
                                onClick={() => handleDelete(i.SSE_Id)} 
                                className="p-2 md:p-3 bg-rose-600/10 text-rose-400 rounded-lg md:rounded-xl border-none cursor-pointer hover:bg-rose-600 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-rose-400"
                                aria-label={`Supprimer l'incident: ${i.SSE_Type}`}
                                title="Supprimer"
                              >
                                <Trash2 size={16} className="w-4 h-4" aria-hidden="true"/>
                              </button>
                           </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* MODAL FORM */}
      {isFormOpen && (
        <IncidentForm 
          sites={sites} 
          users={users} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={fetchData} 
        />
      )}

      {/* GLOBAL STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(244,63,94,0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        :focus-visible { outline: 2px solid #f43f5e; outline-offset: 2px; }
      `}</style>
    </div>
  );
}