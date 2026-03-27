/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📝 MODULE : GenericForm (QHSE Form Engine)
 * RÔLE : Moteur de génération dynamique de formulaires QHSE
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, ChangeEvent, FormEvent, KeyboardEvent, useCallback } from "react";
import { ChevronDown, Save, Loader2, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export type FieldType = 'text' | 'email' | 'password' | 'date' | 'select' | 'textarea' | 'number' | 'tel';

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
  options?: Array<{ label: string; value: string | number }>;
  defaultValue?: string | number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  helpText?: string;
}

export interface FormData {
  [key: string]: string | number;
}

export interface FormErrors {
  [key: string]: string;
}

export interface GenericFormProps {
  title: string;
  fields: FormField[];
  onSubmit: (data: FormData) => void | Promise<void>;
  submitLabel?: string;
  loading?: boolean;
  description?: string;
  successMessage?: string;
  onCancel?: () => void;
  className?: string;
}

// ============================================================================
// SOUS-COMPOSANT : FORM FIELD
// ============================================================================

interface FormFieldProps {
  field: FormField;
  value: string | number;
  onChange: (name: string, value: string | number) => void;
  error?: string;
  id: string;
}

function FormFieldComponent({ field, value, onChange, error, id }: FormFieldProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange(name, field.type === 'number' ? parseFloat(value) || 0 : value);
  };

  const baseInputClasses = cn(
    "w-full bg-slate-50 border-2 rounded-xl md:rounded-2xl px-4 md:px-5 lg:px-6 py-3 md:py-4 lg:py-5 text-[10px] md:text-sm font-black text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white outline-none transition-all italic shadow-inner",
    error && "border-red-500/50 focus:border-red-500"
  );

  const renderInput = () => {
    if (field.type === 'select') {
      return (
        <div className="relative" role="combobox" aria-haspopup="listbox">
          <select
            id={id}
            name={field.name}
            required={field.required}
            value={value}
            onChange={handleChange}
            className={cn(baseInputClasses, "appearance-none pr-10 md:pr-12 cursor-pointer")}
            aria-required={field.required}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          >
            <option value="" disabled className="bg-white text-slate-400">
              -- Sélectionner --
            </option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
                {opt.label.toUpperCase()}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 md:right-4 lg:right-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-slate-400 group-focus-within:text-blue-500 pointer-events-none transition-colors"
            aria-hidden="true"
          />
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          id={id}
          name={field.name}
          placeholder={field.placeholder?.toUpperCase()}
          required={field.required}
          value={value}
          onChange={handleChange}
          minLength={field.minLength}
          maxLength={field.maxLength}
          className={cn(baseInputClasses, "rounded-2xl md:rounded-3xl lg:rounded-[2.5rem] px-6 md:px-8 py-4 md:py-5 lg:py-6 min-h-[120px] md:min-h-[140px] resize-none leading-relaxed")}
          aria-required={field.required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : field.helpText ? `${id}-help` : undefined}
        />
      );
    }

    return (
      <input
        id={id}
        type={field.type}
        name={field.name}
        placeholder={field.placeholder?.toUpperCase()}
        required={field.required}
        value={value}
        onChange={handleChange}
        minLength={field.minLength}
        maxLength={field.maxLength}
        pattern={field.pattern}
        className={baseInputClasses}
        aria-required={field.required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : field.helpText ? `${id}-help` : undefined}
      />
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col",
        field.type === "textarea" || field.fullWidth ? "md:col-span-2" : ""
      )}
      role="group"
      aria-labelledby={`${id}-label`}
    >
      <label
        id={`${id}-label`}
        htmlFor={id}
        className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 md:mb-2 lg:mb-3 ml-2 md:ml-4 italic flex items-center gap-1.5 md:gap-2"
      >
        {field.label}
        {field.required && <span className="text-red-400 text-lg leading-none" aria-hidden="true">*</span>}
      </label>

      <div className="relative group">
        {renderInput()}
      </div>

      {error && (
        <p id={`${id}-error`} className="text-red-400 text-[7px] md:text-[8px] mt-1 ml-2 md:ml-4 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}

      {field.helpText && !error && (
        <p id={`${id}-help`} className="text-slate-400 text-[7px] md:text-[8px] mt-1 ml-2 md:ml-4 flex items-center gap-1">
          <Info size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {field.helpText}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function GenericForm({
  title,
  fields,
  onSubmit,
  submitLabel = "Sceller les données",
  loading = false,
  description,
  successMessage,
  onCancel,
  className,
}: GenericFormProps) {
  
  const [formData, setFormData] = useState<FormData>(
    fields.reduce(
      (acc, field) => ({ ...acc, [field.name]: field.defaultValue ?? "" }),
      {} as FormData
    )
  );

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    
    fields.forEach(field => {
      const value = formData[field.name];
      
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors[field.name] = "Ce champ est obligatoire";
      }
      
      if (field.type === 'email' && value && typeof value === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[field.name] = "Email invalide";
        }
      }
      
      if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
        errors[field.name] = `Minimum ${field.minLength} caractères`;
      }
      
      if (field.maxLength && typeof value === 'string' && value.length > field.maxLength) {
        errors[field.name] = `Maximum ${field.maxLength} caractères`;
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, fields]);

  const handleChange = useCallback((name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [formErrors]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
      setSubmitted(true);
      setFormErrors({});
    } catch (error) {
      console.error('❌ Erreur soumission formulaire:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  const handleReset = () => {
    setFormData(
      fields.reduce(
        (acc, field) => ({ ...acc, [field.name]: field.defaultValue ?? "" }),
        {} as FormData
      )
    );
    setFormErrors({});
    setSubmitted(false);
  };

  if (submitted && successMessage) {
    return (
      <article 
        className={cn(
          "bg-white rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-6 md:p-8 lg:p-10 xl:p-12 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left font-sans italic",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="text-center py-8 md:py-10 lg:py-12 space-y-4 md:space-y-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">
              Données Scellées
            </h3>
            <p className="text-slate-500 text-[10px] md:text-[11px] font-black uppercase tracking-widest leading-relaxed">
              {successMessage}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 md:pt-6">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 md:px-8 py-3 md:py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Fermer
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="px-6 md:px-8 py-3 md:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Nouvelle Saisie
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article 
      className={cn(
        "bg-white rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left font-sans italic",
        className
      )}
      role="form"
      aria-labelledby="form-title"
    >
      
      {/* 🔝 HEADER */}
      <header className="mb-6 md:mb-8 lg:mb-10 lg:mb-12 relative" role="banner">
        <div className="flex items-center gap-3 md:gap-4 lg:gap-5 mb-3 md:mb-4">
          <div className="h-8 md:h-10 w-1.5 md:w-2 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" aria-hidden="true" />
          <h2 id="form-title" className="text-xl md:text-2xl lg:text-3xl font-black uppercase text-slate-900 tracking-tighter leading-none m-0">
            {title}
          </h2>
        </div>
        {description && (
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 md:ml-5 lg:ml-7 m-0">
            {description}
          </p>
        )}
      </header>

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6 md:space-y-8 lg:space-y-10" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-8 lg:gap-x-10 gap-y-4 md:gap-y-6 lg:gap-y-8">
          {fields.map((field) => (
            <FormFieldComponent
              key={field.name}
              field={field}
              value={formData[field.name]}
              onChange={handleChange}
              error={formErrors[field.name]}
              id={`field-${field.name}`}
            />
          ))}
        </div>

        {/* 🏁 ACTIONS */}
        <div className="pt-6 md:pt-8 lg:pt-10 border-t border-slate-100 mt-8 md:mt-10 lg:mt-12 flex flex-col items-center">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full lg:w-2/3">
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex-1 bg-slate-950 hover:bg-blue-600 text-white font-black py-3 md:py-4 lg:py-5 lg:py-7 rounded-xl md:rounded-2xl shadow-xl transition-all uppercase text-[9px] md:text-[10px] lg:text-[11px] tracking-widest italic flex items-center justify-center gap-3 md:gap-4 lg:gap-5 active:scale-95 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400",
                loading && "opacity-50 cursor-not-allowed active:scale-100"
              )}
              aria-busy={loading}
              aria-label={submitLabel}
            >
              {loading ? (
                <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">TRAITEMENT...</span><span className="sm:hidden">En cours...</span></>
              ) : (
                <><Save size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 group-hover:rotate-12 transition-transform" aria-hidden="true" /> <span className="hidden sm:inline">{submitLabel}</span><span className="sm:hidden">Valider</span></>
              )}
            </button>
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 lg:py-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] lg:text-[11px] tracking-widest transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
              >
                Annuler
              </button>
            )}
          </div>
          
          <div className="mt-4 md:mt-6 lg:mt-8 flex items-center gap-2 md:gap-3 opacity-40">
            <Info size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 text-blue-500" aria-hidden="true" />
            <p className="text-[7px] md:text-[8px] lg:text-[9px] text-slate-500 uppercase font-black tracking-widest italic m-0">
              Protocole de sécurisation des données Qualisoft SDE actif
            </p>
          </div>
        </div>
      </form>
    </article>
  );
}