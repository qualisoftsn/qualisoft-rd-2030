/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : ORGANIGRAMME INTERACTIF SMI (ISO 9001 §5.3)
 * RÔLE : Vue matricielle de la structure organisationnelle
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { 
  Building2, MapPin, Search, LayoutGrid, 
  List, RefreshCw, ArrowUpRight, Users
} from 'lucide-react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { toast, Toaster } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface OrgUnitType {
  OUT_Id: string;
  OUT_Label: string;
  OUT_Description?: string;
}

export interface Site {
  SI_Id: string;
  SI_Name: string;
  SI_Location?: string;
  SI_IsActive?: boolean;
}

export interface OrgUnit {
  OU_Id: string;
  OU_Name: string;
  OU_Code: string;
  OU_Type?: OrgUnitType;
  OU_ParentId?: string;
  OU_SiteId?: string;
  OU_Site?: Site;
  OU_IsActive: boolean;
  OU_CreatedAt: string;
  _count?: { OU_Users: number; OU_Processus: number };
}

export interface UnitCardProps {
  unit: OrgUnit;
  viewMode: 'grid' | 'list';
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-blue-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : UNIT CARD
// ============================================================================

function UnitCard({ unit, viewMode }: UnitCardProps) {
  if (viewMode === 'list') {
    return (
      <article 
        className="bg-[#0F172A] border-2 border-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl flex items-center justify-between group hover:border-blue-500/30 transition-all cursor-pointer focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
        role="article"
        tabIndex={0}
        aria-label={`Unité organisationnelle: ${unit.OU_Name}`}
      >
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Building2 size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
          </div>
          <div className="text-left min-w-0">
            <h3 className="text-base md:text-lg tracking-tighter m-0 leading-none truncate">{unit.OU_Name}</h3>
            <p className="text-[8px] md:text-[9px] text-slate-600 m-0 mt-1 md:mt-2 uppercase tracking-widest italic truncate">
              {unit.OU_Type?.OUT_Label || 'UNITÉ'} • {unit.OU_Site?.S_Name || 'NON DÉPLOYÉ'}
            </p>
          </div>
        </div>
        <ArrowUpRight size={16} className="w-4 h-4 md:w-5 md:h-5 text-slate-800 group-hover:text-blue-400" aria-hidden="true" />
      </article>
    );
  }

  // Grid view
  return (
    <article 
      className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-6 md:p-8 lg:p-10 hover:border-blue-600/30 transition-all shadow-2xl group flex flex-col justify-between h-[400px] md:h-[400px] relative overflow-hidden text-left cursor-pointer focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="article"
      tabIndex={0}
      aria-label={`Unité organisationnelle: ${unit.OU_Name}`}
    >
       <div className="absolute -right-4 md:-right-6 -top-4 md:-top-6 opacity-5 rotate-12 pointer-events-none group-hover:rotate-0 transition-transform duration-1000" aria-hidden="true">
         <Building2 size={120} className="w-30 h-30 md:w-40 md:h-40" />
       </div>
       
       <div className="relative z-10 flex justify-between items-start">
          <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl lg:rounded-3xl bg-black/40 border border-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
            <Building2 size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
          </div>
          <span className="px-3 md:px-4 py-1 md:py-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl text-[8px] md:text-[9px] tracking-widest">
            {unit.OU_Type?.OUT_Label || 'UNITÉ'}
          </span>
       </div>
       
       <div className="relative z-10 space-y-4 md:space-y-6">
          <h3 className="text-xl md:text-2xl lg:text-3xl leading-none tracking-tighter m-0 line-clamp-2 uppercase italic group-hover:text-blue-400 transition-colors">
            {unit.OU_Name}
          </h3>
          <div className="space-y-3 md:space-y-4 pt-4 md:pt-6 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
             <div className="flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] tracking-widest">
               <MapPin size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400" aria-hidden="true" /> 
               {unit.OU_Site?.S_Name || 'NON DÉPLOYÉ'}
             </div>
             <div className="flex justify-between items-end italic">
               <span className="text-[8px] md:text-[9px] text-slate-500 tracking-widest uppercase flex items-center gap-1.5 md:gap-2">
                 <Users size={10} className="w-2.5 h-2.5 md:w-3 md:h-3" aria-hidden="true" /> 
                 EFFECTIF STAFF
               </span>
               <span className="text-xl md:text-2xl leading-none text-white">
                 {unit._count?.OU_Users || 0}
               </span>
             </div>
          </div>
       </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function InteractiveOrgChart() {
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<OrgUnit[]>('/org-units?includeStats=true');
      setUnits(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement organigramme:', error);
      toast.error("ÉCHEC SYNC ARBRE");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchUnits(); }, [fetchUnits]);

  const filteredUnits = useMemo(() => {
    return units.filter(u => u.OU_Name.toLowerCase().includes(search.toLowerCase()));
  }, [units, search]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Génération de la matrice SMI..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 lg:gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic">Organigramme <span className="text-blue-400">SMI</span></h1>
          <p className="text-slate-500 text-[9px] md:text-[10px] tracking-widest m-0 italic uppercase">Cartographie Décisionnelle 2026</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full xl:w-auto justify-center xl:justify-end">
           <div className="relative flex-1 xl:w-64 lg:w-80 group">
             <label htmlFor="unit-search" className="sr-only">Rechercher une unité</label>
             <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-400 transition-all pointer-events-none w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
             <input 
               id="unit-search"
               value={search} 
               onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} 
               placeholder="FILTRER NODES..." 
               className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl py-2.5 md:py-3 lg:py-5 pl-10 md:pl-16 pr-4 md:pr-6 lg:pr-8 text-[9px] md:text-[10px] lg:text-[11px] font-black italic text-white outline-none focus:border-blue-500 transition-all"
               aria-label="Filtrer les unités organisationnelles"
             />
           </div>
           <div className="flex bg-[#0F172A] border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl p-1" role="tablist" aria-label="Mode d'affichage">
              <button 
                type="button"
                onClick={() => setViewMode('grid')} 
                className={cn(
                  "p-2 md:p-3 lg:p-4 rounded-lg md:rounded-xl lg:rounded-2xl transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                  viewMode === 'grid' ? "bg-blue-600 text-white" : "text-slate-600 hover:text-white"
                )}
                role="tab"
                aria-selected={viewMode === 'grid'}
                aria-label="Vue grille"
              >
                <LayoutGrid size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5" aria-hidden="true" />
              </button>
              <button 
                type="button"
                onClick={() => setViewMode('list')} 
                className={cn(
                  "p-2 md:p-3 lg:p-4 rounded-lg md:rounded-xl lg:rounded-2xl transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                  viewMode === 'list' ? "bg-blue-600 text-white" : "text-slate-600 hover:text-white"
                )}
                role="tab"
                aria-selected={viewMode === 'list'}
                aria-label="Vue liste"
              >
                <List size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5" aria-hidden="true" />
              </button>
           </div>
        </div>
      </header>

      {/* 📜 WORKZONE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <div 
          className={cn(
            "max-w-[100rem] mx-auto pb-10 md:pb-16 lg:pb-20",
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8" 
              : "flex flex-col gap-3 md:gap-4"
          )}
          role="list"
          aria-label="Liste des unités organisationnelles"
        >
          {filteredUnits.length > 0 ? filteredUnits.map((unit) => (
             <UnitCard key={unit.OU_Id} unit={unit} viewMode={viewMode} />
          )) : (
            <div className="col-span-full h-64 md:h-80 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] opacity-20" role="status">
              <Building2 size={48} className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4" aria-hidden="true" />
              <p className="text-[10px] md:text-[11px] tracking-widest">Aucune unité trouvée</p>
            </div>
          )}
        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}