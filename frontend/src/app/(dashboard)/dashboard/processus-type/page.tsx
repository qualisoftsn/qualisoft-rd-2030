/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛠️ MODULE : GESTION DES TYPOLOGIES (ISO 9001 §4.4)
 * RÔLE : Définition des familles de processus
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useCallback, useEffect, useState, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { 
  Edit, Layers, Plus, RefreshCw, 
  ShieldCheck, Trash2, XCircle, AlertCircle
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from "@/core/utils/cn";

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type ProcessFamily = 'MANAGEMENT' | 'REALISATION' | 'SUPPORT';

export interface ProcessusType {
  PT_Id: string;
  PT_Label: string;
  PT_Description?: string;
  PT_Color: string;
  PT_Family: ProcessFamily;
  PT_IsActive: boolean;
  PT_CreatedAt: string;
  PT_UpdatedAt: string;
}

export interface ProcessTypeFormData {
  PT_Label: string;
  PT_Description: string;
  PT_Color: string;
  PT_Family: ProcessFamily;
  PT_IsActive: boolean;
}

export interface ProcessTypeModalProps {
  type: ProcessusType | null;
  onClose: () => void;
  onSuccess: () => void;
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
// SOUS-COMPOSANT : PROCESS TYPE MODAL
// ============================================================================

function ProcessTypeModal({ type, onClose, onSuccess }: ProcessTypeModalProps) {
  const [formData, setFormData] = useState<ProcessTypeFormData>({
    PT_Label: type?.PT_Label || "", 
    PT_Description: type?.PT_Description || "",
    PT_Color: type?.PT_Color || "#3b82f6", 
    PT_Family: type?.PT_Family || "REALISATION",
    PT_IsActive: type?.PT_IsActive ?? true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProcessTypeFormData, string>>>({});

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ProcessTypeFormData, string>> = {};
    if (!formData.PT_Label.trim()) errors.PT_Label = 'La désignation est requise';
    if (!formData.PT_Family) errors.PT_Family = 'La famille est requise';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading(type ? "Rectification en cours..." : "Initialisation en cours...");
    try {
      if (type) {
        await apiClient.patch(`/processus-types/${type.PT_Id}`, formData);
        toast.success("SEGMENT RECTIFIÉ AVEC SUCCÈS", { id: toastId });
      } else {
        await apiClient.post("/processus-types", formData);
        toast.success("NOUVEAU SEGMENT CRÉÉ", { id: toastId });
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ÉCHEC DE MUTATION", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal on Escape
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape as any);
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [onClose]);

  if (typeof window === 'undefined') return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-center items-center p-4 md:p-6 lg:p-8" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" aria-hidden="true" />
      <div className="relative w-full max-w-2xl bg-[#0F172A] p-6 md:p-8 lg:p-12 xl:p-16 rounded-2xl md:rounded-3xl lg:rounded-[4rem] border border-white/5 animate-in zoom-in-95 duration-300 shadow-2xl text-left overflow-y-auto max-h-[90vh] custom-scrollbar">
        <header className="flex justify-between items-center mb-8 md:mb-10 lg:mb-12">
          <h2 id="modal-title" className="text-2xl md:text-3xl font-black italic m-0 uppercase">
            {type ? "Rectifier" : "Initialiser"} <span className="text-blue-400">Segment</span>
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 md:p-3 bg-white/5 rounded-lg md:rounded-xl text-slate-500 hover:text-white border-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Fermer"
          >
            <XCircle size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 lg:space-y-10">
          <InputSDE 
            label="Désignation" 
            value={formData.PT_Label} 
            onChange={(v: string) => setFormData({...formData, PT_Label: v.toUpperCase()})} 
            placeholder="EX: MANAGEMENT"
            error={formErrors.PT_Label}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-10">
            <SelectSDE 
              label="Famille ISO" 
              value={formData.PT_Family} 
              onChange={(v: string) => setFormData({...formData, PT_Family: v as ProcessFamily})} 
              options={[
                { id: 'MANAGEMENT', label: 'MANAGEMENT' }, 
                { id: 'REALISATION', label: 'RÉALISATION' }, 
                { id: 'SUPPORT', label: 'SUPPORT' }
              ]}
              error={formErrors.PT_Family}
            />
            <div className="space-y-2 md:space-y-3 lg:space-y-4">
              <label className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-4 md:ml-6 block">Identité Couleur</label>
              <div className="flex gap-3 md:gap-4">
                <input 
                  type="color" 
                  value={formData.PT_Color} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, PT_Color: e.target.value})} 
                  className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl cursor-pointer bg-transparent border-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Sélecteur de couleur"
                />
                <input 
                  value={formData.PT_Color} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({...formData, PT_Color: e.target.value})} 
                  className="flex-1 bg-slate-950 border-2 border-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 text-[9px] md:text-[10px] font-black italic uppercase text-white outline-none focus:border-blue-500"
                  aria-label="Code couleur hexadécimal"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 md:space-y-3 lg:space-y-4">
            <label htmlFor="pt-description" className="text-[9px] md:text-[10px] text-slate-500 tracking-widest ml-4 md:ml-6 block">Description Scope</label>
            <textarea 
              id="pt-description"
              rows={4} 
              value={formData.PT_Description} 
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, PT_Description: e.target.value})} 
              className="w-full bg-slate-950 border-2 border-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-5 lg:p-8 text-[10px] md:text-sm font-bold italic text-white outline-none focus:border-blue-500 resize-none shadow-inner" 
              placeholder="Finalités de ce segment..."
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={cn(
              "w-full py-4 md:py-6 lg:py-8 bg-blue-600 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black uppercase text-[10px] md:text-[11px] lg:text-[12px] tracking-widest italic border-none cursor-pointer mt-6 md:mt-8 hover:bg-white hover:text-blue-700 transition-all shadow-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400",
              isSubmitting && "opacity-70 cursor-wait"
            )}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'VALIDATION EN COURS...' : 'Valider la Structure'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ProcessTypePage() {
  const [types, setTypes] = useState<ProcessusType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<ProcessusType | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<ProcessusType[]>("/processus-types");
      setTypes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement typologies:', error);
      toast.error("SYNCHRO TYPOLOGIE ÉCHOUÉE");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') loadData(); }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm("ACTION CRITIQUE : SUPPRIMER CE SEGMENT ?")) return;
    const toastId = toast.loading("Suppression en cours...");
    try {
      await apiClient.delete(`/processus-types/${id}`);
      toast.success("SEGMENT RETIRÉ DU REGISTRE", { id: toastId });
      loadData();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ÉCHEC : SEGMENT LIÉ À DES PROCESSUS ACTIFS", { id: toastId });
    }
  };

  const openModal = (type?: ProcessusType) => {
    setEditingType(type || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingType(null);
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Scanning SDE Architecture..." />;
  }

  return (
    <div className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-blue-600/30">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      {/* 🔝 HEADER */}
      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center bg-[#0B0F1A]/95 backdrop-blur-3xl z-40 gap-4 md:gap-6 lg:gap-8 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full lg:w-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic flex items-center gap-3 md:gap-4 lg:gap-5">
            <Layers className="text-blue-400 w-8 h-8 md:w-10 md:h-10" aria-hidden="true" /> 
            Référentiel <span className="text-blue-400">Structurel</span>
          </h1>
          <p className="text-slate-500 text-[8px] md:text-[9px] tracking-widest m-0 flex items-center gap-2 md:gap-3 italic">
            <ShieldCheck size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-400" aria-hidden="true" /> 
            ISO 9001 §4.4 : Classification des Flux
          </p>
        </div>
        <button 
          type="button"
          onClick={() => openModal()} 
          className="bg-blue-600 hover:bg-white hover:text-blue-700 px-4 md:px-6 lg:px-8 lg:px-10 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl lg:rounded-3xl text-[9px] md:text-[10px] shadow-2xl border-none cursor-pointer text-white italic transition-all flex items-center gap-2 md:gap-3 tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400 w-full lg:w-auto justify-center"
          aria-label="Créer un nouveau segment de typologie"
        >
          <Plus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
          <span className="hidden sm:inline">Initialiser Segment</span>
        </button>
      </header>

      {/* 📋 REGISTRY GRID */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pt-6 md:pt-8 lg:pt-10">
        <div className="max-w-[100rem] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8 xl:gap-10 pb-10 md:pb-16 lg:pb-20" role="list" aria-label="Liste des typologies de processus">
          {types.length > 0 ? types.map((type) => (
            <article 
              key={type.PT_Id} 
              className="bg-[#0F172A] border-2 border-white/5 p-6 md:p-8 lg:p-10 xl:p-12 rounded-2xl md:rounded-3xl lg:rounded-[4rem] group hover:border-blue-600/40 transition-all shadow-2xl relative overflow-hidden flex flex-col justify-between h-[360px] md:h-[380px] text-left focus-within:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              role="listitem"
            >
              <div className="absolute -right-6 md:-right-8 lg:-right-12 -top-6 md:-top-8 lg:-top-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all rotate-12 pointer-events-none text-white" aria-hidden="true">
                <Layers size={150} className="w-40 h-40 md:w-50 md:h-50 lg:w-56 lg:h-56" />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6 md:mb-8 lg:mb-10">
                  <div 
                    className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 shrink-0" 
                    style={{ backgroundColor: `${type.PT_Color || '#3b82f6'}15`, color: type.PT_Color || '#3b82f6' }}
                  >
                    <Layers size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
                  </div>
                  <div className="flex gap-2 md:gap-3 lg:gap-4">
                    <button 
                      type="button"
                      onClick={() => openModal(type)} 
                      className="p-2 md:p-3 bg-black/40 rounded-lg md:rounded-xl text-slate-500 hover:text-blue-400 transition-all cursor-pointer border border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      aria-label={`Modifier ${type.PT_Label}`}
                    >
                      <Edit size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5" aria-hidden="true" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDelete(type.PT_Id)} 
                      className="p-2 md:p-3 bg-black/40 rounded-lg md:rounded-xl text-slate-500 hover:text-red-400 transition-all cursor-pointer border border-white/5 focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label={`Supprimer ${type.PT_Label}`}
                    >
                      <Trash2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-4.5 lg:h-4.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl md:text-2xl lg:text-3xl font-black italic tracking-tighter m-0 group-hover:text-blue-400 transition-colors uppercase leading-none mb-4 md:mb-6 truncate">{type.PT_Label}</h3>
                <div className="bg-blue-600/10 border border-blue-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded-full w-fit mb-4 md:mb-6 lg:mb-8">
                  <span className="text-[8px] md:text-[9px] lg:text-[10px] text-blue-400 tracking-widest">{type.PT_Family}</span>
                </div>
                
                <p className="text-[10px] md:text-sm font-bold text-slate-400 italic line-clamp-3 leading-relaxed m-0 flex-1">
                  {type.PT_Description || "Aucune analyse descriptive scellée."}
                </p>

                <div className="flex justify-between items-center border-t border-white/5 pt-4 md:pt-6 lg:pt-8 mt-4 md:mt-6 lg:mt-8">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div 
                      className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 rounded-md border border-white/10" 
                      style={{ backgroundColor: type.PT_Color || '#3b82f6' }}
                      aria-hidden="true"
                    />
                    <span className="text-[8px] md:text-[9px] text-slate-600 tracking-widest">{type.PT_Color || '#3B82F6'}</span>
                  </div>
                  <div className={cn(
                    "px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[9px] tracking-widest border",
                    type.PT_IsActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                  )}>
                    {type.PT_IsActive ? "ACTIF" : "ARCHIVÉ"}
                  </div>
                </div>
              </div>
            </article>
          )) : (
            <div className="col-span-full h-64 md:h-80 border-2 border-dashed border-white/10 rounded-2xl md:rounded-3xl lg:rounded-[4rem] flex flex-col items-center justify-center text-slate-500" role="status">
              <Layers size={48} className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 opacity-20" aria-hidden="true" />
              <p className="font-black uppercase italic text-[9px] md:text-[10px] tracking-widest text-center px-4">Aucune typologie enregistrée</p>
              <button 
                type="button"
                onClick={() => openModal()}
                className="mt-3 md:mt-4 text-[8px] md:text-[9px] text-blue-400 hover:text-blue-300 uppercase tracking-widest italic underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-3 py-1"
              >
                Créer votre première typologie
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 📟 MODAL */}
      {showModal && (
        <ProcessTypeModal 
          type={editingType} 
          onClose={closeModal} 
          onSuccess={loadData} 
        />
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}