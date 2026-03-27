/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📝 MODULE : CAUSERIE PROGRAMMATION FORM (ISO 45001 §7.3)
 * RÔLE : Programmation des sensibilisations
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { Calendar, Loader2, Save, ShieldAlert, Target, Users, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Role: string;
  U_Email?: string;
  U_Actif?: boolean;
}

export type CauserieType = 'SÉCURITÉ' | 'ENVIRONNEMENT' | 'QUALITÉ';

export interface CauserieFormData {
  CS_Theme: string;
  CS_Date: string;
  CS_AnimateurId: string;
  CS_Description: string;
  CS_Type: CauserieType;
}

export interface CauserieFormProps {
  onClose: () => void;
  onRefresh: () => void;
}

export interface FormErrors {
  CS_Theme?: string;
  CS_Date?: string;
  CS_AnimateurId?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const CAUSERIE_TYPES: Array<{ value: CauserieType; label: string }> = [
  { value: 'SÉCURITÉ', label: 'SANTÉ & SÉCURITÉ (45001)' },
  { value: 'ENVIRONNEMENT', label: 'ENVIRONNEMENT (14001)' },
  { value: 'QUALITÉ', label: 'QUALITÉ (9001)' },
];

const DEFAULT_FORM: CauserieFormData = {
  CS_Theme: "", 
  CS_Date: new Date().toISOString().split("T")[0],
  CS_AnimateurId: "", 
  CS_Description: "", 
  CS_Type: "SÉCURITÉ",
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function CauserieForm({ onClose, onRefresh }: CauserieFormProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<CauserieFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient.get<User[]>("/users");
        setUsers(Array.isArray(res.data) ? res.data.filter(u => u.U_Actif !== false) : []);
      } catch (error) {
        console.error('❌ Erreur chargement utilisateurs:', error);
        toast.error("ERREUR KERNEL : Annuaire inaccessible.");
      }
    };
    fetchUsers();
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.CS_Theme.trim()) {
      errors.CS_Theme = "Le thème est obligatoire";
    }
    if (!formData.CS_Date) {
      errors.CS_Date = "La date est obligatoire";
    }
    if (!formData.CS_AnimateurId) {
      errors.CS_AnimateurId = "L'animateur est obligatoire";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning("Veuillez compléter tous les champs requis");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading("Scellage de la session...");
    try {
      await apiClient.post("/causeries", formData);
      toast.success("SESSION SCELLÉE AU REGISTRE", { id: toastId });
      onRefresh();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "REJET KERNEL : Transaction refusée.", { id: toastId });
    } finally { 
      setLoading(false); 
    }
  };

  const updateForm = useCallback((field: keyof CauserieFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Close on Escape
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape as any);
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 md:p-6 lg:p-8 overflow-hidden italic font-black uppercase"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      <div 
        className="absolute inset-0" 
        onClick={onClose} 
        aria-hidden="true"
      />
      
      <article className="relative bg-[#0F172A] border border-blue-500/20 w-full max-w-2xl rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95">
        
        <header className="p-4 md:p-6 lg:p-8 lg:p-10 border-b border-white/5 bg-black/40 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4 md:gap-6 text-left">
            <div className="p-3 md:p-4 bg-blue-600 rounded-xl md:rounded-2xl lg:rounded-3xl text-white shadow-xl shadow-blue-600/20">
              <ShieldAlert size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl font-black italic tracking-tighter text-white m-0">
                Programmer <span className="text-blue-400">Sensibilisation</span>
              </h2>
              <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mt-1 md:mt-2 m-0">
                ISO 45001 • Prévention Participative
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 md:p-3 lg:p-4 bg-white/5 hover:bg-rose-600 rounded-lg md:rounded-xl lg:rounded-2xl transition-all border-none cursor-pointer text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Fermer"
          >
            <X size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 lg:p-10 xl:p-14 space-y-6 md:space-y-8 lg:space-y-10 overflow-y-auto custom-scrollbar flex-1 text-left">
          <div className="space-y-2 md:space-y-3">
            <label htmlFor="cs-theme" className="text-[9px] md:text-[10px] lg:text-[11px] text-blue-400 tracking-widest ml-2 md:ml-4 flex items-center gap-1.5 md:gap-2">
              <Target size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
              Thème de la causerie *
            </label>
            <input 
              id="cs-theme"
              required 
              autoFocus 
              placeholder="EX: PORT DES EPI, RISQUES CHIMIQUES..." 
              className={cn(
                "w-full bg-black/40 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-5 lg:p-6 text-[10px] md:text-xs font-black text-white outline-none focus:border-blue-500 shadow-inner uppercase",
                formErrors.CS_Theme ? "border-red-500/50" : "border-white/10"
              )}
              value={formData.CS_Theme} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('CS_Theme', e.target.value.toUpperCase())}
              aria-required="true"
              aria-invalid={!!formErrors.CS_Theme}
            />
            {formErrors.CS_Theme && (
              <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.CS_Theme}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <div className="space-y-2 md:space-y-3">
              <label htmlFor="cs-date" className="text-[9px] md:text-[10px] lg:text-[11px] text-slate-500 tracking-widest ml-2 md:ml-4 flex items-center gap-1.5 md:gap-2">
                <Calendar size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
                Date d&apos;exécution
              </label>
              <input 
                id="cs-date"
                type="date" 
                required 
                className={cn(
                  "w-full bg-black/40 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-5 lg:p-6 text-[10px] md:text-xs font-black text-white outline-none focus:border-blue-500 shadow-inner",
                  formErrors.CS_Date ? "border-red-500/50" : "border-white/10"
                )}
                value={formData.CS_Date} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('CS_Date', e.target.value)}
                aria-required="true"
                aria-invalid={!!formErrors.CS_Date}
                style={{ colorScheme: 'dark' }}
              />
              {formErrors.CS_Date && (
                <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.CS_Date}
                </p>
              )}
            </div>

            <div className="space-y-2 md:space-y-3">
              <label htmlFor="cs-type" className="text-[9px] md:text-[10px] lg:text-[11px] text-slate-500 tracking-widest ml-2 md:ml-4">
                Périmètre ISO
              </label>
              <div className="relative">
                <select 
                  id="cs-type"
                  className="w-full bg-black/40 border-2 border-white/10 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-5 lg:p-6 text-[10px] md:text-xs font-black text-white outline-none focus:border-blue-500 cursor-pointer appearance-none shadow-inner pr-10 md:pr-12"
                  value={formData.CS_Type} 
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => updateForm('CS_Type', e.target.value as CauserieType)}
                >
                  {CAUSERIE_TYPES.map(t => (
                    <option key={t.value} value={t.value} className="bg-[#0B0F1A] text-white">{t.label}</option>
                  ))}
                </select>
                <div className="absolute right-4 md:right-6 bottom-4 md:bottom-5 lg:bottom-6 pointer-events-none text-slate-600" aria-hidden="true">
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 md:space-y-3">
            <label htmlFor="cs-animateur" className="text-[9px] md:text-[10px] lg:text-[11px] text-slate-500 tracking-widest ml-2 md:ml-4 flex items-center gap-1.5 md:gap-2">
              <Users size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
              Animateur Référent
            </label>
            <div className="relative">
              <select 
                id="cs-animateur"
                required 
                className={cn(
                  "w-full bg-black/40 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-5 lg:p-6 text-[10px] md:text-xs font-black text-white outline-none focus:border-blue-500 cursor-pointer appearance-none shadow-inner pr-10 md:pr-12",
                  formErrors.CS_AnimateurId ? "border-red-500/50" : "border-white/10"
                )}
                value={formData.CS_AnimateurId} 
                onChange={(e: ChangeEvent<HTMLSelectElement>) => updateForm('CS_AnimateurId', e.target.value)}
                aria-required="true"
                aria-invalid={!!formErrors.CS_AnimateurId}
              >
                <option value="" className="bg-[#0B0F1A] text-slate-500">-- CHOISIR UN ANIMATEUR --</option>
                {users.map((u) => (
                  <option key={u.U_Id} value={u.U_Id} className="bg-[#0B0F1A] text-white">
                    {u.U_FirstName} {u.U_LastName} — [{u.U_Role}]
                  </option>
                ))}
              </select>
              <div className="absolute right-4 md:right-6 bottom-4 md:bottom-5 lg:bottom-6 pointer-events-none text-slate-600" aria-hidden="true">
                <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {formErrors.CS_AnimateurId && (
              <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.CS_AnimateurId}
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={cn(
              "w-full bg-blue-600 text-white py-4 md:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black text-[10px] md:text-xs tracking-widest flex items-center justify-center gap-3 md:gap-4 hover:bg-white hover:text-blue-700 transition-all shadow-xl cursor-pointer active:scale-95 border-none focus:outline-none focus:ring-2 focus:ring-blue-400",
              loading && "opacity-50 cursor-not-allowed active:scale-100"
            )}
            aria-busy={loading}
            aria-label="Programmer la causerie"
          >
            {loading ? (
              <><Loader2 size={20} className="w-5 h-5 md:w-6 md:h-6 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">SCELLAGE EN COURS...</span></>
            ) : (
              <><Save size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" /> <span className="hidden sm:inline">Programmer dans le Registre</span></>
            )}
          </button>
        </form>
      </article>
    </div>
  );
}