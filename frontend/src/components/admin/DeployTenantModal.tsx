/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🛰️ MODULE : DeployTenantModal (Matrix Kernel)
 * RÔLE : Initialisation de Tenant (Provisioning Kernel Matrix)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { 
  X, Building2, Mail, Lock, ShieldCheck, Activity, Zap, Loader2, Globe, AlertCircle, User, Phone, MapPin
} from "lucide-react";
import { matrixApi } from "@/services/matrix.service";
import { toast } from 'sonner';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export interface DeployFormData {
  companyName: string;
  customSlug: string;
  ceoName: string;
  email: string;
  adminFirstName: string;
  adminLastName: string;
  adminPassword: string;
  phone: string;
  address: string;
}

export interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface FormErrors {
  companyName?: string;
  customSlug?: string;
  ceoName?: string;
  email?: string;
  adminFirstName?: string;
  adminLastName?: string;
  adminPassword?: string;
  phone?: string;
  address?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_FORM: DeployFormData = {
  companyName: "",
  customSlug: "",
  ceoName: "",
  email: "",
  adminFirstName: "",
  adminLastName: "",
  adminPassword: "",
  phone: "",
  address: ""
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
  icon: React.ElementType;
  required?: boolean;
  error?: string;
  className?: string;
}

function FormInput({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "text", 
  icon: Icon, 
  required, 
  error,
  className 
}: FormInputProps) {
  return (
    <div className={cn("space-y-1.5 md:space-y-2", className)} role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[9px] md:text-[10px] font-black uppercase tracking-widest ml-2 md:ml-4 block",
          error ? "text-red-400" : "text-slate-500"
        )}
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <Icon 
          className={cn(
            "absolute left-3 md:left-4 lg:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 transition-colors",
            error ? "text-red-400" : "text-slate-500"
          )} 
          aria-hidden="true" 
        />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          required={required}
          className={cn(
            "w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 lg:py-5 lg:py-6 pl-8 md:pl-10 lg:pl-12 pr-4 text-[10px] md:text-sm font-black text-white outline-none focus:border-blue-500 transition-all uppercase italic",
            error && "border-red-500/50 focus:border-red-500"
          )}
          aria-required={required}
          aria-invalid={!!error}
        />
      </div>
      {error && (
        <p className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function DeployTenantModal({ isOpen, onClose, onSuccess }: DeployModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<DeployFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const generateSlug = useCallback((name: string): string => {
    return name.toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 15);
  }, []);

  useEffect(() => {
    if (form.companyName && !form.customSlug) {
      setForm(prev => ({ ...prev, customSlug: generateSlug(prev.companyName) }));
    }
  }, [form.companyName, form.customSlug, generateSlug]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!form.companyName.trim()) {
      errors.companyName = "La raison sociale est obligatoire";
    }
    
    if (!form.customSlug.trim()) {
      errors.customSlug = "Le slug DNS est obligatoire";
    } else if (!/^[a-z0-9-]+$/.test(form.customSlug)) {
      errors.customSlug = "Le slug doit contenir uniquement lettres minuscules, chiffres et tirets";
    }
    
    if (!form.adminFirstName.trim()) {
      errors.adminFirstName = "Le prénom est obligatoire";
    }
    
    if (!form.adminLastName.trim()) {
      errors.adminLastName = "Le nom est obligatoire";
    }
    
    if (!form.email.trim()) {
      errors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Email invalide";
    }
    
    if (!form.adminPassword) {
      errors.adminPassword = "Le mot de passe est obligatoire";
    } else if (form.adminPassword.length < 8) {
      errors.adminPassword = "Le mot de passe doit comporter au moins 8 caractères";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("SÉCURITÉ : Veuillez compléter tous les champs requis");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Initialisation du Nœud Multi-Tenant...");

    try {
      await matrixApi.initialize({
        ...form,
        companyName: form.companyName.toUpperCase(),
        ceoName: form.ceoName.toUpperCase(),
        adminFirstName: form.adminFirstName.toUpperCase(),
        adminLastName: form.adminLastName.toUpperCase(),
        email: form.email.toLowerCase()
      });
      toast.success("NŒUD DÉPLOYÉ : Instance opérationnelle.", { id: toastId });
      onSuccess();
      onClose();
      setForm(DEFAULT_FORM);
      setFormErrors({});
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error("ÉCHEC KERNEL : " + (apiError?.response?.data?.message || apiError?.message || "Erreur de provisioning"), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const updateForm = (field: keyof DeployFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-[#0B0F1A]/90 backdrop-blur-md animate-in fade-in duration-500 italic"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      <article className="bg-[#0F172A] w-full max-w-3xl md:max-w-4xl lg:max-w-5xl border border-white/10 rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left">
        
        <header className="p-4 md:p-6 lg:p-8 xl:p-10 border-b border-white/5 flex justify-between items-center bg-white/2 relative shrink-0">
          <div className="absolute top-0 left-4 md:left-6 lg:left-10 w-16 md:w-20 lg:w-32 h-1 bg-blue-600 shadow-[0_0_15px_#2563eb]" aria-hidden="true" />
          <div>
            <h2 id="modal-title" className="text-xl md:text-2xl lg:text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2 md:gap-3 lg:gap-4 m-0">
              <ShieldCheck size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-blue-400" aria-hidden="true" /> 
              Initialisation Nœud
            </h2>
            <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 md:mt-2 lg:mt-3 m-0">
              Provisioning d&apos;Infrastructure Qualisoft Elite
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 md:p-3 lg:p-4 bg-white/5 rounded-lg md:rounded-xl lg:rounded-2xl text-slate-500 hover:text-white hover:bg-red-500/20 transition-all border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Fermer"
          >
            <X size={20} className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" aria-hidden="true" />
          </button>
        </header>

        <div className="overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 flex-1">
          <form id="deployForm" onSubmit={handleSubmit} className="space-y-6 md:space-y-8 lg:space-y-10 lg:space-y-12" noValidate>
            
            {/* SECTION 1: CONTEXTE (§4 ISO) */}
            <section className="space-y-4 md:space-y-5 lg:space-y-6" aria-labelledby="section1-title">
              <div className="flex items-center gap-2 md:gap-3">
                <Activity size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-blue-400" aria-hidden="true" />
                <h3 id="section1-title" className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-widest m-0">
                  01. Contexte de l&apos;Organisation
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                <FormInput 
                  id="companyName"
                  label="Raison Sociale"
                  value={form.companyName}
                  onChange={(v) => updateForm('companyName', v)}
                  placeholder="NOM DE L'ENTREPRISE"
                  icon={Building2}
                  required
                  error={formErrors.companyName}
                />
                <div className="space-y-1.5 md:space-y-2">
                  <label 
                    htmlFor="customSlug"
                    className={cn(
                      "text-[9px] md:text-[10px] font-black uppercase tracking-widest ml-2 md:ml-4 block",
                      formErrors.customSlug ? "text-red-400" : "text-amber-500"
                    )}
                  >
                    DNS Slug <span className="opacity-40 font-normal">{form.customSlug}.qualisoft.sn</span> <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Globe className={cn(
                      "absolute left-3 md:left-4 lg:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 transition-colors",
                      formErrors.customSlug ? "text-red-400" : "text-amber-500"
                    )} aria-hidden="true" />
                    <input
                      id="customSlug"
                      required
                      className={cn(
                        "w-full bg-black/40 border border-amber-900/20 rounded-xl md:rounded-2xl py-3 md:py-4 lg:py-5 lg:py-6 pl-8 md:pl-10 lg:pl-12 pr-4 text-[10px] md:text-sm font-black text-amber-400 outline-none focus:border-amber-500 transition-all lowercase italic",
                        formErrors.customSlug && "border-red-500/50 focus:border-red-500"
                      )}
                      value={form.customSlug}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('customSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      aria-required="true"
                      aria-invalid={!!formErrors.customSlug}
                    />
                  </div>
                  {formErrors.customSlug && (
                    <p className="text-red-400 text-[7px] md:text-[8px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                      <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.customSlug}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 2: LEADERSHIP (§5 ISO) */}
            <section className="space-y-4 md:space-y-5 lg:space-y-6 pt-6 md:pt-8 lg:pt-10 border-t border-white/5" aria-labelledby="section2-title">
              <div className="flex items-center gap-2 md:gap-3">
                <Zap size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 text-emerald-400" aria-hidden="true" />
                <h3 id="section2-title" className="text-[10px] md:text-[11px] font-black text-emerald-400 uppercase tracking-widest m-0">
                  02. Habilitation Admin Pilote
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                <FormInput 
                  id="adminFirstName"
                  label="Prénom Admin"
                  value={form.adminFirstName}
                  onChange={(v) => updateForm('adminFirstName', v)}
                  placeholder="PRÉNOM"
                  icon={User}
                  required
                  error={formErrors.adminFirstName}
                />
                <FormInput 
                  id="adminLastName"
                  label="Nom Admin"
                  value={form.adminLastName}
                  onChange={(v) => updateForm('adminLastName', v)}
                  placeholder="NOM"
                  icon={User}
                  required
                  error={formErrors.adminLastName}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                <FormInput 
                  id="email"
                  label="Email Master"
                  value={form.email}
                  onChange={(v) => updateForm('email', v)}
                  placeholder="EMAIL@CLIENT.SN"
                  type="email"
                  icon={Mail}
                  required
                  error={formErrors.email}
                />
                <FormInput 
                  id="adminPassword"
                  label="Clé d'Accès Master"
                  value={form.adminPassword}
                  onChange={(v) => updateForm('adminPassword', v)}
                  placeholder="••••••••"
                  type="password"
                  icon={Lock}
                  required
                  error={formErrors.adminPassword}
                  className="md:col-span-2"
                />
              </div>
            </section>
          </form>
        </div>

        <footer className="p-4 md:p-6 lg:p-8 xl:p-10 lg:p-10 border-t border-white/5 bg-white/2 flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6 shrink-0">
          <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest italic mr-auto">
            Audit Log : Initialisation Super-Admin
          </p>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <button 
              type="button"
              onClick={onClose} 
              className="flex-1 sm:flex-none px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 text-[9px] md:text-[10px] font-black uppercase text-slate-500 hover:text-white bg-transparent border-none cursor-pointer italic tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
            >
              Révoquer
            </button>
            <button 
              type="submit"
              form="deployForm"
              disabled={loading}
              className={cn(
                "flex-1 sm:flex-none px-4 md:px-6 lg:px-8 xl:px-12 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase text-white bg-blue-600 hover:bg-white hover:text-blue-700 shadow-xl transition-all flex items-center justify-center gap-2 md:gap-3 lg:gap-4 border-none cursor-pointer italic tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400",
                loading && "opacity-50 cursor-not-allowed"
              )}
              aria-busy={loading}
              aria-label="Lancer l'initialisation du tenant"
            >
              {loading ? (
                <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">INITIALISATION...</span><span className="sm:hidden">En cours...</span></>
              ) : (
                <><ShieldCheck size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden sm:inline">LANCER L'INITIALISATION</span><span className="sm:hidden">Initialiser</span></>
              )}
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
}