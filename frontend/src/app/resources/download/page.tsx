/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 📥 MODULE : Resource Download - Terminal d'accès aux ressources stratégiques
 * RÔLE : Conversion prospect vers lead qualifié ISO 9001
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import Link from "next/link";
import apiClient, { type ApiError } from "@/core/api/api-client";
import { 
  ArrowLeft, Building2, CheckCircle2, FileDown, Fingerprint, 
  Globe, Loader2, Mail, ShieldCheck, Sparkles, User, AlertCircle, Download
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export type IndustryType = 'INDUSTRIE' | 'SERVICES' | 'SANTE' | 'BTP' | 'AUTRE';

export interface ResourceFormData {
  fullname: string;
  email: string;
  company: string;
  industry: IndustryType;
}

export interface FormErrors {
  fullname?: string;
  email?: string;
  company?: string;
  industry?: string;
}

export interface InputProps {
  icon: React.ElementType;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  id: string;
  required?: boolean;
}

export interface IndustryOption {
  value: IndustryType;
  label: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const INDUSTRY_OPTIONS: IndustryOption[] = [
  { value: 'INDUSTRIE', label: 'Industrie' },
  { value: 'SERVICES', label: 'Services / Conseil' },
  { value: 'SANTE', label: 'Santé / Pharma' },
  { value: 'BTP', label: 'BTP / Construction' },
  { value: 'AUTRE', label: 'Autre' }
];

const DEFAULT_FORM: ResourceFormData = {
  fullname: "",
  email: "",
  company: "",
  industry: "INDUSTRIE"
};

// ============================================================================
// SOUS-COMPOSANT : INPUT
// ============================================================================

function Input({ icon: Icon, label, placeholder, value, onChange, type = "text", error, id, required }: InputProps) {
  return (
    <div className="space-y-1.5 md:space-y-2 group" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[8px] md:text-[9px] font-black uppercase text-slate-500 ml-2 md:ml-4 tracking-widest italic group-focus-within:text-blue-500 transition-colors block",
          error && "text-red-400"
        )}
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <Icon 
          className={cn(
            "absolute left-3 md:left-4 lg:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 transition-colors",
            error ? "text-red-400" : "text-slate-600 group-focus-within:text-blue-500"
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
            "w-full bg-black/40 border border-white/5 rounded-lg md:rounded-xl lg:rounded-2xl py-3 md:py-4 lg:py-5 lg:py-6 pl-8 md:pl-10 lg:pl-12 pr-4 text-[10px] md:text-sm font-bold text-white outline-none focus:border-blue-500 transition-all shadow-inner placeholder:opacity-30",
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

export default function ResourceDownloadPage() {
  const [loading, setLoading] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [formData, setFormData] = useState<ResourceFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.fullname.trim()) {
      errors.fullname = "Le nom complet est obligatoire";
    }
    
    if (!formData.email.trim()) {
      errors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email invalide";
    }
    
    if (!formData.company.trim()) {
      errors.company = "Le nom de l'organisation est obligatoire";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAccessRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading("Vérification des accréditations...");

    try {
      await apiClient.post("/public/resource-access", {
        ...formData,
        fullname: formData.fullname.toUpperCase(),
        company: formData.company.toUpperCase()
      });
      toast.success("ACCÈS AUTORISÉ : Ressource déverrouillée.", { id: toastId });
      setDownloadReady(true);
      setTimeout(triggerDownload, 1500);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.message || "ERREUR DE LIAISON : Accès refusé.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const triggerDownload = () => {
    if (typeof window !== 'undefined') {
      const link = document.createElement("a");
      link.href = "/assets/docs/Qualisoft_Elite_Sovereign_Guide.pdf";
      link.download = "Qualisoft_Elite_Guide_2026.pdf";
      link.click();
    }
  };

  const updateForm = (field: keyof ResourceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !downloadReady) {
      e.preventDefault();
      // Form submit will handle validation
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#0B0F1A] text-white font-sans italic selection:bg-blue-600/30 overflow-x-hidden text-left"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      <div className="absolute inset-0 opacity-10 pointer-events-none grayscale brightness-50" aria-hidden="true">
        <img src="/images/qs_fondecran.webp" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A] via-transparent to-[#0B0F1A]" />
      </div>

      <nav className="fixed top-0 w-full z-50 p-4 md:p-6 lg:p-8" role="navigation" aria-label="Navigation principale">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 md:gap-2 lg:gap-3 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all group no-underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
          aria-label="Retour au portail"
        >
          <ArrowLeft size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 group-hover:-translate-x-1 md:group-hover:-translate-x-2 transition-transform" aria-hidden="true" /> 
          <span className="hidden sm:inline">RETOUR PORTAIL</span>
          <span className="sm:hidden">RETOUR</span>
        </Link>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-24 md:pt-28 lg:pt-32 pb-12 md:pb-16 lg:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 xl:gap-20 items-center min-h-screen md:min-h-[90vh]" role="main">
        <div className="space-y-6 md:space-y-8 lg:space-y-10 animate-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 rounded-lg md:rounded-xl lg:rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest" role="status">
            <ShieldCheck size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> 
            Ressource Souveraine Certifiée
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl xl:text-8xl font-black uppercase tracking-tighter leading-[0.85] md:leading-[0.85] italic m-0">
            Guide <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-400">Stratégique</span> <br /> 
            ISO 2026.
          </h1>

          <p className="text-slate-400 text-base md:text-lg lg:text-xl font-bold leading-relaxed max-w-xl m-0 opacity-80">
            Découvrez comment le <span className="text-white">Noyau Matrix</span> révolutionne la conformité multi-tenant et sécurise vos actifs immatériels.
          </p>

          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6" role="list">
            <article className="p-4 md:p-5 lg:p-6 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl hover:border-blue-500/20 transition-all" role="listitem">
              <FileDown className="text-blue-400 mb-3 md:mb-4 w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
              <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase text-white tracking-widest m-0 leading-none">Format PDF Master</p>
            </article>
            <article className="p-4 md:p-5 lg:p-6 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl lg:rounded-3xl hover:border-blue-500/20 transition-all" role="listitem">
              <Fingerprint className="text-blue-400 mb-3 md:mb-4 w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" aria-hidden="true" />
              <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase text-white tracking-widest m-0 leading-none">Contenu Scellé SDE</p>
            </article>
          </div>
        </div>

        <div className="relative animate-in zoom-in duration-1000">
          <div className="absolute inset-0 bg-blue-600/5 blur-[80px] md:blur-[100px] lg:blur-[120px] rounded-full" aria-hidden="true" />
          <article 
            className="relative bg-[#0F172A]/80 border border-white/10 p-4 md:p-6 lg:p-8 xl:p-10 lg:p-12 lg:p-14 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] xl:rounded-[4.5rem] shadow-2xl backdrop-blur-md"
            role="form"
            aria-label="Formulaire d'accès aux ressources"
          >
            {!downloadReady ? (
              <form onSubmit={handleAccessRequest} className="space-y-4 md:space-y-5 lg:space-y-6 lg:space-y-8" noValidate>
                <div className="text-center mb-6 md:mb-8 lg:mb-10">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-white m-0">Identification Prospect</h2>
                  <div className="w-8 md:w-10 lg:w-12 h-1 bg-blue-600 mx-auto mt-3 md:mt-4 lg:mt-5 rounded-full" aria-hidden="true" />
                </div>

                <div className="space-y-3 md:space-y-4 lg:space-y-5 lg:space-y-6">
                  <Input 
                    icon={User} 
                    label="Responsable / Décideur" 
                    placeholder="NOM COMPLET" 
                    value={formData.fullname} 
                    onChange={(v) => updateForm('fullname', v)}
                    id="fullname"
                    required
                    error={formErrors.fullname}
                  />
                  <Input 
                    icon={Building2} 
                    label="Organisation" 
                    placeholder="RAISON SOCIALE" 
                    value={formData.company} 
                    onChange={(v) => updateForm('company', v)}
                    id="company"
                    required
                    error={formErrors.company}
                  />
                  <Input 
                    icon={Mail} 
                    label="Email Master" 
                    placeholder="ADRESSE PROFESSIONNELLE" 
                    type="email" 
                    value={formData.email} 
                    onChange={(v) => updateForm('email', v)}
                    id="email"
                    required
                    error={formErrors.email}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading} 
                  className={cn(
                    "w-full bg-blue-600 hover:bg-white hover:text-blue-700 py-3 md:py-4 lg:py-5 lg:py-7 rounded-xl md:rounded-2xl lg:rounded-3xl font-black uppercase text-[9px] md:text-[10px] lg:text-[11px] tracking-widest transition-all shadow-xl active:scale-95 border-none cursor-pointer flex items-center justify-center gap-2 md:gap-3 lg:gap-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-400",
                    loading && "opacity-50 cursor-not-allowed active:scale-100"
                  )}
                  aria-busy={loading}
                  aria-label="Déverrouiller l'accès au guide"
                >
                  {loading ? (
                    <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">VÉRIFICATION...</span><span className="sm:hidden">En cours...</span></>
                  ) : (
                    <><Sparkles size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden sm:inline">DÉVERROUILLER L'ACCÈS</span><span className="sm:hidden">Accès</span></>
                  )}
                </button>
              </form>
            ) : (
              <div className="py-12 md:py-16 lg:py-20 flex flex-col items-center space-y-4 md:space-y-6 lg:space-y-8 animate-in zoom-in duration-500" role="status" aria-live="polite">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-emerald-500/10 rounded-xl md:rounded-2xl lg:rounded-3xl flex items-center justify-center border border-emerald-500/20 shadow-2xl">
                  <CheckCircle2 size={32} className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-emerald-400" aria-hidden="true" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter m-0">Accès Accordé</h3>
                <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest italic animate-pulse m-0 text-center px-4">Le téléchargement démarre automatiquement...</p>
                <button 
                  type="button"
                  onClick={triggerDownload} 
                  className="mt-4 md:mt-6 lg:mt-10 px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 bg-white text-slate-900 rounded-lg md:rounded-xl lg:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all shadow-xl border-none cursor-pointer hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
                  aria-label="Relancer le téléchargement manuellement"
                >
                  <Download size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" /> 
                  <span className="hidden sm:inline">RELANCER MANUELLEMENT</span>
                  <span className="sm:hidden">Télécharger</span>
                </button>
              </div>
            )}
          </article>
        </div>
      </main>

      <footer className="py-6 md:py-8 lg:py-10 lg:py-12 px-4 md:px-6 text-center border-t border-white/5 opacity-30" role="contentinfo">
        <p className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest italic m-0">
          QUALISOFT ELITE RD 2026 • INFRASTRUCTURE SOUVERAINE
        </p>
      </footer>
    </div>
  );
}