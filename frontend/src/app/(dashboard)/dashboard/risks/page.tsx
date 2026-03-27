/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : REGISTRE SOUVERAIN DES RISQUES (ISO 9001 §6.1)
 * RÔLE : Pilotage des menaces et opportunités
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useCallback, useEffect, useMemo, useState, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { 
  Activity, AlertOctagon, AlertTriangle, Edit3, Fingerprint, 
  Loader2, Plus, Save, ShieldCheck, Trash2, X, Zap, Target,
  RefreshCw, ChevronRight, Search, Database, Scale, Minus
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface Processus {
  PR_Id: string;
  PR_Code: string;
  PR_Libelle: string;
  PR_IsActive?: boolean;
}

export interface RiskType {
  RT_Id: string;
  RT_Label: string;
  RT_Category?: string;
  RT_IsActive?: boolean;
}

export interface RiskData {
  RS_Id?: string;
  RS_Libelle: string;
  RS_Activite: string;
  RS_Causes: string;
  RS_Description: string;
  RS_Probabilite: number;
  RS_Gravite: number;
  RS_Maitrise: number;
  RS_ProcessusId: string;
  RS_TypeId: string;
  RS_Status: string;
  RS_Mesures: string;
  RS_Acteurs: string;
  RS_NextReview: string;
  RS_Contexte: string;
  RS_PartiesInteressees: string;
  RS_ExigencesLegales: string;
  RS_Opportunite: string;
  Processus?: { PR_Libelle: string };
}

export interface KPIBoxProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'emerald' | 'rose' | 'amber' | 'blue';
}

export interface CotationProps {
  val: number;
  l: string;
  c: string;
}

export interface CotationBoxProps {
  label: string;
  val: number;
  set: (v: number) => void;
}

export interface SDEInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export interface SDESelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_FORM: RiskData = {
  RS_Libelle: "", RS_Activite: "", RS_Causes: "", RS_Description: "",
  RS_Probabilite: 1, RS_Gravite: 1, RS_Maitrise: 1, RS_ProcessusId: "", 
  RS_TypeId: "", RS_Status: "IDENTIFIE", RS_Mesures: "", RS_Acteurs: "", 
  RS_NextReview: "", RS_Contexte: "", RS_PartiesInteressees: "", 
  RS_ExigencesLegales: "", RS_Opportunite: ""
};

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-red-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-red-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : KPI BOX
// ============================================================================

function KPIBox({ label, value, icon, color }: KPIBoxProps) {
  const c: Record<KPIBoxProps['color'], string> = { 
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", 
    rose: "text-red-400 bg-red-500/10 border-red-500/20", 
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20", 
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20" 
  };
  
  return (
    <article className={cn("p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border flex items-center justify-between shadow-2xl transition-all hover:scale-[1.02] focus-within:ring-2 focus-within:ring-red-400", c[color])}>
      <div className="flex items-center gap-3 md:gap-4">
        <div className="p-3 md:p-4 bg-black/40 rounded-xl md:rounded-2xl shadow-inner text-white">
          {icon}
        </div>
        <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 italic tracking-widest m-0 text-left hidden lg:inline">{label}</span>
      </div>
      <span className="text-3xl md:text-4xl font-black italic m-0 text-white leading-none tracking-tighter drop-shadow-md">{value}</span>
    </article>
  );
}

// ============================================================================
// SOUS-COMPOSANT : COTATION
// ============================================================================

function Cotation({ val, l, c }: CotationProps) {
  return (
    <span className={cn("px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-black/50 border border-white/5 text-[10px] md:text-[11px] font-black italic shadow-inner tracking-widest", c)}>
      {l}:{val}
    </span>
  );
}

// ============================================================================
// SOUS-COMPOSANT : COTATION BOX
// ============================================================================

function CotationBox({ label, val, set }: CotationBoxProps) {
  const handleDecrement = () => set(Math.max(1, val - 1));
  const handleIncrement = () => set(Math.min(4, val + 1));

  return (
    <div className="flex items-center justify-between bg-black/40 p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl border-2 border-white/5 w-full transition-all hover:border-white/10 shadow-inner">
       <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</span>
       <div className="flex items-center gap-4 md:gap-6">
          <button 
            type="button"
            onClick={handleDecrement} 
            className="text-white hover:text-red-400 p-1 md:p-2 rounded-lg bg-transparent border-none font-black text-xl md:text-2xl cursor-pointer transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label={`Diminuer ${label}`}
          >
            <Minus size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          </button>
          <span className="text-xl md:text-2xl font-black italic text-white leading-none w-5 md:w-6 text-center" aria-label={`Valeur: ${val}`}>{val}</span>
          <button 
            type="button"
            onClick={handleIncrement} 
            className="text-white hover:text-red-400 p-1 md:p-2 rounded-lg bg-transparent border-none font-black text-xl md:text-2xl cursor-pointer transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label={`Augmenter ${label}`}
          >
            <Plus size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
          </button>
       </div>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SDE INPUT
// ============================================================================

function SDEInput({ label, value, onChange, placeholder, required, error }: SDEInputProps) {
  return (
    <div className="space-y-2 md:space-y-3 text-left w-full">
      <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4 italic m-0 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input 
        value={value || ""} 
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} 
        placeholder={placeholder}
        required={required}
        className={cn(
          "w-full bg-black/40 border-2 rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 text-[11px] md:text-[12px] font-black text-white outline-none italic focus:border-red-500 focus:bg-white/5 transition-all uppercase shadow-inner",
          error ? "border-red-500/50" : "border-white/5"
        )}
        aria-required={required}
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
          <AlertTriangle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SDE SELECT
// ============================================================================

function SDESelect({ label, value, onChange, children, required, error }: SDESelectProps) {
  return (
    <div className="space-y-2 md:space-y-3 text-left w-full relative">
      <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 md:ml-4 italic m-0 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <select 
          value={value || ""} 
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)} 
          required={required}
          className={cn(
            "w-full bg-black/40 border-2 rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 text-[11px] md:text-[12px] font-black text-white outline-none italic focus:border-red-500 focus:bg-white/5 appearance-none cursor-pointer shadow-inner pr-10 md:pr-12",
            error ? "border-red-500/50" : "border-white/5"
          )}
          aria-required={required}
          aria-invalid={!!error}
        >
          {children}
        </select>
        <div className="absolute right-4 md:right-6 bottom-4 md:bottom-5 lg:bottom-6 pointer-events-none text-red-400" aria-hidden="true">
          <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
          <AlertTriangle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function RiskGridPage() {
  const [items, setItems] = useState<RiskData[]>([]);
  const [processusList, setProcessusList] = useState<Processus[]>([]);
  const [riskTypes, setRiskTypes] = useState<RiskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState<RiskData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RiskData, string>>>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rProc, rTypes, rRisks] = await Promise.all([
        apiClient.get<Processus[]>("/processus"), 
        apiClient.get<RiskType[]>("/risk-types"), 
        apiClient.get<RiskData[]>("/risks")
      ]);
      setProcessusList(Array.isArray(rProc.data) ? rProc.data.filter(p => p.PR_IsActive !== false) : []);
      setRiskTypes(Array.isArray(rTypes.data) ? rTypes.data.filter(t => t.RT_IsActive !== false) : []);
      setItems(Array.isArray(rRisks.data) ? rRisks.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement risques:', error);
      toast.error("RUPTURE KERNEL MATRIX : Synchronisation impossible."); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') fetchData(); }, [fetchData]);

  const score = useMemo(() => formData.RS_Probabilite * formData.RS_Gravite * (formData.RS_Maitrise || 1), [formData]);

  const stats = useMemo(() => {
    const critical = items.filter(r => (r.RS_Probabilite * r.RS_Gravite * (r.RS_Maitrise || 1)) >= 16).length;
    return { 
      total: items.length, 
      critical, 
      rate: items.length > 0 ? Math.round(((items.length - critical) / items.length) * 100) : 100 
    };
  }, [items]);

  const filteredItems = useMemo(() => 
    items.filter(i => 
      i.RS_Libelle.toLowerCase().includes(search.toLowerCase()) || 
      (i.RS_Id && i.RS_Id.toLowerCase().includes(search.toLowerCase()))
    )
  , [items, search]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof RiskData, string>> = {};
    
    if (!formData.RS_Libelle.trim()) {
      errors.RS_Libelle = "Le libellé de la menace est requis";
    }
    if (!formData.RS_ProcessusId) {
      errors.RS_ProcessusId = "Le processus pilote est requis";
    }
    if (!formData.RS_TypeId) {
      errors.RS_TypeId = "La typologie de risque est requise";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }
    
    const toastId = toast.loading("SCELLAGE DE LA MENACE...");
    try {
      if (editingId) {
        await apiClient.patch(`/risks/${editingId}`, formData);
        toast.success("RISQUE RECTIFIÉ AVEC SUCCÈS", { id: toastId });
      } else {
        await apiClient.post("/risks", formData);
        toast.success("NOUVEAU RISQUE ENREGISTRÉ", { id: toastId });
      }
      setIsModalOpen(false);
      setFormErrors({});
      setFormData(DEFAULT_FORM);
      fetchData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ÉCHEC DE MUTATION", { id: toastId });
    }
  };

  const openModal = (risk?: RiskData) => {
    setEditingId(risk?.RS_Id || null);
    setFormData(risk || DEFAULT_FORM);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormErrors({});
    setFormData(DEFAULT_FORM);
  };

  const updateForm = useCallback((field: keyof RiskData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof RiskData]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  // Close modal on Escape
  useEffect(() => {
    if (!isModalOpen || typeof window === 'undefined') return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEscape as any);
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [isModalOpen]);

  if (loading && items.length === 0 && typeof window !== 'undefined') {
    return <LoadingScreen label="Scanning Infrastructure §6.1..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-red-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col xl:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <span className="bg-red-600/10 border border-red-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[9px] text-red-400 tracking-widest italic shadow-inner">
              ISO 9001 §6.1 Matrix
            </span>
            <span className="text-slate-500 text-[8px] md:text-[9px] tracking-widest uppercase">
              {items.length} RISQUES SCELLÉS
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic flex items-center gap-3 md:gap-4 lg:gap-5">
            Registre <span className="text-red-400">Risques</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <div className="relative flex-1 xl:flex-none group">
            <label htmlFor="risk-search" className="sr-only">Rechercher un risque</label>
            <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-red-400 transition-all pointer-events-none w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
            <input 
              id="risk-search"
              value={search} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)} 
              placeholder="SCANNER MENACE..." 
              className="w-full xl:w-64 lg:w-80 bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] py-2.5 md:py-3 lg:py-5 pl-10 md:pl-16 pr-4 md:pr-6 lg:pr-8 text-[9px] md:text-[10px] lg:text-[11px] font-black italic text-white outline-none focus:border-red-500 shadow-inner uppercase"
              aria-label="Filtrer les risques par libellé ou ID"
            />
          </div>
          <button 
            type="button"
            onClick={() => openModal()} 
            className="flex-1 xl:flex-none bg-red-600 hover:bg-white hover:text-red-700 px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] shadow-2xl border-none cursor-pointer text-white italic transition-all active:scale-95 flex items-center justify-center gap-2 md:gap-3 tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Créer un nouveau risque"
          >
            <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" strokeWidth={3} aria-hidden="true" /> 
            <span className="hidden sm:inline">Nouvelle Menace</span>
          </button>
        </div>
      </header>

      {/* 📊 KPI BAR */}
      <section className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 bg-[#0B1222]/50 border-b border-white/5" role="list" aria-label="Statistiques des risques">
        <KPIBox label="Indice de Maîtrise" value={`${stats.rate}%`} icon={<ShieldCheck size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />} color="emerald" />
        <KPIBox label="Menaces Critiques" value={stats.critical} icon={<AlertTriangle size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />} color="rose" />
        <KPIBox label="Risques Archivés" value={stats.total} icon={<Database size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />} color="amber" />
        <KPIBox label="Efficacité PAQ" value="94.2%" icon={<Activity size={16} className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />} color="blue" />
      </section>

      {/* 🧩 DATA MATRIX */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <article className="max-w-[100rem] mx-auto bg-[#0F172A] border-2 border-white/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 p-6 md:p-8 lg:p-10 opacity-[0.02] pointer-events-none" aria-hidden="true">
            <Zap size={200} className="w-40 h-40 md:w-50 md:h-50 lg:w-60 lg:h-60 xl:w-80 xl:h-80" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full md:min-w-[250px]" role="table" aria-label="Registre des risques">
              <thead className="sticky top-0 bg-[#0F172A] z-10 border-b-2 border-white/5">
                <tr className="text-[8px] md:text-[9px] lg:text-[10px] text-slate-500 uppercase font-black italic tracking-widest">
                  <th className="px-6 md:px-8 lg:px-10 py-4 md:py-6 lg:py-8" scope="col">Danger & Scénario</th>
                  <th className="px-4 md:px-6 py-4 md:py-6 lg:py-8 text-center" scope="col">Matrice P-G-M</th>
                  <th className="px-4 md:px-6 py-4 md:py-6 lg:py-8 text-center" scope="col">Criticité</th>
                  <th className="px-4 md:px-6 py-4 md:py-6 lg:py-8" scope="col">Processus Source</th>
                  <th className="px-6 md:px-8 lg:px-10 py-4 md:py-6 lg:py-8 text-right" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-white/5">
                {filteredItems.length > 0 ? filteredItems.map(risk => {
                  const rScore = risk.RS_Probabilite * risk.RS_Gravite * (risk.RS_Maitrise || 1);
                  const isCritical = rScore >= 16;
                  const isWarning = rScore >= 8 && rScore < 16;
                  
                  return (
                    <tr key={risk.RS_Id} className="group hover:bg-red-600/5 transition-all italic focus-within:bg-red-600/5 focus:outline-none" role="row">
                      <td className="px-6 md:px-8 lg:px-10 py-4 md:py-6 max-w-xl">
                        <div className="flex flex-col gap-1 md:gap-2">
                          <span className="text-[11px] md:text-sm font-black text-white uppercase tracking-tighter truncate group-hover:text-red-400 transition-colors">{risk.RS_Libelle}</span>
                          <span className="text-[9px] md:text-[10px] text-slate-500 font-bold normal-case leading-relaxed line-clamp-2">{risk.RS_Description || "Sans description d'impact."}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-6 text-center">
                        <div className="flex justify-center gap-2 md:gap-3">
                           <Cotation val={risk.RS_Probabilite} l="P" c="text-slate-400" />
                           <Cotation val={risk.RS_Gravite} l="G" c="text-red-400" />
                           <Cotation val={risk.RS_Maitrise} l="M" c="text-blue-400" />
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-6 text-center">
                        <span className={cn(
                          "text-2xl md:text-3xl font-black italic tracking-tighter leading-none",
                          isCritical ? "text-red-400" : isWarning ? "text-amber-400" : "text-emerald-400"
                        )}>
                          {rScore}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 md:py-6">
                        <span className="px-3 md:px-4 lg:px-5 py-1.5 md:py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-[9px] md:text-[10px] font-black uppercase text-blue-400 italic whitespace-nowrap tracking-widest">
                          {risk.Processus?.PR_Libelle || "QUALITÉ GLOBALE"}
                        </span>
                      </td>
                      <td className="px-6 md:px-8 lg:px-10 py-4 md:py-6 text-right">
                        <div className="flex justify-end gap-2 md:gap-3 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-all translate-x-2 md:translate-x-4 group-hover:translate-x-0">
                          <button 
                            type="button"
                            onClick={() => openModal(risk)} 
                            className="p-2 md:p-3 lg:p-4 bg-white/5 rounded-lg md:rounded-xl lg:rounded-2xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                            aria-label={`Modifier le risque: ${risk.RS_Libelle}`}
                          >
                            <Edit3 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
                          </button>
                          <button 
                            type="button"
                            className="p-2 md:p-3 lg:p-4 bg-white/5 rounded-lg md:rounded-xl lg:rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                            aria-label={`Supprimer le risque: ${risk.RS_Libelle}`}
                          >
                            <Trash2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="px-6 md:px-8 lg:px-10 py-12 md:py-16 lg:py-20 text-center text-slate-500" role="status">
                      <Scale size={48} className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 opacity-20" aria-hidden="true" />
                      <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">
                        {search ? 'Aucun risque ne correspond à la recherche' : 'Aucun risque enregistré'}
                      </p>
                      {!search && (
                        <button 
                          type="button"
                          onClick={() => openModal()}
                          className="mt-3 md:mt-4 text-[8px] md:text-[9px] text-red-400 hover:text-red-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded px-3 py-1"
                        >
                          Créer votre premier risque
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </main>

      {/* 📟 MODAL */}
      {isModalOpen && typeof window !== 'undefined' && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-6 lg:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <form onSubmit={handleSubmit} className="bg-[#0B0F1A] border-2 border-white/10 rounded-2xl md:rounded-3xl lg:rounded-[4rem] w-full max-w-4xl lg:max-w-6xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
            
            <header className="px-6 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10 border-b border-white/5 flex justify-between items-center bg-black/20">
              <div className="text-left space-y-1 md:space-y-2">
                <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic m-0 tracking-tighter">
                  Identification <span className="text-red-400">Risque Expert</span>
                </h2>
                <p className="text-[9px] md:text-[10px] text-slate-600 tracking-widest m-0 font-black">
                  PROTOCOLE DE SCELLAGE §6.1.2
                </p>
              </div>
              <button 
                type="button"
                onClick={closeModal} 
                className="p-2 md:p-3 lg:p-5 bg-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl text-slate-500 hover:text-white border-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Fermer"
              >
                <X size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 lg:px-12 py-6 md:py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12">
              
              {/* SECTION A : QUALIFICATION */}
              <div className="lg:col-span-8 space-y-6 md:space-y-8 lg:space-y-10">
                 <SDEInput 
                   label="Libellé de la Menace (§6.1)" 
                   value={formData.RS_Libelle} 
                   onChange={(v: string) => updateForm('RS_Libelle', v.toUpperCase())} 
                   required
                   error={formErrors.RS_Libelle}
                 />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <SDESelect 
                      label="Processus Pilote" 
                      value={formData.RS_ProcessusId} 
                      onChange={(v: string) => updateForm('RS_ProcessusId', v)}
                      required
                      error={formErrors.RS_ProcessusId}
                    >
                        <option value="" className="bg-[#0B0F1A] text-slate-500">-- SÉLECTIONNER SOURCE --</option>
                        {processusList.map(p => <option key={p.PR_Id} value={p.PR_Id} className="bg-[#0B0F1A] text-white">{p.PR_Code} - {p.PR_Libelle}</option>)}
                    </SDESelect>
                    <SDESelect 
                      label="Typologie de Risque" 
                      value={formData.RS_TypeId} 
                      onChange={(v: string) => updateForm('RS_TypeId', v)}
                      required
                      error={formErrors.RS_TypeId}
                    >
                        <option value="" className="bg-[#0B0F1A] text-slate-500">-- CHOISIR CATÉGORIE --</option>
                        {riskTypes.map(t => <option key={t.RT_Id} value={t.RT_Id} className="bg-[#0B0F1A] text-white">{t.RT_Label}</option>)}
                    </SDESelect>
                 </div>
                 <div className="space-y-4 md:space-y-5 lg:space-y-6">
                    <SDEInput 
                      label="Description de l'Impact Potentiel" 
                      value={formData.RS_Description} 
                      onChange={(v: string) => updateForm('RS_Description', v)} 
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                       <SDEInput label="Activités Liées" value={formData.RS_Activite} onChange={(v: string) => updateForm('RS_Activite', v)} />
                       <SDEInput label="Causes Racines (§10.2)" value={formData.RS_Causes} onChange={(v: string) => updateForm('RS_Causes', v)} />
                    </div>
                 </div>
              </div>

              {/* SECTION B : MATRICE PGM */}
              <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
                <div className="bg-red-600/5 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] border-2 border-red-600/20 p-6 md:p-8 lg:p-10 flex flex-col items-center justify-center space-y-6 md:space-y-8 shadow-inner relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 md:p-3 lg:p-4 bg-red-600 text-white text-[8px] md:text-[9px] font-black italic px-3 md:px-4 py-1 rounded-bl-2xl md:rounded-bl-3xl">
                     CRITICITÉ
                   </div>
                   <span className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white italic tracking-tighter leading-none drop-shadow-2xl" aria-label={`Score de criticité: ${score}`}>
                     {score}
                   </span>
                   <div className="space-y-4 md:space-y-5 lg:space-y-6 w-full">
                      <CotationBox label="Probabilité" val={formData.RS_Probabilite} set={(v: number) => updateForm('RS_Probabilite', v)} />
                      <CotationBox label="Gravité" val={formData.RS_Gravite} set={(v: number) => updateForm('RS_Gravite', v)} />
                      <CotationBox label="Maîtrise" val={formData.RS_Maitrise} set={(v: number) => updateForm('RS_Maitrise', v)} />
                   </div>
                   <div className="text-[8px] md:text-[9px] text-red-400 font-black italic tracking-widest mt-2 md:mt-4" role="img" aria-label="Formule de calcul du score">
                     {"$$S = P \\times G \\times M$$"}
                   </div>
                </div>

                <div className="bg-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-5 lg:p-6 border border-white/5 space-y-3 md:space-y-4 text-left">
                  <label htmlFor="next-review" className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 md:ml-2 italic block">
                    Revue de Conformité
                  </label>
                  <input 
                    id="next-review"
                    type="date" 
                    value={formData.RS_NextReview ? new Date(formData.RS_NextReview).toISOString().split('T')[0] : ""} 
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('RS_NextReview', e.target.value)} 
                    className="w-full bg-black/40 border-2 border-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 text-[10px] md:text-sm font-black text-white outline-none focus:border-red-500 italic uppercase"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

            </div>

            <footer className="px-6 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-4 md:gap-6 bg-black/40">
              <button 
                type="button"
                onClick={closeModal} 
                className="px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6 bg-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] text-slate-500 font-black uppercase text-[10px] md:text-[11px] lg:text-[12px] tracking-widest border-none cursor-pointer hover:bg-white hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Abandonner
              </button>
              <button 
                type="submit" 
                className="px-8 md:px-12 lg:px-16 py-4 md:py-5 lg:py-6 bg-red-600 text-white rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black uppercase text-[10px] md:text-[11px] lg:text-[12px] tracking-widest italic shadow-2xl border-none cursor-pointer hover:bg-white hover:text-red-700 transition-all flex items-center justify-center gap-3 md:gap-4 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <Save size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" strokeWidth={3} aria-hidden="true" /> 
                Sceller dans la Matrice
              </button>
            </footer>
          </form>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(220,38,38,0.3);border-radius:10px}:focus-visible{outline:2px solid #dc2626;outline-offset:2px}`}</style>
    </div>
  );
}