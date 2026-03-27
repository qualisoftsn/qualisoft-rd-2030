/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🚀 MODULE : Onboarding - Initialisation du Tenant Organisationnel
 * RÔLE : Sas de qualification pour le déploiement multi-tenant souverain
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { 
  Activity, Building2, CheckCircle2, ChevronRight, Globe, 
  Lock, Mail, ShieldCheck, User, Zap, AlertCircle, ArrowRight
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useOnboarding } from "@/hooks/useOnboarding";
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Strict typing)
// ============================================================================

export type OnboardingStep = 1 | 2 | 3;
export type SectorType = 'SERVICES' | 'LOGISTICS' | 'HEALTH' | 'CONSTRUCTION';

export interface OnboardingFormData {
  email: string;
  password: string;
  firstName: string;
  companyName: string;
  sector: SectorType;
}

export interface FormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  companyName?: string;
  sector?: string;
}

export interface FieldWrapperProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  error?: string;
  id: string;
}

export interface StepConfig {
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const SECTOR_OPTIONS: Array<{ value: SectorType; label: string }> = [
  { value: 'SERVICES', label: 'Services / Conseil' },
  { value: 'LOGISTICS', label: 'Logistique & Transport' },
  { value: 'HEALTH', label: 'Santé / Pharma' },
  { value: 'CONSTRUCTION', label: 'BTP / Industrie' }
];

const STEPS: Record<OnboardingStep, StepConfig> = {
  1: { title: "Habilitation", subtitle: "Identification du gestionnaire SMI", icon: Activity },
  2: { title: "Organisation", subtitle: "Détermination de l'entité (§4.3)", icon: Building2 },
  3: { title: "Activation", subtitle: "Déploiement de l'instance", icon: ShieldCheck }
};

const DEFAULT_FORM: OnboardingFormData = {
  email: "",
  password: "",
  firstName: "",
  companyName: "",
  sector: "SERVICES"
};

// ============================================================================
// SOUS-COMPOSANT : FIELD WRAPPER
// ============================================================================

function FieldWrapper({ icon: Icon, label, children, error, id }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5 md:space-y-2 group" role="group" aria-labelledby={`${id}-label`}>
      <label 
        id={`${id}-label`}
        htmlFor={id}
        className={cn(
          "text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2 md:ml-4 italic group-focus-within:text-blue-600 transition-colors block",
          error && "text-red-400"
        )}
      >
        {label} {error && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <Icon 
          className={cn(
            "absolute left-3 md:left-4 lg:left-5 top-1/2 -translate-y-1/2 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 transition-colors",
            error ? "text-red-400" : "text-slate-400 group-focus-within:text-blue-600"
          )} 
          aria-hidden="true" 
        />
        {children}
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

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>(1);
  const { completeOnboarding } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateStep1 = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = "Le nom est obligatoire";
    }
    
    if (!formData.email.trim()) {
      errors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email invalide";
    }
    
    if (!formData.password) {
      errors.password = "Le mot de passe est obligatoire";
    } else if (formData.password.length < 8) {
      errors.password = "Le mot de passe doit comporter au moins 8 caractères";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.companyName.trim()) {
      errors.companyName = "Le nom de l'organisation est requis";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) {
        toast.error("HABILITATION INCOMPLÈTE : Veuillez remplir tous les champs.");
        return;
      }
    }
    if (step === 2) {
      if (!validateStep2()) {
        toast.error("STRUCTURE : Le nom de l'organisation est requis.");
        return;
      }
    }
    setStep((s) => (s < 3 ? (s + 1 as OnboardingStep) : s));
  };

  const handleBack = () => {
    setStep((s) => (s > 1 ? (s - 1 as OnboardingStep) : s));
  };

  const handleSubmit = async () => {
    if (!validateStep2()) {
      toast.error("Veuillez compléter tous les champs requis");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Déploiement de l'environnement Elite...");
    
    try {
      await completeOnboarding(formData);
      toast.success("ENVIRONNEMENT ELITE DÉPLOYÉ AVEC SUCCÈS.", { id: toastId });
    } catch (error: unknown) {
      const apiError = error as { message?: string };
      toast.error(apiError?.message || "ERREUR CRITIQUE : Échec du déploiement de l'instance.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && step < 3) {
      e.preventDefault();
      handleNext();
    }
  };

  const progress = (step / 3) * 100;
  const StepIcon = STEPS[step].icon;

  return (
    <div 
      className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4 md:p-6 italic font-sans selection:bg-blue-600/30 overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <Toaster position="top-right" richColors theme="dark" closeButton />
      
      {/* 🌌 ATMOSPHÈRE SDE */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-blue-600/5 rounded-full blur-[100px] md:blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] md:w-[500px] md:h-[500px] bg-blue-500/5 rounded-full blur-[80px] md:blur-[100px]" />
      </div>

      <article 
        className="bg-white max-w-md w-full rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl p-6 md:p-8 lg:p-10 xl:p-12 lg:p-14 relative z-10 animate-in fade-in zoom-in duration-700"
        role="main"
        aria-label="Formulaire d'onboarding"
      >
        
        {/* 🧭 PROGRESS TRACKER */}
        <div className="mb-8 md:mb-10 lg:mb-12" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3} aria-label={`Étape ${step} sur 3`}>
          <div className="flex justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 md:mb-4 lg:mb-5 leading-none">
            <span className="flex items-center gap-1.5 md:gap-2">
              <StepIcon size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-600" aria-hidden="true" /> 
              Phase {step} / 3
            </span>
            <span className="text-slate-900">{STEPS[step].title}</span>
          </div>
          <div className="h-1.5 md:h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-blue-600 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.5)]"
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* 👤 STEP 1 : IDENTITÉ PILOTE */}
        {step === 1 && (
          <div className="space-y-4 md:space-y-5 lg:space-y-6 lg:space-y-8 animate-in slide-in-from-right-8 duration-500 text-left" role="form" aria-labelledby="step1-title">
            <div className="space-y-2 md:space-y-3">
              <h2 id="step1-title" className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none m-0">
                Profil <span className="text-blue-600">Pilote</span>
              </h2>
              <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest m-0 italic">
                {STEPS[1].subtitle}
              </p>
            </div>

            <div className="space-y-3 md:space-y-4 lg:space-y-5">
              <FieldWrapper 
                icon={User} 
                label="Nom & Prénom" 
                id="firstName"
                error={formErrors.firstName}
              >
                <input
                  id="firstName"
                  type="text"
                  placeholder="EX: MAME DIARRA"
                  className={cn(
                    "w-full bg-slate-50 border-none p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner pl-8 md:pl-10 lg:pl-12",
                    formErrors.firstName && "ring-2 ring-red-500"
                  )}
                  value={formData.firstName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('firstName', e.target.value.toUpperCase())}
                  aria-required="true"
                  aria-invalid={!!formErrors.firstName}
                />
              </FieldWrapper>
              <FieldWrapper 
                icon={Mail} 
                label="Email Master" 
                id="email"
                error={formErrors.email}
              >
                <input
                  id="email"
                  type="email"
                  placeholder="contact@organisation.sn"
                  className={cn(
                    "w-full bg-slate-50 border-none p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner pl-8 md:pl-10 lg:pl-12",
                    formErrors.email && "ring-2 ring-red-500"
                  )}
                  value={formData.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('email', e.target.value)}
                  aria-required="true"
                  aria-invalid={!!formErrors.email}
                />
              </FieldWrapper>
              <FieldWrapper 
                icon={Lock} 
                label="Mot de passe" 
                id="password"
                error={formErrors.password}
              >
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    "w-full bg-slate-50 border-none p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner pl-8 md:pl-10 lg:pl-12",
                    formErrors.password && "ring-2 ring-red-500"
                  )}
                  value={formData.password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('password', e.target.value)}
                  aria-required="true"
                  aria-invalid={!!formErrors.password}
                />
              </FieldWrapper>
            </div>

            <button 
              type="button"
              onClick={handleNext} 
              className="w-full bg-slate-900 hover:bg-blue-600 text-white py-3 md:py-4 lg:py-5 lg:py-6 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-1.5 md:gap-2 lg:gap-3 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Continuer vers l'organisation"
            >
              Continuer <ChevronRight size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* 🏢 STEP 2 : PÉRIMÈTRE SMI */}
        {step === 2 && (
          <div className="space-y-4 md:space-y-5 lg:space-y-6 lg:space-y-8 animate-in slide-in-from-right-8 duration-500 text-left" role="form" aria-labelledby="step2-title">
            <div className="space-y-2 md:space-y-3">
              <h2 id="step2-title" className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none m-0">
                Périmètre <span className="text-blue-600">SMI</span>
              </h2>
              <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest m-0 italic">
                {STEPS[2].subtitle}
              </p>
            </div>

            <div className="space-y-3 md:space-y-4 lg:space-y-5">
              <FieldWrapper 
                icon={Building2} 
                label="Raison Sociale" 
                id="companyName"
                error={formErrors.companyName}
              >
                <input
                  id="companyName"
                  type="text"
                  placeholder="NOM DE L'ENTITÉ"
                  className={cn(
                    "w-full bg-slate-50 border-none p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner pl-8 md:pl-10 lg:pl-12",
                    formErrors.companyName && "ring-2 ring-red-500"
                  )}
                  value={formData.companyName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateForm('companyName', e.target.value.toUpperCase())}
                  aria-required="true"
                  aria-invalid={!!formErrors.companyName}
                />
              </FieldWrapper>
              <FieldWrapper 
                icon={Globe} 
                label="Secteur d'activité" 
                id="sector"
                error={formErrors.sector}
              >
                <div className="relative">
                  <select
                    id="sector"
                    className="w-full bg-slate-50 border-none p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase italic outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner appearance-none cursor-pointer pl-8 md:pl-10 lg:pl-12 pr-8 md:pr-10"
                    value={formData.sector}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => updateForm('sector', e.target.value as SectorType)}
                    aria-required="true"
                  >
                    {SECTOR_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-white text-slate-900">{opt.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 md:right-4 lg:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" aria-hidden="true">
                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </FieldWrapper>
            </div>

            <div className="flex gap-2 md:gap-3">
              <button 
                type="button"
                onClick={handleBack} 
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-600 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all border border-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
                aria-label="Retour à l'étape précédente"
              >
                Retour
              </button>
              <button 
                type="button"
                onClick={handleNext} 
                className="flex-1 bg-slate-900 hover:bg-blue-600 text-white py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all shadow-xl active:scale-95 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Passer au déploiement final"
              >
                Suivant <ArrowRight size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 inline" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* 💎 STEP 3 : ACTIVATION ELITE */}
        {step === 3 && (
          <div className="space-y-6 md:space-y-8 lg:space-y-10 text-center animate-in zoom-in duration-700" role="form" aria-labelledby="step3-title">
            <div className="flex justify-center">
              <div className="bg-blue-600/10 p-6 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl lg:rounded-[3.5rem] text-blue-600 shadow-inner border border-blue-500/10">
                <ShieldCheck size={48} className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" strokeWidth={1.5} className="animate-pulse" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <h2 id="step3-title" className="text-2xl md:text-3xl lg:text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none m-0">
                Activation <span className="text-blue-600">Elite</span>
              </h2>
              <p className="text-[10px] md:text-[11px] lg:text-[12px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed m-0 italic px-2 md:px-4">
                Instanciation de votre environnement multi-tenant sécurisé. <br/>
                Validation des référentiels de base.
              </p>
            </div>

            <div className="bg-slate-50 p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] border border-dashed border-slate-200 space-y-3 md:space-y-4" role="status">
              <div className="flex items-center gap-3 md:gap-4 text-[8px] md:text-[9px] font-black text-slate-400 uppercase italic tracking-widest">
                <Zap size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" aria-hidden="true" /> 
                Instance : Cloud Sovereign Active
              </div>
              <div className="flex items-center gap-3 md:gap-4 text-[8px] md:text-[9px] font-black text-slate-400 uppercase italic tracking-widest">
                <CheckCircle2 size={14} className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" aria-hidden="true" /> 
                Chiffrement : Protocole AES-256
              </div>
            </div>

            <div className="flex gap-2 md:gap-3">
              <button 
                type="button"
                onClick={handleBack} 
                disabled={loading}
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-600 py-3 md:py-4 lg:py-5 lg:py-7 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all border border-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
                aria-label="Retour à l'étape précédente"
                aria-disabled={loading}
              >
                Retour
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={cn(
                  "flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 md:py-4 lg:py-5 lg:py-7 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2 md:gap-3 lg:gap-4 border-none cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400",
                  loading && "opacity-50 cursor-not-allowed active:scale-100"
                )}
                aria-busy={loading}
                aria-label="Activer l'instance souveraine"
              >
                {loading ? (
                  <><Activity size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">Déploiement...</span><span className="sm:hidden">En cours...</span></>
                ) : (
                  <><ShieldCheck size={16} className="w-4 h-4 md:w-4.5 md:h-4.5" aria-hidden="true" /> <span className="hidden sm:inline">ACTIVER INSTANCE</span><span className="sm:hidden">Activer</span></>
                )}
              </button>
            </div>
          </div>
        )}
      </article>

      {/* 🔐 SDE SECURITY FOOTER */}
      <footer className="absolute bottom-4 md:bottom-6 lg:bottom-8 xl:bottom-10 text-center space-y-1 md:space-y-1.5 opacity-30" role="contentinfo">
        <p className="text-[8px] md:text-[9px] font-black text-white uppercase italic tracking-widest m-0">
          Qualisoft Sovereign Architecture • Multi-Tenant Engine v4.0
        </p>
        <p className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase italic tracking-widest m-0">
          Conforme aux protocoles de sécurité Cloud RD 2026
        </p>
      </footer>
    </div>
  );
}