/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🤝 MODULE : TierForm (Third Party Enrollment)
 * RÔLE : Enrôlement des Tiers (Clients, Fournisseurs, Partenaires)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useCallback, ChangeEvent, FormEvent, KeyboardEvent, useRef, useEffect } from 'react';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { Loader2, UserPlus, ShieldCheck, AlertCircle, CheckCircle2, Mail, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type TierType = 'CLIENT' | 'FOURNISSEUR' | 'PARTENAIRE';

export interface TierFormData {
  TR_Name: string;
  TR_Type: TierType;
  TR_Email: string;
  TR_CodeExterne: string;
}

export interface TierFormProps {
  T_Id: string;
  onSuccess: () => void;
  onClose?: () => void;
  className?: string;
}

export interface FormErrors {
  TR_Name?: string;
  TR_Type?: string;
  TR_Email?: string;
  TR_CodeExterne?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const TIER_TYPE_OPTIONS: Array<{ value: TierType; label: string; icon: string }> = [
  { value: 'CLIENT', label: 'Client', icon: '👤' },
  { value: 'FOURNISSEUR', label: 'Fournisseur', icon: '📦' },
  { value: 'PARTENAIRE', label: 'Partenaire Stratégique', icon: '🤝' },
];

const DEFAULT_FORM: TierFormData = {
  TR_Name: '',
  TR_Type: 'CLIENT',
  TR_Email: '',
  TR_CodeExterne: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================================
// UTILITAIRES
// ============================================================================

const validateEmail = (email: string): boolean => {
  if (!email.trim()) return true; // Email is optional
  return EMAIL_REGEX.test(email.toLowerCase());
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
  icon?: React.ElementType;
  uppercase?: boolean;
}

function FormInput({ id, label, value, onChange, placeholder, type = 'text', required = false, error, icon: Icon, uppercase = true }: FormInputProps) {
  return (
    <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 md:ml-2 lg:ml-4",
          error && "text-red-400"
        )}
      >
        {label} {required && <span className="text-red-400" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon 
            className={cn(
              "absolute left-3 md:left-4 lg:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-4.5 md:h-4.5 transition-colors",
              error ? "text-red-400" : "text-slate-500"
            )} 
            aria-hidden="true" 
          />
        )}
        <input 
          id={id}
          type={type}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)}
          placeholder={placeholder}
          required={required}
          className={cn(
            "w-full bg-slate-50 border-2 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black outline-none focus:border-blue-500 transition-all shadow-inner",
            Icon && "pl-10 md:pl-12 lg:pl-14",
            error ? "border-red-500/50 focus:border-red-500" : "border-slate-100 focus:border-blue-500",
            uppercase && "uppercase"
          )}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
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
// SOUS-COMPOSANT : FORM SELECT
// ============================================================================

interface FormSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; icon?: string }>;
  required?: boolean;
  error?: string;
}

function FormSelect({ id, label, value, onChange, options, required = false, error }: FormSelectProps) {
  return (
    <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 md:ml-2 lg:ml-4",
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
            "w-full bg-slate-50 border-2 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black uppercase outline-none focus:border-blue-500 appearance-none cursor-pointer shadow-inner pr-10 md:pr-12",
            error ? "border-red-500/50 focus:border-red-500" : "border-slate-100 focus:border-blue-500"
          )}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
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
// COMPOSANT PRINCIPAL
// ============================================================================

export default function TierForm({ T_Id, onSuccess, onClose, className }: TierFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<TierFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Reset form when T_Id changes
  useEffect(() => {
    setForm(DEFAULT_FORM);
    setFormErrors({});
  }, [T_Id]);

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!form.TR_Name.trim()) {
      errors.TR_Name = "La raison sociale est requise";
    } else if (form.TR_Name.trim().length < 3) {
      errors.TR_Name = "Le nom doit contenir au moins 3 caractères";
    }

    if (form.TR_Email && !validateEmail(form.TR_Email)) {
      errors.TR_Email = "Email invalide";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const updateForm = useCallback((field: keyof TierFormData, value: string) => {
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
    const toastId = toast.loading("Scellage au registre des tiers...");

    try {
      await apiClient.post(`/tiers?T_Id=${T_Id}`, {
        ...form,
        TR_Name: form.TR_Name.toUpperCase(),
        TR_CodeExterne: form.TR_CodeExterne.toUpperCase(),
      });
      
      toast.success("TIERS ENRÔLÉ AVEC SUCCÈS", { id: toastId });
      onSuccess();
      if (onClose) onClose();
      setForm(DEFAULT_FORM);
      setFormErrors({});
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || apiError?.message || "Échec de l'indexation.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Escape' && onClose) {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit} 
      onKeyDown={handleKeyDown}
      className={cn("space-y-4 md:space-y-5 lg:space-y-6 lg:space-y-8 italic text-left font-sans", className)}
      role="form"
      aria-label="Formulaire d'enrôlement de tiers"
      noValidate
    >
      <div className="space-y-1.5 md:space-y-2">
        <FormInput 
          id="tr-name"
          label="Raison Sociale / Identité"
          value={form.TR_Name}
          onChange={(v) => updateForm('TR_Name', v)}
          placeholder="EX: GLOBAL INDUSTRIES SA"
          required
          error={formErrors.TR_Name}
          icon={Building2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
        <FormSelect 
          id="tr-type"
          label="Nature du Tiers"
          value={form.TR_Type}
          onChange={(v) => updateForm('TR_Type', v)}
          options={TIER_TYPE_OPTIONS}
          required
          error={formErrors.TR_Type}
        />
        <FormInput 
          id="tr-code"
          label="Identifiant ERP"
          value={form.TR_CodeExterne}
          onChange={(v) => updateForm('TR_CodeExterne', v)}
          placeholder="REF-2026-X"
          error={formErrors.TR_CodeExterne}
          icon={ShieldCheck}
        />
      </div>

      <div className="space-y-1.5 md:space-y-2">
        <FormInput 
          id="tr-email"
          label="Email de Contact"
          value={form.TR_Email}
          onChange={(v) => updateForm('TR_Email', v)}
          placeholder="contact@entreprise.sn"
          type="email"
          error={formErrors.TR_Email}
          icon={Mail}
          uppercase={false}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full py-4 md:py-5 lg:py-6 lg:py-7 bg-slate-950 text-white rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-2 md:gap-3 lg:gap-4 border-none cursor-pointer active:scale-95 text-[9px] md:text-[10px] lg:text-xs focus:outline-none focus:ring-2 focus:ring-blue-400",
          loading && "opacity-50 cursor-not-allowed active:scale-100"
        )}
        aria-busy={loading}
        aria-label={loading ? "Scellage en cours" : "Enrôler au référentiel"}
      >
        {loading ? (
          <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">SCELLAGE EN COURS...</span><span className="sm:hidden">En cours...</span></>
        ) : (
          <><UserPlus size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden sm:inline">ENRÔLER AU RÉFÉRENTIEL</span><span className="sm:hidden">Enrôler</span></>
        )}
      </button>
    </form>
  );
}