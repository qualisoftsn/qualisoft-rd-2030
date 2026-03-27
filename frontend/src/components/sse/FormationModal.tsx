/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🎓 MODULE : FormationModal (Training & Qualification Record)
 * RÔLE : Enregistrement des qualifications et recyclages (§7.2 ISO)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useCallback, ChangeEvent, FormEvent, KeyboardEvent, useRef } from "react";
import { GraduationCap, Loader2, ShieldCheck, User, X, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface User {
  U_Id: string;
  U_FirstName: string;
  U_LastName: string;
  U_Email?: string;
  U_Role?: string;
  U_IsActive?: boolean;
}

export interface FormationFormData {
  FOR_Title: string;
  FOR_Date: string;
  FOR_Expiry: string;
  FOR_UserId: string;
}

export interface FormationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export interface FormErrors {
  FOR_Title?: string;
  FOR_Date?: string;
  FOR_Expiry?: string;
  FOR_UserId?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_FORM: FormationFormData = {
  FOR_Title: '',
  FOR_Date: new Date().toISOString().split('T')[0],
  FOR_Expiry: '',
  FOR_UserId: '',
};

// ============================================================================
// SOUS-COMPOSANT : FORM SELECT
// ============================================================================

interface FormSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: React.ElementType;
}

function FormSelect({ id, label, value, onChange, options, placeholder, required = false, error, icon: Icon }: FormSelectProps) {
  return (
    <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[9px] md:text-[10px] font-black uppercase text-slate-400 ml-2 md:ml-4 lg:ml-5 tracking-widest leading-none block",
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
              error ? "text-red-400" : "text-slate-500 group-focus-within:text-orange-400"
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
            "w-full bg-white/5 border-2 rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black italic outline-none focus:border-orange-500 transition-all appearance-none text-white cursor-pointer shadow-inner",
            Icon && "pl-12 md:pl-14 lg:pl-16",
            error ? "border-red-500/50 focus:border-red-500" : "border-white/5 focus:border-orange-500"
          )}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          {placeholder && (
            <option value="" className="bg-[#0F172A] text-slate-400">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0F172A] text-white">
              {opt.label}
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
        <p id={`${id}-error`} className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
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
  labelColor?: string;
}

function FormInput({ id, label, value, onChange, placeholder, type = 'text', required = false, error, icon: Icon, labelColor = 'text-slate-400' }: FormInputProps) {
  return (
    <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[9px] md:text-[10px] font-black uppercase ml-2 md:ml-4 lg:ml-5 tracking-widest leading-none block",
          labelColor,
          error && "text-red-400"
        )}
      >
        {label} {required && <span className="text-red-400" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon 
            className={cn(
              "absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-4.5 md:h-4.5 transition-colors",
              error ? "text-red-400" : labelColor === 'text-orange-500/60' ? "text-orange-400" : "text-slate-500"
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
            "w-full bg-white/5 border-2 rounded-xl md:rounded-2xl p-4 md:p-5 text-[10px] md:text-sm font-black italic outline-none focus:border-orange-500 transition-all shadow-inner",
            Icon && "pl-12 md:pl-14",
            error ? "border-red-500/50 focus:border-red-500" : labelColor === 'text-orange-500/60' ? "border-orange-500/20 focus:border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.05)]" : "border-white/5 text-white"
          )}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function FormationModal({ onClose, onSuccess }: FormationModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormationFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const modalRef = useRef<HTMLDivElement>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiClient.get<User[]>("/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("❌ Erreur chargement utilisateurs:", error);
      toast.error("ERREUR KERNEL : Liaison RH impossible");
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchUsers();
    }
  }, [fetchUsers]);

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
    setFormData(DEFAULT_FORM);
    setFormErrors({});
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!formData.FOR_Title.trim()) {
      errors.FOR_Title = "Le libellé de la certification est requis";
    }

    if (!formData.FOR_Date) {
      errors.FOR_Date = "La date d'obtention est requise";
    }

    if (!formData.FOR_UserId) {
      errors.FOR_UserId = "Veuillez assigner un collaborateur";
    }

    // Validate expiry date is after obtainment date
    if (formData.FOR_Expiry && formData.FOR_Date) {
      const expiryDate = new Date(formData.FOR_Expiry);
      const obtainDate = new Date(formData.FOR_Date);
      if (expiryDate <= obtainDate) {
        errors.FOR_Expiry = "La date de recyclage doit être après la date d'obtention";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const updateForm = useCallback((field: keyof FormationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    const toastId = toast.loading("Scellage de l'habilitation...");

    try {
      await apiClient.post("/formations", {
        ...formData,
        FOR_Title: formData.FOR_Title.toUpperCase(),
      });
      toast.success("COMPÉTENCE INDEXÉE AU DOSSIER RH", { id: toastId });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || apiError?.message || "ÉCHEC : Le Kernel a rejeté le certificat", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const userOptions = users.map(u => ({
    value: u.U_Id,
    label: `${u.U_FirstName} ${u.U_LastName}${u.U_Email ? ` (${u.U_Email})` : ''}`,
  }));

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0B0F1A]/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6 italic font-sans animate-in zoom-in-95 duration-300"
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
        className="bg-[#0F172A] border border-white/10 w-full max-w-xl rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 lg:p-12 relative shadow-2xl text-left overflow-hidden max-h-[90vh] flex flex-col"
      >
        
        {/* FILIGRANE DÉCORATIF */}
        <GraduationCap 
          className="absolute -right-4 md:-right-6 lg:-right-10 -bottom-4 md:-bottom-6 lg:-bottom-10 text-orange-600 opacity-5 rotate-12 w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64" 
          aria-hidden="true" 
        />

        <header className="flex items-center justify-between mb-8 md:mb-10 lg:mb-12 relative z-10 shrink-0">
          <div className="flex items-center gap-4 md:gap-5 lg:gap-6">
            <div 
              className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-orange-600 rounded-xl md:rounded-2xl lg:rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-orange-900/40 animate-pulse shrink-0"
              aria-hidden="true"
            >
              <GraduationCap size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic tracking-tighter leading-none text-white m-0">
                Nouvelle <span className="text-orange-400">Habilitation</span>
              </h2>
              <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 md:mt-1.5 lg:mt-2 lg:mt-3 m-0">
                Vérification des aptitudes §7.2
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 md:p-3 lg:p-4 bg-white/5 hover:bg-red-500/20 rounded-lg md:rounded-xl lg:rounded-2xl text-slate-400 hover:text-white transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Fermer"
          >
            <X size={16} className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-7 lg:space-y-8 lg:space-y-10 relative z-10 overflow-y-auto custom-scrollbar flex-1" noValidate>
          {/* SÉLECTEUR COLLABORATEUR */}
          <FormSelect 
            id="for-user"
            label="Agent Matrix Assigné"
            value={formData.FOR_UserId}
            onChange={(v) => updateForm('FOR_UserId', v)}
            options={userOptions}
            placeholder="SÉLECTIONNER UN PROFIL"
            required
            error={formErrors.FOR_UserId}
            icon={User}
          />

          {/* DÉSIGNATION FORMATION */}
          <FormInput 
            id="for-title"
            label="Libellé de la Certification"
            value={formData.FOR_Title}
            onChange={(v) => updateForm('FOR_Title', v)}
            placeholder="EX: CACES R489, HABILITATION ELECTRIQUE B2V..."
            required
            error={formErrors.FOR_Title}
          />

          {/* DATES SCELLÉES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <FormInput 
              id="for-date"
              label="Date d'obtention"
              value={formData.FOR_Date}
              onChange={(v) => updateForm('FOR_Date', v)}
              type="date"
              required
              error={formErrors.FOR_Date}
              icon={Calendar}
            />
            <FormInput 
              id="for-expiry"
              label="Date de recyclage"
              value={formData.FOR_Expiry}
              onChange={(v) => updateForm('FOR_Expiry', v)}
              type="date"
              error={formErrors.FOR_Expiry}
              icon={Calendar}
              labelColor="text-orange-400/60"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full bg-orange-600 hover:bg-orange-500 py-4 md:py-5 lg:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black uppercase italic text-[9px] md:text-[10px] lg:text-xs tracking-widest transition-all flex items-center justify-center gap-3 md:gap-4 lg:gap-5 shadow-xl border-none cursor-pointer text-white active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400",
              (loading || !formData.FOR_UserId) && "opacity-30 cursor-not-allowed active:scale-100"
            )}
            aria-busy={loading}
            aria-label="Sceller l'habilitation au registre des compétences"
          >
            {loading ? (
              <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">SCELLAGE EN COURS...</span><span className="sm:hidden">En cours...</span></>
            ) : (
              <><ShieldCheck size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden sm:inline">Sceller au Registre des Compétences</span><span className="sm:hidden">Sceller</span></>
            )}
          </button>
        </form>
      </article>
    </div>
  );
}