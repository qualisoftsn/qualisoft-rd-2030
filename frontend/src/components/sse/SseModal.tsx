/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🚨 MODULE : SseModal (SSE Event Declaration)
 * RÔLE : Déclaration d'événements SSE (Accidents/Incidents)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useCallback, ChangeEvent, FormEvent, KeyboardEvent, useRef } from "react";
import { AlertCircle, Loader2, MapPin, ShieldAlert, X, User, Activity, CheckCircle2, AlertTriangle } from "lucide-react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SseType = 'ACCIDENT_TRAVAIL' | 'ACCIDENT_TRAJET' | 'PRESQU_ACCIDENT' | 'SITUATION_DANGEREUSE';

export interface Site {
  S_Id: string;
  S_Name: string;
  S_Code?: string;
  S_Address?: string;
  S_IsActive?: boolean;
}

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Role?: string;
  U_IsActive?: boolean;
}

export interface SseFormData {
  SSE_Type: SseType;
  SSE_Lieu: string;
  SSE_Description: string;
  SSE_DateEvent: string;
  SSE_SiteId: string;
  SSE_VictimId: string;
  SSE_AvecArret: boolean;
  SSE_NbJoursArret: number;
  SSE_Lesions: string;
}

export interface SseModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export interface FormErrors {
  SSE_Type?: string;
  SSE_Lieu?: string;
  SSE_Description?: string;
  SSE_DateEvent?: string;
  SSE_SiteId?: string;
  SSE_VictimId?: string;
  SSE_NbJoursArret?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const SSE_TYPE_OPTIONS: Array<{ value: SseType; label: string; icon: string }> = [
  { value: 'ACCIDENT_TRAVAIL', label: 'Accident de Travail (AT)', icon: '🏥' },
  { value: 'ACCIDENT_TRAJET', label: 'Accident de Trajet', icon: '🚗' },
  { value: 'PRESQU_ACCIDENT', label: 'Presqu\'Accident (Nearly Miss)', icon: '⚠️' },
  { value: 'SITUATION_DANGEREUSE', label: 'Situation Dangereuse', icon: '🚨' },
];

const DEFAULT_FORM: SseFormData = {
  SSE_Type: 'ACCIDENT_TRAVAIL',
  SSE_Lieu: '',
  SSE_Description: '',
  SSE_DateEvent: new Date().toISOString().split('T')[0],
  SSE_SiteId: '',
  SSE_VictimId: '',
  SSE_AvecArret: false,
  SSE_NbJoursArret: 0,
  SSE_Lesions: '',
};

// ============================================================================
// SOUS-COMPOSANT : FORM SELECT
// ============================================================================

interface FormSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; icon?: string }>;
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: React.ElementType;
}

function FormSelect({ id, label, value, onChange, options, placeholder, required = false, error, icon: Icon }: FormSelectProps) {
  return (
    <div className="space-y-1.5 md:space-y-2 text-left" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-1 md:ml-2 lg:ml-5 tracking-widest italic block",
          error && "text-red-400"
        )}
      >
        {label} {required && <span className="text-red-400" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon 
            className={cn(
              "absolute left-4 md:left-5 lg:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-4.5 md:h-4.5 transition-colors",
              error ? "text-red-400" : "text-slate-500"
            )} 
            aria-hidden="true" 
          />
        )}
        <select 
          id={id}
          value={value}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
          required={required}
          className={cn(
            "w-full bg-slate-50 border-2 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-5 lg:p-6 lg:p-7 text-[10px] md:text-sm font-black outline-none focus:border-red-500 uppercase italic cursor-pointer shadow-inner appearance-none",
            Icon && "pl-10 md:pl-12 lg:pl-14",
            error ? "border-red-500/50 focus:border-red-500" : "border-slate-100 focus:border-red-500"
          )}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          {placeholder && (
            <option value="" className="bg-white text-slate-400">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
              {opt.icon && `${opt.icon} `}{opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 md:right-6 bottom-4 md:bottom-5 pointer-events-none text-slate-400" aria-hidden="true">
          <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-red-400 text-[7px] md:text-[8px] ml-1 md:ml-2 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : FORM INPUT
// ============================================================================

interface FormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  icon?: React.ElementType;
  rows?: number;
  as?: 'input' | 'textarea';
}

function FormInput({ id, label, value, onChange, placeholder, type = 'text', required = false, error, icon: Icon, rows = 3, as = 'input' }: FormInputProps) {
  return (
    <div className="space-y-1.5 md:space-y-2 text-left" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[9px] md:text-[10px] font-black uppercase text-slate-500 ml-1 md:ml-2 lg:ml-5 tracking-widest italic block",
          error && "text-red-400"
        )}
      >
        {label} {required && <span className="text-red-400" aria-hidden="true">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea 
          id={id}
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={cn(
            "w-full bg-slate-50 border-2 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] p-4 md:p-5 lg:p-6 lg:p-8 text-[10px] md:text-sm font-bold outline-none focus:border-red-500 italic leading-relaxed shadow-inner resize-none",
            error ? "border-red-500/50 focus:border-red-500" : "border-slate-100 focus:border-red-500"
          )}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      ) : (
        <div className="relative">
          {Icon && (
            <Icon 
              className={cn(
                "absolute left-4 md:left-5 lg:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-4.5 md:h-4.5 transition-colors",
                error ? "text-red-400" : "text-slate-500"
              )} 
              aria-hidden="true" 
            />
          )}
          <input 
            id={id}
            type={type}
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className={cn(
              "w-full bg-slate-50 border-2 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black outline-none focus:border-red-500 shadow-inner",
              Icon && "pl-10 md:pl-12 lg:pl-14",
              error ? "border-red-500/50 focus:border-red-500" : "border-slate-100 focus:border-red-500"
            )}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        </div>
      )}
      {error && (
        <p id={`${id}-error`} className="text-red-400 text-[7px] md:text-[8px] ml-1 md:ml-2 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function SseModal({ onClose, onSuccess }: SseModalProps) {
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<SseFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const modalRef = useRef<HTMLDivElement>(null);

  const syncKernel = useCallback(async () => {
    try {
      const [sRes, uRes] = await Promise.all([
        apiClient.get<Site[]>("/sites"),
        apiClient.get<User[]>("/users")
      ]);
      setSites(Array.isArray(sRes.data) ? sRes.data : []);
      setUsers(Array.isArray(uRes.data) ? uRes.data : []);
    } catch (error) {
      console.error("❌ Erreur synchronisation Kernel:", error);
      toast.error("ERREUR : Rupture de liaison avec le Kernel");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      syncKernel();
    }
  }, [syncKernel]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape as any);
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Reset form when modal opens
  useEffect(() => {
    setForm(DEFAULT_FORM);
    setFormErrors({});
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!form.SSE_DateEvent) {
      errors.SSE_DateEvent = "La date est requise";
    }

    if (!form.SSE_SiteId) {
      errors.SSE_SiteId = "Veuillez sélectionner un site";
    }

    if (!form.SSE_Description.trim()) {
      errors.SSE_Description = "La description est requise";
    } else if (form.SSE_Description.length < 20) {
      errors.SSE_Description = "La description doit contenir au moins 20 caractères";
    }

    if (form.SSE_AvecArret && form.SSE_NbJoursArret <= 0) {
      errors.SSE_NbJoursArret = "Veuillez indiquer le nombre de jours d'arrêt";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const updateForm = useCallback((field: keyof SseFormData, value: string | boolean | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Indexation du sinistre SSE...");
    
    try {
      await apiClient.post("/sse", {
        ...form,
        SSE_Description: form.SSE_Description.toUpperCase(),
        SSE_Lieu: form.SSE_Lieu.toUpperCase(),
      });
      toast.success("ÉVÉNEMENT SSE ARCHIVÉ ET SCELLÉ", { id: toastId });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || apiError?.message || "REJET : Erreur d'intégrité des données", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const siteOptions = sites.map(s => ({ value: s.S_Id, label: s.S_Name }));
  const victimOptions = users.map(u => ({ value: u.U_Id, label: `${u.U_FirstName} ${u.U_LastName}` }));
  const typeOptions = SSE_TYPE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label, icon: opt.icon }));

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6 italic font-sans text-left animate-in fade-in duration-500"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <article 
        ref={modalRef}
        className="bg-white w-full max-w-3xl lg:max-w-4xl rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-12 duration-700 max-h-[90vh] flex flex-col"
      >
        
        {/* HEADER D'URGENCE ROUGE */}
        <header className="p-6 md:p-8 lg:p-10 lg:p-12 bg-red-600 text-white flex justify-between items-center relative overflow-hidden shrink-0">
          <ShieldAlert 
            className="absolute -right-4 md:-right-6 lg:-right-10 -bottom-4 md:-bottom-6 lg:-bottom-10 opacity-10 text-white rotate-12 w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 lg:w-72 lg:h-72" 
            aria-hidden="true" 
          />
          
          <div className="flex items-center gap-4 md:gap-5 lg:gap-6 relative z-10">
            <div 
              className="p-3 md:p-4 lg:p-5 bg-white/20 rounded-2xl md:rounded-3xl backdrop-blur-md animate-pulse shadow-xl shrink-0"
              aria-hidden="true"
            >
              <AlertCircle size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 lg:w-9 lg:h-9" />
            </div>
            <div className="leading-none min-w-0">
              <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl lg:text-4xl font-black uppercase italic tracking-tighter m-0">
                Déclarer un <span className="text-slate-900 underline decoration-white/20">Événement SSE</span>
              </h2>
              <p className="text-[7px] md:text-[8px] lg:text-[9px] lg:text-[10px] font-black uppercase tracking-widest mt-1 md:mt-1.5 lg:mt-2 lg:mt-3 opacity-70 m-0">
                Rapport de sinistre scellé • ISO 45001
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 md:p-3 lg:p-4 bg-white/10 hover:bg-white/20 rounded-lg md:rounded-xl lg:rounded-2xl transition-all border-none cursor-pointer text-white relative z-10 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Fermer"
          >
            <X size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 lg:p-14 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6 lg:gap-8 lg:gap-10 overflow-y-auto custom-scrollbar flex-1" noValidate>
          
          <div className="col-span-1 md:col-span-2 space-y-1.5 md:space-y-2">
            <FormSelect 
              id="sse-type"
              label="Catégorie de l'écart SSE"
              value={form.SSE_Type}
              onChange={(v) => updateForm('SSE_Type', v)}
              options={typeOptions}
              required
              error={formErrors.SSE_Type}
            />
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <FormInput 
              id="sse-date"
              label="Date & Heure des faits"
              value={form.SSE_DateEvent}
              onChange={(v) => updateForm('SSE_DateEvent', v)}
              type="date"
              required
              error={formErrors.SSE_DateEvent}
            />
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <FormSelect 
              id="sse-site"
              label="Site de l'événement"
              value={form.SSE_SiteId}
              onChange={(v) => updateForm('SSE_SiteId', v)}
              options={siteOptions}
              placeholder="-- CHOISIR UN SITE --"
              required
              error={formErrors.SSE_SiteId}
              icon={MapPin}
            />
          </div>

          <div className="col-span-1 md:col-span-2 space-y-1.5 md:space-y-2">
            <FormInput 
              id="sse-description"
              label="Description & Circonstances"
              value={form.SSE_Description}
              onChange={(v) => updateForm('SSE_Description', v)}
              placeholder="Décrivez précisément les faits, les causes immédiates..."
              as="textarea"
              rows={3}
              required
              error={formErrors.SSE_Description}
            />
          </div>

          {/* IMPACT ET ARRÊTS */}
          <div className="col-span-1 md:col-span-2 p-4 md:p-6 lg:p-8 bg-slate-50 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-2 border-transparent hover:border-red-100 transition-all italic">
            <div className="flex items-start sm:items-center gap-3 md:gap-4 lg:gap-6">
              <input 
                type="checkbox" 
                id="sse-arret"
                className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-lg md:rounded-xl border-slate-300 text-red-600 focus:ring-red-600 cursor-pointer shadow-inner" 
                checked={form.SSE_AvecArret} 
                onChange={(e) => updateForm('SSE_AvecArret', e.target.checked)} 
              />
              <div>
                <label htmlFor="sse-arret" className="text-[10px] md:text-sm font-black uppercase text-slate-900 m-0 leading-none">
                  Indice de gravité : Arrêt de travail
                </label>
                <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mt-1 md:mt-1.5 lg:mt-2 m-0 tracking-widest">
                  Interruption de la continuité de service
                </p>
              </div>
            </div>

            {form.SSE_AvecArret && (
              <div className="flex items-center gap-2 md:gap-3 lg:gap-4 animate-in slide-in-from-right duration-500 w-full sm:w-auto">
                <span className="text-[9px] md:text-[10px] lg:text-[11px] font-black text-red-600 uppercase italic whitespace-nowrap">
                  Jours d'arrêt :
                </span>
                <input 
                  type="number" 
                  min="0"
                  className="w-16 md:w-20 lg:w-24 bg-white border-2 border-red-100 p-2 md:p-3 lg:p-4 rounded-lg md:rounded-xl text-base md:text-lg lg:text-xl font-black outline-none text-red-600 text-center shadow-lg" 
                  value={form.SSE_NbJoursArret || ''} 
                  onChange={(e) => updateForm('SSE_NbJoursArret', parseInt(e.target.value) || 0)} 
                  aria-label="Nombre de jours d'arrêt"
                />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={cn(
              "col-span-1 md:col-span-2 bg-slate-950 py-4 md:py-5 lg:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-[3rem] font-black uppercase italic text-[9px] md:text-[10px] lg:text-xs tracking-widest text-white shadow-xl hover:bg-red-600 transition-all flex justify-center items-center gap-3 md:gap-4 lg:gap-5 lg:gap-6 border-none cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400",
              loading && "opacity-30 cursor-not-allowed active:scale-100"
            )}
            aria-busy={loading}
            aria-label="Sceller le rapport de sinistre"
          >
            {loading ? (
              <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">SCELLAGE EN COURS...</span><span className="sm:hidden">En cours...</span></>
            ) : (
              <><Activity size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden sm:inline">Sceller le rapport de sinistre</span><span className="sm:hidden">Sceller</span></>
            )}
          </button>
        </form>
      </article>
    </div>
  );
}