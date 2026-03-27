/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🗺️ MODULE : CARTOGRAPHIE DES PROCESSUS (ISO 9001 §4.4)
 * RÔLE : Inventaire centralisé et modélisation du Système de Management
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useCallback, useEffect, useState, useMemo, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import Link from "next/link";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { 
  ArrowUpRight, Edit3, GitBranch, Layers, Plus, 
  ShieldCheck, X, Search, RefreshCw, AlertCircle
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface ProcessusType {
  PT_Id: string;
  PT_Label: string;
  PT_Description?: string;
}

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Actif?: boolean;
}

export interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_Description?: string;
  PR_TypeId?: string;
  PR_Type?: ProcessusType;
  PR_PiloteId?: string;
  PR_Pilote?: User;
  PR_IsActive: boolean;
  PR_CreatedAt: string;
  PR_UpdatedAt: string;
}

export interface ProcessusFormData {
  PR_Code: string;
  PR_Libelle: string;
  PR_TypeId: string;
  PR_PiloteId: string;
}

export interface InputSDEProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export interface SelectSDEProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ id: string; label: string }>;
  error?: string;
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
// SOUS-COMPOSANT : INPUT SDE
// ============================================================================

function InputSDE({ label, value, onChange, placeholder, error }: InputSDEProps) {
  return (
    <div className="space-y-2 md:space-y-3 lg:space-y-4 text-left">
      <label className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-4 md:ml-6 block">{label}</label>
      <input 
        value={value} 
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
        placeholder={placeholder} 
        className={cn(
          "w-full bg-slate-950 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-5 lg:p-6 text-[10px] md:text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-500 transition-all shadow-inner",
          error ? "border-rose-500/50" : "border-white/5"
        )}
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-rose-400 text-[8px] md:text-[9px] ml-4 md:ml-6 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SELECT SDE
// ============================================================================

function SelectSDE({ label, value, onChange, options, error }: SelectSDEProps) {
  return (
    <div className="space-y-2 md:space-y-3 lg:space-y-4 text-left">
      <label className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-4 md:ml-6 block">{label}</label>
      <div className="relative">
        <select 
          value={value} 
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)} 
          className={cn(
            "w-full bg-slate-950 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-5 lg:p-6 text-[10px] md:text-[11px] font-black uppercase italic text-white outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-inner pr-10 md:pr-12",
            error ? "border-rose-500/50" : "border-white/5"
          )}
          aria-invalid={!!error}
        >
          <option value="" className="bg-[#0B0F1A] text-slate-500">SÉLECTIONNER...</option>
          {options.map((o) => <option key={o.id} value={o.id} className="bg-[#0B0F1A] text-white">{o.label}</option>)}
        </select>
        <div className="absolute right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600" aria-hidden="true">
          <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      {error && (
        <p className="text-rose-400 text-[8px] md:text-[9px] ml-4 md:ml-6 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ProcessusPage() {
  const [items, setItems] = useState<Processus[]>([]);
  const [collaborateurs, setCollaborateurs] = useState<User[]>([]);
  const [types, setTypes] = useState<ProcessusType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Processus | null>(null);
  const [search, setSearch] = useState("");
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProcessusFormData, string>>>({});

  const [formData, setFormData] = useState<ProcessusFormData>({
    PR_Code: "", PR_Libelle: "", PR_TypeId: "", PR_PiloteId: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [resP, resU, resT] = await Promise.all([
        apiClient.get<Processus[]>("/processus"),
        apiClient.get<User[]>("/users"),
        apiClient.get<ProcessusType[]>("/processus-types"),
      ]);
      const extract = <T,>(res: { data?: { data?: T[] }; data?: T[] }) => Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setItems(extract(resP).filter(p => p.PR_IsActive !== false));
      setCollaborateurs(extract(resU).filter(u => u.U_Actif !== false));
      setTypes(extract(resT));
    } catch (error) {
      console.error('❌ Erreur chargement processus:', error);
      toast.error("RUPTURE DE FLUX MATRIX §4.4");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') loadData(); }, [loadData]);

  const filteredItems = useMemo(() => {
    const term = search.toLowerCase().trim();
    return items.filter(i => 
      i.PR_Libelle?.toLowerCase().includes(term) || i.PR_Code?.toLowerCase().includes(term)
    );
  }, [items, search]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ProcessusFormData, string>> = {};
    if (!formData.PR_Code.trim()) errors.PR_Code = 'Le code est requis';
    if (!formData.PR_Libelle.trim()) errors.PR_Libelle = 'La désignation est requise';
    if (!formData.PR_TypeId) errors.PR_TypeId = 'La typologie est requise';
    if (!formData.PR_PiloteId) errors.PR_PiloteId = 'Le pilote est requis';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }

    const toastId = toast.loading("Scellage Matrix...");
    try {
      if (selected) {
        await apiClient.patch(`/processus/${selected.PR_Id}`, formData);
        toast.success("REGISTRE CARTOGRAPHIQUE MIS À JOUR", { id: toastId });
      } else {
        await apiClient.post("/processus", formData);
        toast.success("NOUVEAU PROCESSUS CRÉÉ", { id: toastId });
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ÉCHEC DU SCELLAGE", { id: toastId });
    }
  };

  const openModal = (pr?: Processus) => {
    setSelected(pr || null);
    setFormData({
      PR_Code: pr?.PR_Code || "", 
      PR_Libelle: pr?.PR_Libelle || "",
      PR_TypeId: pr?.PR_TypeId || "", 
      PR_PiloteId: pr?.PR_PiloteId || ""
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
    setFormErrors({});
  };

  // Close modal on Escape
  useEffect(() => {
    if (!isModalOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEscape as any);
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [isModalOpen]);

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Synchronisation SMI Core..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic flex items-center gap-3 md:gap-4 lg:gap-5">
            <GitBranch className="text-blue-400 w-8 h-8 md:w-10 md:h-10 lg:w-10 lg:h-10" aria-hidden="true" /> 
            Cartographie <span className="text-blue-400">SMI</span>
          </h1>
          <p className="text-slate-500 text-[8px] md:text-[9px] tracking-widest m-0 flex items-center gap-1.5 md:gap-2">
            <ShieldCheck size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-400" aria-hidden="true" /> 
            ISO 9001 §4.4 • Gouvernance Matrix
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <div className="relative flex-1 xl:w-64 lg:w-80 group">
            <label htmlFor="process-search" className="sr-only">Rechercher un processus</label>
            <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-400 transition-all pointer-events-none w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
            <input 
              id="process-search"
              value={search} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} 
              placeholder="FILTRER LES FLUX..." 
              className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl py-2.5 md:py-3 lg:py-5 pl-10 md:pl-16 pr-4 md:pr-6 text-[9px] md:text-[10px] lg:text-[11px] font-black italic text-white outline-none focus:border-blue-500 transition-all"
              aria-label="Filtrer les processus"
            />
          </div>
          <button 
            type="button"
            onClick={() => openModal()} 
            className="bg-blue-600 hover:bg-white hover:text-blue-700 px-4 md:px-6 lg:px-8 lg:px-10 py-2.5 md:py-3 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] shadow-2xl border-none cursor-pointer text-white italic transition-all active:scale-95 flex items-center gap-2 md:gap-3 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full xl:w-auto justify-center"
            aria-label="Créer un nouveau processus"
          >
            <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
            <span className="hidden sm:inline">Nouveau</span>
          </button>
        </div>
      </header>

      {/* 📋 WORKZONE */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pt-6 md:pt-8 lg:pt-10">
        <div className="max-w-[100rem] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8 pb-10 md:pb-16 lg:pb-20" role="list" aria-label="Liste des processus">
          {filteredItems.length > 0 ? filteredItems.map((pr) => (
            <article 
              key={pr.PR_Id} 
              className="bg-[#0F172A] border-2 border-white/5 p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] group hover:border-blue-600/30 transition-all shadow-2xl relative overflow-hidden flex flex-col justify-between h-[400px] md:h-[420px]"
              role="listitem"
            >
              <div className="absolute -right-6 md:-right-8 lg:-right-12 -top-6 md:-top-8 lg:-top-12 text-blue-600/5 group-hover:text-blue-600/10 transition-all duration-1000 rotate-12 pointer-events-none" aria-hidden="true">
                <GitBranch size={150} className="w-40 h-40 md:w-50 md:h-50 lg:w-56 lg:h-56" />
              </div>

              <div className="relative z-10 space-y-4 md:space-y-5 lg:space-y-6">
                <div className="flex justify-between items-start">
                  <span className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl text-[9px] md:text-[10px] tracking-widest">{pr.PR_Code}</span>
                  <button 
                    type="button"
                    onClick={() => openModal(pr)} 
                    className="p-2 md:p-3 text-slate-500 hover:text-white bg-black/40 rounded-lg md:rounded-xl border border-white/5 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label={`Modifier ${pr.PR_Libelle}`}
                  >
                    <Edit3 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
                  </button>
                </div>
                <h4 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter leading-tight m-0 group-hover:text-blue-400 transition-colors uppercase truncate">{pr.PR_Libelle}</h4>
                <div className="flex items-center gap-2 md:gap-3 text-slate-500 text-[8px] md:text-[9px] tracking-widest italic font-black">
                  <Layers size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-400" aria-hidden="true" /> 
                  {pr.PR_Type?.PT_Label || "PROCESSUS TRANSVERSAL"}
                </div>

                <div className="bg-black/40 p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border border-white/5 flex items-center gap-3 md:gap-4 lg:gap-5 shadow-inner">
                  <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl md:rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-400 text-base md:text-lg shrink-0">
                    {pr.PR_Pilote?.U_FirstName?.[0]}{pr.PR_Pilote?.U_LastName?.[0]}
                  </div>
                  <div className="text-left overflow-hidden min-w-0">
                    <p className="text-[7px] md:text-[8px] text-slate-600 tracking-widest m-0 mb-0.5 md:mb-1">PILOTE TITULAIRE</p>
                    <p className="text-[10px] md:text-[11px] lg:text-[12px] text-slate-200 m-0 truncate italic">{pr.PR_Pilote?.U_FirstName} {pr.PR_Pilote?.U_LastName || 'Non assigné'}</p>
                  </div>
                </div>
              </div>

              <Link 
                href={`/dashboard/processus/cockpit/${pr.PR_Id}`} 
                className="mt-6 md:mt-8 bg-blue-600 text-white py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black uppercase italic text-[9px] md:text-[10px] tracking-widest hover:bg-white hover:text-blue-700 transition-all no-underline flex items-center justify-center gap-2 md:gap-3 relative z-10 shadow-2xl border-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label={`Ouvrir le cockpit de ${pr.PR_Libelle}`}
              >
                Ouvrir Cockpit <ArrowUpRight size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
              </Link>
            </article>
          )) : (
            <div className="col-span-full h-64 md:h-80 border-2 border-dashed border-white/10 rounded-2xl md:rounded-3xl lg:rounded-[4rem] flex flex-col items-center justify-center text-slate-500" role="status">
              <GitBranch size={48} className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 opacity-20" aria-hidden="true" />
              <p className="font-black uppercase italic text-[9px] md:text-[10px] tracking-widest text-center px-4">
                {search ? 'Aucun processus ne correspond à la recherche' : 'Aucun processus enregistré'}
              </p>
              {!search && (
                <button 
                  type="button"
                  onClick={() => openModal()}
                  className="mt-3 md:mt-4 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
                >
                  Créer votre premier processus
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 📟 MODAL DRAWER */}
      {isModalOpen && typeof window !== 'undefined' && (
        <div 
          className="fixed inset-0 z-50 flex justify-end" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="drawer-title"
        >
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={closeModal}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-lg bg-[#0F172A] p-6 md:p-8 lg:p-12 border-l border-white/5 animate-in slide-in-from-right duration-500 flex flex-col shadow-2xl overflow-y-auto custom-scrollbar h-full">
            <header className="flex justify-between items-center mb-8 md:mb-12 lg:mb-16">
              <h2 id="drawer-title" className="text-2xl md:text-3xl font-black italic m-0">Config. <span className="text-blue-400">SMI</span></h2>
              <button 
                type="button"
                onClick={closeModal} 
                className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl text-slate-500 hover:text-white border-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Fermer"
              >
                <X size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 lg:space-y-10 flex-1 flex flex-col justify-between">
              <div className="space-y-6 md:space-y-8 lg:space-y-10">
                <InputSDE 
                  label="Code Radical" 
                  value={formData.PR_Code} 
                  onChange={(v: string) => setFormData({...formData, PR_Code: v.toUpperCase()})} 
                  placeholder="EX: RH-01"
                  error={formErrors.PR_Code}
                />
                <InputSDE 
                  label="Désignation" 
                  value={formData.PR_Libelle} 
                  onChange={(v: string) => setFormData({...formData, PR_Libelle: v.toUpperCase()})} 
                  placeholder="Nom du processus..."
                  error={formErrors.PR_Libelle}
                />
                
                <SelectSDE 
                  label="Typologie" 
                  value={formData.PR_TypeId} 
                  onChange={(v: string) => setFormData({...formData, PR_TypeId: v})} 
                  options={types.map(t => ({ id: t.PT_Id, label: t.PT_Label }))}
                  error={formErrors.PR_TypeId}
                />
                <SelectSDE 
                  label="Pilote Responsable" 
                  value={formData.PR_PiloteId} 
                  onChange={(v: string) => setFormData({...formData, PR_PiloteId: v})} 
                  options={collaborateurs.map(u => ({ id: u.U_Id, label: `${u.U_FirstName} ${u.U_LastName}` }))}
                  error={formErrors.PR_PiloteId}
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-4 md:py-6 lg:py-8 bg-blue-600 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black uppercase text-[10px] md:text-[11px] lg:text-[12px] tracking-widest italic border-none cursor-pointer mt-8 md:mt-10 lg:mt-12 hover:bg-white hover:text-blue-700 transition-all shadow-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Valider la Matrice
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}