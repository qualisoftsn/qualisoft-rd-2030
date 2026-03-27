/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🚨 MODULE : NEW SSE INCIDENT PAGE (ISO 45001 §10.2)
 * RÔLE : Initialisation de l'investigation
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import apiClient, { type ApiError } from "@/core/api/api-client";
import {
  GitCommit,
  Info,
  MapPin,
  RefreshCw,
  Save,
  ShieldAlert,
  X,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { toast, Toaster } from "sonner";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type SSEType = 'ACCIDENT_TRAVAIL' | 'ACCIDENT_TRAJET' | 'PRESQU_ACCIDENT' | 'INCIDENT_ENV';

export interface SSEFormData {
  type: SSEType;
  dateHeure: string;
  lieu: string;
  description: string;
  avecArret: boolean;
  nbJoursArret: number;
}

export interface LoadingScreenProps {
  label: string;
}

export interface FormErrors {
  lieu?: string;
  description?: string;
  dateHeure?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const SSE_TYPES: Array<{ value: SSEType; label: string }> = [
  { value: 'ACCIDENT_TRAVAIL', label: 'Accident de travail (AT)' },
  { value: 'ACCIDENT_TRAJET', label: 'Accident de trajet' },
  { value: 'PRESQU_ACCIDENT', label: 'Presqu\'accident (Near Miss)' },
  { value: 'INCIDENT_ENV', label: 'Incident Environnemental' },
];

const DEFAULT_FORM: SSEFormData = {
  type: "ACCIDENT_TRAVAIL",
  dateHeure: new Date().toISOString().slice(0, 16),
  lieu: "",
  description: "",
  avecArret: false,
  nbJoursArret: 0,
};

// ============================================================================
// SOUS-COMPOSANT : LOADING SCREEN
// ============================================================================

function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B0F1A] gap-6" role="status" aria-live="polite">
      <RefreshCw className="animate-spin text-rose-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 animate-pulse italic text-center px-4 md:px-10">{label}</span>
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function NewSSEPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SSEFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.lieu.trim()) {
      errors.lieu = "La localisation est obligatoire";
    }
    if (!formData.description.trim()) {
      errors.description = "La description est obligatoire";
    }
    if (!formData.dateHeure) {
      errors.dateHeure = "La date est obligatoire";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning("Veuillez compléter tous les champs requis");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading("Scellage de l'incident au registre...");
    try {
      const payload = {
        SSE_Type: formData.type,
        SSE_DateEvent: new Date(formData.dateHeure).toISOString(),
        SSE_Lieu: formData.lieu.toUpperCase(),
        SSE_Description: formData.description.toUpperCase(),
        SSE_AvecArret: formData.avecArret,
        SSE_NbJoursArret: formData.avecArret ? formData.nbJoursArret : 0,
      };
      await apiClient.post("/sse", payload);
      toast.success("ÉVÉNEMENT ENREGISTRÉ ET SCELLÉ", { id: toastId });
      router.push("/dashboard/sse");
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "REJET KERNEL : Échec d'indexation.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof SSEFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      router.back();
    }
  };

  if (loading && typeof window !== 'undefined') {
    return <LoadingScreen label="Scellage Cryptographique en cours..." />;
  }

  return (
    <div 
      className="h-screen bg-[#0B0F1A] text-white italic font-sans flex flex-col overflow-hidden w-full selection:bg-rose-600/30"
      onKeyDown={handleKeyDown}
    >
      <Toaster position="top-right" richColors theme="dark" closeButton />

      <header className="shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 border-b border-white/5 bg-black/40 flex flex-col xl:flex-row justify-between items-center gap-4 md:gap-6 mt-12 lg:mt-0">
        <div className="text-left space-y-2 md:space-y-3 w-full xl:w-auto">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-rose-600 rounded-xl md:rounded-2xl text-white shadow-xl shadow-rose-600/20">
              <ShieldAlert size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl tracking-tighter leading-none m-0 italic">
              Nouvel <span className="text-rose-400">Incident</span>
            </h1>
          </div>
          <p className="text-slate-500 text-[9px] md:text-[10px] tracking-widest m-0">
            Ouverture Investigation §10.2 ISO 45001
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <button
            type="button"
            onClick={() => router.back()} 
            className="p-2 md:p-3 lg:p-5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-slate-500 hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
            aria-label="Annuler et retourner"
          >
            <X size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
          </button>
          <button
            type="submit"
            form="sse-form"
            disabled={loading}
            className={cn(
              "px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 bg-rose-600 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] tracking-widest shadow-xl hover:bg-white hover:text-rose-700 transition-all border-none cursor-pointer flex items-center gap-2 md:gap-3 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-400",
              loading && "opacity-50 cursor-not-allowed active:scale-100"
            )}
            aria-label="Sceller l'incident"
            aria-busy={loading}
          >
            <Save size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" /> 
            <span className="hidden sm:inline">SCELLER L&apos;INCIDENT</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <form
          id="sse-form"
          onSubmit={handleSave}
          className="max-w-[100rem] mx-auto space-y-8 md:space-y-10 lg:space-y-12 py-6 md:py-8 lg:py-10 text-left"
        >
          <article className="bg-[#0F172A] border-2 border-white/5 p-6 md:p-8 lg:p-10 xl:p-12 lg:p-16 rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl relative overflow-hidden">
            <GitCommit
              className="absolute -top-6 md:-top-8 lg:-top-10 -right-6 md:-right-8 lg:-right-10 text-white opacity-[0.02] w-48 h-48 md:w-56 md:h-56 lg:w-72 lg:h-72"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10 xl:gap-12 mb-8 md:mb-10 lg:mb-12 relative z-10">
              <div className="space-y-2 md:space-y-3">
                <label htmlFor="sse-type" className="text-[10px] md:text-[11px] text-blue-400 tracking-widest font-black ml-2 md:ml-4 block">
                  Classification ISO
                </label>
                <div className="relative">
                  <select
                    id="sse-type"
                    className="w-full bg-black/40 border-2 border-white/10 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-5 lg:p-6 text-[10px] md:text-xs font-black text-white outline-none focus:border-rose-500 transition-all cursor-pointer appearance-none shadow-inner uppercase italic pr-10 md:pr-12"
                    value={formData.type}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => updateForm('type', e.target.value as SSEType)}
                  >
                    {SSE_TYPES.map(t => (
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

              <div className="space-y-2 md:space-y-3">
                <label htmlFor="sse-date" className="text-[10px] md:text-[11px] text-slate-500 tracking-widest font-black ml-2 md:ml-4 block">
                  Horodatage précis
                </label>
                <input
                  id="sse-date"
                  type="datetime-local"
                  className={cn(
                    "w-full bg-black/40 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-5 lg:p-6 text-[10px] md:text-xs font-black text-white outline-none focus:border-rose-500 shadow-inner",
                    formErrors.dateHeure ? "border-red-500/50" : "border-white/10"
                  )}
                  value={formData.dateHeure}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('dateHeure', e.target.value)}
                  aria-required="true"
                  aria-invalid={!!formErrors.dateHeure}
                  style={{ colorScheme: 'dark' }}
                />
                {formErrors.dateHeure && (
                  <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                    <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.dateHeure}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 md:space-y-3 mb-8 md:mb-10 lg:mb-12 relative z-10">
              <label htmlFor="sse-lieu" className="text-[10px] md:text-[11px] text-slate-500 tracking-widest font-black ml-2 md:ml-4 flex items-center gap-1.5 md:gap-2">
                <MapPin size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
                Localisation (Zone / Site)
              </label>
              <input
                id="sse-lieu"
                required
                placeholder="EX: ATELIER CENTRAL - ZONE A..."
                className={cn(
                  "w-full bg-black/40 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-5 lg:p-6 text-[10px] md:text-xs font-black text-white outline-none focus:border-rose-500 shadow-inner uppercase",
                  formErrors.lieu ? "border-red-500/50" : "border-white/10"
                )}
                value={formData.lieu}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('lieu', e.target.value)}
                aria-required="true"
                aria-invalid={!!formErrors.lieu}
              />
              {formErrors.lieu && (
                <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.lieu}
                </p>
              )}
            </div>

            <div className="space-y-2 md:space-y-3 relative z-10">
              <label htmlFor="sse-description" className="text-[10px] md:text-[11px] text-slate-500 tracking-widest font-black ml-2 md:ml-4 flex items-center gap-1.5 md:gap-2">
                <Info size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
                Circonstances Détaillées
              </label>
              <textarea
                id="sse-description"
                rows={6}
                required
                placeholder="DÉCRIRE LES FAITS, ÉQUIPEMENTS IMPLIQUÉS..."
                className={cn(
                  "w-full bg-black/40 border-2 rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] p-4 md:p-6 lg:p-8 text-[10px] md:text-xs font-bold text-slate-300 outline-none focus:border-rose-500 transition-all italic leading-relaxed shadow-inner resize-none uppercase",
                  formErrors.description ? "border-red-500/50" : "border-white/10"
                )}
                value={formData.description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateForm('description', e.target.value)}
                aria-required="true"
                aria-invalid={!!formErrors.description}
              />
              {formErrors.description && (
                <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                  <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.description}
                </p>
              )}
            </div>
          </article>
        </form>
      </main>

      <footer className="shrink-0 bg-black/40 border-t border-white/5 px-4 md:px-6 py-3 md:py-4 lg:py-6 flex justify-center opacity-30 italic text-[8px] md:text-[9px] tracking-widest">
        Qualisoft RD 2026 • Document d&apos;investigation SSE scellé cryptographiquement
      </footer>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(244,63,94,0.3);border-radius:10px}:focus-visible{outline:2px solid #f43f5e;outline-offset:2px}`}</style>
    </div>
  );
}