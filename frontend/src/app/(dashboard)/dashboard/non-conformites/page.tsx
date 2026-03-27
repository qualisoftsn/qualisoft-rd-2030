/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : REGISTRE DES NON-CONFORMITÉS §10.2 (ISO 9001)
 * RÔLE : Pilotage, filtrage et surveillance des écarts SMQ
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { 
  Search, Filter, Plus, ShieldAlert, CheckCircle2, 
  Clock, AlertTriangle, FileText, ChevronRight, Loader2, RefreshCcw, 
  Target, BarChart3, AlertOctagon
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type NCStatus = 'DETECTION' | 'ANALYSE' | 'ACTION' | 'VERIFICATION' | 'CLOTURE';
export type NCGravity = 'MINEURE' | 'MAJEURE' | 'CRITIQUE';

export interface NonConformite {
  NC_Id: string;
  NC_Libelle: string;
  NC_Description?: string;
  NC_Gravite: NCGravity;
  NC_Statut: NCStatus;
  NC_Source: string;
  NC_CreatedAt: string;
  NC_UpdatedAt: string;
  NC_ProcessusId?: string;
  NC_ResponsableId?: string;
  NC_ActionId?: string;
}

export interface NCStatCardProps {
  label: string;
  val: number;
  icon: React.ElementType;
  color: 'blue' | 'rose' | 'amber';
  alert?: boolean;
}

export interface FilterState {
  status: NCStatus | 'ALL';
  gravity: NCGravity | 'ALL';
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCcw className="animate-spin text-red-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-red-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : NC STAT CARD
// ============================================================================

function NCStatCard({ label, val, icon: Icon, color, alert }: NCStatCardProps) {
  const themes: Record<NCStatCardProps['color'], string> = { 
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20", 
    rose: "text-red-400 bg-red-500/10 border-red-500/20", 
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20" 
  };
  
  return (
    <article className={cn("bg-[#0F172A] p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 flex items-center gap-4 md:gap-6 shadow-2xl focus-within:ring-2 focus-within:ring-red-400", alert ? "border-red-600/40 animate-pulse" : "border-white/5")}>
      <div className={cn("p-3 md:p-4 rounded-xl md:rounded-2xl shadow-inner", themes[color])}>
        <Icon size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
      </div>
      <div className="text-left">
        <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mb-1 md:mb-2 italic m-0 leading-none">{label}</p>
        <p className="text-3xl md:text-4xl font-black italic m-0 tracking-tighter leading-none">{val}</p>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function NonConformitesPage() {
  const router = useRouter();
  const [ncs, setNcs] = useState<NonConformite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({ status: 'ALL', gravity: 'ALL' });

  const fetchNcs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<NonConformite[]>('/non-conformites');
      setNcs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement NC:', error);
      toast.error("RUPTURE DU REGISTRE NC : SYNC KERNEL ÉCHOUÉE");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchNcs(); }, [fetchNcs]);

  const filteredNcs = useMemo(() => {
    return ncs.filter((nc) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = nc.NC_Libelle.toLowerCase().includes(q) || nc.NC_Id.toLowerCase().includes(q);
      const matchesStatus = filters.status === 'ALL' || nc.NC_Statut === filters.status;
      const matchesGravity = filters.gravity === 'ALL' || nc.NC_Gravite === filters.gravity;
      return matchesSearch && matchesStatus && matchesGravity;
    });
  }, [ncs, searchQuery, filters]);

  const stats = useMemo(() => {
    const total = ncs.length;
    const critical = ncs.filter(n => n.NC_Gravite === 'CRITIQUE').length;
    const open = ncs.filter(n => n.NC_Statut !== 'CLOTURE').length;
    return { total, critical, open };
  }, [ncs]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Audit du Registre des Écarts §10.2..." />;
  }

  const statusOptions: Array<{ value: NCStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'TOUS LES STATUTS' },
    { value: 'DETECTION', label: 'DETECTION' },
    { value: 'ANALYSE', label: 'ANALYSE' },
    { value: 'ACTION', label: 'ACTION' },
    { value: 'VERIFICATION', label: 'VERIFICATION' },
    { value: 'CLOTURE', label: 'CLOTURE' },
  ];

  const gravityOptions: Array<{ value: NCGravity | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'TOUTES GRAVITÉS' },
    { value: 'MINEURE', label: 'MINEURE' },
    { value: 'MAJEURE', label: 'MAJEURE' },
    { value: 'CRITIQUE', label: 'CRITIQUE' },
  ];

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-red-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="text-left space-y-2 w-full xl:w-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic">Registre <span className="text-red-400">Non-Conformités</span></h1>
          <p className="text-slate-500 text-[8px] md:text-[9px] lg:text-[10px] tracking-widest m-0 italic flex items-center gap-2">
            <ShieldAlert size={12} className="w-3 h-3 text-red-400" aria-hidden="true" /> 
            Maîtrise des Écarts — ISO 9001 §10.2
          </p>
        </div>
        <button 
          type="button"
          onClick={() => router.push('/dashboard/non-conformites/new')} 
          className="bg-red-600 hover:bg-white hover:text-red-700 px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] flex items-center gap-2 md:gap-3 shadow-2xl border-none cursor-pointer text-white italic transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 w-full xl:w-auto justify-center"
          aria-label="Déclarer une nouvelle non-conformité"
        >
          <Plus size={16} className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} aria-hidden="true" /> 
          <span className="hidden sm:inline">Déclarer un écart</span>
        </button>
      </header>

      {/* 📊 KPI ROW */}
      <section className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pb-0 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6" aria-label="Statistiques des non-conformités">
        <NCStatCard label="Écarts Indexés" val={stats.total} icon={FileText} color="blue" />
        <NCStatCard label="Alertes Critiques" val={stats.critical} icon={AlertOctagon} color="rose" alert={stats.critical > 0} />
        <NCStatCard label="En Résolution" val={stats.open} icon={Clock} color="amber" />
      </section>

      {/* 🔍 FILTRES */}
      <div className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pb-4 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="lg:col-span-2 relative group">
          <label htmlFor="nc-search" className="sr-only">Rechercher une non-conformité</label>
          <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-400 transition-colors pointer-events-none w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          <input 
            id="nc-search"
            type="text" 
            placeholder="SCANNER LIBELLÉ OU ID MATRIX..." 
            value={searchQuery} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} 
            className="w-full bg-black/40 border-2 border-white/5 rounded-2xl md:rounded-3xl py-2.5 md:py-3 lg:py-5 pl-10 md:pl-16 pr-4 md:pr-6 lg:pr-8 text-[9px] md:text-[10px] lg:text-[11px] font-black text-white outline-none focus:border-red-600/50 transition-all uppercase italic tracking-widest"
            aria-label="Filtrer les non-conformités par libellé ou ID"
          />
        </div>
        <label htmlFor="status-filter" className="sr-only">Filtrer par statut</label>
        <select 
          id="status-filter"
          value={filters.status} 
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilters({...filters, status: e.target.value as NCStatus | 'ALL'})} 
          className="bg-black/40 border-2 border-white/5 rounded-2xl md:rounded-3xl px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-5 text-[9px] md:text-[10px] font-black text-slate-400 outline-none cursor-pointer appearance-none uppercase italic shadow-inner focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
        >
          {statusOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-[#0B0F1A]">{opt.label}</option>)}
        </select>
        <label htmlFor="gravity-filter" className="sr-only">Filtrer par gravité</label>
        <select 
          id="gravity-filter"
          value={filters.gravity} 
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilters({...filters, gravity: e.target.value as NCGravity | 'ALL'})} 
          className="bg-black/40 border-2 border-white/5 rounded-2xl md:rounded-3xl px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-5 text-[9px] md:text-[10px] font-black text-slate-400 outline-none cursor-pointer appearance-none uppercase italic shadow-inner focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
        >
          {gravityOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-[#0B0F1A]">{opt.label}</option>)}
        </select>
      </div>

      {/* 📋 REGISTRE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pt-0 md:pt-4 space-y-4">
        {filteredNcs.length > 0 ? filteredNcs.map((nc) => {
          const isCritical = nc.NC_Gravite === 'CRITIQUE';
          const isClosed = nc.NC_Statut === 'CLOTURE';
          
          return (
            <article 
              key={nc.NC_Id} 
              onClick={() => router.push(`/dashboard/non-conformites/${nc.NC_Id}`)} 
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/dashboard/non-conformites/${nc.NC_Id}`); }}
              className="bg-[#0F172A] border-2 border-white/5 hover:border-red-600/30 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 lg:gap-8 transition-all cursor-pointer group shadow-2xl hover:bg-black/40 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-red-400"
              role="button"
              tabIndex={0}
              aria-label={`Voir la non-conformité: ${nc.NC_Libelle}`}
            >
              <div className="flex items-center gap-4 md:gap-6 lg:gap-8 flex-1 text-left relative z-10 min-w-0">
                <div className={cn("p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl lg:rounded-3xl border transition-all shrink-0", isCritical ? 'bg-red-600/10 text-red-400 border-red-500/20' : 'bg-white/5 text-slate-400 border-white/5')}>
                  <ShieldAlert size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
                </div>
                <div className="space-y-2 md:space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 md:gap-4">
                    <span className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-600 tracking-widest">ID #{nc.NC_Id.slice(0, 8)}</span>
                    <span className={cn("text-[8px] md:text-[9px] px-3 md:px-4 py-1 md:py-1.5 rounded-xl border", isCritical ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-900/40' : 'bg-slate-800 text-slate-400 border-slate-700')}>
                      {nc.NC_Gravite}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-black text-white tracking-tighter group-hover:text-red-400 transition-colors m-0 leading-none truncate">{nc.NC_Libelle}</h3>
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 opacity-60">
                     <span className="text-[8px] md:text-[9px] lg:text-[10px] flex items-center gap-1.5 md:gap-2 tracking-widest">
                       <Clock size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" /> 
                       {new Date(nc.NC_CreatedAt).toLocaleDateString('fr-SN')}
                     </span>
                     <span className="text-[8px] md:text-[9px] lg:text-[10px] flex items-center gap-1.5 md:gap-2 tracking-widest">
                       <Target size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" /> 
                       {nc.NC_Source}
                     </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 md:gap-6 lg:gap-10 relative z-10">
                <div className="text-right hidden md:block min-w-[80px]">
                  <p className="text-[8px] md:text-[9px] font-black text-slate-600 tracking-widest mb-1 md:mb-2 leading-none uppercase">Statut SMI</p>
                  <p className={cn("text-sm md:text-base font-black italic m-0 tracking-tighter", isClosed ? 'text-emerald-400' : 'text-blue-400')}>
                    {nc.NC_Statut}
                  </p>
                </div>
                <div className="p-2 md:p-3 lg:p-4 bg-white/5 rounded-xl md:rounded-2xl group-hover:bg-red-600 transition-all text-slate-400 group-hover:text-white" aria-hidden="true">
                  <ChevronRight size={18} className="w-4.5 h-4.5 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                </div>
              </div>
            </article>
          );
        }) : (
          <div className="h-64 md:h-80 flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[5rem]" role="status">
            <CheckCircle2 size={48} className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 md:mb-6" aria-hidden="true" />
            <p className="text-[10px] md:text-[11px] lg:text-xl tracking-widest">Aucun écart détecté §10.2</p>
          </div>
        )}
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(220,38,38,0.3);border-radius:10px}:focus-visible{outline:2px solid #ef4444;outline-offset:2px}`}</style>
    </div>
  );
}