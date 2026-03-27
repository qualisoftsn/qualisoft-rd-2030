/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🏢 MODULE : ARCHITECTURE SMI (ELITE-SDE)
 * RÔLE : Gestion des Directions, Services et Unités opérationnelles
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useEffect, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import { Layers, Search, Plus, ShieldCheck, Activity, ChevronRight, AlertCircle, Building2 } from 'lucide-react';
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
  OUT_IsActive?: boolean;
}

export interface OrgUnit {
  OU_Id: string;
  OU_Name: string;
  OU_Code?: string;
  OU_TypeId?: string;
  OU_Type?: OrgUnitType;
  OU_ParentId?: string;
  OU_IsActive?: boolean;
  OU_CreatedAt?: string;
  OU_Description?: string;
}

export interface OrgUnitCardProps {
  unit: OrgUnit;
  onClick?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
}

export interface LoadingStateProps {
  label: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING STATE
// ============================================================================

function LoadingState({ label }: LoadingStateProps) {
  return (
    <div 
      className="h-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-4 md:gap-6"
      role="status"
      aria-live="polite"
    >
      <div className="relative" aria-hidden="true">
        <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 border-b-2 border-blue-600 rounded-full animate-spin" />
      </div>
      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 animate-pulse">{label}</p>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ORG UNIT CARD
// ============================================================================

function OrgUnitCard({ unit, onClick, onKeyDown }: OrgUnitCardProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <article 
      className="bg-[#0F172A] border border-white/5 p-4 md:p-6 lg:p-8 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] flex items-center justify-between group hover:border-blue-600/30 transition-all shadow-inner focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
      role="article"
      aria-label={`Unité organisationnelle: ${unit.OU_Name}`}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
       <div className="flex items-center gap-4 md:gap-6 text-left min-w-0 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-black/40 rounded-lg md:rounded-xl flex items-center justify-center text-blue-400 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Layers size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
             <h3 className="text-base md:text-lg lg:text-xl font-black uppercase italic tracking-tight m-0 truncate text-white">
               {unit.OU_Name}
             </h3>
             <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 md:mt-1 m-0 italic flex items-center gap-1.5 md:gap-2">
                <Activity size={10} className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-400" aria-hidden="true" /> 
                {unit.OU_Type?.OUT_Label || 'SERVICE'}
             </p>
          </div>
       </div>
       <ChevronRight 
         size={16} 
         className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-slate-800 group-hover:text-blue-400 group-hover:translate-x-0.5 md:group-hover:translate-x-1 transition-all shrink-0" 
         aria-hidden="true" 
       />
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function OrgStructure() {
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<OrgUnit[]>('/org-units');
      setUnits(Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []));
    } catch (error) {
      console.error('❌ Erreur chargement structure:', error);
      toast.error("Erreur de synchronisation structurelle.");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const filteredUnits = useMemo(() => {
    if (!query.trim()) return units;
    const searchTerm = query.toLowerCase();
    return units.filter(u => 
      u.OU_Name.toLowerCase().includes(searchTerm) ||
      u.OU_Code?.toLowerCase().includes(searchTerm) ||
      u.OU_Type?.OUT_Label.toLowerCase().includes(searchTerm)
    );
  }, [units, query]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleUnitClick = (unit: OrgUnit) => {
    toast.info(`Unité: ${unit.OU_Name}`);
    // router.push(`/structure/${unit.OU_Id}`);
  };

  const handleUnitKeyDown = (e: KeyboardEvent<HTMLDivElement>, unit: OrgUnit) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleUnitClick(unit);
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingState label="Chargement de la structure..." />;
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 md:p-12 font-sans italic text-white selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 mb-6 md:mb-8 lg:mb-10 lg:mb-12 shrink-0">
        <div className="space-y-2 md:space-y-3 lg:space-y-4 text-left w-full md:w-auto">
          <div className="flex items-center gap-2 md:gap-3 text-blue-400 font-black uppercase tracking-widest text-[8px] md:text-[9px]">
            <ShieldCheck size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
            Master Structure Node
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl xl:text-7xl font-black uppercase tracking-tighter italic m-0 leading-none">
            Architecture <span className="text-blue-400">SMI</span>
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64 md:w-72 lg:w-80">
            <label htmlFor="units-search" className="sr-only">Rechercher une unité</label>
            <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
            <input 
              id="units-search"
              placeholder="FILTRER LES UNITÉS..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl py-2.5 md:py-3 lg:py-4 md:py-5 pl-10 md:pl-16 pr-4 md:pr-6 text-[9px] md:text-[10px] font-black uppercase italic outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-700"
              value={query} 
              onChange={handleSearchChange}
              aria-label="Filtrer les unités par nom, code ou type"
            />
          </div>
          <button 
            type="button"
            className="bg-white text-slate-900 px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all border-none cursor-pointer shadow-xl flex items-center justify-center gap-1.5 md:gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Ajouter une nouvelle unité"
          >
            <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 inline" aria-hidden="true" /> 
            <span className="hidden sm:inline">Ajouter Unité</span>
          </button>
        </div>
      </header>

      <main 
        className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-2 pb-6 md:pb-8 lg:pb-10" 
        role="region"
        aria-label="Liste des unités organisationnelles"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6" role="list">
          {filteredUnits.length > 0 ? filteredUnits.map(unit => (
            <OrgUnitCard 
              key={unit.OU_Id} 
              unit={unit}
              onClick={() => handleUnitClick(unit)}
              onKeyDown={(e) => handleUnitKeyDown(e, unit)}
            />
          )) : (
            <div 
              className="col-span-full h-40 md:h-48 lg:h-56 flex flex-col items-center justify-center text-slate-500 bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl"
              role="status"
            >
              <Building2 size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mb-3 md:mb-4 opacity-20" aria-hidden="true" />
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-center px-4">
                {query ? 'Aucune unité ne correspond à la recherche' : 'Aucune unité enregistrée'}
              </p>
              {!query && (
                <button 
                  type="button"
                  className="mt-2 md:mt-3 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
                >
                  Créer votre première unité
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}