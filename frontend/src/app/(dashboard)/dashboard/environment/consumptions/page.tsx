/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 💡 MODULE : GESTION DES CONSOMMATIONS §9.1.1 (ISO 14001)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + CRUD
 * API : apiClient Axios avec interceptors (Bearer + X-Tenant-Id)
 */

import { useEffect, useState, useMemo, useCallback, ChangeEvent } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { 
  Zap, Plus, Search, Droplets, TrendingUp, 
  Target, Trash2, RefreshCcw
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import ConsumptionForm from './ConsumptionForm';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface Consumption {
  CON_Id: string;
  CON_Type: 'ELECTRICITE' | 'EAU' | 'GAZ' | 'FIOUL' | 'CARBURANT' | 'AUTRE';
  CON_Value: number;
  CON_Unit: 'kWh' | 'm³' | 'L' | 'kg';
  CON_Cost?: number;
  CON_Month: number;
  CON_Year: number;
  CON_SiteId: string;
  CON_Site?: { S_Name: string };
  CON_CreatedAt?: string;
}

export interface Site {
  S_Id: string;
  S_Name: string;
  S_Actif?: boolean;
}

interface ConsumptionStats {
  totalEnergy: number;
  totalWater: number;
  totalCost: number;
  efficiency: number;
}

// ============================================================================
// UTILITAIRES
// ============================================================================

const formatNumber = (num: number, unit?: string): string => 
  new Intl.NumberFormat('fr-SN').format(num) + (unit ? ` ${unit}` : '');

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCcw className="animate-spin text-amber-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 animate-pulse italic">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : STAT TILE
// ============================================================================

interface StatTileProps {
  label: string;
  val: string;
  icon: React.ElementType;
  color: 'amber' | 'blue' | 'emerald' | 'rose';
  progress?: number;
}

function StatTile({ label, val, icon: Icon, color, progress }: StatTileProps) {
  const colors: Record<StatTileProps['color'], string> = { 
    amber: "text-amber-400 bg-amber-500/5", 
    blue: "text-blue-400 bg-blue-500/5", 
    emerald: "text-emerald-400 bg-emerald-500/5", 
    rose: "text-rose-400 bg-rose-500/5" 
  };
  
  return (
    <article 
      className={cn("p-6 md:p-8 rounded-2xl md:rounded-3xl border-2 border-white/5 transition-all hover:scale-105 focus-within:ring-2 focus-within:ring-amber-400", colors[color])}
      role="region"
      aria-label={`${label}: ${val}`}
    >
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl">
          <Icon size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
        </div>
        {progress !== undefined && (
          <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-current" style={{ width: `${progress}%` }} aria-hidden="true" />
          </div>
        )}
      </div>
      <p className="text-[9px] md:text-[10px] text-slate-500 mb-2 tracking-widest">{label}</p>
      <h3 className="text-2xl md:text-3xl font-black italic m-0 tracking-tighter text-white">{val}</h3>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ConsumptionManagementPage() {
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSite, setSelectedSite] = useState<string>('ALL');

  // --- FETCH DATA (CRUD: READ) ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [consRes, sitesRes] = await Promise.all([
        apiClient.get<Consumption[]>('/consumptions'),
        apiClient.get<Site[]>('/sites')
      ]);
      setConsumptions(Array.isArray(consRes.data) ? consRes.data : []);
      setSites(Array.isArray(sitesRes.data) ? sitesRes.data.filter(s => s.S_Actif !== false) : []);
    } catch (error) {
      console.error('❌ Erreur chargement consommations:', error);
      toast.error("ÉCHEC SYNCHRO MATRIX §9.1.1");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  // --- STATS CALCULATION (Memoized) ---
  const stats = useMemo((): ConsumptionStats => {
    const filtered = consumptions.filter(c => selectedSite === 'ALL' || c.CON_SiteId === selectedSite);
    const energy = filtered.filter(c => (c.CON_Type||'').match(/éner|elect|carbu|gaz|fioul/i)).reduce((s, c) => s + (Number(c.CON_Value) || 0), 0);
    const water = filtered.filter(c => (c.CON_Type||'').match(/eau|water/i)).reduce((s, c) => s + (Number(c.CON_Value) || 0), 0);
    const cost = filtered.reduce((s, c) => s + (Number(c.CON_Cost) || 0), 0);

    return {
      totalEnergy: Math.round(energy),
      totalWater: Math.round(water),
      totalCost: Math.round(cost),
      efficiency: energy > 0 ? Math.min(100, Math.round((energy / 10000) * 100)) : 0
    };
  }, [consumptions, selectedSite]);

  // --- ACTIONS (CRUD: DELETE) ---
  const handleDelete = useCallback(async (consumptionId: string) => {
    if(!confirm('SCELLAGE : CONFIRMER SUPPRESSION ?')) return;
    
    const toastId = toast.loading("Suppression de la consommation...");
    try {
      await apiClient.delete(`/consumptions/${consumptionId}`);
      toast.success("Consommation supprimée", { id: toastId });
      fetchData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError?.response?.data?.message || "Erreur de suppression", { id: toastId });
    }
  }, [fetchData]);

  // --- LOADING STATE ---
  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Calcul des indices §9.1.1..." />;
  }

  // --- RENDU PRINCIPAL ---
  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-black uppercase flex flex-col overflow-hidden w-full selection:bg-amber-500/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0 bg-[#0B0F1A]/95 backdrop-blur-3xl z-40">
        <div className="text-left space-y-2 w-full md:w-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl tracking-tighter m-0">
            Suivi <span className="text-amber-400">Consommations</span>
          </h1>
          <p className="text-slate-500 text-[9px] md:text-[10px] tracking-widest m-0">
            Management Énergie • ISO 14001
          </p>
        </div>
        <button 
          type="button"
          onClick={() => setIsFormOpen(true)} 
          className="bg-amber-600 px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-2xl md:rounded-3xl text-[9px] md:text-[10px] lg:text-[11px] shadow-2xl flex items-center gap-2 md:gap-3 lg:gap-4 hover:bg-white hover:text-amber-600 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 w-full md:w-auto justify-center"
          aria-label="Créer une nouvelle consommation"
        >
          <Plus size={18} className="w-4.5 h-4.5 md:w-5 md:h-5 lg:w-6 lg:h-6" strokeWidth={3} aria-hidden="true" /> 
          <span className="hidden sm:inline">Nouvelle Saisie</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-10 py-5 md:py-6 space-y-6 md:space-y-8">
        {/* KPI Tiles */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6" aria-label="Indicateurs de consommation">
          <StatTile label="Énergie" val={`${formatNumber(stats.totalEnergy, 'kWh')}`} icon={Zap} color="amber" progress={stats.efficiency} />
          <StatTile label="Eau" val={`${formatNumber(stats.totalWater, 'm³')}`} icon={Droplets} color="blue" />
          <StatTile label="Coût Total" val={formatNumber(stats.totalCost, 'XOF')} icon={TrendingUp} color="emerald" />
          <StatTile label="Seuil Critique" val="12k kWh" icon={Target} color="rose" />
        </section>

        {/* Registry Matrix */}
        <section className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col" aria-label="Registre des consommations">
          <div className="p-6 md:p-8 bg-black/20 flex flex-col md:flex-row justify-between gap-4 md:gap-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <label htmlFor="cons-search" className="sr-only">Rechercher une consommation</label>
              <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
              <input 
                id="cons-search"
                placeholder="Filtrer le registre..." 
                className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl py-2.5 md:py-4 pl-10 md:pl-14 pr-4 text-[9px] md:text-[10px] font-black italic outline-none focus:border-amber-500 text-white placeholder:text-slate-600" 
                value={searchTerm} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
                aria-label="Filtrer les consommations par type ou site"
              />
            </div>
            {/* Site filter */}
            <label htmlFor="site-filter" className="sr-only">Filtrer par site</label>
            <select 
              id="site-filter"
              value={selectedSite} 
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedSite(e.target.value)} 
              className="bg-black/40 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-2.5 md:py-4 text-[9px] md:text-[10px] font-black italic outline-none focus:border-amber-500 text-white cursor-pointer appearance-none"
              aria-label="Filtrer les consommations par site"
            >
              <option value="ALL" className="bg-[#0B0F1A]">Périmètre Global</option>
              {sites.map(s => <option key={s.S_Id} value={s.S_Id} className="bg-[#0B0F1A]">{s.S_Name}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto" role="region" aria-label="Tableau des consommations">
            <table className="w-full text-left border-collapse min-w-full" role="table">
              <thead>
                <tr className="bg-black/40 text-[8px] md:text-[9px] text-slate-500 tracking-widest border-b border-white/5 font-black italic">
                  <th scope="col" className="px-6 md:px-8 py-4 md:py-5 whitespace-nowrap">Période / Site</th>
                  <th scope="col" className="px-6 md:px-8 py-4 md:py-5 text-center whitespace-nowrap">Ressource</th>
                  <th scope="col" className="px-6 md:px-8 py-4 md:py-5 text-center whitespace-nowrap">Quantité</th>
                  <th scope="col" className="px-6 md:px-8 py-4 md:py-5 text-center whitespace-nowrap">Coût (XOF)</th>
                  <th scope="col" className="px-6 md:px-8 py-4 md:py-5 text-right whitespace-nowrap">Pilotage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {consumptions.filter(c => 
                  (c.CON_Type + (c.CON_Site?.S_Name || '')).toLowerCase().includes(searchTerm.toLowerCase())
                ).map(c => (
                  <tr key={c.CON_Id} className="hover:bg-amber-600/5 transition-all group focus-within:bg-amber-600/10" role="row">
                    <td className="px-6 md:px-8 py-4 md:py-6" role="cell">
                      <p className="text-sm md:text-base font-black m-0 leading-none">{c.CON_Month}/{c.CON_Year}</p>
                      <p className="text-[8px] md:text-[9px] text-slate-600 mt-1 m-0">{c.CON_Site?.S_Name || 'Master Site'}</p>
                    </td>
                    <td className="px-6 md:px-8 py-4 md:py-6 text-center" role="cell">
                      <span className="px-3 md:px-4 py-1.5 md:py-2 bg-white/5 border border-white/5 rounded-full text-[8px] md:text-[9px] text-amber-400 whitespace-nowrap">
                        {c.CON_Type}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-4 md:py-6 text-center text-lg md:text-xl font-black" role="cell">
                      {formatNumber(c.CON_Value, c.CON_Unit)}
                    </td>
                    <td className="px-6 md:px-8 py-4 md:py-6 text-center text-emerald-400 font-black" role="cell">
                      {c.CON_Cost?.toLocaleString('fr-SN') || '—'}
                    </td>
                    <td className="px-6 md:px-8 py-4 md:py-6 text-right" role="cell">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            type="button"
                            onClick={() => handleDelete(c.CON_Id)} 
                            className="p-2 md:p-3 bg-rose-600/10 text-rose-400 rounded-lg md:rounded-xl border-none cursor-pointer hover:bg-rose-600 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-rose-400"
                            aria-label={`Supprimer la consommation: ${c.CON_Type}`}
                            title="Supprimer"
                          >
                            <Trash2 size={16} className="w-4 h-4" aria-hidden="true"/>
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
                {consumptions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 md:px-8 py-12 md:py-16 text-center text-slate-500" role="status">
                      <Zap size={40} className="w-10 h-10 mx-auto mb-3 opacity-20" aria-hidden="true" />
                      <p className="text-[9px] md:text-[10px] font-black uppercase italic tracking-widest">
                        Aucune consommation enregistrée
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* MODAL FORM */}
      {isFormOpen && (
        <ConsumptionForm 
          sites={sites} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={fetchData} 
        />
      )}

      {/* GLOBAL STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        :focus-visible { outline: 2px solid #f59e0b; outline-offset: 2px; }
      `}</style>
    </div>
  );
}