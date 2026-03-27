/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🚨 MODULE : SSE SIGNALEMENT FORM (ISO 45001 / ISO 14001)
 * RÔLE : Déclaration des événements et non-conformités
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, ChangeEvent, FormEvent, KeyboardEvent, useCallback } from "react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { AlertCircle, Loader2, MapPin, Save, X, Calendar, Activity, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type SSEType = 'ACCIDENT_TRAVAIL' | 'ACCIDENT_TRAJET' | 'PRESQU_ACCIDENT' | 'SITUATION_DANGEREUSE' | 'INCIDENT_ENV';

export interface SSEFormData {
  SSE_Description: string;
  SSE_Lieu: string;
  SSE_Type: SSEType;
  SSE_DateEvent: string;
  SSE_AvecArret: boolean;
  SSE_NbJoursArret: number;
  SSE_Lesions?: string;
}

export interface SSEFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export interface FormErrors {
  SSE_Description?: string;
  SSE_Lieu?: string;
  SSE_DateEvent?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const SSE_TYPES: Array<{ value: SSEType; label: string }> = [
  { value: 'ACCIDENT_TRAVAIL', label: 'Accident du Travail' },
  { value: 'ACCIDENT_TRAJET', label: 'Accident de Trajet' },
  { value: 'PRESQU_ACCIDENT', label: 'Presqu\'accident' },
  { value: 'SITUATION_DANGEREUSE', label: 'Situation Dangereuse' },
  { value: 'INCIDENT_ENV', label: 'Incident Environnemental' },
];

const DEFAULT_FORM: SSEFormData = {
  SSE_Description: "", 
  SSE_Lieu: "", 
  SSE_Type: "ACCIDENT_TRAVAIL",
  SSE_DateEvent: new Date().toISOString().slice(0, 16),
  SSE_AvecArret: false, 
  SSE_NbJoursArret: 0,
  SSE_Lesions: "",
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SSEForm({ onClose, onSuccess }: SSEFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SSEFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.SSE_Description.trim()) {
      errors.SSE_Description = "La description est obligatoire";
    }
    if (!formData.SSE_Lieu.trim()) {
      errors.SSE_Lieu = "La localisation est obligatoire";
    }
    if (!formData.SSE_DateEvent) {
      errors.SSE_DateEvent = "La date est obligatoire";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning("Veuillez compléter tous les champs requis");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading("Indexation de l'incident...");
    try {
      const payload = {
        SSE_Type: formData.SSE_Type,
        SSE_DateEvent: new Date(formData.SSE_DateEvent).toISOString(),
        SSE_Lieu: formData.SSE_Lieu.toUpperCase(),
        SSE_Description: formData.SSE_Description.toUpperCase(),
        SSE_AvecArret: formData.SSE_AvecArret,
        SSE_NbJoursArret: formData.SSE_AvecArret ? formData.SSE_NbJoursArret : 0,
        SSE_Lesions: formData.SSE_Lesions?.toUpperCase(),
      };
      await apiClient.post("/sse", payload);
      toast.success("INCIDENT SCELLÉ AU REGISTRE", { id: toastId });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ÉCHEC D'INDEXATION KERNEL", { id: toastId });
    } finally { 
      setLoading(false); 
    }
  };

  const updateForm = useCallback((field: keyof SSEFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Close on Escape
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape as any);
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-[#0B0F1A]/95 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 lg:p-8 overflow-hidden italic font-black uppercase"
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
      
      <article className="relative bg-[#0F172A] w-full max-w-3xl rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl border border-white/10 flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95">
        
        <header className="p-4 md:p-6 lg:p-8 lg:p-12 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
          <div className="flex items-center gap-4 md:gap-6 text-left">
            <div className="p-3 md:p-4 bg-orange-600 rounded-xl md:rounded-2xl text-white shadow-xl animate-pulse">
              <AlertCircle size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black italic tracking-tighter text-white m-0">
                Signalement <span className="text-orange-400">SSE</span>
              </h2>
              <p className="text-[9px] md:text-[10px] text-slate-500 tracking-widest mt-1 md:mt-2 m-0">
                Déclaration Scellée ISO 45001 / 14001
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <div className="space-y-2 md:space-y-3">
              <label htmlFor="sse-type" className="text-[10px] md:text-[11px] text-slate-500 ml-2 md:ml-4 flex items-center gap-1.5 md:gap-2">
                <Activity size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-orange-400" aria-hidden="true" /> 
                Nature de l&apos;Événement *
              </label>
              <div className="relative">
                <select 
                  id="sse-type"
                  className="w-full bg-black/40 border-2 border-white/10 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-3 md:p-4 lg:p-5 text-[10px] md:text-xs text-orange-400 font-black outline-none focus:border-orange-500 transition-all uppercase italic cursor-pointer appearance-none shadow-inner pr-10 md:pr-12" 
                  value={formData.SSE_Type} 
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => updateForm('SSE_Type', e.target.value as SSEType)}
                >
                  {SSE_TYPES.map(t => (
                    <option key={t.value} value={t.value} className="bg-[#0B0F1A] text-white">{t.label}</option>
                  ))}
                </select>
                <div className="absolute right-4 md:right-6 bottom-3 md:bottom-4 lg:bottom-5 pointer-events-none text-slate-600" aria-hidden="true">
                  <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <label htmlFor="sse-date" className="text-[10px] md:text-[11px] text-slate-500 ml-2 md:ml-4 flex items-center gap-1.5 md:gap-2">
                <Calendar size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-blue-400" aria-hidden="true" /> 
                Horodatage *
              </label>
              <input 
                id="sse-date"
                type="datetime-local" 
                className={cn(
                  "w-full bg-black/40 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-3 md:p-4 lg:p-5 text-[10px] md:text-xs text-white font-black outline-none focus:border-blue-500 shadow-inner",
                  formErrors.SSE_DateEvent ? "border-red-500/50" : "border-white/10"
                )} 
                value={formData.SSE_DateEvent} 
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('SSE_DateEvent', e.target.value)} 
                required
                aria-required="true"
                aria-invalid={!!formErrors.SSE_DateEvent}
                style={{ colorScheme: 'dark' }}
              />
              {formErrors.SSE_DateEvent && (
                <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.SSE_DateEvent}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 md:space-y-3">
            <label htmlFor="sse-description" className="text-[10px] md:text-[11px] text-slate-500 ml-2 md:ml-4">
              Description Factuelle (§10.2)
            </label>
            <textarea 
              id="sse-description"
              className={cn(
                "w-full bg-black/40 border-2 rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] p-4 md:p-6 lg:p-8 text-[10px] md:text-xs text-slate-300 h-32 md:h-40 outline-none focus:border-orange-500/50 shadow-inner resize-none font-bold leading-relaxed uppercase",
                formErrors.SSE_Description ? "border-red-500/50" : "border-white/10"
              )} 
              placeholder="DÉTAILS DES FAITS ET CAUSES IMMÉDIATES..." 
              value={formData.SSE_Description} 
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateForm('SSE_Description', e.target.value.toUpperCase())} 
              required
              aria-required="true"
              aria-invalid={!!formErrors.SSE_Description}
            />
            {formErrors.SSE_Description && (
              <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.SSE_Description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-end">
            <div className="space-y-2 md:space-y-3">
              <label htmlFor="sse-lieu" className="text-[10px] md:text-[11px] text-slate-500 ml-2 md:ml-4">
                Localisation Précise *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-orange-400 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
                <input 
                  id="sse-lieu"
                  type="text" 
                  className={cn(
                    "w-full bg-black/40 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] pl-10 md:pl-14 pr-4 md:pr-6 py-3 md:p-4 lg:p-5 text-[10px] md:text-xs text-white outline-none focus:border-orange-500 shadow-inner uppercase",
                    formErrors.SSE_Lieu ? "border-red-500/50" : "border-white/10"
                  )} 
                  placeholder="ZONE / ATELIER..." 
                  value={formData.SSE_Lieu} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('SSE_Lieu', e.target.value.toUpperCase())} 
                  required
                  aria-required="true"
                  aria-invalid={!!formErrors.SSE_Lieu}
                />
              </div>
              {formErrors.SSE_Lieu && (
                <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.SSE_Lieu}
                </p>
              )}
            </div>

            <div className={cn(
              "flex items-center justify-between p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl lg:rounded-3xl border-2 transition-all",
              formData.SSE_AvecArret ? "bg-orange-600/10 border-orange-500/30" : "bg-white/5 border-white/10"
            )}>
              <div className="flex items-center gap-3 md:gap-4">
                <input 
                  type="checkbox" 
                  id="avecArret" 
                  className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-lg accent-orange-500 focus:ring-2 focus:ring-orange-400" 
                  checked={formData.SSE_AvecArret} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('SSE_AvecArret', e.target.checked)} 
                />
                <label htmlFor="avecArret" className="text-[9px] md:text-[10px] text-white tracking-widest cursor-pointer">
                  Avec arrêt
                </label>
              </div>
              {formData.SSE_AvecArret && (
                <input 
                  type="number" 
                  className="w-16 md:w-20 bg-black/40 border-2 border-orange-500/30 rounded-lg md:rounded-xl p-1.5 md:p-2 text-orange-400 text-center font-black outline-none focus:ring-2 focus:ring-orange-400" 
                  value={formData.SSE_NbJoursArret} 
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('SSE_NbJoursArret', parseInt(e.target.value) || 0)} 
                  min="0"
                  aria-label="Nombre de jours d'arrêt"
                />
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={cn(
              "w-full bg-white text-slate-900 py-4 md:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black text-[10px] md:text-xs tracking-widest flex items-center justify-center gap-3 md:gap-4 hover:bg-orange-600 hover:text-white transition-all shadow-xl cursor-pointer active:scale-95 border-none focus:outline-none focus:ring-2 focus:ring-orange-400",
              loading && "opacity-50 cursor-not-allowed active:scale-100"
            )}
            aria-busy={loading}
            aria-label="Valider l'incident SSE"
          >
            {loading ? (
              <><Loader2 size={20} className="w-5 h-5 md:w-6 md:h-6 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">INDEXATION EN COURS...</span></>
            ) : (
              <><Save size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" /> <span className="hidden sm:inline">Valider au Registre SSE</span></>
            )}
          </button>
        </form>
      </article>
    </div>
  );
}