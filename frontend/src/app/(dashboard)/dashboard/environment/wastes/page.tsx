/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : GESTION DES DÉCHETS §8.1 (ISO 14001)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + CRUD
 * API : apiClient Axios avec interceptors (Bearer + X-Tenant-Id)
 */

import React, { useEffect, useState, useMemo, useCallback, ChangeEvent } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { 
  Trash2, Plus, Search, Recycle, Flame, AlertTriangle, 
  RefreshCcw, Loader2, TrendingUp, Filter, BarChart3, ChevronRight, X
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import WasteForm from './WasteForm';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface Waste {
  WAS_Id: string;
  WAS_Label: string;
  WAS_Weight: number;
  WAS_Type: 'BANAL' | 'RECYCLABLE' | 'DANGEREUX' | 'INDUSTRIEL' | 'AUTRE';
  WAS_Treatment: 'ENFOUISSEMENT' | 'RECYCLAGE' | 'INCINERATION' | 'VALORISATION';
  WAS_Month: number;
  WAS_Year: number;
  WAS_SiteId: string;
  WAS_Site?: { S_Name: string };
  WAS_CreatedAt?: string;
}

export interface Site {
  S_Id: string;
  S_Name: string;
  S_Actif?: boolean;
}

interface WasteStats {
  total: number;
  recyclable: number;
  hazardous: number;
  rate: number;
}

// ============================================================================
// UTILITAIRES
// ============================================================================

const formatWeight = (kg: number): string => {
  return new Intl.NumberFormat('fr-SN').format(kg) + ' kg';
};

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCcw className="animate-spin text-emerald-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 animate-pulse italic text-center px-6">
        {label}
      </span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : WASTE TILE (KPI)
// ============================================================================

interface WasteTileProps {
  label: string;
  val: string;
  icon: React.ElementType;
  color: 'rose' | 'emerald' | 'amber';
  progress?: number;
  alert?: boolean;
}

function WasteTile({ label, val, icon: Icon, color, progress, alert }: WasteTileProps) {
  const themes: Record<WasteTileProps['color'], string> = { 
    rose: "text-rose-400 border-rose-500/20", 
    emerald: "text-emerald-400 border-emerald-500/20", 
    amber: "text-amber-400 border-amber-500/20" 
  };
  
  return (
    <article 
      className={cn(
        "p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 bg-[#0F172A] transition-all hover:scale-[1.02] group shadow-2xl focus-within:ring-2 focus-within:ring-emerald-400", 
        themes[color],
        alert ? "animate-pulse border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.1)]" : "border-white/5"
      )}
      role="region"
      aria-label={`${label}: ${val}`}
    >
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform">
          <Icon size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
        </div>
        {progress !== undefined && (
          <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${progress}%` }} aria-hidden="true" />
          </div>
        )}
      </div>
      <p className="text-[9px] md:text-[10px] text-slate-500 mb-2 tracking-widest font-black italic m-0">{label}</p>
      <h3 className="text-2xl md:text-3xl font-black italic m-0 tracking-tighter text-white leading-none">{val}</h3>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function WasteManagementPage() {
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // --- FETCH DATA (CRUD: READ) ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [wRes, sRes] = await Promise.all([
        apiClient.get<Waste[]>('/wastes'), 
        apiClient.get<Site[]>('/sites')
      ]);
      setWastes(Array.isArray(wRes.data) ? wRes.data : []);
      setSites(Array.isArray(sRes.data) ? sRes.data.filter(s => s.S_Actif !== false) : []);
    } catch (error) {
      console.error('❌ Erreur chargement déchets:', error);
      toast.error("ERREUR CRITIQUE : REGISTRE DÉCHETS INACCESSIBLE"); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  // --- STATS CALCULATION (Memoized) ---
  const stats = useMemo((): WasteStats => {
    const filtered = wastes.filter(w => selectedSite === 'ALL' || w.WAS_SiteId === selectedSite);
    const total = filtered.reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);
    const recyclable = filtered.filter(w => (w.WAS_Type + w.WAS_Treatment).toLowerCase().includes('recycl')).reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);
    const hazardous = filtered.filter(w => (w.WAS_Type||'').toLowerCase().match(/danger|toxique|chim/)).reduce((s, w) => s + (Number(w.WAS_Weight) || 0), 0);
    
    return { 
      total: Math.round(total), 
      recyclable: Math.round(recyclable), 
      hazardous: Math.round(hazardous), 
      rate: total > 0 ? Math.round((recyclable / total) * 100) : 0 
    };
  }, [wastes, selectedSite]);

  // --- FILTERING (Memoized) ---
  const filteredWastes = useMemo(() => {
    return wastes.filter(w => {
      const matchSite = selectedSite === 'ALL' || w.WAS_SiteId === selectedSite;
      const matchSearch = (w.WAS_Type + w.WAS_Label).toLowerCase().includes(searchTerm.toLowerCase());
      return matchSite && matchSearch;
    });
  }, [wastes, selectedSite, searchTerm]);

  // --- ACTIONS (CRUD: DELETE) ---
  const handleDelete = useCallback(async (wasteId: string) => {
    if(!confirm('SCELLAGE : CONFIRMER SUPPRESSION ?')) return;
    
    const toastId = toast.loading("Suppression du flux...");
    try {
      await apiClient.delete(`/wastes/${wasteId}`);
      toast.success("Flux supprimé", { id: toastId });
      fetchData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || "Erreur de suppression", { id: toastId });
    }
  }, [fetchData]);

  // --- LOADING STATE ---
  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Scanning Waste Registry §8.1..." />;
  }

  // --- RENDU PRINCIPAL ---
  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full selection:bg-emerald-500/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="text-left space-y-2 w-full md:w-auto">
          <div className="flex items-center gap-3">
             <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" aria-hidden="true" />
             <p className="text-slate-500 text-[9px] tracking-widest m-0">Traçabilité Flux §8.1 • Master Node</p>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter m-0 leading-none">
            Gestion <span className="text-emerald-400">Déchets</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            type="button"
            onClick={() => setIsFormOpen(true)} 
            className="flex-1 md:flex-none bg-emerald-600 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] shadow-2xl flex items-center justify-center gap-2 md:gap-3 hover:bg-white hover:text-emerald-600 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Créer un nouveau flux de déchets"
          >
            <Plus size={18} className="w-4.5 h-4.5 md:w-5 md:h-5" strokeWidth={3} aria-hidden="true" /> 
            <span className="hidden sm:inline">Nouveau Flux</span>
          </button>
        </div>
      </header>

      {/* 📜 MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-5 md:py-6 space-y-6 md:space-y-8">
        
        {/* KPI Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6" aria-label="Indicateurs de gestion des déchets">
          <WasteTile label="Volume Total" val={formatWeight(stats.total)} icon={Trash2} color="rose" />
          <WasteTile label="Valorisé" val={formatWeight(stats.recyclable)} icon={Recycle} color="emerald" />
          <WasteTile label="Taux Valorisation" val={`${stats.rate}%`} icon={TrendingUp} color="emerald" progress={stats.rate} />
          <WasteTile label="Déchets Dangereux" val={formatWeight(stats.hazardous)} icon={AlertTriangle} color="amber" alert={stats.hazardous > 0} />
        </section>

        {/* Matrix Dashboard */}
        <section className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col" aria-label="Registre de traçabilité des déchets">
          <div className="p-6 md:p-8 bg-black/20 flex flex-col xl:flex-row justify-between gap-4 md:gap-6 items-center">
            <div className="flex items-center gap-3 md:gap-4 text-emerald-400">
               <BarChart3 size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
               <h3 className="text-lg md:text-xl font-black m-0 leading-none">Registre de Traçabilité</h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full xl:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-80">
                <label htmlFor="waste-search" className="sr-only">Rechercher un flux</label>
                <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none w-4 h-4" aria-hidden="true" />
                <input 
                  id="waste-search"
                  placeholder="Chercher un flux..." 
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 text-[9px] md:text-[10px] font-black italic outline-none focus:border-emerald-500 text-white placeholder:text-slate-600"
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  aria-label="Filtrer les flux de déchets par type ou label"
                />
              </div>
              {/* Site filter */}
              <label htmlFor="site-filter" className="sr-only">Filtrer par site</label>
              <select 
                id="site-filter"
                value={selectedSite} 
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedSite(e.target.value)} 
                className="bg-black/40 border border-white/10 rounded-xl px-4 md:px-6 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black italic outline-none focus:border-emerald-500 text-white cursor-pointer appearance-none"
                aria-label="Filtrer les déchets par site"
              >
                <option value="ALL" className="bg-[#0B0F1A]">Tous les Sites</option>
                {sites.map(s => <option key={s.S_Id} value={s.S_Id} className="bg-[#0B0F1A]">{s.S_Name}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto" role="region" aria-label="Tableau des flux de déchets">
            <table className="w-full text-left border-collapse min-w-full" role="table">
              <thead>
                <tr className="bg-black/40 text-[8px] md:text-[9px] text-slate-500 tracking-widest border-b border-white/5 font-black italic">
                  <th scope="col" className="px-6 md:px-8 py-4 md:py-5 whitespace-nowrap">Identifiant / Site</th>
                  <th scope="col" className="px-6 md:px-8 py-4 md:py-5 whitespace-nowrap">Type de Flux</th>
                  <th scope="col" className="px-6 md:px-8 py-4 md:py-5 text-center whitespace-nowrap">Quantité (kg)</th>
                  <th scope="col" className="px-6 md:px-8 py-4 md:py-5 text-center whitespace-nowrap">Traitement ISO</th>
                  <th scope="col" className="px-6 md:px-8 py-4 md:py-5 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredWastes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-16 md:p-20 text-center opacity-10 text-lg md:text-xl tracking-widest font-black italic" role="status">
                      Registre Vierge
                    </td>
                  </tr>
                ) : (
                  filteredWastes.map(w => {
                    const isHazardous = w.WAS_Type?.toLowerCase().match(/danger|tox/i);
                    return (
                      <tr key={w.WAS_Id} className="hover:bg-emerald-600/5 transition-all group focus-within:bg-emerald-600/10" role="row">
                        <td className="px-6 md:px-8 py-4 md:py-6" role="cell">
                          <p className="text-sm md:text-base font-black m-0 leading-none">{w.WAS_Month}/{w.WAS_Year}</p>
                          <p className="text-[8px] md:text-[9px] text-slate-600 mt-1 m-0 tracking-widest">{w.WAS_Site?.S_Name || 'Site non défini'}</p>
                        </td>
                        <td className="px-6 md:px-8 py-4 md:py-6" role="cell">
                          <div className="flex items-center gap-2 md:gap-3">
                            {isHazardous ? (
                              <AlertTriangle size={14} className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                            ) : (
                              <Recycle size={14} className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                            )}
                            <span className="text-[10px] md:text-[11px] font-black">{w.WAS_Type}</span>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-4 md:py-6 text-center text-xl md:text-2xl font-black italic tracking-tighter" role="cell">
                          {w.WAS_Weight.toLocaleString('fr-SN')}
                        </td>
                        <td className="px-6 md:px-8 py-4 md:py-6 text-center" role="cell">
                          <span className="px-3 md:px-4 py-1.5 md:py-2 bg-white/5 border border-white/5 rounded-full text-[7px] md:text-[8px] tracking-widest text-slate-400">
                            {w.WAS_Treatment}
                          </span>
                        </td>
                        <td className="px-6 md:px-8 py-4 md:py-6 text-right" role="cell">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button 
                                type="button"
                                onClick={() => handleDelete(w.WAS_Id)} 
                                className="p-2 md:p-3 bg-rose-600/10 text-rose-400 rounded-lg md:rounded-xl border-none cursor-pointer hover:bg-rose-600 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-rose-400"
                                aria-label={`Supprimer le flux: ${w.WAS_Label}`}
                                title="Supprimer"
                              >
                                <Trash2 size={16} className="w-4 h-4" aria-hidden="true" />
                              </button>
                              <button 
                                type="button"
                                className="p-2 md:p-3 bg-white/5 text-slate-500 rounded-lg md:rounded-xl border-none cursor-pointer hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                aria-label={`Voir les détails du flux: ${w.WAS_Label}`}
                                title="Détails"
                              >
                                <ChevronRight size={16} className="w-4 h-4" aria-hidden="true" />
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
        <WasteForm 
          sites={sites} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={fetchData} 
        />
      )}

      {/* GLOBAL STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius:10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        :focus-visible { outline:2px solid #10b981; outline-offset:2px; }
      `}</style>
    </div>
  );
}