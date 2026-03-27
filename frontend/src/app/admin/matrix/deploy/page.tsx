/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

/**
 * 🚀 MODULE : BIG BANG MATRIX (ELITE-SDE)
 * RÔLE : Provisioning atomique de nouveaux nœuds territoriaux (Tenants)
 * VERSION : 3.0 - Typing strict + Design Elite + Accessibilité
 */

import React, { useState, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Rocket, ShieldCheck, Globe, Building2, 
  Mail, Lock, Loader2, ChevronLeft, AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import apiClient, { type ApiError } from '@/core/api/api-client';
import { cn } from '@/core/utils/cn';

// ============================================================================
// TYPES (Prisma aligned)
// ============================================================================

export type PlanType = 'SILVER' | 'GOLD' | 'PLATINUM';

export interface DeployFormData {
  companyName: string;
  slug: string;
  adminEmail: string;
  plan: PlanType;
}

export interface MatrixInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  required?: boolean;
  icon?: React.ElementType;
}

export interface FormErrors {
  companyName?: string;
  slug?: string;
  adminEmail?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const PLAN_OPTIONS: Array<{ value: PlanType; label: string }> = [
  { value: 'SILVER', label: 'SDE SILVER (SMI)' },
  { value: 'GOLD', label: 'SDE GOLD (MULTI-ISO)' },
  { value: 'PLATINUM', label: 'SDE PLATINUM (ELITE)' }
];

const DEFAULT_FORM: DeployFormData = {
  companyName: '',
  slug: '',
  adminEmail: '',
  plan: 'GOLD'
};

// ============================================================================
// SOUS-COMPOSANT : MATRIX INPUT
// ============================================================================

function MatrixInput({ label, placeholder, value, onChange, type = "text", error, required, icon: Icon }: MatrixInputProps) {
  return (
    <div className="space-y-2 md:space-y-3">
      <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase ml-2 md:ml-4 tracking-widest italic block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
        )}
        <input 
          type={type} 
          required={required} 
          placeholder={placeholder}
          className={cn(
            "w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl py-3 md:py-4 lg:py-5 px-4 md:px-6 lg:px-8 text-[10px] md:text-xs font-black italic text-white uppercase outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 shadow-inner",
            Icon && "pl-10 md:pl-16",
            error && "border-red-500/50"
          )}
          value={value} 
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          aria-required={required}
          aria-invalid={!!error}
        />
      </div>
      {error && (
        <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
          <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function MatrixDeploy() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DeployFormData>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.companyName.trim()) {
      errors.companyName = "La désignation sociale est obligatoire";
    }
    
    if (!formData.slug.trim()) {
      errors.slug = "Le domaine matrix est obligatoire";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets";
    }
    
    if (!formData.adminEmail.trim()) {
      errors.adminEmail = "L'email admin est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      errors.adminEmail = "Email invalide";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProvisioning = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning("Veuillez compléter tous les champs requis");
      return;
    }
    
    setLoading(true);
    const toastId = toast.loading("Initialisation du Big Bang Matrix...");

    try {
      await apiClient.post('/admin/matrix/provision', {
        ...formData,
        companyName: formData.companyName.toUpperCase(),
        adminEmail: formData.adminEmail.toLowerCase()
      });
      toast.success("NŒUD ACTIVÉ : Synchronisation du cluster en cours.", { id: toastId });
      router.push('/admin/matrix');
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
      toast.error(apiError?.response?.data?.error || apiError?.response?.data?.message || "Échec du déploiement.", { id: toastId });
    } finally { 
      setLoading(false); 
    }
  };

  const updateForm = (field: keyof DeployFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSlugChange = (value: string) => {
    updateForm('slug', value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Escape') {
      router.back();
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 lg:p-8 md:p-12 gap-6 md:gap-8 lg:gap-10 font-sans italic text-white animate-in slide-in-from-right-4 duration-700">
      <Toaster position="top-right" richColors theme="dark" closeButton />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 shrink-0">
        <div className="space-y-2 md:space-y-3 lg:space-y-4 w-full md:w-auto">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[9px] font-black uppercase text-slate-500 hover:text-blue-400 transition-all bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
            aria-label="Retour au cluster"
          >
            <ChevronLeft size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4" aria-hidden="true" /> 
            <span className="hidden sm:inline">Retour Cluster</span>
          </button>
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl xl:text-7xl font-black uppercase tracking-tighter italic m-0">
            Big <span className="text-blue-400">Bang</span> Matrix
          </h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center overflow-y-auto custom-scrollbar pb-6 md:pb-8 lg:pb-10">
        <form 
          onSubmit={handleProvisioning} 
          onKeyDown={handleKeyDown}
          className="w-full max-w-2xl bg-white/5 border border-white/5 p-4 md:p-6 lg:p-8 xl:p-10 md:p-12 lg:p-14 xl:p-16 rounded-2xl md:rounded-3xl lg:rounded-[4rem] shadow-2xl space-y-6 md:space-y-8 lg:space-y-10 relative overflow-hidden"
          aria-labelledby="deploy-title"
        >
          <div className="absolute top-0 right-0 p-4 md:p-6 lg:p-8 xl:p-10 opacity-5 pointer-events-none" aria-hidden="true">
            <Rocket size={100} className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36" />
          </div>

          <div className="space-y-6 md:space-y-8 relative z-10">
            <h2 id="deploy-title" className="text-[10px] md:text-sm font-black uppercase tracking-widest text-blue-400 border-b border-blue-500/20 pb-3 md:pb-4 m-0">
              Identité du Nœud
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
              <MatrixInput 
                label="Désignation Sociale" 
                placeholder="EX: SDE SÉNÉGAL" 
                value={formData.companyName} 
                onChange={(v) => updateForm('companyName', v)}
                required
                error={formErrors.companyName}
                icon={Building2}
              />
              
              <div className="space-y-2 md:space-y-3">
                <label htmlFor="slug" className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase ml-2 md:ml-4 tracking-widest italic block">
                  Domaine Matrix (Slug) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" />
                  <input 
                    id="slug"
                    required 
                    placeholder="sde-sn"
                    className={cn(
                      "w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl py-3 md:py-4 lg:py-5 pl-10 md:pl-16 pr-16 md:pr-20 lg:pr-24 text-[10px] md:text-xs font-black italic text-white uppercase outline-none focus:border-blue-500 transition-all shadow-inner",
                      formErrors.slug && "border-red-500/50"
                    )}
                    value={formData.slug}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleSlugChange(e.target.value)}
                    aria-required="true"
                    aria-invalid={!!formErrors.slug}
                  />
                  <span className="absolute right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 text-[8px] md:text-[9px] font-black text-slate-600">.QUALISOFT.SN</span>
                </div>
                {formErrors.slug && (
                  <p className="text-red-400 text-[8px] md:text-[9px] ml-2 md:ml-4 flex items-center gap-1" role="alert">
                    <AlertCircle size={10} className="w-2.5 h-2.5" aria-hidden="true" /> {formErrors.slug}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
              <MatrixInput 
                label="Email Admin Racine" 
                placeholder="ADMIN@CLIENT.COM" 
                type="email"
                value={formData.adminEmail} 
                onChange={(v) => updateForm('adminEmail', v)}
                required
                error={formErrors.adminEmail}
                icon={Mail}
              />
              <div className="space-y-2 md:space-y-3">
                <label htmlFor="plan" className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase ml-2 md:ml-4 tracking-widest italic block">
                  Plan de Licence
                </label>
                <div className="relative">
                  <select 
                    id="plan"
                    className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl py-3 md:py-4 lg:py-5 px-4 md:px-6 lg:px-8 text-[10px] md:text-xs font-black italic text-white uppercase outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer pr-10 md:pr-12"
                    value={formData.plan}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => updateForm('plan', e.target.value as PlanType)}
                  >
                    {PLAN_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-[#0B0F1A] text-white">{opt.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 md:right-6 bottom-3 md:bottom-4 lg:bottom-5 pointer-events-none text-slate-600" aria-hidden="true">
                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={cn(
              "w-full py-4 md:py-5 lg:py-6 lg:py-8 rounded-xl md:rounded-2xl lg:rounded-[2.5rem] bg-blue-600 text-white font-black uppercase text-[9px] md:text-[10px] lg:text-xs tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-xl active:scale-95 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center gap-2 md:gap-3",
              loading && "opacity-50 cursor-not-allowed active:scale-100"
            )}
            aria-busy={loading}
            aria-label="Lancer le déploiement du nœud"
          >
            {loading ? (
              <><Loader2 size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5 animate-spin" aria-hidden="true" /> <span className="hidden sm:inline">DÉPLOIEMENT EN COURS...</span></>
            ) : (
              <><Rocket size={16} className="w-4 h-4 md:w-4.5 md:h-4.5 lg:w-5 lg:h-5" aria-hidden="true" /> <span className="hidden sm:inline">LANCER LE DÉPLOIEMENT DU NŒUD</span></>
            )}
          </button>
        </form>
      </main>

      <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(59,130,246,0.3);border-radius:10px}:focus-visible{outline:2px solid #3b82f6;outline-offset:2px}`}</style>
    </div>
  );
}