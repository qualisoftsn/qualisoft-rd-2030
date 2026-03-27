/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : ProvisioningModal (Tenant Deployment)
 * RÔLE : Interface de déploiement de nouveaux nœuds (Tenants)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité + Security
 */

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent, KeyboardEvent, useRef } from 'react';
import { 
  X, Zap, Building2, User, Mail, Lock, 
  MapPin, Phone, Loader2, ShieldAlert, AlertCircle, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProvisioningFormData {
  companyName: string;
  customSlug: string;
  ceoName: string;
  email: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
  phone: string;
  address: string;
}

export interface ProvisioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface FormErrors {
  companyName?: string;
  customSlug?: string;
  ceoName?: string;
  email?: string;
  adminPassword?: string;
  adminFirstName?: string;
  adminLastName?: string;
  phone?: string;
  address?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_FORM: ProvisioningFormData = {
  companyName: '',
  customSlug: '',
  ceoName: '',
  email: '',
  adminPassword: '',
  adminFirstName: '',
  adminLastName: '',
  phone: '',
  address: '',
};

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d+\s()-]{8,}$/;

// ============================================================================
// UTILITAIRES
// ============================================================================

const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.toLowerCase());
};

const validateSlug = (slug: string): boolean => {
  return SLUG_REGEX.test(slug.toLowerCase());
};

const validatePhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
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
  type?: string;
  icon?: React.ElementType;
  suffix?: string;
  required?: boolean;
  error?: string;
  className?: string;
  autoComplete?: string;
}

function FormInput({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  icon: Icon, 
  suffix,
  required = false, 
  error,
  className,
  autoComplete
}: FormInputProps) {
  return (
    <div className={cn("space-y-1.5 md:space-y-2", className)} role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[8px] md:text-[9px] font-black uppercase text-slate-500 block ml-2 md:ml-4 tracking-widest",
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
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={cn(
            "w-full bg-white/5 border border-white/5 rounded-xl md:rounded-2xl py-3 md:py-4 lg:py-5 text-[10px] md:text-[11px] font-bold text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all italic",
            Icon && "pl-10 md:pl-12 lg:pl-14",
            suffix && "pr-20 md:pr-24",
            error ? "border-red-500/50 focus:border-red-500" : "focus:border-blue-500",
            type === 'password' && "tracking-[0.3em]"
          )}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {suffix && (
          <span className="absolute right-3 md:right-4 lg:right-5 top-1/2 -translate-y-1/2 text-[8px] md:text-[9px] font-black text-slate-500">
            {suffix}
          </span>
        )}
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

export default function ProvisioningModal({ isOpen, onClose, onSuccess }: ProvisioningModalProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [form, setForm] = useState<ProvisioningFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape as any);
    }
    return () => document.removeEventListener('keydown', handleEscape as any);
  }, [isOpen, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(DEFAULT_FORM);
      setFormErrors({});
    }
  }, [isOpen]);

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!form.companyName.trim()) {
      errors.companyName = "Le nom de l'organisation est requis";
    }

    if (!form.customSlug.trim()) {
      errors.customSlug = "Le slug technique est requis";
    } else if (!validateSlug(form.customSlug)) {
      errors.customSlug = "Slug invalide (lettres minuscules, chiffres et tirets uniquement)";
    }

    if (!form.adminFirstName.trim()) {
      errors.adminFirstName = "Le prénom est requis";
    }

    if (!form.adminLastName.trim()) {
      errors.adminLastName = "Le nom est requis";
    }

    if (!form.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!validateEmail(form.email)) {
      errors.email = "Email invalide";
    }

    if (!form.adminPassword) {
      errors.adminPassword = "Le mot de passe est requis";
    } else if (!validatePassword(form.adminPassword)) {
      errors.adminPassword = "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (form.phone && !validatePhone(form.phone)) {
      errors.phone = "Numéro de téléphone invalide";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const updateForm = useCallback((field: keyof ProvisioningFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [formErrors]);

  /**
   * 🚀 EXÉCUTION DU PROTOCOLE BIG BANG
   */
  const handleProvisioning = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    setIsDeploying(true);
    const toastId = toast.loading("Initialisation du Protocole Big Bang...");

    try {
      await apiClient.post('/admin/matrix/provisioning/initialize', {
        ...form,
        companyName: form.companyName.toUpperCase(),
        customSlug: form.customSlug.toLowerCase(),
        email: form.email.toLowerCase(),
      });
      
      toast.success(`Nœud ${form.companyName} scellé avec succès !`, { id: toastId });
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg = apiError?.response?.data?.message || apiError?.message || "Rupture de la transaction atomique.";
      toast.error(`ÉCHEC CRITIQUE : ${errorMsg}`, { id: toastId });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-[#0B0F1A]/90 backdrop-blur-md animate-in fade-in duration-300"
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
        className="relative w-full max-w-3xl lg:max-w-4xl bg-[#0F172A] border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl italic font-sans max-h-[90vh] flex flex-col"
      >
        
        {/* 🚩 DECORATIVE GLOW */}
        <div 
          className="absolute -top-16 md:-top-24 -left-16 md:-left-24 w-48 h-48 md:w-64 md:h-64 bg-blue-600/20 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" 
          aria-hidden="true" 
        />
        
        {/* ❌ CLOSE BUTTON */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 md:top-6 lg:top-8 right-4 md:right-6 lg:right-8 text-slate-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-2 md:p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg"
          aria-label="Fermer"
        >
          <X size={20} className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
        </button>

        <form onSubmit={handleProvisioning} className="p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 xl:p-16 space-y-6 md:space-y-8 lg:space-y-10 overflow-y-auto custom-scrollbar flex-1" noValidate>
          
          {/* HEADER */}
          <div className="space-y-1.5 md:space-y-2">
            <h2 id="modal-title" className="text-2xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter italic m-0">
              Big Bang <span className="text-blue-400 not-italic">Protocol</span>
            </h2>
            <p className="text-slate-500 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
              Déploiement atomique d&apos;un nouveau nœud souverain
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
            
            {/* SECTION 1 : IDENTITÉ DU NŒUD */}
            <div className="space-y-4 md:space-y-5 lg:space-y-6">
              <p className="text-blue-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest border-b border-blue-500/20 pb-1.5 md:pb-2">
                Identité Territoriale
              </p>
              
              <div className="space-y-3 md:space-y-4">
                <FormInput 
                  id="companyName"
                  label="Nom de l'Organisation"
                  value={form.companyName}
                  onChange={(v) => updateForm('companyName', v)}
                  placeholder="NOM DE L'ORGANISATION"
                  icon={Building2}
                  required
                  error={formErrors.companyName}
                />

                <FormInput 
                  id="customSlug"
                  label="Slug Technique"
                  value={form.customSlug}
                  onChange={(v) => updateForm('customSlug', v.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="SLUG TECHNIQUE (EX: SAGAM)"
                  icon={Zap}
                  suffix=".qualisoft.sn"
                  required
                  error={formErrors.customSlug}
                  className="lowercase"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <FormInput 
                    id="phone"
                    label="Contact"
                    value={form.phone}
                    onChange={(v) => updateForm('phone', v)}
                    placeholder="CONTACT"
                    icon={Phone}
                    error={formErrors.phone}
                    autoComplete="tel"
                  />
                  <FormInput 
                    id="address"
                    label="Siège"
                    value={form.address}
                    onChange={(v) => updateForm('address', v)}
                    placeholder="SIÈGE"
                    icon={MapPin}
                    error={formErrors.address}
                    autoComplete="street-address"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2 : AUTORITÉ RACINE */}
            <div className="space-y-4 md:space-y-5 lg:space-y-6">
              <p className="text-amber-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest border-b border-amber-500/20 pb-1.5 md:pb-2">
                Autorité Administrative (Admin)
              </p>
              
              <div className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <FormInput 
                    id="adminFirstName"
                    label="Prénom"
                    value={form.adminFirstName}
                    onChange={(v) => updateForm('adminFirstName', v)}
                    placeholder="PRÉNOM"
                    required
                    error={formErrors.adminFirstName}
                    className="uppercase"
                    autoComplete="given-name"
                  />
                  <FormInput 
                    id="adminLastName"
                    label="Nom"
                    value={form.adminLastName}
                    onChange={(v) => updateForm('adminLastName', v)}
                    placeholder="NOM"
                    required
                    error={formErrors.adminLastName}
                    className="uppercase"
                    autoComplete="family-name"
                  />
                </div>

                <FormInput 
                  id="email"
                  label="Courriel Racine"
                  value={form.email}
                  onChange={(v) => updateForm('email', v)}
                  placeholder="COURRIEL RACINE"
                  type="email"
                  icon={Mail}
                  required
                  error={formErrors.email}
                  autoComplete="email"
                />

                <FormInput 
                  id="adminPassword"
                  label="Mot de Passe Maître"
                  value={form.adminPassword}
                  onChange={(v) => updateForm('adminPassword', v)}
                  placeholder="MOT DE PASSE MAÎTRE"
                  type="password"
                  icon={Lock}
                  required
                  error={formErrors.adminPassword}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          {/* FOOTER & TRIGGER */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 lg:gap-8 pt-4 md:pt-6 border-t border-white/5">
            <div 
              className="flex items-start gap-3 md:gap-4 text-slate-500 italic max-w-sm"
              role="note"
              aria-label="Information importante"
            >
              <ShieldAlert size={20} className="w-5 h-5 md:w-6 md:h-6 text-amber-400/50 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[7px] md:text-[8px] leading-relaxed font-bold uppercase tracking-widest">
                L&apos;exécution de ce protocole crée une instance souveraine avec un plan <span className="text-white">ENTREPRISE</span> actif pour 24 mois.
              </p>
            </div>

            <button 
              type="submit"
              disabled={isDeploying}
              className={cn(
                "w-full md:w-auto px-8 md:px-10 lg:px-12 py-4 md:py-5 lg:py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl md:rounded-2xl lg:rounded-3xl font-black uppercase text-[9px] md:text-[10px] lg:text-xs italic tracking-widest flex items-center justify-center gap-2 md:gap-3 lg:gap-4 transition-all shadow-2xl shadow-blue-900/40 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400",
                isDeploying && "cursor-wait"
              )}
              aria-busy={isDeploying}
              aria-label="Exécuter le protocole Big Bang"
            >
              {isDeploying ? (
                <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">DÉPLOIEMENT...</span><span className="sm:hidden">En cours...</span></>
              ) : (
                <><Zap size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" fill="currentColor" aria-hidden="true" /> <span className="hidden sm:inline">EXÉCUTER LE BIG BANG</span><span className="sm:hidden">Déployer</span></>
              )}
            </button>
          </div>
        </form>
      </article>
    </div>
  );
}