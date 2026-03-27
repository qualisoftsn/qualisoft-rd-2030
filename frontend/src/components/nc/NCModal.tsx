/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * ⚠️ MODULE : NCModal (Non-Conformity Declaration)
 * RÔLE : Déclaration d'anomalies et signalement d'écarts
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useEffect, useState, useCallback, ChangeEvent, FormEvent, KeyboardEvent, useRef } from "react";
import { AlertTriangle, Link2, Loader2, ShieldAlert, X, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type NCGravity = 'MINEURE' | 'MAJEURE' | 'CRITIQUE';
export type NCSource = 'INTERNAL_AUDIT' | 'CLIENT_COMPLAINT' | 'INCIDENT_SAFETY' | 'EXTERNAL_AUDIT' | 'OTHER';

export interface Audit {
  AU_Id: string;
  AU_Reference: string;
  AU_Title: string;
  AU_Status?: string;
  AU_Date?: string;
}

export interface NCFormData {
  NC_Libelle: string;
  NC_Description: string;
  NC_Gravite: NCGravity;
  NC_Source: NCSource;
  NC_AuditId: string;
}

export interface NCModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export interface FormErrors {
  NC_Libelle?: string;
  NC_Description?: string;
  NC_Gravite?: string;
  NC_Source?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const GRAVITY_OPTIONS: Array<{ value: NCGravity; label: string; icon: string; color: string }> = [
  { value: 'MINEURE', label: 'Mineure', icon: '⚪', color: 'text-slate-500' },
  { value: 'MAJEURE', label: 'Majeure', icon: '🟠', color: 'text-amber-500' },
  { value: 'CRITIQUE', label: 'Critique', icon: '🔴', color: 'text-red-500' },
];

const SOURCE_OPTIONS: Array<{ value: NCSource; label: string }> = [
  { value: 'INTERNAL_AUDIT', label: 'Audit Interne' },
  { value: 'CLIENT_COMPLAINT', label: 'Réclamation Client' },
  { value: 'INCIDENT_SAFETY', label: 'Incident SSE' },
  { value: 'EXTERNAL_AUDIT', label: 'Audit Externe' },
  { value: 'OTHER', label: 'Autre' },
];

const DEFAULT_FORM: NCFormData = {
  NC_Libelle: '',
  NC_Description: '',
  NC_Gravite: 'MINEURE',
  NC_Source: 'INTERNAL_AUDIT',
  NC_AuditId: '',
};

// ============================================================================
// SOUS-COMPOSANT : FORM INPUT
// ============================================================================

interface FormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  error?: string;
  type?: string;
  as?: 'input' | 'textarea';
  rows?: number;
}

function FormInput({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error,
  type = 'text',
  as = 'input',
  rows = 4
}: FormInputProps) {
  return (
    <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[9px] md:text-[10px] font-black uppercase text-slate-500 block ml-2 md:ml-4 tracking-widest italic",
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
            "w-full bg-slate-50 border-2 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-bold text-slate-900 outline-none focus:border-red-500 focus:bg-white transition-all italic leading-relaxed resize-none",
            error ? "border-red-500/50 focus:border-red-500" : "border-slate-100"
          )}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      ) : (
        <input 
          id={id}
          type={type}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={cn(
            "w-full bg-slate-50 border-2 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-[10px] md:text-sm font-black text-slate-900 outline-none focus:border-red-500 focus:bg-white transition-all uppercase italic",
            error ? "border-red-500/50 focus:border-red-500" : "border-slate-100"
          )}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}
      {error && (
        <p id={`${id}-error`} className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANT : SELECT BLOCK
// ============================================================================

interface SelectBlockProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  icon?: React.ElementType;
}

function SelectBlock({ id, label, value, onChange, children, required = false, error, icon: Icon }: SelectBlockProps) {
  return (
    <div className="space-y-1.5 md:space-y-2" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[9px] md:text-[10px] font-black uppercase text-slate-500 block ml-2 md:ml-4 tracking-widest italic",
          error && "text-red-400"
        )}
      >
        {label} {required && <span className="text-red-400" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon 
            className="absolute left-3 md:left-4 lg:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-4.5 md:h-4.5 text-blue-400" 
            aria-hidden="true" 
          />
        )}
        <select 
          id={id}
          value={value}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
          required={required}
          className={cn(
            "w-full bg-slate-50 border-2 rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 text-[10px] md:text-[11px] font-black outline-none appearance-none cursor-pointer uppercase italic focus:border-red-500 transition-colors pr-10 md:pr-12",
            Icon && "pl-10 md:pl-12 lg:pl-14",
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

export default function NCModal({ onClose, onSuccess }: NCModalProps) {
  const [loading, setLoading] = useState(false);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [formData, setFormData] = useState<NCFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // 📡 RÉCUPÉRATION DU RÉFÉRENTIEL AUDIT
  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const res = await apiClient.get<Audit[]>("/audits");
        setAudits(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("❌ Erreur chargement audits:", error);
        toast.error("ÉCHEC DE SYNC : Registre Audits inaccessible.");
      }
    };

    if (typeof window !== 'undefined') {
      fetchAudits();
    }
  }, []);

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

    if (!formData.NC_Libelle.trim()) {
      errors.NC_Libelle = "L'intitulé du constat est requis";
    }

    if (!formData.NC_Description.trim()) {
      errors.NC_Description = "La description est requise";
    } else if (formData.NC_Description.length < 20) {
      errors.NC_Description = "La description doit contenir au moins 20 caractères";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const updateForm = useCallback((field: keyof NCFormData, value: string) => {
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
    const toastId = toast.loading("Scellage de l'écart au registre...");

    try {
      await apiClient.post("/nc", {
        ...formData,
        NC_Libelle: formData.NC_Libelle.toUpperCase(),
        NC_Description: formData.NC_Description.toUpperCase(),
      });
      toast.success("NON-CONFORMITÉ INDEXÉE AVEC SUCCÈS", { id: toastId });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || apiError?.message || "ERREUR KERNEL : Rejet du signalement", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0B0F1A]/90 backdrop-blur-md flex items-center justify-center p-4 md:p-6 italic font-sans text-left"
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
        className="relative bg-white w-full max-w-2xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 border-none max-h-[90vh] flex flex-col"
      >
        
        {/* 🚨 HEADER CRITIQUE */}
        <header className="p-4 md:p-6 lg:p-8 lg:p-10 border-b border-red-100 flex justify-between items-center bg-red-50/50 relative overflow-hidden shrink-0">
          <div 
            className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" 
            aria-hidden="true" 
          />
          <div className="flex items-center gap-3 md:gap-4 lg:gap-5">
            <div className="p-3 md:p-4 bg-red-600 rounded-xl md:rounded-2xl text-white shadow-xl shadow-red-500/30 shrink-0">
              <AlertTriangle size={24} className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tighter text-slate-900 m-0">
                Déclarer un <span className="text-red-600 underline">Écart</span>
              </h2>
              <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-red-700/60 uppercase tracking-widest mt-1 md:mt-1.5 lg:mt-2 m-0">
                Signalement d&apos;Anomalie Matrix OS
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 md:p-3 text-slate-400 hover:text-red-600 hover:bg-red-100/50 rounded-lg md:rounded-xl transition-all border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Fermer"
          >
            <X size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 space-y-4 md:space-y-5 lg:space-y-6 lg:space-y-8 overflow-y-auto custom-scrollbar flex-1" noValidate>
          <FormInput 
            id="nc-libelle"
            label="Intitulé du constat (Objet)"
            value={formData.NC_Libelle}
            onChange={(v) => updateForm('NC_Libelle', v)}
            placeholder="EX: ABSENCE DE MARQUAGE - ZONE SUD"
            required
            error={formErrors.NC_Libelle}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <SelectBlock 
              id="nc-gravite"
              label="Niveau de Gravité"
              value={formData.NC_Gravite}
              onChange={(v) => updateForm('NC_Gravite', v as NCGravity)}
              required
              error={formErrors.NC_Gravite}
            >
              {GRAVITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
                  {opt.icon} {opt.label}
                </option>
              ))}
            </SelectBlock>
            <SelectBlock 
              id="nc-source"
              label="Provenance (Source)"
              value={formData.NC_Source}
              onChange={(v) => updateForm('NC_Source', v as NCSource)}
              required
              error={formErrors.NC_Source}
            >
              {SOURCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
                  {opt.label}
                </option>
              ))}
            </SelectBlock>
          </div>

          <SelectBlock 
            id="nc-audit"
            label="Audit Scellé (Optionnel)"
            value={formData.NC_AuditId}
            onChange={(v) => updateForm('NC_AuditId', v)}
            icon={Link2}
          >
            <option value="" className="bg-white text-slate-400">-- Aucun lien audit détecté --</option>
            {audits.map((a) => (
              <option key={a.AU_Id} value={a.AU_Id} className="bg-white text-slate-900">
                {a.AU_Reference} : {a.AU_Title}
              </option>
            ))}
          </SelectBlock>

          <FormInput 
            id="nc-description"
            label="Analyse circonstanciée (Preuves)"
            value={formData.NC_Description}
            onChange={(v) => updateForm('NC_Description', v)}
            placeholder="Détaillez ici les faits observés..."
            required
            error={formErrors.NC_Description}
            as="textarea"
            rows={4}
          />

          <button 
            type="submit" 
            disabled={loading}
            className={cn(
              "w-full bg-slate-950 py-4 md:py-5 lg:py-6 lg:py-7 rounded-xl md:rounded-2xl lg:rounded-3xl font-black uppercase italic text-white flex items-center justify-center gap-2 md:gap-3 lg:gap-4 hover:bg-red-600 transition-all shadow-xl active:scale-95 border-none cursor-pointer tracking-widest focus:outline-none focus:ring-2 focus:ring-red-400",
              loading && "opacity-50 cursor-not-allowed active:scale-100"
            )}
            aria-busy={loading}
            aria-label="Sceller la non-conformité au registre qualité"
          >
            {loading ? (
              <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">SCELLAGE EN COURS...</span><span className="sm:hidden">En cours...</span></>
            ) : (
              <><ShieldAlert size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden sm:inline">Sceller au Registre Qualité</span><span className="sm:hidden">Sceller</span></>
            )}
          </button>
        </form>
      </article>
    </div>
  );
}