/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ✍️ MODULE : ReclamationForm (Claim Intake Form)
 * RÔLE : Saisie et indexation légale des plaintes (§8.2.1 ISO 9001)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useCallback, ChangeEvent, FormEvent, KeyboardEvent, useRef } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type GravityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ClaimSource = 'E-mail' | 'Telephone' | 'Courrier' | 'Site Web' | 'Autre';

export interface Tier {
  TR_Id: string;
  TR_Name: string;
  TR_Type?: string;
  TR_Email?: string;
  TR_Phone?: string;
}

export interface Processus {
  PR_Id: string;
  PR_Libelle: string;
  PR_Code?: string;
}

export interface ReclamationFormData {
  REC_Object: string;
  REC_Description: string;
  REC_Source: ClaimSource;
  REC_Gravity: GravityLevel;
  REC_TierId: string;
  REC_ProcessusId: string;
  REC_DateReceipt: string;
}

export interface ReclamationFormProps {
  tiers: Tier[];
  processus: Processus[];
  onSuccess: () => void;
  className?: string;
}

export interface FormErrors {
  REC_Object?: string;
  REC_Description?: string;
  REC_TierId?: string;
  REC_ProcessusId?: string;
  REC_DateReceipt?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const GRAVITY_OPTIONS: Array<{ value: GravityLevel; label: string; color: string }> = [
  { value: 'LOW', label: 'BASSE', color: 'text-slate-500' },
  { value: 'MEDIUM', label: 'MOYENNE', color: 'text-blue-500' },
  { value: 'HIGH', label: 'HAUTE', color: 'text-amber-500' },
  { value: 'CRITICAL', label: 'CRITIQUE', color: 'text-red-500' },
];

const SOURCE_OPTIONS: ClaimSource[] = ['E-mail', 'Telephone', 'Courrier', 'Site Web', 'Autre'];

const DEFAULT_FORM: ReclamationFormData = {
  REC_Object: '',
  REC_Description: '',
  REC_Source: 'E-mail',
  REC_Gravity: 'MEDIUM',
  REC_TierId: '',
  REC_ProcessusId: '',
  REC_DateReceipt: new Date().toISOString().split('T')[0],
};

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
}

function FormInput({ id, label, value, onChange, placeholder, type = 'text', required = false, error }: FormInputProps) {
  return (
    <div className="space-y-1.5 md:space-y-2 text-left" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 md:ml-2 block",
          error && "text-red-400"
        )}
      >
        {label} {required && <span className="text-red-400" aria-hidden="true">*</span>}
      </label>
      <input 
        id={id}
        type={type}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={cn(
          "w-full p-4 md:p-5 bg-slate-50 border-2 rounded-xl md:rounded-2xl font-black italic text-slate-800 text-[10px] md:text-sm outline-none focus:border-blue-500 shadow-inner transition-all",
          error ? "border-red-500/50 focus:border-red-500" : "border-slate-100"
        )}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-red-400 text-[7px] md:text-[8px] ml-1 md:ml-2 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : FORM SELECT
// ============================================================================

interface FormSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}

function FormSelect({ id, label, value, onChange, children, required = false, error }: FormSelectProps) {
  return (
    <div className="space-y-1.5 md:space-y-2 text-left" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 md:ml-2 block",
          error && "text-red-400"
        )}
      >
        {label} {required && <span className="text-red-400" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <select 
          id={id}
          value={value}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
          required={required}
          className={cn(
            "w-full p-4 md:p-5 bg-slate-50 border-2 rounded-xl md:rounded-2xl font-black italic text-slate-800 text-[10px] md:text-sm outline-none focus:border-blue-500 appearance-none shadow-inner transition-all pr-10 md:pr-12",
            error ? "border-red-500/50 focus:border-red-500" : "border-slate-100"
          )}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          {children}
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
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ReclamationForm({ tiers, processus, onSuccess, className }: ReclamationFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ReclamationFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!form.REC_Object.trim()) {
      errors.REC_Object = "L'objet de la plainte est requis";
    }

    if (!form.REC_Description.trim()) {
      errors.REC_Description = "La description est requise";
    } else if (form.REC_Description.length < 20) {
      errors.REC_Description = "La description doit contenir au moins 20 caractères";
    }

    if (!form.REC_TierId) {
      errors.REC_TierId = "Veuillez sélectionner un tiers";
    }

    if (!form.REC_DateReceipt) {
      errors.REC_DateReceipt = "La date de réception est requise";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const updateForm = useCallback((field: keyof ReclamationFormData, value: string) => {
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
    const toastId = toast.loading("Archivage au registre...");
    
    try {
      await apiClient.post('/reclamations', {
        ...form,
        REC_Object: form.REC_Object.toUpperCase(),
        REC_Description: form.REC_Description.toUpperCase(),
      });
      toast.success("RÉCLAMATION ARCHIVÉE (§8.2.1)", { id: toastId });
      onSuccess();
      setForm(DEFAULT_FORM);
      setFormErrors({});
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || apiError?.message || "Erreur de capture SDE", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setForm(DEFAULT_FORM);
      setFormErrors({});
    }
  };

  return (
    <article 
      className={cn(
        "bg-white p-4 md:p-6 lg:p-8 xl:p-10 rounded-2xl md:rounded-3xl border border-slate-100 shadow-xl md:shadow-2xl relative overflow-hidden text-left italic focus-within:ring-2 focus-within:ring-blue-400",
        className
      )}
      role="form"
      aria-labelledby="form-title"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="absolute top-0 left-0 w-1 md:w-1.5 lg:w-2 h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
        aria-hidden="true" 
      />
      
      <h2 id="form-title" className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 mb-6 md:mb-8 lg:mb-10 uppercase tracking-tighter pl-3 md:pl-4 lg:pl-6">
        Saisie de <span className="text-blue-500">Plainte Tiers</span>
      </h2>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 md:space-y-5 lg:space-y-6 pl-3 md:pl-4 lg:pl-6" noValidate>
        <FormInput 
          id="rec-object"
          label="Objet de la plainte"
          value={form.REC_Object}
          onChange={(v) => updateForm('REC_Object', v)}
          placeholder="Ex: Retard livraison lot #402"
          required
          error={formErrors.REC_Object}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
          <FormSelect 
            id="rec-tier"
            label="Client / Tiers Concerné"
            value={form.REC_TierId}
            onChange={(v) => updateForm('REC_TierId', v)}
            required
            error={formErrors.REC_TierId}
          >
            <option value="" className="bg-white text-slate-400">-- Sélectionner --</option>
            {tiers.map((tier) => (
              <option key={tier.TR_Id} value={tier.TR_Id} className="bg-white text-slate-900">
                {tier.TR_Name}
              </option>
            ))}
          </FormSelect>
          <FormSelect 
            id="rec-processus"
            label="Processus Imputé"
            value={form.REC_ProcessusId}
            onChange={(v) => updateForm('REC_ProcessusId', v)}
            error={formErrors.REC_ProcessusId}
          >
            <option value="" className="bg-white text-slate-400">-- Aucun --</option>
            {processus.map((p) => (
              <option key={p.PR_Id} value={p.PR_Id} className="bg-white text-slate-900">
                {p.PR_Libelle}
              </option>
            ))}
          </FormSelect>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
          <FormSelect 
            id="rec-gravity"
            label="Gravité"
            value={form.REC_Gravity}
            onChange={(v) => updateForm('REC_Gravity', v as GravityLevel)}
          >
            {GRAVITY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
                {opt.label}
              </option>
            ))}
          </FormSelect>
          <FormInput 
            id="rec-date"
            label="Date de Réception"
            value={form.REC_DateReceipt}
            onChange={(v) => updateForm('REC_DateReceipt', v)}
            type="date"
            required
            error={formErrors.REC_DateReceipt}
          />
        </div>

        <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby="description-label">
          <label 
            id="description-label"
            htmlFor="rec-description"
            className={cn(
              "text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 md:ml-2 block",
              formErrors.REC_Description && "text-red-400"
            )}
          >
            Description des faits <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <textarea 
            id="rec-description"
            required
            rows={4}
            value={form.REC_Description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateForm('REC_Description', e.target.value)}
            placeholder="Détaillez l'écart constaté..."
            className={cn(
              "w-full p-4 md:p-5 lg:p-6 bg-slate-50 border-2 rounded-xl md:rounded-2xl lg:rounded-3xl outline-none focus:border-blue-500 font-bold italic text-[10px] md:text-sm shadow-inner resize-none transition-all",
              formErrors.REC_Description ? "border-red-500/50 focus:border-red-500" : "border-slate-100"
            )}
            aria-required="true"
            aria-invalid={!!formErrors.REC_Description}
            aria-describedby={formErrors.REC_Description ? 'description-error' : 'description-hint'}
          />
          {formErrors.REC_Description ? (
            <p id="description-error" className="text-red-400 text-[7px] md:text-[8px] ml-1 md:ml-2 flex items-center gap-1" role="alert">
              <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.REC_Description}
            </p>
          ) : (
            <p id="description-hint" className="text-slate-400 text-[7px] md:text-[8px] ml-1 md:ml-2">
              Minimum 20 caractères requis
            </p>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={cn(
            "w-full py-4 md:py-5 lg:py-6 bg-slate-950 text-white rounded-xl md:rounded-2xl font-black uppercase italic tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-2 md:gap-3 lg:gap-4 border-none cursor-pointer active:scale-95 text-[9px] md:text-[10px] lg:text-xs focus:outline-none focus:ring-2 focus:ring-blue-400",
            loading && "opacity-50 cursor-not-allowed active:scale-100"
          )}
          aria-busy={loading}
          aria-label={loading ? "Scellage en cours" : "Archiver la réclamation"}
        >
          {loading ? (
            <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">SCELLAGE KERNEL...</span><span className="sm:hidden">En cours...</span></>
          ) : (
            <><Save size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden sm:inline">ARCHIVER LA RÉCLAMATION</span><span className="sm:hidden">Archiver</span></>
          )}
        </button>
      </form>
    </article>
  );
}