/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : ActionModal (ISO 9001 §10.2)
 * RÔLE : Formulaire d'injection d'actions correctives
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useCallback, useEffect, useState, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { Calendar, Loader2, Save, ShieldAlert, X, User as UserIcon, Layers, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Role?: string;
  U_Actif?: boolean;
}

export interface PAQ {
  PAQ_Id: string;
  PAQ_Title: string;
  PAQ_Description?: string;
  PAQ_Status?: string;
}

export type PriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type OriginType = 'AUDIT' | 'RECLAMATION' | 'RISQUE' | 'AUTRE';

export interface ActionFormData {
  ACT_Title: string;
  ACT_Description: string;
  ACT_Priority: PriorityType;
  ACT_Deadline: string;
  ACT_ResponsableId: string;
  ACT_PAQId: string;
  ACT_Origin: OriginType;
}

export interface ActionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export interface FormErrors {
  ACT_Title?: string;
  ACT_ResponsableId?: string;
  ACT_PAQId?: string;
  ACT_Deadline?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const PRIORITY_OPTIONS: Array<{ value: PriorityType; label: string }> = [
  { value: 'LOW', label: 'BASSE' },
  { value: 'MEDIUM', label: 'MOYENNE' },
  { value: 'HIGH', label: 'HAUTE' },
  { value: 'CRITICAL', label: '⚠️ CRITIQUE' }
];

const ORIGIN_OPTIONS: Array<{ value: OriginType; label: string }> = [
  { value: 'AUDIT', label: 'AUDIT' },
  { value: 'RECLAMATION', label: 'RÉCLAMATION' },
  { value: 'RISQUE', label: 'RISQUE' },
  { value: 'AUTRE', label: 'AUTRE' }
];

const DEFAULT_FORM: ActionFormData = {
  ACT_Title: "",
  ACT_Description: "",
  ACT_Priority: "MEDIUM",
  ACT_Deadline: "",
  ACT_ResponsableId: "",
  ACT_PAQId: "",
  ACT_Origin: "AUDIT",
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ActionModal({ onClose, onSuccess }: ActionModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [paqs, setPaqs] = useState<PAQ[]>([]);
  const [formData, setFormData] = useState<ActionFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const loadReferentials = useCallback(async () => {
    try {
      const [resUsers, resPaqs] = await Promise.all([
        apiClient.get<User[]>("/users"),
        apiClient.get<PAQ[]>("/paq"),
      ]);
      setUsers(Array.isArray(resUsers.data) ? resUsers.data.filter(u => u.U_Actif !== false) : []);
      setPaqs(Array.isArray(resPaqs.data) ? resPaqs.data : []);
    } catch (error) {
      console.error('❌ Erreur chargement référentiels:', error);
      toast.error("ERREUR SYNC : Impossible de charger les référentiels.");
    }
  }, []);

  useEffect(() => { 
    if (typeof window !== 'undefined') {
      loadReferentials(); 
    }
  }, [loadReferentials]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.ACT_Title.trim()) {
      errors.ACT_Title = "Le titre est obligatoire";
    }
    
    if (!formData.ACT_ResponsableId) {
      errors.ACT_ResponsableId = "Le pilote est obligatoire";
    }
    
    if (!formData.ACT_PAQId) {
      errors.ACT_PAQId = "La liaison PAQ est obligatoire";
    }
    
    if (!formData.ACT_Deadline) {
      errors.ACT_Deadline = "L'échéance est obligatoire";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.warning("CONFIGURATION REQUISE : Pilote & PAQ obligatoires.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Scellage de l'action corrective...");
    
    try {
      await apiClient.post("/actions", {
        ...formData,
        ACT_Title: formData.ACT_Title.toUpperCase(),
        ACT_Description: formData.ACT_Description.toUpperCase()
      });
      toast.success("ACTION SCELLÉE : Registre PAQ mis à jour.", { id: toastId });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ERREUR KERNEL : Enregistrement rejeté.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof ActionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0B0F1A]/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      <article className="bg-[#0F172A] w-full max-w-2xl rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden text-left italic font-sans max-h-[90vh] flex flex-col">
        
        {/* HEADER */}
        <div className="p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 border-b border-white/5 flex justify-between items-center bg-white/2 shrink-0">
          <div>
            <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic text-white tracking-tighter m-0">
              Nouvelle Action
            </h2>
            <p className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1 md:mt-2 m-0">
              Initialisation du flux d&apos;amélioration §10.2
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 md:p-3 lg:p-4 bg-white/5 rounded-lg md:rounded-xl lg:rounded-2xl text-slate-500 hover:text-red-400 hover:rotate-90 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Fermer"
          >
            <X size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
          </button>
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 space-y-4 md:space-y-5 lg:space-y-6 lg:space-y-8 overflow-y-auto custom-scrollbar flex-1" noValidate>
          <div className="space-y-2 md:space-y-3">
            <label htmlFor="act-title" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2 md:ml-4 lg:ml-6 tracking-widest italic block">
              Désignation de l&apos;Action <span className="text-red-400">*</span>
            </label>
            <input
              id="act-title"
              required
              placeholder="INTITULÉ DE L'ACTION CORRECTIVE..."
              className={cn(
                "w-full bg-black/40 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black italic uppercase outline-none focus:border-blue-500 transition-all shadow-inner text-white",
                formErrors.ACT_Title && "border-red-500/50"
              )}
              value={formData.ACT_Title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('ACT_Title', e.target.value.toUpperCase())}
              aria-required="true"
              aria-invalid={!!formErrors.ACT_Title}
            />
            {formErrors.ACT_Title && (
              <p className="text-red-400 text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.ACT_Title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <div className="space-y-2 md:space-y-3">
              <label htmlFor="act-responsable" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2 md:ml-4 lg:ml-6 tracking-widest italic flex items-center gap-1.5 md:gap-2">
                <UserIcon size={12} className="w-3 h-3" aria-hidden="true" /> 
                Pilote Responsable <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="act-responsable"
                  required
                  className={cn(
                    "w-full bg-black/40 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-[10px] md:text-[11px] font-black uppercase italic outline-none cursor-pointer text-white appearance-none pr-10 md:pr-12",
                    formErrors.ACT_ResponsableId && "border-red-500/50"
                  )}
                  value={formData.ACT_ResponsableId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => updateForm('ACT_ResponsableId', e.target.value)}
                  aria-required="true"
                  aria-invalid={!!formErrors.ACT_ResponsableId}
                >
                  <option value="" className="bg-[#0B0F1A] text-slate-500">-- CHOISIR PILOTE --</option>
                  {users.map((u) => (
                    <option key={u.U_Id} value={u.U_Id} className="bg-[#0B0F1A] text-white">
                      {u.U_FirstName} {u.U_LastName}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 md:right-6 bottom-4 md:bottom-5 pointer-events-none text-slate-600" aria-hidden="true">
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {formErrors.ACT_ResponsableId && (
                <p className="text-red-400 text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.ACT_ResponsableId}
                </p>
              )}
            </div>

            <div className="space-y-2 md:space-y-3">
              <label htmlFor="act-paq" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2 md:ml-4 lg:ml-6 tracking-widest italic flex items-center gap-1.5 md:gap-2">
                <Layers size={12} className="w-3 h-3" aria-hidden="true" /> 
                Liaison PAQ Master <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="act-paq"
                  required
                  className={cn(
                    "w-full bg-black/40 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-[10px] md:text-[11px] font-black uppercase italic outline-none cursor-pointer text-white appearance-none pr-10 md:pr-12",
                    formErrors.ACT_PAQId && "border-red-500/50"
                  )}
                  value={formData.ACT_PAQId}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => updateForm('ACT_PAQId', e.target.value)}
                  aria-required="true"
                  aria-invalid={!!formErrors.ACT_PAQId}
                >
                  <option value="" className="bg-[#0B0F1A] text-slate-500">-- LIER AU PLAN GLOBAL --</option>
                  {paqs.map((p) => (
                    <option key={p.PAQ_Id} value={p.PAQ_Id} className="bg-[#0B0F1A] text-white">
                      {p.PAQ_Title}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 md:right-6 bottom-4 md:bottom-5 pointer-events-none text-slate-600" aria-hidden="true">
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {formErrors.ACT_PAQId && (
                <p className="text-red-400 text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.ACT_PAQId}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <div className="space-y-2 md:space-y-3">
              <label htmlFor="act-deadline" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2 md:ml-4 lg:ml-6 tracking-widest italic flex items-center gap-1.5 md:gap-2">
                <Calendar size={12} className="w-3 h-3" aria-hidden="true" /> 
                Échéance Requise <span className="text-red-400">*</span>
              </label>
              <input
                id="act-deadline"
                type="date"
                required
                className={cn(
                  "w-full bg-black/40 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-[10px] md:text-[11px] font-black italic outline-none text-white focus:border-blue-500",
                  formErrors.ACT_Deadline && "border-red-500/50"
                )}
                value={formData.ACT_Deadline}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('ACT_Deadline', e.target.value)}
                aria-required="true"
                aria-invalid={!!formErrors.ACT_Deadline}
                style={{ colorScheme: 'dark' }}
              />
              {formErrors.ACT_Deadline && (
                <p className="text-red-400 text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.ACT_Deadline}
                </p>
              )}
            </div>

            <div className="space-y-2 md:space-y-3">
              <label htmlFor="act-priority" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2 md:ml-4 lg:ml-6 tracking-widest italic flex items-center gap-1.5 md:gap-2">
                <ShieldAlert size={12} className="w-3 h-3" aria-hidden="true" /> 
                Priorité Système
              </label>
              <div className="relative">
                <select
                  id="act-priority"
                  className="w-full bg-black/40 border border-white/5 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-[10px] md:text-[11px] font-black uppercase italic outline-none cursor-pointer text-white appearance-none pr-10 md:pr-12"
                  value={formData.ACT_Priority}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => updateForm('ACT_Priority', e.target.value as PriorityType)}
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-[#0B0F1A] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 md:right-6 bottom-4 md:bottom-5 pointer-events-none text-slate-600" aria-hidden="true">
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 md:space-y-3">
            <label htmlFor="act-description" className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-2 md:ml-4 lg:ml-6 tracking-widest italic block">
              Détails de mise en œuvre
            </label>
            <textarea
              id="act-description"
              placeholder="DESCRIPTION DES ÉTAPES DE RÉALISATION..."
              className="w-full bg-black/40 border border-white/5 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-5 lg:p-6 text-[10px] md:text-xs font-bold min-h-[120px] md:min-h-[140px] italic outline-none focus:border-blue-500 transition-all text-white resize-none"
              value={formData.ACT_Description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateForm('ACT_Description', e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full bg-blue-600 hover:bg-white hover:text-blue-700 py-4 md:py-5 lg:py-6 lg:py-7 rounded-xl md:rounded-2xl lg:rounded-3xl font-black uppercase italic text-white flex items-center justify-center gap-2 md:gap-3 lg:gap-4 shadow-xl transition-all active:scale-95 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
              loading && "opacity-50 cursor-not-allowed active:scale-100"
            )}
            aria-busy={loading}
            aria-label="Enregistrer et sceller l'action"
          >
            {loading ? (
              <><Loader2 size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">SCELLAGE EN COURS...</span><span className="sm:hidden">En cours...</span></>
            ) : (
              <><Save size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" /> <span className="hidden sm:inline">ENREGISTRER & SCELLER</span><span className="sm:hidden">Enregistrer</span></>
            )}
          </button>
        </form>
      </article>
    </div>
  );
}