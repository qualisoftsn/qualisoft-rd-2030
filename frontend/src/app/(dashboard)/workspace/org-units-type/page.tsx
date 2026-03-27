/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : CONFIGURATION DES TYPES D'UNITÉS (ORG-UNIT-TYPES)
 * RÔLE : Définition des méta-données structurelles pour le SMI
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useCallback, useEffect, useMemo, useState, ChangeEvent, KeyboardEvent } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { Network, Plus, RefreshCw, Search, Settings, ShieldCheck, Trash2, X, Edit3, Activity, AlertCircle, MoreVertical } from "lucide-react";
import { toast, Toaster } from "sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface OrgUnitType {
  OUT_Id: string;
  OUT_Label: string;
  OUT_Level?: number;
  OUT_Description?: string;
  OUT_IsActive?: boolean;
  OUT_CreatedAt?: string;
}

export interface OrgUnitTypeCardProps {
  type: OrgUnitType;
  onEdit?: (type: OrgUnitType) => void;
  onDelete?: (type: OrgUnitType) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
}

export interface LoadingScreenProps {
  label: string;
}

export interface FormErrors {
  OUT_Label?: string;
}

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <div 
      className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6"
      role="status"
      aria-live="polite"
    >
      <RefreshCw className="animate-spin text-purple-400 w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" strokeWidth={1} aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 animate-pulse text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : ORG UNIT TYPE CARD
// ============================================================================

function OrgUnitTypeCard({ type, onEdit, onDelete, onKeyDown }: OrgUnitTypeCardProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEdit?.(type);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(type);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Supprimer le type "${type.OUT_Label}" ?`)) {
      onDelete?.(type);
    }
  };

  return (
    <article 
      className="bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[4rem] p-4 md:p-6 lg:p-8 lg:p-10 flex flex-col justify-between group hover:border-purple-600/40 transition-all shadow-2xl relative overflow-hidden h-[260px] md:h-[280px] lg:h-[300px] focus-within:border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
      role="article"
      aria-label={`Type d'unité: ${type.OUT_Label}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute -right-4 md:-right-6 -top-4 md:-top-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" aria-hidden="true">
        <Network size={100} className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32" />
      </div>
      
      <div className="relative z-10 flex justify-between items-start">
         <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl lg:rounded-3xl bg-purple-600/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-all shrink-0">
           <Network size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />
         </div>
         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button 
              type="button"
              onClick={handleEditClick}
              className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl border-none cursor-pointer text-slate-500 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-label={`Modifier ${type.OUT_Label}`}
              title="Modifier"
            >
              <Edit3 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
            </button>
            <button 
              type="button"
              onClick={handleDeleteClick}
              className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl border-none cursor-pointer text-slate-500 hover:text-red-400 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label={`Supprimer ${type.OUT_Label}`}
              title="Supprimer"
            >
              <Trash2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
            </button>
         </div>
      </div>

      <div className="relative z-10 text-left">
        <h3 className="text-2xl md:text-3xl tracking-tighter m-0 mb-2 md:mb-3 text-white">{type.OUT_Label}</h3>
        <div className="flex items-center gap-3 md:gap-4">
          <span className="px-3 md:px-4 py-1 md:py-1.5 bg-purple-600/10 rounded-lg md:rounded-xl text-[8px] md:text-[9px] text-purple-400 border border-purple-500/20 tracking-widest">
            LEVEL {type.OUT_Level || 1}
          </span>
          <div className="flex-1 h-px bg-white/5" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function OrgUnitsTypePage() {
  const [types, setTypes] = useState<OrgUnitType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const loadTypes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<OrgUnitType[]>("/org-unit-types");
      setTypes(Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []));
    } catch (error) {
      console.error('❌ Erreur chargement types:', error);
      toast.error("ÉCHEC DE LECTURE DU REGISTRE ORGANIQUE");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') loadTypes(); }, [loadTypes]);

  const filteredTypes = useMemo(() => {
    if (!search.trim()) return types;
    return types.filter(t => t.OUT_Label.toLowerCase().includes(search.toLowerCase()));
  }, [types, search]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleEditType = (type: OrgUnitType) => {
    toast.info(`Modification: ${type.OUT_Label}`);
    // router.push(`/org-units-type/${type.OUT_Id}`);
  };

  const handleDeleteType = async (type: OrgUnitType) => {
    const toastId = toast.loading("Suppression en cours...");
    try {
      await apiClient.delete(`/org-unit-types/${type.OUT_Id}`);
      toast.success("Type supprimé", { id: toastId });
      loadTypes();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "Échec de la suppression", { id: toastId });
    }
  };

  const handleTypeKeyDown = (e: KeyboardEvent<HTMLDivElement>, type: OrgUnitType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleEditType(type);
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Scan de la Classification Organique..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-purple-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 lg:gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0">
            Classification <span className="text-purple-400">Organique</span>
          </h1>
          <p className="text-slate-500 text-[9px] md:text-[10px] tracking-widest m-0 italic">
            Hiérarchisation des Grades §5.3
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <div className="relative flex-1 xl:w-64 lg:w-80 group">
            <label htmlFor="types-search" className="sr-only">Rechercher un grade</label>
            <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-all pointer-events-none w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
            <input 
              id="types-search"
              value={search} 
              onChange={handleSearchChange} 
              placeholder="FILTRER GRADES..." 
              className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl py-2.5 md:py-3 lg:py-5 pl-10 md:pl-16 pr-4 md:pr-6 lg:pr-8 text-[9px] md:text-[10px] lg:text-[11px] font-black italic text-white outline-none focus:border-purple-500"
              aria-label="Filtrer les types d'unités par label"
            />
          </div>
          <button 
            type="button"
            onClick={() => setShowModal(true)} 
            className="bg-purple-600 hover:bg-white hover:text-purple-700 px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] flex items-center gap-2 md:gap-3 transition-all border-none cursor-pointer text-white italic shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label="Créer un nouveau grade"
          >
            <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
            <span className="hidden sm:inline">Nouveau Grade</span>
          </button>
        </div>
      </header>

      {/* 📋 MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8 pb-10 md:pb-16 lg:pb-20" role="list" aria-label="Liste des types d'unités">
          {filteredTypes.length > 0 ? filteredTypes.map((type) => (
            <OrgUnitTypeCard 
              key={type.OUT_Id} 
              type={type}
              onEdit={handleEditType}
              onDelete={handleDeleteType}
              onKeyDown={(e) => handleTypeKeyDown(e, type)}
            />
          )) : (
            <div 
              className="col-span-full h-40 md:h-48 lg:h-56 flex flex-col items-center justify-center text-slate-500 bg-[#0F172A] border border-white/5 rounded-2xl md:rounded-3xl"
              role="status"
            >
              <Network size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 mb-3 md:mb-4 opacity-20" aria-hidden="true" />
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-center px-4">
                {search ? 'Aucun grade ne correspond à la recherche' : 'Aucun grade enregistré'}
              </p>
              {!search && (
                <button 
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="mt-2 md:mt-3 text-[8px] md:text-[9px] text-purple-400 hover:text-purple-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-purple-400 rounded px-3 py-1"
                >
                  Créer votre premier grade
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(168,85,247,0.3);border-radius:10px}:focus-visible{outline:2px solid #a855f7;outline-offset:2px}`}</style>
    </div>
  );
}